import React, { useState } from 'react';
import axios from 'axios';
import { Building2, Calculator, DollarSign, FileText, RotateCcw, ChevronDown, ChevronUp, TrendingUp, TrendingDown, AlertTriangle, Settings, CreditCard, CheckCircle, Crown, Sparkles, Info, User, Lock } from 'lucide-react';
import { MobileAdBanner } from './MobileAdBanner';
import MobileActionPanel from './MobileActionPanel';
import { useAuth } from '../../contexts/AuthContext';
import { useFeatureGate } from '../../contexts/FeatureGateContext';
import { useAdCalculation } from '../../hooks/useAdCalculation';
import VideoAdModal from '../VideoAdModal';
import MilestoneModal from '../MilestoneModal';

/**
 * MOBILE CIT Calculator - Full Feature Parity with Web Version
 * Includes all fields from web: Company Info, Revenue, Deductible/Non-deductible Expenses,
 * Loss Relief, Capital Allowances, and WHT Credits
 * + Feature Gates, Ad-supported calculations, Milestone prompts, PDF Export, Templates, User Guide
 */
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = BACKEND_URL ? `${BACKEND_URL}/api` : null;

export const MobileCITCalculator = ({ onShowUpgradeModal }) => {
  const [expandedSection, setExpandedSection] = useState('company');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [citMode, setCitMode] = useState('standard'); // 'standard' or 'professional'
  const [showMilestone, setShowMilestone] = useState(false);
  const [calculationCount, setCalculationCount] = useState(0);
  
  const { user, isAuthenticated } = useAuth();
  const { hasFeature, getUserTier } = useFeatureGate();
  const citAdCalc = useAdCalculation('cit');
  
  const userTier = getUserTier ? getUserTier() : 'free';
  const isPaidUser = userTier === 'pro' || userTier === 'premium' || userTier === 'enterprise' || userTier === 'starter';
  
  const [citInput, setCitInput] = useState({
    // Company Details
    company_name: '',
    tin: '',
    year_of_assessment: '2026',
    tax_year: '2025',
    annual_turnover: '',
    total_fixed_assets: '',
    is_professional_service: false,
    is_multinational: false,
    global_revenue_eur: '',
    // Revenue & Income
    gross_income: '',
    other_income: '',
    // Deductible Expenses
    cost_of_goods_sold: '',
    staff_costs: '',
    rent_expenses: '',
    professional_fees: '',
    depreciation: '',
    interest_paid_unrelated: '',
    interest_paid_related: '',
    other_deductible_expenses: '',
    // Non-deductible Expenses
    entertainment_expenses: '',
    fines_penalties: '',
    personal_expenses: '',
    other_non_deductible: '',
    // Loss Relief
    carry_forward_losses: '',
    // Capital Allowances - New Assets (Cost)
    buildings_cost: '',
    furniture_fittings_cost: '',
    plant_machinery_cost: '',
    motor_vehicles_cost: '',
    other_assets_cost: '',
    // Capital Allowances - Existing Assets (WDV)
    buildings_wdv: '',
    furniture_fittings_wdv: '',
    plant_machinery_wdv: '',
    motor_vehicles_wdv: '',
    other_assets_wdv: '',
    // WHT Credits
    wht_contracts: '',
    wht_dividends: '',
    wht_interest: '',
    wht_rent: '',
    wht_other: ''
  });

  const handleInputChange = (field, value) => {
    setCitInput(prev => ({ ...prev, [field]: value }));
  };

  const calculateTax = async () => {
    if (!citInput.annual_turnover && !citInput.gross_income) {
      alert('Please enter turnover or gross income');
      return;
    }

    const performCalculation = async () => {
      setLoading(true);
      try {
        const numericInput = {};
        Object.keys(citInput).forEach(key => {
          if (['company_name', 'tin', 'year_of_assessment', 'tax_year'].includes(key)) {
            numericInput[key] = citInput[key];
          } else if (['is_professional_service', 'is_multinational'].includes(key)) {
            numericInput[key] = citInput[key];
          } else {
            numericInput[key] = parseFloat(citInput[key]) || 0;
          }
        });

        const response = await axios.post(`${API}/calculate-cit`, numericInput);
        setResult(response.data);
        setExpandedSection('result');
        
        // Increment calculation count and show milestone
        const newCount = calculationCount + 1;
        setCalculationCount(newCount);
        
        if (!isPaidUser && (newCount === 3 || newCount === 7 || newCount === 15)) {
          setTimeout(() => setShowMilestone(true), 1500);
        }
      } catch (error) {
        console.error('Error calculating CIT:', error);
        alert(error.response?.data?.detail || 'Error calculating CIT. Please check your inputs.');
      } finally {
        setLoading(false);
      }
    };
    
    citAdCalc.handleCalculateWithAd(performCalculation);
  };

  const resetForm = () => {
    setCitInput({
      company_name: '', tin: '', year_of_assessment: '2026', tax_year: '2025',
      annual_turnover: '', total_fixed_assets: '', is_professional_service: false,
      is_multinational: false, global_revenue_eur: '', gross_income: '', other_income: '',
      cost_of_goods_sold: '', staff_costs: '', rent_expenses: '', professional_fees: '',
      depreciation: '', interest_paid_unrelated: '', interest_paid_related: '',
      other_deductible_expenses: '', entertainment_expenses: '', fines_penalties: '',
      personal_expenses: '', other_non_deductible: '', carry_forward_losses: '',
      buildings_cost: '', furniture_fittings_cost: '', plant_machinery_cost: '',
      motor_vehicles_cost: '', other_assets_cost: '', buildings_wdv: '',
      furniture_fittings_wdv: '', plant_machinery_wdv: '', motor_vehicles_wdv: '',
      other_assets_wdv: '', wht_contracts: '', wht_dividends: '', wht_interest: '',
      wht_rent: '', wht_other: ''
    });
    setResult(null);
    setExpandedSection('company');
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return '₦0';
    return '₦' + new Intl.NumberFormat('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const glassStyle = {
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  };

  return (
    <div 
      className="min-h-screen pb-24"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.9)), url('https://customer-assets.emergentagent.com/job_naija-taxcalc/artifacts/za762luj_Gemini_Generated_Image_ge8ufyge8ufyge8u.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="p-4 pt-40 space-y-4">
        <MobileAdBanner placement="calculator" />
        
        {/* Results Section */}
        {result && (
          <CollapsibleSection
            title="CIT Calculation Results"
            icon={FileText}
            isExpanded={expandedSection === 'result'}
            onToggle={() => toggleSection('result')}
            glassStyle={glassStyle}
            accentColor="purple"
          >
            <div className="space-y-3">
              <div className="p-3 rounded-lg text-center" style={{ background: 'rgba(139, 92, 246, 0.2)' }}>
                <p className="text-xs text-gray-400">Company Classification</p>
                <p className="text-lg font-bold text-purple-400">{result.company_size || 'Medium'}</p>
                <p className="text-xs text-gray-400">Tax Rate: {result.cit_rate ? (result.cit_rate * 100).toFixed(0) : 20}%</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <ResultCard label="Total Tax Due" value={formatCurrency(result.total_tax_due)} highlight />
                <ResultCard label="Net Tax Payable" value={formatCurrency(result.net_tax_payable || result.total_tax_due)} />
                <ResultCard label="Taxable Profit" value={formatCurrency(result.taxable_profit)} />
                <ResultCard label="Dev. Levy" value={formatCurrency(result.development_levy)} />
              </div>
              <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>
                <h4 className="text-sm font-semibold text-purple-400 mb-2">Breakdown</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-gray-300">
                    <span>Gross Income:</span>
                    <span className="text-white">{formatCurrency(result.gross_income)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Total Deductions:</span>
                    <span className="text-green-400">-{formatCurrency(result.total_deductible_expenses)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Capital Allowances:</span>
                    <span className="text-green-400">-{formatCurrency(result.total_capital_allowances || 0)}</span>
                  </div>
                  {result.total_wht_credits > 0 && (
                    <div className="flex justify-between text-gray-300">
                      <span>WHT Credits:</span>
                      <span className="text-green-400">-{formatCurrency(result.total_wht_credits)}</span>
                    </div>
                  )}
                </div>
              </div>
              {/* Deadlines */}
              {result.filing_deadline && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-amber-500/20">
                    <p className="text-amber-400 font-medium">Filing: {result.filing_deadline}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-rose-500/20">
                    <p className="text-rose-400 font-medium">Payment: {result.payment_deadline}</p>
                  </div>
                </div>
              )}
            </div>
          </CollapsibleSection>
        )}

        {/* Company Information */}
        <CollapsibleSection
          title="Company Information"
          icon={Building2}
          isExpanded={expandedSection === 'company'}
          onToggle={() => toggleSection('company')}
          glassStyle={glassStyle}
        >
          <div className="space-y-3">
            <MobileInput label="Company Name" placeholder="ABC Nigeria Ltd" value={citInput.company_name} onChange={(v) => handleInputChange('company_name', v)} />
            <MobileInput label="TIN" placeholder="Tax ID Number" value={citInput.tin} onChange={(v) => handleInputChange('tin', v)} />
            <div className="grid grid-cols-2 gap-3">
              <MobileInput label="Assessment Year" placeholder="2026" value={citInput.year_of_assessment} onChange={(v) => handleInputChange('year_of_assessment', v)} />
              <MobileInput label="Tax Year" placeholder="2025" value={citInput.tax_year} onChange={(v) => handleInputChange('tax_year', v)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MobileInput label="Annual Turnover *" placeholder="₦50M" value={citInput.annual_turnover} onChange={(v) => handleInputChange('annual_turnover', v)} type="number" />
              <MobileInput label="Total Fixed Assets" placeholder="₦10M" value={citInput.total_fixed_assets} onChange={(v) => handleInputChange('total_fixed_assets', v)} type="number" />
            </div>
            {/* Company Type Toggles */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <p className="text-xs text-gray-400">Company Type</p>
              <MobileToggle label="Professional Service Firm" checked={citInput.is_professional_service} onChange={(v) => handleInputChange('is_professional_service', v)} />
              <MobileToggle label="Multinational Enterprise" checked={citInput.is_multinational} onChange={(v) => handleInputChange('is_multinational', v)} />
              {citInput.is_multinational && (
                <MobileInput label="Global Revenue (EUR)" placeholder="750,000,000" value={citInput.global_revenue_eur} onChange={(v) => handleInputChange('global_revenue_eur', v)} type="number" />
              )}
            </div>
          </div>
        </CollapsibleSection>

        {/* Revenue Section */}
        <CollapsibleSection
          title="Revenue & Income"
          icon={TrendingUp}
          isExpanded={expandedSection === 'revenue'}
          onToggle={() => toggleSection('revenue')}
          glassStyle={glassStyle}
          required
        >
          <div className="space-y-3">
            <MobileInput label="Gross Income/Revenue *" placeholder="₦500,000,000" value={citInput.gross_income} onChange={(v) => handleInputChange('gross_income', v)} type="number" required />
            <MobileInput label="Other Income" placeholder="₦10,000,000" value={citInput.other_income} onChange={(v) => handleInputChange('other_income', v)} type="number" />
          </div>
        </CollapsibleSection>

        {/* Deductible Expenses */}
        <CollapsibleSection
          title="Deductible Expenses"
          icon={CheckCircle}
          isExpanded={expandedSection === 'deductible'}
          onToggle={() => toggleSection('deductible')}
          glassStyle={glassStyle}
        >
          <div className="space-y-3">
            <MobileInput label="Cost of Goods Sold" placeholder="₦200M" value={citInput.cost_of_goods_sold} onChange={(v) => handleInputChange('cost_of_goods_sold', v)} type="number" />
            <div className="grid grid-cols-2 gap-3">
              <MobileInput label="Staff Costs" placeholder="₦50M" value={citInput.staff_costs} onChange={(v) => handleInputChange('staff_costs', v)} type="number" />
              <MobileInput label="Rent & Utilities" placeholder="₦12M" value={citInput.rent_expenses} onChange={(v) => handleInputChange('rent_expenses', v)} type="number" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MobileInput label="Professional Fees" placeholder="₦5M" value={citInput.professional_fees} onChange={(v) => handleInputChange('professional_fees', v)} type="number" />
              <MobileInput label="Other Deductible" placeholder="₦7M" value={citInput.other_deductible_expenses} onChange={(v) => handleInputChange('other_deductible_expenses', v)} type="number" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MobileInput label="Interest (Unrelated)" placeholder="₦8M" value={citInput.interest_paid_unrelated} onChange={(v) => handleInputChange('interest_paid_unrelated', v)} type="number" />
              <MobileInput label="Interest (Related)" placeholder="₦3M" value={citInput.interest_paid_related} onChange={(v) => handleInputChange('interest_paid_related', v)} type="number" />
            </div>
          </div>
        </CollapsibleSection>

        {/* Non-deductible Expenses */}
        <CollapsibleSection
          title="Non-deductible Expenses"
          icon={AlertTriangle}
          isExpanded={expandedSection === 'non_deductible'}
          onToggle={() => toggleSection('non_deductible')}
          glassStyle={glassStyle}
        >
          <div className="p-2 rounded-lg mb-3" style={{ background: 'rgba(251, 191, 36, 0.15)' }}>
            <p className="text-xs text-amber-300"><strong>Note:</strong> Depreciation is not tax-deductible. Capital allowances replace depreciation for tax purposes.</p>
          </div>
          <div className="space-y-3">
            <MobileInput label="Depreciation" placeholder="₦15M" value={citInput.depreciation} onChange={(v) => handleInputChange('depreciation', v)} type="number" />
            <div className="grid grid-cols-2 gap-3">
              <MobileInput label="Entertainment & Gifts" placeholder="₦2M" value={citInput.entertainment_expenses} onChange={(v) => handleInputChange('entertainment_expenses', v)} type="number" />
              <MobileInput label="Fines & Penalties" placeholder="₦500K" value={citInput.fines_penalties} onChange={(v) => handleInputChange('fines_penalties', v)} type="number" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MobileInput label="Personal Expenses" placeholder="₦1M" value={citInput.personal_expenses} onChange={(v) => handleInputChange('personal_expenses', v)} type="number" />
              <MobileInput label="Other Non-deductible" placeholder="₦500K" value={citInput.other_non_deductible} onChange={(v) => handleInputChange('other_non_deductible', v)} type="number" />
            </div>
          </div>
        </CollapsibleSection>

        {/* Loss Relief */}
        <CollapsibleSection
          title="Loss Relief"
          icon={TrendingDown}
          isExpanded={expandedSection === 'loss'}
          onToggle={() => toggleSection('loss')}
          glassStyle={glassStyle}
        >
          <div className="p-2 rounded-lg mb-3" style={{ background: 'rgba(249, 115, 22, 0.15)' }}>
            <p className="text-xs text-orange-300">Losses can be carried forward indefinitely under NTA</p>
          </div>
          <MobileInput label="Carry Forward Losses" placeholder="₦5,000,000" value={citInput.carry_forward_losses} onChange={(v) => handleInputChange('carry_forward_losses', v)} type="number" />
        </CollapsibleSection>

        {/* Capital Allowances */}
        <CollapsibleSection
          title="Capital Allowances"
          icon={Settings}
          isExpanded={expandedSection === 'capital'}
          onToggle={() => toggleSection('capital')}
          glassStyle={glassStyle}
        >
          <div className="p-2 rounded-lg mb-3" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
            <p className="text-xs text-indigo-300">Initial allowances abolished. Enter cost/WDV of assets.</p>
          </div>
          {/* New Assets */}
          <p className="text-xs text-gray-400 mb-2 font-medium">New Assets (Cost)</p>
          <div className="space-y-2 mb-4">
            <div className="grid grid-cols-2 gap-2">
              <MobileInput label="Buildings (10%)" placeholder="₦50M" value={citInput.buildings_cost} onChange={(v) => handleInputChange('buildings_cost', v)} type="number" />
              <MobileInput label="Furniture (20%)" placeholder="₦10M" value={citInput.furniture_fittings_cost} onChange={(v) => handleInputChange('furniture_fittings_cost', v)} type="number" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <MobileInput label="Plant/Machinery (20%)" placeholder="₦30M" value={citInput.plant_machinery_cost} onChange={(v) => handleInputChange('plant_machinery_cost', v)} type="number" />
              <MobileInput label="Motor Vehicles (25%)" placeholder="₦15M" value={citInput.motor_vehicles_cost} onChange={(v) => handleInputChange('motor_vehicles_cost', v)} type="number" />
            </div>
            <MobileInput label="Other Assets (20%)" placeholder="₦5M" value={citInput.other_assets_cost} onChange={(v) => handleInputChange('other_assets_cost', v)} type="number" />
          </div>
          {/* Existing Assets WDV */}
          <p className="text-xs text-gray-400 mb-2 font-medium">Existing Assets (Written Down Value)</p>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <MobileInput label="Buildings WDV" placeholder="₦100M" value={citInput.buildings_wdv} onChange={(v) => handleInputChange('buildings_wdv', v)} type="number" />
              <MobileInput label="Furniture WDV" placeholder="₦20M" value={citInput.furniture_fittings_wdv} onChange={(v) => handleInputChange('furniture_fittings_wdv', v)} type="number" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <MobileInput label="Plant/Machinery WDV" placeholder="₦80M" value={citInput.plant_machinery_wdv} onChange={(v) => handleInputChange('plant_machinery_wdv', v)} type="number" />
              <MobileInput label="Motor Vehicles WDV" placeholder="₦25M" value={citInput.motor_vehicles_wdv} onChange={(v) => handleInputChange('motor_vehicles_wdv', v)} type="number" />
            </div>
            <MobileInput label="Other Assets WDV" placeholder="₦10M" value={citInput.other_assets_wdv} onChange={(v) => handleInputChange('other_assets_wdv', v)} type="number" />
          </div>
        </CollapsibleSection>

        {/* WHT Credits */}
        <CollapsibleSection
          title="WHT Credits"
          icon={CreditCard}
          isExpanded={expandedSection === 'wht'}
          onToggle={() => toggleSection('wht')}
          glassStyle={glassStyle}
        >
          <div className="p-2 rounded-lg mb-3" style={{ background: 'rgba(34, 197, 94, 0.15)' }}>
            <p className="text-xs text-green-300">Enter WHT deducted at source to credit against CIT</p>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <MobileInput label="WHT on Contracts" placeholder="₦3.5M" value={citInput.wht_contracts} onChange={(v) => handleInputChange('wht_contracts', v)} type="number" />
              <MobileInput label="WHT on Dividends" placeholder="₦4M" value={citInput.wht_dividends} onChange={(v) => handleInputChange('wht_dividends', v)} type="number" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MobileInput label="WHT on Interest" placeholder="₦1M" value={citInput.wht_interest} onChange={(v) => handleInputChange('wht_interest', v)} type="number" />
              <MobileInput label="WHT on Rent" placeholder="₦500K" value={citInput.wht_rent} onChange={(v) => handleInputChange('wht_rent', v)} type="number" />
            </div>
            <MobileInput label="Other WHT" placeholder="₦0" value={citInput.wht_other} onChange={(v) => handleInputChange('wht_other', v)} type="number" />
          </div>
        </CollapsibleSection>

        {/* Actions & Tools Panel - PDF Export, Templates, User Guide */}
        <MobileActionPanel
          calculatorType="cit"
          inputData={citInput}
          resultData={result}
          onLoadTemplate={(templateData) => {
            setCitInput(prev => ({
              ...prev,
              ...templateData
            }));
          }}
          onShowUpgradeModal={onShowUpgradeModal}
        />

        {/* Ad-supported info for free users */}
        {!isPaidUser && (
          <div className="p-3 rounded-xl" style={{ ...glassStyle, background: 'rgba(139, 92, 246, 0.15)' }}>
            <p className="text-xs text-purple-300 flex items-center gap-2">
              <Info className="h-4 w-4 flex-shrink-0" />
              {isAuthenticated && isAuthenticated() 
                ? `${citAdCalc.dailyLimit} free calculations daily. ${citAdCalc.remainingFreeCalcs} remaining today.`
                : 'Create a free account for 15 daily calculations. Guests get 5 free per day.'
              }
            </p>
          </div>
        )}

        {/* User tier badge */}
        {isAuthenticated && isAuthenticated() && (
          <div className="flex justify-center">
            <div className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5"
              style={{ 
                background: isPaidUser ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.1)',
                border: isPaidUser ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(255,255,255,0.2)'
              }}>
              {isPaidUser ? <Crown className="h-3 w-3 text-purple-400" /> : <User className="h-3 w-3 text-gray-400" />}
              <span className={isPaidUser ? 'text-purple-400' : 'text-gray-400'}>
                {userTier.toUpperCase()} Account
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={resetForm}
            className="flex-1 py-3 px-4 rounded-xl font-medium flex items-center justify-center space-x-2 active:scale-95 transition-transform"
            style={{ ...glassStyle, background: 'rgba(255,255,255,0.1)' }}
          >
            <RotateCcw className="h-5 w-5 text-gray-300" />
            <span className="text-gray-300">Reset</span>
          </button>
          <button
            onClick={calculateTax}
            disabled={loading || (!citInput.annual_turnover && !citInput.gross_income)}
            className="flex-[2] py-3 px-4 rounded-xl font-semibold flex items-center justify-center space-x-2 active:scale-95 transition-transform disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: 'white' }}
          >
            <Calculator className="h-5 w-5" />
            <span>{loading ? 'Calculating...' : 'Calculate CIT'}</span>
          </button>
        </div>
      </div>
      
      {/* Video Ad Modal */}
      <VideoAdModal
        isOpen={citAdCalc.showAdModal}
        onClose={citAdCalc.closeAdModal}
        onAdComplete={citAdCalc.onAdComplete}
        calculatorType="CIT"
      />
      
      {/* Milestone Conversion Modal */}
      <MilestoneModal
        isOpen={showMilestone}
        onClose={() => setShowMilestone(false)}
        milestone={calculationCount}
        onUpgrade={() => {
          setShowMilestone(false);
          if (onShowUpgradeModal) onShowUpgradeModal();
        }}
      />
      
      {/* Upgrade Prompt for limit reached */}
      {citAdCalc.showUpgradePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full border border-purple-500/30">
            <div className="text-center">
              <Sparkles className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Daily Limit Reached</h3>
              <p className="text-gray-400 text-sm mb-4">
                You've used all your free calculations for today. Upgrade to get unlimited access!
              </p>
              <button
                onClick={() => {
                  citAdCalc.closeUpgradePrompt();
                  if (onShowUpgradeModal) onShowUpgradeModal();
                }}
                className="w-full py-3 rounded-xl font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)' }}
              >
                View Upgrade Options
              </button>
              <button
                onClick={citAdCalc.closeUpgradePrompt}
                className="w-full py-2 mt-2 text-gray-400 text-sm"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Collapsible Section Component
const CollapsibleSection = ({ title, icon: Icon, isExpanded, onToggle, children, glassStyle, required, accentColor = 'white' }) => {
  const accentColors = {
    white: 'from-white/20 to-white/10',
    purple: 'from-purple-500/30 to-purple-600/20'
  };

  return (
    <div className="rounded-xl overflow-hidden" style={glassStyle}>
      <button onClick={onToggle} className={`w-full p-4 flex items-center justify-between bg-gradient-to-r ${accentColors[accentColor]}`}>
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${accentColor === 'purple' ? 'bg-purple-500/30' : 'bg-white/10'}`}>
            <Icon className={`h-4 w-4 ${accentColor === 'purple' ? 'text-purple-400' : 'text-white'}`} />
          </div>
          <span className="font-semibold text-white">{title}</span>
          {required && <span className="text-red-400 text-xs">*Required</span>}
        </div>
        {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
      </button>
      {isExpanded && <div className="p-4 pt-2">{children}</div>}
    </div>
  );
};

// Mobile Input Component
const MobileInput = ({ label, placeholder, value, onChange, type = 'text' }) => (
  <div>
    <label className="block text-xs text-gray-400 mb-1">{label}</label>
    <input
      type={type}
      inputMode={type === 'number' ? 'numeric' : 'text'}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
      style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
    />
  </div>
);

// Mobile Toggle Component
const MobileToggle = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
    <span className="text-sm text-gray-300">{label}</span>
    <button
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 rounded-full transition-all relative ${checked ? 'bg-purple-500' : 'bg-gray-600'}`}
    >
      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${checked ? 'left-6' : 'left-0.5'}`} />
    </button>
  </div>
);

// Result Card Component
const ResultCard = ({ label, value, highlight }) => (
  <div className={`p-3 rounded-lg text-center ${highlight ? 'bg-purple-500/20' : 'bg-white/5'}`}>
    <p className="text-xs text-gray-400">{label}</p>
    <p className={`text-lg font-bold ${highlight ? 'text-purple-400' : 'text-white'}`}>{value}</p>
  </div>
);

export default MobileCITCalculator;
