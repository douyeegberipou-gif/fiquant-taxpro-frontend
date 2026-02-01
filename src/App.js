import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calculator, TrendingUp, FileText, Info, Wallet, Receipt, PiggyBank, Home as HomeIcon, Heart, Shield, Building2, Users, Briefcase, AlertTriangle, CreditCard, Banknote, Coins, Printer, LogIn, LogOut, User, Settings, Bell, Lock, RefreshCw, BookOpen, Percent, Mail, Gift } from 'lucide-react';
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
import { InactivityProvider, useInactivity } from './contexts/InactivityContext';
import { DraftProvider, useDrafts } from './contexts/DraftContext';
import { FeatureGate, BulkLimitGate } from './components/FeatureGate';
import { AuthModal } from './components/AuthModal';
import { TrialModal } from './components/TrialModal';
import { TrialExpiredModal } from './components/TrialExpiredModal';
import { TrialBanner } from './components/TrialBanner';
import { UpgradeModal } from './components/UpgradeModal';
import { TopBanner, BottomBanner } from './components/ads/AdBanner';
import { InterstitialAd } from './components/ads/InterstitialAd';
import { RewardedAd } from './components/ads/RewardedAd';
import InactivityFirstWarning from './components/InactivityFirstWarning';
import InactivityFinalWarning from './components/InactivityFinalWarning';
import DraftRecoveryModal from './components/DraftRecoveryModal';
import { MobileNav } from './components/mobile/MobileNav';
import { MobileBottomNav } from './components/mobile/MobileBottomNav';
import { isMobile, isTablet } from 'react-device-detect';
import { isMobileDevice } from './utils/deviceDetection';
import { MobileApp } from './MobileApp';
import { UserProfile } from './components/UserProfile';
import { PasswordResetForm } from './components/PasswordResetForm';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { UserDebugPanel } from './components/UserDebugPanel';
import { AdminSetup } from './components/admin/AdminSetup';
import TermsAndConditions from './components/TermsAndConditions';
import TaxInformation from './components/TaxInformation';
import EnhancedHistory from './components/EnhancedHistory';
import VATCalculator from './components/VATCalculator';
import BulkVATCalculator from './components/BulkVATCalculator';
import PaymentProcessingCalculator from './components/PaymentProcessingCalculator';
import BulkPaymentCalculator from './components/BulkPaymentCalculator';
import GlobalSearch from './components/GlobalSearch';
import AddOnManager from './components/AddOnManager';
import UpgradePrompt from './components/UpgradePrompt';
import { useUpgrade } from './hooks/useUpgrade';
import CGTCalculator from './components/CGTCalculator';
import Home from './components/Home';
import PaymentCallback from './components/PaymentCallback';
import SubscriptionCallback from './components/SubscriptionCallback';
import AdvancedAnalytics from './components/AdvancedAnalytics';
import { generatePayeReport, generatePayeReportAsBase64, generateBulkPayeReport, generateCITReport } from './utils/pdfGenerator';
import { trackTabChange, trackPageView, trackButtonClick } from './services/analyticsService';
import VideoAdModal from './components/VideoAdModal';
import UpgradeLimitModal from './components/UpgradeLimitModal';
import FeatureGateModal from './components/FeatureGateModal';
import TrialSelectionModal from './components/TrialSelectionModal';
import { useAdCalculation } from './hooks/useAdCalculation';
import './App.css';

// Environment-aware backend URL configuration
const getBackendURL = () => {
  // Production: Use environment variable (set in Vercel)
  if (process.env.REACT_APP_BACKEND_URL) {
    return process.env.REACT_APP_BACKEND_URL;
  }
  
  // Development fallback
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8001';
  }
  
  // Default fallback - will show error in production if not configured
  console.error('REACT_APP_BACKEND_URL not configured for production deployment');
  return null;
};

const BACKEND_URL = getBackendURL();
const API = BACKEND_URL ? `${BACKEND_URL}/api` : null;

