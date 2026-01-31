import React, { useState } from 'react';
import { Building2, TrendingDown, TrendingUp, AlertTriangle, CheckCircle, Settings, CreditCard, Printer, Mail, Info } from 'lucide-react';
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
  onShowUpgradeModal
}) => {
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const { startTrial, requestUpgrade, isLoading } = useUpgrade();
  
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
      <Card className="bg-white border-emerald-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Company Information</span>
          </CardTitle>
          <CardDescription className="text-blue-100">
            Enter your company's financial details for CIT calculation
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
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
            <div className="grid sm:grid-cols-2 gap-4">
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
                  : 'Create a free account for 15 daily calculations. Guests get 1 free calculation per day.'
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
      {citResult && (
        <Card className="bg-white border-blue-100 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle>CIT Calculation Results</CardTitle>
            <CardDescription className="text-indigo-100">
              {citResult.company_name} - {citResult.company_size} Company
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Company Classification */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-blue-800">Company Classification</p>
                  <p className="text-sm text-blue-600">{citResult.company_size} Company</p>
                </div>
                <Badge variant={citResult.qualifies_small_exemption ? "secondary" : "outline"}>
                  {citResult.qualifies_small_exemption ? "Tax Exempt" : "Taxable"}
                </Badge>
              </div>
            </div>

            {/* Tax Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-600 font-medium">Taxable Profit</p>
                <p className="text-xl font-bold text-green-800">
                  {formatCurrency(citResult.taxable_profit)}
                </p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <p className="text-sm text-indigo-600 font-medium">Capital Allowances</p>
                <p className="text-xl font-bold text-indigo-800">
                  {formatCurrency(citResult.total_capital_allowances || 0)}
                </p>
              </div>
              {citResult.carry_forward_losses_applied > 0 && (
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-600 font-medium">Loss Relief Applied</p>
                  <p className="text-xl font-bold text-orange-800">
                    {formatCurrency(citResult.carry_forward_losses_applied)}
                  </p>
                  <p className="text-xs text-orange-600 mt-1">Losses carried forward from previous years</p>
                </div>
              )}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-600 font-medium">Total Tax Due</p>
                <p className="text-xl font-bold text-blue-800">
                  {formatCurrency(citResult.total_tax_due)}
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-600 font-medium">WHT Credits</p>
                <p className="text-xl font-bold text-orange-800">
                  {formatCurrency(citResult.total_wht_credits || 0)}
                </p>
              </div>
            </div>

            {/* Net Tax Payable - Prominent Display */}
            <div className="bg-gradient-to-r from-red-100 to-pink-100 p-6 rounded-lg border-2 border-red-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg text-red-700 font-semibold">Net Tax Payable</p>
                  <p className="text-sm text-red-600">Total Tax Due - WHT Credits</p>
                </div>
                <p className="text-3xl font-bold text-red-800">
                  {formatCurrency(citResult.net_tax_payable || 0)}
                </p>
              </div>
              {citResult.total_wht_credits > citResult.total_tax_due && (
                <div className="mt-2 p-2 bg-green-100 rounded border border-green-300">
                  <p className="text-sm text-green-700 font-medium">
                    ✅ Excess WHT Credits: {formatCurrency(citResult.total_wht_credits - citResult.total_tax_due)} (Refundable)
                  </p>
                </div>
              )}
            </div>

            {/* Effective Tax Rate */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Effective Tax Rate</span>
                <span className="text-lg font-bold text-gray-900">
                  {(citResult.effective_tax_rate * 100).toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Thin Capitalization */}
            {citResult.thin_cap_applied && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <strong>Thin Capitalization Applied:</strong> Interest deduction limited to {formatCurrency(citResult.allowed_interest_deduction)}. 
                  Disallowed: {formatCurrency(citResult.disallowed_interest)}
                </AlertDescription>
              </Alert>
            )}

            {/* Financial Summary */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Financial Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Gross Income:</span>
                  <span className="font-medium">{formatCurrency(citResult.gross_income)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Deductible Expenses:</span>
                  <span className="font-medium text-green-600">-{formatCurrency(citResult.total_deductible_expenses)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Non-deductible Expenses:</span>
                  <span className="font-medium text-red-600">{formatCurrency(citResult.total_non_deductible_expenses)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">Taxable Profit:</span>
                  <span className="font-medium">{formatCurrency(citResult.taxable_profit)}</span>
                </div>
              </div>
            </div>

            {/* Capital Allowances Breakdown */}
            {citResult.total_capital_allowances > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Capital Allowances Breakdown</h4>
                <div className="space-y-2 text-sm">
                  {Object.entries(citResult.capital_allowance_breakdown || {}).map(([asset, details]) => {
                    if (details.allowance > 0) {
                      return (
                        <div key={asset} className="flex justify-between">
                          <span className="text-gray-600 capitalize">
                            {asset.replace('_', ' & ')} ({details.rate}):
                          </span>
                          <span className="font-medium">{formatCurrency(details.allowance)}</span>
                        </div>
                      );
                    }
                    return null;
                  })}
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Total Capital Allowances:</span>
                    <span className="text-indigo-600">{formatCurrency(citResult.total_capital_allowances)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tax Breakdown */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Tax Computation</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">CIT ({(citResult.cit_rate * 100).toFixed(0)}%):</span>
                  <span className="font-medium">{formatCurrency(citResult.cit_due)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Development Levy ({(citResult.development_levy_rate * 100).toFixed(0)}%):</span>
                  <span className="font-medium">{formatCurrency(citResult.development_levy)}</span>
                </div>
                {citResult.minimum_etr_tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Minimum ETR Top-up:</span>
                    <span className="font-medium">{formatCurrency(citResult.minimum_etr_tax)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Total Tax Due:</span>
                  <span className="text-red-600">{formatCurrency(citResult.total_tax_due)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Less: WHT Credits:</span>
                  <span className="font-medium text-green-600">-{formatCurrency(citResult.total_wht_credits || 0)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2 bg-red-50 px-2 py-1 rounded">
                  <span>Net Tax Payable:</span>
                  <span className="text-red-700">{formatCurrency(citResult.net_tax_payable || 0)}</span>
                </div>
              </div>
            </div>

            {/* WHT Credits Breakdown */}
            {citResult.total_wht_credits > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">WHT Credits Breakdown</h4>
                <div className="space-y-2 text-sm">
                  {Object.entries(citResult.wht_credits_breakdown || {}).map(([source, amount]) => {
                    if (amount > 0) {
                      return (
                        <div key={source} className="flex justify-between">
                          <span className="text-gray-600 capitalize">WHT on {source}:</span>
                          <span className="font-medium">{formatCurrency(amount)}</span>
                        </div>
                      );
                    }
                    return null;
                  })}
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Total WHT Credits:</span>
                    <span className="text-green-600">{formatCurrency(citResult.total_wht_credits)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Compliance Deadlines */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Compliance Deadlines</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-600 font-medium">Filing Deadline</p>
                  <p className="font-semibold text-yellow-800">{citResult.filing_deadline}</p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <p className="text-sm text-red-600 font-medium">Payment Deadline</p>
                  <p className="font-semibold text-red-800">{citResult.payment_deadline}</p>
                </div>
              </div>
            </div>
            
            {/* Print Report Button */}
            <div className="pt-4 border-t space-y-2">
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