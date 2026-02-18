import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Users, 
  Building2, 
  TrendingUp, 
  Activity, 
  Shield, 
  Settings,
  Eye,
  UserX,
  UserCheck,
  Calendar,
  Download,
  Search,
  Filter,
  RefreshCw,
  RotateCw,
  Zap,
  Send,
  MessageSquare,
  Inbox
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AdminUserManagement } from './AdminUserManagement';
import { AdminAnalytics } from './AdminAnalytics';
import { AdminAuditLogs } from './AdminAuditLogs';
import { CarouselManager } from './CarouselManager';
import { TestimonialManager } from './TestimonialManager';
import MonetizationDashboard from './MonetizationDashboard';
import IntegrationManager from './IntegrationManager';
import MessagingDashboard from './MessagingDashboard';
import AdminInbox from './AdminInbox';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/api/admin/analytics/dashboard?period=7d`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to load dashboard data');
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  if (!user?.admin_enabled || !user?.admin_role) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">
              You don't have admin privileges to access this dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading admin dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-gray-900 via-black to-gray-800 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center">
                <img 
                  src="/fiquant-logo-bold-diamond.png" 
                  alt="Fiquant Consult Logo" 
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-gray-300">Fiquant Consult Administration</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-yellow-400/10 text-yellow-300 border-yellow-400/30">
                {user?.admin_role?.replace('_', ' ').toUpperCase()}
              </Badge>
              <Button
                onClick={() => {
                  window.history.pushState({}, '', '/');
                  window.location.reload();
                }}
                variant="outline"
                size="sm"
                className="border-green-600 text-green-300 hover:bg-green-800/50"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Main App
              </Button>
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-800/50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Stats */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white border-blue-100 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total Users</p>
                    <p className="text-2xl font-bold text-blue-800">
                      {dashboardData.user_stats.total_users}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-green-100 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Active Users</p>
                    <p className="text-2xl font-bold text-green-800">
                      {dashboardData.user_stats.active_users}
                    </p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-purple-100 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Total Calculations</p>
                    <p className="text-2xl font-bold text-purple-800">
                      {dashboardData.calculation_stats.total_calculations}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-orange-100 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 font-medium">New Registrations</p>
                    <p className="text-2xl font-bold text-orange-800">
                      {dashboardData.user_stats.recent_registrations}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Admin Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-9 bg-white border border-gray-200">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <Activity className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700"
            >
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="audit" 
              className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700"
            >
              <Eye className="h-4 w-4 mr-2" />
              Audit
            </TabsTrigger>
            <TabsTrigger 
              value="carousel" 
              className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
            >
              <RotateCw className="h-4 w-4 mr-2" />
              Carousel
            </TabsTrigger>
            <TabsTrigger 
              value="testimonials" 
              className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Testimonials
            </TabsTrigger>
            <TabsTrigger 
              value="monetization" 
              className="data-[state=active]:bg-yellow-50 data-[state=active]:text-yellow-700"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Monetization
            </TabsTrigger>
            <TabsTrigger 
              value="integrations" 
              className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700"
            >
              <Zap className="h-4 w-4 mr-2" />
              Integrations
            </TabsTrigger>
            <TabsTrigger 
              value="messaging" 
              className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Messaging
            </TabsTrigger>
            <TabsTrigger 
              value="inbox" 
              className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700"
            >
              <Inbox className="h-4 w-4 mr-2" />
              Inbox
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                    Calculator Usage (Last 7 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardData && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">PAYE Calculations</span>
                        <span className="font-semibold text-blue-600">
                          {dashboardData.calculation_stats.paye_calculations}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">CIT Calculations</span>
                        <span className="font-semibold text-green-600">
                          {dashboardData.calculation_stats.cit_calculations}
                        </span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between items-center font-semibold">
                          <span>Total</span>
                          <span className="text-purple-600">
                            {dashboardData.calculation_stats.total_calculations}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserCheck className="h-5 w-5 mr-2 text-green-600" />
                    User Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardData && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Verified Users</span>
                        <span className="font-semibold text-green-600">
                          {dashboardData.user_stats.verified_users}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Active Users</span>
                        <span className="font-semibold text-blue-600">
                          {dashboardData.user_stats.active_users}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Recent Registrations</span>
                        <span className="font-semibold text-orange-600">
                          {dashboardData.user_stats.recent_registrations}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <AdminUserManagement />
          </TabsContent>

          <TabsContent value="analytics">
            <AdminAnalytics />
          </TabsContent>

          <TabsContent value="audit">
            <AdminAuditLogs />
          </TabsContent>

          <TabsContent value="carousel">
            <CarouselManager />
          </TabsContent>

          <TabsContent value="testimonials">
            <TestimonialManager />
          </TabsContent>

          <TabsContent value="monetization">
            <MonetizationDashboard />
          </TabsContent>

          <TabsContent value="integrations">
            <IntegrationManager />
          </TabsContent>

          <TabsContent value="messaging">
            <MessagingDashboard />
          </TabsContent>

          <TabsContent value="inbox">
            <AdminInbox />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};