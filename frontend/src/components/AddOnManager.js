import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  CreditCard, 
  Users, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Calculator,
  Zap,
  Plus,
  Minus
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AddOnManager = () => {
  const [pricing, setPricing] = useState({});
  const [userBalances, setUserBalances] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form states
  const [employeeCount, setEmployeeCount] = useState('');
  const [chargePreview, setChargePreview] = useState(null);
  const [complianceRequest, setComplianceRequest] = useState({
    review_type: '',
    description: '',
    is_expedited: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [pricingResponse, balancesResponse] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/addons/pricing`),
        axios.get(`${BACKEND_URL}/api/addons/user/balances`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setPricing(pricingResponse.data);
      setUserBalances(balancesResponse.data);
    } catch (error) {
      console.error('Error fetching add-on data:', error);
      setError('Failed to load add-on information');
    } finally {
      setLoading(false);
    }
  };

  const previewBulkRunCharges = async () => {
    if (!employeeCount || employeeCount < 1) {
      setChargePreview(null);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/addons/bulk-run/preview-charges`, {
        params: { employee_count: parseInt(employeeCount) },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setChargePreview(response.data);
    } catch (error) {
      console.error('Error previewing charges:', error);
      setError('Failed to preview charges');
    }
  };

  const requestComplianceReview = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${BACKEND_URL}/api/addons/compliance-review/request`,
        complianceRequest,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert(`Compliance review requested successfully! Review ID: ${response.data.review_id}`);
      setComplianceRequest({ review_type: '', description: '', is_expedited: false });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error requesting compliance review:', error);
      alert(error.response?.data?.detail || 'Failed to request compliance review');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add-On Services</h1>
        <p className="text-gray-600 mt-2">Enhance your account with optional premium services</p>
      </div>

      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Pricing Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Extra Employees */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Extra Employees
            </CardTitle>
            <CardDescription>
              Expand your bulk processing capacity beyond plan limits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Per bulk run:</span>
                <span className="font-medium">{formatCurrency(pricing.extra_employees?.per_run_rate || 100)}/employee</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Monthly rate:</span>
                <span className="font-medium">{formatCurrency(pricing.extra_employees?.monthly_rate || 250)}/employee</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="employee-count">Preview Charges</Label>
              <div className="flex space-x-2">
                <Input
                  id="employee-count"
                  type="number"
                  placeholder="Employee count"
                  value={employeeCount}
                  onChange={(e) => {
                    setEmployeeCount(e.target.value);
                    if (e.target.value) {
                      previewBulkRunCharges();
                    } else {
                      setChargePreview(null);
                    }
                  }}
                />
                <Button onClick={previewBulkRunCharges} variant="outline">
                  <Calculator className="h-4 w-4" />
                </Button>
              </div>
              
              {chargePreview && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Your tier limit:</span>
                      <span className="font-medium">{chargePreview.tier_limit} employees</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Excess employees:</span>
                      <span className="font-medium text-orange-600">{chargePreview.excess_employees}</span>
                    </div>
                    <div className="flex justify-between border-t border-blue-300 pt-1">
                      <span className="font-medium">Charge per run:</span>
                      <span className="font-bold text-blue-600">{formatCurrency(chargePreview.total_charge)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* PDF Printing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-purple-600" />
              PDF Printing
            </CardTitle>
            <CardDescription>
              Generate PDF reports (Free tier only)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Per PDF:</span>
                <span className="font-medium">{formatCurrency(pricing.pdf_print?.rate || 200)}</span>
              </div>
              
              <Badge variant="outline" className="w-full justify-center">
                Auto-charged on PDF generation
              </Badge>
              
              <div className="text-xs text-gray-500">
                <strong>Note:</strong> Pro+ tiers get unlimited free PDF exports
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Review */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Compliance Review
            </CardTitle>
            <CardDescription>
              One-off professional compliance report review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Per review:</span>
                <span className="font-medium">{formatCurrency(pricing.compliance_review?.rate || 25000)}</span>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="review-type">Review Type</Label>
                <select
                  id="review-type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={complianceRequest.review_type}
                  onChange={(e) => setComplianceRequest(prev => ({...prev, review_type: e.target.value}))}
                >
                  <option value="">Select review type</option>
                  <option value="tax_computation">Tax Computation Review</option>
                  <option value="compliance_check">Compliance Check</option>
                  <option value="filing_review">Filing Review</option>
                  <option value="audit_preparation">Audit Preparation</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="review-description">Description</Label>
                <Input
                  id="review-description"
                  placeholder="Brief description of what needs review"
                  value={complianceRequest.description}
                  onChange={(e) => setComplianceRequest(prev => ({...prev, description: e.target.value}))}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="expedited"
                  checked={complianceRequest.is_expedited}
                  onChange={(e) => setComplianceRequest(prev => ({...prev, is_expedited: e.target.checked}))}
                  className="w-4 h-4 text-green-600"
                />
                <Label htmlFor="expedited" className="text-sm">
                  Expedited Review <span className="text-green-600 font-medium">(Same Price)</span>
                </Label>
              </div>
              
              <Button
                onClick={requestComplianceReview}
                disabled={!complianceRequest.review_type || !complianceRequest.description}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Request Review
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Summary */}
      {userBalances.monthly_stats && Object.keys(userBalances.monthly_stats).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>This Month's Usage</CardTitle>
            <CardDescription>Your add-on service usage for the current month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(userBalances.monthly_stats).map(([addonType, stats]) => (
                <div key={addonType} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium capitalize">
                      {addonType.replace(/_/g, ' ')}
                    </span>
                    <Badge variant="outline">{stats.quantity} uses</Badge>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {formatCurrency(stats.amount)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Purchases */}
      {userBalances.recent_purchases && userBalances.recent_purchases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Purchases</CardTitle>
            <CardDescription>Your latest add-on service purchases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userBalances.recent_purchases.map((purchase) => (
                <div key={purchase.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{purchase.description}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(purchase.created_at).toLocaleString()} • 
                      Quantity: {purchase.quantity}
                      {purchase.auto_charged && (
                        <Badge variant="outline" className="ml-2 text-xs">Auto-charged</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-lg font-medium">
                    {formatCurrency(purchase.total_amount)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AddOnManager;