function AppContent() {
  const { user, logout, refreshUser, isAuthenticated } = useAuth();
  const { trialStatus, showTrialModal, setShowTrialModal, showExpiredModal, setShowExpiredModal } = useTrial();
  const { showInterstitial, setShowInterstitial, showRewardedAd, setShowRewardedAd, rewardType, canShowAds } = useAds();
  const { hasFeature, getUserTier } = useFeatureGate();
  const { startTrial, requestUpgrade, requestAddon } = useUpgrade();
  
  // Ad-supported calculation hook for PAYE
  const payeAdCalc = useAdCalculation('paye');
  
  // Upgrade modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // Feature gate modal states
  const [showFeatureGate, setShowFeatureGate] = useState(false);
  const [featureGateType, setFeatureGateType] = useState('pdf_export');
  
  // Trial selection modal state
  const [showTrialSelectionModal, setShowTrialSelectionModal] = useState(false);
  
  // Helper function to show feature gate
  const openFeatureGate = (feature) => {
    setFeatureGateType(feature);
    setShowFeatureGate(true);
  };
  
  // Bulletproof mobile detection
  const [isMobileView, setIsMobileView] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      const mobile = isMobile || isTablet || isMobileDevice() || window.innerWidth <= 768;
      setIsMobileView(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleUpgrade = async () => {
    const result = await requestUpgrade('pro');
    if (result.success) {
      setShowUpgradePrompt(false);
    }
  };

  const handleTrial = async () => {
    const result = await startTrial('pro');
    if (result.success) {
      setShowUpgradePrompt(false);
    } else {
      alert(result.message);
    }
  };

  const handleAddon = async () => {
    const result = await requestAddon(upgradeContext.feature, 1);
    if (result.success) {
      setShowUpgradePrompt(false);
    }
  };
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null); // 'verifying', 'success', 'error'
  const [verificationMessage, setVerificationMessage] = useState('');
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [taxLibrarySection, setTaxLibrarySection] = useState(null);
  
  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Track initial page load and tab changes for analytics
  useEffect(() => {
    // Track initial page view on mount
    trackPageView('home', '/');
  }, []);
  
  // Track tab changes
  useEffect(() => {
    trackTabChange(activeTab);
  }, [activeTab]);
  
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
    tax_authority: '',
    // Income Details
    basic_salary: '',
    transport_allowance: '',
    housing_allowance: '',
    meal_allowance: '',
    utility_allowance: '',
    medical_allowance: '',
    other_allowances: '',
    // Benefits in Kind (BIK) - NTA 2025
    bik_vehicle_value: '',
    bik_housing_value: '',
    bonus: '',
    // Deductions & Reliefs
    pension_contribution: '',
    nhf_contribution: '',
    nhf_applicable: true, // Toggle for NHF - defaults to applicable
    life_insurance_premium: '',
    health_insurance_premium: '',
    nhis_contribution: '',
    annual_rent: '',
    mortgage_interest: ''
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
    tax_authority: '',
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
    wht_on_contracts: '',
    wht_on_dividends: '',
    wht_on_interest: '',
    wht_on_rent: '',
    other_wht_credits: '',
    // Company Classification
    total_debt: '',
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
  const [vatMode, setVatMode] = useState('single'); // 'single' or 'bulk'
  const [paymentMode, setPaymentMode] = useState('single'); // 'single' or 'bulk'
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradeContext, setUpgradeContext] = useState({ type: 'feature', feature: 'pdf_export' });
  
  // Email PDF Modal State
  const [showEmailPdfModal, setShowEmailPdfModal] = useState(false);
  const [emailPdfRecipient, setEmailPdfRecipient] = useState('');
  const [emailPdfLoading, setEmailPdfLoading] = useState(false);
  const [emailPdfReportType, setEmailPdfReportType] = useState('PAYE');
  
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

  // Handle search navigation
  const handleSearchNavigate = (tab, mode, section) => {
    setActiveTab(tab);
    
    // Handle mode switching for calculators with bulk options
    if (tab === 'calculator' && mode === 'bulk') {
      setPayeMode('bulk');
    } else if (tab === 'calculator') {
      setPayeMode('single');
    }
    
    if (tab === 'vat' && mode === 'bulk') {
      setVatMode('bulk');
    } else if (tab === 'vat') {
      setVatMode('single');
    }
    
    if (tab === 'payment' && mode === 'bulk') {
      setPaymentMode('bulk');
    } else if (tab === 'payment') {
      setPaymentMode('single');
    }
    
    // Handle Tax Library section navigation
    if (tab === 'brackets' && section) {
      setTaxLibrarySection(section);
    } else if (tab !== 'brackets') {
      setTaxLibrarySection(null);
    }
    
    // Scroll to top when navigating
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    console.log('BACKEND_URL:', BACKEND_URL);
    console.log('isAuthenticated:', isAuthenticated());
    console.log('basic_salary check:', !taxInput.basic_salary);
    
    // Check if backend URL is configured
    if (!BACKEND_URL) {
      console.error('BACKEND_URL is not configured!');
      alert('Backend configuration error. Please set REACT_APP_BACKEND_URL environment variable with your Supabase backend URL.');
      return;
    }
    
    setLoading(true);
    try {
      const numericInput = {};
      Object.keys(taxInput).forEach(key => {
        // Keep string fields as strings
        if (key === 'staff_name' || key === 'tin' || key === 'month' || key === 'year' || key === 'state_of_residence') {
          numericInput[key] = taxInput[key];
        } else if (key === 'nhf_applicable') {
          // Skip the toggle field - it's not sent to backend
        } else if (key === 'nhf_contribution') {
          // Set NHF to 0 if not applicable, otherwise use the value
          numericInput[key] = taxInput.nhf_applicable ? (parseFloat(taxInput[key]) || 0) : 0;
        } else {
          numericInput[key] = parseFloat(taxInput[key]) || 0;
        }
      });
      console.log('numericInput:', numericInput);

      let response;
      
      // Use authenticated endpoint if user is logged in (saves with user_id for analytics)
      if (isAuthenticated()) {
        const token = localStorage.getItem('token');
        console.log('Using authenticated endpoint: /api/auth/calculate-paye');
        response = await axios.post(
          `${API}/auth/calculate-paye`, 
          [numericInput], // Authenticated endpoint expects array
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Use public endpoint for non-authenticated users
        console.log('Using public endpoint: /api/calculate-paye');
        response = await axios.post(`${API}/calculate-paye`, numericInput);
      }
      
      // Backend returns an array, we need the first object
      console.log('Backend response:', response.data);
      console.log('Setting result to:', response.data[0]);
      setResult(response.data[0]);
      fetchHistory(); // Refresh history
    } catch (error) {
      console.error('Error calculating tax - Full error object:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Error calculating tax. Please check your input values.';
      if (error.response?.data?.detail) {
        errorMessage = `Error: ${error.response.data.detail}`;
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.response?.status === 422) {
        errorMessage = 'Invalid input values. Please check all fields and try again.';
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Email PDF Report Function
  const sendPdfEmail = async (reportType, pdfBase64, reportName) => {
    if (!emailPdfRecipient) {
      alert('Please enter an email address');
      return;
    }
    
    setEmailPdfLoading(true);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${backendUrl}/api/email-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipient_email: emailPdfRecipient,
          pdf_base64: pdfBase64,
          report_type: reportType,
          report_name: reportName
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(`Report sent successfully to ${emailPdfRecipient}`);
        setShowEmailPdfModal(false);
        setEmailPdfRecipient('');
      } else {
        alert(data.detail || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Error sending email. Please try again.');
    } finally {
      setEmailPdfLoading(false);
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
      tax_authority: '',
      // Income Details
      basic_salary: '',
      transport_allowance: '',
      housing_allowance: '',
      meal_allowance: '',
      utility_allowance: '',
      medical_allowance: '',
      other_allowances: '',
      // Benefits in Kind (BIK) - NTA 2025
      bik_vehicle_value: '',
      bik_housing_value: '',
      bonus: '',
      // Deductions & Reliefs
      pension_contribution: '',
      nhf_contribution: '',
      nhf_applicable: true,
      life_insurance_premium: '',
      health_insurance_premium: '',
      nhis_contribution: '',
      annual_rent: '',
      mortgage_interest: ''
    });
    setResult(null);
  };

  // Function for bulk payroll calculator to use existing PAYE calculation
  const calculatePayeTax = async (taxInput) => {
    try {
      console.log('calculatePayeTax called with:', taxInput);
      console.log('BACKEND_URL:', BACKEND_URL);
      console.log('API endpoint:', `${API}/calculate-paye`);
      
      if (!BACKEND_URL) {
        throw new Error('Backend URL not configured');
      }
      
      const response = await axios.post(`${API}/calculate-paye`, taxInput);
      console.log('calculatePayeTax response:', response.data);
      // Backend returns an array, we need the first object
      return response.data[0];
    } catch (error) {
      console.error('Error calculating PAYE tax - Full error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
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
        // String fields
        if (key === 'company_name' || key === 'tin' || key === 'year_of_assessment' || key === 'tax_year') {
          numericInput[key] = citInput[key] || '';
        } 
        // Boolean fields
        else if (key === 'is_professional_service' || key === 'is_multinational') {
          numericInput[key] = Boolean(citInput[key]);
        } 
        // Numeric fields
        else {
          const value = parseFloat(citInput[key]);
          numericInput[key] = isNaN(value) ? 0 : value;
        }
      });

      console.log('Sending CIT data:', numericInput);
      
      let response;
      // Use authenticated endpoint if user is logged in (saves with user_id for analytics)
      if (isAuthenticated()) {
        const token = localStorage.getItem('token');
        console.log('Using authenticated CIT endpoint: /api/auth/calculate-cit');
        response = await axios.post(
          `${API}/auth/calculate-cit`, 
          numericInput,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Use public endpoint for non-authenticated users
        console.log('Using public CIT endpoint: /api/calculate-cit');
        response = await axios.post(`${API}/calculate-cit`, numericInput);
      }
      
      setCitResult(response.data);
      fetchCitHistory(); // Refresh history
    } catch (error) {
      console.error('Error calculating CIT:', error);
      console.error('Error details:', error.response?.data);
      alert(`Error calculating CIT: ${error.response?.data?.detail || 'Please check your input values.'}`);
    } finally {
      setCitLoading(false);
    }
  };

  const resetCitForm = () => {
    setCitInput({
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
      wht_on_contracts: '',
      wht_on_dividends: '',
      wht_on_interest: '',
      wht_on_rent: '',
      other_wht_credits: '',
      // Company Classification
      total_debt: '',
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
      {/* Mobile Navigation - Show on mobile devices */}
      {isMobileView && (
        <div className="mobile-only">
          <MobileNav 
            activeTab={activeTab}
            onNavigateToTab={setActiveTab}
            onOpenAuth={() => setAuthModalOpen(true)}
            onOpenAdmin={() => setShowAdminDashboard(true)}
          />
        </div>
      )}

      {/* Top Banner Ad - Desktop only */}
      {canShowAds() && !isMobileView && (
        <div className="desktop-only">
          <TopBanner className="sticky top-0 z-40" />
        </div>
      )}

      {/* Trial Status Banner - Shows when user has active or expired trial */}
      {isAuthenticated() && (
        <TrialBanner 
          onUpgrade={() => setShowUpgradeModal(true)}
        />
      )}
      
      {/* Header - Desktop only */}
      {!isMobileView && (
        <div className="desktop-only relative">
        {/* Background with black and gold gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-black to-gray-800 overflow-hidden"></div>
        <div className="absolute inset-0 opacity-20 overflow-hidden">
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
                  <sup className="text-xs text-yellow-400 font-normal -ml-1">™</sup>
                </div>
                <p className="text-gray-300 mt-1 font-medium tracking-wide">Nigerian Tax Calculator 2026</p>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="w-12 h-0.5 bg-gradient-to-r from-yellow-400 to-transparent"></div>
                  <span className="text-xs text-yellow-300 font-medium uppercase tracking-wider">Professional Edition</span>
                </div>
              </div>
            </div>
            
            {/* Search and Authentication Section */}
            <div className="flex flex-col items-end space-y-3">
              {/* Global Search */}
              <GlobalSearch 
                onNavigate={handleSearchNavigate}
                isAuthenticated={isAuthenticated()}
                hasFeature={hasFeature}
                history={history}
                citHistory={citHistory}
              />
              
              {/* User Info and Actions */}
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
                  
                  {user?.admin_role === 'super_admin' && (
                  <Button
                    onClick={() => setShowDebugPanel(true)}
                    variant="outline"
                    size="sm"
                    className="border-purple-600 text-purple-300 hover:bg-purple-800/50 backdrop-blur-sm"
                    title="Check user status"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Status
                  </Button>
                  )}
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
            </div>
          </div>
        </div>
        
        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600"></div>
        </div>
      )}

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${
        isMobileView ? 'pt-16 pb-20 py-4' : 'py-8'
      }`}>
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
            <TabsList className="grid w-full grid-cols-9 md:grid-cols-9 h-auto mobile-tabs overflow-x-auto nav-scroll bg-transparent rounded-none p-0">
              <div className="flex md:contents min-w-full md:min-w-0 gap-2">
              <TabsTrigger 
                value="home" 
                className="flex-1 md:flex-none bg-gray-50 px-6 py-4 text-gray-700 font-medium rounded-lg hover:bg-gray-100 data-[state=active]:bg-teal-600 data-[state=active]:text-white transition-all duration-200 flex flex-col items-center justify-center space-y-2 shadow-sm hover:shadow-md data-[state=active]:shadow-md relative"
                style={{
                  boxShadow: activeTab === 'home' ? '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)' : '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
                }}
              >
                <HomeIcon className="h-5 w-5" />
                <span className="text-xs font-semibold tracking-wide">HOME</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="calculator" 
                className="flex-1 md:flex-none bg-gray-50 px-6 py-4 text-gray-700 font-medium rounded-lg hover:bg-gray-100 data-[state=active]:bg-teal-600 data-[state=active]:text-white transition-all duration-200 flex flex-col items-center justify-center space-y-2 shadow-sm hover:shadow-md data-[state=active]:shadow-md relative"
                style={{
                  boxShadow: activeTab === 'calculator' ? '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)' : '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
                }}
              >
                <Users className="h-5 w-5" />
                <span className="text-xs font-semibold tracking-wide">PAYE</span>
              </TabsTrigger>
              
              {/* CGT - FREE for all users */}
              <TabsTrigger 
                value="cgt" 
                className="flex-1 md:flex-none bg-gray-50 px-6 py-4 text-gray-700 font-medium rounded-lg hover:bg-gray-100 data-[state=active]:bg-teal-600 data-[state=active]:text-white transition-all duration-200 flex flex-col items-center justify-center space-y-2 shadow-sm hover:shadow-md data-[state=active]:shadow-md relative"
                style={{
                  boxShadow: activeTab === 'cgt' ? '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)' : '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
                }}
              >
                <TrendingUp className="h-5 w-5" />
                <span className="text-xs font-semibold tracking-wide">CGT</span>
              </TabsTrigger>
              
              {/* CIT - Now FREE for all users */}
              <TabsTrigger 
                value="cit" 
                className="flex-1 md:flex-none bg-gray-50 px-6 py-4 text-gray-700 font-medium rounded-lg hover:bg-gray-100 data-[state=active]:bg-teal-600 data-[state=active]:text-white transition-all duration-200 flex flex-col items-center justify-center space-y-2 shadow-sm hover:shadow-md data-[state=active]:shadow-md relative"
                style={{
                  boxShadow: activeTab === 'cit' ? '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)' : '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
                }}
              >
                <Building2 className="h-5 w-5" />
                <span className="text-xs font-semibold tracking-wide">CIT</span>
              </TabsTrigger>
              
              {/* VAT - Now FREE for all users */}
              <TabsTrigger 
                value="vat" 
                className="flex-1 md:flex-none bg-gray-50 px-6 py-4 text-gray-700 font-medium rounded-lg hover:bg-gray-100 data-[state=active]:bg-teal-600 data-[state=active]:text-white transition-all duration-200 flex flex-col items-center justify-center space-y-2 shadow-sm hover:shadow-md data-[state=active]:shadow-md relative"
                style={{
                  boxShadow: activeTab === 'vat' ? '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)' : '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
                }}
              >
                <Percent className="h-5 w-5" />
                <span className="text-xs font-semibold tracking-wide">VAT</span>
              </TabsTrigger>
              
              {/* PAYMENTS - FREE for all users */}
              <TabsTrigger 
                value="payment" 
                className="flex-1 md:flex-none bg-gray-50 px-6 py-4 text-gray-700 font-medium rounded-lg hover:bg-gray-100 data-[state=active]:bg-teal-600 data-[state=active]:text-white transition-all duration-200 flex flex-col items-center justify-center space-y-2 shadow-sm hover:shadow-md data-[state=active]:shadow-md relative"
                style={{
                  boxShadow: activeTab === 'payment' ? '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)' : '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
                }}
              >
                <CreditCard className="h-5 w-5" />
                <span className="text-xs font-semibold tracking-wide">VENDOR PAYMENTS</span>
              </TabsTrigger>
              
              {/* TAX LIBRARY - FREE (ad-supported) */}
              <TabsTrigger 
                value="brackets" 
                className="flex-1 md:flex-none bg-gray-50 px-6 py-4 text-gray-700 font-medium rounded-lg hover:bg-gray-100 data-[state=active]:bg-teal-600 data-[state=active]:text-white transition-all duration-200 flex flex-col items-center justify-center space-y-2 shadow-sm hover:shadow-md data-[state=active]:shadow-md relative"
                style={{
                  boxShadow: activeTab === 'brackets' ? '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)' : '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
                }}
              >
                <BookOpen className="h-5 w-5" />
                <span className="text-xs font-semibold tracking-wide">TAX LIBRARY</span>
                {/* Tax Library is now FREE for all users - no badge needed */}
              </TabsTrigger>
              
              {/* HISTORY - PRO+ */}
              <TabsTrigger 
                value="history" 
                className="flex-1 md:flex-none bg-gray-50 px-6 py-4 text-gray-700 font-medium rounded-lg hover:bg-gray-100 data-[state=active]:bg-teal-600 data-[state=active]:text-white transition-all duration-200 flex flex-col items-center justify-center space-y-2 shadow-sm hover:shadow-md data-[state=active]:shadow-md relative"
                style={{
                  boxShadow: activeTab === 'history' ? '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)' : '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
                }}
              >
                <FileText className="h-5 w-5" />
                <span className="text-xs font-semibold tracking-wide">HISTORY</span>
                {!hasFeature('calculation_history') && (
                  <Badge variant="outline" className="absolute -top-1 -right-1 text-[10px] px-1 py-0 bg-blue-50 text-blue-600 border-blue-200">
                    PRO+
                  </Badge>
                )}
              </TabsTrigger>
              
              <TabsTrigger 
                value="analytics" 
                className="flex-1 md:flex-none bg-gray-50 px-6 py-4 text-gray-700 font-medium rounded-lg hover:bg-gray-100 data-[state=active]:bg-teal-600 data-[state=active]:text-white transition-all duration-200 flex flex-col items-center justify-center space-y-2 shadow-sm hover:shadow-md data-[state=active]:shadow-md relative"
                style={{
                  boxShadow: activeTab === 'analytics' ? '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)' : '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
                }}
              >
                <TrendingUp className="h-5 w-5" />
                <span className="text-xs font-semibold tracking-wide">ANALYTICS</span>
                {!hasFeature('advanced_analytics') && (
                  <Badge variant="outline" className="absolute -top-1 -right-1 text-[10px] px-1 py-0 bg-yellow-50 text-yellow-600 border-yellow-200">
                    PREMIUM+
                  </Badge>
                )}
              </TabsTrigger>
              {isAuthenticated() && (
                <TabsTrigger 
                  value="profile" 
                  className="flex-1 md:flex-none bg-gray-50 px-6 py-4 text-gray-700 font-medium rounded-lg hover:bg-gray-100 data-[state=active]:bg-teal-600 data-[state=active]:text-white transition-all duration-200 flex flex-col items-center justify-center space-y-2 shadow-sm hover:shadow-md data-[state=active]:shadow-md relative"
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
                  className="flex-1 md:flex-none bg-gray-50 px-6 py-4 text-gray-700 font-medium rounded-lg hover:bg-gray-100 data-[state=active]:bg-teal-600 data-[state=active]:text-white transition-all duration-200 flex flex-col items-center justify-center space-y-2 shadow-sm hover:shadow-md data-[state=active]:shadow-md relative"
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
            <Home 
              onNavigateToTab={(tabValue, options = {}) => {
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
              }}
              isAuthenticated={isAuthenticated}
              setShowTrialModal={() => {
                if (isAuthenticated && isAuthenticated()) {
                  setShowTrialModal(true);
                } else {
                  setShowTrialSelectionModal(true);
                }
              }}
              setAuthModalOpen={setAuthModalOpen}
              setShowUpgradeModal={setShowUpgradeModal}
              user={user}
            />
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
                    
                    {/* Row 4: Tax Authority */}
                    <div className="space-y-2">
                      <Label htmlFor="tax_authority">Tax Authority</Label>
                      <Input
                        id="tax_authority"
                        type="text"
                        placeholder="e.g., Lagos State Internal Revenue Service"
                        value={taxInput.tax_authority}
                        onChange={(e) => handleInputChange('tax_authority', e.target.value)}
                      />
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
                      <div className="space-y-2">
                        <Label htmlFor="utility_allowance">Utility Allowance</Label>
                        <Input
                          id="utility_allowance"
                          type="number"
                          placeholder="₦20,000"
                          value={taxInput.utility_allowance}
                          onChange={(e) => handleInputChange('utility_allowance', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="medical_allowance">Medical Allowance</Label>
                        <Input
                          id="medical_allowance"
                          type="number"
                          placeholder="₦25,000"
                          value={taxInput.medical_allowance}
                          onChange={(e) => handleInputChange('medical_allowance', e.target.value)}
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

                  {/* Benefits in Kind (BIK) Section - NTA 2025 */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <Gift className="h-4 w-4 mr-2 text-purple-600" />
                      Benefits in Kind (BIK) - NTA 2025
                    </h3>
                    <Alert className="bg-purple-50 border-purple-200">
                      <AlertDescription className="text-purple-800 text-sm">
                        Per NTA 2025 Section 14: Company vehicles are taxed at 5% of value, company housing at 20% of value. Bonuses are fully taxable as income.
                      </AlertDescription>
                    </Alert>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bik_vehicle_value">BIK - Vehicle Value</Label>
                        <Input
                          id="bik_vehicle_value"
                          type="number"
                          placeholder="₦0 (5% taxable)"
                          value={taxInput.bik_vehicle_value}
                          onChange={(e) => handleInputChange('bik_vehicle_value', e.target.value)}
                        />
                        <p className="text-xs text-gray-500">Full value of company car provided</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bik_housing_value">BIK - Housing Value</Label>
                        <Input
                          id="bik_housing_value"
                          type="number"
                          placeholder="₦0 (20% taxable)"
                          value={taxInput.bik_housing_value}
                          onChange={(e) => handleInputChange('bik_housing_value', e.target.value)}
                        />
                        <p className="text-xs text-gray-500">Full value of company housing provided</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bonus">Annual Bonus</Label>
                        <Input
                          id="bonus"
                          type="number"
                          placeholder="₦0 (100% taxable)"
                          value={taxInput.bonus}
                          onChange={(e) => handleInputChange('bonus', e.target.value)}
                        />
                        <p className="text-xs text-gray-500">Annual bonus amount (fully taxable)</p>
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
                        Pension auto-calculates at 8% of pensionable earnings (basic + housing + transport). Toggle NHF if applicable. Mortgage interest relief applies to owner-occupied housing per NTA 2025.
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
                        <div className="flex items-center justify-between">
                          <Label htmlFor="nhf_contribution">NHF Contribution</Label>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">NHF Applicable</span>
                            <button
                              type="button"
                              onClick={() => handleInputChange('nhf_applicable', !taxInput.nhf_applicable)}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                taxInput.nhf_applicable ? 'bg-green-500' : 'bg-gray-300'
                              }`}
                              title={taxInput.nhf_applicable 
                                ? "NHF is applicable (formal sector employees)" 
                                : "NHF not applicable (self-employed, informal sector, exempt categories)"
                              }
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  taxInput.nhf_applicable ? 'translate-x-4' : 'translate-x-0.5'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                        <Input
                          id="nhf_contribution"
                          type="number"
                          placeholder={taxInput.nhf_applicable ? "Auto-calculated (2.5%)" : "N/A - NHF not applicable"}
                          value={taxInput.nhf_applicable ? taxInput.nhf_contribution : ''}
                          onChange={(e) => handleInputChange('nhf_contribution', e.target.value)}
                          disabled={!taxInput.nhf_applicable}
                          className={!taxInput.nhf_applicable ? 'bg-gray-100 cursor-not-allowed' : ''}
                        />
                        {!taxInput.nhf_applicable && (
                          <p className="text-xs text-amber-600">
                            NHF exemption applies to self-employed, informal sector workers, and other exempt categories under NTA 2025.
                          </p>
                        )}
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
                      <div className="space-y-2">
                        <Label htmlFor="mortgage_interest">Mortgage Interest (Owner-Occupied Housing)</Label>
                        <Input
                          id="mortgage_interest"
                          type="number"
                          placeholder="₦500,000"
                          value={taxInput.mortgage_interest}
                          onChange={(e) => handleInputChange('mortgage_interest', e.target.value)}
                        />
                        <p className="text-xs text-gray-500">Interest paid on mortgage for owner-occupied housing is deductible under NTA 2025</p>
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

                  {/* Ad-supported info text for free users */}
                  {!payeAdCalc.isPaidUser && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                      <p className="text-xs text-blue-700">
                        <Info className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />
                        {payeAdCalc.isLoggedIn 
                          ? `This feature includes ${payeAdCalc.dailyLimit} free calculations daily. You have ${payeAdCalc.remainingFreeCalcs} remaining today.`
                          : 'Create a free account for 15 daily calculations. Guests get 1 free calculation per day.'
                        }
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-3 pt-4">
                    <Button 
                      onClick={() => {
                        console.log('Calculate button clicked');
                        console.log('Current taxInput:', taxInput);
                        console.log('basic_salary value:', taxInput.basic_salary);
                        console.log('basic_salary type:', typeof taxInput.basic_salary);
                        console.log('Button disabled conditions:', {
                          loading,
                          basic_salary_empty: !taxInput.basic_salary,
                          basic_salary_zero_or_less: parseFloat(taxInput.basic_salary) <= 0
                        });
                        // Use ad-supported calculation wrapper
                        payeAdCalc.handleCalculateWithAd(calculateTax);
                      }}
                      disabled={loading || !taxInput.basic_salary || parseFloat(taxInput.basic_salary) <= 0}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      data-testid="paye-calculate-btn"
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

              {/* Video Ad Modal for PAYE (guests only) */}
              <VideoAdModal
                isOpen={payeAdCalc.showAdModal}
                onClose={payeAdCalc.closeAdModal}
                onAdComplete={payeAdCalc.onAdComplete}
                calculatorType="PAYE"
                onStartTrial={() => setShowTrialModal(true)}
                onSubscribe={() => setShowUpgradeModal(true)}
              />

              {/* Upgrade Limit Modal for PAYE (logged-in free users) */}
              <UpgradeLimitModal
                isOpen={payeAdCalc.showUpgradePrompt}
                onClose={payeAdCalc.closeUpgradePrompt}
                onStartTrial={() => setShowTrialModal(true)}
                onViewPlans={() => setShowUpgradeModal(true)}
                calculatorType="PAYE"
                dailyLimit={payeAdCalc.dailyLimit}
              />

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
                    {/* Summary Cards - Matching History Section Style */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-900 text-white rounded-lg">
                        <p className="text-sm text-gray-300 mb-1">Monthly Tax</p>
                        <p className="text-2xl font-bold">{formatCurrency(result.monthly_tax)}</p>
                      </div>
                      <div className="p-4 bg-emerald-600 text-white rounded-lg">
                        <p className="text-sm text-emerald-100 mb-1">Monthly Net Income</p>
                        <p className="text-2xl font-bold">{formatCurrency(result.monthly_net_income)}</p>
                      </div>
                    </div>

                    {/* Annual Summary */}
                    <div className="border-l-4 border-l-gray-900 bg-gray-50 rounded-r-lg p-4">
                      <p className="font-medium text-gray-900 mb-2">Annual Summary</p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Annual Gross</p>
                          <p className="font-medium">{formatCurrency(result.annual_gross_income)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Annual Tax</p>
                          <p className="font-medium text-red-600">{formatCurrency(result.tax_due)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Annual Net</p>
                          <p className="font-medium text-emerald-600">{formatCurrency(result.net_annual_income)}</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Benefits in Kind (BIK) Breakdown - Only show if any BIK values exist */}
                    {(result.total_bik_taxable > 0) && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900 flex items-center">
                          <Gift className="h-4 w-4 mr-2 text-purple-600" />
                          Benefits in Kind Breakdown (NTA 2025)
                        </h4>
                        <div className="space-y-2 text-sm bg-purple-50 p-3 rounded-lg border border-purple-200">
                          {result.bik_vehicle_value > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Vehicle BIK (5% of {formatCurrency(result.bik_vehicle_value)}):</span>
                              <span className="font-medium text-purple-700">{formatCurrency(result.bik_vehicle_taxable)}</span>
                            </div>
                          )}
                          {result.bik_housing_value > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Housing BIK (20% of {formatCurrency(result.bik_housing_value)}):</span>
                              <span className="font-medium text-purple-700">{formatCurrency(result.bik_housing_taxable)}</span>
                            </div>
                          )}
                          {result.bonus > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Bonus (100% taxable):</span>
                              <span className="font-medium text-purple-700">{formatCurrency(result.bonus)}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-semibold border-t border-purple-300 pt-2">
                            <span className="text-purple-800">Total Taxable BIK:</span>
                            <span className="text-purple-800">{formatCurrency(result.total_bik_taxable)}</span>
                          </div>
                        </div>
                      </div>
                    )}

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
                        {result.mortgage_interest_relief > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Mortgage Interest Relief:</span>
                            <span className="font-medium">{formatCurrency(result.mortgage_interest_relief)}</span>
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
                      <Button
                        onClick={() => {
                          if (!hasFeature('pdf_export')) {
                            openFeatureGate('pdf_export');
                            return;
                          }
                          generatePayeReport(taxInput, result);
                        }}
                        className="w-full bg-gray-900 hover:bg-gray-800 text-white flex items-center justify-center space-x-2"
                        data-testid="paye-print-pdf-btn"
                      >
                        <Printer className="h-4 w-4" />
                        <span>Print Report (PDF)</span>
                        {!hasFeature('pdf_export') && (
                          <Lock className="h-3.5 w-3.5 ml-2 text-gray-400" />
                        )}
                      </Button>
                      
                      {/* Email PDF Button */}
                      <Button
                        onClick={() => {
                          if (!hasFeature('pdf_export')) {
                            openFeatureGate('pdf_export');
                            return;
                          }
                          setEmailPdfReportType('PAYE');
                          setEmailPdfRecipient(user?.email || '');
                          setShowEmailPdfModal(true);
                        }}
                        variant="outline"
                        className="w-full mt-2 border-teal-600 text-teal-600 hover:bg-teal-50 flex items-center justify-center space-x-2"
                        data-testid="paye-email-pdf-btn"
                      >
                        <Mail className="h-4 w-4" />
                        <span>Email Report</span>
                        {!hasFeature('pdf_export') && (
                          <Lock className="h-3.5 w-3.5 ml-2 text-gray-400" />
                        )}
                      </Button>
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
              <BulkPayrollCalculator
                formatCurrency={formatCurrency}
                calculatePayeTax={calculatePayeTax}
                hasFeature={hasFeature}
                onShowTrialModal={() => setShowTrialSelectionModal(true)}
                onShowUpgradeModal={() => setShowUpgradeModal(true)}
              />
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
              user={user}
              onShowTrialModal={() => setShowTrialModal(true)}
              onShowUpgradeModal={() => setShowUpgradeModal(true)}
            />
          </TabsContent>

          {/* Tax Information Tab */}
          <TabsContent value="brackets">
            <TaxInformation initialSection={taxLibrarySection} />
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            {hasFeature('calculation_history') ? (
              <EnhancedHistory 
                history={history} 
                citHistory={citHistory} 
                formatCurrency={formatCurrency} 
                hasFeature={hasFeature}
              />
            ) : (
              <div className="max-w-2xl mx-auto py-16 px-4 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Lock className="h-8 w-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Calculation History</h2>
                <p className="text-gray-600 mb-6">
                  Access your complete calculation history, reprint reports, and track your tax calculations over time.
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-left">
                      <span className="text-gray-500">Pro</span>
                      <p className="font-semibold text-gray-800">90-day history</p>
                    </div>
                    <div className="text-left">
                      <span className="text-gray-500">Premium</span>
                      <p className="font-semibold text-gray-800">Unlimited history</p>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => openFeatureGate('calculation_history')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  data-testid="history-upgrade-btn"
                >
                  Unlock History
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            {hasFeature('advanced_analytics') ? (
              <AdvancedAnalytics />
            ) : (
              <div className="max-w-2xl mx-auto py-16 px-4 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Lock className="h-8 w-8 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Advanced Analytics</h2>
                <p className="text-gray-600 mb-6">
                  Gain deep insights into your tax calculations with trend analysis, savings opportunities, and comprehensive reports.
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
                  <ul className="text-sm text-left space-y-2">
                    <li className="flex items-center text-gray-700">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
                      Visual tax breakdown charts
                    </li>
                    <li className="flex items-center text-gray-700">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
                      Monthly/yearly trend comparisons
                    </li>
                    <li className="flex items-center text-gray-700">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
                      Tax optimization insights
                    </li>
                  </ul>
                </div>
                <Button 
                  onClick={() => openFeatureGate('analytics')}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  data-testid="analytics-upgrade-btn"
                >
                  Unlock Analytics
                </Button>
              </div>
            )}
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
            <div className="space-y-6">
              {/* VAT Mode Toggle */}
              <Card className="bg-white border-purple-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Receipt className="h-5 w-5 mr-2 text-purple-600" />
                      VAT Calculator Mode
                    </span>
                  </CardTitle>
                  <CardDescription>
                    Choose between single transaction or bulk VAT calculation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setVatMode('single')}
                      variant={vatMode === 'single' ? 'default' : 'outline'}
                      className={
                        vatMode === 'single' ? 'bg-purple-600 hover:bg-purple-700 text-white' : ''
                      }
                    >
                      <Calculator className="h-4 w-4 mr-2" />
                      Single VAT Calculation
                    </Button>
                    <Button
                      onClick={() => setVatMode('bulk')}
                      variant={vatMode === 'bulk' ? 'default' : 'outline'}
                      className={
                        vatMode === 'bulk' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''
                      }
                    >
                      <Receipt className="h-4 w-4 mr-2" />
                      Bulk VAT Processing
                      {!hasFeature('bulk_vat') && (
                        <Badge variant="outline" className="ml-2 text-xs bg-blue-50 text-blue-600 border-blue-200">
                          PRO+
                        </Badge>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Single VAT Calculator */}
              {vatMode === 'single' && (
                <VATCalculator 
                  formatCurrency={formatCurrency} 
                  hasFeature={hasFeature} 
                  isAuthenticated={isAuthenticated}
                  onShowTrialModal={() => setShowTrialModal(true)}
                  onShowUpgradeModal={() => setShowUpgradeModal(true)}
                />
              )}
              
              {/* Bulk VAT Calculator */}
              {vatMode === 'bulk' && (
                <BulkVATCalculator formatCurrency={formatCurrency} hasFeature={hasFeature} />
              )}
            </div>
          </TabsContent>

          {/* Payment Processing Calculator Tab */}
          <TabsContent value="payment">
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
                      Bulk Vendor Payments
                      {!hasFeature('bulk_paye') && (
                        <Badge variant="outline" className="ml-2 text-xs bg-blue-50 text-blue-600 border-blue-200">
                          PRO+
                        </Badge>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Single Payment Calculator */}
              {paymentMode === 'single' && (
                <PaymentProcessingCalculator formatCurrency={formatCurrency} hasFeature={hasFeature} />
              )}

              {/* Bulk Payment Calculator */}
              {paymentMode === 'bulk' && (
                <BulkPaymentCalculator formatCurrency={formatCurrency} hasFeature={hasFeature} />
              )}
            </div>
          </TabsContent>

          {/* CGT Calculator Tab */}
          <TabsContent value="cgt">
            <CGTCalculator 
              formatCurrency={formatCurrency} 
              hasFeature={hasFeature} 
              isAuthenticated={isAuthenticated}
              onShowTrialModal={() => setShowTrialModal(true)}
              onShowUpgradeModal={() => setShowUpgradeModal(true)}
            />
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
        userEmail={user?.email}
        userName={user?.full_name || user?.email?.split('@')[0]}
      />

      {/* Trial Expired Modal */}
      <TrialExpiredModal
        isOpen={showExpiredModal}
        onClose={() => setShowExpiredModal(false)}
        onUpgrade={() => {
          setShowExpiredModal(false);
          setShowUpgradeModal(true);
        }}
        trialTier={trialStatus?.current_trial?.trial_tier || 'Pro'}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgradeSuccess={(data) => {
          console.log('Upgrade successful:', data);
          // Refresh user data
          if (refreshUser) {
            refreshUser();
          }
        }}
      />

      {/* Feature Gate Modal */}
      <FeatureGateModal
        isOpen={showFeatureGate}
        onClose={() => setShowFeatureGate(false)}
        feature={featureGateType}
        onStartTrial={() => setShowTrialSelectionModal(true)}
        onViewPlans={() => setShowUpgradeModal(true)}
      />

      {/* Trial Selection Modal */}
      <TrialSelectionModal
        isOpen={showTrialSelectionModal}
        onClose={() => setShowTrialSelectionModal(false)}
        onSelectNoCardTrial={() => {
          setShowTrialSelectionModal(false);
          setShowTrialModal(true);
        }}
        onSelectCardTrial={() => {
          setShowTrialSelectionModal(false);
          setShowTrialModal(true);
        }}
        userEmail={user?.email || ''}
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
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowTerms(false)}
        >
          <div 
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
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

      {/* Upgrade Prompt */}
      {showUpgradePrompt && (
        <UpgradePrompt
          type={upgradeContext.type}
          feature={upgradeContext.feature}
          onUpgrade={handleUpgrade}
          onTrial={handleTrial}
          onAddon={handleAddon}
          onClose={() => setShowUpgradePrompt(false)}
        />
      )}

      {/* Email PDF Modal */}
      {showEmailPdfModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowEmailPdfModal(false)}>
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" 
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Mail className="h-5 w-5 mr-2 text-teal-600" />
                Email {emailPdfReportType} Report
              </h3>
              <button 
                onClick={() => setShowEmailPdfModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Send the PDF report directly to an email address.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={emailPdfRecipient}
                  onChange={(e) => setEmailPdfRecipient(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <User className="h-4 w-4" />
                <span>Logged in as: {user?.email}</span>
              </div>
              
              <div className="flex space-x-3 pt-2">
                <Button
                  onClick={() => setShowEmailPdfModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    const pdfBase64 = generatePayeReportAsBase64(taxInput, result);
                    sendPdfEmail(emailPdfReportType, pdfBase64, `${emailPdfReportType} Tax Calculation Report`);
                  }}
                  disabled={emailPdfLoading || !emailPdfRecipient}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                >
                  {emailPdfLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Debug Panel */}
      {showDebugPanel && (
        <UserDebugPanel onClose={() => setShowDebugPanel(false)} />
      )}

      {/* Mobile Bottom Navigation - Mobile only */}
      {isMobileView && (
        <div className="mobile-only">
          <MobileBottomNav 
            activeTab={activeTab}
            onNavigateToTab={setActiveTab}
          />
        </div>
      )}
    </div>
  );
}

function AppWrapper() {
  const [showMobile, setShowMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Client-side only detection
    setIsClient(true);
    const checkDevice = () => {
      // Multiple detection methods
      const isLibMobile = isMobile || isTablet;
      const isCustomMobile = isMobileDevice();
      const isWidthMobile = window.innerWidth <= 768;
      const isUserAgentMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Show mobile if ANY method detects mobile
      const shouldShowMobile = isLibMobile || isCustomMobile || isWidthMobile || isUserAgentMobile;
      setShowMobile(shouldShowMobile);
      
      console.log('🔍 Device Detection:', {
        isLibMobile,
        isCustomMobile,
        isWidthMobile,
        isUserAgentMobile,
        result: shouldShowMobile
      });
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Show loading until client-side detection completes
  if (!isClient) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(to bottom right, #d1fae5, #ccfbf1, #cffafe)'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  // TRUE CONDITIONAL RENDERING
  return showMobile ? <MobileApp /> : <AppContent />;
}

function App() {
  return (
    <AuthProvider>
      <TrialProvider>
        <AdProvider>
          <FeatureGateProvider>
            <DraftProvider>
              <InactivityProvider>
                <Routes>
                  <Route path="/payment/callback" element={<PaymentCallback />} />
                  <Route path="/subscription/callback" element={<SubscriptionCallback />} />
                  <Route path="/*" element={<AppWrapper />} />
                </Routes>
                {/* Inactivity Warning Components */}
                <InactivityFirstWarning />
                <InactivityFinalWarning />
                <DraftRecoveryModal />
              </InactivityProvider>
            </DraftProvider>
          </FeatureGateProvider>
        </AdProvider>
      </TrialProvider>
    </AuthProvider>
  );
}

export default App;