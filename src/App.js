import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calculator, TrendingUp, FileText, Info, Wallet, Receipt, PiggyBank, Home as HomeIcon, Heart, Shield, Building2, Users, Briefcase, AlertTriangle, CreditCard, Banknote, Coins, Printer, LogIn, LogOut, User, Settings, Bell, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
import { Alert, AlertDescription } from './components/ui/alert';
import CITCalculator from './components/CITCalculator';
import BulkPayrollCalculator from './components/BulkPayrollCalculator';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TrialProvider, useTrial } from './contexts/TrialContext';
import { AdProvider, useAds } from './contexts/AdContext';
import { FeatureGateProvider, useFeatureGate } from './contexts/FeatureGateContext';
import { FeatureGate, BulkLimitGate } from './components/FeatureGate';
import { AuthModal } from './components/AuthModal';
import { TrialModal } from './components/TrialModal';
import { TrialExpiredModal } from './components/TrialExpiredModal';
import { TopBanner, BottomBanner } from './components/ads/AdBanner';
import { InterstitialAd } from './components/ads/InterstitialAd';
import { RewardedAd } from './components/ads/RewardedAd';
import { UserProfile } from './components/UserProfile';
import { PasswordResetForm } from './components/PasswordResetForm';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminSetup } from './components/admin/AdminSetup';
import TermsAndConditions from './components/TermsAndConditions';
import TaxInformation from './components/TaxInformation';
import EnhancedHistory from './components/EnhancedHistory';
import VATCalculator from './components/VATCalculator';
import PaymentProcessingCalculator from './components/PaymentProcessingCalculator';
import BulkPaymentCalculator from './components/BulkPaymentCalculator';
import AddOnManager from './components/AddOnManager';
import CGTCalculator from './components/CGTCalculator';
import Home from './components/Home';
import { generatePayeReport, generateBulkPayeReport, generateCitReport } from './utils/pdfGenerator';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function AppContent() {
  const { user, logout, isAuthenticated } = useAuth();
  const { trialStatus, showTrialModal, setShowTrialModal, showExpiredModal, setShowExpiredModal } = useTrial();
  const { showInterstitial, setShowInterstitial, showRewardedAd, setShowRewardedAd, rewardType, canShowAds } = useAds();
  const { hasFeature, getUserTier } = useFeatureGate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null); // 'verifying', 'success', 'error'
  const [verificationMessage, setVerificationMessage] = useState('');
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  
  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Check for admin setup route
  if (window.location.pathname === '/admin-setup') {
    return <AdminSetup />;
  }
  
  // Existing state variables
  const [taxInput, setTaxInput] = useState({
    // Staff Information
    staff_name: '',
    tin: '',
    month: '',
    year: '',
    state_of_residence: '',
    // Income Details
    basic_salary: '',
    transport_allowance: '',
    housing_allowance: '',
    meal_allowance: '',
    other_allowances: '',
    pension_contribution: '',
    nhf_contribution: '',
    life_insurance_premium: '',
    health_insurance_premium: '',
    nhis_contribution: '',
    annual_rent: ''
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [taxBrackets, setTaxBrackets] = useState(null);
  const [history, setHistory] = useState([]);

  // CIT Calculator state
  const [citInput, setCitInput] = useState({
    // Company Information
    company_name: '',
    tin: '',
    year_of_assessment: '',
    tax_year: '',
    // Financial Information
    annual_turnover: '',
    total_fixed_assets: '',
    gross_income: '',
    other_income: '',
    cost_of_goods_sold: '',
    staff_costs: '',
    rent_expenses: '',
    professional_fees: '',
    depreciation: '',
    interest_paid_unrelated: '',
    interest_paid_related: '',
    other_deductible_expenses: '',
    entertainment_expenses: '',
    fines_penalties: '',
    personal_expenses: '',
    excessive_interest: '',
    other_non_deductible: '',
    // Capital Allowances
    buildings_cost: '',
    furniture_fittings_cost: '',
    plant_machinery_cost: '',
    motor_vehicles_cost: '',
    other_assets_cost: '',
    buildings_wdv: '',
    furniture_fittings_wdv: '',
    plant_machinery_wdv: '',
    motor_vehicles_wdv: '',
    other_assets_wdv: '',
    // Loss Relief & WHT
    carry_forward_losses: '',
    wht_on_dividends: '',
    wht_on_interest: '',
    wht_on_rent: '',
    wht_on_technical_fees: '',
    other_wht_credits: '',
    // Company Classification
    total_borrowed_funds: '',
    total_equity: '',
    ebitda: '',
    is_professional_service: false,
    is_multinational: false,
    global_revenue_eur: ''
  });

  const [citResult, setCitResult] = useState(null);
  const [citLoading, setCitLoading] = useState(false);
  const [citInfo, setCitInfo] = useState(null);
  const [citHistory, setCitHistory] = useState([]);

  // PAYE Calculator Mode State
  const [payeMode, setPayeMode] = useState('single'); // 'single' or 'bulk'
  const [paymentMode, setPaymentMode] = useState('single'); // 'single' or 'bulk'
  
  // Terms and Conditions Modal State
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    fetchTaxBrackets();
    fetchHistory();
    fetchCitInfo();
    fetchCitHistory();
    
    // Check for reset token in URL
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get('reset_token');
    
    if (resetToken) {
      setShowPasswordReset(true);
    }

    // Check for email verification on page load
    const token = urlParams.get('token');
    const email = urlParams.get('email');
    
    if (token && email) {
      handleEmailVerification(token, email);
    }

    // Check for admin route
    const path = window.location.pathname;
    if (path === '/admin' || path.startsWith('/admin/')) {
      setShowAdminDashboard(true);
    }
    
    // Check for admin setup route
    if (path === '/admin-setup') {
      // Show setup page regardless of authentication
      return;
    }
  }, []);

  useEffect(() => {
    // Initialize super admin if needed
    if (user && user.email && !user.admin_role) {
      initializeSuperAdmin();
    }
  }, [user]);

  useEffect(() => {
    // Fetch notifications when user is authenticated
    if (isAuthenticated() && user) {
      fetchNotifications();
      
      // Set up periodic refresh of notifications (every 30 seconds)
      const interval = setInterval(() => {
        fetchNotifications();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    // Close notifications dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notification-bell-container')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const handleEmailVerification = async (token, email) => {
    setVerificationStatus('verifying');
    setVerificationMessage('Verifying your email address...');
    
    try {
      const response = await axios.post(`${API}/auth/verify-email`, null, {
        params: { token, email }
      });
      
      setVerificationStatus('success');
      setVerificationMessage('✅ Email verified successfully! You can now log in to your account.');
      
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Auto-open login modal after successful verification
      setTimeout(() => {
        setAuthModalOpen(true);
      }, 2000);
      
    } catch (error) {
      setVerificationStatus('error');
      setVerificationMessage(error.response?.data?.detail || 'Email verification failed. Please try again or contact support.');
    }
  };

  const initializeSuperAdmin = async () => {
    try {
      // Only check for the first user or specific email patterns
      if (user.email.includes('admin') || user.email.includes('owner')) {
        const response = await axios.post(`${API}/admin/users/${user.id}/role`, {
          admin_role: 'super_admin',
          admin_enabled: true
        }, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.status === 200) {
          console.log('Super admin privileges granted');
          // Refresh user data
          window.location.reload();
        }
      }
    } catch (error) {
      // Silently fail if not authorized or already setup
      console.log('Admin initialization skipped:', error.message);
    }
  };

  const fetchTaxBrackets = async () => {
    try {
      const response = await axios.get(`${API}/tax-brackets`);
      setTaxBrackets(response.data);
    } catch (error) {
      console.error('Error fetching tax brackets:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API}/calculations/history?limit=5`);
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const fetchCitInfo = async () => {
    try {
      const response = await axios.get(`${API}/cit-info`);
      setCitInfo(response.data);
    } catch (error) {
      console.error('Error fetching CIT info:', error);
    }
  };

  const fetchCitHistory = async () => {
    try {
      const response = await axios.get(`${API}/cit-calculations/history?limit=5`);
      setCitHistory(response.data);
    } catch (error) {
      console.error('Error fetching CIT history:', error);
    }
  };

  const handleInputChange = (field, value) => {
    console.log(`Input change: ${field} = ${value}`);
    setTaxInput(prev => {
      const newState = {
        ...prev,
        [field]: value
      };
      console.log('New taxInput state:', newState);
      return newState;
    });
  };

  // Notification functions
  const fetchNotifications = async () => {
    if (!isAuthenticated()) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setNotifications(response.data.notifications || []);
        setUnreadCount(response.data.unread_count || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    if (!isAuthenticated()) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API}/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!isAuthenticated()) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API}/notifications/mark-all-read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const calculateTax = async () => {
    console.log('calculateTax function called');
    console.log('taxInput:', taxInput);
    console.log('loading:', loading);
    console.log('basic_salary check:', !taxInput.basic_salary);
    
    setLoading(true);
    try {
      const numericInput = {};
      Object.keys(taxInput).forEach(key => {
        // Keep string fields as strings
        if (key === 'staff_name' || key === 'tin' || key === 'month' || key === 'year' || key === 'state_of_residence') {
          numericInput[key] = taxInput[key];
        } else {
          numericInput[key] = parseFloat(taxInput[key]) || 0;
        }
      });
      console.log('numericInput:', numericInput);

      const response = await axios.post(`${API}/calculate-paye`, numericInput);
      // Backend returns an array, we need the first object
      console.log('Backend response:', response.data);
      console.log('Setting result to:', response.data[0]);
      setResult(response.data[0]);
      fetchHistory(); // Refresh history
    } catch (error) {
      console.error('Error calculating tax:', error);
      alert('Error calculating tax. Please check your input values.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    // Handle null, undefined, or NaN values
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '₦0';
    }
    return '₦' + new Intl.NumberFormat('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const resetForm = () => {
    setTaxInput({
      // Staff Information
      staff_name: '',
      tin: '',
      month: '',
      year: '',
      state_of_residence: '',
      // Income Details
      basic_salary: '',
      transport_allowance: '',
      housing_allowance: '',
      meal_allowance: '',
      other_allowances: '',
      pension_contribution: '',
      nhf_contribution: '',
      life_insurance_premium: '',
      health_insurance_premium: '',
      nhis_contribution: '',
      annual_rent: ''
    });
    setResult(null);
  };

  // Function for bulk payroll calculator to use existing PAYE calculation
  const calculatePayeTax = async (taxInput) => {
    try {
      const response = await axios.post(`${API}/calculate-paye`, taxInput);
      // Backend returns an array, we need the first object
      return response.data[0];
    } catch (error) {
      console.error('Error calculating PAYE tax:', error);
      throw error;
    }
  };

  // CIT calculator functions
  const handleCitInputChange = (field, value) => {
    setCitInput(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateCitTax = async () => {
    setCitLoading(true);
    try {
      const numericInput = {};
      Object.keys(citInput).forEach(key => {
        if (key === 'company_name' || key === 'year_of_assessment' || key === 'tax_year') {
          numericInput[key] = citInput[key];
        } else if (key === 'is_professional_service' || key === 'is_multinational') {
          numericInput[key] = citInput[key];
        } else {
          numericInput[key] = parseFloat(citInput[key]) || 0;
        }
      });

      const response = await axios.post(`${API}/calculate-cit`, numericInput);
      setCitResult(response.data);
      fetchCitHistory(); // Refresh history
    } catch (error) {
      console.error('Error calculating CIT:', error);
      alert('Error calculating CIT. Please check your input values.');
    } finally {
      setCitLoading(false);
    }
  };

  const resetCitForm = () => {
    setCitInput({
      // Company Information
      company_name: '',
      year_of_assessment: '',
      tax_year: '',
      // Financial Information
      annual_turnover: '',
      total_fixed_assets: '',
      gross_income: '',
      other_income: '',
      cost_of_goods_sold: '',
      staff_costs: '',
      rent_expenses: '',
      professional_fees: '',
      depreciation: '',
      interest_paid_unrelated: '',
      interest_paid_related: '',
      other_deductible_expenses: '',
      entertainment_expenses: '',
      fines_penalties: '',
      personal_expenses: '',
      excessive_interest: '',
      other_non_deductible: '',
      // Capital Allowances
      buildings_cost: '',
      furniture_fittings_cost: '',
      plant_machinery_cost: '',
      motor_vehicles_cost: '',
      other_assets_cost: '',
      buildings_wdv: '',
      furniture_fittings_wdv: '',
      plant_machinery_wdv: '',
      motor_vehicles_wdv: '',
      other_assets_wdv: '',
      // Loss Relief & WHT
      carry_forward_losses: '',
      wht_on_dividends: '',
      wht_on_interest: '',
      wht_on_rent: '',
      wht_on_technical_fees: '',
      other_wht_credits: '',
      // Company Classification
      total_borrowed_funds: '',
      total_equity: '',
      ebitda: '',
      is_professional_service: false,
      is_multinational: false,
      global_revenue_eur: ''
    });
    setCitResult(null);
  };

  // Show admin dashboard if accessing admin routes and user has admin privileges
  if (showAdminDashboard && user?.admin_enabled && user?.admin_role) {
    return <AdminDashboard />;
  }

  // Show admin access denied if accessing admin routes without privileges
  if (showAdminDashboard && (!user?.admin_enabled || !user?.admin_role)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Admin Access Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-red-700">
              You need admin privileges to access the admin dashboard.
            </p>
            <Button
              onClick={() => {
                setShowAdminDashboard(false);
                window.history.pushState({}, '', '/');
              }}
              className="w-full"
            >
              Back to Main App
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Top Banner Ad */}
      {canShowAds() && (
        <TopBanner className="sticky top-0 z-40" />
      )}
      
      {/* Header */}
      <div className="relative overflow-hidden">
        {/* Background with black and gold gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-black to-gray-800"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 transform translate-x-32 -translate-y-32">
            <div className="w-full h-full border-4 border-yellow-400 opacity-15 transform rotate-45"></div>
          </div>
          <div className="absolute bottom-0 left-0 w-64 h-64 transform -translate-x-16 translate-y-16">
            <div className="w-full h-full border-2 border-yellow-500 opacity-10 transform rotate-12"></div>
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center space-x-6">
              {/* Logo Section */}
              <div className="relative w-20 h-20 flex items-center justify-center">
                <img 
                  src="https://customer-assets.emergentagent.com/job_taxpro-ng/artifacts/i2zrdiwl_Fiquant%20Consult%20-%20Transparent%202.png" 
                  alt="Fiquant Consult Logo" 
                  className="w-20 h-20 object-contain"
                />
              </div>
              
              {/* Brand Text */}
              <div className="text-white">
                <div className="flex items-baseline space-x-3">
                  <h1 className="text-4xl font-bold tracking-tight text-white">Fiquant</h1>
                  <span className="text-2xl font-light text-yellow-400">TaxPro</span>
                </div>
                <p className="text-gray-300 mt-1 font-medium tracking-wide">Nigerian Tax Calculator 2026</p>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="w-12 h-0.5 bg-gradient-to-r from-yellow-400 to-transparent"></div>
                  <span className="text-xs text-yellow-300 font-medium uppercase tracking-wider">Professional Edition</span>
                </div>
              </div>
            </div>
            
            {/* Authentication Section */}
            <div className="flex flex-col items-end space-y-3">
              {isAuthenticated() ? (
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-white font-medium">{user?.full_name}</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-yellow-400/10 text-yellow-300 border-yellow-400/30 backdrop-blur-sm text-xs">
                        {user?.account_tier?.toUpperCase()} Account
                      </Badge>
                      {user?.admin_enabled && user?.admin_role && (
                        <>
                          <span className="text-gray-400 text-xs">•</span>
                          <Badge variant="outline" className="bg-red-400/10 text-red-300 border-red-400/30 backdrop-blur-sm text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            {user?.admin_role?.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </>
                      )}
                      <span className="text-gray-400 text-xs">•</span>
                      <span className="text-gray-400 text-xs">{user?.account_type}</span>
                    </div>
                  </div>
                  
                  {/* Notification Bell */}
                  <div className="relative notification-bell-container">
                    <Button
                      onClick={() => setShowNotifications(!showNotifications)}
                      variant="outline"
                      size="sm"
                      className="border-yellow-400/50 text-yellow-300 hover:bg-yellow-400/10 backdrop-blur-sm"
                    >
                      <Bell className="h-4 w-4" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Button>
                    
                    {/* Notification Dropdown */}
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        <div className="p-4 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                            {unreadCount > 0 && (
                              <Button
                                onClick={markAllAsRead}
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                Mark all read
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                              No notifications yet
                            </div>
                          ) : (
                            notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                                  !notification.read ? 'bg-blue-50' : ''
                                }`}
                                onClick={() => markAsRead(notification.id)}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className={`w-2 h-2 rounded-full mt-2 ${
                                    !notification.read ? 'bg-blue-500' : 'bg-gray-300'
                                  }`}></div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">
                                      {notification.title}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {new Date(notification.created_at).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {user?.admin_enabled && user?.admin_role && (
                    <Button
                      onClick={() => {
                        setShowAdminDashboard(true);
                        window.history.pushState({}, '', '/admin');
                      }}
                      variant="outline"
                      size="sm"
                      className="border-red-600 text-red-300 hover:bg-red-800/50 backdrop-blur-sm"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                  )}
                  <Button
                    onClick={() => logout()}
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800/50 backdrop-blur-sm"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="bg-yellow-400/10 text-yellow-300 border-yellow-400/30 backdrop-blur-sm">
                    <span className="inline-flex items-center">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
                      2026 Tax Laws
                    </span>
                  </Badge>
                  <Button
                    onClick={() => setAuthModalOpen(true)}
                    variant="outline"
                    size="sm"
                    className="border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/10 backdrop-blur-sm"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </div>
              )}
              <div className="text-gray-400 text-xs font-medium">
                Powered by FIRS Guidelines
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Email Verification Status */}
        {verificationStatus && (
          <Alert className={`mb-6 ${
            verificationStatus === 'success' ? 'border-green-200 bg-green-50' : 
            verificationStatus === 'error' ? 'border-red-200 bg-red-50' : 
            'border-blue-200 bg-blue-50'
          }`}>
            <AlertDescription className={
              verificationStatus === 'success' ? 'text-green-700' : 
              verificationStatus === 'error' ? 'text-red-700' : 
              'text-blue-700'
            }>
              {verificationMessage}
            </AlertDescription>
            {verificationStatus !== 'verifying' && (
              <Button
                onClick={() => setVerificationStatus(null)}
                variant="ghost"
                size="sm"
                className="mt-2 h-6 px-2 text-xs"
              >
                Dismiss
              </Button>
            )}
          </Alert>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="relative">
            <TabsList className="grid w-full grid-cols-9 md:grid-cols-9 h-auto mobile-tabs overflow-x-auto bg-transparent rounded-none p-0">
              <div className="flex md:contents min-w-full md:min-w-0 gap-2">
              <TabsTrigger 
                value="home" 
                className="flex-1 md:flex-none bg-gray-50 px-6 py-4 text-gray-700 font-medium rounded-lg hover:bg-gray-100 data-[state=active]:bg-teal-500 data-[state=active]:text-white transition-all duration-200 flex flex-col items-center justify-center space-y-2 shadow-sm hover:shadow-md data-[state=active]:shadow-md"
                style={{
                  boxShadow: activeTab === 'home' ? '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)' : '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
                }}
              >
                <HomeIcon className="h-5 w-5" />
                <span className="text-xs font-semibold tracking-wide">HOME</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="calculator" 
                className="flex-1 md:flex-none bg-gray-50 px-6 py-4 text-gray-700 font-medium rounded-lg hover:bg-gray-100 data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-200 flex flex-col items-center justify-center space-y-2 shadow-sm hover:shadow-md data-[state=active]:shadow-md"
                style={{
                  boxShadow: activeTab === 'calculator' ? '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)' : '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
                }}
              >
                <Users className="h-5 w-5" />
                <span className="text-xs font-semibold tracking-wide">PAYE</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="cit" 
                className="flex-1 md:flex-none bg-gray-50 px-6 py-4 text-gray-700 font-medium rounded-lg hover:bg-gray-100 data-[state=active]:bg-teal-600 data-[state=active]:text-white transition-all duration-200 flex flex-col items-center justify-center space-y-2 shadow-sm hover:shadow-md data-[state=active]:shadow-md relative"
                style={{
                  boxShadow: activeTab === 'cit' ? '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)' : '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
                }}
              >
                <Building2 className="h-5 w-5" />
                <span className="text-xs font-semibold tracking-wide">CIT</span>
                {!hasFeature('cit_calc') && (
                  <Badge variant="outline" className="text-[10px] px-1 py-0 bg-blue-50 text-blue-600 border-blue-200">
                    PRO+
                  </Badge>
                )}
              </TabsTrigger>
              
              <TabsTrigger 
                value="vat" 
                className="flex-1 md:flex-none bg-gray-50 px-6 py-4 text-gray-700 font-medium rounded-lg hover:bg-gray-100 data-[state=active]:bg-gray-400 data-[state=active]:text-white transition-all duration-200 flex flex-col items-center justify-center space-y-2 shadow-sm hover:shadow-md data-[state=active]:shadow-md relative"
                style={{
                  boxShadow: activeTab === 'vat' ? '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)' : '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
                }}
              >
                <Receipt className="h-5 w-5" />
                <span className="text-xs font-semibold tracking-wide">VAT</span>
                {!hasFeature('vat_calc') && (
                  <Badge variant="outline" className="text-[10px] px-1 py-0 bg-blue-50 text-blue-600 border-blue-200">
                    PRO+
                  </Badge>
                )}
              </TabsTrigger>
              
              <TabsTrigger 
                value="cgt" 
                className="flex-1 md:flex-none bg-gray-50 px-6 py-4 text-gray-700 font-medium rounded-lg hover:bg-gray-100 data-[state=active]:bg-gray-400 data-[state=active]:text-white transition-all duration-200 flex flex-col items-center justify-center space-y-2 shadow-sm hover:shadow-md data-[state=active]:shadow-md relative"
                style={{
                  boxShadow: activeTab === 'cgt' ? '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)' : '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
                }}
              >
                <TrendingUp className="h-5 w-5" />
                <span className="text-xs font-semibold tracking-wide">CGT</span>
                {!hasFeature('cgt_calc') && (
                  <Badge variant="outline" className="text-[10px] px-1 py-0 bg-blue-50 text-blue-600 border-blue-200">
                    PRO+
                  </Badge>
                )}
              </TabsTrigger>
              
              <TabsTrigger 
                value="payment" 
                className="flex-1 md:flex-none bg-gray-50 px-6 py-4 text-gray-700 font-medium rounded-lg hover:bg-gray-100 data-[state=active]:bg-gray-400 data-[state=active]:text-white transition-all duration-200 flex flex-col items-center justify-center space-y-2 shadow-sm hover:shadow-md data-[state=active]:shadow-md relative"
                style={{
                  boxShadow: activeTab === 'payment' ? '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)' : '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
                }}
              >
                <CreditCard className="h-5 w-5" />
                <span className="text-xs font-semibold tracking-wide">PAYMENTS</span>
                {!hasFeature('cgt_calc') && (
                  <Badge variant="outline" className="text-[10px] px-1 py-0 bg-blue-50 text-blue-600 border-blue-200">
                    PRO+
                  </Badge>
                )}
              </TabsTrigger>
              
              <TabsTrigger 
                value="brackets" 
                className="flex-1 md:flex-none bg-gray-50 px-6 py-4 text-gray-700 font-medium rounded-lg hover:bg-gray-100 data-[state=active]:bg-gray-400 data-[state=active]:text-white transition-all duration-200 flex flex-col items-center justify-center space-y-2 shadow-sm hover:shadow-md data-[state=active]:shadow-md"
                style={{
                  boxShadow: activeTab === 'brackets' ? '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)' : '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
                }}
              >
                <Info className="h-5 w-5" />
                <span className="text-xs font-semibold tracking-wide">TAX INFO</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="history" 
                className="flex-1 md:flex-none bg-gray-50 px-6 py-4 text-gray-700 font-medium rounded-lg hover:bg-gray-100 data-[state=active]:bg-gray-400 data-[state=active]:text-white transition-all duration-200 flex flex-col items-center justify-center space-y-2 shadow-sm hover:shadow-md data-[state=active]:shadow-md relative"
                style={{
                  boxShadow: activeTab === 'history' ? '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)' : '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
                }}
              >
                <FileText className="h-5 w-5" />
                <span className="text-xs font-semibold tracking-wide">HISTORY</span>
                {!hasFeature('calculation_history') && (
                  <Badge variant="outline" className="text-[10px] px-1 py-0 bg-blue-50 text-blue-600 border-blue-200">
                    PRO+
                  </Badge>
                )}
              </TabsTrigger>
              
              <TabsTrigger 
                value="compliance" 
                className="flex-1 md:flex-none bg-gray-50 px-6 py-4 text-gray-700 font-medium rounded-lg hover:bg-gray-100 data-[state=active]:bg-gray-400 data-[state=active]:text-white transition-all duration-200 flex flex-col items-center justify-center space-y-2 shadow-sm hover:shadow-md data-[state=active]:shadow-md relative"
                style={{
                  boxShadow: activeTab === 'compliance' ? '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)' : '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
                }}
              >
                <Briefcase className="h-5 w-5" />
                <span className="text-xs font-semibold tracking-wide">COMPLIANCE</span>
                {!hasFeature('compliance_assistance') && (
                  <Badge variant="outline" className="text-[10px] px-1 py-0 bg-yellow-50 text-yellow-600 border-yellow-200">
                    PREMIUM+
                  </Badge>
                )}
              </TabsTrigger>
              {isAuthenticated() && (
                <TabsTrigger 
                  value="profile" 
                  className="flex-1 md:flex-none bg-gray-50 px-6 py-4 text-gray-700 font-medium rounded-lg hover:bg-gray-100 data-[state=active]:bg-gray-400 data-[state=active]:text-white transition-all duration-200 flex flex-col items-center justify-center space-y-2 shadow-sm hover:shadow-md data-[state=active]:shadow-md"
                  style={{
                    boxShadow: activeTab === 'profile' ? '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)' : '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
                  }}
                >
                  <User className="h-5 w-5" />
                  <span className="text-xs font-semibold tracking-wide">PROFILE</span>
                </TabsTrigger>
              )}
              {isAuthenticated() && (
                <TabsTrigger 
                  value="addons" 
                  className="flex-1 md:flex-none bg-gray-50 px-6 py-4 text-gray-700 font-medium rounded-lg hover:bg-gray-100 data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all duration-200 flex flex-col items-center justify-center space-y-2 shadow-sm hover:shadow-md data-[state=active]:shadow-md"
                  style={{
                    boxShadow: activeTab === 'addons' ? '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)' : '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
                  }}
                >
                  <CreditCard className="h-5 w-5" />
                  <span className="text-xs font-semibold tracking-wide">ADD-ONS</span>
                </TabsTrigger>
              )}
              </div>
            </TabsList>
          </div>

          {/* Home Tab */}
          <TabsContent value="home">
            <Home onNavigateToTab={(tabValue, options = {}) => {
              setActiveTab(tabValue);
              
              // Scroll to top when navigating
              setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }, 100);
              
              // Set PAYE mode if specified
              if (tabValue === 'calculator' && options.mode === 'bulk') {
                setPayeMode('bulk');
              } else if (tabValue === 'calculator') {
                setPayeMode('single'); // Default to single mode for regular PAYE
              }
            }} />
          </TabsContent>

          {/* PAYE Calculator Tab */}
          <TabsContent value="calculator" className="space-y-6">
            {/* PAYE Mode Selection */}
            <Card className="bg-white border-emerald-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-emerald-600" />
                  <span>PAYE Tax Calculator</span>
                </CardTitle>
                <CardDescription>
                  Choose between individual or bulk payroll tax calculation
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex space-x-4">
                  <Button
                    onClick={() => setPayeMode('single')}
                    variant={payeMode === 'single' ? 'default' : 'outline'}
                    className={`flex-1 h-20 flex flex-col items-center justify-center space-y-2 ${
                      payeMode === 'single' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''
                    }`}
                  >
                    <Users className="h-6 w-6" />
                    <div className="text-center">
                      <p className="font-medium">Single Employee</p>
                      <p className="text-xs opacity-75">Calculate tax for one person</p>
                    </div>
                  </Button>
                  <Button
                    onClick={() => setPayeMode('bulk')}
                    variant={payeMode === 'bulk' ? 'default' : 'outline'}
                    className={`flex-1 h-20 flex flex-col items-center justify-center space-y-2 ${
                      payeMode === 'bulk' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''
                    }`}
                  >
                    <Building2 className="h-6 w-6" />
                    <div className="text-center">
                      <p className="font-medium">Bulk Payroll</p>
                      <p className="text-xs opacity-75">Calculate for multiple employees</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Single Employee Calculator */}
            {payeMode === 'single' && (
              <div className="grid lg:grid-cols-2 gap-8">
              {/* Input Form */}
              <Card className="bg-white border-emerald-100 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <Wallet className="h-5 w-5" />
                    <span>Income Details</span>
                  </CardTitle>
                  <CardDescription className="text-emerald-100">
                    Enter your monthly income and allowances
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Staff Information Section */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <User className="h-4 w-4 mr-2 text-emerald-600" />
                      Taxpayer Information
                    </h3>
                    {/* Row 1: Name and TIN */}
                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label htmlFor="staff_name">Name of Staff/Taxpayer *</Label>
                        <Input
                          id="staff_name"
                          type="text"
                          placeholder="Full Name"
                          value={taxInput.staff_name}
                          onChange={(e) => handleInputChange('staff_name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tin">Tax Identification Number (TIN)</Label>
                        <Input
                          id="tin"
                          type="text"
                          placeholder="12345678901"
                          value={taxInput.tin}
                          onChange={(e) => handleInputChange('tin', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    {/* Row 2: Month and Year */}
                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label htmlFor="month">Month *</Label>
                        <select
                          id="month"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={taxInput.month}
                          onChange={(e) => handleInputChange('month', e.target.value)}
                        >
                          <option value="">Select Month</option>
                          <option value="January">January</option>
                          <option value="February">February</option>
                          <option value="March">March</option>
                          <option value="April">April</option>
                          <option value="May">May</option>
                          <option value="June">June</option>
                          <option value="July">July</option>
                          <option value="August">August</option>
                          <option value="September">September</option>
                          <option value="October">October</option>
                          <option value="November">November</option>
                          <option value="December">December</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="year">Year *</Label>
                        <select
                          id="year"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={taxInput.year}
                          onChange={(e) => handleInputChange('year', e.target.value)}
                        >
                          <option value="">Select Year</option>
                          <option value="2023">2023</option>
                          <option value="2024">2024</option>
                          <option value="2025">2025</option>
                          <option value="2026">2026</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Row 3: State of Residence */}
                    <div className="space-y-2">
                      <Label htmlFor="state_of_residence">State of Residence *</Label>
                      <select
                        id="state_of_residence"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={taxInput.state_of_residence}
                        onChange={(e) => handleInputChange('state_of_residence', e.target.value)}
                      >
                        <option value="">Select State</option>
                        <option value="Abia">Abia</option>
                        <option value="Adamawa">Adamawa</option>
                        <option value="Akwa Ibom">Akwa Ibom</option>
                        <option value="Anambra">Anambra</option>
                        <option value="Bauchi">Bauchi</option>
                        <option value="Bayelsa">Bayelsa</option>
                        <option value="Benue">Benue</option>
                        <option value="Borno">Borno</option>
                        <option value="Cross River">Cross River</option>
                        <option value="Delta">Delta</option>
                        <option value="Ebonyi">Ebonyi</option>
                        <option value="Edo">Edo</option>
                        <option value="Ekiti">Ekiti</option>
                        <option value="Enugu">Enugu</option>
                        <option value="FCT">Federal Capital Territory</option>
                        <option value="Gombe">Gombe</option>
                        <option value="Imo">Imo</option>
                        <option value="Jigawa">Jigawa</option>
                        <option value="Kaduna">Kaduna</option>
                        <option value="Kano">Kano</option>
                        <option value="Katsina">Katsina</option>
                        <option value="Kebbi">Kebbi</option>
                        <option value="Kogi">Kogi</option>
                        <option value="Kwara">Kwara</option>
                        <option value="Lagos">Lagos</option>
                        <option value="Nasarawa">Nasarawa</option>
                        <option value="Niger">Niger</option>
                        <option value="Ogun">Ogun</option>
                        <option value="Ondo">Ondo</option>
                        <option value="Osun">Osun</option>
                        <option value="Oyo">Oyo</option>
                        <option value="Plateau">Plateau</option>
                        <option value="Rivers">Rivers</option>
                        <option value="Sokoto">Sokoto</option>
                        <option value="Taraba">Taraba</option>
                        <option value="Yobe">Yobe</option>
                        <option value="Zamfara">Zamfara</option>
                      </select>
                    </div>
                  </div>

                  {/* Basic Income Section */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <Coins className="h-4 w-4 mr-2 text-emerald-600" />
                      Monthly Income
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="basic_salary">Basic Salary *</Label>
                        <Input
                          id="basic_salary"
                          type="number"
                          placeholder="₦500,000"
                          value={taxInput.basic_salary}
                          onChange={(e) => handleInputChange('basic_salary', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="transport_allowance">Transport Allowance</Label>
                        <Input
                          id="transport_allowance"
                          type="number"
                          placeholder="₦50,000"
                          value={taxInput.transport_allowance}
                          onChange={(e) => handleInputChange('transport_allowance', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="housing_allowance">Housing Allowance</Label>
                        <Input
                          id="housing_allowance"
                          type="number"
                          placeholder="₦200,000"
                          value={taxInput.housing_allowance}
                          onChange={(e) => handleInputChange('housing_allowance', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="meal_allowance">Meal Allowance</Label>
                        <Input
                          id="meal_allowance"
                          type="number"
                          placeholder="₦30,000"
                          value={taxInput.meal_allowance}
                          onChange={(e) => handleInputChange('meal_allowance', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="other_allowances">Other Allowances</Label>
                        <Input
                          id="other_allowances"
                          type="number"
                          placeholder="₦25,000"
                          value={taxInput.other_allowances}
                          onChange={(e) => handleInputChange('other_allowances', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Reliefs Section */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <PiggyBank className="h-4 w-4 mr-2 text-emerald-600" />
                      Monthly Reliefs & Deductions
                    </h3>
                    <Alert className="bg-blue-50 border-blue-200">
                      <AlertDescription className="text-blue-800 text-sm">
                        Leave pension and NHF empty to auto-calculate (8% and 2.5% of basic salary respectively)
                      </AlertDescription>
                    </Alert>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pension_contribution">Pension Contribution</Label>
                        <Input
                          id="pension_contribution"
                          type="number"
                          placeholder="Auto-calculated (8%)"
                          value={taxInput.pension_contribution}
                          onChange={(e) => handleInputChange('pension_contribution', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nhf_contribution">NHF Contribution</Label>
                        <Input
                          id="nhf_contribution"
                          type="number"
                          placeholder="Auto-calculated (2.5%)"
                          value={taxInput.nhf_contribution}
                          onChange={(e) => handleInputChange('nhf_contribution', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="life_insurance_premium">Life Insurance Premium</Label>
                        <Input
                          id="life_insurance_premium"
                          type="number"
                          placeholder="₦10,000"
                          value={taxInput.life_insurance_premium}
                          onChange={(e) => handleInputChange('life_insurance_premium', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="health_insurance_premium">Health Insurance Premium</Label>
                        <Input
                          id="health_insurance_premium"
                          type="number"
                          placeholder="₦15,000"
                          value={taxInput.health_insurance_premium}
                          onChange={(e) => handleInputChange('health_insurance_premium', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nhis_contribution">NHIS Contribution</Label>
                        <Input
                          id="nhis_contribution"
                          type="number"
                          placeholder="₦5,000"
                          value={taxInput.nhis_contribution}
                          onChange={(e) => handleInputChange('nhis_contribution', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="annual_rent">Annual Rent Paid</Label>
                        <Input
                          id="annual_rent"
                          type="number"
                          placeholder="₦1,200,000"
                          value={taxInput.annual_rent}
                          onChange={(e) => handleInputChange('annual_rent', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Disclaimer Note */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
                    <p className="text-xs text-amber-800 flex items-start">
                      <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>Note:</strong> Users are solely responsible for the validity, accuracy and completeness of the financial information they supply.
                      </span>
                    </p>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button 
                      onClick={calculateTax} 
                      disabled={loading || !taxInput.basic_salary}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    >
                      {loading ? 'Calculating...' : 'Calculate Tax'}
                    </Button>
                    <Button 
                      onClick={resetForm} 
                      variant="outline"
                      className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    >
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Results */}
              {result && (
                <Card className="bg-white border-emerald-100 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-t-lg">
                    <CardTitle>Tax Calculation Results</CardTitle>
                    <CardDescription className="text-teal-100">
                      Based on Nigerian 2026 tax laws
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                        <p className="text-sm text-emerald-600 font-medium">Monthly Gross Income</p>
                        <p className="text-xl font-bold text-emerald-800">
                          {formatCurrency(result.monthly_gross_income)}
                        </p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-600 font-medium">Monthly Tax</p>
                        <p className="text-xl font-bold text-blue-800">
                          {formatCurrency(result.monthly_tax)}
                        </p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200 col-span-2">
                        <p className="text-sm text-green-600 font-medium">Monthly Net Income</p>
                        <p className="text-2xl font-bold text-green-800">
                          {formatCurrency(result.monthly_net_income)}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Annual Breakdown */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">Annual Breakdown</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Gross Income:</span>
                          <span className="font-medium">{formatCurrency(result.annual_gross_income)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Reliefs:</span>
                          <span className="font-medium text-green-600">-{formatCurrency(result.total_reliefs)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Taxable Income:</span>
                          <span className="font-medium">{formatCurrency(result.taxable_income)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-gray-600">Tax Due:</span>
                          <span className="font-medium text-red-600">{formatCurrency(result.tax_due)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Effective Tax Rate:</span>
                          <span className="font-medium text-blue-600">{(result.effective_tax_rate * 100).toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg border-t pt-2">
                          <span>Net Annual Income:</span>
                          <span className="text-green-600">{formatCurrency(result.net_annual_income)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Relief Breakdown */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">Relief Breakdown (Annual)</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pension Relief:</span>
                          <span className="font-medium">{formatCurrency(result.pension_relief)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">NHF Relief:</span>
                          <span className="font-medium">{formatCurrency(result.nhf_relief)}</span>
                        </div>
                        {result.life_insurance_relief > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Life Insurance Relief:</span>
                            <span className="font-medium">{formatCurrency(result.life_insurance_relief)}</span>
                          </div>
                        )}
                        {result.health_insurance_relief > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Health Insurance Relief:</span>
                            <span className="font-medium">{formatCurrency(result.health_insurance_relief)}</span>
                          </div>
                        )}
                        {result.nhis_relief > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">NHIS Relief:</span>
                            <span className="font-medium">{formatCurrency(result.nhis_relief)}</span>
                          </div>
                        )}
                        {result.rent_relief > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Rent Relief:</span>
                            <span className="font-medium">{formatCurrency(result.rent_relief)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tax Breakdown */}
                    {result.tax_breakdown && result.tax_breakdown.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900">Tax Bracket Breakdown</h4>
                        <div className="space-y-2 text-sm">
                          {result.tax_breakdown.map((bracket, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <div>
                                <span className="text-gray-600">{bracket.range} ({bracket.rate}):</span>
                                <div className="text-xs text-gray-500">
                                  Taxable: {formatCurrency(bracket.taxable_amount)}
                                </div>
                              </div>
                              <span className="font-medium">{formatCurrency(bracket.tax_amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Print Report Button */}
                    <div className="pt-4 border-t">
                      <FeatureGate 
                        feature="pdf_export"
                        fallback={
                          <Button
                            disabled
                            className="w-full bg-gray-300 text-gray-500 cursor-not-allowed flex items-center justify-center space-x-2"
                          >
                            <Lock className="h-4 w-4" />
                            <span>PDF Export (Pro+ Required)</span>
                          </Button>
                        }
                        showUpgradePrompt={false}
                      >
                        <Button
                          onClick={() => generatePayeReport(taxInput, result)}
                          className="w-full bg-gray-900 hover:bg-gray-800 text-white flex items-center justify-center space-x-2"
                        >
                          <Printer className="h-4 w-4" />
                          <span>Print Report (PDF)</span>
                        </Button>
                      </FeatureGate>
                    </div>
                    
                    {/* Results Disclaimer */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-4">
                      <p className="text-xs text-gray-600 text-center">
                        * Users are solely responsible for the validity, accuracy and completeness of the financial information they supply.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            )}

            {/* Bulk Payroll Calculator */}
            {payeMode === 'bulk' && (
              <FeatureGate feature="bulk_paye">
                <BulkPayrollCalculator
                  formatCurrency={formatCurrency}
                  calculatePayeTax={calculatePayeTax}
                />
              </FeatureGate>
            )}
          </TabsContent>

          {/* CIT Calculator Tab */}
          <TabsContent value="cit" className="space-y-6">
            <CITCalculator
              citInput={citInput}
              citResult={citResult}
              citLoading={citLoading}
              handleCitInputChange={handleCitInputChange}
              calculateCitTax={calculateCitTax}
              resetCitForm={resetCitForm}
              formatCurrency={formatCurrency}
              hasFeature={hasFeature}
            />
          </TabsContent>

          {/* Tax Information Tab */}
          <TabsContent value="brackets">
            <TaxInformation />
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <FeatureGate feature="calculation_history">
              <EnhancedHistory 
                history={history} 
                citHistory={citHistory} 
                formatCurrency={formatCurrency} 
              />
            </FeatureGate>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance">
            <FeatureGate feature="compliance_assistance">
              <div className="grid lg:grid-cols-3 gap-6">
              {/* PAYE Compliance */}
              <Card className="bg-white border-emerald-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-emerald-600" />
                    <span>PAYE Compliance</span>
                  </CardTitle>
                  <CardDescription>
                    Personal income tax requirements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <h4 className="font-medium text-emerald-800 mb-2">Annual Tax Return</h4>
                      <p className="text-sm text-emerald-700">Due: March 31st following tax year</p>
                      <p className="text-xs text-emerald-600">File with FIRS or State Board of Internal Revenue</p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h4 className="font-medium text-yellow-800 mb-2">Monthly PAYE Remittance</h4>
                      <p className="text-sm text-yellow-700">Due: 10th of following month</p>
                      <p className="text-xs text-yellow-600">Employers must remit withheld tax</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-800 mb-2">Tax Identification Number</h4>
                      <p className="text-sm text-blue-700">Required for all taxpayers</p>
                      <p className="text-xs text-blue-600">Obtain from FIRS or State tax office</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CIT Compliance */}
              <Card className="bg-white border-blue-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <span>CIT Compliance</span>
                  </CardTitle>
                  <CardDescription>
                    Corporate income tax requirements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-800 mb-2">Annual CIT Return</h4>
                      <p className="text-sm text-blue-700">Due: 90 days after year-end</p>
                      <p className="text-xs text-blue-600">File with FIRS</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <h4 className="font-medium text-red-800 mb-2">Tax Payment</h4>
                      <p className="text-sm text-red-700">Due: 60 days after year-end</p>
                      <p className="text-xs text-red-600">Quarterly advance payments required</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="font-medium text-purple-800 mb-2">Development Levy</h4>
                      <p className="text-sm text-purple-700">4% on assessable profits</p>
                      <p className="text-xs text-purple-600">Replaces Education Tax, IT Levy, NASENI</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <h4 className="font-medium text-orange-800 mb-2">Thin Capitalization</h4>
                      <p className="text-sm text-orange-700">Interest limited to 30% of EBITDA</p>
                      <p className="text-xs text-orange-600">Related party debt restrictions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* WHT Compliance */}
              <Card className="bg-white border-orange-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5 text-orange-600" />
                    <span>WHT Compliance</span>
                  </CardTitle>
                  <CardDescription>
                    Withholding tax obligations and requirements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <h4 className="font-medium text-orange-800 mb-2">Deduction Requirements</h4>
                      <p className="text-sm text-orange-700">Deduct at payment or when liability arises</p>
                      <p className="text-xs text-orange-600">Applies to all qualifying transactions above threshold</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <h4 className="font-medium text-red-800 mb-2">FIRS Remittance</h4>
                      <p className="text-sm text-red-700">Due: 21st of following month</p>
                      <p className="text-xs text-red-600">Federal transactions and non-resident payments</p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h4 className="font-medium text-yellow-800 mb-2">SIRS Remittance</h4>
                      <p className="text-sm text-yellow-700">Due: 30th of following month</p>
                      <p className="text-xs text-yellow-600">State transactions and resident entities</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="font-medium text-purple-800 mb-2">WHT Certificate</h4>
                      <p className="text-sm text-purple-700">Issue within 30 days of deduction</p>
                      <p className="text-xs text-purple-600">Required for beneficiary tax credit claims</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-800 mb-2">Tax Clearance Certificate</h4>
                      <p className="text-sm text-blue-700">WHT compliance required for TCC</p>
                      <p className="text-xs text-blue-600">Essential for business operations and contracts</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-gray-800 mb-2">Record Keeping</h4>
                      <p className="text-sm text-gray-700">Maintain detailed transaction records</p>
                      <p className="text-xs text-gray-600">Minimum 6 years retention period</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            </FeatureGate>
          </TabsContent>

          {/* Profile Tab */}
          {isAuthenticated() && (
            <TabsContent value="profile" className="space-y-6">
              <UserProfile />
            </TabsContent>
          )}

          {/* Add-ons Tab */}
          {isAuthenticated() && (
            <TabsContent value="addons" className="space-y-6">
              <AddOnManager />
            </TabsContent>
          )}

          {/* VAT Calculator Tab */}
          <TabsContent value="vat">
            <FeatureGate feature="vat_calc">
              <VATCalculator formatCurrency={formatCurrency} />
            </FeatureGate>
          </TabsContent>

          {/* Payment Processing Calculator Tab */}
          <TabsContent value="payment">
            <FeatureGate feature="cgt_calc">
              <div className="space-y-6">
                {/* Payment Mode Toggle */}
                <Card className="bg-white border-purple-100 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <CreditCard className="h-5 w-5 mr-2 text-purple-600" />
                        Payment Processing Mode
                      </span>
                    </CardTitle>
                    <CardDescription>
                      Choose between single payment or bulk payment processing
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => setPaymentMode('single')}
                        variant={paymentMode === 'single' ? 'default' : 'outline'}
                        className={
                          paymentMode === 'single' ? 'bg-purple-600 hover:bg-purple-700 text-white' : ''
                        }
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Single Payment
                      </Button>
                      <Button
                        onClick={() => setPaymentMode('bulk')}
                        variant={paymentMode === 'bulk' ? 'default' : 'outline'}
                        className={
                          paymentMode === 'bulk' ? 'bg-pink-600 hover:bg-pink-700 text-white' : ''
                        }
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Bulk Payments
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Single Payment Calculator */}
                {paymentMode === 'single' && (
                  <PaymentProcessingCalculator formatCurrency={formatCurrency} />
                )}

                {/* Bulk Payment Calculator */}
                {paymentMode === 'bulk' && (
                  <FeatureGate feature="bulk_paye">
                    <BulkPaymentCalculator formatCurrency={formatCurrency} />
                  </FeatureGate>
                )}
              </div>
            </FeatureGate>
          </TabsContent>

          {/* CGT Calculator Tab */}
          <TabsContent value="cgt">
            <FeatureGate feature="cgt_calc">
              <CGTCalculator formatCurrency={formatCurrency} />
            </FeatureGate>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Authentication Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        setShowTerms={setShowTerms}
      />

      {/* Trial Modal */}
      <TrialModal
        isOpen={showTrialModal}
        onClose={() => setShowTrialModal(false)}
        onTrialStarted={(trialData) => {
          console.log('Trial started:', trialData);
          // Optionally refresh user data or show success message
        }}
      />

      {/* Trial Expired Modal */}
      <TrialExpiredModal
        isOpen={showExpiredModal}
        onClose={() => setShowExpiredModal(false)}
        onUpgrade={() => {
          setShowExpiredModal(false);
          // Navigate to pricing or open upgrade modal
          setActiveTab('home'); // Navigate to pricing section
        }}
        trialTier={trialStatus?.current_trial?.trial_tier || 'Pro'}
      />

      {/* Interstitial Ad Modal */}
      <InterstitialAd
        isOpen={showInterstitial}
        onClose={() => setShowInterstitial(false)}
      />

      {/* Rewarded Ad Modal */}
      <RewardedAd
        isOpen={showRewardedAd}
        onClose={() => setShowRewardedAd(false)}
        rewardType={rewardType}
      />

      {/* Password Reset Modal */}
      {showPasswordReset && (
        <PasswordResetForm 
          onClose={() => {
            setShowPasswordReset(false);
            // Clear URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
          }} 
        />
      )}

      {/* Terms and Conditions Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Terms and Conditions</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTerms(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>
            <div className="p-4 max-h-[calc(90vh-100px)] overflow-y-auto">
              <TermsAndConditions />
            </div>
          </div>
        </div>
      )}

      {/* Bottom Banner Ad */}
      {canShowAds() && (
        <BottomBanner className="mt-8" />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <TrialProvider>
        <AdProvider>
          <FeatureGateProvider>
            <AppContent />
          </FeatureGateProvider>
        </AdProvider>
      </TrialProvider>
    </AuthProvider>
  );
}

export default App;