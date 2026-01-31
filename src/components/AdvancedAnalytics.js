import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  TrendingUp, 
  TrendingDown,
  PieChart,
  BarChart3,
  LineChart,
  AlertCircle,
  CheckCircle,
  Lock,
  Calendar,
  Filter,
  Download,
  Lightbulb,
  Target,
  Wallet,
  Shield,
  ArrowRight,
  ChevronRight,
  Info,
  Zap,
  Building2,
  Calculator,
  FileText,
  Receipt,
  Scale,
  Briefcase,
  Home,
  Percent
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFeatureGate } from '../contexts/FeatureGateContext';

// Tax-type specific configuration for savings opportunities and insights
const TAX_TYPE_CONFIG = {
  paye: {
    label: 'PAYE',
    color: 'gray',
    savingsTitle: 'Personal Tax Savings',
    savingsDescription: 'Optimize your personal income tax through available reliefs and allowances',
    opportunities: [
      { name: 'Pension Contribution', description: '8% of pensionable earnings is fully deductible', maxSavings: 'Up to 24% tax reduction' },
      { name: 'NHF Contribution', description: '2.5% of basic salary contribution to National Housing Fund', maxSavings: 'Reduces taxable income' },
      { name: 'Mortgage Interest Relief', description: 'Interest on loans for owner-occupied residential property', maxSavings: 'Up to ₦500,000 annually' },
      { name: 'Life Insurance Premium', description: 'Premiums on life insurance policies', maxSavings: 'Full deduction on qualifying policies' },
      { name: 'NHIS Contribution', description: 'National Health Insurance Scheme contributions', maxSavings: 'Tax-deductible' },
    ],
    insights: [
      { type: 'tip', message: 'Maximize your pension contributions to the statutory 8% - this provides guaranteed tax relief.' },
      { type: 'info', message: 'Consider voluntary pension contributions (AVC) above the mandatory amount for additional relief.' },
      { type: 'tip', message: 'If you have a mortgage, ensure mortgage interest relief is claimed - many employees miss this.' },
    ]
  },
  cit: {
    label: 'Corporate Income Tax',
    color: 'blue',
    savingsTitle: 'Corporate Tax Optimization',
    savingsDescription: 'Reduce your corporate tax burden through legitimate deductions and incentives',
    opportunities: [
      { name: 'Loss Relief', description: 'Carry forward unrelieved losses to offset future profits (up to 4 years)', maxSavings: 'Up to 30% of assessable profits' },
      { name: 'WHT Credit Deductions', description: 'Withholding tax credits on payments received can offset CIT liability', maxSavings: 'Full credit against CIT' },
      { name: 'Capital Allowances', description: 'Initial and annual allowances on qualifying capital expenditure', maxSavings: 'Up to 95% in first year for plant/machinery' },
      { name: 'Investment Allowances', description: 'Additional 10% allowance on qualifying plant and machinery', maxSavings: '10% extra deduction' },
      { name: 'Pioneer Status Relief', description: 'Tax holiday for companies in pioneer industries', maxSavings: '3-5 years tax exemption' },
    ],
    insights: [
      { type: 'tip', message: 'Review all WHT deducted at source - ensure you claim full credits against your CIT liability.' },
      { type: 'info', message: 'Time major capital purchases strategically to maximize initial capital allowances.' },
      { type: 'warning', message: 'Loss relief is limited to 50% of total profits - plan profit recognition accordingly.' },
    ]
  },
  vat: {
    label: 'Value Added Tax',
    color: 'purple',
    savingsTitle: 'VAT Optimization',
    savingsDescription: 'Minimize VAT exposure through proper input VAT management and exemption awareness',
    opportunities: [
      { name: 'Input VAT Recovery', description: 'Claim input VAT on all business purchases with valid tax invoices', maxSavings: 'Up to 7.5% recovery on inputs' },
      { name: 'Zero-Rated Supplies', description: 'Export sales and certain goods (NTA 2025) attract 0% VAT', maxSavings: 'Full input VAT refund eligibility' },
      { name: 'Exempt Supply Classification', description: 'Properly classify exempt supplies to avoid incorrect VAT charges', maxSavings: 'Avoid overcollection' },
      { name: 'Bad Debt Relief', description: 'Reclaim VAT on sales where payment is never received', maxSavings: 'Full recovery after 12 months' },
      { name: 'Partial Exemption Review', description: 'Optimize input VAT apportionment for mixed supplies', maxSavings: 'Maximize recoverable input VAT' },
    ],
    insights: [
      { type: 'tip', message: 'Maintain proper documentation for all input VAT - invalid tax invoices mean lost credits.' },
      { type: 'info', message: 'Under NTA 2025, many essential items are now zero-rated or exempt - review your supply classification.' },
      { type: 'warning', message: 'File VAT returns by the 21st of the following month to avoid penalties.' },
    ]
  },
  cgt: {
    label: 'Capital Gains Tax',
    color: 'orange',
    savingsTitle: 'CGT Planning',
    savingsDescription: 'Legally minimize or defer capital gains tax on asset disposals',
    opportunities: [
      { name: 'Individual Exemption', description: 'Proceeds ≤₦2M and gain ≤₦500K are exempt for individuals', maxSavings: 'Full CGT exemption on small disposals' },
      { name: 'Rollover Relief', description: 'Defer CGT by reinvesting proceeds into similar qualifying assets', maxSavings: 'Defer 100% of CGT liability' },
      { name: 'Cost Base Optimization', description: 'Include all allowable costs (improvements, professional fees) in cost base', maxSavings: 'Reduce chargeable gain' },
      { name: 'Timing of Disposal', description: 'Structure timing to stay within annual exemption thresholds', maxSavings: 'Utilize annual exemptions' },
      { name: 'Asset Structuring', description: 'Consider holding period and ownership structure', maxSavings: 'Optimize effective rate' },
    ],
    insights: [
      { type: 'tip', message: 'Keep detailed records of acquisition costs and improvements - these reduce your chargeable gain.' },
      { type: 'info', message: 'Companies pay flat 30% CGT with no exemptions - individual ownership may be more tax-efficient for some assets.' },
      { type: 'warning', message: 'CGT on Nigerian company shares is 10% under NTA 2025 - different from other assets.' },
    ]
  },
  all: {
    label: 'All Taxes',
    color: 'gray',
    savingsTitle: 'Tax Optimization Overview',
    savingsDescription: 'Comprehensive view of tax savings opportunities across all tax types',
    opportunities: [],
    insights: [
      { type: 'info', message: 'Select a specific tax type filter to see detailed savings opportunities.' },
      { type: 'tip', message: 'Each tax type has unique deductions and reliefs - review each category individually.' },
    ]
  }
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AdvancedAnalytics = () => {
  const { user, isAuthenticated } = useAuth();
  const { hasFeature, getUserTier } = useFeatureGate();
  
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [error, setError] = useState('');
  const [showSavingsDetails, setShowSavingsDetails] = useState(false);
  
  // Filter states
  const [dateRange, setDateRange] = useState('year');
  const [customDateStart, setCustomDateStart] = useState('');
  const [customDateEnd, setCustomDateEnd] = useState('');
  const [taxType, setTaxType] = useState('all');
  const [incomeSource, setIncomeSource] = useState('all');

  const canAccess = hasFeature('advanced_analytics');
  const userTier = getUserTier();

  useEffect(() => {
    if (canAccess && isAuthenticated()) {
      fetchAnalyticsData();
    } else {
      setLoading(false);
    }
  }, [canAccess, dateRange, taxType, incomeSource, customDateStart, customDateEnd]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(''); // Clear any previous error
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No auth token found');
        setError('Authentication required. Please log in again.');
        return;
      }
      
      const params = new URLSearchParams({
        date_range: dateRange,
        tax_type: taxType,
        income_source: incomeSource
      });
      
      if (dateRange === 'custom' && customDateStart && customDateEnd) {
        params.append('start_date', customDateStart);
        params.append('end_date', customDateEnd);
      }
      
      console.log('Fetching analytics with params:', params.toString());
      
      const response = await axios.get(
        `${BACKEND_URL}/api/analytics/dashboard?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Analytics API response:', response.data);
      
      if (response.data && response.data.summary) {
        setAnalyticsData(response.data);
        setError('');
      } else {
        console.warn('Analytics API returned unexpected format:', response.data);
        setError('Unexpected response format from analytics API');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      console.error('Error details:', err.response?.data || err.message);
      
      if (err.response?.status === 403) {
        setError('Access denied. Please ensure you have Premium or Enterprise tier, or are logged in as an admin.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError('Failed to load analytics data. Please try refreshing the page.');
      }
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format) => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        format,
        date_range: dateRange,
        tax_type: taxType
      });
      
      const response = await axios.get(
        `${BACKEND_URL}/api/analytics/export?${params.toString()}`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tax-analytics-report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export report');
    }
  };

  const formatCurrency = (amount) => {
    // Handle NaN, null, undefined
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '₦0';
    }
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercent = (value) => {
    // Handle NaN, null, undefined, Infinity
    if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
      return '0.0%';
    }
    return `${(value * 100).toFixed(1)}%`;
  };

  // Safe number helper
  const safeNum = (val, defaultVal = 0) => {
    if (val === null || val === undefined || isNaN(val)) {
      return defaultVal;
    }
    return Number(val);
  };

  // Locked Dashboard Component
  const LockedDashboard = () => (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics</h1>
              <p className="text-sm text-gray-500">Intelligent tax insights and optimization</p>
            </div>
          </div>
        </div>
      </div>

      {/* Locked Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center max-w-2xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
            <Lock className="h-10 w-10 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Unlock Advanced Analytics</h2>
          <p className="text-gray-600 mb-8">
            Get intelligent insights into your tax computations, discover unused reliefs, 
            and see exactly how much tax you could save with our Advanced Analytics dashboard.
          </p>
          
          {/* Feature Preview Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                <Target className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Relief Optimization</h3>
              <p className="text-sm text-gray-500">Discover reliefs you qualify for but haven't used</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Tax Trends</h3>
              <p className="text-sm text-gray-500">Visualize your tax payments over time</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center mx-auto mb-3">
                <Lightbulb className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Smart Recommendations</h3>
              <p className="text-sm text-gray-500">Actionable steps to reduce your tax burden</p>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-xl border border-amber-200">
            <p className="text-amber-800 font-medium mb-4">
              Advanced Analytics is available for Premium subscribers
            </p>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white">
              Upgrade to Premium
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Loading State
  const LoadingState = () => (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200 bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-60 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-28 bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-80 bg-gray-100 rounded-lg animate-pulse"></div>
          <div className="h-80 bg-gray-100 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  // Info Box Component
  const InfoBox = ({ type = 'info', title, children }) => {
    const styles = {
      info: 'border-l-4 border-l-gray-900 bg-gray-50',
      warning: 'border-l-4 border-l-amber-500 bg-amber-50/50',
      success: 'border-l-4 border-l-emerald-500 bg-emerald-50/50',
      gold: 'border-l-4 border-l-amber-400 bg-gradient-to-r from-amber-50 to-white'
    };
    
    return (
      <div className={`${styles[type]} rounded-r-lg p-4`}>
        {title && <p className="font-medium text-gray-900 mb-1">{title}</p>}
        <div className="text-sm text-gray-700">{children}</div>
      </div>
    );
  };

  // KPI Card Component
  const KPICard = ({ title, value, subtitle, trend, trendValue, icon: Icon, color = 'gray' }) => {
    const colorStyles = {
      gray: 'bg-gray-900 text-white',
      emerald: 'bg-emerald-600 text-white',
      amber: 'bg-amber-500 text-white',
      blue: 'bg-blue-600 text-white',
      red: 'bg-red-500 text-white'
    };

    return (
      <Card className="border border-gray-200 shadow-none">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className={`w-10 h-10 rounded-lg ${colorStyles[color]} flex items-center justify-center`}>
              <Icon className="h-5 w-5" />
            </div>
            {trend && (
              <Badge className={`text-xs ${trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'} border-0`}>
                {trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {trendValue}
              </Badge>
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500 mt-1">{title}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </CardContent>
      </Card>
    );
  };

  // Insight Card Component
  const InsightCard = ({ type, message, impact }) => {
    const icons = {
      info: Info,
      warning: AlertCircle,
      success: CheckCircle,
      tip: Lightbulb
    };
    const colors = {
      info: 'border-blue-200 bg-blue-50/50',
      warning: 'border-amber-200 bg-amber-50/50',
      success: 'border-emerald-200 bg-emerald-50/50',
      tip: 'border-purple-200 bg-purple-50/50'
    };
    const Icon = icons[type] || Info;

    return (
      <div className={`p-4 rounded-lg border ${colors[type]} flex items-start gap-3`}>
        <Icon className={`h-5 w-5 mt-0.5 ${type === 'warning' ? 'text-amber-600' : type === 'success' ? 'text-emerald-600' : type === 'tip' ? 'text-purple-600' : 'text-blue-600'}`} />
        <div className="flex-1">
          <p className="text-sm text-gray-700">{message}</p>
          {impact && <p className="text-xs text-gray-500 mt-1">Impact: {impact}</p>}
        </div>
      </div>
    );
  };

  // Recommendation Card Component  
  const RecommendationCard = ({ title, description, savings, effort, compliance }) => (
    <div className="p-4 border border-gray-200 rounded-lg hover:border-amber-300 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900">{title}</h4>
        <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">
          Save {formatCurrency(savings)}
        </Badge>
      </div>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <div className="flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1 text-gray-500">
          <Zap className="h-3 w-3" />
          Effort: {effort}
        </span>
        <span className="flex items-center gap-1 text-gray-500">
          <Shield className="h-3 w-3" />
          {compliance}
        </span>
      </div>
    </div>
  );

  // Simple Bar Chart Component
  const SimpleBarChart = ({ data, title }) => {
    if (!data || data.length === 0) {
      return (
        <Card className="border border-gray-200 shadow-none">
          <CardHeader className="border-b border-gray-100 py-3">
            <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No data available for selected filters</p>
            </div>
          </CardContent>
        </Card>
      );
    }
    const maxValue = Math.max(...data.map(d => safeNum(d.value)));
    if (maxValue === 0) {
      return (
        <Card className="border border-gray-200 shadow-none">
          <CardHeader className="border-b border-gray-100 py-3">
            <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No tax data for selected period</p>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <Card className="border border-gray-200 shadow-none">
        <CardHeader className="border-b border-gray-100 py-3">
          <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            {data.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-medium text-gray-900">{formatCurrency(safeNum(item.value))}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-gray-800 to-gray-600 rounded-full transition-all duration-500"
                    style={{ width: `${maxValue > 0 ? (safeNum(item.value) / maxValue) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Donut Chart Component
  const DonutChart = ({ data, title, centerLabel }) => {
    if (!data || data.length === 0) {
      return (
        <Card className="border border-gray-200 shadow-none">
          <CardHeader className="border-b border-gray-100 py-3">
            <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-center py-8 text-gray-500">
              <PieChart className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No deductions data available</p>
            </div>
          </CardContent>
        </Card>
      );
    }
    const total = data.reduce((sum, d) => sum + safeNum(d.value), 0);
    if (total === 0) {
      return (
        <Card className="border border-gray-200 shadow-none">
          <CardHeader className="border-b border-gray-100 py-3">
            <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-center py-8 text-gray-500">
              <PieChart className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No reliefs claimed for selected period</p>
            </div>
          </CardContent>
        </Card>
      );
    }
    const colors = ['#1f2937', '#d97706', '#059669', '#2563eb', '#7c3aed', '#dc2626'];
    
    let cumulativePercent = 0;
    
    return (
      <Card className="border border-gray-200 shadow-none">
        <CardHeader className="border-b border-gray-100 py-3">
          <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-center gap-6">
            {/* SVG Donut */}
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {data.map((item, index) => {
                  const percent = total > 0 ? (safeNum(item.value) / total) * 100 : 0;
                  const dashArray = `${percent} ${100 - percent}`;
                  const dashOffset = -cumulativePercent;
                  cumulativePercent += percent;
                  
                  return (
                    <circle
                      key={index}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={colors[index % colors.length]}
                      strokeWidth="20"
                      strokeDasharray={dashArray}
                      strokeDashoffset={dashOffset}
                      className="transition-all duration-500"
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(total)}</p>
                  <p className="text-xs text-gray-500">{centerLabel}</p>
                </div>
              </div>
            </div>
            {/* Legend */}
            <div className="flex-1 space-y-2">
              {data.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: colors[index % colors.length] }}
                    />
                    <span className="text-gray-600">{item.label}</span>
                  </div>
                  <span className="font-medium text-gray-900">{total > 0 ? formatPercent(safeNum(item.value) / total) : '0%'}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Main Dashboard Render
  if (!canAccess) {
    return <LockedDashboard />;
  }

  if (loading) {
    return <LoadingState />;
  }

  // Use actual data from API - no mock data
  const data = analyticsData || {
    summary: {
      total_tax_paid: 0,
      effective_tax_rate: 0,
      total_reliefs_used: 0,
      potential_savings: 0,
      avoidable_tax: 0,
      unavoidable_tax: 0,
      calculation_count: 0
    },
    tax_by_type: [],
    tax_over_time: [],
    deductions_breakdown: [],
    reliefs_analysis: {
      used: [],
      unused: [],
      total_unused_value: 0
    },
    insights: [],
    recommendations: []
  };

  // Check if user has any data
  const hasData = data.summary.calculation_count > 0 || data.summary.total_tax_paid > 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Black with white text like History */}
      <div className="bg-white rounded-t-2xl shadow-sm border border-gray-100 overflow-hidden mx-4 mt-4">
        <div className="bg-gradient-to-r from-gray-900 to-black text-white px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-yellow-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Advanced Analytics</h1>
                <p className="text-sm text-gray-300">Intelligent tax insights and optimization</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportReport('pdf')}
                className="border-gray-600 bg-transparent text-white hover:bg-white/10"
              >
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportReport('xlsx')}
                className="border-gray-600 bg-transparent text-white hover:bg-white/10"
              >
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Filters:</span>
            </div>
            
            {/* Date Range */}
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
              <option value="custom">Custom Range</option>
            </select>

            {dateRange === 'custom' && (
              <>
                <input
                  type="date"
                  value={customDateStart}
                  onChange={(e) => setCustomDateStart(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="date"
                  value={customDateEnd}
                  onChange={(e) => setCustomDateEnd(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg"
                />
              </>
            )}

            {/* Tax Type */}
            <select 
              value={taxType}
              onChange={(e) => setTaxType(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="all">All Tax Types</option>
              <option value="paye">PAYE</option>
              <option value="vat">VAT</option>
              <option value="wht">Withholding Tax</option>
              <option value="cgt">Capital Gains Tax</option>
              <option value="cit">Corporate Income Tax</option>
            </select>

            {/* Income Source */}
            <select 
              value={incomeSource}
              onChange={(e) => setIncomeSource(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="all">All Sources</option>
              <option value="employment">Employment</option>
              <option value="business">Business</option>
              <option value="investment">Investment</option>
            </select>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={fetchAnalyticsData}
              className="text-gray-600"
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Error State */}
        {error && (
          <InfoBox type="warning" title="Data Unavailable">
            {error}
          </InfoBox>
        )}

        {/* No Data State - Show when API succeeds but returns zeros */}
        {!error && !loading && data.summary.calculation_count === 0 && data.summary.total_tax_paid === 0 && (
          <InfoBox type="info" title="No Tax Calculations Yet">
            Your analytics will appear here once you perform tax calculations while logged in. 
            Go to the PAYE calculator and run a calculation to start seeing your personalized tax insights.
          </InfoBox>
        )}

        {/* KPI Cards - Tax Type Aware */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <KPICard 
            title={taxType === 'all' ? "Total Tax Paid" : `Total ${TAX_TYPE_CONFIG[taxType]?.label || taxType.toUpperCase()} Paid`}
            value={formatCurrency(data.summary.total_tax_paid)}
            subtitle="Selected period"
            icon={Wallet}
            color="gray"
          />
          <KPICard 
            title="Effective Tax Rate"
            value={formatPercent(data.summary.effective_tax_rate)}
            subtitle={taxType === 'vat' ? "VAT rate is fixed at 7.5%" : "Avg. across income"}
            trend={taxType !== 'vat' && data.summary.effective_tax_rate > 0.15 ? 'up' : taxType !== 'vat' ? 'down' : undefined}
            trendValue={taxType !== 'vat' ? (data.summary.effective_tax_rate > 0.15 ? 'High' : 'Optimal') : undefined}
            icon={TrendingUp}
            color="blue"
          />
          {/* Reliefs Claimed - Show for PAYE, different metrics for other types */}
          {(taxType === 'all' || taxType === 'paye') ? (
            <KPICard 
              title="Reliefs Claimed"
              value={formatCurrency(data.summary.total_reliefs_used)}
              subtitle="Personal tax reliefs"
              icon={Shield}
              color="emerald"
            />
          ) : taxType === 'cit' ? (
            <KPICard 
              title="Calculations"
              value={data.summary.calculation_count}
              subtitle="CIT computations"
              icon={Calculator}
              color="emerald"
            />
          ) : taxType === 'vat' ? (
            <KPICard 
              title="VAT Transactions"
              value={data.summary.calculation_count}
              subtitle="VAT calculations"
              icon={Receipt}
              color="emerald"
            />
          ) : taxType === 'cgt' ? (
            <KPICard 
              title="Disposals"
              value={data.summary.calculation_count}
              subtitle="Asset disposals"
              icon={Scale}
              color="emerald"
            />
          ) : (
            <KPICard 
              title="Calculations"
              value={data.summary.calculation_count}
              subtitle="Total computations"
              icon={Calculator}
              color="emerald"
            />
          )}
          {/* Potential Savings - Context aware */}
          {(taxType === 'all' || taxType === 'paye') && data.summary.potential_savings > 0 ? (
            <KPICard 
              title="Potential Savings"
              value={formatCurrency(data.summary.potential_savings)}
              subtitle="From unused reliefs"
              icon={Target}
              color="amber"
            />
          ) : (
            <KPICard 
              title="Tax Optimization"
              value={TAX_TYPE_CONFIG[taxType]?.opportunities?.length > 0 ? `${TAX_TYPE_CONFIG[taxType].opportunities.length} Methods` : 'Available'}
              subtitle={taxType === 'cit' ? 'CIT reduction strategies' : taxType === 'vat' ? 'Input VAT recovery' : taxType === 'cgt' ? 'CGT relief options' : 'See opportunities below'}
              icon={Lightbulb}
              color="amber"
            />
          )}
        </div>

        {/* Tax Savings Opportunity Alert - Tax Type Aware */}
        {hasData && (
          <div className="mb-8 p-6 bg-gradient-to-r from-amber-50 via-amber-100/30 to-white rounded-xl border border-amber-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {TAX_TYPE_CONFIG[taxType]?.savingsTitle || 'Tax Savings Opportunity'}
                </h3>
                <p className="text-gray-700">
                  {/* PAYE-specific savings with numbers */}
                  {(taxType === 'all' || taxType === 'paye') && data.summary.potential_savings > 0 ? (
                    <>
                      You are eligible for <span className="font-bold text-amber-700">{formatCurrency(data.reliefs_analysis?.total_unused_value || data.summary.potential_savings)}</span> in additional reliefs. 
                      Applying them could reduce your tax by <span className="font-bold text-emerald-600">{formatCurrency(data.summary.potential_savings)}</span>.
                    </>
                  ) : (
                    TAX_TYPE_CONFIG[taxType]?.savingsDescription || 'Explore opportunities to optimize your tax position.'
                  )}
                </p>
              </div>
              <Button 
                className="bg-amber-600 hover:bg-amber-700 text-white flex-shrink-0"
                onClick={() => setShowSavingsDetails(!showSavingsDetails)}
              >
                {showSavingsDetails ? 'Hide Details' : 'View Details'}
                <ChevronRight className={`h-4 w-4 ml-1 transition-transform ${showSavingsDetails ? 'rotate-90' : ''}`} />
              </Button>
            </div>
            
            {/* Expandable Details Section - Tax Type Aware */}
            {showSavingsDetails && (
              <div className="mt-6 pt-6 border-t border-amber-200">
                <h4 className="font-semibold text-gray-900 mb-4">
                  {taxType === 'paye' || taxType === 'all' 
                    ? 'How to Maximize Your Tax Savings:' 
                    : `${TAX_TYPE_CONFIG[taxType]?.label || taxType.toUpperCase()} Optimization Strategies:`}
                </h4>
                
                {/* PAYE-specific unused reliefs from API */}
                {(taxType === 'all' || taxType === 'paye') && data.reliefs_analysis?.unused?.length > 0 && (
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    {data.reliefs_analysis.unused.map((relief, index) => (
                      <div key={index} className="p-4 bg-white rounded-lg border border-amber-100">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <Target className="h-4 w-4 text-amber-600" />
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900">{relief.name}</h5>
                            <p className="text-sm text-gray-600 mt-1">{relief.eligibility || 'Available for your income bracket'}</p>
                            <p className="text-sm font-medium text-amber-700 mt-2">
                              Potential savings: {formatCurrency(relief.amount * 0.18)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Tax-type specific opportunities */}
                {taxType !== 'all' && TAX_TYPE_CONFIG[taxType]?.opportunities?.length > 0 && (
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    {TAX_TYPE_CONFIG[taxType].opportunities.map((opp, index) => (
                      <div key={index} className="p-4 bg-white rounded-lg border border-gray-100">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            taxType === 'cit' ? 'bg-blue-100' : 
                            taxType === 'vat' ? 'bg-purple-100' : 
                            taxType === 'cgt' ? 'bg-orange-100' : 'bg-amber-100'
                          }`}>
                            {taxType === 'cit' ? <Building2 className="h-4 w-4 text-blue-600" /> :
                             taxType === 'vat' ? <Receipt className="h-4 w-4 text-purple-600" /> :
                             taxType === 'cgt' ? <Scale className="h-4 w-4 text-orange-600" /> :
                             <Target className="h-4 w-4 text-amber-600" />}
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900">{opp.name}</h5>
                            <p className="text-sm text-gray-600 mt-1">{opp.description}</p>
                            <p className={`text-sm font-medium mt-2 ${
                              taxType === 'cit' ? 'text-blue-700' : 
                              taxType === 'vat' ? 'text-purple-700' : 
                              taxType === 'cgt' ? 'text-orange-700' : 'text-amber-700'
                            }`}>
                              {opp.maxSavings}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Show message for 'all' filter */}
                {taxType === 'all' && (!data.reliefs_analysis?.unused?.length || data.reliefs_analysis.unused.length === 0) && (
                  <div className="text-center py-6 text-gray-500">
                    <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Select a specific tax type (PAYE, CIT, VAT, or CGT) to see detailed optimization strategies.</p>
                  </div>
                )}
                
                {/* Recommendations from API (if available) */}
                {data.recommendations?.length > 0 && (taxType === 'all' || taxType === 'paye') && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Recommended Actions:</h4>
                    <div className="space-y-3">
                      {data.recommendations.slice(0, 3).map((rec, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100">
                          <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-900">{rec.title}</p>
                            <p className="text-sm text-gray-600">{rec.description}</p>
                            {rec.savings > 0 && (
                              <p className="text-sm font-medium text-emerald-600 mt-1">
                                Est. savings: {formatCurrency(rec.savings)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <SimpleBarChart 
            data={data.tax_by_type}
            title="Tax Paid by Type"
          />
          <DonutChart 
            data={data.deductions_breakdown}
            title="Deductions Breakdown"
            centerLabel="Total Reliefs"
          />
        </div>

        {/* Avoidable vs Unavoidable Tax - Only show for PAYE */}
        {hasData && (taxType === 'all' || taxType === 'paye') && (
        <Card className="border border-gray-200 shadow-none mb-8">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Avoidable vs Unavoidable Tax Analysis
              <Badge className="bg-blue-100 text-blue-700 border-0 text-xs ml-2">PAYE</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Unavoidable Tax (Statutory minimum)</span>
                  <span className="font-medium text-gray-900">{formatCurrency(safeNum(data.summary.unavoidable_tax))}</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gray-600 rounded-full" 
                    style={{ width: `${data.summary.total_tax_paid > 0 ? (safeNum(data.summary.unavoidable_tax) / safeNum(data.summary.total_tax_paid)) * 100 : 0}%` }} 
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Tax you must pay based on your income level</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Avoidable Tax (Optimization opportunity)</span>
                  <span className="font-medium text-amber-600">{formatCurrency(safeNum(data.summary.avoidable_tax))}</span>
                </div>
                <div className="h-3 bg-amber-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full" 
                    style={{ width: `${data.summary.total_tax_paid > 0 ? (safeNum(data.summary.avoidable_tax) / safeNum(data.summary.total_tax_paid)) * 100 : 0}%` }} 
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Tax paid due to missed reliefs or suboptimal structuring</p>
              </div>
            </div>
            
            {data.reliefs_analysis?.unused?.length > 0 && (
              <InfoBox type="gold" title="Top Causes of Avoidable Tax">
                <ul className="space-y-1 mt-2">
                  {data.reliefs_analysis.unused.slice(0, 3).map((relief, index) => (
                    <li key={index}>• {relief.name}</li>
                  ))}
                </ul>
              </InfoBox>
            )}
          </CardContent>
        </Card>
        )}

        {/* CIT Analysis Section - Enhanced with savings opportunities */}
        {hasData && taxType === 'cit' && (
          <Card className="border border-blue-200 shadow-none mb-8">
            <CardHeader className="border-b border-blue-100 bg-blue-50/30">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                Corporate Income Tax Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 uppercase tracking-wide mb-1">Total CIT Paid</p>
                  <p className="text-2xl font-bold text-blue-900">{formatCurrency(data.summary.total_tax_paid)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Calculations</p>
                  <p className="text-2xl font-bold text-gray-900">{data.summary.calculation_count}</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-lg">
                  <p className="text-xs text-emerald-600 uppercase tracking-wide mb-1">Effective Rate</p>
                  <p className="text-2xl font-bold text-emerald-900">{(safeNum(data.summary.effective_tax_rate) * 100).toFixed(1)}%</p>
                </div>
              </div>
              
              {/* CIT Savings Potential */}
              <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100 mb-4">
                <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  Potential Tax Reduction Methods
                </h4>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Loss Relief:</span> Carry forward losses up to 4 years (max 50% of profits per year)
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">WHT Credits:</span> Offset WHT deductions against CIT liability
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Capital Allowances:</span> Initial (50-95%) + Annual allowances on assets
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Investment Allowance:</span> Additional 10% on qualifying equipment
                    </div>
                  </div>
                </div>
              </div>
              
              <InfoBox type="info" title="CIT Tax Planning Tips">
                <ul className="space-y-1 mt-2 text-sm">
                  <li>• <strong>Maximize capital allowances</strong> - Time major asset purchases for optimal initial allowances</li>
                  <li>• <strong>Document all deductible expenses</strong> - Ensure proper invoicing and receipts</li>
                  <li>• <strong>Review WHT credits</strong> - Claim all withholding tax deducted at source</li>
                  <li>• <strong>Consider timing of income recognition</strong> - Manage profit distribution across tax years</li>
                  <li>• <strong>Explore pioneer status</strong> - Tax holiday available for qualifying industries</li>
                </ul>
              </InfoBox>
            </CardContent>
          </Card>
        )}

        {/* VAT Analysis Section - Enhanced with input VAT recovery focus */}
        {hasData && taxType === 'vat' && (
          <Card className="border border-purple-200 shadow-none mb-8">
            <CardHeader className="border-b border-purple-100 bg-purple-50/30">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Receipt className="h-4 w-4 text-purple-600" />
                Value Added Tax Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-xs text-purple-600 uppercase tracking-wide mb-1">Total VAT Paid</p>
                  <p className="text-2xl font-bold text-purple-900">{formatCurrency(data.summary.total_tax_paid)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Calculations</p>
                  <p className="text-2xl font-bold text-gray-900">{data.summary.calculation_count}</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-lg">
                  <p className="text-xs text-emerald-600 uppercase tracking-wide mb-1">VAT Rate</p>
                  <p className="text-2xl font-bold text-emerald-900">7.5%</p>
                </div>
              </div>
              
              {/* VAT Savings Potential */}
              <div className="p-4 bg-purple-50/50 rounded-lg border border-purple-100 mb-4">
                <h4 className="font-medium text-purple-900 mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-600" />
                  VAT Optimization Strategies
                </h4>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Input VAT Recovery:</span> Claim all VAT paid on business purchases
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Zero-Rated Supplies:</span> Exports and NTA 2025 exempt items
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Proper Classification:</span> Ensure correct supply categorization
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Bad Debt Relief:</span> Recover VAT on uncollected invoices
                    </div>
                  </div>
                </div>
              </div>
              
              <InfoBox type="info" title="VAT Compliance & Optimization Tips">
                <ul className="space-y-1 mt-2 text-sm">
                  <li>• <strong>Maintain valid tax invoices</strong> - Required for input VAT claims (supplier TIN, amount, date)</li>
                  <li>• <strong>File returns by 21st</strong> - Avoid late filing penalties (₦50,000 first month + ₦25,000 subsequent)</li>
                  <li>• <strong>Review zero-rated items under NTA 2025</strong> - Essential goods now exempt or zero-rated</li>
                  <li>• <strong>Track input VAT carefully</strong> - Unrecovered input VAT is a direct cost to your business</li>
                  <li>• <strong>Consider partial exemption</strong> - Optimize apportionment for mixed supplies</li>
                </ul>
              </InfoBox>
            </CardContent>
          </Card>
        )}

        {/* CGT Analysis Section - Enhanced with relief options */}
        {hasData && taxType === 'cgt' && (
          <Card className="border border-orange-200 shadow-none mb-8">
            <CardHeader className="border-b border-orange-100 bg-orange-50/30">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Scale className="h-4 w-4 text-orange-600" />
                Capital Gains Tax Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-xs text-orange-600 uppercase tracking-wide mb-1">Total CGT Paid</p>
                  <p className="text-2xl font-bold text-orange-900">{formatCurrency(data.summary.total_tax_paid)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Disposals</p>
                  <p className="text-2xl font-bold text-gray-900">{data.summary.calculation_count}</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-lg">
                  <p className="text-xs text-emerald-600 uppercase tracking-wide mb-1">Avg Rate</p>
                  <p className="text-2xl font-bold text-emerald-900">{(safeNum(data.summary.effective_tax_rate) * 100).toFixed(1)}%</p>
                </div>
              </div>
              
              {/* CGT Savings Potential */}
              <div className="p-4 bg-orange-50/50 rounded-lg border border-orange-100 mb-4">
                <h4 className="font-medium text-orange-900 mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4 text-orange-600" />
                  CGT Reduction & Deferral Options
                </h4>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Individual Exemption:</span> Proceeds ≤₦2M & Gain ≤₦500K = exempt
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Rollover Relief:</span> Defer CGT by reinvesting in similar assets
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Cost Base Optimization:</span> Include improvements & fees
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Share Disposal:</span> 10% rate under NTA 2025 for Nigerian shares
                    </div>
                  </div>
                </div>
              </div>
              
              <InfoBox type="info" title="CGT Planning Tips">
                <ul className="space-y-1 mt-2 text-sm">
                  <li>• <strong>Document acquisition costs</strong> - Purchase price, stamp duties, legal fees all reduce gain</li>
                  <li>• <strong>Track improvements</strong> - Capital improvements to assets increase cost base</li>
                  <li>• <strong>Consider timing</strong> - Structure disposals to stay within exemption thresholds</li>
                  <li>• <strong>Explore rollover relief</strong> - Reinvestment into similar assets defers CGT</li>
                  <li>• <strong>Companies pay 30%</strong> - No exemptions for corporate CGT; individual ownership may be more tax-efficient</li>
                </ul>
              </InfoBox>
            </CardContent>
          </Card>
        )}

        {/* Reliefs Analysis - Only show for PAYE */}
        {(taxType === 'all' || taxType === 'paye') && (
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Used Reliefs */}
          <Card className="border border-gray-200 shadow-none">
            <CardHeader className="border-b border-gray-100 bg-emerald-50/30">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                Reliefs Used
                <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs ml-2">PAYE</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {data.reliefs_analysis?.used?.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {data.reliefs_analysis.used.map((relief, index) => (
                    <div key={index} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{relief.name}</p>
                        <p className="text-xs text-gray-500">{safeNum(relief.percent).toFixed(0)}% of eligible amount claimed</p>
                      </div>
                      <span className="font-medium text-emerald-600">{formatCurrency(safeNum(relief.amount))}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No reliefs claimed yet</p>
                  <p className="text-xs mt-1">Complete PAYE calculations to see your relief usage</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Unused Reliefs */}
          <Card className="border border-amber-200 shadow-none">
            <CardHeader className="border-b border-amber-100 bg-amber-50/30">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                Unused / Underutilized Reliefs
                <Badge className="bg-amber-100 text-amber-700 border-0 text-xs ml-2">PAYE</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {data.reliefs_analysis?.unused?.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {data.reliefs_analysis.unused.map((relief, index) => (
                    <div key={index} className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-900">{relief.name}</p>
                        <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
                          Save {formatCurrency(safeNum(relief.amount) * 0.25)}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">{relief.eligibility}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No unused reliefs identified</p>
                  <p className="text-xs mt-1">You may already be maximizing your PAYE tax benefits</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        )}

        {/* Tax Behavior Insights - Tax Type Aware */}
        <Card className="border border-gray-200 shadow-none mb-8">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              {taxType === 'all' ? 'Tax Behavior & Pattern Insights' : `${TAX_TYPE_CONFIG[taxType]?.label || taxType.toUpperCase()} Insights`}
              {taxType !== 'all' && (
                <Badge className={`border-0 text-xs ml-2 ${
                  taxType === 'paye' ? 'bg-gray-100 text-gray-700' :
                  taxType === 'cit' ? 'bg-blue-100 text-blue-700' :
                  taxType === 'vat' ? 'bg-purple-100 text-purple-700' :
                  taxType === 'cgt' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {TAX_TYPE_CONFIG[taxType]?.label || taxType.toUpperCase()}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {/* Show API-provided insights if available */}
            {data.insights?.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {data.insights.map((insight, index) => (
                  <InsightCard key={index} type={insight.type} message={insight.message} impact={insight.impact} />
                ))}
              </div>
            ) : (
              /* Show tax-type specific insights from config */
              TAX_TYPE_CONFIG[taxType]?.insights?.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {TAX_TYPE_CONFIG[taxType].insights.map((insight, index) => (
                    <InsightCard key={index} type={insight.type} message={insight.message} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No insights available yet</p>
                  <p className="text-xs mt-1">Complete more tax calculations to generate personalized insights</p>
                </div>
              )
            )}
          </CardContent>
        </Card>

        {/* Actionable Recommendations - Tax Type Aware */}
        <Card className="border border-gray-200 shadow-none">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-amber-50/30">
            <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Zap className={`h-4 w-4 ${
                taxType === 'cit' ? 'text-blue-600' :
                taxType === 'vat' ? 'text-purple-600' :
                taxType === 'cgt' ? 'text-orange-600' : 'text-amber-600'
              }`} />
              {taxType === 'all' ? 'Actionable Recommendations' : `${TAX_TYPE_CONFIG[taxType]?.label || taxType.toUpperCase()} Action Items`}
              {(data.recommendations?.length > 0 || TAX_TYPE_CONFIG[taxType]?.opportunities?.length > 0) && (
                <Badge className={`border-0 text-xs ml-2 ${
                  taxType === 'cit' ? 'bg-blue-100 text-blue-700' :
                  taxType === 'vat' ? 'bg-purple-100 text-purple-700' :
                  taxType === 'cgt' ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {data.recommendations?.length || TAX_TYPE_CONFIG[taxType]?.opportunities?.length || 0} actions
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {/* API-provided recommendations (usually for PAYE) */}
            {data.recommendations?.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {data.recommendations.map((rec, index) => (
                  <RecommendationCard key={index} {...rec} />
                ))}
              </div>
            ) : (
              /* Tax-type specific recommendations from config */
              taxType !== 'all' && TAX_TYPE_CONFIG[taxType]?.opportunities?.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {TAX_TYPE_CONFIG[taxType].opportunities.slice(0, 4).map((opp, index) => (
                    <div key={index} className={`p-4 border rounded-lg hover:border-${
                      taxType === 'cit' ? 'blue' : taxType === 'vat' ? 'purple' : taxType === 'cgt' ? 'orange' : 'amber'
                    }-300 transition-colors ${
                      taxType === 'cit' ? 'border-blue-200' :
                      taxType === 'vat' ? 'border-purple-200' :
                      taxType === 'cgt' ? 'border-orange-200' : 'border-gray-200'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{opp.name}</h4>
                        <Badge className={`text-xs border-0 ${
                          taxType === 'cit' ? 'bg-blue-100 text-blue-700' :
                          taxType === 'vat' ? 'bg-purple-100 text-purple-700' :
                          taxType === 'cgt' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {opp.maxSavings}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{opp.description}</p>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1 text-gray-500">
                          <Zap className="h-3 w-3" />
                          Action Required
                        </span>
                        <span className="flex items-center gap-1 text-gray-500">
                          <Shield className="h-3 w-3" />
                          Fully Legal
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recommendations available</p>
                  <p className="text-xs mt-1">Select a specific tax type to see tailored action items</p>
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer with Disclaimer */}
      <div className="border-t border-gray-200 bg-gray-50/50 mt-8">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <p className="text-xs text-gray-500 text-center mb-3">
            Analytics are based on your tax computation history. This feature provides recommendations only and does not modify your tax records.
          </p>
          
          {/* Legal Disclaimer */}
          <div className="flex items-start justify-center gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              This information is provided for general guidance only. For specific tax advice, please consult a qualified tax professional. Information last updated January 2026.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
