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
  PieChart,
  MousePointer,
  Eye,
  Smartphone,
  Monitor,
  Globe,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [trafficAnalytics, setTrafficAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [activeView, setActiveView] = useState('overview'); // overview, traffic, engagement
  const [exportLoading, setExportLoading] = useState(false);

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    loadAllAnalytics();
  }, [selectedPeriod]);

  const loadAllAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Load both analytics endpoints in parallel
      const [dashboardRes, trafficRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/analytics/dashboard?period=${selectedPeriod}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${API_URL}/api/admin/analytics/traffic?period=${selectedPeriod}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (!dashboardRes.ok) {
        const errorData = await dashboardRes.json();
        throw new Error(errorData.detail || 'Failed to load analytics');
      }

      const dashboardData = await dashboardRes.json();
      setAnalytics(dashboardData);

      if (trafficRes.ok) {
        const trafficData = await trafficRes.json();
        setTrafficAnalytics(trafficData);
      }
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

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                Analytics Dashboard
              </CardTitle>
              <CardDescription>
                System usage, traffic, and engagement metrics
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              {/* View Selector */}
              <div className="flex border border-gray-200 rounded-lg">
                {[
                  { key: 'overview', label: 'Overview', icon: BarChart3 },
                  { key: 'traffic', label: 'Traffic', icon: Globe },
                  { key: 'engagement', label: 'Engagement', icon: MousePointer }
                ].map(({ key, label, icon: Icon }) => (
                  <Button
                    key={key}
                    variant={activeView === key ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveView(key)}
                    className={`rounded-none first:rounded-l-lg last:rounded-r-lg ${
                      activeView === key ? 'bg-purple-600 hover:bg-purple-700' : ''
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-1" />
                    {label}
                  </Button>
                ))}
              </div>
              
              {/* Period Selector */}
              <div className="flex border border-gray-200 rounded-lg">
                {['1d', '7d', '30d'].map((period) => (
                  <Button
                    key={period}
                    variant={selectedPeriod === period ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedPeriod(period)}
                    className={`rounded-none first:rounded-l-lg last:rounded-r-lg ${
                      selectedPeriod === period ? 'bg-blue-600 hover:bg-blue-700' : ''
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

      {/* Overview View */}
      {activeView === 'overview' && analytics && (
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
                      {analytics.user_stats.total_users > 0 ? Math.round((analytics.user_stats.active_users / analytics.user_stats.total_users) * 100) : 0}% of total
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
                    <p className="text-orange-100 text-sm font-medium">Total Visits</p>
                    <p className="text-3xl font-bold">{formatNumber(trafficAnalytics?.total_visits || 0)}</p>
                    <p className="text-orange-100 text-xs mt-1">
                      {trafficAnalytics?.unique_sessions || 0} unique sessions
                    </p>
                  </div>
                  <Eye className="h-8 w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calculator Usage */}
          <div className="grid lg:grid-cols-2 gap-6">
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
                      {analytics.calculation_stats.total_calculations > 0 ? Math.round((analytics.calculation_stats.paye_calculations / analytics.calculation_stats.total_calculations) * 100) : 0}%
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
                      {analytics.calculation_stats.total_calculations > 0 ? Math.round((analytics.calculation_stats.cit_calculations / analytics.calculation_stats.total_calculations) * 100) : 0}%
                    </p>
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
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Traffic View */}
      {activeView === 'traffic' && trafficAnalytics && (
        <>
          {/* Traffic Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100 text-sm font-medium">Total Page Views</p>
                    <p className="text-3xl font-bold">{formatNumber(trafficAnalytics.total_visits)}</p>
                    <p className="text-indigo-100 text-xs mt-1">
                      All visits this period
                    </p>
                  </div>
                  <Eye className="h-8 w-8 text-indigo-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-100 text-sm font-medium">Unique Sessions</p>
                    <p className="text-3xl font-bold">{formatNumber(trafficAnalytics.unique_sessions)}</p>
                    <p className="text-cyan-100 text-xs mt-1">
                      Individual browser sessions
                    </p>
                  </div>
                  <Globe className="h-8 w-8 text-cyan-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium">Desktop Visits</p>
                    <p className="text-3xl font-bold">{formatNumber(trafficAnalytics.desktop_visits)}</p>
                    <p className="text-emerald-100 text-xs mt-1">
                      {trafficAnalytics.total_visits > 0 ? Math.round((trafficAnalytics.desktop_visits / trafficAnalytics.total_visits) * 100) : 0}% of traffic
                    </p>
                  </div>
                  <Monitor className="h-8 w-8 text-emerald-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pink-100 text-sm font-medium">Mobile Visits</p>
                    <p className="text-3xl font-bold">{formatNumber(trafficAnalytics.mobile_visits)}</p>
                    <p className="text-pink-100 text-xs mt-1">
                      {trafficAnalytics.total_visits > 0 ? Math.round((trafficAnalytics.mobile_visits / trafficAnalytics.total_visits) * 100) : 0}% of traffic
                    </p>
                  </div>
                  <Smartphone className="h-8 w-8 text-pink-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tab/Module Visits */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
                  Visits by Tab/Module
                </CardTitle>
                <CardDescription>
                  Which sections are getting the most traffic
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trafficAnalytics.top_modules && trafficAnalytics.top_modules.length > 0 ? (
                    trafficAnalytics.top_modules.map((module, index) => {
                      const maxVisits = trafficAnalytics.top_modules[0]?.visits || 1;
                      const percentage = Math.round((module.visits / maxVisits) * 100);
                      const colors = [
                        'bg-indigo-500',
                        'bg-blue-500',
                        'bg-cyan-500',
                        'bg-teal-500',
                        'bg-green-500',
                        'bg-emerald-500',
                        'bg-yellow-500',
                        'bg-orange-500',
                        'bg-red-500',
                        'bg-pink-500'
                      ];
                      
                      return (
                        <div key={module.name} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700 capitalize">
                              {module.name.replace(/_/g, ' ')}
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                              {formatNumber(module.visits)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${colors[index % colors.length]}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Eye className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No traffic data yet</p>
                      <p className="text-sm">Data will appear as users visit different tabs</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Daily Traffic Breakdown */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  Daily Traffic Breakdown
                </CardTitle>
                <CardDescription>
                  Visits over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {trafficAnalytics.daily_breakdown && trafficAnalytics.daily_breakdown.length > 0 ? (
                    trafficAnalytics.daily_breakdown.slice(-7).map((day, index) => {
                      const maxVisits = Math.max(...trafficAnalytics.daily_breakdown.map(d => d.visits)) || 1;
                      const percentage = Math.round((day.visits / maxVisits) * 100);
                      
                      return (
                        <div key={day.date} className="flex items-center space-x-3">
                          <span className="text-xs text-gray-500 w-20">
                            {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                          <div className="flex-1 bg-gray-200 rounded-full h-4">
                            <div
                              className="h-4 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-end pr-2"
                              style={{ width: `${Math.max(percentage, 10)}%` }}
                            >
                              <span className="text-[10px] text-white font-medium">
                                {day.visits}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No daily data yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Engagement View */}
      {activeView === 'engagement' && trafficAnalytics && (
        <>
          {/* Click Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-r from-violet-500 to-violet-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-violet-100 text-sm font-medium">Total Clicks</p>
                    <p className="text-3xl font-bold">
                      {formatNumber(trafficAnalytics.click_counts?.total || 0)}
                    </p>
                    <p className="text-violet-100 text-xs mt-1">
                      All interactions this period
                    </p>
                  </div>
                  <MousePointer className="h-8 w-8 text-violet-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-fuchsia-500 to-fuchsia-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-fuchsia-100 text-sm font-medium">Unique Users</p>
                    <p className="text-3xl font-bold">
                      {formatNumber(trafficAnalytics.unique_users)}
                    </p>
                    <p className="text-fuchsia-100 text-xs mt-1">
                      Authenticated visitors
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-fuchsia-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-rose-500 to-rose-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-rose-100 text-sm font-medium">Clicks per Session</p>
                    <p className="text-3xl font-bold">
                      {trafficAnalytics.unique_sessions > 0 
                        ? ((trafficAnalytics.click_counts?.total || 0) / trafficAnalytics.unique_sessions).toFixed(1)
                        : '0'}
                    </p>
                    <p className="text-rose-100 text-xs mt-1">
                      Average engagement rate
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-rose-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Click Breakdown by Module */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MousePointer className="h-5 w-5 mr-2 text-violet-600" />
                Clicks by Module
              </CardTitle>
              <CardDescription>
                Which modules are getting the most user interaction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trafficAnalytics.click_counts && Object.keys(trafficAnalytics.click_counts).length > 0 ? (
                  Object.entries(trafficAnalytics.click_counts)
                    .filter(([key]) => key !== 'total')
                    .sort(([, a], [, b]) => b - a)
                    .map(([module, clicks], index) => {
                      const totalClicks = trafficAnalytics.click_counts.total || 1;
                      const percentage = Math.round((clicks / totalClicks) * 100);
                      const colors = [
                        'from-indigo-400 to-indigo-600',
                        'from-blue-400 to-blue-600',
                        'from-cyan-400 to-cyan-600',
                        'from-teal-400 to-teal-600',
                        'from-green-400 to-green-600',
                        'from-emerald-400 to-emerald-600',
                        'from-yellow-400 to-yellow-600',
                        'from-orange-400 to-orange-600',
                        'from-red-400 to-red-600',
                        'from-pink-400 to-pink-600'
                      ];
                      
                      return (
                        <div 
                          key={module} 
                          className={`p-4 rounded-lg bg-gradient-to-r ${colors[index % colors.length]} text-white`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium opacity-90 capitalize">
                                {module.replace(/_/g, ' ')}
                              </p>
                              <p className="text-2xl font-bold mt-1">
                                {formatNumber(clicks)}
                              </p>
                            </div>
                            <Badge className="bg-white/20 text-white border-0">
                              {percentage}%
                            </Badge>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    <MousePointer className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No click data yet</p>
                    <p className="text-sm">Click analytics will appear as users interact with the app</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ad Analytics */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2 text-amber-600" />
                Ad Performance
              </CardTitle>
              <CardDescription>
                Track ad impressions, clicks, and engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                {/* Ad Clicks */}
                <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
                  <div className="w-12 h-12 mx-auto mb-2 bg-amber-200 rounded-full flex items-center justify-center">
                    <MousePointer className="h-6 w-6 text-amber-700" />
                  </div>
                  <p className="text-2xl font-bold text-amber-800">
                    {trafficAnalytics.click_counts?.['Ad Clicks'] || 0}
                  </p>
                  <p className="text-xs text-amber-600 font-medium">Ad Clicks</p>
                </div>
                
                {/* Ad Impressions */}
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                  <div className="w-12 h-12 mx-auto mb-2 bg-blue-200 rounded-full flex items-center justify-center">
                    <Eye className="h-6 w-6 text-blue-700" />
                  </div>
                  <p className="text-2xl font-bold text-blue-800">
                    {trafficAnalytics.click_counts?.['Advertisements'] || 0}
                  </p>
                  <p className="text-xs text-blue-600 font-medium">Impressions</p>
                </div>
                
                {/* Rewarded Ads */}
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                  <div className="w-12 h-12 mx-auto mb-2 bg-green-200 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-700" />
                  </div>
                  <p className="text-2xl font-bold text-green-800">
                    {trafficAnalytics.click_counts?.['Rewarded Ads'] || 0}
                  </p>
                  <p className="text-xs text-green-600 font-medium">Rewarded Completions</p>
                </div>
                
                {/* Ad Dismissals */}
                <div className="text-center p-4 bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl">
                  <div className="w-12 h-12 mx-auto mb-2 bg-rose-200 rounded-full flex items-center justify-center">
                    <Activity className="h-6 w-6 text-rose-700" />
                  </div>
                  <p className="text-2xl font-bold text-rose-800">
                    {trafficAnalytics.click_counts?.['Ad Dismissals'] || 0}
                  </p>
                  <p className="text-xs text-rose-600 font-medium">Dismissals</p>
                </div>
              </div>
              
              {/* CTR Calculation */}
              {(trafficAnalytics.click_counts?.['Advertisements'] > 0 || trafficAnalytics.click_counts?.['Ad Clicks'] > 0) && (
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-amber-100 text-sm">Ad Click-Through Rate (CTR)</p>
                      <p className="text-2xl font-bold">
                        {trafficAnalytics.click_counts?.['Advertisements'] > 0 
                          ? ((trafficAnalytics.click_counts?.['Ad Clicks'] || 0) / trafficAnalytics.click_counts['Advertisements'] * 100).toFixed(1)
                          : '0.0'}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-amber-100 text-sm">Rewarded Completion Rate</p>
                      <p className="text-2xl font-bold">
                        {(trafficAnalytics.click_counts?.['Advertisements'] || 0) > 0 
                          ? ((trafficAnalytics.click_counts?.['Rewarded Ads'] || 0) / ((trafficAnalytics.click_counts?.['Advertisements'] || 1)) * 100).toFixed(1)
                          : '0.0'}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Engagement Insights */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-emerald-600" />
                Engagement Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                  <div className="w-16 h-16 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                    <Eye className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold text-blue-800">
                    {trafficAnalytics.unique_sessions > 0 
                      ? (trafficAnalytics.total_visits / trafficAnalytics.unique_sessions).toFixed(1)
                      : '0'}
                  </p>
                  <p className="text-sm text-blue-600 font-medium">Pages per Session</p>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                  <div className="w-16 h-16 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-3xl font-bold text-green-800">
                    {trafficAnalytics.unique_sessions > 0 
                      ? Math.round((trafficAnalytics.unique_users / trafficAnalytics.unique_sessions) * 100)
                      : 0}%
                  </p>
                  <p className="text-sm text-green-600 font-medium">Auth Rate</p>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl">
                  <div className="w-16 h-16 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center">
                    <Smartphone className="h-8 w-8 text-purple-600" />
                  </div>
                  <p className="text-3xl font-bold text-purple-800">
                    {trafficAnalytics.total_visits > 0 
                      ? Math.round((trafficAnalytics.mobile_visits / trafficAnalytics.total_visits) * 100)
                      : 0}%
                  </p>
                  <p className="text-sm text-purple-600 font-medium">Mobile Traffic</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

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
              <strong>Generated:</strong> {analytics ? new Date(analytics.generated_at).toLocaleString() : 'N/A'}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Data Points:</strong> User statistics, calculation metrics, traffic analytics, click engagement
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
