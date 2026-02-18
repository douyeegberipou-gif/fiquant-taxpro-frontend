import React, { useState } from 'react';
import { Building2, TrendingDown, TrendingUp, AlertTriangle, CheckCircle, Settings, CreditCard, Printer, Mail, Info, Save, Repeat, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import UpgradePrompt from './UpgradePrompt';
import { useUpgrade } from '../hooks/useUpgrade';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { Switch } from './ui/switch';
import { generateCitReport, emailCitReport } from '../utils/pdfGenerator';
import VideoAdModal from './VideoAdModal';
import UpgradeLimitModal from './UpgradeLimitModal';
import { useAdCalculation } from '../hooks/useAdCalculation';

const CITCalculator = ({ 
  citInput, 
  citResult, 
  citLoading, 
  handleCitInputChange, 
  calculateCitTax, 
  resetCitForm,
  formatCurrency,
  hasFeature,
  user,
  onShowTrialModal,
  onShowUpgradeModal,
  onSaveCalculation,
  savesUsed = 0,
  savesLimit = 5,
  isAuthenticated,
  onSaveTemplate,
  hasTemplateAccess = false
}) => {
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [citMode, setCitMode] = useState('standard'); // 'standard' or 'professional'
  const { startTrial, requestUpgrade, isLoading } = useUpgrade();
  
  // Professional mode input state
  const [profInput, setProfInput] = useState({
    // Company Details
    company_name: '',
    tin: '',
    year_of_assessment: '2026',
    tax_year: '2025',
    annual_turnover: '',
    total_fixed_assets: '',
    is_professional_service: false,
    is_multinational: false,
    // Financial Information (Thin Cap)
    total_debt: '',
    total_equity: '',
    // Profit & Add-backs
    net_profit_per_accounts: '',
    depreciation: '',
    provision_bad_debts: '',
    impairment_loss: '',
    accretion_interest: '',
    loss_on_asset_disposal: '',
    exchange_loss: '',
    other_addbacks: '',
    unutilised_tax_losses_bf: '',
    // Capital Allowance fields - New Assets (Cost)
    buildings_cost: '',
    furniture_fittings_cost: '',
    plant_machinery_cost: '',
    motor_vehicles_cost: '',
    other_assets_cost: '',
    // Capital Allowance fields - Existing Assets (WDV)
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
    other_wht_credits: ''
  });
  
  const handleProfInputChange = (field, value) => {
    setProfInput(prev => ({ ...prev, [field]: value }));
  };
  
  // Professional mode calculations
  const calculateProfessionalCIT = () => {
    // Company details
    const annualTurnover = parseFloat(profInput.annual_turnover) || 0;
    const totalFixedAssets = parseFloat(profInput.total_fixed_assets) || 0;
    
    // Determine company size based on turnover
    let companySize = 'large';
    if (annualTurnover < 25000000) {
      companySize = 'small';
    } else if (annualTurnover < 100000000) {
      companySize = 'medium';
    }
    
    const netProfit = parseFloat(profInput.net_profit_per_accounts) || 0;
    const depreciation = parseFloat(profInput.depreciation) || 0;
    const provisionBadDebts = parseFloat(profInput.provision_bad_debts) || 0;
    const impairmentLoss = parseFloat(profInput.impairment_loss) || 0;
    const accretionInterest = parseFloat(profInput.accretion_interest) || 0;
    const lossOnAssetDisposal = parseFloat(profInput.loss_on_asset_disposal) || 0;
    const exchangeLoss = parseFloat(profInput.exchange_loss) || 0;
    const otherAddbacks = parseFloat(profInput.other_addbacks) || 0;
    
    const totalAddbacks = depreciation + provisionBadDebts + impairmentLoss + 
                          accretionInterest + lossOnAssetDisposal + exchangeLoss + otherAddbacks;
    const adjustedProfit = netProfit + totalAddbacks;
    
    const unutilisedLosses = parseFloat(profInput.unutilised_tax_losses_bf) || 0;
    const lossesApplied = Math.min(unutilisedLosses, Math.max(0, adjustedProfit));
    const profitAfterLossRelief = Math.max(0, adjustedProfit - lossesApplied);
    
    // Calculate Capital Allowances from asset inputs
    // Rates: Buildings 10%, Furniture 20%, Plant & Machinery 20%, Motor Vehicles 25%, Other 20%
    const buildingsCost = parseFloat(profInput.buildings_cost) || 0;
    const furnitureCost = parseFloat(profInput.furniture_fittings_cost) || 0;
    const plantCost = parseFloat(profInput.plant_machinery_cost) || 0;
    const motorCost = parseFloat(profInput.motor_vehicles_cost) || 0;
    const otherAssetsCost = parseFloat(profInput.other_assets_cost) || 0;
    
    const buildingsWdv = parseFloat(profInput.buildings_wdv) || 0;
    const furnitureWdv = parseFloat(profInput.furniture_fittings_wdv) || 0;
    const plantWdv = parseFloat(profInput.plant_machinery_wdv) || 0;
    const motorWdv = parseFloat(profInput.motor_vehicles_wdv) || 0;
    const otherAssetsWdv = parseFloat(profInput.other_assets_wdv) || 0;
    
    // Calculate allowances for each asset category
    const buildingsAllowance = (buildingsCost + buildingsWdv) * 0.10;
    const furnitureAllowance = (furnitureCost + furnitureWdv) * 0.20;
    const plantAllowance = (plantCost + plantWdv) * 0.20;
    const motorAllowance = (motorCost + motorWdv) * 0.25;
    const otherAllowance = (otherAssetsCost + otherAssetsWdv) * 0.20;
    
    const totalCapitalAllowances = buildingsAllowance + furnitureAllowance + plantAllowance + motorAllowance + otherAllowance;
    
    const taxableProfit = Math.max(0, profitAfterLossRelief - totalCapitalAllowances);
    
    // Determine CIT rate based on company size (2026 rates)
    // Small companies (turnover < N25M): 0%
    // Medium companies (N25M - N100M): 20%
    // Large companies (> N100M): 30%
    let citRate = 0.30;
    if (companySize === 'small') {
      citRate = 0;
    } else if (companySize === 'medium') {
      citRate = 0.20;
    }
    
    const devLevyRate = 0.04;
    const citDue = taxableProfit * citRate;
    const developmentLevy = taxableProfit * devLevyRate;
    const totalTaxDue = citDue + developmentLevy;
    
    const whtContracts = parseFloat(profInput.wht_on_contracts) || 0;
    const whtDividends = parseFloat(profInput.wht_on_dividends) || 0;
    const whtRent = parseFloat(profInput.wht_on_rent) || 0;
    const whtInterest = parseFloat(profInput.wht_on_interest) || 0;
    const otherWht = parseFloat(profInput.other_wht_credits) || 0;
    const totalWhtCredits = whtContracts + whtDividends + whtRent + whtInterest + otherWht;
    
    const netTaxPayable = Math.max(0, totalTaxDue - totalWhtCredits);
    
    return {
      // Company details
      companyName: profInput.company_name,
      tin: profInput.tin,
      yearOfAssessment: profInput.year_of_assessment,
      taxYear: profInput.tax_year,
      annualTurnover,
      totalFixedAssets,
      companySize,
      isProfessionalService: profInput.is_professional_service,
      isMultinational: profInput.is_multinational,
      // Calculation results
      netProfit,
      totalAddbacks,
      adjustedProfit,
      lossesApplied,
      unutilisedLossesCarriedForward: Math.max(0, unutilisedLosses - lossesApplied),
      profitAfterLossRelief,
      // Capital allowances breakdown
      capitalAllowancesBreakdown: {
        buildings: { cost: buildingsCost, wdv: buildingsWdv, rate: 0.10, allowance: buildingsAllowance },
        furniture: { cost: furnitureCost, wdv: furnitureWdv, rate: 0.20, allowance: furnitureAllowance },
        plant: { cost: plantCost, wdv: plantWdv, rate: 0.20, allowance: plantAllowance },
        motor: { cost: motorCost, wdv: motorWdv, rate: 0.25, allowance: motorAllowance },
        other: { cost: otherAssetsCost, wdv: otherAssetsWdv, rate: 0.20, allowance: otherAllowance }
      },
      totalCapitalAllowances,
      taxableProfit,
      citRate,
      citDue,
      devLevyRate,
      developmentLevy,
      totalTaxDue,
      totalWhtCredits,
      whtBreakdown: { whtContracts, whtDividends, whtRent, whtInterest, otherWht },
      netTaxPayable,
      effectiveTaxRate: netProfit > 0 ? netTaxPayable / netProfit : 0
    };
  };
  
  const profResult = citMode === 'professional' ? calculateProfessionalCIT() : null;
  
  // Ad-supported calculation hook for CIT
  const citAdCalc = useAdCalculation('cit');

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

  const handleEmailReport = async () => {
    if (!emailRecipient) {
      alert('Please enter an email address');
      return;
    }
    setEmailSending(true);
    try {
      await emailCitReport(citInput, citResult, emailRecipient);
      alert('Report sent successfully!');
      setShowEmailModal(false);
      setEmailRecipient('');
    } catch (error) {
      alert('Failed to send report. Please try again.');
    } finally {
      setEmailSending(false);
    }
  };
  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Input Form */}
      <Card className="bg-white shadow-lg" style={{ borderColor: '#0F2D4A20' }}>
        <CardHeader className="rounded-t-lg" style={{ background: 'linear-gradient(to right, #0F2D4A, #1A3A5C)', color: '#D4AF37' }}>
          <CardTitle className="flex items-center space-x-2" style={{ color: '#D4AF37' }}>
            <Building2 className="h-5 w-5" />
            <span>Company Information</span>
          </CardTitle>
          <CardDescription style={{ color: '#9CA3AF' }}>
            Enter your company's financial details for CIT calculation
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Mode Toggle */}
          <div className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setCitMode('standard')}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                  citMode === 'standard' 
                    ? 'bg-black text-white shadow-md' 
                    : 'bg-white text-gray-600 hover:bg-gray-100 border'
                }`}
              >
                Standard
              </button>
              <button
                onClick={() => setCitMode('professional')}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                  citMode === 'professional' 
                    ? 'bg-black text-white shadow-md' 
                    : 'bg-white text-gray-600 hover:bg-gray-100 border'
                }`}
              >
                Professional
              </button>
            </div>
            <p className="text-xs text-gray-500">
              {citMode === 'standard' 
                ? 'Recommended for non-finance professionals' 
                : 'Recommended for Finance professionals'}
            </p>
          </div>
          
          {citMode === 'standard' ? (
            <>
          {/* Company Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Building2 className="h-4 w-4 mr-2 text-blue-600" />
              Company Details
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  type="text"
                  placeholder="ABC Nigeria Limited"
                  value={citInput.company_name}
                  onChange={(e) => handleCitInputChange('company_name', e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="tin">Tax Identification Number (TIN)</Label>
                <Input
                  id="tin"
                  type="text"
                  placeholder="12345678901"
                  value={citInput.tin}
                  onChange={(e) => handleCitInputChange('tin', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year_of_assessment">Year of Assessment *</Label>
                <Input
                  id="year_of_assessment"
                  type="number"
                  placeholder="2024"
                  value={citInput.year_of_assessment}
                  onChange={(e) => handleCitInputChange('year_of_assessment', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax_year">Tax Year *</Label>
                <Input
                  id="tax_year"
                  type="number"
                  placeholder="2024"
                  value={citInput.tax_year}
                  onChange={(e) => handleCitInputChange('tax_year', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="annual_turnover">Annual Turnover (₦) *</Label>
                <Input
                  id="annual_turnover"
                  type="number"
                  placeholder="₦500,000,000"
                  className="placeholder:text-gray-400"
                  value={citInput.annual_turnover}
                  onChange={(e) => handleCitInputChange('annual_turnover', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total_fixed_assets">Total Fixed Assets (₦)</Label>
                <Input
                  id="total_fixed_assets"
                  type="number"
                  placeholder="₦200,000,000"
                  className="placeholder:text-gray-400"
                  value={citInput.total_fixed_assets}
                  onChange={(e) => handleCitInputChange('total_fixed_assets', e.target.value)}
                />
              </div>
            </div>

            {/* Company Type Switches */}
            <div className="grid sm:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_professional_service" className="text-sm font-medium">Professional Service Firm</Label>
                  <Switch
                    id="is_professional_service"
                    checked={citInput.is_professional_service}
                    onCheckedChange={(checked) => handleCitInputChange('is_professional_service', checked)}
                    className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-white border-2 border-gray-300"
                  />
                </div>
                <p className="text-xs text-gray-600 italic">Select if applicable</p>
              </div>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_multinational" className="text-sm font-medium">Multinational Enterprise</Label>
                  <Switch
                    id="is_multinational"
                    checked={citInput.is_multinational}
                    onCheckedChange={(checked) => handleCitInputChange('is_multinational', checked)}
                    className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-white border-2 border-gray-300"
                  />
                </div>
                <p className="text-xs text-gray-600 italic">Select if applicable</p>
              </div>
              {citInput.is_multinational && (
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="global_revenue_eur">Global Group Revenue (EUR)</Label>
                  <Input
                    id="global_revenue_eur"
                    type="number"
                    placeholder="750,000,000"
                    className="placeholder:text-gray-400"
                    value={citInput.global_revenue_eur}
                    onChange={(e) => handleCitInputChange('global_revenue_eur', e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Revenue Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
              Revenue & Income
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gross_income">Gross Income/Revenue (₦) *</Label>
                <Input
                  id="gross_income"
                  type="number"
                  placeholder="₦500,000,000"
                  value={citInput.gross_income}
                  onChange={(e) => handleCitInputChange('gross_income', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="other_income">Other Income (₦)</Label>
                <Input
                  id="other_income"
                  type="number"
                  placeholder="10,000,000"
                  value={citInput.other_income}
                  onChange={(e) => handleCitInputChange('other_income', e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Deductible Expenses */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              Deductible Expenses
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost_of_goods_sold">Cost of Goods Sold (₦)</Label>
                <Input
                  id="cost_of_goods_sold"
                  type="number"
                  placeholder="200,000,000"
                  value={citInput.cost_of_goods_sold}
                  onChange={(e) => handleCitInputChange('cost_of_goods_sold', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff_costs">Staff Costs (₦)</Label>
                <Input
                  id="staff_costs"
                  type="number"
                  placeholder="50,000,000"
                  value={citInput.staff_costs}
                  onChange={(e) => handleCitInputChange('staff_costs', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rent_expenses">Rent & Utilities (₦)</Label>
                <Input
                  id="rent_expenses"
                  type="number"
                  placeholder="12,000,000"
                  value={citInput.rent_expenses}
                  onChange={(e) => handleCitInputChange('rent_expenses', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="professional_fees">Professional Fees (₦)</Label>
                <Input
                  id="professional_fees"
                  type="number"
                  placeholder="₦5,000,000"
                  value={citInput.professional_fees}
                  onChange={(e) => handleCitInputChange('professional_fees', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interest_paid_unrelated">Interest (Unrelated Parties) (₦)</Label>
                <Input
                  id="interest_paid_unrelated"
                  type="number"
                  placeholder="8,000,000"
                  value={citInput.interest_paid_unrelated}
                  onChange={(e) => handleCitInputChange('interest_paid_unrelated', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interest_paid_related">Interest (Related Parties) (₦)</Label>
                <Input
                  id="interest_paid_related"
                  type="number"
                  placeholder="3,000,000"
                  value={citInput.interest_paid_related}
                  onChange={(e) => handleCitInputChange('interest_paid_related', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="other_deductible_expenses">Other Deductible (₦)</Label>
                <Input
                  id="other_deductible_expenses"
                  type="number"
                  placeholder="7,000,000"
                  value={citInput.other_deductible_expenses}
                  onChange={(e) => handleCitInputChange('other_deductible_expenses', e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Non-deductible Expenses */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
              Non-deductible Expenses
            </h3>
            <Alert className="bg-amber-50 border-amber-200">
              <AlertDescription className="text-amber-800 text-xs">
                <strong>Note:</strong> Depreciation is not tax-deductible. Capital allowances replace depreciation for tax purposes.
              </AlertDescription>
            </Alert>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="depreciation">Depreciation (₦)</Label>
                <Input
                  id="depreciation"
                  type="number"
                  placeholder="15,000,000"
                  value={citInput.depreciation}
                  onChange={(e) => handleCitInputChange('depreciation', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="entertainment_expenses">Entertainment & Gifts (₦)</Label>
                <Input
                  id="entertainment_expenses"
                  type="number"
                  placeholder="2,000,000"
                  value={citInput.entertainment_expenses}
                  onChange={(e) => handleCitInputChange('entertainment_expenses', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fines_penalties">Fines & Penalties (₦)</Label>
                <Input
                  id="fines_penalties"
                  type="number"
                  placeholder="500,000"
                  value={citInput.fines_penalties}
                  onChange={(e) => handleCitInputChange('fines_penalties', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="personal_expenses">Personal Expenses (₦)</Label>
                <Input
                  id="personal_expenses"
                  type="number"
                  placeholder="1,000,000"
                  value={citInput.personal_expenses}
                  onChange={(e) => handleCitInputChange('personal_expenses', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="other_non_deductible">Other Non-deductible (₦)</Label>
                <Input
                  id="other_non_deductible"
                  type="number"
                  placeholder="500,000"
                  value={citInput.other_non_deductible}
                  onChange={(e) => handleCitInputChange('other_non_deductible', e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Loss Relief Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <TrendingDown className="h-4 w-4 mr-2 text-orange-600" />
              Loss Relief (NTA Provisions)
            </h3>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Nigerian Tax Law:</strong> Companies can carry forward tax losses indefinitely to offset future taxable profits. 
                Losses cannot be carried back to previous tax years.
              </AlertDescription>
            </Alert>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="carry_forward_losses">Carry Forward Losses from Previous Years (₦)</Label>
                <Input
                  id="carry_forward_losses"
                  type="number"
                  placeholder="₦5,000,000"
                  value={citInput.carry_forward_losses}
                  onChange={(e) => handleCitInputChange('carry_forward_losses', e.target.value)}
                />
                <p className="text-xs text-gray-600">Enter any accumulated losses from previous years that can be offset against current year profits</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Capital Allowances Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Settings className="h-4 w-4 mr-2 text-indigo-600" />
              Capital Allowances (2026 - Annual Allowances Only)
            </h3>
            <Alert className="bg-indigo-50 border-indigo-200">
              <AlertDescription className="text-indigo-800 text-sm">
                Initial allowances have been abolished. Enter cost of new assets and written down values of existing assets.
              </AlertDescription>
            </Alert>
            
            {/* New Assets */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-800">New Assets (Cost)</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="buildings_cost">Buildings (10% rate) (₦)</Label>
                  <Input
                    id="buildings_cost"
                    type="number"
                    placeholder="50,000,000"
                    value={citInput.buildings_cost}
                    onChange={(e) => handleCitInputChange('buildings_cost', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="furniture_fittings_cost">Furniture & Fittings (20% rate) (₦)</Label>
                  <Input
                    id="furniture_fittings_cost"
                    type="number"
                    placeholder="10,000,000"
                    value={citInput.furniture_fittings_cost}
                    onChange={(e) => handleCitInputChange('furniture_fittings_cost', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plant_machinery_cost">Plant & Machinery (20% rate) (₦)</Label>
                  <Input
                    id="plant_machinery_cost"
                    type="number"
                    placeholder="30,000,000"
                    value={citInput.plant_machinery_cost}
                    onChange={(e) => handleCitInputChange('plant_machinery_cost', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motor_vehicles_cost">Motor Vehicles (25% rate) (₦)</Label>
                  <Input
                    id="motor_vehicles_cost"
                    type="number"
                    placeholder="15,000,000"
                    value={citInput.motor_vehicles_cost}
                    onChange={(e) => handleCitInputChange('motor_vehicles_cost', e.target.value)}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="other_assets_cost">Other Assets (20% rate) (₦)</Label>
                  <Input
                    id="other_assets_cost"
                    type="number"
                    placeholder="₦5,000,000"
                    value={citInput.other_assets_cost}
                    onChange={(e) => handleCitInputChange('other_assets_cost', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Existing Assets WDV */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-800">Existing Assets (Written Down Value)</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="buildings_wdv">Buildings WDV (₦)</Label>
                  <Input
                    id="buildings_wdv"
                    type="number"
                    placeholder="100,000,000"
                    value={citInput.buildings_wdv}
                    onChange={(e) => handleCitInputChange('buildings_wdv', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="furniture_fittings_wdv">Furniture & Fittings WDV (₦)</Label>
                  <Input
                    id="furniture_fittings_wdv"
                    type="number"
                    placeholder="20,000,000"
                    value={citInput.furniture_fittings_wdv}
                    onChange={(e) => handleCitInputChange('furniture_fittings_wdv', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plant_machinery_wdv">Plant & Machinery WDV (₦)</Label>
                  <Input
                    id="plant_machinery_wdv"
                    type="number"
                    placeholder="80,000,000"
                    value={citInput.plant_machinery_wdv}
                    onChange={(e) => handleCitInputChange('plant_machinery_wdv', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motor_vehicles_wdv">Motor Vehicles WDV (₦)</Label>
                  <Input
                    id="motor_vehicles_wdv"
                    type="number"
                    placeholder="25,000,000"
                    value={citInput.motor_vehicles_wdv}
                    onChange={(e) => handleCitInputChange('motor_vehicles_wdv', e.target.value)}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="other_assets_wdv">Other Assets WDV (₦)</Label>
                  <Input
                    id="other_assets_wdv"
                    type="number"
                    placeholder="10,000,000"
                    value={citInput.other_assets_wdv}
                    onChange={(e) => handleCitInputChange('other_assets_wdv', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Withholding Tax Credits */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <CreditCard className="h-4 w-4 mr-2 text-green-600" />
              Withholding Tax Credits Available
            </h3>
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800 text-sm">
                Enter WHT deducted at source that can be credited against your CIT liability.
              </AlertDescription>
            </Alert>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wht_on_contracts">WHT on Contracts (₦)</Label>
                <Input
                  id="wht_on_contracts"
                  type="number"
                  placeholder="2,500,000"
                  value={citInput.wht_on_contracts}
                  onChange={(e) => handleCitInputChange('wht_on_contracts', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wht_on_dividends">WHT on Dividends (₦)</Label>
                <Input
                  id="wht_on_dividends"
                  type="number"
                  placeholder="1,000,000"
                  value={citInput.wht_on_dividends}
                  onChange={(e) => handleCitInputChange('wht_on_dividends', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wht_on_rent">WHT on Rent (₦)</Label>
                <Input
                  id="wht_on_rent"
                  type="number"
                  placeholder="800,000"
                  value={citInput.wht_on_rent}
                  onChange={(e) => handleCitInputChange('wht_on_rent', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wht_on_interest">WHT on Interest (₦)</Label>
                <Input
                  id="wht_on_interest"
                  type="number"
                  placeholder="500,000"
                  value={citInput.wht_on_interest}
                  onChange={(e) => handleCitInputChange('wht_on_interest', e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="other_wht_credits">Other WHT Credits (₦)</Label>
                <Input
                  id="other_wht_credits"
                  type="number"
                  placeholder="700,000"
                  value={citInput.other_wht_credits}
                  onChange={(e) => handleCitInputChange('other_wht_credits', e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Financial Ratios */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <TrendingDown className="h-4 w-4 mr-2 text-purple-600" />
              Financial Information (For Thin Cap Analysis)
            </h3>
            <Alert>
              <AlertDescription className="text-sm text-blue-800">
                Used for thin capitalization analysis. Leave EBITDA empty for auto-calculation.
              </AlertDescription>
            </Alert>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total_debt">Total Debt (₦)</Label>
                <Input
                  id="total_debt"
                  type="number"
                  placeholder="100,000,000"
                  value={citInput.total_debt}
                  onChange={(e) => handleCitInputChange('total_debt', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total_equity">Total Equity (₦)</Label>
                <Input
                  id="total_equity"
                  type="number"
                  placeholder="200,000,000"
                  value={citInput.total_equity}
                  onChange={(e) => handleCitInputChange('total_equity', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ebitda">EBITDA (₦)</Label>
                <Input
                  id="ebitda"
                  type="number"
                  placeholder="Auto-calculated"
                  value={citInput.ebitda}
                  onChange={(e) => handleCitInputChange('ebitda', e.target.value)}
                />
              </div>
            </div>
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
          
          {/* Ad-supported info text for free users */}
          {!citAdCalc.isPaidUser && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
              <p className="text-xs text-blue-700">
                <Info className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />
                {citAdCalc.isLoggedIn 
                  ? `This feature includes ${citAdCalc.dailyLimit} free calculations daily. You have ${citAdCalc.remainingFreeCalcs} remaining today.`
                  : 'Create a free account for 15 daily calculations. Guests get 5 free calculations per day.'
                }
              </p>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <Button 
              onClick={() => {
                citAdCalc.handleCalculateWithAd(calculateCitTax);
              }}
              disabled={citLoading || !citInput.company_name || !citInput.annual_turnover || !citInput.gross_income}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              data-testid="cit-calculate-btn"
            >
              {citLoading ? 'Calculating...' : 'Calculate CIT'}
            </Button>
            <Button 
              onClick={resetCitForm} 
              variant="outline"
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              Reset
            </Button>
          </div>
          </>
          ) : (
            /* Professional Mode Form */
            <>
              {/* Company Details Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Building2 className="h-4 w-4 mr-2 text-blue-600" />
                  Company Details
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="prof_company_name">Company Name *</Label>
                    <Input
                      id="prof_company_name"
                      type="text"
                      placeholder="ABC Nigeria Limited"
                      value={profInput.company_name}
                      onChange={(e) => handleProfInputChange('company_name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="prof_tin">Tax Identification Number (TIN)</Label>
                    <Input
                      id="prof_tin"
                      type="text"
                      placeholder="12345678901"
                      value={profInput.tin}
                      onChange={(e) => handleProfInputChange('tin', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prof_year_of_assessment">Year of Assessment</Label>
                    <select
                      id="prof_year_of_assessment"
                      className="w-full p-2 border rounded-md bg-white"
                      value={profInput.year_of_assessment}
                      onChange={(e) => handleProfInputChange('year_of_assessment', e.target.value)}
                    >
                      {Array.from({length: 28}, (_, i) => 2023 + i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prof_tax_year">Tax Year</Label>
                    <select
                      id="prof_tax_year"
                      className="w-full p-2 border rounded-md bg-white"
                      value={profInput.tax_year}
                      onChange={(e) => handleProfInputChange('tax_year', e.target.value)}
                    >
                      {Array.from({length: 28}, (_, i) => 2022 + i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prof_annual_turnover">Annual Turnover (₦) *</Label>
                    <Input
                      id="prof_annual_turnover"
                      type="number"
                      placeholder="500,000,000"
                      value={profInput.annual_turnover}
                      onChange={(e) => handleProfInputChange('annual_turnover', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prof_total_fixed_assets">Total Fixed Assets (₦)</Label>
                    <Input
                      id="prof_total_fixed_assets"
                      type="number"
                      placeholder="200,000,000"
                      value={profInput.total_fixed_assets}
                      onChange={(e) => handleProfInputChange('total_fixed_assets', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                      <div>
                        <Label htmlFor="prof_is_professional_service" className="cursor-pointer">Professional Service Firm?</Label>
                        <p className="text-xs text-gray-500">Law firms, accountants, consultants, etc.</p>
                      </div>
                      <input
                        id="prof_is_professional_service"
                        type="checkbox"
                        checked={profInput.is_professional_service}
                        onChange={(e) => handleProfInputChange('is_professional_service', e.target.checked)}
                        className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                      <div>
                        <Label htmlFor="prof_is_multinational" className="cursor-pointer">Multinational Enterprise?</Label>
                        <p className="text-xs text-gray-500">Part of group with €750M+ global revenue</p>
                      </div>
                      <input
                        id="prof_is_multinational"
                        type="checkbox"
                        checked={profInput.is_multinational}
                        onChange={(e) => handleProfInputChange('is_multinational', e.target.checked)}
                        className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Net Profit from Accounts */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                  Profit/(Loss) per Audited Accounts
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="net_profit_per_accounts">Net Profit/(Loss) for the Year (₦)</Label>
                  <Input
                    id="net_profit_per_accounts"
                    type="number"
                    placeholder="27,846,695"
                    value={profInput.net_profit_per_accounts}
                    onChange={(e) => handleProfInputChange('net_profit_per_accounts', e.target.value)}
                    className="text-lg font-medium"
                  />
                  <p className="text-xs text-gray-600">Enter profit or loss figure from the company's audited financial statements</p>
                </div>
              </div>

              <Separator />

              {/* Add-backs (Non-Allowable Expenses) */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-amber-600" />
                  Add: Non-Allowable Expenses
                </h3>
                <p className="text-xs text-gray-600">Enter expenses that were deducted in arriving at net profit but are not allowable for tax purposes</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prof_depreciation">Depreciation (₦)</Label>
                    <Input
                      id="prof_depreciation"
                      type="number"
                      placeholder="5,352,066"
                      value={profInput.depreciation}
                      onChange={(e) => handleProfInputChange('depreciation', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="provision_bad_debts">Provision for Bad Debts (₦)</Label>
                    <Input
                      id="provision_bad_debts"
                      type="number"
                      placeholder="0"
                      value={profInput.provision_bad_debts}
                      onChange={(e) => handleProfInputChange('provision_bad_debts', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="impairment_loss">Impairment Loss (₦)</Label>
                    <Input
                      id="impairment_loss"
                      type="number"
                      placeholder="0"
                      value={profInput.impairment_loss}
                      onChange={(e) => handleProfInputChange('impairment_loss', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accretion_interest">Accretion Interest (₦)</Label>
                    <Input
                      id="accretion_interest"
                      type="number"
                      placeholder="0"
                      value={profInput.accretion_interest}
                      onChange={(e) => handleProfInputChange('accretion_interest', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loss_on_asset_disposal">Loss on Asset Disposal (₦)</Label>
                    <Input
                      id="loss_on_asset_disposal"
                      type="number"
                      placeholder="0"
                      value={profInput.loss_on_asset_disposal}
                      onChange={(e) => handleProfInputChange('loss_on_asset_disposal', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exchange_loss">Exchange (Gains)/Loss (₦)</Label>
                    <Input
                      id="exchange_loss"
                      type="number"
                      placeholder="0"
                      value={profInput.exchange_loss}
                      onChange={(e) => handleProfInputChange('exchange_loss', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="other_addbacks">Other Non-Allowable Expenses (₦)</Label>
                    <Input
                      id="other_addbacks"
                      type="number"
                      placeholder="0"
                      value={profInput.other_addbacks}
                      onChange={(e) => handleProfInputChange('other_addbacks', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Loss Relief */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <TrendingDown className="h-4 w-4 mr-2 text-orange-600" />
                  Less: Unutilised Tax Losses
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="unutilised_tax_losses_bf">Unutilised Tax Losses b/f (₦)</Label>
                  <Input
                    id="unutilised_tax_losses_bf"
                    type="number"
                    placeholder="0"
                    value={profInput.unutilised_tax_losses_bf}
                    onChange={(e) => handleProfInputChange('unutilised_tax_losses_bf', e.target.value)}
                  />
                  <p className="text-xs text-gray-600">Tax losses brought forward from previous years</p>
                </div>
              </div>

              <Separator />

              {/* Capital Allowances Section - Same as Standard Mode */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Settings className="h-4 w-4 mr-2 text-indigo-600" />
                  Less: Capital Allowances (2026 - Annual Allowances Only)
                </h3>
                <Alert className="bg-indigo-50 border-indigo-200">
                  <AlertDescription className="text-indigo-800 text-sm">
                    Initial allowances have been abolished. Enter cost of new assets and written down values of existing assets.
                  </AlertDescription>
                </Alert>
                
                {/* New Assets */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-800">New Assets (Cost)</h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prof_buildings_cost">Buildings (10% rate) (₦)</Label>
                      <Input
                        id="prof_buildings_cost"
                        type="number"
                        placeholder="50,000,000"
                        value={profInput.buildings_cost}
                        onChange={(e) => handleProfInputChange('buildings_cost', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prof_furniture_fittings_cost">Furniture & Fittings (20% rate) (₦)</Label>
                      <Input
                        id="prof_furniture_fittings_cost"
                        type="number"
                        placeholder="10,000,000"
                        value={profInput.furniture_fittings_cost}
                        onChange={(e) => handleProfInputChange('furniture_fittings_cost', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prof_plant_machinery_cost">Plant & Machinery (20% rate) (₦)</Label>
                      <Input
                        id="prof_plant_machinery_cost"
                        type="number"
                        placeholder="30,000,000"
                        value={profInput.plant_machinery_cost}
                        onChange={(e) => handleProfInputChange('plant_machinery_cost', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prof_motor_vehicles_cost">Motor Vehicles (25% rate) (₦)</Label>
                      <Input
                        id="prof_motor_vehicles_cost"
                        type="number"
                        placeholder="15,000,000"
                        value={profInput.motor_vehicles_cost}
                        onChange={(e) => handleProfInputChange('motor_vehicles_cost', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="prof_other_assets_cost">Other Assets (20% rate) (₦)</Label>
                      <Input
                        id="prof_other_assets_cost"
                        type="number"
                        placeholder="5,000,000"
                        value={profInput.other_assets_cost}
                        onChange={(e) => handleProfInputChange('other_assets_cost', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Existing Assets WDV */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-800">Existing Assets (Written Down Value)</h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prof_buildings_wdv">Buildings WDV (₦)</Label>
                      <Input
                        id="prof_buildings_wdv"
                        type="number"
                        placeholder="100,000,000"
                        value={profInput.buildings_wdv}
                        onChange={(e) => handleProfInputChange('buildings_wdv', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prof_furniture_fittings_wdv">Furniture & Fittings WDV (₦)</Label>
                      <Input
                        id="prof_furniture_fittings_wdv"
                        type="number"
                        placeholder="20,000,000"
                        value={profInput.furniture_fittings_wdv}
                        onChange={(e) => handleProfInputChange('furniture_fittings_wdv', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prof_plant_machinery_wdv">Plant & Machinery WDV (₦)</Label>
                      <Input
                        id="prof_plant_machinery_wdv"
                        type="number"
                        placeholder="80,000,000"
                        value={profInput.plant_machinery_wdv}
                        onChange={(e) => handleProfInputChange('plant_machinery_wdv', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prof_motor_vehicles_wdv">Motor Vehicles WDV (₦)</Label>
                      <Input
                        id="prof_motor_vehicles_wdv"
                        type="number"
                        placeholder="25,000,000"
                        value={profInput.motor_vehicles_wdv}
                        onChange={(e) => handleProfInputChange('motor_vehicles_wdv', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="prof_other_assets_wdv">Other Assets WDV (₦)</Label>
                      <Input
                        id="prof_other_assets_wdv"
                        type="number"
                        placeholder="10,000,000"
                        value={profInput.other_assets_wdv}
                        onChange={(e) => handleProfInputChange('other_assets_wdv', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* WHT Credits */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <CreditCard className="h-4 w-4 mr-2 text-purple-600" />
                  Withholding Tax Credits
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="wht_on_contracts">WHT on Contracts (₦)</Label>
                    <Input
                      id="wht_on_contracts"
                      type="number"
                      placeholder="0"
                      value={profInput.wht_on_contracts}
                      onChange={(e) => handleProfInputChange('wht_on_contracts', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wht_on_dividends">WHT on Dividends (₦)</Label>
                    <Input
                      id="wht_on_dividends"
                      type="number"
                      placeholder="0"
                      value={profInput.wht_on_dividends}
                      onChange={(e) => handleProfInputChange('wht_on_dividends', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wht_on_rent">WHT on Rent (₦)</Label>
                    <Input
                      id="wht_on_rent"
                      type="number"
                      placeholder="0"
                      value={profInput.wht_on_rent}
                      onChange={(e) => handleProfInputChange('wht_on_rent', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wht_on_interest">WHT on Interest (₦)</Label>
                    <Input
                      id="wht_on_interest"
                      type="number"
                      placeholder="0"
                      value={profInput.wht_on_interest}
                      onChange={(e) => handleProfInputChange('wht_on_interest', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="other_wht_credits">Other WHT Credits (₦)</Label>
                    <Input
                      id="other_wht_credits"
                      type="number"
                      placeholder="0"
                      value={profInput.other_wht_credits}
                      onChange={(e) => handleProfInputChange('other_wht_credits', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Financial Information (Thin Cap Analysis) */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <TrendingDown className="h-4 w-4 mr-2 text-purple-600" />
                  Financial Information (For Thin Cap Analysis)
                </h3>
                <Alert>
                  <AlertDescription className="text-sm text-blue-800">
                    Used for thin capitalization analysis. EBITDA is auto-calculated from Net Profit + Depreciation + Interest.
                  </AlertDescription>
                </Alert>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prof_total_debt">Total Debt (₦)</Label>
                    <Input
                      id="prof_total_debt"
                      type="number"
                      placeholder="100,000,000"
                      value={profInput.total_debt}
                      onChange={(e) => handleProfInputChange('total_debt', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prof_total_equity">Total Equity (₦)</Label>
                    <Input
                      id="prof_total_equity"
                      type="number"
                      placeholder="250,000,000"
                      value={profInput.total_equity}
                      onChange={(e) => handleProfInputChange('total_equity', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prof_ebitda">EBITDA (₦)</Label>
                    <Input
                      id="prof_ebitda"
                      type="text"
                      placeholder="Auto-calculated"
                      value={profInput.net_profit_per_accounts && profInput.depreciation 
                        ? `₦${((parseFloat(profInput.net_profit_per_accounts) || 0) + (parseFloat(profInput.depreciation) || 0) + (parseFloat(profInput.accretion_interest) || 0)).toLocaleString()}`
                        : ''}
                      disabled
                      className="bg-gray-100"
                    />
                    <p className="text-xs text-gray-500">Net Profit + Depreciation + Interest</p>
                  </div>
                </div>
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
              
              {/* Ad-supported info text for free users */}
              {!citAdCalc.isPaidUser && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                  <p className="text-xs text-blue-700">
                    <Info className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />
                    {citAdCalc.isLoggedIn 
                      ? `This feature includes ${citAdCalc.dailyLimit} free calculations daily. You have ${citAdCalc.remainingFreeCalcs} remaining today.`
                      : 'Create a free account for 15 daily calculations. Guests get 5 free calculations per day.'
                    }
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button 
                  disabled={!profInput.net_profit_per_accounts}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  data-testid="prof-cit-calculate-btn"
                >
                  Calculate CIT
                </Button>
                <Button 
                  onClick={() => setProfInput({
                    company_name: '',
                    tin: '',
                    year_of_assessment: '2026',
                    tax_year: '2025',
                    annual_turnover: '',
                    total_fixed_assets: '',
                    is_professional_service: false,
                    is_multinational: false,
                    total_debt: '',
                    total_equity: '',
                    net_profit_per_accounts: '',
                    depreciation: '',
                    provision_bad_debts: '',
                    impairment_loss: '',
                    accretion_interest: '',
                    loss_on_asset_disposal: '',
                    exchange_loss: '',
                    other_addbacks: '',
                    unutilised_tax_losses_bf: '',
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
                    wht_on_contracts: '',
                    wht_on_dividends: '',
                    wht_on_rent: '',
                    wht_on_interest: '',
                    other_wht_credits: ''
                  })} 
                  variant="outline"
                  className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                >
                  Reset
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Video Ad Modal for CIT (guests only) */}
      <VideoAdModal
        isOpen={citAdCalc.showAdModal}
        onClose={citAdCalc.closeAdModal}
        onAdComplete={citAdCalc.onAdComplete}
        calculatorType="CIT"
        onStartTrial={onShowTrialModal}
        onSubscribe={onShowUpgradeModal}
      />

      {/* Upgrade Limit Modal for CIT (logged-in free users) */}
      <UpgradeLimitModal
        isOpen={citAdCalc.showUpgradePrompt}
        onClose={citAdCalc.closeUpgradePrompt}
        onStartTrial={onShowTrialModal}
        onViewPlans={onShowUpgradeModal}
        calculatorType="CIT"
        dailyLimit={citAdCalc.dailyLimit}
      />

      {/* Results */}
      {citMode === 'standard' && citResult && (
        <Card className="bg-white border-slate-200 shadow-lg">
          <CardHeader className="rounded-t-lg" style={{ background: 'linear-gradient(to right, #0F2D4A, #1A3A5C)', color: '#D4AF37' }}>
            <CardTitle className="flex items-center gap-2" style={{ color: '#D4AF37' }}>
              <Building2 className="h-5 w-5" />
              CIT Calculation Results
            </CardTitle>
            <CardDescription style={{ color: '#9CA3AF' }}>
              {citResult.company_name} - {citResult.company_size} Company
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Summary Cards - Professional Dark Style */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-900 text-white rounded-lg">
                <p className="text-sm text-gray-300 mb-1">Total Tax Due</p>
                <p className="text-2xl font-bold">{formatCurrency(citResult.total_tax_due)}</p>
              </div>
              <div className="p-4 bg-emerald-600 text-white rounded-lg">
                <p className="text-sm text-emerald-100 mb-1">Net Tax Payable</p>
                <p className="text-2xl font-bold">{formatCurrency(citResult.net_tax_payable || citResult.total_tax_due)}</p>
              </div>
            </div>

            {/* Company Classification & Key Metrics */}
            <div className="border-l-4 border-l-slate-800 bg-slate-50 rounded-r-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="font-medium text-slate-900">Company Classification</p>
                  <p className="text-sm text-slate-600">{citResult.company_size} Company</p>
                </div>
                <Badge variant={citResult.qualifies_small_exemption ? "secondary" : "outline"} className="text-xs">
                  {citResult.qualifies_small_exemption ? "Tax Exempt" : `CIT Rate: ${(citResult.cit_rate * 100).toFixed(0)}%`}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Taxable Profit</p>
                  <p className="font-medium">{formatCurrency(citResult.taxable_profit)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Capital Allowances</p>
                  <p className="font-medium text-blue-600">{formatCurrency(citResult.total_capital_allowances || 0)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Effective Tax Rate</p>
                  <p className="font-medium">{(citResult.effective_tax_rate * 100).toFixed(2)}%</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Financial Summary */}
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900">Financial Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Gross Income:</span>
                  <span className="font-medium">{formatCurrency(citResult.gross_income)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Deductible Expenses:</span>
                  <span className="font-medium text-green-600">-{formatCurrency(citResult.total_deductible_expenses)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Non-deductible Expenses:</span>
                  <span className="font-medium text-red-600">{formatCurrency(citResult.total_non_deductible_expenses)}</span>
                </div>
                {citResult.carry_forward_losses_applied > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Loss Relief Applied:</span>
                    <span className="font-medium text-purple-600">-{formatCurrency(citResult.carry_forward_losses_applied)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2">
                  <span className="text-slate-700 font-medium">Taxable Profit:</span>
                  <span className="font-semibold">{formatCurrency(citResult.taxable_profit)}</span>
                </div>
              </div>
            </div>

            {/* Capital Allowances Breakdown */}
            {citResult.total_capital_allowances > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900">Capital Allowances Breakdown</h4>
                <div className="space-y-2 text-sm bg-blue-50 p-3 rounded-lg border border-blue-200">
                  {Object.entries(citResult.capital_allowance_breakdown || {}).map(([asset, details]) => {
                    if (details.allowance > 0) {
                      return (
                        <div key={asset} className="flex justify-between">
                          <span className="text-slate-600 capitalize">
                            {asset.replace('_', ' & ')} ({details.rate}):
                          </span>
                          <span className="font-medium text-blue-700">{formatCurrency(details.allowance)}</span>
                        </div>
                      );
                    }
                    return null;
                  })}
                  <div className="flex justify-between font-semibold border-t border-blue-300 pt-2">
                    <span className="text-blue-800">Total Capital Allowances:</span>
                    <span className="text-blue-800">{formatCurrency(citResult.total_capital_allowances)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tax Summary Cards - PAYE Style */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900 text-white p-6 rounded-lg">
                <p className="text-gray-400 text-sm mb-1">Total Tax Due</p>
                <p className="text-2xl font-bold">{formatCurrency(citResult.total_tax_due)}</p>
              </div>
              <div className="bg-emerald-600 text-white p-6 rounded-lg">
                <p className="text-emerald-100 text-sm mb-1">Net Tax Payable</p>
                <p className="text-2xl font-bold">{formatCurrency(citResult.net_tax_payable || citResult.total_tax_due)}</p>
              </div>
            </div>

            {/* WHT Credits Section - Light green with accent line */}
            {citResult.total_wht_credits > 0 && (
              <div className="bg-emerald-50/60 rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b-2 border-emerald-500">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800">WHT Credits Applied</span>
                    <span className="text-gray-600 text-sm">Amount</span>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  {citResult.wht_credits_breakdown && Object.entries(citResult.wht_credits_breakdown).map(([source, amount]) => {
                    if (amount > 0) {
                      return (
                        <div key={source} className="flex justify-between py-1">
                          <span className="text-gray-600 capitalize">WHT On {source.charAt(0).toUpperCase() + source.slice(1)}</span>
                          <span className="font-medium text-gray-900">{formatCurrency(amount)}</span>
                        </div>
                      );
                    }
                    return null;
                  })}
                  <div className="flex justify-between py-2 mt-2 bg-emerald-100/80 -mx-4 px-4 rounded">
                    <span className="font-semibold text-gray-800">Total WHT Credits</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(citResult.total_wht_credits)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Annual Summary with Left Border Accent */}
            <div className="border-l-4 border-gray-300 pl-4">
              <h4 className="font-semibold text-gray-900 mb-3">Tax Summary</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Taxable Profit</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(citResult.taxable_profit)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">CIT Rate</p>
                  <p className="font-semibold text-gray-900">{(citResult.cit_rate * 100).toFixed(0)}%</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Dev. Levy</p>
                  <p className="font-semibold text-emerald-600">{formatCurrency(citResult.development_levy)}</p>
                </div>
              </div>
            </div>

            {/* Compliance Deadlines - Matching style */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-amber-50/70 p-4 rounded-lg border border-amber-100">
                <p className="text-sm text-amber-700 font-medium mb-1">Filing Deadline</p>
                <p className="font-semibold text-gray-900">{citResult.filing_deadline}</p>
              </div>
              <div className="bg-rose-50/70 p-4 rounded-lg border border-rose-100">
                <p className="text-sm text-rose-700 font-medium mb-1">Payment Deadline</p>
                <p className="font-semibold text-gray-900">{citResult.payment_deadline}</p>
              </div>
            </div>
            
            {/* Print Report Button */}
            <div className="pt-4 border-t space-y-2">
              {/* Save Calculation Button */}
              <Button
                onClick={() => onSaveCalculation && onSaveCalculation('cit', citInput, citResult)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center space-x-2"
                data-testid="cit-save-btn"
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
                onClick={() => onSaveTemplate && onSaveTemplate()}
                variant="outline"
                className="w-full border-amber-500 text-amber-600 hover:bg-amber-50 flex items-center justify-center space-x-2"
                data-testid="cit-template-btn"
              >
                <Repeat className="h-4 w-4 mr-2" />
                <span>Set up as recurrent calculation template</span>
                {!hasTemplateAccess && <Lock className="h-3.5 w-3.5 ml-2 text-amber-400" />}
              </Button>
              
              <Button
                onClick={() => generateCitReport(citInput, citResult)}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white flex items-center justify-center space-x-2"
              >
                <Printer className="h-4 w-4" />
                <span>Print CIT Report (PDF)</span>
              </Button>
              
              {/* Email Report Button */}
              <Button
                onClick={() => {
                  if (!hasFeature('pdf_export')) {
                    setShowUpgradePrompt(true);
                    return;
                  }
                  setEmailRecipient(user?.email || '');
                  setShowEmailModal(true);
                }}
                variant="outline"
                className="w-full border-teal-600 text-teal-600 hover:bg-teal-50 flex items-center justify-center space-x-2"
              >
                <Mail className="h-4 w-4" />
                <span>Email Report</span>
                {!hasFeature('pdf_export') && (
                  <Badge variant="outline" className="ml-2 text-xs bg-blue-50 text-blue-600 border-blue-200">
                    PRO+
                  </Badge>
                )}
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

      {/* Professional Mode Results - Live Calculation */}
      {citMode === 'professional' && profResult && (parseFloat(profInput.net_profit_per_accounts) || 0) !== 0 && (
        <Card className="bg-white border-indigo-200 shadow-lg">
          <CardHeader className="text-white" style={{ background: 'linear-gradient(to right, #402852, #4a2e5e)' }}>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Income Tax Computation
            </CardTitle>
            <CardDescription className="text-indigo-200">
              {profResult.companyName || 'Company'} - {profResult.companySize.charAt(0).toUpperCase() + profResult.companySize.slice(1)} Company
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {/* Company Info Summary */}
            {profResult.companyName && (
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Company:</span>
                    <span className="ml-2 font-medium text-slate-800">{profResult.companyName}</span>
                  </div>
                  {profResult.tin && (
                    <div>
                      <span className="text-slate-500">TIN:</span>
                      <span className="ml-2 font-medium text-slate-800">{profResult.tin}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-500">Year of Assessment:</span>
                    <span className="ml-2 font-medium text-slate-800">{profResult.yearOfAssessment}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Tax Year:</span>
                    <span className="ml-2 font-medium text-slate-800">{profResult.taxYear}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Annual Turnover:</span>
                    <span className="ml-2 font-medium text-slate-800">{formatCurrency(profResult.annualTurnover)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Company Size:</span>
                    <span className={`ml-2 font-medium ${
                      profResult.companySize === 'small' ? 'text-green-600' : 
                      profResult.companySize === 'medium' ? 'text-blue-600' : 'text-purple-600'
                    }`}>
                      {profResult.companySize.charAt(0).toUpperCase() + profResult.companySize.slice(1)} ({Math.round(profResult.citRate * 100)}% CIT)
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Tax Computation Table */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-3 font-semibold">Description</th>
                    <th className="text-right p-3 font-semibold w-32">₦</th>
                    <th className="text-right p-3 font-semibold w-32">₦</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr className="bg-green-50">
                    <td className="p-3 font-medium">Profit/(Loss) as per Accounts for the year</td>
                    <td className="p-3 text-right"></td>
                    <td className="p-3 text-right font-semibold">{formatCurrency(profResult.netProfit)}</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-amber-700">Add: Non-Allowable Expenses</td>
                    <td className="p-3 text-right"></td>
                    <td className="p-3 text-right"></td>
                  </tr>
                  {parseFloat(profInput.depreciation) > 0 && (
                    <tr className="text-gray-600">
                      <td className="p-3 pl-6">Depreciation</td>
                      <td className="p-3 text-right">{formatCurrency(parseFloat(profInput.depreciation))}</td>
                      <td className="p-3 text-right"></td>
                    </tr>
                  )}
                  {parseFloat(profInput.provision_bad_debts) > 0 && (
                    <tr className="text-gray-600">
                      <td className="p-3 pl-6">Provision for Bad Debts</td>
                      <td className="p-3 text-right">{formatCurrency(parseFloat(profInput.provision_bad_debts))}</td>
                      <td className="p-3 text-right"></td>
                    </tr>
                  )}
                  {parseFloat(profInput.impairment_loss) > 0 && (
                    <tr className="text-gray-600">
                      <td className="p-3 pl-6">Impairment Loss</td>
                      <td className="p-3 text-right">{formatCurrency(parseFloat(profInput.impairment_loss))}</td>
                      <td className="p-3 text-right"></td>
                    </tr>
                  )}
                  {parseFloat(profInput.accretion_interest) > 0 && (
                    <tr className="text-gray-600">
                      <td className="p-3 pl-6">Accretion Interest</td>
                      <td className="p-3 text-right">{formatCurrency(parseFloat(profInput.accretion_interest))}</td>
                      <td className="p-3 text-right"></td>
                    </tr>
                  )}
                  {parseFloat(profInput.loss_on_asset_disposal) > 0 && (
                    <tr className="text-gray-600">
                      <td className="p-3 pl-6">Loss on Asset Disposal</td>
                      <td className="p-3 text-right">{formatCurrency(parseFloat(profInput.loss_on_asset_disposal))}</td>
                      <td className="p-3 text-right"></td>
                    </tr>
                  )}
                  {parseFloat(profInput.exchange_loss) > 0 && (
                    <tr className="text-gray-600">
                      <td className="p-3 pl-6">Exchange (Gains)/Loss</td>
                      <td className="p-3 text-right">{formatCurrency(parseFloat(profInput.exchange_loss))}</td>
                      <td className="p-3 text-right"></td>
                    </tr>
                  )}
                  {parseFloat(profInput.other_addbacks) > 0 && (
                    <tr className="text-gray-600">
                      <td className="p-3 pl-6">Other Non-Allowable</td>
                      <td className="p-3 text-right">{formatCurrency(parseFloat(profInput.other_addbacks))}</td>
                      <td className="p-3 text-right"></td>
                    </tr>
                  )}
                  <tr className="bg-amber-50 border-t-2">
                    <td className="p-3 font-medium">Total Add-backs</td>
                    <td className="p-3 text-right"></td>
                    <td className="p-3 text-right font-semibold text-amber-700">{formatCurrency(profResult.totalAddbacks)}</td>
                  </tr>
                  <tr className="bg-blue-50 border-t-2">
                    <td className="p-3 font-semibold">Adjusted Profit/(Loss)</td>
                    <td className="p-3 text-right"></td>
                    <td className="p-3 text-right font-bold text-blue-700">{formatCurrency(profResult.adjustedProfit)}</td>
                  </tr>
                  
                  {/* Loss Relief Section */}
                  {(parseFloat(profInput.unutilised_tax_losses_bf) > 0 || profResult.lossesApplied > 0) && (
                    <>
                      <tr>
                        <td className="p-3 font-medium text-orange-700">Less: Unutilised Tax Losses</td>
                        <td className="p-3 text-right"></td>
                        <td className="p-3 text-right"></td>
                      </tr>
                      <tr className="text-gray-600">
                        <td className="p-3 pl-6">Unutilised tax losses b/f</td>
                        <td className="p-3 text-right">{formatCurrency(parseFloat(profInput.unutilised_tax_losses_bf) || 0)}</td>
                        <td className="p-3 text-right"></td>
                      </tr>
                      <tr className="text-gray-600">
                        <td className="p-3 pl-6">Tax Losses relieved during the year</td>
                        <td className="p-3 text-right">({formatCurrency(profResult.lossesApplied)})</td>
                        <td className="p-3 text-right text-orange-600">-{formatCurrency(profResult.lossesApplied)}</td>
                      </tr>
                      <tr className="text-gray-600">
                        <td className="p-3 pl-6">Unutilised tax losses c/f</td>
                        <td className="p-3 text-right">{formatCurrency(profResult.unutilisedLossesCarriedForward)}</td>
                        <td className="p-3 text-right"></td>
                      </tr>
                    </>
                  )}
                  
                  <tr className="bg-gray-50 border-t-2">
                    <td className="p-3 font-medium">Profit After Loss Relief</td>
                    <td className="p-3 text-right"></td>
                    <td className="p-3 text-right font-semibold">{formatCurrency(profResult.profitAfterLossRelief)}</td>
                  </tr>
                  
                  {/* Capital Allowances */}
                  <tr>
                    <td className="p-3 font-medium text-indigo-700">Less: Capital Allowances</td>
                    <td className="p-3 text-right"></td>
                    <td className="p-3 text-right"></td>
                  </tr>
                  {profResult.capitalAllowancesBreakdown.buildings.allowance > 0 && (
                    <tr className="text-gray-600">
                      <td className="p-3 pl-6">Buildings (10%)</td>
                      <td className="p-3 text-right">{formatCurrency(profResult.capitalAllowancesBreakdown.buildings.allowance)}</td>
                      <td className="p-3 text-right"></td>
                    </tr>
                  )}
                  {profResult.capitalAllowancesBreakdown.furniture.allowance > 0 && (
                    <tr className="text-gray-600">
                      <td className="p-3 pl-6">Furniture & Fittings (20%)</td>
                      <td className="p-3 text-right">{formatCurrency(profResult.capitalAllowancesBreakdown.furniture.allowance)}</td>
                      <td className="p-3 text-right"></td>
                    </tr>
                  )}
                  {profResult.capitalAllowancesBreakdown.plant.allowance > 0 && (
                    <tr className="text-gray-600">
                      <td className="p-3 pl-6">Plant & Machinery (20%)</td>
                      <td className="p-3 text-right">{formatCurrency(profResult.capitalAllowancesBreakdown.plant.allowance)}</td>
                      <td className="p-3 text-right"></td>
                    </tr>
                  )}
                  {profResult.capitalAllowancesBreakdown.motor.allowance > 0 && (
                    <tr className="text-gray-600">
                      <td className="p-3 pl-6">Motor Vehicles (25%)</td>
                      <td className="p-3 text-right">{formatCurrency(profResult.capitalAllowancesBreakdown.motor.allowance)}</td>
                      <td className="p-3 text-right"></td>
                    </tr>
                  )}
                  {profResult.capitalAllowancesBreakdown.other.allowance > 0 && (
                    <tr className="text-gray-600">
                      <td className="p-3 pl-6">Other Assets (20%)</td>
                      <td className="p-3 text-right">{formatCurrency(profResult.capitalAllowancesBreakdown.other.allowance)}</td>
                      <td className="p-3 text-right"></td>
                    </tr>
                  )}
                  <tr className="bg-indigo-50">
                    <td className="p-3 font-medium text-indigo-800">Total Capital Allowances</td>
                    <td className="p-3 text-right"></td>
                    <td className="p-3 text-right font-semibold text-indigo-600">-{formatCurrency(profResult.totalCapitalAllowances)}</td>
                  </tr>
                  
                  <tr className="bg-emerald-50 border-t-2 border-b-2">
                    <td className="p-3 font-bold text-emerald-800">Taxable Profit</td>
                    <td className="p-3 text-right"></td>
                    <td className="p-3 text-right font-bold text-emerald-700 text-lg">{formatCurrency(profResult.taxableProfit)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Tax Calculation */}
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-gray-900 text-white rounded-lg">
                <p className="text-gray-400 text-sm mb-1">CIT @ {Math.round(profResult.citRate * 100)}%</p>
                <p className="text-2xl font-bold">{formatCurrency(profResult.citDue)}</p>
              </div>
              <div className="p-4 bg-emerald-600 text-white rounded-lg">
                <p className="text-emerald-100 text-sm mb-1">Development Levy @ 4%</p>
                <p className="text-2xl font-bold">{formatCurrency(profResult.developmentLevy)}</p>
              </div>
            </div>

            {/* WHT Credits & Final Tax */}
            {profResult.totalWhtCredits > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-purple-800 mb-2">WHT Credits Applied</h4>
                <div className="space-y-1 text-sm">
                  {profResult.whtBreakdown.whtContracts > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">WHT on Contracts</span>
                      <span className="font-medium">{formatCurrency(profResult.whtBreakdown.whtContracts)}</span>
                    </div>
                  )}
                  {profResult.whtBreakdown.whtDividends > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">WHT on Dividends</span>
                      <span className="font-medium">{formatCurrency(profResult.whtBreakdown.whtDividends)}</span>
                    </div>
                  )}
                  {profResult.whtBreakdown.whtRent > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">WHT on Rent</span>
                      <span className="font-medium">{formatCurrency(profResult.whtBreakdown.whtRent)}</span>
                    </div>
                  )}
                  {profResult.whtBreakdown.whtInterest > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">WHT on Interest</span>
                      <span className="font-medium">{formatCurrency(profResult.whtBreakdown.whtInterest)}</span>
                    </div>
                  )}
                  {profResult.whtBreakdown.otherWht > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Other WHT</span>
                      <span className="font-medium">{formatCurrency(profResult.whtBreakdown.otherWht)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold pt-2 border-t border-purple-300">
                    <span className="text-purple-800">Total WHT Credits</span>
                    <span className="text-purple-800">{formatCurrency(profResult.totalWhtCredits)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Final Summary */}
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-slate-800 text-white rounded-lg">
                <p className="text-slate-400 text-sm mb-1">Total Tax Due</p>
                <p className="text-2xl font-bold">{formatCurrency(profResult.totalTaxDue)}</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg">
                <p className="text-green-100 text-sm mb-1">Net Tax Payable</p>
                <p className="text-2xl font-bold">{formatCurrency(profResult.netTaxPayable)}</p>
              </div>
            </div>

            {/* Effective Tax Rate */}
            <div className="text-center text-sm text-gray-600 mt-4">
              Effective Tax Rate: <span className="font-semibold text-gray-900">{(profResult.effectiveTaxRate * 100).toFixed(2)}%</span>
            </div>

            {/* Disclaimer */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-4">
              <p className="text-xs text-gray-600 text-center">
                * Users are solely responsible for the validity, accuracy and completeness of the financial information they supply.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upgrade Prompt */}
      {showUpgradePrompt && (
        <UpgradePrompt
          type="feature"
          feature="cit_calc"
          onUpgrade={handleUpgrade}
          onTrial={handleTrial}
          onClose={() => setShowUpgradePrompt(false)}
        />
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Email CIT Report</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email_recipient">Email Address</Label>
                <Input
                  id="email_recipient"
                  type="email"
                  placeholder="Enter email address"
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowEmailModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEmailReport}
                  disabled={emailSending}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                >
                  {emailSending ? 'Sending...' : 'Send Report'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CITCalculator;