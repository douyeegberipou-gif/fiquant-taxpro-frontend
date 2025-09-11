import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  TrendingUp, 
  Users, 
  Calculator, 
  Download, 
  Calendar,
  Activity,
  Building2,
  FileText,
  BarChart3,
  PieChart
} from 'lucide-react';

export const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [exportLoading, setExportLoading] = useState(false);

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/api/admin/analytics/dashboard?period=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to load analytics');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format) => {
    try {
      setExportLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/api/admin/analytics/export?format=${format}&period=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export report');
      }

      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `fiquant-analytics-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error exporting report:', error);
      setError(error.message);
    } finally {
      setExportLoading(false);
    }
  };

  const getPeriodLabel = (period) => {
    const labels = {
      '1d': 'Last 24 Hours',
      '7d': 'Last 7 Days',
      '30d': 'Last 30 Days'
    };
    return labels[period] || period;
  };

  if (loading) {
    return (
      <Card className="bg-white shadow-lg">
        <CardContent className="p-6 text-center">
          <TrendingUp className="h-8 w-8 animate-pulse mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading analytics...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Analytics Header */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                Analytics Dashboard
              </CardTitle>
              <CardDescription>
                System usage and performance metrics
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <div className="flex border border-gray-200 rounded-lg">
                {['1d', '7d', '30d'].map((period) => (
                  <Button
                    key={period}
                    variant={selectedPeriod === period ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedPeriod(period)}
                    className={`rounded-none first:rounded-l-lg last:rounded-r-lg ${
                      selectedPeriod === period ? 'bg-purple-600 hover:bg-purple-700' : ''
                    }`}
                  >
                    {getPeriodLabel(period)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Button
              onClick={() => exportReport('excel')}
              disabled={exportLoading}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button
              onClick={() => exportReport('pdf')}
              disabled={exportLoading}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button
              onClick={() => exportReport('csv')}
              disabled={exportLoading}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {analytics && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Users</p>
                    <p className="text-3xl font-bold">{analytics.user_stats.total_users}</p>
                    <p className="text-blue-100 text-xs mt-1">
                      +{analytics.user_stats.recent_registrations} new this period
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Active Users</p>
                    <p className="text-3xl font-bold">{analytics.user_stats.active_users}</p>
                    <p className="text-green-100 text-xs mt-1">
                      {Math.round((analytics.user_stats.active_users / analytics.user_stats.total_users) * 100)}% of total
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Total Calculations</p>
                    <p className="text-3xl font-bold">{analytics.calculation_stats.total_calculations}</p>
                    <p className="text-purple-100 text-xs mt-1">
                      This {selectedPeriod === '1d' ? 'day' : selectedPeriod === '7d' ? 'week' : 'month'}
                    </p>
                  </div>
                  <Calculator className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Verified Users</p>
                    <p className="text-3xl font-bold">{analytics.user_stats.verified_users}</p>
                    <p className="text-orange-100 text-xs mt-1">
                      {Math.round((analytics.user_stats.verified_users / analytics.user_stats.total_users) * 100)}% verified
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Calculator Usage */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="h-5 w-5 mr-2 text-blue-600" />
                  Calculator Usage Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-3 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">PAYE Calculations</p>
                      <p className="text-sm text-blue-700">Personal Income Tax</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-blue-800">
                      {analytics.calculation_stats.paye_calculations}
                    </p>
                    <p className="text-sm text-blue-600">
                      {Math.round((analytics.calculation_stats.paye_calculations / analytics.calculation_stats.total_calculations) * 100)}%
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <Building2 className="h-5 w-5 mr-3 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">CIT Calculations</p>
                      <p className="text-sm text-green-700">Corporate Income Tax</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-800">
                      {analytics.calculation_stats.cit_calculations}
                    </p>
                    <p className="text-sm text-green-600">
                      {Math.round((analytics.calculation_stats.cit_calculations / analytics.calculation_stats.total_calculations) * 100)}%
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Total Calculations</span>
                    <span className="text-xl font-bold text-purple-600">
                      {analytics.calculation_stats.total_calculations}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Growth */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  User Growth & Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                    <p className="text-2xl font-bold text-blue-800">
                      {analytics.user_stats.total_users}
                    </p>
                    <p className="text-sm text-blue-600 font-medium">Total Users</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                    <p className="text-2xl font-bold text-green-800">
                      {analytics.user_stats.active_users}
                    </p>
                    <p className="text-sm text-green-600 font-medium">Active Users</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                    <p className="text-2xl font-bold text-purple-800">
                      {analytics.user_stats.verified_users}
                    </p>
                    <p className="text-sm text-purple-600 font-medium">Verified Users</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
                    <p className="text-2xl font-bold text-orange-800">
                      {analytics.user_stats.recent_registrations}
                    </p>
                    <p className="text-sm text-orange-600 font-medium">New This Period</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Key Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">User Verification Rate:</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {Math.round((analytics.user_stats.verified_users / analytics.user_stats.total_users) * 100)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active User Rate:</span>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {Math.round((analytics.user_stats.active_users / analytics.user_stats.total_users) * 100)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Growth Rate:</span>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700">
                        +{analytics.user_stats.recent_registrations} users
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Report Summary */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-gray-600" />
                Report Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Report Period:</strong> {getPeriodLabel(selectedPeriod)}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Generated:</strong> {new Date(analytics.generated_at).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Data Points:</strong> User statistics, calculation metrics, growth trends
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};