import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calculator, TrendingUp, FileText, Info, Wallet, Receipt, PiggyBank, Home, Heart, Shield, Building2, Users, Briefcase, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
import { Alert, AlertDescription } from './components/ui/alert';
import CITCalculator from './components/CITCalculator';
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

  // CIT Calculator state
  const [citInput, setCitInput] = useState({
    company_name: '',
    annual_turnover: '',
    total_fixed_assets: '',
    gross_income: '',
    other_income: '',
    cost_of_goods_sold: '',
    staff_costs: '',
    rent_expenses: '',
    professional_fees: '',
    depreciation: '',
    interest_paid_unrelated: '',
    interest_paid_related: '',
    other_deductible_expenses: '',
    entertainment_expenses: '',
    fines_penalties: '',
    personal_expenses: '',
    excessive_interest: '',
    other_non_deductible: '',
    // Capital Allowances
    buildings_cost: '',
    furniture_fittings_cost: '',
    plant_machinery_cost: '',
    motor_vehicles_cost: '',
    other_assets_cost: '',
    buildings_wdv: '',
    furniture_fittings_wdv: '',
    plant_machinery_wdv: '',
    motor_vehicles_wdv: '',
    other_assets_wdv: '',
    // WHT Credits
    wht_on_contracts: '',
    wht_on_dividends: '',
    wht_on_rent: '',
    wht_on_interest: '',
    other_wht_credits: '',
    total_debt: '',
    total_equity: '',
    ebitda: '',
    is_professional_service: false,
    is_multinational: false,
    global_revenue_eur: ''
  });

  const [citResult, setCitResult] = useState(null);
  const [citLoading, setCitLoading] = useState(false);
  const [citInfo, setCitInfo] = useState(null);
  const [citHistory, setCitHistory] = useState([]);

  useEffect(() => {
    fetchTaxBrackets();
    fetchHistory();
    fetchCitInfo();
    fetchCitHistory();
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

  const fetchCitInfo = async () => {
    try {
      const response = await axios.get(`${API}/cit-info`);
      setCitInfo(response.data);
    } catch (error) {
      console.error('Error fetching CIT info:', error);
    }
  };

  const fetchCitHistory = async () => {
    try {
      const response = await axios.get(`${API}/cit-calculations/history?limit=5`);
      setCitHistory(response.data);
    } catch (error) {
      console.error('Error fetching CIT history:', error);
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
    return '₦' + new Intl.NumberFormat('en-NG', {
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

  // CIT calculator functions
  const handleCitInputChange = (field, value) => {
    setCitInput(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateCitTax = async () => {
    setCitLoading(true);
    try {
      const numericInput = {};
      Object.keys(citInput).forEach(key => {
        if (key === 'company_name') {
          numericInput[key] = citInput[key];
        } else if (key === 'is_professional_service' || key === 'is_multinational') {
          numericInput[key] = citInput[key];
        } else {
          numericInput[key] = parseFloat(citInput[key]) || 0;
        }
      });

      const response = await axios.post(`${API}/calculate-cit`, numericInput);
      setCitResult(response.data);
      fetchCitHistory(); // Refresh history
    } catch (error) {
      console.error('Error calculating CIT:', error);
      alert('Error calculating CIT. Please check your input values.');
    } finally {
      setCitLoading(false);
    }
  };

  const resetCitForm = () => {
    setCitInput({
      company_name: '',
      annual_turnover: '',
      total_fixed_assets: '',
      gross_income: '',
      other_income: '',
      cost_of_goods_sold: '',
      staff_costs: '',
      rent_expenses: '',
      professional_fees: '',
      depreciation: '',
      interest_paid_unrelated: '',
      interest_paid_related: '',
      other_deductible_expenses: '',
      entertainment_expenses: '',
      fines_penalties: '',
      personal_expenses: '',
      excessive_interest: '',
      other_non_deductible: '',
      // Capital Allowances
      buildings_cost: '',
      furniture_fittings_cost: '',
      plant_machinery_cost: '',
      motor_vehicles_cost: '',
      other_assets_cost: '',
      buildings_wdv: '',
      furniture_fittings_wdv: '',
      plant_machinery_wdv: '',
      motor_vehicles_wdv: '',
      other_assets_wdv: '',
      // WHT Credits
      wht_on_contracts: '',
      wht_on_dividends: '',
      wht_on_rent: '',
      wht_on_interest: '',
      other_wht_credits: '',
      total_debt: '',
      total_equity: '',
      ebitda: '',
      is_professional_service: false,
      is_multinational: false,
      global_revenue_eur: ''
    });
    setCitResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <div className="relative overflow-hidden">
        {/* Background with black and gold gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-black to-gray-800"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 transform translate-x-32 -translate-y-32">
            <div className="w-full h-full border-4 border-yellow-400 opacity-15 transform rotate-45"></div>
          </div>
          <div className="absolute bottom-0 left-0 w-64 h-64 transform -translate-x-16 translate-y-16">
            <div className="w-full h-full border-2 border-yellow-500 opacity-10 transform rotate-12"></div>
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center space-x-6">
              {/* Logo Section */}
              <div className="relative w-20 h-20 flex items-center justify-center">
                <img 
                  src="https://customer-assets.emergentagent.com/job_fiquant-taxpro/artifacts/l4o43c21_Fiquant%20Consult%20Logo%20%28Adj%29%203%20-%20Black.jpeg" 
                  alt="Fiquant Consult Logo" 
                  className="w-20 h-20 object-contain"
                  style={{
                    filter: 'brightness(0) saturate(100%) invert(68%) sepia(69%) saturate(1952%) hue-rotate(11deg) brightness(101%) contrast(101%)'
                  }}
                />
              </div>
              
              {/* Brand Text */}
              <div className="text-white">
                <div className="flex items-baseline space-x-3">
                  <h1 className="text-4xl font-bold tracking-tight text-white">Fiquant</h1>
                  <span className="text-2xl font-light text-yellow-400">TaxPro</span>
                </div>
                <p className="text-gray-300 mt-1 font-medium tracking-wide">Nigerian Tax Calculator 2026</p>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="w-12 h-0.5 bg-gradient-to-r from-yellow-400 to-transparent"></div>
                  <span className="text-xs text-yellow-300 font-medium uppercase tracking-wider">Professional Edition</span>
                </div>
              </div>
            </div>
            
            {/* Status Badge */}
            <div className="flex flex-col items-end space-y-2">
              <Badge variant="outline" className="bg-yellow-400/10 text-yellow-300 border-yellow-400/30 backdrop-blur-sm">
                <span className="inline-flex items-center">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
                  2026 Tax Laws
                </span>
              </Badge>
              <div className="text-gray-400 text-xs font-medium">
                Powered by FIRS Guidelines
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="calculator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white border border-emerald-100">
            <TabsTrigger value="calculator" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>PAYE</span>
            </TabsTrigger>
            <TabsTrigger value="cit" className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span>Corporate</span>
            </TabsTrigger>
            <TabsTrigger value="brackets" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Tax Info</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>History</span>
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center space-x-2">
              <Briefcase className="h-4 w-4" />
              <span>Compliance</span>
            </TabsTrigger>
          </TabsList>

          {/* PAYE Calculator Tab */}
          <TabsContent value="calculator" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Input Form */}
              <Card className="bg-white border-emerald-100 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <Wallet className="h-5 w-5" />
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

          {/* CIT Calculator Tab */}
          <TabsContent value="cit" className="space-y-6">
            <CITCalculator
              citInput={citInput}
              citResult={citResult}
              citLoading={citLoading}
              handleCitInputChange={handleCitInputChange}
              calculateCitTax={calculateCitTax}
              resetCitForm={resetCitForm}
              formatCurrency={formatCurrency}
            />
          </TabsContent>

          {/* Tax Information Tab */}
          <TabsContent value="brackets">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* PAYE Information */}
              {taxBrackets && (
                <div className="space-y-6">
                  <Card className="bg-white border-emerald-100 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Users className="h-5 w-5 text-emerald-600" />
                        <span>PAYE Tax Brackets 2026</span>
                      </CardTitle>
                      <CardDescription>
                        Personal income tax rates
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
                        <span>PAYE Tax Reliefs</span>
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

              {/* CIT Information */}
              {citInfo && (
                <div className="space-y-6">
                  <Card className="bg-white border-blue-100 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Building2 className="h-5 w-5 text-blue-600" />
                        <span>Corporate Income Tax 2026</span>
                      </CardTitle>
                      <CardDescription>
                        Company tax rates and classifications
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-3">
                        {Object.entries(citInfo.company_classifications).map(([size, info]) => (
                          <div key={size} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-gray-900 capitalize">{size} Companies</h4>
                              <Badge variant="outline" className="text-sm">
                                CIT: {info.cit_rate}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{info.criteria}</p>
                            <p className="text-xs text-blue-600">Development Levy: {info.development_levy}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-blue-100 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-blue-600" />
                        <span>Thin Capitalization Rules</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Interest Deduction Limit</span>
                        <span className="font-medium text-blue-600">{citInfo.thin_capitalization.interest_deduction_limit}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Applies To</span>
                        <span className="font-medium text-blue-600">{citInfo.thin_capitalization.applies_to}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Excess Treatment</span>
                        <span className="font-medium text-red-600">{citInfo.thin_capitalization.excess_treatment}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* PAYE History */}
              <Card className="bg-white border-emerald-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-emerald-600" />
                    <span>PAYE Calculations</span>
                  </CardTitle>
                  <CardDescription>
                    Recent personal tax calculations
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
                              PAYE
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No PAYE calculations yet.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* CIT History */}
              <Card className="bg-white border-blue-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <span>CIT Calculations</span>
                  </CardTitle>
                  <CardDescription>
                    Recent corporate tax calculations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {citHistory.length > 0 ? (
                    <div className="space-y-4">
                      {citHistory.map((calc, index) => (
                        <div key={calc.id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <p className="font-medium">{calc.company_name}</p>
                              <p className="text-sm text-gray-600">
                                Profit: {formatCurrency(calc.taxable_profit)} | 
                                Tax: {formatCurrency(calc.total_tax_due)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(calc.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <Badge variant="outline">
                              {calc.company_size}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No CIT calculations yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* PAYE Compliance */}
              <Card className="bg-white border-emerald-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-emerald-600" />
                    <span>PAYE Compliance</span>
                  </CardTitle>
                  <CardDescription>
                    Personal income tax requirements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <h4 className="font-medium text-emerald-800 mb-2">Annual Tax Return</h4>
                      <p className="text-sm text-emerald-700">Due: March 31st following tax year</p>
                      <p className="text-xs text-emerald-600">File with FIRS or State Board of Internal Revenue</p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h4 className="font-medium text-yellow-800 mb-2">Monthly PAYE Remittance</h4>
                      <p className="text-sm text-yellow-700">Due: 10th of following month</p>
                      <p className="text-xs text-yellow-600">Employers must remit withheld tax</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-800 mb-2">Tax Identification Number</h4>
                      <p className="text-sm text-blue-700">Required for all taxpayers</p>
                      <p className="text-xs text-blue-600">Obtain from FIRS or State tax office</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CIT Compliance */}
              <Card className="bg-white border-blue-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <span>CIT Compliance</span>
                  </CardTitle>
                  <CardDescription>
                    Corporate income tax requirements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-800 mb-2">Annual CIT Return</h4>
                      <p className="text-sm text-blue-700">Due: 90 days after year-end</p>
                      <p className="text-xs text-blue-600">File with FIRS</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <h4 className="font-medium text-red-800 mb-2">Tax Payment</h4>
                      <p className="text-sm text-red-700">Due: 60 days after year-end</p>
                      <p className="text-xs text-red-600">Quarterly advance payments required</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="font-medium text-purple-800 mb-2">Development Levy</h4>
                      <p className="text-sm text-purple-700">4% on assessable profits</p>
                      <p className="text-xs text-purple-600">Replaces Education Tax, IT Levy, NASENI</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <h4 className="font-medium text-orange-800 mb-2">Thin Capitalization</h4>
                      <p className="text-sm text-orange-700">Interest limited to 30% of EBITDA</p>
                      <p className="text-xs text-orange-600">Related party debt restrictions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;