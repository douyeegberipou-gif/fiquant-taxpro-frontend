import React, { useState } from 'react';
import axios from 'axios';
import { Users, Calculator, DollarSign, PiggyBank, FileText, RotateCcw, ChevronDown, ChevronUp, Building2, Home, Lock, Crown, Sparkles, Info, User } from 'lucide-react';
import { MobileAdBanner } from './MobileAdBanner';
import MobileActionPanel from './MobileActionPanel';
import { useAuth } from '../../contexts/AuthContext';
import { useFeatureGate } from '../../contexts/FeatureGateContext';
import { useAdCalculation } from '../../hooks/useAdCalculation';
import VideoAdModal from '../VideoAdModal';
import MilestoneModal from '../MilestoneModal';

/**
 * MOBILE PAYE Calculator - Full Feature Parity with Web Version
 * Includes: Staff Info, Tax Authority, All Allowances (Transport, Housing, Meal, Utility, Medical, Other),
 * Benefits in Kind (Vehicle, Housing, Bonus), and All Reliefs (Pension, NHF, Life/Health Insurance, NHIS, Rent, Mortgage)
 * + Feature Gates, Ad-supported calculations, Milestone prompts, PDF Export, Templates, User Guide
 */
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = BACKEND_URL ? `${BACKEND_URL}/api` : null;

