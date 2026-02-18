import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  CreditCard, 
  Users, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Calculator,
  Zap,
  Plus,
  ChevronRight,
  Clock,
  TrendingUp
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AddOnManager = () => {
  const [pricing, setPricing] = useState({});
  const [userBalances, setUserBalances] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedCard, setExpandedCard] = useState(null);
  
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
      fetchData();
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

  // Info Box Component
  const InfoBox = ({ type = 'info', children }) => {
    const styles = {
      info: 'border-l-4 border-l-gray-900 bg-gray-50',
      warning: 'border-l-4 border-l-amber-500 bg-amber-50/50',
      success: 'border-l-4 border-l-emerald-500 bg-emerald-50/50'
    };
    
    return (
      <div className={`${styles[type]} rounded-r-lg p-4 my-4`}>
        <div className="text-sm text-gray-700">{children}</div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="border-b border-gray-200 bg-gray-50/50">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
            ))}
          </div>
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
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add-On Services</h1>
              <p className="text-sm text-gray-500">Enhance your account with premium features</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="max-w-6xl mx-auto px-4 pt-6">
          <div className="border-l-4 border-l-red-500 bg-red-50/50 rounded-r-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Extra Employees Card */}
          <Card className="border border-gray-200 shadow-none hover:border-gray-300 transition-colors">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                Extra Employees
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-600 mb-4">Expand your bulk processing capacity beyond plan limits</p>
              
              {/* Pricing Table */}
              <div className="overflow-hidden rounded-lg border border-gray-200 mb-4">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-3 text-gray-600">Per bulk run</td>
                      <td className="py-2 px-3 text-right font-medium text-gray-900">{formatCurrency(pricing.extra_employees?.per_run_rate || 100)}/emp</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-gray-600">Monthly rate</td>
                      <td className="py-2 px-3 text-right font-medium text-gray-900">{formatCurrency(pricing.extra_employees?.monthly_rate || 250)}/emp</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="space-y-3">
                <Label className="text-xs text-gray-500 uppercase tracking-wide">Preview Charges</Label>
                <div className="flex gap-2">
                  <Input
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
                    className="border-gray-200 focus:border-gray-900 focus:ring-gray-900"
                  />
                  <Button onClick={previewBulkRunCharges} variant="outline" className="border-gray-200">
                    <Calculator className="h-4 w-4" />
                  </Button>
                </div>
                
                {chargePreview && (
                  <div className="border-l-4 border-l-blue-500 bg-blue-50/50 rounded-r-lg p-3">
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tier limit:</span>
                        <span className="font-medium">{chargePreview.tier_limit} employees</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Excess:</span>
                        <span className="font-medium text-amber-600">{chargePreview.excess_employees}</span>
                      </div>
                      <div className="flex justify-between border-t border-blue-200 pt-1 mt-1">
                        <span className="font-medium">Charge:</span>
                        <span className="font-bold text-gray-900">{formatCurrency(chargePreview.total_charge)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* PDF Printing Card */}
          <Card className="border border-gray-200 shadow-none hover:border-gray-300 transition-colors">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-purple-600" />
                </div>
                PDF Printing
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-600 mb-4">Generate professional PDF reports</p>
              
              <div className="p-4 bg-gray-900 text-white rounded-lg mb-4">
                <p className="text-sm text-gray-300 mb-1">Per PDF</p>
                <p className="text-2xl font-bold">{formatCurrency(pricing.pdf_print?.rate || 200)}</p>
              </div>
              
              <Badge className="w-full justify-center bg-gray-100 text-gray-700 border-0 py-2">
                Auto-charged on generation
              </Badge>
              
              <InfoBox type="info">
                <strong>Note:</strong> Pro+ tiers get unlimited free PDF exports
              </InfoBox>
            </CardContent>
          </Card>

          {/* Compliance Review Card */}
          <Card className="border border-gray-200 shadow-none hover:border-gray-300 transition-colors">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                </div>
                Compliance Review
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-600 mb-4">Professional compliance report review</p>
              
              <div className="p-4 bg-emerald-600 text-white rounded-lg mb-4">
                <p className="text-sm text-emerald-100 mb-1">Per Review</p>
                <p className="text-2xl font-bold">{formatCurrency(pricing.compliance_review?.rate || 25000)}</p>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500 uppercase tracking-wide">Review Type</Label>
                  <select
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm"
                    value={complianceRequest.review_type}
                    onChange={(e) => setComplianceRequest(prev => ({...prev, review_type: e.target.value}))}
                  >
                    <option value="">Select type</option>
                    <option value="tax_computation">Tax Computation</option>
                    <option value="compliance_check">Compliance Check</option>
                    <option value="filing_review">Filing Review</option>
                    <option value="audit_preparation">Audit Preparation</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500 uppercase tracking-wide">Description</Label>
                  <Input
                    placeholder="Brief description"
                    value={complianceRequest.description}
                    onChange={(e) => setComplianceRequest(prev => ({...prev, description: e.target.value}))}
                    className="border-gray-200 focus:border-gray-900 focus:ring-gray-900"
                  />
                </div>
                
                <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={complianceRequest.is_expedited}
                    onChange={(e) => setComplianceRequest(prev => ({...prev, is_expedited: e.target.checked}))}
                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm">Expedited Review</span>
                  <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs ml-auto">Same Price</Badge>
                </label>
                
                <Button
                  onClick={requestComplianceReview}
                  disabled={!complianceRequest.review_type || !complianceRequest.description}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white"
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
          <Card className="border border-gray-200 shadow-none mb-6">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                This Month's Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(userBalances.monthly_stats).map(([addonType, stats]) => (
                  <div key={addonType} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {addonType.replace(/_/g, ' ')}
                      </span>
                      <Badge className="bg-gray-200 text-gray-700 border-0 text-xs">{stats.quantity} uses</Badge>
                    </div>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.amount)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Purchases */}
        {userBalances.recent_purchases && userBalances.recent_purchases.length > 0 && (
          <Card className="border border-gray-200 shadow-none">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent Purchases
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {userBalances.recent_purchases.map((purchase, index) => (
                <div 
                  key={purchase.id} 
                  className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                    index !== userBalances.recent_purchases.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{purchase.description}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{new Date(purchase.created_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span>•</span>
                        <span>Qty: {purchase.quantity}</span>
                        {purchase.auto_charged && (
                          <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">Auto</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-lg font-medium text-gray-900">{formatCurrency(purchase.total_amount)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-gray-50/50 mt-8">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <p className="text-xs text-gray-500 text-center">
            Add-on charges are automatically billed to your account. View your billing history in Payments.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddOnManager;
