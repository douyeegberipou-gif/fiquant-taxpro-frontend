import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Users, 
  Search, 
  Filter, 
  UserX, 
  UserCheck, 
  Settings, 
  Eye,
  Edit3,
  Trash2,
  Shield,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Mail
} from 'lucide-react';

export const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  const API_URL = process.env.REACT_APP_BACKEND_URL;
  const usersPerPage = 20;

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: usersPerPage.toString(),
      });

      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status_filter', statusFilter);

      const response = await fetch(`${API_URL}/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to load users');
      }

      const data = await response.json();
      setUsers(data.users);
      setTotalPages(data.total_pages);
      setTotalUsers(data.total_count);
    } catch (error) {
      console.error('Error loading users:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId, newStatus) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/api/admin/users/${userId}/status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ account_status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update user status');
      }

      // Refresh users list
      await loadUsers();
      setError(null);
    } catch (error) {
      console.error('Error updating user status:', error);
      setError(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const assignAdminRole = async (userId, adminRole, adminEnabled) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/api/admin/users/${userId}/role`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          admin_role: adminRole,
          admin_enabled: adminEnabled
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to assign admin role');
      }

      // Refresh users list
      await loadUsers();
      setError(null);
    } catch (error) {
      console.error('Error assigning admin role:', error);
      setError(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const resendVerificationEmail = async (userEmail) => {
    try {
      setActionLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: userEmail })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to resend verification email');
      }

      alert(`Verification email sent to ${userEmail}`);
      await loadUsers(); // Refresh users list
    } catch (error) {
      console.error('Error resending verification email:', error);
      setError(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status === statusFilter ? '' : status);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      suspended: { color: 'bg-red-100 text-red-800', label: 'Suspended' },
      inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inactive' }
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    return (
      <Badge className={`${config.color} border-0`}>
        {config.label}
      </Badge>
    );
  };

  const getAdminRoleBadge = (role) => {
    if (!role) return null;
    
    const roleConfig = {
      super_admin: { color: 'bg-purple-100 text-purple-800', label: 'Super Admin' },
      user_manager: { color: 'bg-blue-100 text-blue-800', label: 'User Manager' },
      analytics_viewer: { color: 'bg-green-100 text-green-800', label: 'Analytics Viewer' },
      system_monitor: { color: 'bg-orange-100 text-orange-800', label: 'System Monitor' }
    };
    
    const config = roleConfig[role] || { color: 'bg-gray-100 text-gray-800', label: role };
    return (
      <Badge className={`${config.color} border-0`}>
        <Shield className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  if (loading && users.length === 0) {
    return (
      <Card className="bg-white shadow-lg">
        <CardContent className="p-6 text-center">
          <Users className="h-8 w-8 animate-pulse mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading users...</p>
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

      {/* Search and Filters */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-600" />
            User Management
          </CardTitle>
          <CardDescription>
            Manage user accounts, roles, and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search users by email, name, or phone..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusFilter('active')}
                className={statusFilter === 'active' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                <UserCheck className="h-4 w-4 mr-1" />
                Active
              </Button>
              <Button
                variant={statusFilter === 'suspended' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusFilter('suspended')}
                className={statusFilter === 'suspended' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                <UserX className="h-4 w-4 mr-1" />
                Suspended
              </Button>
              <Button
                variant={statusFilter === 'inactive' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusFilter('inactive')}
                className={statusFilter === 'inactive' ? 'bg-gray-600 hover:bg-gray-700' : ''}
              >
                <Filter className="h-4 w-4 mr-1" />
                Inactive
              </Button>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Account Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Admin Role</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Joined</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{user.full_name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        {user.phone && (
                          <p className="text-xs text-gray-400">{user.phone}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="capitalize">
                        {user.account_type} - {user.account_tier}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(user.account_status)}
                    </td>
                    <td className="py-3 px-4">
                      {getAdminRoleBadge(user.admin_role)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        {user.account_status === 'active' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateUserStatus(user.id, 'suspended')}
                            disabled={actionLoading}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <UserX className="h-3 w-3 mr-1" />
                            Suspend
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateUserStatus(user.id, 'active')}
                            disabled={actionLoading}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                          >
                            <UserCheck className="h-3 w-3 mr-1" />
                            Activate
                          </Button>
                        )}
                        
                        {!user.admin_enabled && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => assignAdminRole(user.id, 'user_manager', true)}
                            disabled={actionLoading}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            Make Admin
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resendVerificationEmail(user.email)}
                          disabled={actionLoading}
                          className="text-purple-600 border-purple-200 hover:bg-purple-50"
                          title="Resend verification email"
                        >
                          <Mail className="h-3 w-3 mr-1" />
                          Resend
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && !loading && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No users found</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-700">
                Showing {((currentPage - 1) * usersPerPage) + 1} to{' '}
                {Math.min(currentPage * usersPerPage, totalUsers)} of{' '}
                {totalUsers} users
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
        </CardContent>
      </Card>
    </div>
  );
};