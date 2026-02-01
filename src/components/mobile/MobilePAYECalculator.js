import React, { useState } from 'react';
import axios from 'axios';
import { Users, Calculator, DollarSign, PiggyBank, FileText, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { MobileAdBanner } from './MobileAdBanner';

/**
 * MOBILE-ONLY PAYE Calculator
 * Optimized for touch interfaces with collapsible sections
 */
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = BACKEND_URL ? `${BACKEND_URL}/api` : null;

export const MobilePAYECalculator = () => {
  const [expandedSection, setExpandedSection] = useState('income');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const [taxInput, setTaxInput] = useState({
    // Staff Information
    staff_name: '',
    tin: '',
    month: '',
    year: '2026',
    state_of_residence: '',
    // Income Details
    basic_salary: '',
    transport_allowance: '',
    housing_allowance: '',
    meal_allowance: '',
    other_allowances: '',
    // Benefits in Kind (BIK) - NTA 2025
    bik_vehicle_value: '',
    bik_housing_value: '',
    bonus: '',
    // Reliefs
    pension_contribution: '',
    nhf_contribution: '',
    life_insurance_premium: '',
    health_insurance_premium: '',
    nhis_contribution: '',
    annual_rent: ''
  });

  const handleInputChange = (field, value) => {
    setTaxInput(prev => ({ ...prev, [field]: value }));
  };

  const calculateTax = async () => {
    if (!taxInput.basic_salary) {
      alert('Please enter a basic salary');
      return;
    }

    setLoading(true);
    try {
      const numericInput = {};
      Object.keys(taxInput).forEach(key => {
        if (['staff_name', 'tin', 'month', 'year', 'state_of_residence'].includes(key)) {
          numericInput[key] = taxInput[key];
        } else {
          numericInput[key] = parseFloat(taxInput[key]) || 0;
        }
      });

      const response = await axios.post(`${API}/calculate-paye`, numericInput);
      setResult(response.data[0]);
      setExpandedSection('result');
    } catch (error) {
      console.error('Error calculating tax:', error);
      alert(error.response?.data?.detail || 'Error calculating tax. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTaxInput({
      staff_name: '',
      tin: '',
      month: '',
      year: '2026',
      state_of_residence: '',
      basic_salary: '',
      transport_allowance: '',
      housing_allowance: '',
      meal_allowance: '',
      other_allowances: '',
      bik_vehicle_value: '',
      bik_housing_value: '',
      bonus: '',
      pension_contribution: '',
      nhf_contribution: '',
      life_insurance_premium: '',
      health_insurance_premium: '',
      nhis_contribution: '',
      annual_rent: ''
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

  // Glassmorphism style
  const glassStyle = {
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  };

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = ['2024', '2025', '2026'];
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
        {/* Mobile Ad Banner */}
        <MobileAdBanner placement="calculator" />
        {/* Results Section - Show first if there are results */}
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

              {/* Benefits in Kind Breakdown - Only show if any BIK values exist */}
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
                  {((result.annual_tax / result.gross_annual_income) * 100).toFixed(2)}%
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
            <MobileInput
              label="Name"
              placeholder="Full Name"
              value={taxInput.staff_name}
              onChange={(v) => handleInputChange('staff_name', v)}
            />
            <MobileInput
              label="TIN"
              placeholder="Tax ID Number"
              value={taxInput.tin}
              onChange={(v) => handleInputChange('tin', v)}
            />
            <div className="grid grid-cols-2 gap-3">
              <MobileSelect
                label="Month"
                value={taxInput.month}
                onChange={(v) => handleInputChange('month', v)}
                options={months}
              />
              <MobileSelect
                label="Year"
                value={taxInput.year}
                onChange={(v) => handleInputChange('year', v)}
                options={years}
              />
            </div>
            <MobileSelect
              label="State of Residence"
              value={taxInput.state_of_residence}
              onChange={(v) => handleInputChange('state_of_residence', v)}
              options={states}
            />
          </div>
        </CollapsibleSection>

        {/* Income Section */}
        <CollapsibleSection
          title="Monthly Income"
          icon={DollarSign}
          isExpanded={expandedSection === 'income'}
          onToggle={() => toggleSection('income')}
          glassStyle={glassStyle}
          required
        >
          <div className="space-y-3">
            <MobileInput
              label="Basic Salary *"
              placeholder="₦500,000"
              value={taxInput.basic_salary}
              onChange={(v) => handleInputChange('basic_salary', v)}
              type="number"
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <MobileInput
                label="Transport"
                placeholder="₦50,000"
                value={taxInput.transport_allowance}
                onChange={(v) => handleInputChange('transport_allowance', v)}
                type="number"
              />
              <MobileInput
                label="Housing"
                placeholder="₦200,000"
                value={taxInput.housing_allowance}
                onChange={(v) => handleInputChange('housing_allowance', v)}
                type="number"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MobileInput
                label="Meal"
                placeholder="₦30,000"
                value={taxInput.meal_allowance}
                onChange={(v) => handleInputChange('meal_allowance', v)}
                type="number"
              />
              <MobileInput
                label="Other"
                placeholder="₦25,000"
                value={taxInput.other_allowances}
                onChange={(v) => handleInputChange('other_allowances', v)}
                type="number"
              />
            </div>
            
            {/* Benefits in Kind (BIK) - NTA 2025 */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <p className="text-xs text-purple-300 mb-2 font-semibold">Benefits in Kind (NTA 2025)</p>
              <p className="text-[10px] text-purple-200 mb-3">Vehicle: 5% taxable | Housing: 20% taxable | Bonus: 100% taxable</p>
              <div className="grid grid-cols-3 gap-2">
                <MobileInput
                  label="Vehicle BIK"
                  placeholder="₦0"
                  value={taxInput.bik_vehicle_value}
                  onChange={(v) => handleInputChange('bik_vehicle_value', v)}
                  type="number"
                />
                <MobileInput
                  label="Housing BIK"
                  placeholder="₦0"
                  value={taxInput.bik_housing_value}
                  onChange={(v) => handleInputChange('bik_housing_value', v)}
                  type="number"
                />
                <MobileInput
                  label="Bonus"
                  placeholder="₦0"
                  value={taxInput.bonus}
                  onChange={(v) => handleInputChange('bonus', v)}
                  type="number"
                />
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Reliefs Section */}
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
            <div className="grid grid-cols-2 gap-3">
              <MobileInput
                label="Pension"
                placeholder="Auto (8%)"
                value={taxInput.pension_contribution}
                onChange={(v) => handleInputChange('pension_contribution', v)}
                type="number"
              />
              <MobileInput
                label="NHF"
                placeholder="Auto (2.5%)"
                value={taxInput.nhf_contribution}
                onChange={(v) => handleInputChange('nhf_contribution', v)}
                type="number"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MobileInput
                label="Life Insurance"
                placeholder="₦10,000"
                value={taxInput.life_insurance_premium}
                onChange={(v) => handleInputChange('life_insurance_premium', v)}
                type="number"
              />
              <MobileInput
                label="Health Insurance"
                placeholder="₦15,000"
                value={taxInput.health_insurance_premium}
                onChange={(v) => handleInputChange('health_insurance_premium', v)}
                type="number"
              />
            </div>
            <MobileInput
              label="Annual Rent Paid"
              placeholder="₦0"
              value={taxInput.annual_rent}
              onChange={(v) => handleInputChange('annual_rent', v)}
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
    <div 
      className="rounded-xl overflow-hidden"
      style={glassStyle}
    >
      <button
        onClick={onToggle}
        className={`w-full p-4 flex items-center justify-between bg-gradient-to-r ${accentColors[accentColor]}`}
      >
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${accentColor === 'yellow' ? 'bg-yellow-500/30' : 'bg-white/10'}`}>
            <Icon className={`h-4 w-4 ${accentColor === 'yellow' ? 'text-yellow-400' : 'text-white'}`} />
          </div>
          <span className="font-semibold text-white">{title}</span>
          {required && <span className="text-red-400 text-xs">*Required</span>}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>
      {isExpanded && (
        <div className="p-4 pt-2">
          {children}
        </div>
      )}
    </div>
  );
};

// Mobile Input Component
const MobileInput = ({ label, placeholder, value, onChange, type = 'text', required }) => (
  <div>
    <label className="block text-xs text-gray-400 mb-1">{label}</label>
    <input
      type={type}
      inputMode={type === 'number' ? 'numeric' : 'text'}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
      style={{
        background: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}
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
      style={{
        background: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}
    >
      <option value="" className="bg-gray-900">Select...</option>
      {options.map(opt => (
        <option key={opt} value={opt} className="bg-gray-900">{opt}</option>
      ))}
    </select>
  </div>
);

// Result Card Component
const ResultCard = ({ label, value, highlight }) => (
  <div 
    className={`p-3 rounded-lg text-center ${highlight ? 'bg-yellow-500/20' : 'bg-white/5'}`}
  >
    <p className="text-xs text-gray-400">{label}</p>
    <p className={`text-lg font-bold ${highlight ? 'text-yellow-400' : 'text-white'}`}>{value}</p>
  </div>
);

export default MobilePAYECalculator;
