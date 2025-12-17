import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Phone, Building2, Briefcase, DollarSign, FileText, Save, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

export const UserProfile = () => {
  const { user, updateProfile } = useAuth();
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

  if (!user) {
    return (
      <Alert>
        <AlertDescription>Please log in to view your profile.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Account Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-blue-600" />
            <span>Account Overview</span>
          </CardTitle>
          <CardDescription>Your Fiquant TaxPro account information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Account Tier</p>
              <Badge variant={user.account_tier === 'free' ? 'secondary' : 'default'}>
                {user.account_tier.toUpperCase()}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Member Since</p>
              <p className="font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Last Login</p>
              <p className="font-medium">
                {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-green-600" />
            <span>Profile Settings</span>
          </CardTitle>
          <CardDescription>Update your personal and business information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
              <Alert className={isSuccess ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <AlertDescription className={isSuccess ? "text-green-700" : "text-red-700"}>
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+234800123456"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input value={user.email} disabled className="bg-gray-50" />
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>
            </div>

            <Separator />

            {/* Account Type & Employment */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Account Classification</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="account_type">Account Type</Label>
                  <select
                    id="account_type"
                    value={formData.account_type}
                    onChange={(e) => handleInputChange('account_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {accountTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="employment_status">Employment Status</Label>
                  <select
                    id="employment_status"
                    value={formData.employment_status}
                    onChange={(e) => handleInputChange('employment_status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {employmentStatusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Business Information (conditional) */}
              {formData.account_type === 'business' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => handleInputChange('company_name', e.target.value)}
                      placeholder="Acme Corporation Ltd"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="business_type">Business Type</Label>
                    <Input
                      id="business_type"
                      value={formData.business_type}
                      onChange={(e) => handleInputChange('business_type', e.target.value)}
                      placeholder="Technology, Manufacturing, etc."
                    />
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Income Streams */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Income Streams</h3>
              <p className="text-sm text-gray-600">Select all applicable income sources (for profile reference only)</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {incomeStreamOptions.map(option => (
                  <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.income_streams.includes(option.value)}
                      onChange={() => handleIncomeStreamToggle(option.value)}
                      className="rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <Separator />

            {/* Tax Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Tax Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="tin">Tax Identification Number (TIN)</Label>
                <Input
                  id="tin"
                  value={formData.tin}
                  onChange={(e) => handleInputChange('tin', e.target.value)}
                  placeholder="12345678-0001"
                />
              </div>
            </div>

            <Separator />

            {/* Notification Preferences */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Notification Preferences</h3>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.email_notifications}
                    onChange={(e) => handleInputChange('email_notifications', e.target.checked)}
                    className="rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm">Email Notifications</span>
                </label>
                
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.sms_notifications}
                    onChange={(e) => handleInputChange('sms_notifications', e.target.checked)}
                    className="rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm">SMS Notifications</span>
                </label>
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Updating...' : 'Update Profile'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};