export const MobilePAYECalculator = ({ onShowUpgradeModal }) => {
  const [expandedSection, setExpandedSection] = useState('income');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showMilestone, setShowMilestone] = useState(false);
  const [calculationCount, setCalculationCount] = useState(0);
  
  const { user, isAuthenticated } = useAuth();
  const { hasFeature, getUserTier } = useFeatureGate();
  const payeAdCalc = useAdCalculation('paye');
  
  const userTier = getUserTier ? getUserTier() : 'free';
  const isPaidUser = userTier === 'pro' || userTier === 'premium' || userTier === 'enterprise' || userTier === 'starter';
  
  const [taxInput, setTaxInput] = useState({
    // Staff Information
    staff_name: '',
    tin: '',
    month: '',
    year: '2026',
    state_of_residence: '',
    tax_authority: '',
    // Income Details - All Allowances
    basic_salary: '',
    transport_allowance: '',
    housing_allowance: '',
    meal_allowance: '',
    utility_allowance: '',
    medical_allowance: '',
    other_allowances: '',
    // Benefits in Kind (BIK) - NTA 2025
    bik_vehicle_value: '',
    bik_housing_value: '',
    bonus: '',
    // Deductions & Reliefs
    pension_contribution: '',
    nhf_contribution: '',
    nhf_applicable: true,
    life_insurance_premium: '',
    health_insurance_premium: '',
    nhis_contribution: '',
    annual_rent: '',
    mortgage_interest: ''
  });

  const handleInputChange = (field, value) => {
    setTaxInput(prev => ({ ...prev, [field]: value }));
  };

  const calculateTax = async () => {
    if (!taxInput.basic_salary) {
      alert('Please enter a basic salary');
      return;
    }

    // Use ad calculation hook for free users
    const performCalculation = async () => {
      setLoading(true);
      try {
        const numericInput = {};
        Object.keys(taxInput).forEach(key => {
          if (['staff_name', 'tin', 'month', 'year', 'state_of_residence', 'tax_authority'].includes(key)) {
            numericInput[key] = taxInput[key];
          } else if (key === 'nhf_applicable') {
            numericInput[key] = taxInput[key];
          } else if (key === 'nhf_contribution') {
            numericInput[key] = parseFloat(taxInput[key]) || 0;
          } else {
            numericInput[key] = parseFloat(taxInput[key]) || 0;
          }
        });

        const response = await axios.post(`${API}/calculate-paye`, numericInput);
        setResult(response.data[0]);
        setExpandedSection('result');
        
        // Increment calculation count and show milestone after certain thresholds
        const newCount = calculationCount + 1;
        setCalculationCount(newCount);
        
        // Show milestone prompt at 3, 7, 15 calculations for non-paid users
        if (!isPaidUser && (newCount === 3 || newCount === 7 || newCount === 15)) {
          setTimeout(() => setShowMilestone(true), 1500);
        }
      } catch (error) {
        console.error('Error calculating tax:', error);
        alert(error.response?.data?.detail || 'Error calculating tax. Please check your inputs.');
      } finally {
        setLoading(false);
      }
    };
    
    // Use ad-supported calculation flow
    payeAdCalc.handleCalculateWithAd(performCalculation);
  };

  const resetForm = () => {
    setTaxInput({
      staff_name: '', tin: '', month: '', year: '2026', state_of_residence: '', tax_authority: '',
      basic_salary: '', transport_allowance: '', housing_allowance: '', meal_allowance: '',
      utility_allowance: '', medical_allowance: '', other_allowances: '',
      bik_vehicle_value: '', bik_housing_value: '', bonus: '',
      pension_contribution: '', nhf_contribution: '', nhf_applicable: true,
      life_insurance_premium: '', health_insurance_premium: '', nhis_contribution: '',
      annual_rent: '', mortgage_interest: ''
    });
    setResult(null);
    setExpandedSection('income');
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

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = Array.from({length: 27}, (_, i) => (2024 + i).toString());
  const states = ['Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'];

  return (
    <div 
      className="min-h-screen pb-24"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.9)), url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
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
            title="Tax Calculation Results"
            icon={FileText}
            isExpanded={expandedSection === 'result'}
            onToggle={() => toggleSection('result')}
            glassStyle={glassStyle}
            accentColor="yellow"
          >
            <div className="space-y-3">
              {/* Key Results */}
              <div className="grid grid-cols-2 gap-3">
                <ResultCard label="Monthly Tax" value={formatCurrency(result.monthly_tax)} highlight />
                <ResultCard label="Annual Tax" value={formatCurrency(result.annual_tax)} />
                <ResultCard label="Net Monthly" value={formatCurrency(result.net_monthly_income)} highlight />
                <ResultCard label="Net Annual" value={formatCurrency(result.net_annual_income)} />
              </div>

              {/* Detailed Breakdown */}
              <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>
                <h4 className="text-sm font-semibold text-yellow-400 mb-2">Income Breakdown</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-gray-300">
                    <span>Gross Monthly:</span>
                    <span className="text-white">{formatCurrency(result.gross_monthly_income)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Gross Annual:</span>
                    <span className="text-white">{formatCurrency(result.gross_annual_income)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Taxable Income:</span>
                    <span className="text-white">{formatCurrency(result.taxable_income)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Total Reliefs:</span>
                    <span className="text-green-400">{formatCurrency(result.total_reliefs)}</span>
                  </div>
                </div>
              </div>

              {/* Benefits in Kind Breakdown */}
              {result.total_bik_taxable > 0 && (
                <div className="p-3 rounded-lg" style={{ background: 'rgba(147, 51, 234, 0.15)' }}>
                  <p className="text-xs text-purple-300 font-semibold mb-2">Benefits in Kind (NTA 2025)</p>
                  <div className="space-y-1 text-xs">
                    {result.bik_vehicle_taxable > 0 && (
                      <div className="flex justify-between text-gray-300">
                        <span>Vehicle (5%)</span>
                        <span className="text-purple-400">{formatCurrency(result.bik_vehicle_taxable)}</span>
                      </div>
                    )}
                    {result.bik_housing_taxable > 0 && (
                      <div className="flex justify-between text-gray-300">
                        <span>Housing (20%)</span>
                        <span className="text-purple-400">{formatCurrency(result.bik_housing_taxable)}</span>
                      </div>
                    )}
                    {result.bonus > 0 && (
                      <div className="flex justify-between text-gray-300">
                        <span>Bonus (100%)</span>
                        <span className="text-purple-400">{formatCurrency(result.bonus)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-purple-300 font-semibold border-t border-purple-500/30 pt-1 mt-1">
                      <span>Total BIK Taxable</span>
                      <span>{formatCurrency(result.total_bik_taxable)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Effective Tax Rate */}
              <div className="text-center p-3 rounded-lg" style={{ background: 'rgba(234, 179, 8, 0.15)' }}>
                <p className="text-xs text-gray-400">Effective Tax Rate</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {result.gross_annual_income > 0 
                    ? ((result.annual_tax / result.gross_annual_income) * 100).toFixed(2) 
                    : '0.00'}%
                </p>
              </div>
            </div>
          </CollapsibleSection>
        )}

        {/* Taxpayer Information */}
        <CollapsibleSection
          title="Taxpayer Information"
          icon={Users}
          isExpanded={expandedSection === 'info'}
          onToggle={() => toggleSection('info')}
          glassStyle={glassStyle}
        >
          <div className="space-y-3">
            <MobileInput label="Name of Staff/Taxpayer" placeholder="Full Name" value={taxInput.staff_name} onChange={(v) => handleInputChange('staff_name', v)} />
            <MobileInput label="TIN" placeholder="Tax ID Number" value={taxInput.tin} onChange={(v) => handleInputChange('tin', v)} />
            <div className="grid grid-cols-2 gap-3">
              <MobileSelect label="Month" value={taxInput.month} onChange={(v) => handleInputChange('month', v)} options={months} />
              <MobileSelect label="Year" value={taxInput.year} onChange={(v) => handleInputChange('year', v)} options={years} />
            </div>
            <MobileSelect label="State of Residence" value={taxInput.state_of_residence} onChange={(v) => handleInputChange('state_of_residence', v)} options={states} />
            <MobileInput label="Tax Authority" placeholder="e.g. LIRS, FIRS" value={taxInput.tax_authority} onChange={(v) => handleInputChange('tax_authority', v)} />
          </div>
        </CollapsibleSection>

        {/* Income Section - All Allowances */}
        <CollapsibleSection
          title="Monthly Income"
          icon={DollarSign}
          isExpanded={expandedSection === 'income'}
          onToggle={() => toggleSection('income')}
          glassStyle={glassStyle}
          required
        >
          <div className="space-y-3">
            <MobileInput label="Basic Salary *" placeholder="₦500,000" value={taxInput.basic_salary} onChange={(v) => handleInputChange('basic_salary', v)} type="number" required />
            
            {/* Row 1: Transport & Housing */}
            <div className="grid grid-cols-2 gap-3">
              <MobileInput label="Transport Allowance" placeholder="₦50,000" value={taxInput.transport_allowance} onChange={(v) => handleInputChange('transport_allowance', v)} type="number" />
              <MobileInput label="Housing Allowance" placeholder="₦200,000" value={taxInput.housing_allowance} onChange={(v) => handleInputChange('housing_allowance', v)} type="number" />
            </div>
            
            {/* Row 2: Meal & Utility */}
            <div className="grid grid-cols-2 gap-3">
              <MobileInput label="Meal Allowance" placeholder="₦30,000" value={taxInput.meal_allowance} onChange={(v) => handleInputChange('meal_allowance', v)} type="number" />
              <MobileInput label="Utility Allowance" placeholder="₦20,000" value={taxInput.utility_allowance} onChange={(v) => handleInputChange('utility_allowance', v)} type="number" />
            </div>
            
            {/* Row 3: Medical & Other */}
            <div className="grid grid-cols-2 gap-3">
              <MobileInput label="Medical Allowance" placeholder="₦15,000" value={taxInput.medical_allowance} onChange={(v) => handleInputChange('medical_allowance', v)} type="number" />
              <MobileInput label="Other Allowances" placeholder="₦25,000" value={taxInput.other_allowances} onChange={(v) => handleInputChange('other_allowances', v)} type="number" />
            </div>
            
            {/* Benefits in Kind (BIK) - NTA 2025 */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <p className="text-xs text-purple-300 mb-2 font-semibold">Benefits in Kind (NTA 2025)</p>
              <p className="text-[10px] text-purple-200 mb-3">Vehicle: 5% taxable | Housing: 20% taxable | Bonus: 100% taxable</p>
              <div className="grid grid-cols-3 gap-2">
                <MobileInput label="Vehicle BIK" placeholder="₦0" value={taxInput.bik_vehicle_value} onChange={(v) => handleInputChange('bik_vehicle_value', v)} type="number" />
                <MobileInput label="Housing BIK" placeholder="₦0" value={taxInput.bik_housing_value} onChange={(v) => handleInputChange('bik_housing_value', v)} type="number" />
                <MobileInput label="Bonus" placeholder="₦0" value={taxInput.bonus} onChange={(v) => handleInputChange('bonus', v)} type="number" />
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Reliefs & Deductions Section - Complete */}
        <CollapsibleSection
          title="Reliefs & Deductions"
          icon={PiggyBank}
          isExpanded={expandedSection === 'reliefs'}
          onToggle={() => toggleSection('reliefs')}
          glassStyle={glassStyle}
        >
          <p className="text-xs text-blue-300 mb-3 p-2 rounded" style={{ background: 'rgba(59, 130, 246, 0.2)' }}>
            Leave empty to auto-calculate pension (8%) and NHF (2.5%)
          </p>
          
          <div className="space-y-3">
            {/* NHF Toggle */}
            <MobileToggle 
              label="NHF Applicable?" 
              checked={taxInput.nhf_applicable} 
              onChange={(v) => handleInputChange('nhf_applicable', v)} 
            />
            
            {/* Pension & NHF */}
            <div className="grid grid-cols-2 gap-3">
              <MobileInput label="Pension Contribution" placeholder="Auto (8%)" value={taxInput.pension_contribution} onChange={(v) => handleInputChange('pension_contribution', v)} type="number" />
              <MobileInput label="NHF Contribution" placeholder="Auto (2.5%)" value={taxInput.nhf_contribution} onChange={(v) => handleInputChange('nhf_contribution', v)} type="number" disabled={!taxInput.nhf_applicable} />
            </div>
            
            {/* Life & Health Insurance */}
            <div className="grid grid-cols-2 gap-3">
              <MobileInput label="Life Insurance" placeholder="₦10,000" value={taxInput.life_insurance_premium} onChange={(v) => handleInputChange('life_insurance_premium', v)} type="number" />
              <MobileInput label="Health Insurance" placeholder="₦15,000" value={taxInput.health_insurance_premium} onChange={(v) => handleInputChange('health_insurance_premium', v)} type="number" />
            </div>
            
            {/* NHIS */}
            <MobileInput label="NHIS Contribution" placeholder="₦0" value={taxInput.nhis_contribution} onChange={(v) => handleInputChange('nhis_contribution', v)} type="number" />
            
            {/* Rent & Mortgage */}
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-xs text-green-300 mb-2 font-semibold flex items-center gap-1">
                <Home className="w-3 h-3" />
                Housing Tax Relief
              </p>
              <div className="grid grid-cols-2 gap-3">
                <MobileInput label="Annual Rent Paid" placeholder="₦0" value={taxInput.annual_rent} onChange={(v) => handleInputChange('annual_rent', v)} type="number" />
                <MobileInput label="Mortgage Interest" placeholder="₦0" value={taxInput.mortgage_interest} onChange={(v) => handleInputChange('mortgage_interest', v)} type="number" />
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Actions & Tools Panel - PDF Export, Templates, User Guide */}
        <MobileActionPanel
          calculatorType="paye"
          inputData={taxInput}
          resultData={result}
          onLoadTemplate={(templateData) => {
            setTaxInput(prev => ({
              ...prev,
              ...templateData
            }));
          }}
          onShowUpgradeModal={onShowUpgradeModal}
        />

        {/* Ad-supported info for free users */}
        {!isPaidUser && (
          <div className="p-3 rounded-xl" style={{ ...glassStyle, background: 'rgba(59, 130, 246, 0.15)' }}>
            <p className="text-xs text-blue-300 flex items-center gap-2">
              <Info className="h-4 w-4 flex-shrink-0" />
              {isAuthenticated && isAuthenticated() 
                ? `${payeAdCalc.dailyLimit} free calculations daily. ${payeAdCalc.remainingFreeCalcs} remaining today.`
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
                background: isPaidUser ? 'rgba(234, 179, 8, 0.2)' : 'rgba(255,255,255,0.1)',
                border: isPaidUser ? '1px solid rgba(234, 179, 8, 0.3)' : '1px solid rgba(255,255,255,0.2)'
              }}>
              {isPaidUser ? <Crown className="h-3 w-3 text-yellow-400" /> : <User className="h-3 w-3 text-gray-400" />}
              <span className={isPaidUser ? 'text-yellow-400' : 'text-gray-400'}>
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
            disabled={loading || !taxInput.basic_salary}
            className="flex-[2] py-3 px-4 rounded-xl font-semibold flex items-center justify-center space-x-2 active:scale-95 transition-transform disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
              color: 'black'
            }}
          >
            <Calculator className="h-5 w-5" />
            <span>{loading ? 'Calculating...' : 'Calculate Tax'}</span>
          </button>
        </div>
      </div>
      
      {/* Video Ad Modal */}
      <VideoAdModal
        isOpen={payeAdCalc.showAdModal}
        onClose={payeAdCalc.closeAdModal}
        onAdComplete={payeAdCalc.onAdComplete}
        calculatorType="PAYE"
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
      {payeAdCalc.showUpgradePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full border border-yellow-500/30">
            <div className="text-center">
              <Sparkles className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Daily Limit Reached</h3>
              <p className="text-gray-400 text-sm mb-4">
                You've used all your free calculations for today. Upgrade to get unlimited access!
              </p>
              <button
                onClick={() => {
                  payeAdCalc.closeUpgradePrompt();
                  if (onShowUpgradeModal) onShowUpgradeModal();
                }}
                className="w-full py-3 rounded-xl font-semibold text-black"
                style={{ background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)' }}
              >
                View Upgrade Options
              </button>
              <button
                onClick={payeAdCalc.closeUpgradePrompt}
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
    yellow: 'from-yellow-500/30 to-yellow-600/20'
  };

  return (
    <div className="rounded-xl overflow-hidden" style={glassStyle}>
      <button onClick={onToggle} className={`w-full p-4 flex items-center justify-between bg-gradient-to-r ${accentColors[accentColor]}`}>
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${accentColor === 'yellow' ? 'bg-yellow-500/30' : 'bg-white/10'}`}>
            <Icon className={`h-4 w-4 ${accentColor === 'yellow' ? 'text-yellow-400' : 'text-white'}`} />
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
const MobileInput = ({ label, placeholder, value, onChange, type = 'text', disabled }) => (
  <div>
    <label className="block text-xs text-gray-400 mb-1">{label}</label>
    <input
      type={type}
      inputMode={type === 'number' ? 'numeric' : 'text'}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`w-full px-3 py-2.5 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50 ${disabled ? 'opacity-50' : ''}`}
      style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
    />
  </div>
);

// Mobile Select Component
const MobileSelect = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-xs text-gray-400 mb-1">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50 appearance-none"
      style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
    >
      <option value="" className="bg-gray-900">Select...</option>
      {options.map(opt => (
        <option key={opt} value={opt} className="bg-gray-900">{opt}</option>
      ))}
    </select>
  </div>
);

// Mobile Toggle Component
const MobileToggle = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
    <span className="text-sm text-gray-300">{label}</span>
    <button
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 rounded-full transition-all relative ${checked ? 'bg-yellow-500' : 'bg-gray-600'}`}
    >
      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${checked ? 'left-6' : 'left-0.5'}`} />
    </button>
  </div>
);

// Result Card Component
const ResultCard = ({ label, value, highlight }) => (
  <div className={`p-3 rounded-lg text-center ${highlight ? 'bg-yellow-500/20' : 'bg-white/5'}`}>
    <p className="text-xs text-gray-400">{label}</p>
    <p className={`text-lg font-bold ${highlight ? 'text-yellow-400' : 'text-white'}`}>{value}</p>
  </div>
);

export default MobilePAYECalculator;
