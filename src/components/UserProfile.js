import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';
import axios from 'axios';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Briefcase, 
  FileText, 
  Save, 
  Settings,
  ChevronRight,
  Bell,
  Shield,
  CreditCard,
  Calendar,
  Trash2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';

import { TierMigrationModal } from './TierMigrationModal';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PLAN_OPTIONS = [
  { id: 'starter', name: 'Starter', tier: 'starter', monthlyPrice: 4999, annualPrice: 49990 },
  { id: 'pro', name: 'Pro', tier: 'pro', monthlyPrice: 7999, annualPrice: 79990 },
  { id: 'premium', name: 'Premium', tier: 'premium', monthlyPrice: 14999, annualPrice: 149990 },
];

const TIER_ORDER = { free: 0, starter: 1, pro: 2, premium: 3, enterprise: 4 };

export const UserProfile = () => {
  const { user, updateProfile, logout } = useAuth();
  const [expandedSection, setExpandedSection] = useState('basic');
  const [migrationTarget, setMigrationTarget] = useState(null);
  const [migrationCycle, setMigrationCycle] = useState('monthly');
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  const [subStatus, setSubStatus] = useState(null);
  
  useEffect(() => {
    const fetchSubStatus = async () => {
      try {
        const res = await api.get('/api/subscription/status');
        setSubStatus(res.data);
      } catch (e) { /* ignore */ }
    };
    fetchSubStatus();
  }, []);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    account_type: user?.account_type || 'individual',
    employment_status: user?.employment_status || 'salaried',
    income_streams: user?.income_streams || [],
    tin: user?.tin || '',
    company_name: user?.company_name || '',
    business_type: user?.business_type || '',
    email_notifications: user?.email_notifications ?? true,
    sms_notifications: user?.sms_notifications ?? false
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [revalidating, setRevalidating] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleRevalidateCard = async () => {
    try {
      setRevalidating(true);
      const token = localStorage.getItem('token');
      const callbackUrl = `${window.location.origin}/payment/callback`;
      
      const response = await axios.post(`${API_URL}/api/card/revalidate`, {
        callback_url: callbackUrl
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.authorization_url) {
        sessionStorage.setItem('paystack_reference', response.data.reference);
        sessionStorage.setItem('card_revalidation', 'true');
        window.location.href = response.data.authorization_url;
      }
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Failed to initialize card revalidation.');
      setIsSuccess(false);
      setRevalidating(false);
    }
  };

  const handleSyncSubscription = async () => {
    try {
      setSyncing(true);
      setMessage('');
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/subscription/sync`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data;
      if (data.status === 'synced') {
        setMessage(data.message);
        setIsSuccess(true);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage(data.message);
        setIsSuccess(data.status === 'already_synced');
      }
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Failed to sync subscription.');
      setIsSuccess(false);
    } finally {
      setSyncing(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setMessage('');
  };

  const handleIncomeStreamToggle = (stream) => {
    setFormData(prev => ({
      ...prev,
      income_streams: prev.income_streams.includes(stream)
        ? prev.income_streams.filter(s => s !== stream)
        : [...prev.income_streams, stream]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const result = await updateProfile(formData);
    
    if (result.success) {
      setMessage('Profile updated successfully!');
      setIsSuccess(true);
    } else {
      setMessage(result.error);
      setIsSuccess(false);
    }
    
    setLoading(false);
  };

  const accountTypeOptions = [
    { value: 'individual', label: 'Individual' },
    { value: 'business', label: 'Business' }
  ];

  const employmentStatusOptions = [
    { value: 'salaried', label: 'Salaried Employee' },
    { value: 'self-employed', label: 'Self-Employed' },
    { value: 'contractor', label: 'Contractor' },
    { value: 'investor', label: 'Investor' },
    { value: 'multinational', label: 'Multinational Corporation' },
    { value: 'sme', label: 'Small & Medium Enterprise' }
  ];

  const incomeStreamOptions = [
    { value: 'salary', label: 'Salary' },
    { value: 'business_revenue', label: 'Business Revenue' },
    { value: 'investment', label: 'Investment Income' },
    { value: 'property', label: 'Property Income' },
    { value: 'digital', label: 'Digital Income' }
  ];

  // Accordion Section Component
  const AccordionSection = ({ id, title, icon: Icon, children, badge = null }) => (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        type="button"
        onClick={() => setExpandedSection(expandedSection === id ? null : id)}
        className="w-full flex items-center justify-between py-4 px-1 text-left hover:bg-gray-50/50 transition-colors"
      >
        <span className="font-medium text-gray-900 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
            <Icon className="h-4 w-4 text-gray-600" />
          </div>
          {title}
          {badge && (
            <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
              {badge}
            </Badge>
          )}
        </span>
        <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${expandedSection === id ? 'rotate-90' : ''}`} />
      </button>
      {expandedSection === id && (
        <div className="pb-6 px-1">
          {children}
        </div>
      )}
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <div className="border-b border-gray-200 bg-gray-50/50">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                <p className="text-sm text-gray-500">Manage your account settings</p>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Alert>
            <AlertDescription>Please log in to view your profile.</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header - matching Tax Library style */}
      <div className="border-b border-gray-200 bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-sm text-gray-500">Manage your account and preferences</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Account Overview Card */}
          <Card className="border border-gray-200 shadow-none">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Account Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-4 bg-gray-900 text-white rounded-lg">
                  <p className="text-sm text-gray-300 mb-1">Account Tier</p>
                  <p className="text-xl font-bold uppercase">{user.account_tier}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Member Since</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(user.created_at).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Last Login</p>
                  <p className="text-sm font-medium text-gray-900">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Never'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Management Card */}
          <Card className="border border-gray-200 shadow-none">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Subscription Management
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Current Plan</p>
                <p className="text-lg font-bold text-gray-900 uppercase">{user.account_tier || 'Free'}</p>
              </div>
              
              <p className="text-xs text-gray-500 mb-3">Change your plan:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PLAN_OPTIONS.map(plan => {
                  const currentTierLevel = TIER_ORDER[user.account_tier?.toLowerCase()] || 0;
                  const planTierLevel = TIER_ORDER[plan.tier] || 0;
                  const isCurrent = user.account_tier?.toLowerCase() === plan.tier;
                  const isUpgrade = planTierLevel > currentTierLevel;
                  
                  return (
                    <div 
                      key={plan.id}
                      className={`rounded-xl p-4 border transition-all ${isCurrent ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}
                    >
                      <p className="font-semibold text-gray-900 text-sm">{plan.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(plan.monthlyPrice)}/mo
                      </p>
                      {isCurrent ? (
                        <span className="inline-block mt-2 text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded">Current</span>
                      ) : (
                        <Button
                          variant={isUpgrade ? 'default' : 'outline'}
                          size="sm"
                          className={`mt-2 w-full text-xs ${isUpgrade ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : 'text-gray-600 border-gray-300'}`}
                          onClick={() => {
                            setMigrationTarget(plan.id);
                            setMigrationCycle('monthly');
                            setShowMigrationModal(true);
                          }}
                          data-testid={`migrate-${plan.id}-btn`}
                        >
                          {isUpgrade ? 'Upgrade' : 'Downgrade'}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Renewal Status */}
              {subStatus?.has_subscription && subStatus.subscription && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Renewal Status
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <p className="text-gray-500">Billing Cycle</p>
                      <p className="font-medium text-gray-900 capitalize">{subStatus.subscription.billing_cycle}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Next Renewal</p>
                      <p className="font-medium text-gray-900">
                        {subStatus.subscription.next_billing_date 
                          ? new Date(subStatus.subscription.next_billing_date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })
                          : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Auto-Renewal</p>
                      <p className={`font-medium ${subStatus.subscription.auto_renewal ? 'text-green-600' : 'text-red-500'}`}>
                        {subStatus.subscription.auto_renewal ? 'Active' : 'No Card Saved'}
                      </p>
                    </div>
                    {subStatus.account_credit_naira > 0 && (
                      <div>
                        <p className="text-gray-500">Account Credit</p>
                        <p className="font-medium text-green-600">
                          {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(subStatus.account_credit_naira)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Saved Card Info & Revalidation */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <CreditCard className="w-3 h-3" /> Payment Card
                    </p>
                    {subStatus.card_info ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-gray-500" />
                            <span className="font-medium text-gray-900 uppercase">{subStatus.card_info.card_type || 'Card'}</span>
                            <span className="text-gray-400">****</span>
                            <span className="font-mono font-medium text-gray-900">{subStatus.card_info.last_four}</span>
                          </span>
                          <span className="text-gray-400">
                            Exp {subStatus.card_info.exp_month}/{subStatus.card_info.exp_year}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7 border-gray-300 text-gray-600 hover:text-gray-900"
                          onClick={handleRevalidateCard}
                          disabled={revalidating}
                          data-testid="revalidate-card-btn"
                        >
                          {revalidating ? (
                            <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Processing...</>
                          ) : (
                            <><RefreshCw className="w-3 h-3 mr-1" /> Update Card</>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-amber-600 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          No valid card on file. Auto-renewal will fail.
                        </p>
                        <Button
                          size="sm"
                          className="text-xs h-7 bg-yellow-500 hover:bg-yellow-600 text-black"
                          onClick={handleRevalidateCard}
                          disabled={revalidating}
                          data-testid="add-card-btn"
                        >
                          {revalidating ? (
                            <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Processing...</>
                          ) : (
                            <><CreditCard className="w-3 h-3 mr-1" /> Add Card</>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sync Subscription */}
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Charged but plan not updated?
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 border-gray-300 text-gray-600 hover:text-gray-900"
                  onClick={handleSyncSubscription}
                  disabled={syncing}
                  data-testid="sync-subscription-btn"
                >
                  {syncing ? (
                    <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Syncing...</>
                  ) : (
                    <><RefreshCw className="w-3 h-3 mr-1" /> Sync Subscription</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tier Migration Modal */}
          <TierMigrationModal
            isOpen={showMigrationModal}
            onClose={() => setShowMigrationModal(false)}
            targetPlan={migrationTarget}
            targetCycle={migrationCycle}
            currentTier={user.account_tier?.toLowerCase() || 'free'}
            onMigrationSuccess={(data) => {
              console.log('Migration success:', data);
            }}
          />

          {/* Profile Form Card */}
          <Card className="border border-gray-200 shadow-none">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <form onSubmit={handleSubmit}>
                {message && (
                  <div className={`mx-4 mt-4 border-l-4 ${isSuccess ? 'border-l-emerald-500 bg-emerald-50/50' : 'border-l-red-500 bg-red-50/50'} rounded-r-lg p-4`}>
                    <p className={`text-sm ${isSuccess ? 'text-emerald-700' : 'text-red-700'}`}>{message}</p>
                  </div>
                )}

                {/* Basic Information */}
                <AccordionSection id="basic" title="Basic Information" icon={User}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name" className="text-sm text-gray-700">Full Name</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                        placeholder="John Doe"
                        className="border-gray-200 focus:border-gray-900 focus:ring-gray-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm text-gray-700">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+234800123456"
                        className="border-gray-200 focus:border-gray-900 focus:ring-gray-900"
                      />
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Label className="text-sm text-gray-700">Email Address</Label>
                    <Input value={user.email} disabled className="bg-gray-50 border-gray-200" />
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                  </div>
                </AccordionSection>

                {/* Account Classification */}
                <AccordionSection id="classification" title="Account Classification" icon={Briefcase}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="account_type" className="text-sm text-gray-700">Account Type</Label>
                      <select
                        id="account_type"
                        value={formData.account_type}
                        onChange={(e) => handleInputChange('account_type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm"
                      >
                        {accountTypeOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employment_status" className="text-sm text-gray-700">Employment Status</Label>
                      <select
                        id="employment_status"
                        value={formData.employment_status}
                        onChange={(e) => handleInputChange('employment_status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm"
                      >
                        {employmentStatusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {formData.account_type === 'business' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-2">
                        <Label htmlFor="company_name" className="text-sm text-gray-700">Company Name</Label>
                        <Input
                          id="company_name"
                          value={formData.company_name}
                          onChange={(e) => handleInputChange('company_name', e.target.value)}
                          placeholder="Acme Corporation Ltd"
                          className="border-gray-200 focus:border-gray-900 focus:ring-gray-900"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="business_type" className="text-sm text-gray-700">Business Type</Label>
                        <Input
                          id="business_type"
                          value={formData.business_type}
                          onChange={(e) => handleInputChange('business_type', e.target.value)}
                          placeholder="Technology, Manufacturing, etc."
                          className="border-gray-200 focus:border-gray-900 focus:ring-gray-900"
                        />
                      </div>
                    </div>
                  )}
                </AccordionSection>

                {/* Income Streams */}
                <AccordionSection id="income" title="Income Streams" icon={CreditCard}>
                  <p className="text-sm text-gray-600 mb-4">Select all applicable income sources (for profile reference only)</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {incomeStreamOptions.map(option => (
                      <label 
                        key={option.value} 
                        className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                          formData.income_streams.includes(option.value) 
                            ? 'border-gray-900 bg-gray-900 text-white' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.income_streams.includes(option.value)}
                          onChange={() => handleIncomeStreamToggle(option.value)}
                          className="sr-only"
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </AccordionSection>

                {/* Tax Information */}
                <AccordionSection id="tax" title="Tax Information" icon={FileText}>
                  <div className="space-y-2">
                    <Label htmlFor="tin" className="text-sm text-gray-700">Tax Identification Number (TIN)</Label>
                    <Input
                      id="tin"
                      value={formData.tin}
                      onChange={(e) => handleInputChange('tin', e.target.value)}
                      placeholder="12345678-0001"
                      className="border-gray-200 focus:border-gray-900 focus:ring-gray-900 max-w-md"
                    />
                  </div>
                  <div className="mt-4 border-l-4 border-l-gray-900 bg-gray-50 rounded-r-lg p-4">
                    <p className="text-sm text-gray-700">
                      Your TIN is used for generating compliant tax reports. You can verify your TIN status through the Joint Tax Board portal: <a href="https://jtb.gov.ng" target="_blank" rel="noopener noreferrer" className="text-gray-900 font-medium underline">jtb.gov.ng</a>
                    </p>
                  </div>
                </AccordionSection>

                {/* Notification Preferences */}
                <AccordionSection id="notifications" title="Notification Preferences" icon={Bell}>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      <div>
                        <p className="font-medium text-gray-900">Email Notifications</p>
                        <p className="text-sm text-gray-500">Receive updates and alerts via email</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.email_notifications}
                        onChange={(e) => handleInputChange('email_notifications', e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                      />
                    </label>
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      <div>
                        <p className="font-medium text-gray-900">SMS Notifications</p>
                        <p className="text-sm text-gray-500">Receive important alerts via SMS</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.sms_notifications}
                        onChange={(e) => handleInputChange('sms_notifications', e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                      />
                    </label>
                  </div>
                </AccordionSection>

                {/* Submit Button */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-gray-900 hover:bg-gray-800 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Updating...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-gray-50/50 mt-8">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <p className="text-xs text-gray-500 text-center">
            Your profile information is stored securely and used to personalize your tax calculations.
          </p>
        </div>
      </div>

      {/* Delete Account Section */}
      <div className="max-w-6xl mx-auto px-4 py-8 mt-4">
        <Card className="border-red-200 bg-red-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-red-700 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showDeleteConfirm ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700 font-medium">Delete your account</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert className="bg-red-100 border-red-300">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    <strong>Warning:</strong> This will permanently delete your account, calculation history, 
                    saved templates, and all other data. This action is irreversible.
                  </AlertDescription>
                </Alert>
                <div>
                  <Label className="text-sm text-gray-700">
                    Type <strong>DELETE</strong> to confirm:
                  </Label>
                  <Input
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Type DELETE to confirm"
                    className="mt-2 max-w-xs"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmText('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={deleteConfirmText !== 'DELETE' || deleteLoading}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={async () => {
                      setDeleteLoading(true);
                      try {
                        const token = localStorage.getItem('token');
                        await axios.delete(`${API_URL}/api/auth/delete-account`, {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        alert('Your account has been deleted successfully.');
                        logout();
                      } catch (error) {
                        alert(error.response?.data?.detail || 'Failed to delete account. Please try again.');
                      } finally {
                        setDeleteLoading(false);
                      }
                    }}
                  >
                    {deleteLoading ? 'Deleting...' : 'Permanently Delete Account'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
