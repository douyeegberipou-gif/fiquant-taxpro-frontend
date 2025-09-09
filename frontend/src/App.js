import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calculator, TrendingUp, FileText, Info, DollarSign, Receipt, PiggyBank, Home, Heart, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
import { Alert, AlertDescription } from './components/ui/alert';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [taxInput, setTaxInput] = useState({
    basic_salary: '',
    transport_allowance: '',
    housing_allowance: '',
    meal_allowance: '',
    other_allowances: '',
    pension_contribution: '',
    nhf_contribution: '',
    life_insurance_premium: '',
    health_insurance_premium: '',
    nhis_contribution: '',
    annual_rent: ''
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [taxBrackets, setTaxBrackets] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchTaxBrackets();
    fetchHistory();
  }, []);

  const fetchTaxBrackets = async () => {
    try {
      const response = await axios.get(`${API}/tax-brackets`);
      setTaxBrackets(response.data);
    } catch (error) {
      console.error('Error fetching tax brackets:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API}/calculations/history?limit=5`);
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setTaxInput(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateTax = async () => {
    setLoading(true);
    try {
      const numericInput = {};
      Object.keys(taxInput).forEach(key => {
        numericInput[key] = parseFloat(taxInput[key]) || 0;
      });

      const response = await axios.post(`${API}/calculate-paye`, numericInput);
      setResult(response.data);
      fetchHistory(); // Refresh history
    } catch (error) {
      console.error('Error calculating tax:', error);
      alert('Error calculating tax. Please check your input values.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const resetForm = () => {
    setTaxInput({
      basic_salary: '',
      transport_allowance: '',
      housing_allowance: '',
      meal_allowance: '',
      other_allowances: '',
      pension_contribution: '',
      nhf_contribution: '',
      life_insurance_premium: '',
      health_insurance_premium: '',
      nhis_contribution: '',
      annual_rent: ''
    });
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white border-b border-emerald-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-600 p-2 rounded-xl">
                <Calculator className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Fiquant TaxPro</h1>
                <p className="text-sm text-emerald-600">Nigerian Tax Calculator 2026</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              2026 Tax Laws
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="calculator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-emerald-100">
            <TabsTrigger value="calculator" className="flex items-center space-x-2">
              <Calculator className="h-4 w-4" />
              <span>Calculator</span>
            </TabsTrigger>
            <TabsTrigger value="brackets" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Tax Brackets</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>History</span>
            </TabsTrigger>
          </TabsList>

          {/* Calculator Tab */}
          <TabsContent value="calculator" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Input Form */}
              <Card className="bg-white border-emerald-100 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5" />
                    <span>Income Details</span>
                  </CardTitle>
                  <CardDescription className="text-emerald-100">
                    Enter your monthly income and allowances
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Basic Income Section */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <Receipt className="h-4 w-4 mr-2 text-emerald-600" />
                      Monthly Income
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="basic_salary">Basic Salary *</Label>
                        <Input
                          id="basic_salary"
                          type="number"
                          placeholder="500,000"
                          value={taxInput.basic_salary}
                          onChange={(e) => handleInputChange('basic_salary', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="transport_allowance">Transport Allowance</Label>
                        <Input
                          id="transport_allowance"
                          type="number"
                          placeholder="50,000"
                          value={taxInput.transport_allowance}
                          onChange={(e) => handleInputChange('transport_allowance', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="housing_allowance">Housing Allowance</Label>
                        <Input
                          id="housing_allowance"
                          type="number"
                          placeholder="200,000"
                          value={taxInput.housing_allowance}
                          onChange={(e) => handleInputChange('housing_allowance', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="meal_allowance">Meal Allowance</Label>
                        <Input
                          id="meal_allowance"
                          type="number"
                          placeholder="30,000"
                          value={taxInput.meal_allowance}
                          onChange={(e) => handleInputChange('meal_allowance', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="other_allowances">Other Allowances</Label>
                        <Input
                          id="other_allowances"
                          type="number"
                          placeholder="25,000"
                          value={taxInput.other_allowances}
                          onChange={(e) => handleInputChange('other_allowances', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Reliefs Section */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <PiggyBank className="h-4 w-4 mr-2 text-emerald-600" />
                      Monthly Reliefs & Deductions
                    </h3>
                    <Alert className="bg-blue-50 border-blue-200">
                      <AlertDescription className="text-blue-800 text-sm">
                        Leave pension and NHF empty to auto-calculate (8% and 2.5% of basic salary respectively)
                      </AlertDescription>
                    </Alert>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pension_contribution">Pension Contribution</Label>
                        <Input
                          id="pension_contribution"
                          type="number"
                          placeholder="Auto-calculated (8%)"
                          value={taxInput.pension_contribution}
                          onChange={(e) => handleInputChange('pension_contribution', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nhf_contribution">NHF Contribution</Label>
                        <Input
                          id="nhf_contribution"
                          type="number"
                          placeholder="Auto-calculated (2.5%)"
                          value={taxInput.nhf_contribution}
                          onChange={(e) => handleInputChange('nhf_contribution', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="life_insurance_premium">Life Insurance Premium</Label>
                        <Input
                          id="life_insurance_premium"
                          type="number"
                          placeholder="10,000"
                          value={taxInput.life_insurance_premium}
                          onChange={(e) => handleInputChange('life_insurance_premium', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="health_insurance_premium">Health Insurance Premium</Label>
                        <Input
                          id="health_insurance_premium"
                          type="number"
                          placeholder="15,000"
                          value={taxInput.health_insurance_premium}
                          onChange={(e) => handleInputChange('health_insurance_premium', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nhis_contribution">NHIS Contribution</Label>
                        <Input
                          id="nhis_contribution"
                          type="number"
                          placeholder="5,000"
                          value={taxInput.nhis_contribution}
                          onChange={(e) => handleInputChange('nhis_contribution', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="annual_rent">Annual Rent Paid</Label>
                        <Input
                          id="annual_rent"
                          type="number"
                          placeholder="1,200,000"
                          value={taxInput.annual_rent}
                          onChange={(e) => handleInputChange('annual_rent', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button 
                      onClick={calculateTax} 
                      disabled={loading || !taxInput.basic_salary}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    >
                      {loading ? 'Calculating...' : 'Calculate Tax'}
                    </Button>
                    <Button 
                      onClick={resetForm} 
                      variant="outline"
                      className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    >
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Results */}
              {result && (
                <Card className="bg-white border-emerald-100 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-t-lg">
                    <CardTitle>Tax Calculation Results</CardTitle>
                    <CardDescription className="text-teal-100">
                      Based on Nigerian 2026 tax laws
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                        <p className="text-sm text-emerald-600 font-medium">Monthly Gross Income</p>
                        <p className="text-xl font-bold text-emerald-800">
                          {formatCurrency(result.monthly_gross_income)}
                        </p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-600 font-medium">Monthly Tax</p>
                        <p className="text-xl font-bold text-blue-800">
                          {formatCurrency(result.monthly_tax)}
                        </p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200 col-span-2">
                        <p className="text-sm text-green-600 font-medium">Monthly Net Income</p>
                        <p className="text-2xl font-bold text-green-800">
                          {formatCurrency(result.monthly_net_income)}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Annual Breakdown */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">Annual Breakdown</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Gross Income:</span>
                          <span className="font-medium">{formatCurrency(result.annual_gross_income)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Reliefs:</span>
                          <span className="font-medium text-green-600">-{formatCurrency(result.total_reliefs)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Taxable Income:</span>
                          <span className="font-medium">{formatCurrency(result.taxable_income)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-gray-600">Tax Due:</span>
                          <span className="font-medium text-red-600">{formatCurrency(result.tax_due)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg border-t pt-2">
                          <span>Net Annual Income:</span>
                          <span className="text-green-600">{formatCurrency(result.net_annual_income)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Relief Breakdown */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">Relief Breakdown (Annual)</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pension Relief:</span>
                          <span className="font-medium">{formatCurrency(result.pension_relief)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">NHF Relief:</span>
                          <span className="font-medium">{formatCurrency(result.nhf_relief)}</span>
                        </div>
                        {result.life_insurance_relief > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Life Insurance Relief:</span>
                            <span className="font-medium">{formatCurrency(result.life_insurance_relief)}</span>
                          </div>
                        )}
                        {result.health_insurance_relief > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Health Insurance Relief:</span>
                            <span className="font-medium">{formatCurrency(result.health_insurance_relief)}</span>
                          </div>
                        )}
                        {result.nhis_relief > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">NHIS Relief:</span>
                            <span className="font-medium">{formatCurrency(result.nhis_relief)}</span>
                          </div>
                        )}
                        {result.rent_relief > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Rent Relief:</span>
                            <span className="font-medium">{formatCurrency(result.rent_relief)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tax Breakdown */}
                    {result.tax_breakdown && result.tax_breakdown.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900">Tax Bracket Breakdown</h4>
                        <div className="space-y-2 text-sm">
                          {result.tax_breakdown.map((bracket, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <div>
                                <span className="text-gray-600">{bracket.range} ({bracket.rate}):</span>
                                <div className="text-xs text-gray-500">
                                  Taxable: {formatCurrency(bracket.taxable_amount)}
                                </div>
                              </div>
                              <span className="font-medium">{formatCurrency(bracket.tax_amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Tax Brackets Tab */}
          <TabsContent value="brackets">
            {taxBrackets && (
              <div className="space-y-6">
                <Card className="bg-white border-emerald-100 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-emerald-600" />
                      <span>Nigerian Tax Brackets 2026</span>
                    </CardTitle>
                    <CardDescription>
                      Progressive tax rates under the new tax administration act
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3">
                      {taxBrackets.brackets.map((bracket, index) => (
                        <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{bracket.range}</p>
                            <p className="text-sm text-gray-600">{bracket.description}</p>
                          </div>
                          <Badge variant={index === 0 ? "secondary" : "outline"} className="text-lg px-3 py-1">
                            {bracket.rate}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-emerald-100 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-emerald-600" />
                      <span>Available Tax Reliefs</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(taxBrackets.reliefs).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-gray-700 capitalize">{key.replace('_', ' ')}</span>
                        <span className="font-medium text-emerald-600">{value}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card className="bg-white border-emerald-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  <span>Recent Calculations</span>
                </CardTitle>
                <CardDescription>
                  Your recent tax calculations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {history.length > 0 ? (
                  <div className="space-y-4">
                    {history.map((calc, index) => (
                      <div key={calc.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <p className="font-medium">
                              Monthly Gross: {formatCurrency(calc.monthly_gross_income)}
                            </p>
                            <p className="text-sm text-gray-600">
                              Tax: {formatCurrency(calc.monthly_tax)} | 
                              Net: {formatCurrency(calc.monthly_net_income)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(calc.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <Badge variant="outline">
                            Saved
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No calculations yet. Start by calculating your tax!
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;