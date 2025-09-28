import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.jsx';
import { Input } from './ui/input.jsx';
import { Label } from './ui/label.jsx';
import { Button } from './ui/button.jsx';
import { Badge } from './ui/badge.jsx';
import { Separator } from './ui/separator.jsx';
import { Alert, AlertDescription } from './ui/alert.jsx';
import { TrendingUp, Calculator, AlertTriangle, Printer, User } from 'lucide-react';
import { generateCgtReport } from '../utils/pdfGenerator';
import UpgradePrompt from './UpgradePrompt';
import { useUpgrade } from '../hooks/useUpgrade';

const CGTCalculator = ({ formatCurrency }) => {
  const [cgtInput, setCgtInput] = useState({
    taxpayer_name: '',
    tin: '',
    year: '',
    taxpayer_type: 'individual', // individual or company
    asset_type: '',
    disposal_proceeds: '',
    acquisition_cost: '',
    allowable_expenses: '',
    holding_period: ''
  });

  const [cgtResult, setCgtResult] = useState(null);
  const [cgtLoading, setCgtLoading] = useState(false);

  // Asset types and their characteristics
  const assetTypes = {
    'shares': {
      name: 'Shares & Securities',
      description: 'Listed and unlisted shares, bonds, securities'
    },
    'property': {
      name: 'Real Estate Property',
      description: 'Land, buildings, residential and commercial property'
    },
    'crypto': {
      name: 'Cryptocurrency',
      description: 'Bitcoin, Ethereum and other digital assets'
    },
    'business_assets': {
      name: 'Business Assets',
      description: 'Plant, machinery, equipment'
    },
    'intellectual_property': {
      name: 'Intellectual Property',
      description: 'Patents, copyrights, trademarks'
    }
  };

  const handleInputChange = (field, value) => {
    setCgtInput(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateCGT = () => {
    setCgtLoading(true);
    
    try {
      const disposalProceeds = parseFloat(cgtInput.disposal_proceeds) || 0;
      const acquisitionCost = parseFloat(cgtInput.acquisition_cost) || 0;
      const allowableExpenses = parseFloat(cgtInput.allowable_expenses) || 0;
      
      // Calculate capital gain
      const totalCost = acquisitionCost + allowableExpenses;
      const capitalGain = disposalProceeds - totalCost;
      
      // Check exemption thresholds (NTA 2026)
      const exemptionProceedsThreshold = 150000000; // ₦150M
      const exemptionGainsThreshold = 10000000; // ₦10M
      
      const isExemptByProceeds = disposalProceeds < exemptionProceedsThreshold;
      const isExemptByGains = capitalGain < exemptionGainsThreshold;
      const isExempt = isExemptByProceeds && isExemptByGains;
      
      // Determine CGT rate based on taxpayer type (NTA 2026)
      let cgtRate = 0;
      let rateDescription = '';
      
      if (!isExempt && capitalGain > 0) {
        if (cgtInput.taxpayer_type === 'company') {
          cgtRate = 0.30; // 30% for companies
          rateDescription = '30% (Company Rate)';
        } else {
          // For individuals, CGT is now taxed at progressive personal income tax rates (0-25%)
          // We'll use an average rate of 15% for calculation purposes
          cgtRate = 0.15; // Average progressive rate
          rateDescription = 'Progressive Rate (0-25% based on total income)';
        }
      }
      
      // Calculate CGT liability
      const cgtLiability = isExempt ? 0 : (capitalGain > 0 ? capitalGain * cgtRate : 0);
      
      const result = {
        taxpayer_name: cgtInput.taxpayer_name,
        year: cgtInput.year,
        taxpayer_type: cgtInput.taxpayer_type,
        asset_type: assetTypes[cgtInput.asset_type]?.name || cgtInput.asset_type,
        holding_period: cgtInput.holding_period,
        
        // Financial details
        disposal_proceeds: disposalProceeds,
        acquisition_cost: acquisitionCost,
        allowable_expenses: allowableExpenses,
        total_cost: totalCost,
        capital_gain: capitalGain,
        
        // Tax calculation
        is_exempt: isExempt,
        exemption_reason: isExempt ? (isExemptByProceeds ? 'Proceeds below ₦150M threshold' : 'Gains below ₦10M threshold') : null,
        cgt_rate: cgtRate * 100,
        rate_description: rateDescription,
        cgt_liability: cgtLiability,
        
        // Additional info
        is_loss: capitalGain < 0,
        loss_amount: capitalGain < 0 ? Math.abs(capitalGain) : 0,
        
        timestamp: new Date().toISOString()
      };
      
      setCgtResult(result);
    } catch (error) {
      console.error('Error calculating CGT:', error);
      alert('Error calculating CGT. Please check your input values.');
    } finally {
      setCgtLoading(false);
    }
  };

  const resetForm = () => {
    setCgtInput({
      taxpayer_name: '',
      year: '',
      taxpayer_type: 'individual',
      asset_type: '',
      disposal_proceeds: '',
      acquisition_cost: '',
      allowable_expenses: '',
      holding_period: ''
    });
    setCgtResult(null);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 10}, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <Card className="bg-white border-green-100 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>CGT Details</span>
            </CardTitle>
            <CardDescription className="text-green-100">
              Enter your capital gains tax information
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Taxpayer Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <User className="h-4 w-4 mr-2 text-green-600" />
                Taxpayer Information
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxpayer_name">Company/Taxpayer Name *</Label>
                  <Input
                    id="taxpayer_name"
                    type="text"
                    placeholder="John Doe / ABC Company"
                    value={cgtInput.taxpayer_name}
                    onChange={(e) => handleInputChange('taxpayer_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tin">Tax Identification Number (TIN)</Label>
                  <Input
                    id="tin"
                    type="text"
                    placeholder="12345678901"
                    value={cgtInput.tin}
                    onChange={(e) => handleInputChange('tin', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year *</Label>
                  <select
                    id="year"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={cgtInput.year}
                    onChange={(e) => handleInputChange('year', e.target.value)}
                  >
                    <option value="">Select Year</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Taxpayer Type *</Label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="taxpayer_type"
                      value="individual"
                      checked={cgtInput.taxpayer_type === 'individual'}
                      onChange={(e) => handleInputChange('taxpayer_type', e.target.value)}
                      className="w-4 h-4 text-green-600"
                    />
                    <span className="text-sm">Individual</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="taxpayer_type"
                      value="company"
                      checked={cgtInput.taxpayer_type === 'company'}
                      onChange={(e) => handleInputChange('taxpayer_type', e.target.value)}
                      className="w-4 h-4 text-green-600"
                    />
                    <span className="text-sm">Company</span>
                  </label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Asset Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Asset Information</h3>
              <div className="space-y-2">
                <Label htmlFor="asset_type">Asset Type *</Label>
                <select
                  id="asset_type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={cgtInput.asset_type}
                  onChange={(e) => handleInputChange('asset_type', e.target.value)}
                >
                  <option value="">Select Asset Type</option>
                  {Object.entries(assetTypes).map(([key, config]) => (
                    <option key={key} value={key}>{config.name}</option>
                  ))}
                </select>
              </div>
              
              {cgtInput.asset_type && (
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription className="text-green-800 text-sm">
                    <strong>{assetTypes[cgtInput.asset_type].name}:</strong> {assetTypes[cgtInput.asset_type].description}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="holding_period">Holding Period (Optional)</Label>
                <Input
                  id="holding_period"
                  type="text"
                  placeholder="e.g., 2 years, 18 months"
                  value={cgtInput.holding_period}
                  onChange={(e) => handleInputChange('holding_period', e.target.value)}
                />
              </div>
            </div>

            <Separator />

            {/* Financial Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Financial Details</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="disposal_proceeds">Disposal Proceeds *</Label>
                  <Input
                    id="disposal_proceeds"
                    type="number"
                    placeholder="₦50,000,000"
                    value={cgtInput.disposal_proceeds}
                    onChange={(e) => handleInputChange('disposal_proceeds', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acquisition_cost">Acquisition Cost *</Label>
                  <Input
                    id="acquisition_cost"
                    type="number"
                    placeholder="₦20,000,000"
                    value={cgtInput.acquisition_cost}
                    onChange={(e) => handleInputChange('acquisition_cost', e.target.value)}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="allowable_expenses">Allowable Expenses</Label>
                  <Input
                    id="allowable_expenses"
                    type="number"
                    placeholder="₦2,000,000"
                    value={cgtInput.allowable_expenses}
                    onChange={(e) => handleInputChange('allowable_expenses', e.target.value)}
                  />
                </div>
              </div>
              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-800 text-sm">
                  <strong>Allowable Expenses:</strong> Legal fees, valuation costs, improvement costs, transaction costs.
                </AlertDescription>
              </Alert>
            </div>

            {/* Disclaimer Note */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
              <p className="text-xs text-amber-800 flex items-start">
                <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Note:</strong> Users are solely responsible for the validity, accuracy and completeness of the financial information they supply.
                </span>
              </p>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button 
                onClick={calculateCGT} 
                disabled={cgtLoading || !cgtInput.taxpayer_name || !cgtInput.disposal_proceeds || !cgtInput.acquisition_cost}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {cgtLoading ? 'Calculating...' : 'Calculate CGT'}
              </Button>
              <Button 
                onClick={resetForm} 
                variant="outline"
                className="border-green-200 text-green-700 hover:bg-green-50"
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {cgtResult && (
          <Card className="bg-white border-green-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-t-lg">
              <CardTitle>CGT Calculation Results</CardTitle>
              <CardDescription className="text-teal-100">
                Based on Nigerian Tax Act 2026
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg border col-span-2 ${
                  cgtResult.is_exempt ? 'bg-blue-50 border-blue-200' : 
                  cgtResult.is_loss ? 'bg-gray-50 border-gray-200' :
                  'bg-green-50 border-green-200'
                }`}>
                  <p className={`text-sm font-medium ${
                    cgtResult.is_exempt ? 'text-blue-600' : 
                    cgtResult.is_loss ? 'text-gray-600' :
                    'text-green-600'
                  }`}>
                    {cgtResult.is_exempt ? 'CGT Exempt' : 
                     cgtResult.is_loss ? 'Capital Loss' : 
                     'Capital Gain'}
                  </p>
                  <p className={`text-2xl font-bold ${
                    cgtResult.is_exempt ? 'text-blue-800' : 
                    cgtResult.is_loss ? 'text-gray-800' :
                    'text-green-800'
                  }`}>
                    {cgtResult.is_loss ? 
                      formatCurrency(cgtResult.loss_amount) :
                      formatCurrency(Math.abs(cgtResult.capital_gain))
                    }
                  </p>
                </div>
                
                {!cgtResult.is_exempt && !cgtResult.is_loss && (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200 col-span-2">
                    <p className="text-sm text-red-600 font-medium">CGT Liability</p>
                    <p className="text-2xl font-bold text-red-800">
                      {formatCurrency(cgtResult.cgt_liability)}
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Rate: {cgtResult.rate_description}
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Detailed Breakdown */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Calculation Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Disposal Proceeds:</span>
                    <span className="font-medium">{formatCurrency(cgtResult.disposal_proceeds)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Acquisition Cost:</span>
                    <span className="font-medium">-{formatCurrency(cgtResult.acquisition_cost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Allowable Expenses:</span>
                    <span className="font-medium">-{formatCurrency(cgtResult.allowable_expenses)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-900 font-medium">
                      {cgtResult.is_loss ? 'Capital Loss:' : 'Capital Gain:'}
                    </span>
                    <span className={`font-bold ${cgtResult.is_loss ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(Math.abs(cgtResult.capital_gain))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Exemption Information */}
              {cgtResult.is_exempt && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Exemption Applied</h4>
                  <p className="text-sm text-blue-800">{cgtResult.exemption_reason}</p>
                  <p className="text-xs text-blue-700 mt-2">
                    Exemption applies when proceeds &lt; ₦150M AND gains &lt; ₦10M in 12 months
                  </p>
                </div>
              )}

              {/* Tax Information */}
              {!cgtResult.is_exempt && !cgtResult.is_loss && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Tax Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Taxpayer Type:</span>
                        <span className="font-medium capitalize">{cgtResult.taxpayer_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">CGT Rate:</span>
                        <span className="font-medium">{cgtResult.rate_description}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-900 font-medium">Total CGT Due:</span>
                        <span className="font-bold text-red-600">{formatCurrency(cgtResult.cgt_liability)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Print Report Button */}
              <div className="pt-4 border-t">
                <Button
                  onClick={() => generateCgtReport(cgtInput, cgtResult)}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white flex items-center justify-center space-x-2"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print Report (PDF)</span>
                </Button>
              </div>
              
              {/* Results Disclaimer */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-4">
                <p className="text-xs text-gray-600 text-center">
                  * Users are solely responsible for the validity, accuracy and completeness of the financial information they supply.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CGTCalculator;