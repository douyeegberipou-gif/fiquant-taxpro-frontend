import React, { useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.jsx';
import { Input } from './ui/input.jsx';
import { Label } from './ui/label.jsx';
import { Button } from './ui/button.jsx';
import { Badge } from './ui/badge.jsx';
import { Separator } from './ui/separator.jsx';
import { Alert, AlertDescription } from './ui/alert.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs.jsx';
import { Calculator, TrendingUp, AlertTriangle, Building, Coins, TrendingDown, Bitcoin, LineChart, Home, HelpCircle, Printer, User, Info, Save, Repeat, Lock } from 'lucide-react';
import { generateCgtReport } from '../utils/pdfGenerator';
import UpgradePrompt from './UpgradePrompt';
import { useUpgrade } from '../hooks/useUpgrade';
import VideoAdModal from './VideoAdModal';
import UpgradeLimitModal from './UpgradeLimitModal';
import { useAdCalculation } from '../hooks/useAdCalculation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CGTCalculator = ({ 
  formatCurrency, 
  hasFeature, 
  isAuthenticated, 
  onShowTrialModal, 
  onShowUpgradeModal, 
  onSaveCalculation, 
  savesUsed = 0, 
  savesLimit = 5,
  onSaveTemplate,
  hasTemplateAccess = false
}) => {
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [activeModule, setActiveModule] = useState('crypto');
  const { startTrial, requestUpgrade } = useUpgrade();
  
  // Ad-supported calculation hook for CGT
  const cgtAdCalc = useAdCalculation('cgt');

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

  // NTA 2025 Tax Rate Configurations (Effective 1 Jan 2026)
  // Source: Nigeria Tax Act 2025 - CGT aligned with income tax rates
  const taxRates = {
    individual: {
      // Progressive rates for individuals (NTA 2025) - CGT now uses PIT bands
      // Capital gains are aggregated into taxable income and taxed at these rates
      bands: [
        { min: 0, max: 800000, rate: 0 },           // First ₦800,000 - 0%
        { min: 800001, max: 3000000, rate: 15 },    // Next ₦2,200,000 - 15%
        { min: 3000001, max: 12000000, rate: 18 },  // Next ₦9,000,000 - 18%
        { min: 12000001, max: 25000000, rate: 21 }, // Next ₦13,000,000 - 21%
        { min: 25000001, max: 50000000, rate: 23 }, // Next ₦25,000,000 - 23%
        { min: 50000001, max: Infinity, rate: 25 }  // Above ₦50,000,000 - 25%
      ],
      exemption: {
        proceeds: 150000000, // ₦150 million - Share disposal small-investor relief
        gains: 10000000      // ₦10 million - Share disposal small-investor relief
      }
    },
    company: {
      // Companies: CGT increased to 30% (aligned with CIT rate) under NTA 2025
      small: { rate: 0, maxTurnover: 50000000 }, // Small companies: ≤₦50M turnover, 0% CGT
      large: { rate: 30 } // 30% flat rate for medium and large companies
    }
  };

  // Asset type definitions with NTA 2025 specific rules
  const assetTypeInfo = {
    crypto: {
      name: 'Cryptocurrency',
      description: 'Bitcoin, Ethereum, and other digital assets - taxed at progressive PIT rates (0-25%) for individuals or 30% for companies',
      tooltip: 'Under NTA 2025, crypto gains are taxed at progressive PIT rates up to 25% for individuals, or 30% for companies. All crypto transactions (sales, exchanges, mining, staking) are taxable events.',
      exemptions: 'Individuals: Progressive rates 0-25%. Companies: 30% flat rate.'
    },
    shares: {
      name: 'Share Sales',
      description: 'Listed and unlisted shares, stocks, ETFs - small investor relief available',
      tooltip: 'Share disposals enjoy exemptions under NTA 2025: gains ≤₦10M AND proceeds <₦150M within 12 months are tax-free for individuals. Reinvestment relief also available.',
      exemptions: 'Small investor relief: gains ≤₦10M and proceeds <₦150M are exempt. Reinvestment relief available.'
    },
    property: {
      name: 'Property & Real Estate',
      description: 'Land, buildings, residential and commercial property',
      tooltip: 'Property disposals: individuals pay progressive rates (0-25%), companies pay 30%. Private residence exemption may apply.',
      exemptions: 'Private residence exemption available. Companies: 30%. Individuals: 0-25% progressive.'
    },
    business_assets: {
      name: 'Business Assets',
      description: 'Plant, machinery, equipment, and other business assets',
      tooltip: 'Business asset disposals: Small companies (turnover ≤₦50M) pay 0% CGT. Large companies pay 30%.',
      exemptions: 'Small companies (turnover ≤₦50M) are exempt from CGT'
    },
    intellectual_property: {
      name: 'Intellectual Property',
      description: 'Patents, copyrights, trademarks, and other IP rights',
      tooltip: 'IP disposals are subject to standard CGT rates: 0-25% for individuals, 30% for companies.',
      exemptions: 'Individuals: 0-25% progressive. Companies: 30%'
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

  // Helper to save CGT calculation to backend for analytics
  const saveCGTToBackend = async (assetType, totalCost, totalProceeds, gain, taxDue, effectiveRate) => {
    if (isAuthenticated && isAuthenticated()) {
      try {
        const token = localStorage.getItem('token');
        await axios.post(
          `${BACKEND_URL}/api/auth/calculate-cgt`,
          {
            asset_type: assetType,
            taxpayer_type: commonInfo.taxpayer_type,
            taxpayer_name: commonInfo.taxpayer_name,
            acquisition_cost: totalCost,
            improvement_costs: 0,
            disposal_proceeds: totalProceeds,
            selling_expenses: 0
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('CGT calculation saved to history');
      } catch (saveError) {
        console.error('Failed to save CGT calculation to history:', saveError);
        // Don't show error to user - local calculation succeeded
      }
    }
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

      // Save to backend for analytics
      saveCGTToBackend('crypto', totalCost, totalProceeds, gain, taxDue, effectiveRate);

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

      // Save to backend for analytics
      saveCGTToBackend('shares', totalCost, totalProceeds, gain, taxDue, effectiveRate);

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

      // Save to backend for analytics
      saveCGTToBackend(assetInput.assetType, totalCost, totalProceeds, gain, taxDue, effectiveRate);

      setLoading(false);
    }, 1500);
  };

  // Reset functions for each module
  const resetCrypto = () => {
    setCryptoInput({
      cryptoType: 'bitcoin',
      quantity: '',
      purchasePrice: '',
      purchaseDate: '',
      salePrice: '',
      saleDate: '',
      transactionFees: '',
      exchangeFees: ''
    });
    setCryptoResult(null);
  };

  const resetShares = () => {
    setShareInput({
      companyName: '',
      shareType: 'listed',
      quantity: '',
      purchasePrice: '',
      purchaseDate: '',
      salePrice: '',
      saleDate: '',
      brokerageFees: '',
      stampDuty: ''
    });
    setShareResult(null);
  };

  const resetAssets = () => {
    setAssetInput({
      assetType: 'property',
      assetDescription: '',
      purchasePrice: '',
      purchaseDate: '',
      salePrice: '',
      saleDate: '',
      improvementCosts: '',
      sellingExpenses: '',
      legalFees: ''
    });
    setAssetResult(null);
  };

  const resetAll = () => {
    setCommonInfo({
      taxpayer_name: '',
      tin: '',
      year: new Date().getFullYear().toString(),
      taxpayer_type: 'individual'
    });
    resetCrypto();
    resetShares();
    resetAssets();
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 10}, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <Card className="bg-white border-green-100 shadow-lg">
          <CardHeader className="rounded-t-lg" style={{ background: 'linear-gradient(to right, #4A1528, #5C1A33)', color: '#D4AF37' }}>
            <CardTitle className="flex items-center space-x-2" style={{ color: '#D4AF37' }}>
              <TrendingUp className="h-5 w-5" />
              <span>CGT Details</span>
            </CardTitle>
            <CardDescription style={{ color: '#9CA3AF' }}>
              Enter your capital gains tax information
            </CardDescription>
          </CardHeader>
        <CardContent className="p-6">
          {/* Common Taxpayer Information */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <User className="h-4 w-4 mr-2 text-green-600" />
              Taxpayer Information
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxpayer_name">Name/Company *</Label>
                <Input
                  id="taxpayer_name"
                  type="text"
                  placeholder="John Doe / ABC Company"
                  value={commonInfo.taxpayer_name}
                  onChange={(e) => setCommonInfo(prev => ({...prev, taxpayer_name: e.target.value}))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tin">Tax ID Number (TIN)</Label>
                <Input
                  id="tin"
                  type="text"
                  placeholder="12345678901"
                  value={commonInfo.tin}
                  onChange={(e) => setCommonInfo(prev => ({...prev, tin: e.target.value}))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Tax Year *</Label>
                <select
                  id="year"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={commonInfo.year}
                  onChange={(e) => setCommonInfo(prev => ({...prev, year: e.target.value}))}
                >
                  <option value="">Select Year</option>
                  {Array.from({length: 30}, (_, i) => 2023 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Taxpayer Type *</Label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="taxpayer_type"
                      value="individual"
                      checked={commonInfo.taxpayer_type === 'individual'}
                      onChange={(e) => setCommonInfo(prev => ({...prev, taxpayer_type: e.target.value}))}
                      className="w-4 h-4 text-green-600"
                    />
                    <span className="text-sm">Individual</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="taxpayer_type"
                      value="company"
                      checked={commonInfo.taxpayer_type === 'company'}
                      onChange={(e) => setCommonInfo(prev => ({...prev, taxpayer_type: e.target.value}))}
                      className="w-4 h-4 text-green-600"
                    />
                    <span className="text-sm">Company</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* 3-Module Tabs */}
          <Tabs value={activeModule} onValueChange={setActiveModule} className="mt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="crypto" className="flex items-center">
                <Bitcoin className="h-4 w-4 mr-2" />
                Crypto
              </TabsTrigger>
              <TabsTrigger value="shares" className="flex items-center">
                <LineChart className="h-4 w-4 mr-2" />
                Shares
              </TabsTrigger>
              <TabsTrigger value="assets" className="flex items-center">
                <Home className="h-4 w-4 mr-2" />
                Other Assets
              </TabsTrigger>
            </TabsList>

            {/* Crypto CGT Module */}
            <TabsContent value="crypto" className="space-y-4 mt-6">
              <div className="flex items-center space-x-2 mb-4">
                <Bitcoin className="h-5 w-5 text-orange-500" />
                <h3 className="font-semibold text-gray-900">Cryptocurrency CGT Calculator</h3>
                <HelpCircle className="h-4 w-4 text-gray-400" title={assetTypeInfo.crypto.tooltip} />
              </div>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>NTA 2025:</strong> {assetTypeInfo.crypto.description}. {assetTypeInfo.crypto.exemptions}
                </AlertDescription>
              </Alert>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cryptocurrency Type</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={cryptoInput.cryptoType}
                    onChange={(e) => setCryptoInput(prev => ({...prev, cryptoType: e.target.value}))}
                  >
                    <option value="bitcoin">Bitcoin (BTC)</option>
                    <option value="ethereum">Ethereum (ETH)</option>
                    <option value="other">Other Cryptocurrency</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Quantity *</Label>
                  <Input
                    type="number"
                    step="0.00000001"
                    placeholder="1.5"
                    value={cryptoInput.quantity}
                    onChange={(e) => setCryptoInput(prev => ({...prev, quantity: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Purchase Price per Unit (₦) *</Label>
                  <Input
                    type="number"
                    placeholder="15,000,000"
                    value={cryptoInput.purchasePrice}
                    onChange={(e) => setCryptoInput(prev => ({...prev, purchasePrice: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sale Price per Unit (₦) *</Label>
                  <Input
                    type="number"
                    placeholder="25,000,000"
                    value={cryptoInput.salePrice}
                    onChange={(e) => setCryptoInput(prev => ({...prev, salePrice: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Purchase Date</Label>
                  <Input
                    type="date"
                    value={cryptoInput.purchaseDate}
                    onChange={(e) => setCryptoInput(prev => ({...prev, purchaseDate: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sale Date</Label>
                  <Input
                    type="date"
                    value={cryptoInput.saleDate}
                    onChange={(e) => setCryptoInput(prev => ({...prev, saleDate: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Transaction Fees (₦)</Label>
                  <Input
                    type="number"
                    placeholder="50,000"
                    value={cryptoInput.transactionFees}
                    onChange={(e) => setCryptoInput(prev => ({...prev, transactionFees: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Exchange Fees (₦)</Label>
                  <Input
                    type="number"
                    placeholder="25,000"
                    value={cryptoInput.exchangeFees}
                    onChange={(e) => setCryptoInput(prev => ({...prev, exchangeFees: e.target.value}))}
                  />
                </div>
              </div>
              
              {/* Disclaimer Note */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
                <p className="text-xs text-amber-800 flex items-start">
                  <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Note:</strong> Users are solely responsible for the validity, accuracy and completeness of the financial information they supply. CGT classifications are based on NTA 2026.
                  </span>
                </p>
              </div>
              
              {/* Ad-supported info text for free users */}
              {!cgtAdCalc.isPaidUser && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                  <p className="text-xs text-blue-700">
                    <Info className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />
                                        {cgtAdCalc.isLoggedIn 
                      ? `This feature includes ${cgtAdCalc.dailyLimit} free calculations daily. You have ${cgtAdCalc.remainingFreeCalcs} remaining today.`
                      : 'Create a free account for 15 daily calculations. Guests get 5 free calculations per day.'
                    }
                  </p>
                </div>
              )}
              
              <Button 
                onClick={() => cgtAdCalc.handleCalculateWithAd(calculateCryptoCGT)} 
                disabled={loading || !cryptoInput.quantity || !cryptoInput.purchasePrice || !cryptoInput.salePrice}
                className="w-full bg-orange-600 hover:bg-orange-700"
                data-testid="cgt-crypto-calculate-btn"
              >
                {loading ? 'Calculating...' : 'Calculate Crypto CGT'}
              </Button>
            </TabsContent>

            {/* Share Sale CGT Module */}
            <TabsContent value="shares" className="space-y-4 mt-6">
              <div className="flex items-center space-x-2 mb-4">
                <LineChart className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold text-gray-900">Share Sale CGT Calculator</h3>
                <HelpCircle className="h-4 w-4 text-gray-400" title={assetTypeInfo.shares.tooltip} />
              </div>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>NTA 2025:</strong> {assetTypeInfo.shares.description}. {assetTypeInfo.shares.exemptions}
                </AlertDescription>
              </Alert>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input
                    type="text"
                    placeholder="Dangote Cement Plc"
                    value={shareInput.companyName}
                    onChange={(e) => setShareInput(prev => ({...prev, companyName: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Share Type</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={shareInput.shareType}
                    onChange={(e) => setShareInput(prev => ({...prev, shareType: e.target.value}))}
                  >
                    <option value="listed">Listed Shares (NGX)</option>
                    <option value="unlisted">Unlisted Shares</option>
                    <option value="etf">ETF/Index Fund</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Number of Shares *</Label>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={shareInput.quantity}
                    onChange={(e) => setShareInput(prev => ({...prev, quantity: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Purchase Price per Share (₦) *</Label>
                  <Input
                    type="number"
                    placeholder="250"
                    value={shareInput.purchasePrice}
                    onChange={(e) => setShareInput(prev => ({...prev, purchasePrice: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sale Price per Share (₦) *</Label>
                  <Input
                    type="number"
                    placeholder="350"
                    value={shareInput.salePrice}
                    onChange={(e) => setShareInput(prev => ({...prev, salePrice: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Purchase Date</Label>
                  <Input
                    type="date"
                    value={shareInput.purchaseDate}
                    onChange={(e) => setShareInput(prev => ({...prev, purchaseDate: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sale Date</Label>
                  <Input
                    type="date"
                    value={shareInput.saleDate}
                    onChange={(e) => setShareInput(prev => ({...prev, saleDate: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Brokerage Fees (₦)</Label>
                  <Input
                    type="number"
                    placeholder="5,000"
                    value={shareInput.brokerageFees}
                    onChange={(e) => setShareInput(prev => ({...prev, brokerageFees: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stamp Duty (₦)</Label>
                  <Input
                    type="number"
                    placeholder="2,500"
                    value={shareInput.stampDuty}
                    onChange={(e) => setShareInput(prev => ({...prev, stampDuty: e.target.value}))}
                  />
                </div>
              </div>
              
              {/* Disclaimer Note */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
                <p className="text-xs text-amber-800 flex items-start">
                  <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Note:</strong> Users are solely responsible for the validity, accuracy and completeness of the financial information they supply. CGT classifications are based on NTA 2026.
                  </span>
                </p>
              </div>
              
              {/* Ad-supported info text for free users */}
              {!cgtAdCalc.isPaidUser && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                  <p className="text-xs text-blue-700">
                    <Info className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />
                                        {cgtAdCalc.isLoggedIn 
                      ? `This feature includes ${cgtAdCalc.dailyLimit} free calculations daily. You have ${cgtAdCalc.remainingFreeCalcs} remaining today.`
                      : 'Create a free account for 15 daily calculations. Guests get 5 free calculations per day.'
                    }
                  </p>
                </div>
              )}
              
              <Button 
                onClick={() => cgtAdCalc.handleCalculateWithAd(calculateShareCGT)} 
                disabled={loading || !shareInput.quantity || !shareInput.purchasePrice || !shareInput.salePrice}
                className="w-full bg-blue-600 hover:bg-blue-700"
                data-testid="cgt-share-calculate-btn"
              >
                {loading ? 'Calculating...' : 'Calculate Share CGT'}
              </Button>
            </TabsContent>

            {/* Other Assets CGT Module */}
            <TabsContent value="assets" className="space-y-4 mt-6">
              <div className="flex items-center space-x-2 mb-4">
                <Home className="h-5 w-5 text-purple-500" />
                <h3 className="font-semibold text-gray-900">Other Asset CGT Calculator</h3>
                <HelpCircle className="h-4 w-4 text-gray-400" title={assetTypeInfo.property.tooltip} />
              </div>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>NTA 2025:</strong> {assetTypeInfo.property.description}. {assetTypeInfo.property.exemptions}
                </AlertDescription>
              </Alert>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Asset Type</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={assetInput.assetType}
                    onChange={(e) => setAssetInput(prev => ({...prev, assetType: e.target.value}))}
                  >
                    <option value="property">Real Estate Property</option>
                    <option value="business_assets">Business Assets</option>
                    <option value="intellectual_property">Intellectual Property</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Asset Description</Label>
                  <Input
                    type="text"
                    placeholder="3-bedroom house in Lekki"
                    value={assetInput.assetDescription}
                    onChange={(e) => setAssetInput(prev => ({...prev, assetDescription: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Purchase Price (₦) *</Label>
                  <Input
                    type="number"
                    placeholder="50,000,000"
                    value={assetInput.purchasePrice}
                    onChange={(e) => setAssetInput(prev => ({...prev, purchasePrice: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sale Price (₦) *</Label>
                  <Input
                    type="number"
                    placeholder="80,000,000"
                    value={assetInput.salePrice}
                    onChange={(e) => setAssetInput(prev => ({...prev, salePrice: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Purchase Date</Label>
                  <Input
                    type="date"
                    value={assetInput.purchaseDate}
                    onChange={(e) => setAssetInput(prev => ({...prev, purchaseDate: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sale Date</Label>
                  <Input
                    type="date"
                    value={assetInput.saleDate}
                    onChange={(e) => setAssetInput(prev => ({...prev, saleDate: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Improvement Costs (₦)</Label>
                  <Input
                    type="number"
                    placeholder="5,000,000"
                    value={assetInput.improvementCosts}
                    onChange={(e) => setAssetInput(prev => ({...prev, improvementCosts: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Selling Expenses (₦)</Label>
                  <Input
                    type="number"
                    placeholder="1,000,000"
                    value={assetInput.sellingExpenses}
                    onChange={(e) => setAssetInput(prev => ({...prev, sellingExpenses: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Legal Fees (₦)</Label>
                  <Input
                    type="number"
                    placeholder="500,000"
                    value={assetInput.legalFees}
                    onChange={(e) => setAssetInput(prev => ({...prev, legalFees: e.target.value}))}
                  />
                </div>
              </div>
              
              {/* Disclaimer Note */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
                <p className="text-xs text-amber-800 flex items-start">
                  <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Note:</strong> Users are solely responsible for the validity, accuracy and completeness of the financial information they supply. CGT classifications are based on NTA 2026.
                  </span>
                </p>
              </div>
              
              {/* Ad-supported info text for free users */}
              {!cgtAdCalc.isPaidUser && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                  <p className="text-xs text-blue-700">
                    <Info className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />
                                        {cgtAdCalc.isLoggedIn 
                      ? `This feature includes ${cgtAdCalc.dailyLimit} free calculations daily. You have ${cgtAdCalc.remainingFreeCalcs} remaining today.`
                      : 'Create a free account for 15 daily calculations. Guests get 5 free calculations per day.'
                    }
                  </p>
                </div>
              )}
              
              <Button 
                onClick={() => cgtAdCalc.handleCalculateWithAd(calculateAssetCGT)} 
                disabled={loading || !assetInput.purchasePrice || !assetInput.salePrice}
                className="w-full bg-purple-600 hover:bg-purple-700"
                data-testid="cgt-asset-calculate-btn"
              >
                {loading ? 'Calculating...' : 'Calculate Asset CGT'}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
        </Card>

        {/* Video Ad Modal for CGT (guests only) */}
        <VideoAdModal
          isOpen={cgtAdCalc.showAdModal}
          onClose={cgtAdCalc.closeAdModal}
          onAdComplete={cgtAdCalc.onAdComplete}
          calculatorType="CGT"
          onStartTrial={onShowTrialModal}
          onSubscribe={onShowUpgradeModal}
        />

        {/* Upgrade Limit Modal for CGT (logged-in free users) */}
        <UpgradeLimitModal
          isOpen={cgtAdCalc.showUpgradePrompt}
          onClose={cgtAdCalc.closeUpgradePrompt}
          onStartTrial={onShowTrialModal}
          onViewPlans={onShowUpgradeModal}
          calculatorType="CGT"
          dailyLimit={cgtAdCalc.dailyLimit}
        />

        {/* Results - Dynamic based on active module */}
        {((activeModule === 'crypto' && cryptoResult) || 
          (activeModule === 'shares' && shareResult) || 
          (activeModule === 'assets' && assetResult)) && (
          <Card className="bg-white border-green-100 shadow-lg">
            <CardHeader className="rounded-t-lg"
              style={{ 
                background: 'linear-gradient(to right, #4A1528, #5C1A33)',
                color: '#D4AF37'
              }}
            >
              <CardTitle className="flex items-center space-x-2" style={{ color: '#D4AF37' }}>
                {activeModule === 'crypto' && <Bitcoin className="h-5 w-5" />}
                {activeModule === 'shares' && <LineChart className="h-5 w-5" />}
                {activeModule === 'assets' && <Home className="h-5 w-5" />}
                <span>
                  {activeModule === 'crypto' ? 'Crypto CGT Results' :
                   activeModule === 'shares' ? 'Share Sale CGT Results' :
                   'Asset CGT Results'}
                </span>
              </CardTitle>
              <CardDescription style={{ color: '#9CA3AF' }}>
                Based on Nigerian Tax Act 2025 - {commonInfo.taxpayer_type === 'individual' ? 'Individual' : 'Company'} Rates
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Get current result */}
              {(() => {
                const currentResult = activeModule === 'crypto' ? cryptoResult : 
                                    activeModule === 'shares' ? shareResult : assetResult;
                
                return (
                  <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-4 rounded-lg border col-span-2 ${
                        currentResult.exempt ? 'bg-blue-50 border-blue-200' : 
                        currentResult.chargeable_gain < 0 ? 'bg-gray-50 border-gray-200' :
                        'bg-green-50 border-green-200'
                      }`}>
                        <p className={`text-sm font-medium ${
                          currentResult.exempt ? 'text-blue-600' : 
                          currentResult.chargeable_gain < 0 ? 'text-gray-600' :
                          'text-green-600'
                        }`}>
                          {currentResult.exempt ? 'CGT Exempt' : 
                           currentResult.chargeable_gain < 0 ? 'Capital Loss' : 
                           'Capital Gain'}
                        </p>
                        <p className={`text-2xl font-bold ${
                          currentResult.exempt ? 'text-blue-800' : 
                          currentResult.chargeable_gain < 0 ? 'text-gray-800' :
                          'text-green-800'
                        }`}>
                          {formatCurrency(Math.abs(currentResult.chargeable_gain))}
                        </p>
                      </div>
                      
                      {!currentResult.exempt && currentResult.chargeable_gain > 0 && (
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200 col-span-2">
                          <p className="text-sm text-red-600 font-medium">CGT Liability</p>
                          <p className="text-2xl font-bold text-red-800">
                            {formatCurrency(currentResult.tax_due)}
                          </p>
                          <p className="text-xs text-red-600 mt-1">
                            Effective Rate: {currentResult.effective_rate.toFixed(2)}%
                          </p>
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Asset-specific Details */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Transaction Details</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="space-y-2 text-sm">
                          {activeModule === 'crypto' && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Cryptocurrency:</span>
                                <span className="font-medium capitalize">{currentResult.cryptoType}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Quantity:</span>
                                <span className="font-medium">{currentResult.quantity}</span>
                              </div>
                            </>
                          )}
                          {activeModule === 'shares' && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Company:</span>
                                <span className="font-medium">{currentResult.companyName || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Share Type:</span>
                                <span className="font-medium capitalize">{currentResult.shareType}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Quantity:</span>
                                <span className="font-medium">{currentResult.quantity} shares</span>
                              </div>
                            </>
                          )}
                          {activeModule === 'assets' && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Asset Type:</span>
                                <span className="font-medium capitalize">{currentResult.assetType?.replace('_', ' ')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Description:</span>
                                <span className="font-medium">{currentResult.assetDescription || 'N/A'}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Calculation Breakdown */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Calculation Breakdown</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Proceeds:</span>
                          <span className="font-medium">{formatCurrency(currentResult.totalProceeds)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Cost:</span>
                          <span className="font-medium">-{formatCurrency(currentResult.totalCost)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-gray-900 font-medium">
                            {currentResult.chargeable_gain < 0 ? 'Capital Loss:' : 'Capital Gain:'}
                          </span>
                          <span className={`font-bold ${currentResult.chargeable_gain < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(Math.abs(currentResult.chargeable_gain))}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Exemption Information */}
                    {currentResult.exempt && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Exemption Applied</h4>
                        <p className="text-sm text-blue-800">
                          This transaction qualifies for CGT exemption under NTA 2025.
                        </p>
                        <p className="text-xs text-blue-700 mt-2">
                          Exemption applies when proceeds &lt; ₦150M AND gains &lt; ₦10M for individuals
                        </p>
                      </div>
                    )}

                    {/* Tax Information */}
                    {!currentResult.exempt && currentResult.chargeable_gain > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900">Tax Information</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Taxpayer Type:</span>
                              <span className="font-medium capitalize">{commonInfo.taxpayer_type}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Effective CGT Rate:</span>
                              <span className="font-medium">{currentResult.effective_rate.toFixed(2)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Net Gain After Tax:</span>
                              <span className="font-medium text-green-600">{formatCurrency(currentResult.net_gain)}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                              <span className="text-gray-900 font-medium">Total CGT Due:</span>
                              <span className="font-bold text-red-600">{formatCurrency(currentResult.tax_due)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Print Report Button */}
                    <div className="pt-4 border-t space-y-2">
                      {/* Save Calculation Button */}
                      <Button
                        onClick={() => {
                          const inputData = {
                            ...commonInfo,
                            asset_type: activeModule,
                            calculation_date: currentResult.calculation_date
                          };
                          onSaveCalculation && onSaveCalculation('cgt', inputData, currentResult);
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center space-x-2"
                        data-testid="cgt-save-btn"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        <span>Save Calculation</span>
                      </Button>
                      
                      {/* Save counter */}
                      {isAuthenticated && isAuthenticated() && (
                        <div className="flex items-center justify-center text-sm text-gray-500">
                          <span>Saved: <span className="font-medium">{savesUsed}</span> of <span className="font-medium">{savesLimit}</span></span>
                          {savesUsed >= savesLimit * 0.8 && (
                            <a href="#pricing" className="ml-2 text-emerald-600 hover:text-emerald-700 font-medium">
                              Upgrade →
                            </a>
                          )}
                        </div>
                      )}
                      
                      {/* Set up as Template Button */}
                      <Button
                        onClick={() => {
                          const templateInput = {
                            ...commonInfo,
                            asset_type: activeModule,
                            calculation_date: currentResult.calculation_date
                          };
                          onSaveTemplate && onSaveTemplate(templateInput);
                        }}
                        variant="outline"
                        className="w-full border-amber-500 text-amber-600 hover:bg-amber-50 flex items-center justify-center space-x-2"
                        data-testid="cgt-template-btn"
                      >
                        <Repeat className="h-4 w-4 mr-2" />
                        <span>Set up as recurrent calculation template</span>
                        {!hasTemplateAccess && <Lock className="h-3.5 w-3.5 ml-2 text-amber-400" />}
                      </Button>
                      
                      <Button
                        onClick={() => {
                          const reportData = {
                            ...commonInfo,
                            asset_type: activeModule,
                            calculation_date: currentResult.calculation_date
                          };
                          generateCgtReport(reportData, currentResult);
                        }}
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
                  </>
                );
              })()}
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