import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  TrendingUp, 
  TrendingDown,
  PieChart,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Lock,
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
  Receipt,
  Scale,
  Users,
  Percent,
  DollarSign,
  FileText
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFeatureGate } from '../contexts/FeatureGateContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AdvancedAnalytics = ({ onShowUpgradeModal, openUpgradeModal }) => {
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

  const canAccess = hasFeature('advanced_analytics');

  useEffect(() => {
    if (canAccess && isAuthenticated()) {
      fetchAnalyticsData();
    } else {
      setLoading(false);
    }
  }, [canAccess, dateRange, taxType, customDateStart, customDateEnd]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }
      
      const params = new URLSearchParams({
        date_range: dateRange,
        tax_type: taxType
      });
      
      if (dateRange === 'custom' && customDateStart && customDateEnd) {
        params.append('start_date', customDateStart);
        params.append('end_date', customDateEnd);
      }
      
      const response = await axios.get(
        `${BACKEND_URL}/api/analytics/dashboard?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data && response.data.summary) {
        setAnalyticsData(response.data);
        setError('');
      } else {
        setError('Unexpected response format from analytics API');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      if (err.response?.status === 403) {
        setError('Access denied. Please ensure you have Premium or Enterprise tier.');
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
    if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
      return '0.0%';
    }
    return `${(value * 100).toFixed(1)}%`;
  };

  const safeNum = (val, defaultVal = 0) => {
    if (val === null || val === undefined || isNaN(val)) {
      return defaultVal;
    }
    return Number(val);
  };

  // Tax Type Labels
  const TAX_TYPE_LABELS = {
    all: 'All Tax Types',
    paye: 'PAYE (Personal Income Tax)',
    cit: 'Corporate Income Tax',
    vat: 'Value Added Tax',
    cgt: 'Capital Gains Tax'
  };

  // Locked Dashboard Component
  const LockedDashboard = () => (
    <div className="min-h-screen bg-white">
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

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center max-w-2xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
            <Lock className="h-10 w-10 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Unlock Advanced Analytics</h2>
          <p className="text-gray-600 mb-8">
            Get intelligent insights into your tax computations across PAYE, CIT, VAT, and CGT.
          </p>
          
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <Users className="h-6 w-6 text-gray-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 text-sm">PAYE Analytics</h3>
              <p className="text-xs text-gray-500">Relief optimization</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Building2 className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 text-sm">CIT Analytics</h3>
              <p className="text-xs text-gray-500">Capital allowances</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <Receipt className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 text-sm">VAT Analytics</h3>
              <p className="text-xs text-gray-500">Input recovery</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <Scale className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 text-sm">CGT Analytics</h3>
              <p className="text-xs text-gray-500">Exemption tracking</p>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-xl border border-amber-200">
            <p className="text-amber-800 font-medium mb-4">
              Advanced Analytics is available for Premium subscribers
            </p>
            <Button 
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={() => openUpgradeModal ? openUpgradeModal('premium') : (onShowUpgradeModal && onShowUpgradeModal())}
            >
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
      </div>
    </div>
  );

  // KPI Card Component
  const KPICard = ({ title, value, subtitle, trend, trendValue, icon: Icon, color = 'gray' }) => {
    const colorStyles = {
      gray: 'bg-gray-900 text-white',
      emerald: 'bg-emerald-600 text-white',
      amber: 'bg-amber-500 text-white',
      blue: 'bg-blue-600 text-white',
      purple: 'bg-purple-600 text-white',
      orange: 'bg-orange-500 text-white',
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

  // Simple Bar Chart Component
  const SimpleBarChart = ({ data, title, emptyMessage = "No data available" }) => {
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
              <p className="text-sm">{emptyMessage}</p>
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
              <p className="text-sm">{emptyMessage}</p>
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
  const DonutChart = ({ data, title, centerLabel, emptyMessage = "No data available" }) => {
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
              <p className="text-sm">{emptyMessage}</p>
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
              <p className="text-sm">{emptyMessage}</p>
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

  // ============================================
  // TAX-TYPE SPECIFIC ANALYTICS SECTIONS
  // ============================================

  // PAYE Analytics Section
  const PAYEAnalyticsSection = ({ data }) => {
    const paye = data.paye_analytics;
    if (!paye) return null;
    
    return (
      <div className="space-y-6">
        {/* PAYE KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard 
            title="Total PAYE Paid"
            value={formatCurrency(paye.total_paye_paid)}
            subtitle="Personal income tax"
            icon={Wallet}
            color="gray"
          />
          <KPICard 
            title="Effective Tax Rate"
            value={formatPercent(paye.effective_rate)}
            subtitle="On gross income"
            trend={paye.effective_rate > 0.20 ? 'up' : 'down'}
            trendValue={paye.effective_rate > 0.20 ? 'High' : 'Optimal'}
            icon={Percent}
            color="blue"
          />
          <KPICard 
            title="Reliefs Claimed"
            value={formatCurrency(paye.reliefs_claimed)}
            subtitle="Tax deductions used"
            icon={Shield}
            color="emerald"
          />
          <KPICard 
            title="Potential Savings"
            value={formatCurrency(paye.potential_savings)}
            subtitle="From unused reliefs"
            icon={Target}
            color="amber"
          />
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-6">
          <DonutChart 
            data={paye.deductions_breakdown}
            title="Reliefs & Deductions Breakdown"
            centerLabel="Total Reliefs"
            emptyMessage="No reliefs claimed yet"
          />
          
          {/* Avoidable vs Unavoidable Tax */}
          <Card className="border border-gray-200 shadow-none">
            <CardHeader className="border-b border-gray-100 py-3">
              <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Avoidable vs Unavoidable Tax
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Unavoidable Tax</span>
                    <span className="font-medium text-gray-900">{formatCurrency(paye.unavoidable_tax)}</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gray-600 rounded-full" 
                      style={{ width: `${paye.total_paye_paid > 0 ? (paye.unavoidable_tax / paye.total_paye_paid) * 100 : 0}%` }} 
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimum tax based on your income level</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Avoidable Tax</span>
                    <span className="font-medium text-amber-600">{formatCurrency(paye.avoidable_tax)}</span>
                  </div>
                  <div className="h-3 bg-amber-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full" 
                      style={{ width: `${paye.total_paye_paid > 0 ? (paye.avoidable_tax / paye.total_paye_paid) * 100 : 0}%` }} 
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Tax paid due to missed reliefs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reliefs Analysis */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Used Reliefs */}
          <Card className="border border-emerald-200 shadow-none">
            <CardHeader className="border-b border-emerald-100 bg-emerald-50/30">
              <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                Reliefs You're Using
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {paye.reliefs_analysis?.used?.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {paye.reliefs_analysis.used.map((relief, index) => (
                    <div key={index} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{relief.name}</p>
                        <p className="text-xs text-gray-500">{safeNum(relief.percent).toFixed(0)}% utilized</p>
                      </div>
                      <span className="font-medium text-emerald-600">{formatCurrency(safeNum(relief.amount))}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No reliefs claimed yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Unused Reliefs */}
          <Card className="border border-amber-200 shadow-none">
            <CardHeader className="border-b border-amber-100 bg-amber-50/30">
              <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                Reliefs You're Missing
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {paye.reliefs_analysis?.unused?.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {paye.reliefs_analysis.unused.map((relief, index) => (
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
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50 text-emerald-500" />
                  <p className="text-sm">You're maximizing your reliefs!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* PAYE Tips */}
        <InfoBox type="info" title="PAYE Optimization Tips">
          <ul className="space-y-1 mt-2 text-sm">
            <li>• <strong>Maximize pension contributions</strong> - 8% of pensionable earnings is fully deductible</li>
            <li>• <strong>Claim NHF contribution</strong> - 2.5% of basic salary reduces taxable income</li>
            <li>• <strong>Mortgage interest relief</strong> - Available for owner-occupied property loans</li>
            <li>• <strong>Health insurance premiums</strong> - NHIS and private health premiums are deductible</li>
          </ul>
        </InfoBox>
      </div>
    );
  };

  // CIT Analytics Section
  const CITAnalyticsSection = ({ data }) => {
    const cit = data.cit_analytics;
    if (!cit) return null;
    
    return (
      <div className="space-y-6">
        {/* CIT KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard 
            title="Total CIT Paid"
            value={formatCurrency(cit.total_cit_paid)}
            subtitle="Corporate income tax"
            icon={Building2}
            color="blue"
          />
          <KPICard 
            title="Assessable Profit"
            value={formatCurrency(cit.total_assessable_profit)}
            subtitle="Taxable corporate income"
            icon={DollarSign}
            color="gray"
          />
          <KPICard 
            title="Effective Rate"
            value={formatPercent(cit.effective_rate)}
            subtitle="Statutory: 30% + 4% levy"
            trend={cit.effective_rate < 0.30 ? 'down' : 'up'}
            trendValue={cit.effective_rate < 0.30 ? 'Optimized' : 'Standard'}
            icon={Percent}
            color="emerald"
          />
          <KPICard 
            title="Calculations"
            value={cit.calculation_count}
            subtitle="CIT computations"
            icon={Calculator}
            color="amber"
          />
        </div>

        {/* CIT Deductions Chart */}
        <div className="grid md:grid-cols-2 gap-6">
          <DonutChart 
            data={cit.deductions_breakdown}
            title="CIT Deductions Breakdown"
            centerLabel="Total Deductions"
            emptyMessage="No deductions tracked"
          />
          
          {/* Company Size Breakdown */}
          <Card className="border border-blue-200 shadow-none">
            <CardHeader className="border-b border-blue-100 bg-blue-50/30">
              <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                Company Size Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {['small', 'medium', 'large'].map((size) => (
                  <div key={size} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        size === 'small' ? 'bg-green-500' : 
                        size === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`} />
                      <span className="text-sm text-gray-600 capitalize">{size} Company</span>
                    </div>
                    <span className="font-medium text-gray-900">{cit.company_size_breakdown?.[size] || 0}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Small: ≤₦25M | Medium: ₦25M-₦100M | Large: &gt;₦100M turnover
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CIT Metrics */}
        <Card className="border border-blue-200 shadow-none">
          <CardHeader className="border-b border-blue-100 bg-blue-50/30">
            <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              CIT Deductions & Credits Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-xs text-blue-600 uppercase tracking-wide mb-1">Capital Allowances</p>
                <p className="text-xl font-bold text-blue-900">{formatCurrency(cit.capital_allowances_claimed)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Loss Relief</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(cit.loss_relief_used)}</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg text-center">
                <p className="text-xs text-emerald-600 uppercase tracking-wide mb-1">WHT Credits</p>
                <p className="text-xl font-bold text-emerald-900">{formatCurrency(cit.wht_credits_claimed)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CIT Tips - Updated for NTA 2025 */}
        <InfoBox type="info" title="CIT Optimization Strategies (NTA 2025)">
          <ul className="space-y-1 mt-2 text-sm">
            <li>• <strong>Maximize capital allowances</strong> - Annual allowances on qualifying assets (buildings 10%, plant/machinery 25%, motor vehicles 25%, furniture 20%, computers 25%)</li>
            <li>• <strong>Claim WHT credits</strong> - Offset all withholding tax deducted at source against CIT liability</li>
            <li>• <strong>Loss relief</strong> - Carry forward losses up to 4 years (max 50% of profits per year under NTA 2025)</li>
            <li>• <strong>Thin capitalization planning</strong> - Debt-to-equity ratio of 2:1 for related party interest deductions</li>
            <li>• <strong>Pioneer status</strong> - Tax holiday for 3-5 years for qualifying industries</li>
          </ul>
        </InfoBox>
      </div>
    );
  };

  // VAT Analytics Section
  const VATAnalyticsSection = ({ data }) => {
    const vat = data.vat_analytics;
    if (!vat) return null;
    
    return (
      <div className="space-y-6">
        {/* VAT KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard 
            title="Output VAT"
            value={formatCurrency(vat.total_output_vat)}
            subtitle="VAT on sales"
            icon={TrendingUp}
            color="purple"
          />
          <KPICard 
            title="Input VAT"
            value={formatCurrency(vat.total_input_vat)}
            subtitle="VAT on purchases"
            icon={TrendingDown}
            color="emerald"
          />
          <KPICard 
            title="Net VAT Payable"
            value={formatCurrency(vat.net_vat_payable)}
            subtitle="Output - Input VAT"
            icon={Wallet}
            color="gray"
          />
          <KPICard 
            title="Recovery Rate"
            value={formatPercent(vat.input_vat_recovery_rate)}
            subtitle="Input VAT recovered"
            trend={vat.input_vat_recovery_rate > 0.8 ? 'up' : 'down'}
            trendValue={vat.input_vat_recovery_rate > 0.8 ? 'Good' : 'Review'}
            icon={Target}
            color="amber"
          />
        </div>

        {/* VAT Supply Breakdown */}
        <div className="grid md:grid-cols-2 gap-6">
          <DonutChart 
            data={vat.supply_breakdown}
            title="Supply Type Breakdown"
            centerLabel="Total Supplies"
            emptyMessage="No supply data"
          />
          
          {/* VAT Summary Card */}
          <Card className="border border-purple-200 shadow-none">
            <CardHeader className="border-b border-purple-100 bg-purple-50/30">
              <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <Receipt className="h-4 w-4 text-purple-600" />
                VAT Position Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Standard Rated Sales (7.5%)</span>
                    <span className="font-medium text-purple-900">{formatCurrency(vat.standard_rated_sales)}</span>
                  </div>
                  <div className="h-2 bg-purple-200 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
                <div className="p-4 bg-emerald-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Zero Rated Sales (0%)</span>
                    <span className="font-medium text-emerald-900">{formatCurrency(vat.zero_rated_sales)}</span>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Exempt Supplies</span>
                    <span className="font-medium text-gray-900">{formatCurrency(vat.exempt_sales)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* VAT Tips */}
        <InfoBox type="info" title="VAT Optimization Strategies">
          <ul className="space-y-1 mt-2 text-sm">
            <li>• <strong>Claim all input VAT</strong> - Ensure valid tax invoices for all business purchases</li>
            <li>• <strong>Zero-rated supplies</strong> - Exports and NTA 2025 essential items qualify for input VAT refund</li>
            <li>• <strong>Proper classification</strong> - Review supply categorization to avoid incorrect VAT charges</li>
            <li>• <strong>Bad debt relief</strong> - Recover VAT on uncollected invoices after 12 months</li>
            <li>• <strong>File by 21st</strong> - Avoid late filing penalties (₦50,000 first month)</li>
          </ul>
        </InfoBox>
      </div>
    );
  };

  // CGT Analytics Section
  const CGTAnalyticsSection = ({ data }) => {
    const cgt = data.cgt_analytics;
    if (!cgt) return null;
    
    return (
      <div className="space-y-6">
        {/* CGT KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard 
            title="Total CGT Paid"
            value={formatCurrency(cgt.total_cgt_paid)}
            subtitle="Capital gains tax"
            icon={Scale}
            color="orange"
          />
          <KPICard 
            title="Chargeable Gains"
            value={formatCurrency(cgt.total_chargeable_gains)}
            subtitle="Total taxable gains"
            icon={TrendingUp}
            color="gray"
          />
          <KPICard 
            title="Exemptions Used"
            value={formatCurrency(cgt.total_exemptions_used)}
            subtitle="Tax-free gains"
            icon={Shield}
            color="emerald"
          />
          <KPICard 
            title="Effective Rate"
            value={formatPercent(cgt.effective_rate)}
            subtitle="Individual: 0-25% | Company: 30%"
            icon={Percent}
            color="amber"
          />
        </div>

        {/* CGT Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          <DonutChart 
            data={cgt.asset_type_breakdown}
            title="Gains by Asset Type"
            centerLabel="Total Gains"
            emptyMessage="No asset data"
          />
          
          {/* Taxpayer Type Breakdown */}
          <Card className="border border-orange-200 shadow-none">
            <CardHeader className="border-b border-orange-100 bg-orange-50/30">
              <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <Users className="h-4 w-4 text-orange-600" />
                Taxpayer Type Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Individual Disposals</p>
                      <p className="text-xs text-gray-500">0-25% CGT rate with exemptions</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-blue-900">{cgt.individual_vs_company?.individual || 0}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-8 w-8 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Company Disposals</p>
                      <p className="text-xs text-gray-500">Flat 30% CGT rate, no exemptions</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{cgt.individual_vs_company?.company || 0}</span>
                </div>
              </div>
              
              {cgt.rollover_relief_potential > 0 && (
                <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm font-medium text-amber-800">
                    Potential Rollover Relief: {formatCurrency(cgt.rollover_relief_potential)}
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    Reinvest proceeds into similar assets to defer CGT
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* CGT Tips */}
        <InfoBox type="info" title="CGT Planning Strategies">
          <ul className="space-y-1 mt-2 text-sm">
            <li>• <strong>Individual exemption</strong> - Proceeds ≤₦2M AND gain ≤₦500K = exempt</li>
            <li>• <strong>Rollover relief</strong> - Defer CGT by reinvesting in similar qualifying assets</li>
            <li>• <strong>Cost base optimization</strong> - Include improvements, professional fees in cost</li>
            <li>• <strong>Nigerian shares</strong> - 10% rate under NTA 2025 (not 30%)</li>
            <li>• <strong>Timing strategy</strong> - Structure disposals to stay within exemption thresholds</li>
          </ul>
        </InfoBox>
      </div>
    );
  };

  // Combined "All" View Section
  const AllTaxTypesSection = ({ data }) => {
    const summary = data.summary;
    const hasData = summary.calculation_count > 0;
    
    return (
      <div className="space-y-6">
        {/* Overall KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard 
            title="Total Tax Paid"
            value={formatCurrency(summary.total_tax_paid)}
            subtitle="All tax types combined"
            icon={Wallet}
            color="gray"
          />
          <KPICard 
            title="Calculations"
            value={summary.calculation_count}
            subtitle="Total computations"
            icon={Calculator}
            color="blue"
          />
          <KPICard 
            title="Total Reliefs"
            value={formatCurrency(summary.total_reliefs_used)}
            subtitle="Deductions claimed"
            icon={Shield}
            color="emerald"
          />
          <KPICard 
            title="Potential Savings"
            value={formatCurrency(summary.potential_savings)}
            subtitle="Optimization opportunity"
            icon={Target}
            color="amber"
          />
        </div>

        {/* Tax by Type Chart */}
        <SimpleBarChart 
          data={data.tax_by_type}
          title="Tax Paid by Type"
          emptyMessage="No tax calculations found for selected period"
        />

        {/* Tax Type Summary Cards */}
        {hasData && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* PAYE Summary */}
            {data.paye_analytics && data.paye_analytics.total_paye_paid > 0 && (
              <Card className="border border-gray-200 shadow-none hover:border-gray-400 transition-colors cursor-pointer" onClick={() => setTaxType('paye')}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">PAYE</p>
                      <p className="text-xs text-gray-500">Personal Income Tax</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(data.paye_analytics.total_paye_paid)}</p>
                  <p className="text-xs text-gray-500 mt-1">{data.paye_analytics.calculation_count || 0} calculations</p>
                  <div className="mt-3 flex items-center text-xs text-gray-500">
                    <span>View details</span>
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* CIT Summary */}
            {data.cit_analytics && data.cit_analytics.total_cit_paid > 0 && (
              <Card className="border border-blue-200 shadow-none hover:border-blue-400 transition-colors cursor-pointer" onClick={() => setTaxType('cit')}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">CIT</p>
                      <p className="text-xs text-gray-500">Corporate Income Tax</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-blue-900">{formatCurrency(data.cit_analytics.total_cit_paid)}</p>
                  <p className="text-xs text-gray-500 mt-1">{data.cit_analytics.calculation_count || 0} calculations</p>
                  <div className="mt-3 flex items-center text-xs text-blue-600">
                    <span>View details</span>
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* VAT Summary */}
            {data.vat_analytics && data.vat_analytics.net_vat_payable > 0 && (
              <Card className="border border-purple-200 shadow-none hover:border-purple-400 transition-colors cursor-pointer" onClick={() => setTaxType('vat')}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                      <Receipt className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">VAT</p>
                      <p className="text-xs text-gray-500">Value Added Tax</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-purple-900">{formatCurrency(data.vat_analytics.net_vat_payable)}</p>
                  <p className="text-xs text-gray-500 mt-1">{data.vat_analytics.calculation_count || 0} calculations</p>
                  <div className="mt-3 flex items-center text-xs text-purple-600">
                    <span>View details</span>
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* CGT Summary */}
            {data.cgt_analytics && data.cgt_analytics.total_cgt_paid > 0 && (
              <Card className="border border-orange-200 shadow-none hover:border-orange-400 transition-colors cursor-pointer" onClick={() => setTaxType('cgt')}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                      <Scale className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">CGT</p>
                      <p className="text-xs text-gray-500">Capital Gains Tax</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-orange-900">{formatCurrency(data.cgt_analytics.total_cgt_paid)}</p>
                  <p className="text-xs text-gray-500 mt-1">{data.cgt_analytics.calculation_count || 0} calculations</p>
                  <div className="mt-3 flex items-center text-xs text-orange-600">
                    <span>View details</span>
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* General Tips */}
        <InfoBox type="info" title="Tax Planning Overview">
          <p className="text-sm mb-2">
            Select a specific tax type filter above to see detailed analytics and optimization opportunities for that tax.
          </p>
          <ul className="space-y-1 text-sm">
            <li>• <strong>PAYE</strong> - Personal reliefs (pension, NHF, mortgage, insurance)</li>
            <li>• <strong>CIT</strong> - Capital allowances, loss relief, WHT credits</li>
            <li>• <strong>VAT</strong> - Input VAT recovery, supply classification</li>
            <li>• <strong>CGT</strong> - Exemptions, rollover relief, cost base optimization</li>
          </ul>
        </InfoBox>
      </div>
    );
  };

  // Main Dashboard Render
  if (!canAccess) {
    return <LockedDashboard />;
  }

  if (loading) {
    return <LoadingState />;
  }

  const data = analyticsData || {
    summary: { total_tax_paid: 0, effective_tax_rate: 0, total_reliefs_used: 0, potential_savings: 0, calculation_count: 0 },
    tax_by_type: [],
    paye_analytics: null,
    cit_analytics: null,
    vat_analytics: null,
    cgt_analytics: null
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Black with white text matching Library/History design */}
      <div className="bg-white rounded-t-2xl shadow-sm border border-gray-100 overflow-hidden mx-4 mt-4">
        <div className="bg-gradient-to-r from-gray-900 to-black text-white px-8 py-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-yellow-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Advanced Analytics</h1>
                <p className="text-sm text-gray-300">
                  {taxType === 'all' ? 'Comprehensive tax insights' : TAX_TYPE_LABELS[taxType]}
                </p>
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
              className={`px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                taxType === 'paye' ? 'border-gray-400 bg-gray-100' :
                taxType === 'cit' ? 'border-blue-400 bg-blue-50' :
                taxType === 'vat' ? 'border-purple-400 bg-purple-50' :
                taxType === 'cgt' ? 'border-orange-400 bg-orange-50' :
                'border-gray-200'
              }`}
            >
              <option value="all">All Tax Types</option>
              <option value="paye">PAYE Only</option>
              <option value="cit">CIT Only</option>
              <option value="vat">VAT Only</option>
              <option value="cgt">CGT Only</option>
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

        {/* No Data State */}
        {!error && !loading && data.summary.calculation_count === 0 && (
          <InfoBox type="info" title="No Tax Calculations Yet">
            Your analytics will appear here once you perform tax calculations while logged in. 
            Go to the calculators and run calculations to start seeing your personalized insights.
          </InfoBox>
        )}

        {/* Render appropriate section based on tax type filter */}
        {!error && (
          <>
            {taxType === 'all' && <AllTaxTypesSection data={data} />}
            {taxType === 'paye' && <PAYEAnalyticsSection data={data} />}
            {taxType === 'cit' && <CITAnalyticsSection data={data} />}
            {taxType === 'vat' && <VATAnalyticsSection data={data} />}
            {taxType === 'cgt' && <CGTAnalyticsSection data={data} />}
          </>
        )}
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
