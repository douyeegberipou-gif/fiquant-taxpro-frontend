import React, { useState } from 'react';
import axios from 'axios';
import { Building2, Calculator, DollarSign, FileText, RotateCcw, ChevronDown, ChevronUp, TrendingUp, AlertTriangle } from 'lucide-react';
import { MobileAdBanner } from './MobileAdBanner';

/**
 * MOBILE-ONLY CIT Calculator
 * Optimized for touch interfaces with collapsible sections
 */
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = BACKEND_URL ? `${BACKEND_URL}/api` : null;

export const MobileCITCalculator = () => {
  const [expandedSection, setExpandedSection] = useState('company');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const [citInput, setCitInput] = useState({
    company_name: '',
    tin: '',
    year_of_assessment: '2026',
    tax_year: '2025',
    annual_turnover: '',
    total_fixed_assets: '',
    gross_income: '',
    other_income: '',
    cost_of_goods_sold: '',
    staff_costs: '',
    rent_expenses: '',
    professional_fees: '',
    depreciation: '',
    other_deductible_expenses: '',
    carry_forward_losses: ''
  });

  const handleInputChange = (field, value) => {
    setCitInput(prev => ({ ...prev, [field]: value }));
  };

  const calculateTax = async () => {
    if (!citInput.annual_turnover && !citInput.gross_income) {
      alert('Please enter turnover or gross income');
      return;
    }

    setLoading(true);
    try {
      const numericInput = {};
      Object.keys(citInput).forEach(key => {
        if (['company_name', 'tin', 'year_of_assessment', 'tax_year'].includes(key)) {
          numericInput[key] = citInput[key];
        } else {
          numericInput[key] = parseFloat(citInput[key]) || 0;
        }
      });

      const response = await axios.post(`${API}/calculate-cit`, numericInput);
      setResult(response.data);
      setExpandedSection('result');
    } catch (error) {
      console.error('Error calculating CIT:', error);
      alert(error.response?.data?.detail || 'Error calculating CIT. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCitInput({
      company_name: '',
      tin: '',
      year_of_assessment: '2026',
      tax_year: '2025',
      annual_turnover: '',
      total_fixed_assets: '',
      gross_income: '',
      other_income: '',
      cost_of_goods_sold: '',
      staff_costs: '',
      rent_expenses: '',
      professional_fees: '',
      depreciation: '',
      other_deductible_expenses: '',
      carry_forward_losses: ''
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
        {/* Mobile Ad Banner */}
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
              {/* Company Classification */}
              <div className="p-3 rounded-lg text-center" style={{ background: 'rgba(139, 92, 246, 0.2)' }}>
                <p className="text-xs text-gray-400">Company Classification</p>
                <p className="text-lg font-bold text-purple-400">{result.company_size || 'Medium'}</p>
                <p className="text-xs text-gray-400">Tax Rate: {result.tax_rate || 20}%</p>
              </div>

              {/* Key Results */}
              <div className="grid grid-cols-2 gap-3">
                <ResultCard label="CIT Payable" value={formatCurrency(result.cit_liability)} highlight />
                <ResultCard label="Taxable Profit" value={formatCurrency(result.taxable_profit)} />
                <ResultCard label="Gross Profit" value={formatCurrency(result.gross_profit)} />
                <ResultCard label="Total Deductions" value={formatCurrency(result.total_deductions)} />
              </div>

              {/* Breakdown */}
              <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>
                <h4 className="text-sm font-semibold text-purple-400 mb-2">Calculation Breakdown</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-gray-300">
                    <span>Gross Income:</span>
                    <span className="text-white">{formatCurrency(result.gross_income)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Allowable Expenses:</span>
                    <span className="text-green-400">-{formatCurrency(result.total_deductions)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Capital Allowances:</span>
                    <span className="text-green-400">-{formatCurrency(result.capital_allowances || 0)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300 border-t border-white/10 pt-1 mt-1">
                    <span className="font-semibold">Net CIT:</span>
                    <span className="text-purple-400 font-bold">{formatCurrency(result.cit_liability)}</span>
                  </div>
                </div>
              </div>
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
            <MobileInput
              label="Company Name"
              placeholder="ABC Nigeria Ltd"
              value={citInput.company_name}
              onChange={(v) => handleInputChange('company_name', v)}
            />
            <MobileInput
              label="TIN"
              placeholder="Tax ID Number"
              value={citInput.tin}
              onChange={(v) => handleInputChange('tin', v)}
            />
            <div className="grid grid-cols-2 gap-3">
              <MobileInput
                label="Assessment Year"
                placeholder="2026"
                value={citInput.year_of_assessment}
                onChange={(v) => handleInputChange('year_of_assessment', v)}
              />
              <MobileInput
                label="Tax Year"
                placeholder="2025"
                value={citInput.tax_year}
                onChange={(v) => handleInputChange('tax_year', v)}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Revenue Section */}
        <CollapsibleSection
          title="Revenue & Assets"
          icon={TrendingUp}
          isExpanded={expandedSection === 'revenue'}
          onToggle={() => toggleSection('revenue')}
          glassStyle={glassStyle}
          required
        >
          <div className="space-y-3">
            <MobileInput
              label="Annual Turnover *"
              placeholder="₦50,000,000"
              value={citInput.annual_turnover}
              onChange={(v) => handleInputChange('annual_turnover', v)}
              type="number"
              required
            />
            <MobileInput
              label="Total Fixed Assets"
              placeholder="₦10,000,000"
              value={citInput.total_fixed_assets}
              onChange={(v) => handleInputChange('total_fixed_assets', v)}
              type="number"
            />
            <div className="grid grid-cols-2 gap-3">
              <MobileInput
                label="Gross Income"
                placeholder="₦45,000,000"
                value={citInput.gross_income}
                onChange={(v) => handleInputChange('gross_income', v)}
                type="number"
              />
              <MobileInput
                label="Other Income"
                placeholder="₦0"
                value={citInput.other_income}
                onChange={(v) => handleInputChange('other_income', v)}
                type="number"
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Expenses Section */}
        <CollapsibleSection
          title="Deductible Expenses"
          icon={DollarSign}
          isExpanded={expandedSection === 'expenses'}
          onToggle={() => toggleSection('expenses')}
          glassStyle={glassStyle}
        >
          <div className="space-y-3">
            <MobileInput
              label="Cost of Goods Sold"
              placeholder="₦20,000,000"
              value={citInput.cost_of_goods_sold}
              onChange={(v) => handleInputChange('cost_of_goods_sold', v)}
              type="number"
            />
            <div className="grid grid-cols-2 gap-3">
              <MobileInput
                label="Staff Costs"
                placeholder="₦5,000,000"
                value={citInput.staff_costs}
                onChange={(v) => handleInputChange('staff_costs', v)}
                type="number"
              />
              <MobileInput
                label="Rent Expenses"
                placeholder="₦2,000,000"
                value={citInput.rent_expenses}
                onChange={(v) => handleInputChange('rent_expenses', v)}
                type="number"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MobileInput
                label="Professional Fees"
                placeholder="₦500,000"
                value={citInput.professional_fees}
                onChange={(v) => handleInputChange('professional_fees', v)}
                type="number"
              />
              <MobileInput
                label="Depreciation"
                placeholder="₦1,000,000"
                value={citInput.depreciation}
                onChange={(v) => handleInputChange('depreciation', v)}
                type="number"
              />
            </div>
            <MobileInput
              label="Other Deductible Expenses"
              placeholder="₦0"
              value={citInput.other_deductible_expenses}
              onChange={(v) => handleInputChange('other_deductible_expenses', v)}
              type="number"
            />
            <MobileInput
              label="Carry Forward Losses"
              placeholder="₦0"
              value={citInput.carry_forward_losses}
              onChange={(v) => handleInputChange('carry_forward_losses', v)}
              type="number"
            />
          </div>
        </CollapsibleSection>

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
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white'
            }}
          >
            <Calculator className="h-5 w-5" />
            <span>{loading ? 'Calculating...' : 'Calculate CIT'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Reuse components from PAYE
const CollapsibleSection = ({ title, icon: Icon, isExpanded, onToggle, children, glassStyle, required, accentColor = 'white' }) => {
  const accentColors = {
    white: 'from-white/20 to-white/10',
    purple: 'from-purple-500/30 to-purple-600/20'
  };

  return (
    <div className="rounded-xl overflow-hidden" style={glassStyle}>
      <button
        onClick={onToggle}
        className={`w-full p-4 flex items-center justify-between bg-gradient-to-r ${accentColors[accentColor]}`}
      >
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

const ResultCard = ({ label, value, highlight }) => (
  <div className={`p-3 rounded-lg text-center ${highlight ? 'bg-purple-500/20' : 'bg-white/5'}`}>
    <p className="text-xs text-gray-400">{label}</p>
    <p className={`text-lg font-bold ${highlight ? 'text-purple-400' : 'text-white'}`}>{value}</p>
  </div>
);

export default MobileCITCalculator;
