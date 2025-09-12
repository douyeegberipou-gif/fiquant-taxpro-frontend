import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calculator, TrendingUp, FileText, Info, Wallet, Receipt, PiggyBank, Home, Heart, Shield, Building2, Users, Briefcase, AlertTriangle, CreditCard, Banknote, Coins, Printer, LogIn, LogOut, User, Settings } from 'lucide-react';
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
import { AuthModal } from './components/AuthModal';
import { UserProfile } from './components/UserProfile';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminSetup } from './components/admin/AdminSetup';
import TermsAndConditions from './components/TermsAndConditions';
import { generatePayeReport, generateBulkPayeReport, generateCitReport } from './utils/pdfGenerator';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function AppContent() {
  const { user, logout, isAuthenticated } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null); // 'verifying', 'success', 'error'
  const [verificationMessage, setVerificationMessage] = useState('');
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  
  // Check for admin setup route
  if (window.location.pathname === '/admin-setup') {
    return <AdminSetup />;
  }
  
  // Existing state variables
  const [taxInput, setTaxInput] = useState({
    // Staff Information
    staff_name: '',
    month: '',
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
  
  // Terms and Conditions Acceptance State
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [citTermsAccepted, setCitTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    fetchTaxBrackets();
    fetchHistory();
    fetchCitInfo();
    fetchCitHistory();
    
    // Check for email verification on page load
    const urlParams = new URLSearchParams(window.location.search);
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
        if (key === 'staff_name' || key === 'month' || key === 'state_of_residence') {
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
      month: '',
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
        
        <Tabs defaultValue="calculator" className="space-y-6">
          <div className="relative">
            <TabsList className="grid w-full grid-cols-6 bg-transparent border-0 p-0 h-auto">
              <TabsTrigger 
                value="calculator" 
                className="relative bg-gradient-to-r from-gray-200 to-gray-300 border-0 px-6 py-3 mx-0 text-gray-700 font-medium transform skew-x-12 hover:from-gray-300 hover:to-gray-400 data-[state=active]:from-white data-[state=active]:to-gray-100 data-[state=active]:text-black data-[state=active]:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
                style={{
                  clipPath: 'polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)',
                  marginRight: '-10px',
                  zIndex: 1
                }}
              >
                <Users className="h-4 w-4 transform -skew-x-12" />
                <span className="transform -skew-x-12">PAYE</span>
              </TabsTrigger>
              <TabsTrigger 
                value="cit" 
                className="relative bg-gradient-to-r from-gray-200 to-gray-300 border-0 px-6 py-3 mx-0 text-gray-700 font-medium transform skew-x-12 hover:from-gray-300 hover:to-gray-400 data-[state=active]:from-white data-[state=active]:to-gray-100 data-[state=active]:text-black data-[state=active]:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
                style={{
                  clipPath: 'polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)',
                  marginRight: '-10px',
                  zIndex: 2
                }}
              >
                <Building2 className="h-4 w-4 transform -skew-x-12" />
                <span className="transform -skew-x-12">CIT</span>
              </TabsTrigger>
              <TabsTrigger 
                value="brackets" 
                className="relative bg-gradient-to-r from-gray-200 to-gray-300 border-0 px-6 py-3 mx-0 text-gray-700 font-medium transform skew-x-12 hover:from-gray-300 hover:to-gray-400 data-[state=active]:from-white data-[state=active]:to-gray-100 data-[state=active]:text-black data-[state=active]:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
                style={{
                  clipPath: 'polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)',
                  marginRight: '-10px',
                  zIndex: 3
                }}
              >
                <TrendingUp className="h-4 w-4 transform -skew-x-12" />
                <span className="transform -skew-x-12">Tax Info</span>
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="relative bg-gradient-to-r from-gray-200 to-gray-300 border-0 px-6 py-3 mx-0 text-gray-700 font-medium transform skew-x-12 hover:from-gray-300 hover:to-gray-400 data-[state=active]:from-white data-[state=active]:to-gray-100 data-[state=active]:text-black data-[state=active]:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
                style={{
                  clipPath: 'polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)',
                  marginRight: '-10px',
                  zIndex: 4
                }}
              >
                <FileText className="h-4 w-4 transform -skew-x-12" />
                <span className="transform -skew-x-12">History</span>
              </TabsTrigger>
              {isAuthenticated() && (
                <TabsTrigger 
                  value="profile" 
                  className="relative bg-gradient-to-r from-gray-200 to-gray-300 border-0 px-6 py-3 mx-0 text-gray-700 font-medium transform skew-x-12 hover:from-gray-300 hover:to-gray-400 data-[state=active]:from-white data-[state=active]:to-gray-100 data-[state=active]:text-black data-[state=active]:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
                  style={{
                    clipPath: 'polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)',
                    marginRight: '-10px',
                    zIndex: 5
                  }}
                >
                  <User className="h-4 w-4 transform -skew-x-12" />
                  <span className="transform -skew-x-12">Profile</span>
                </TabsTrigger>
              )}
              <TabsTrigger 
                value="compliance" 
                className="relative bg-gradient-to-r from-gray-200 to-gray-300 border-0 px-6 py-3 mx-0 text-gray-700 font-medium transform skew-x-12 hover:from-gray-300 hover:to-gray-400 data-[state=active]:from-white data-[state=active]:to-gray-100 data-[state=active]:text-black data-[state=active]:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
                style={{
                  clipPath: 'polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)',
                  zIndex: 6
                }}
              >
                <Briefcase className="h-4 w-4 transform -skew-x-12" />
                <span className="transform -skew-x-12">Compliance</span>
              </TabsTrigger>
            </TabsList>
          </div>

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
                      payeMode === 'single' ? 'bg-emerald-600 hover:bg-emerald-700' : ''
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
                      payeMode === 'bulk' ? 'bg-blue-600 hover:bg-blue-700' : ''
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
                      Staff Information
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
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
                    </div>
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

                  {/* Terms and Conditions Acceptance */}
                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    <div className="flex items-start space-x-2">
                      <input
                        type="checkbox"
                        id="terms-paye"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      />
                      <Label htmlFor="terms-paye" className="text-sm text-gray-700 cursor-pointer">
                        I accept Fiquant's{' '}
                        <button
                          type="button"
                          onClick={() => setShowTerms(true)}
                          className="text-emerald-600 hover:text-emerald-800 underline"
                        >
                          Terms and Conditions
                        </button>
                      </Label>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-xs text-amber-800 flex items-start">
                        <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Disclaimer:</strong> This computation is for guidance purposes only. 
                          Tax calculations are estimates based on current Nigerian tax laws. 
                          Please consult with a qualified tax professional or chartered accountant 
                          to verify accuracy and ensure full compliance with tax regulations.
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button 
                      onClick={calculateTax} 
                      disabled={loading || !taxInput.basic_salary || !termsAccepted}
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
                      <Button
                        onClick={() => generatePayeReport(taxInput, result)}
                        className="w-full bg-gray-900 hover:bg-gray-800 text-white flex items-center justify-center space-x-2"
                      >
                        <Printer className="h-4 w-4" />
                        <span>Print Report (PDF)</span>
                      </Button>
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
              citTermsAccepted={citTermsAccepted}
              setCitTermsAccepted={setCitTermsAccepted}
              setShowTerms={setShowTerms}
            />
          </TabsContent>

          {/* Tax Information Tab */}
          <TabsContent value="brackets">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* PAYE Information */}
              {taxBrackets && (
                <div className="space-y-6">
                  <Card className="bg-white border-emerald-100 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Users className="h-5 w-5 text-emerald-600" />
                        <span>PAYE Tax Brackets 2026</span>
                      </CardTitle>
                      <CardDescription>
                        Personal income tax rates
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-3">
                        {taxBrackets.brackets.map((bracket, index) => (
                          <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{bracket.range}</p>
                              <p className="text-sm text-gray-600">{bracket.description}</p>
                            </div>
                            <Badge variant={index === 0 ? "secondary" : "outline"} className="text-lg px-3 py-1">
                              {bracket.rate}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-emerald-100 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Shield className="h-5 w-5 text-emerald-600" />
                        <span>PAYE Tax Reliefs</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {Object.entries(taxBrackets.reliefs).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center">
                          <span className="text-gray-700 capitalize">{key.replace('_', ' ')}</span>
                          <span className="font-medium text-emerald-600">{value}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* CIT Information */}
{citInfo && (
                <div className="space-y-6">
                  <Card className="bg-white border-blue-100 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Building2 className="h-5 w-5 text-blue-600" />
                        <span>Corporate Income Tax 2026</span>
                      </CardTitle>
                      <CardDescription>
                        Company tax rates and classifications
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-3">
                        {Object.entries(citInfo.company_classifications).map(([size, info]) => (
                          <div key={size} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-gray-900 capitalize">{size} Companies</h4>
                              <Badge variant="outline" className="text-sm">
                                CIT: {info.cit_rate}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{info.criteria}</p>
                            <p className="text-xs text-blue-600">Development Levy: {info.development_levy}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-blue-100 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-blue-600" />
                        <span>Thin Capitalization Rules</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Interest Deduction Limit</span>
                        <span className="font-medium text-blue-600">{citInfo.thin_capitalization.interest_deduction_limit}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Applies To</span>
                        <span className="font-medium text-blue-600">{citInfo.thin_capitalization.applies_to}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Excess Treatment</span>
                        <span className="font-medium text-red-600">{citInfo.thin_capitalization.excess_treatment}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* WHT Information */}
              <div className="space-y-6">
                <Card className="bg-white border-orange-100 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5 text-orange-600" />
                      <span>Withholding Tax (WHT) 2026</span>
                    </CardTitle>
                    <CardDescription>
                      Current WHT rates for various transactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3">
                      <div className="p-4 bg-orange-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-orange-900">Dividends & Interest</h4>
                          <Badge variant="outline" className="text-sm text-orange-700 border-orange-300">
                            10%
                          </Badge>
                        </div>
                        <p className="text-sm text-orange-700">Both resident and non-resident recipients</p>
                      </div>
                      
                      <div className="p-4 bg-orange-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-orange-900">Rent & Lease Payments</h4>
                          <Badge variant="outline" className="text-sm text-orange-700 border-orange-300">
                            10%
                          </Badge>
                        </div>
                        <p className="text-sm text-orange-700">All rent, hire, or lease transactions</p>
                      </div>

                      <div className="p-4 bg-orange-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-orange-900">Professional Services</h4>
                          <div className="text-right">
                            <Badge variant="outline" className="text-sm text-orange-700 border-orange-300 mb-1">
                              5% Resident
                            </Badge>
                            <br />
                            <Badge variant="outline" className="text-sm text-orange-700 border-orange-300">
                              10% Non-Resident
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-orange-700">Consultancy, technical, management fees</p>
                      </div>

                      <div className="p-4 bg-orange-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-orange-900">Goods & Construction</h4>
                          <Badge variant="outline" className="text-sm text-orange-700 border-orange-300">
                            2-5%
                          </Badge>
                        </div>
                        <p className="text-sm text-orange-700">Supply of goods, construction contracts</p>
                      </div>

                      <div className="p-4 bg-orange-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-orange-900">Royalties</h4>
                          <div className="text-right">
                            <Badge variant="outline" className="text-sm text-orange-700 border-orange-300 mb-1">
                              10% Corporate
                            </Badge>
                            <br />
                            <Badge variant="outline" className="text-sm text-orange-700 border-orange-300">
                              5% Non-Corporate
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-orange-700">Intellectual property, licensing</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-orange-100 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      <span>WHT Key Requirements</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Deduction Timing</span>
                      <span className="font-medium text-orange-600">At payment or when due</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">FIRS Remittance</span>
                      <span className="font-medium text-orange-600">By 21st of following month</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">SIRS Remittance</span>
                      <span className="font-medium text-orange-600">By 30th of following month</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Late Payment Penalty</span>
                      <span className="font-medium text-red-600">10% per annum + interest</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Non-Deduction Fine</span>
                      <span className="font-medium text-red-600">10% of undeducted amount</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* PAYE History */}
              <Card className="bg-white border-emerald-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-emerald-600" />
                    <span>PAYE Calculations</span>
                  </CardTitle>
                  <CardDescription>
                    Recent personal tax calculations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {history.length > 0 ? (
                    <div className="space-y-4">
                      {history.map((calc, index) => (
                        <div key={calc.id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <p className="font-medium">
                                Monthly Gross: {formatCurrency(calc.monthly_gross_income)}
                              </p>
                              <p className="text-sm text-gray-600">
                                Tax: {formatCurrency(calc.monthly_tax)} | 
                                Net: {formatCurrency(calc.monthly_net_income)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(calc.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <Badge variant="outline">
                              PAYE
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No PAYE calculations yet.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* CIT History */}
              <Card className="bg-white border-blue-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <span>CIT Calculations</span>
                  </CardTitle>
                  <CardDescription>
                    Recent corporate tax calculations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {citHistory.length > 0 ? (
                    <div className="space-y-4">
                      {citHistory.map((calc, index) => (
                        <div key={calc.id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <p className="font-medium">{calc.company_name}</p>
                              <p className="text-sm text-gray-600">
                                Profit: {formatCurrency(calc.taxable_profit)} | 
                                Tax: {formatCurrency(calc.total_tax_due)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(calc.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <Badge variant="outline">
                              {calc.company_size}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No CIT calculations yet.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* WHT Information */}
              <div className="space-y-6">
                <Card className="bg-white border-orange-100 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5 text-orange-600" />
                      <span>Withholding Tax (WHT) 2026</span>
                    </CardTitle>
                    <CardDescription>
                      Current WHT rates for various transactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3">
                      <div className="p-4 bg-orange-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-orange-900">Dividends & Interest</h4>
                          <Badge variant="outline" className="text-sm text-orange-700 border-orange-300">
                            10%
                          </Badge>
                        </div>
                        <p className="text-sm text-orange-700">Both resident and non-resident recipients</p>
                      </div>
                      
                      <div className="p-4 bg-orange-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-orange-900">Rent & Lease Payments</h4>
                          <Badge variant="outline" className="text-sm text-orange-700 border-orange-300">
                            10%
                          </Badge>
                        </div>
                        <p className="text-sm text-orange-700">All rent, hire, or lease transactions</p>
                      </div>

                      <div className="p-4 bg-orange-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-orange-900">Professional Services</h4>
                          <div className="text-right">
                            <Badge variant="outline" className="text-sm text-orange-700 border-orange-300 mb-1">
                              5% Resident
                            </Badge>
                            <br />
                            <Badge variant="outline" className="text-sm text-orange-700 border-orange-300">
                              10% Non-Resident
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-orange-700">Consultancy, technical, management fees</p>
                      </div>

                      <div className="p-4 bg-orange-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-orange-900">Goods & Construction</h4>
                          <Badge variant="outline" className="text-sm text-orange-700 border-orange-300">
                            2-5%
                          </Badge>
                        </div>
                        <p className="text-sm text-orange-700">Supply of goods, construction contracts</p>
                      </div>

                      <div className="p-4 bg-orange-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-orange-900">Royalties</h4>
                          <div className="text-right">
                            <Badge variant="outline" className="text-sm text-orange-700 border-orange-300 mb-1">
                              10% Corporate
                            </Badge>
                            <br />
                            <Badge variant="outline" className="text-sm text-orange-700 border-orange-300">
                              5% Non-Corporate
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-orange-700">Intellectual property, licensing</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-orange-100 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      <span>WHT Key Requirements</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Deduction Timing</span>
                      <span className="font-medium text-orange-600">At payment or when due</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">FIRS Remittance</span>
                      <span className="font-medium text-orange-600">By 21st of following month</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">SIRS Remittance</span>
                      <span className="font-medium text-orange-600">By 30th of following month</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Late Payment Penalty</span>
                      <span className="font-medium text-red-600">10% per annum + interest</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Non-Deduction Fine</span>
                      <span className="font-medium text-red-600">10% of undeducted amount</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance">
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
          </TabsContent>

          {/* Profile Tab */}
          {isAuthenticated() && (
            <TabsContent value="profile" className="space-y-6">
              <UserProfile />
            </TabsContent>
          )}
        </Tabs>
      </div>
      
      {/* Authentication Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />

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
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;