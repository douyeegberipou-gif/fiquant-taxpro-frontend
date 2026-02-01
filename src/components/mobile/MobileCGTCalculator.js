import React, { useState } from 'react';
import axios from 'axios';
import { TrendingUp, Calculator, DollarSign, FileText, RotateCcw, ChevronDown, ChevronUp, Calendar, Shield, CheckCircle, Building2, Home, Car } from 'lucide-react';
import { MobileAdBanner } from './MobileAdBanner';

/**
 * MOBILE-ONLY CGT Calculator with NTA 2025 Exemptions
 */
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = BACKEND_URL ? `${BACKEND_URL}/api` : null;

export const MobileCGTCalculator = () => {
  const [expandedSection, setExpandedSection] = useState('asset');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const [cgtInput, setCgtInput] = useState({
    asset_type: 'real_estate',
    taxpayer_type: 'individual',
    acquisition_cost: '',
    disposal_proceeds: '',
    acquisition_date: '',
    disposal_date: '',
    improvement_costs: '',
    selling_expenses: '',
    // NTA 2025 Exemption options
    is_primary_residence: false,
    is_personal_vehicle: false,
    company_turnover: ''
  });

  const handleInputChange = (field, value) => {
    setCgtInput(prev => ({ ...prev, [field]: value }));
  };

  const calculateCGT = async () => {
    if (!cgtInput.acquisition_cost || !cgtInput.disposal_proceeds) {
      alert('Please enter acquisition cost and disposal proceeds');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...cgtInput,
        acquisition_cost: parseFloat(cgtInput.acquisition_cost) || 0,
        disposal_proceeds: parseFloat(cgtInput.disposal_proceeds) || 0,
        improvement_costs: parseFloat(cgtInput.improvement_costs) || 0,
        selling_expenses: parseFloat(cgtInput.selling_expenses) || 0,
        company_turnover: parseFloat(cgtInput.company_turnover) || 0
      };

      const response = await axios.post(`${API}/calculate-cgt`, payload);
      setResult(response.data);
      setExpandedSection('result');
    } catch (error) {
      console.error('Error calculating CGT:', error);
      alert(error.response?.data?.detail || 'Error calculating CGT.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCgtInput({
      asset_type: 'real_estate',
      taxpayer_type: 'individual',
      acquisition_cost: '',
      disposal_proceeds: '',
      acquisition_date: '',
      disposal_date: '',
      improvement_costs: '',
      selling_expenses: '',
      is_primary_residence: false,
      is_personal_vehicle: false,
      company_turnover: ''
    });
    setResult(null);
    setExpandedSection('asset');
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

  const assetTypes = [
    { value: 'real_estate', label: 'Real Estate / Property' },
    { value: 'shares', label: 'Shares / Securities' },
    { value: 'crypto', label: 'Cryptocurrency / Digital Assets' },
    { value: 'other', label: 'Other Assets (Vehicles, Personal Effects)' }
  ];

  const taxpayerTypes = [
    { value: 'individual', label: 'Individual', description: 'Progressive rates 0-25%' },
    { value: 'company', label: 'Company', description: 'Flat rate 30%' }
  ];

  return (
    <div 
      className="min-h-screen pb-24"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.9)), url('https://customer-assets.emergentagent.com/job_naija-taxcalc/artifacts/3l8sul24_Gemini_Generated_Image_bhxj3sbhxj3sbhxj.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="p-4 pt-40 space-y-4">
        {/* Mobile Ad Banner */}
        <MobileAdBanner placement="calculator" />
        {/* Results */}
        {result && (
          <div className="rounded-xl overflow-hidden" style={glassStyle}>
            <div className={`p-4 ${result.is_exempt 
              ? 'bg-gradient-to-r from-green-500/30 to-emerald-600/20' 
              : 'bg-gradient-to-r from-blue-500/30 to-blue-600/20'}`}>
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  result.is_exempt ? 'bg-green-500/30' : 'bg-blue-500/30'
                }`}>
                  {result.is_exempt ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <FileText className="h-4 w-4 text-blue-400" />
                  )}
                </div>
                <span className="font-semibold text-white">
                  {result.is_exempt ? 'CGT Exemption Applied!' : 'CGT Calculation Results'}
                </span>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {/* Exemption Banner */}
              {result.is_exempt && (
                <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/30">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="h-5 w-5 text-green-400" />
                    <span className="font-semibold text-green-400">Tax Exempt</span>
                  </div>
                  <p className="text-sm text-green-300">{result.exemption_reason}</p>
                  {result.tax_saved > 0 && (
                    <p className="text-xs text-green-400 mt-2">
                      You saved: <span className="font-bold">{formatCurrency(result.tax_saved)}</span> in CGT
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-lg text-center ${result.is_exempt ? 'bg-green-500/20' : 'bg-blue-500/20'}`}>
                  <p className="text-xs text-gray-400">CGT Payable</p>
                  <p className={`text-xl font-bold ${result.is_exempt ? 'text-green-400' : 'text-blue-400'}`}>
                    {result.is_exempt ? '₦0' : formatCurrency(result.cgt_amount)}
                  </p>
                </div>
                <div className="p-3 rounded-lg text-center bg-white/5">
                  <p className="text-xs text-gray-400">Effective Rate</p>
                  <p className="text-xl font-bold text-white">
                    {result.is_exempt ? '0%' : `${result.cgt_rate}%`}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {result.is_exempt ? 'Exempt' : (result.rate_type === 'flat_30%' ? 'Company Rate' : 'Progressive')}
                  </p>
                </div>
              </div>
              <div className="p-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>Disposal Proceeds:</span>
                    <span className="text-white">{formatCurrency(result.disposal_proceeds)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Total Cost:</span>
                    <span className="text-red-400">-{formatCurrency(result.total_cost)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300 border-t border-white/10 pt-2">
                    <span className="font-semibold">Capital Gain:</span>
                    <span className={`font-bold ${result.capital_gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(result.capital_gain)}
                    </span>
                  </div>
                </div>
              </div>
              {result.capital_gain < 0 && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-sm text-green-400">No CGT payable - you have a capital loss</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Asset Details */}
        <div className="rounded-xl overflow-hidden" style={glassStyle}>
          <button
            onClick={() => toggleSection('asset')}
            className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-white/20 to-white/10"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-white">Asset Details</span>
            </div>
            {expandedSection === 'asset' ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
          </button>
          {expandedSection === 'asset' && (
            <div className="p-4 pt-2 space-y-4">
              {/* Taxpayer Type - Critical for CGT rate */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">Taxpayer Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  {taxpayerTypes.map(type => (
                    <button
                      key={type.value}
                      onClick={() => handleInputChange('taxpayer_type', type.value)}
                      className={`py-3 px-3 rounded-lg text-center text-sm transition-all ${
                        cgtInput.taxpayer_type === type.value
                          ? 'bg-blue-500/30 border-blue-500 text-blue-400'
                          : 'bg-white/5 border-white/10 text-gray-300'
                      } border`}
                    >
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs opacity-70 mt-1">{type.description}</div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  NTA 2025: Companies pay 30% flat rate, individuals pay progressive rates (0-25%)
                </p>
              </div>

              {/* Asset Type */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">Asset Type</label>
                <div className="space-y-2">
                  {assetTypes.map(type => (
                    <button
                      key={type.value}
                      onClick={() => handleInputChange('asset_type', type.value)}
                      className={`w-full py-3 px-4 rounded-lg text-left text-sm transition-all ${
                        cgtInput.asset_type === type.value
                          ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                          : 'bg-white/5 border-white/10 text-gray-300'
                      } border`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Exemption Options - Individual Only */}
              {cgtInput.taxpayer_type === 'individual' && (
                <div className="space-y-3 pt-3 border-t border-white/10">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-green-400" />
                    <label className="text-xs text-green-400 font-medium">NTA 2025 Exemptions</label>
                  </div>
                  
                  {/* Primary Residence Toggle */}
                  {cgtInput.asset_type === 'real_estate' && (
                    <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div className="flex items-center space-x-2">
                        <Home className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-300">Primary Residence?</span>
                      </div>
                      <button
                        onClick={() => handleInputChange('is_primary_residence', !cgtInput.is_primary_residence)}
                        className={`w-12 h-6 rounded-full transition-all ${
                          cgtInput.is_primary_residence ? 'bg-green-500' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          cgtInput.is_primary_residence ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                  )}

                  {/* Personal Vehicle Toggle */}
                  {cgtInput.asset_type === 'other' && (
                    <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div className="flex items-center space-x-2">
                        <Car className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-300">Personal Vehicle? (max 2)</span>
                      </div>
                      <button
                        onClick={() => handleInputChange('is_personal_vehicle', !cgtInput.is_personal_vehicle)}
                        className={`w-12 h-6 rounded-full transition-all ${
                          cgtInput.is_personal_vehicle ? 'bg-green-500' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          cgtInput.is_personal_vehicle ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                  )}

                  {/* Small Investor Relief Info */}
                  {(cgtInput.asset_type === 'shares' || cgtInput.asset_type === 'crypto') && (
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <p className="text-xs text-blue-300">
                        <strong>Small Investor Relief:</strong> Automatic exemption if proceeds &lt;₦150M AND gains ≤₦10M
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Company Turnover - For Small Company Exemption */}
              {cgtInput.taxpayer_type === 'company' && (
                <div className="space-y-3 pt-3 border-t border-white/10">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-green-400" />
                    <label className="text-xs text-green-400 font-medium">Small Company Exemption</label>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Annual Turnover (for exemption check)</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="₦50,000,000 or less = exempt"
                      value={cgtInput.company_turnover}
                      onChange={(e) => handleInputChange('company_turnover', e.target.value)}
                      className="w-full px-3 py-3 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
                      style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                    />
                    <p className="text-xs text-gray-500 mt-1">Small companies (turnover ≤₦50M) pay 0% CGT</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Financial Details */}
        <div className="rounded-xl overflow-hidden" style={glassStyle}>
          <button
            onClick={() => toggleSection('financial')}
            className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-white/20 to-white/10"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-white">Financial Details</span>
              <span className="text-red-400 text-xs">*Required</span>
            </div>
            {expandedSection === 'financial' ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
          </button>
          {expandedSection === 'financial' && (
            <div className="p-4 pt-2 space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Acquisition Cost (Purchase Price) *</label>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="₦50,000,000"
                  value={cgtInput.acquisition_cost}
                  onChange={(e) => handleInputChange('acquisition_cost', e.target.value)}
                  className="w-full px-3 py-3 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Disposal Proceeds (Sale Price) *</label>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="₦80,000,000"
                  value={cgtInput.disposal_proceeds}
                  onChange={(e) => handleInputChange('disposal_proceeds', e.target.value)}
                  className="w-full px-3 py-3 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Improvement Costs</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="₦0"
                    value={cgtInput.improvement_costs}
                    onChange={(e) => handleInputChange('improvement_costs', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Selling Expenses</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="₦0"
                    value={cgtInput.selling_expenses}
                    onChange={(e) => handleInputChange('selling_expenses', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

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
            onClick={calculateCGT}
            disabled={loading || !cgtInput.acquisition_cost || !cgtInput.disposal_proceeds}
            className="flex-[2] py-3 px-4 rounded-xl font-semibold flex items-center justify-center space-x-2 active:scale-95 transition-transform disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white' }}
          >
            <Calculator className="h-5 w-5" />
            <span>{loading ? 'Calculating...' : 'Calculate CGT'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileCGTCalculator;
