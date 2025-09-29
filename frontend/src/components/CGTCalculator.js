import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.jsx';
import { Input } from './ui/input.jsx';
import { Label } from './ui/label.jsx';
import { Button } from './ui/button.jsx';
import { Badge } from './ui/badge.jsx';
import { Separator } from './ui/separator.jsx';
import { Alert, AlertDescription } from './ui/alert.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs.jsx';
import { Calculator, TrendingUp, AlertTriangle, Building, Coins, TrendingDown, Bitcoin, LineChart, Home, HelpCircle, Printer, User } from 'lucide-react';
import { generateCgtReport } from '../utils/pdfGenerator';
import UpgradePrompt from './UpgradePrompt';
import { useUpgrade } from '../hooks/useUpgrade';

const CGTCalculator = ({ formatCurrency, hasFeature }) => {
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [activeModule, setActiveModule] = useState('crypto');
  const { startTrial, requestUpgrade } = useUpgrade();

  const handleUpgrade = async () => {
    const result = await requestUpgrade('pro');
    if (result.success) {
      setShowUpgradePrompt(false);
    }
  };

  const handleTrial = async () => {
    const result = await startTrial('pro');
    if (result.success) {
      setShowUpgradePrompt(false);
    } else {
      alert(result.message);
    }
  };

  // Common taxpayer information for all modules
  const [commonInfo, setCommonInfo] = useState({
    taxpayer_name: '',
    tin: '',
    year: new Date().getFullYear().toString(),
    taxpayer_type: 'individual' // individual or company
  });

  // Crypto CGT Calculator State
  const [cryptoInput, setCryptoInput] = useState({
    cryptoType: 'bitcoin',
    quantity: '',
    purchasePrice: '',
    purchaseDate: '',
    salePrice: '',
    saleDate: '',
    transactionFees: '',
    exchangeFees: ''
  });

  // Share Sale CGT Calculator State
  const [shareInput, setShareInput] = useState({
    companyName: '',
    shareType: 'listed', // listed or unlisted
    quantity: '',
    purchasePrice: '',
    purchaseDate: '',
    salePrice: '',
    saleDate: '',
    brokerageFees: '',
    stampDuty: ''
  });

  // Other Asset CGT Calculator State
  const [assetInput, setAssetInput] = useState({
    assetType: 'property', // property, business_assets, intellectual_property
    assetDescription: '',
    purchasePrice: '',
    purchaseDate: '',
    salePrice: '',
    saleDate: '',
    improvementCosts: '',
    sellingExpenses: '',
    legalFees: ''
  });

  const [cryptoResult, setCryptoResult] = useState(null);
  const [shareResult, setShareResult] = useState(null);
  const [assetResult, setAssetResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // NTA 2025 Tax Rate Configurations
  const taxRates = {
    individual: {
      // Progressive rates for individuals (NTA 2025)
      bands: [
        { min: 0, max: 800000, rate: 0 }, // First ₦800,000 exempt
        { min: 800001, max: 1600000, rate: 7 },
        { min: 1600001, max: 3200000, rate: 11 },
        { min: 3200001, max: 6400000, rate: 15 },
        { min: 6400001, max: 12800000, rate: 19 },
        { min: 12800001, max: 25600000, rate: 21 },
        { min: 25600001, max: 51200000, rate: 23 },
        { min: 51200001, max: Infinity, rate: 25 }
      ],
      exemption: {
        proceeds: 150000000, // ₦150 million
        gains: 10000000      // ₦10 million
      }
    },
    company: {
      small: { rate: 0, maxTurnover: 100000000 }, // ₦100 million turnover
      large: { rate: 30 } // 30% for large companies
    }
  };

  // Asset type definitions with NTA 2025 specific rules
  const assetTypeInfo = {
    crypto: {
      name: 'Cryptocurrency',
      description: 'Bitcoin, Ethereum, and other digital assets - taxed at personal income tax rates under NTA 2025',
      tooltip: 'Crypto gains are now taxed at progressive rates up to 25% for individuals. All crypto transactions (sales, exchanges, mining, staking) are taxable events.',
      exemptions: 'Gains under ₦10M and proceeds under ₦150M are exempt for individuals'
    },
    shares: {
      name: 'Share Sales',
      description: 'Listed and unlisted shares, stocks, ETFs - exempt up to ₦10M gains',
      tooltip: 'Share sales enjoy significant exemptions under NTA 2025: gains under ₦10M and proceeds under ₦150M are tax-free. Reinvestment relief available.',
      exemptions: 'Gains under ₦10M and proceeds under ₦150M are exempt. Reinvestment relief available for larger gains.'
    },
    property: {
      name: 'Property & Real Estate',
      description: 'Land, buildings, residential and commercial property',
      tooltip: 'Property disposals are taxed at progressive rates for individuals (up to 25%) or 30% for companies under NTA 2025.',
      exemptions: 'Standard exemption thresholds apply: ₦10M gains, ₦150M proceeds for individuals'
    },
    business_assets: {
      name: 'Business Assets',
      description: 'Plant, machinery, equipment, and other business assets',
      tooltip: 'Business asset disposals follow standard CGT rules. Small companies (turnover <₦100M) pay 0% CGT.',
      exemptions: 'Small companies with turnover under ₦100M are exempt from CGT'
    },
    intellectual_property: {
      name: 'Intellectual Property',
      description: 'Patents, copyrights, trademarks, and other IP rights',
      tooltip: 'IP disposals are subject to standard CGT rates under NTA 2025.',
      exemptions: 'Standard exemption thresholds apply'
    }
  };

  // Helper function to calculate progressive tax for individuals
  const calculateProgressiveTax = (gain) => {
    let tax = 0;
    let remainingGain = gain;

    for (const band of taxRates.individual.bands) {
      if (remainingGain <= 0) break;
      
      const bandAmount = Math.min(remainingGain, band.max - band.min + 1);
      tax += bandAmount * (band.rate / 100);
      remainingGain -= bandAmount;
      
      if (band.max === Infinity) break;
    }

    return tax;
  };

  // Check if individual qualifies for exemption
  const checkIndividualExemption = (proceeds, gain) => {
    return proceeds < taxRates.individual.exemption.proceeds && 
           gain < taxRates.individual.exemption.gains;
  };

  // Crypto CGT Calculation
  const calculateCryptoCGT = () => {
    if (!hasFeature || !hasFeature('cgt_calc')) {
      setShowUpgradePrompt(true);
      return;
    }

    const quantity = parseFloat(cryptoInput.quantity) || 0;
    const purchasePrice = parseFloat(cryptoInput.purchasePrice) || 0;
    const salePrice = parseFloat(cryptoInput.salePrice) || 0;
    const fees = parseFloat(cryptoInput.transactionFees) || 0;
    const exchangeFees = parseFloat(cryptoInput.exchangeFees) || 0;
    
    if (quantity <= 0 || purchasePrice <= 0 || salePrice <= 0) {
      alert('Please enter valid quantity, purchase price, and sale price');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const totalCost = (purchasePrice * quantity) + fees;
      const totalProceeds = (salePrice * quantity) - exchangeFees;
      const gain = totalProceeds - totalCost;
      
      let taxDue = 0;
      let effectiveRate = 0;

      if (commonInfo.taxpayer_type === 'individual') {
        if (checkIndividualExemption(totalProceeds, gain)) {
          taxDue = 0;
          effectiveRate = 0;
        } else {
          taxDue = calculateProgressiveTax(gain);
          effectiveRate = gain > 0 ? (taxDue / gain) * 100 : 0;
        }
      } else {
        // Company rates
        taxDue = gain * 0.30; // 30% for companies
        effectiveRate = 30;
      }

      setCryptoResult({
        cryptoType: cryptoInput.cryptoType,
        quantity: quantity,
        totalCost: totalCost,
        totalProceeds: totalProceeds,
        chargeable_gain: gain,
        tax_due: Math.max(0, taxDue),
        effective_rate: effectiveRate,
        net_gain: gain - Math.max(0, taxDue),
        exempt: commonInfo.taxpayer_type === 'individual' && checkIndividualExemption(totalProceeds, gain),
        calculation_date: new Date().toLocaleDateString('en-NG')
      });

      setLoading(false);
    }, 1500);
  };

  // Share Sale CGT Calculation
  const calculateShareCGT = () => {
    if (!hasFeature || !hasFeature('cgt_calc')) {
      setShowUpgradePrompt(true);
      return;
    }

    const quantity = parseFloat(shareInput.quantity) || 0;
    const purchasePrice = parseFloat(shareInput.purchasePrice) || 0;
    const salePrice = parseFloat(shareInput.salePrice) || 0;
    const brokerageFees = parseFloat(shareInput.brokerageFees) || 0;
    const stampDuty = parseFloat(shareInput.stampDuty) || 0;
    
    if (quantity <= 0 || purchasePrice <= 0 || salePrice <= 0) {
      alert('Please enter valid quantity, purchase price, and sale price');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const totalCost = (purchasePrice * quantity) + brokerageFees + stampDuty;
      const totalProceeds = (salePrice * quantity);
      const gain = totalProceeds - totalCost;
      
      let taxDue = 0;
      let effectiveRate = 0;

      if (commonInfo.taxpayer_type === 'individual') {
        if (checkIndividualExemption(totalProceeds, gain)) {
          taxDue = 0;
          effectiveRate = 0;
        } else {
          taxDue = calculateProgressiveTax(gain);
          effectiveRate = gain > 0 ? (taxDue / gain) * 100 : 0;
        }
      } else {
        taxDue = gain * 0.30; // 30% for companies
        effectiveRate = 30;
      }

      setShareResult({
        companyName: shareInput.companyName,
        shareType: shareInput.shareType,
        quantity: quantity,
        totalCost: totalCost,
        totalProceeds: totalProceeds,
        chargeable_gain: gain,
        tax_due: Math.max(0, taxDue),
        effective_rate: effectiveRate,
        net_gain: gain - Math.max(0, taxDue),
        exempt: commonInfo.taxpayer_type === 'individual' && checkIndividualExemption(totalProceeds, gain),
        calculation_date: new Date().toLocaleDateString('en-NG')
      });

      setLoading(false);
    }, 1500);
  };

  // Other Asset CGT Calculation  
  const calculateAssetCGT = () => {
    if (!hasFeature || !hasFeature('cgt_calc')) {
      setShowUpgradePrompt(true);
      return;
    }

    const purchasePrice = parseFloat(assetInput.purchasePrice) || 0;
    const salePrice = parseFloat(assetInput.salePrice) || 0;
    const improvements = parseFloat(assetInput.improvementCosts) || 0;
    const sellingExpenses = parseFloat(assetInput.sellingExpenses) || 0;
    const legalFees = parseFloat(assetInput.legalFees) || 0;
    
    if (purchasePrice <= 0 || salePrice <= 0) {
      alert('Please enter valid purchase price and sale price');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const totalCost = purchasePrice + improvements + legalFees;
      const totalProceeds = salePrice - sellingExpenses;
      const gain = totalProceeds - totalCost;
      
      let taxDue = 0;
      let effectiveRate = 0;

      if (commonInfo.taxpayer_type === 'individual') {
        if (checkIndividualExemption(totalProceeds, gain)) {
          taxDue = 0;
          effectiveRate = 0;
        } else {
          taxDue = calculateProgressiveTax(gain);
          effectiveRate = gain > 0 ? (taxDue / gain) * 100 : 0;
        }
      } else {
        // Check if small company (exempt) or large company (30%)
        taxDue = gain * 0.30; // Assuming large company for now
        effectiveRate = 30;
      }

      setAssetResult({
        assetType: assetInput.assetType,
        assetDescription: assetInput.assetDescription,
        totalCost: totalCost,
        totalProceeds: totalProceeds,
        chargeable_gain: gain,
        tax_due: Math.max(0, taxDue),
        effective_rate: effectiveRate,
        net_gain: gain - Math.max(0, taxDue),
        exempt: commonInfo.taxpayer_type === 'individual' && checkIndividualExemption(totalProceeds, gain),
        calculation_date: new Date().toLocaleDateString('en-NG')
      });

      setLoading(false);
    }, 1500);
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
                onClick={() => {
                  if (!hasFeature || !hasFeature('cgt_calc')) {
                    setShowUpgradePrompt(true);
                    return;
                  }
                  calculateCGT();
                }} 
                disabled={cgtLoading || !cgtInput.taxpayer_name || !cgtInput.disposal_proceeds || !cgtInput.acquisition_cost}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {cgtLoading ? 'Calculating...' : 'Calculate CGT'}
                {hasFeature && !hasFeature('cgt_calc') && (
                  <Badge variant="outline" className="ml-2 text-xs bg-green-50 text-green-600 border-green-200">
                    PRO+
                  </Badge>
                )}
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

      {/* Upgrade Prompt */}
      {showUpgradePrompt && (
        <UpgradePrompt
          type="feature"
          feature="cgt_calc"
          onUpgrade={handleUpgrade}
          onTrial={handleTrial}
          onClose={() => setShowUpgradePrompt(false)}
        />
      )}
    </div>
  );
};

export default CGTCalculator;