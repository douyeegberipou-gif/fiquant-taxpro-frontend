import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Eye, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Settings, 
  Activity,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  Monitor,
  AlertTriangle
} from 'lucide-react';

export const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  const API_URL = process.env.REACT_APP_BACKEND_URL;
  const logsPerPage = 25;

  useEffect(() => {
    loadAuditLogs();
  }, [currentPage, actionFilter]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: logsPerPage.toString(),
      });

      if (actionFilter) params.append('action_filter', actionFilter);

      const response = await fetch(`${API_URL}/api/admin/audit-logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Handle different response types
        let errorMessage = 'Failed to load audit logs';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch (parseError) {
          // If response is not JSON, use the status text
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error('Invalid response format from server');
      }

      // Handle case where no logs exist yet
      setLogs(data.logs || []);
      setTotalPages(data.total_pages || 1);
      setTotalLogs(data.total_count || 0);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    // Implement client-side filtering for loaded logs
  };

  const handleActionFilter = (action) => {
    setActionFilter(action === actionFilter ? '' : action);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const getActionBadge = (action) => {
    const actionConfig = {
      view_users: { color: 'bg-blue-100 text-blue-800', icon: Eye, label: 'View Users' },
      view_analytics: { color: 'bg-green-100 text-green-800', icon: Activity, label: 'View Analytics' },
      user_status_updated: { color: 'bg-orange-100 text-orange-800', icon: User, label: 'Status Updated' },
      role_assigned: { color: 'bg-purple-100 text-purple-800', icon: Settings, label: 'Role Assigned' },
      view_logs: { color: 'bg-gray-100 text-gray-800', icon: Eye, label: 'View Logs' },
      view_system: { color: 'bg-red-100 text-red-800', icon: Monitor, label: 'View System' },
      bulk_operation: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle, label: 'Bulk Operation' }
    };
    
    const config = actionConfig[action] || { 
      color: 'bg-gray-100 text-gray-800', 
      icon: Activity, 
      label: action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    };
    
    const IconComponent = config.icon;
    
    return (
      <Badge className={`${config.color} border-0 flex items-center`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getTargetTypeBadge = (targetType) => {
    const typeConfig = {
      user: { color: 'bg-blue-50 text-blue-700', label: 'User' },
      system: { color: 'bg-green-50 text-green-700', label: 'System' },
      report: { color: 'bg-purple-50 text-purple-700', label: 'Report' },
      analytics: { color: 'bg-orange-50 text-orange-700', label: 'Analytics' }
    };
    
    const config = typeConfig[targetType] || { color: 'bg-gray-50 text-gray-700', label: targetType };
    
    return (
      <Badge variant="outline" className={`${config.color} border-0 text-xs`}>
        {config.label}
      </Badge>
    );
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    };
  };

  // Filter logs based on search term (client-side)
  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      log.admin_email.toLowerCase().includes(searchLower) ||
      log.action.toLowerCase().includes(searchLower) ||
      log.target_type.toLowerCase().includes(searchLower) ||
      (log.ip_address && log.ip_address.includes(searchTerm))
    );
  });

  if (loading && logs.length === 0) {
    return (
      <Card className="bg-white shadow-lg">
        <CardContent className="p-6 text-center">
          <Eye className="h-8 w-8 animate-pulse mx-auto mb-4 text-orange-600" />
          <p className="text-gray-600">Loading audit logs...</p>
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

      {/* Audit Logs Header */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2 text-orange-600" />
            Audit Logs
          </CardTitle>
          <CardDescription>
            Track all administrative actions and system access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by admin email, action, or IP address..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={actionFilter === 'view_users' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleActionFilter('view_users')}
                className={actionFilter === 'view_users' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                <Eye className="h-4 w-4 mr-1" />
                User Views
              </Button>
              <Button
                variant={actionFilter === 'user_status_updated' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleActionFilter('user_status_updated')}
                className={actionFilter === 'user_status_updated' ? 'bg-orange-600 hover:bg-orange-700' : ''}
              >
                <User className="h-4 w-4 mr-1" />
                Status Updates
              </Button>
              <Button
                variant={actionFilter === 'role_assigned' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleActionFilter('role_assigned')}
                className={actionFilter === 'role_assigned' ? 'bg-purple-600 hover:bg-purple-700' : ''}
              >
                <Settings className="h-4 w-4 mr-1" />
                Role Changes
              </Button>
              <Button
                variant={actionFilter === 'view_analytics' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleActionFilter('view_analytics')}
                className={actionFilter === 'view_analytics' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                <Activity className="h-4 w-4 mr-1" />
                Analytics
              </Button>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Timestamp</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Admin</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Action</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Target</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Details</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Source</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const timestamp = formatTimestamp(log.timestamp);
                  return (
                    <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center text-sm">
                          <Clock className="h-3 w-3 mr-2 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{timestamp.date}</p>
                            <p className="text-gray-500">{timestamp.time}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="text-sm font-medium text-gray-900">
                            {log.admin_email}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getActionBadge(log.action)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          {getTargetTypeBadge(log.target_type)}
                          {log.target_id && (
                            <p className="text-xs text-gray-500 font-mono">
                              ID: {log.target_id.substring(0, 8)}...
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {log.details && Object.keys(log.details).length > 0 ? (
                          <div className="text-xs text-gray-600">
                            {Object.entries(log.details).map(([key, value]) => (
                              <div key={key} className="mb-1">
                                <span className="font-medium">{key}:</span> {JSON.stringify(value)}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No details</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs text-gray-600">
                          {log.ip_address && (
                            <div className="flex items-center mb-1">
                              <Globe className="h-3 w-3 mr-1" />
                              {log.ip_address}
                            </div>
                          )}
                          {log.user_agent && (
                            <div className="flex items-center">
                              <Monitor className="h-3 w-3 mr-1" />
                              <span className="truncate max-w-32">
                                {log.user_agent.split(' ')[0]}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredLogs.length === 0 && !loading && (
            <div className="text-center py-8">
              <Eye className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">
                {searchTerm || actionFilter ? 'No logs match your filters' : 'No audit logs found'}
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-700">
                Showing {((currentPage - 1) * logsPerPage) + 1} to{' '}
                {Math.min(currentPage * logsPerPage, totalLogs)} of{' '}
                {totalLogs} audit logs
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Audit Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Total Logs:</p>
                <p className="font-semibold">{totalLogs}</p>
              </div>
              <div>
                <p className="text-gray-600">Unique Admins:</p>
                <p className="font-semibold">
                  {new Set(logs.map(log => log.admin_email)).size}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Actions Today:</p>
                <p className="font-semibold">
                  {logs.filter(log => {
                    const logDate = new Date(log.timestamp).toDateString();
                    const today = new Date().toDateString();
                    return logDate === today;
                  }).length}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Most Common Action:</p>
                <p className="font-semibold">
                  {logs.length > 0 ? 
                    Object.entries(
                      logs.reduce((acc, log) => {
                        acc[log.action] = (acc[log.action] || 0) + 1;
                        return acc;
                      }, {})
                    ).sort(([,a], [,b]) => b - a)[0]?.[0]?.replace('_', ' ') || 'N/A'
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};