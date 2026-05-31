import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Eye, 
  Settings, 
  UserPlus, 
  CreditCard, 
  BarChart3,
  Calendar,
  Activity,
  Award,
  Target
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function MonetizationDashboard() {
  const [analytics, setAnalytics] = useState({});
  const [tiers, setTiers] = useState([]);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Form states
  const [manualChange, setManualChange] = useState({
    user_id: '',
    action: 'upgrade',
    tier: 'pro',
    duration_months: 1,
    reason: ''
  });

  useEffect(() => {
    fetchAnalytics();
    fetchTiers();
    fetchUsers();
    fetchEvents();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/admin/monetization/analytics/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchTiers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/admin/monetization/tiers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTiers(response.data);
    } catch (error) {
      console.error('Error fetching tiers:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/admin/monetization/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/admin/monetization/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const applyManualChange = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${BACKEND_URL}/api/admin/monetization/manual-change`, manualChange, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Manual subscription change applied successfully!');
      setManualChange({
        user_id: '',
        action: 'upgrade',
        tier: 'pro',
        duration_months: 1,
        reason: ''
      });
      
      // Refresh data
      fetchUsers();
      fetchEvents();
      fetchAnalytics();
    } catch (error) {
      console.error('Error applying manual change:', error);
      alert('Error applying manual change. Please try again.');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Monetization Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage subscriptions, analytics, and revenue</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => window.location.reload()} variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="tiers">Tiers</TabsTrigger>
          <TabsTrigger value="manual">Manual Actions</TabsTrigger>
          <TabsTrigger value="logs">Event Logs</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.total_users || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Active Users</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.mau || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Daily Active Users</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.dau || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${analytics.ad_revenue_data?.reduce((sum, day) => sum + (day.estimated_revenue || 0), 0)?.toFixed(2) || '0.00'}
                </div>
                <p className="text-xs text-muted-foreground">Est. ad revenue (30 days)</p>
              </CardContent>
            </Card>
          </div>

          {/* Subscription Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Subscription Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(analytics.subscription_stats || {}).map(([tier, count]) => (
                  <div key={tier} className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{count}</div>
                    <div className="text-sm text-gray-600 capitalize">{tier} Users</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Conversion Funnel */}
          {analytics.funnel_data && analytics.funnel_data.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Conversion Funnel (Last 30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {['total_registrations', 'demo_activations', 'trial_activations', 'trial_conversions', 'total_paid_users'].map((metric) => {
                    const total = analytics.funnel_data.reduce((sum, day) => sum + (day[metric] || 0), 0);
                    return (
                      <div key={metric} className="text-center p-4 border rounded-lg">
                        <div className="text-xl font-bold text-green-600">{total}</div>
                        <div className="text-xs text-gray-600">
                          {metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Subscriptions</CardTitle>
              <CardDescription>View and manage user subscription status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{user.full_name}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                      <div className="text-xs text-gray-500">
                        Joined: {formatDate(user.created_at)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge 
                        variant={user.account_tier === 'free' ? 'secondary' : 'default'}
                        className={
                          user.account_tier === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                          user.account_tier === 'premium' ? 'bg-yellow-100 text-yellow-800' :
                          user.account_tier === 'pro' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }
                      >
                        {user.account_tier?.toUpperCase() || 'FREE'}
                      </Badge>
                      {user.trial && user.trial.status === 'TRIAL_ACTIVE' && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Trial Active
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                {users.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No users found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tiers Tab */}
        <TabsContent value="tiers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tier Configurations</CardTitle>
              <CardDescription>Manage pricing tiers and features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {['free', 'pro', 'premium', 'enterprise'].map((tier) => (
                  <Card key={tier}>
                    <CardHeader>
                      <CardTitle className="capitalize">{tier}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-sm">
                        <strong>Monthly:</strong> {tier === 'free' ? 'Free' : `₦${tier === 'pro' ? '9,999' : tier === 'premium' ? '19,999' : 'Custom'}`}
                      </div>
                      <div className="text-sm">
                        <strong>Staff Limit:</strong> {
                          tier === 'free' ? '5' :
                          tier === 'pro' ? '15' :
                          tier === 'premium' ? '50' : 'Unlimited'
                        }
                      </div>
                      <Button size="sm" variant="outline" className="w-full mt-2">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manual Actions Tab */}
        <TabsContent value="manual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manual Subscription Management</CardTitle>
              <CardDescription>Grant upgrades, trials, or enterprise contracts manually</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="user_id">User ID</Label>
                  <Input
                    id="user_id"
                    placeholder="Enter user ID"
                    value={manualChange.user_id}
                    onChange={(e) => setManualChange(prev => ({ ...prev, user_id: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="action">Action</Label>
                  <select
                    id="action"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={manualChange.action}
                    onChange={(e) => setManualChange(prev => ({ ...prev, action: e.target.value }))}
                  >
                    <option value="upgrade">Upgrade Subscription</option>
                    <option value="trial">Grant Trial</option>
                    <option value="enterprise">Enterprise Contract</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tier">Target Tier</Label>
                  <select
                    id="tier"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={manualChange.tier}
                    onChange={(e) => setManualChange(prev => ({ ...prev, tier: e.target.value }))}
                  >
                    <option value="pro">Pro</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (Months)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="Leave empty for permanent"
                    value={manualChange.duration_months}
                    onChange={(e) => setManualChange(prev => ({ ...prev, duration_months: parseInt(e.target.value) || null }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Input
                  id="reason"
                  placeholder="Reason for manual change"
                  value={manualChange.reason}
                  onChange={(e) => setManualChange(prev => ({ ...prev, reason: e.target.value }))}
                />
              </div>

              <Button 
                onClick={applyManualChange}
                disabled={!manualChange.user_id || !manualChange.reason}
                className="w-full"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Apply Manual Change
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Event Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Events</CardTitle>
              <CardDescription>View trial activations and subscription changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{event.event_type.replace(/_/g, ' ')}</div>
                      <div className="text-sm text-gray-600">
                        User: {event.user_id}
                        {event.from_tier && event.to_tier && (
                          <span> • {event.from_tier} → {event.to_tier}</span>
                        )}
                      </div>
                      {event.reason && (
                        <div className="text-xs text-gray-500">Reason: {event.reason}</div>
                      )}
                      <div className="text-xs text-gray-500">
                        {formatDate(event.created_at)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {event.admin_initiated && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          Admin Action
                        </Badge>
                      )}
                      <Badge 
                        variant={
                          event.event_type.includes('upgrade') || event.event_type.includes('trial_start') ? 'default' :
                          event.event_type.includes('cancel') || event.event_type.includes('trial_end') ? 'destructive' :
                          'secondary'
                        }
                      >
                        {event.event_type}
                      </Badge>
                    </div>
                  </div>
                ))}
                {events.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No events found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}