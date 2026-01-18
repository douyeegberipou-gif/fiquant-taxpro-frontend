import React, { useState } from 'react';
import axios from 'axios';
import { Receipt, Calculator, DollarSign, FileText, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * MOBILE-ONLY VAT Calculator
 */
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = BACKEND_URL ? `${BACKEND_URL}/api` : null;

export const MobileVATCalculator = () => {
  const [expandedSection, setExpandedSection] = useState('transaction');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const [vatInput, setVatInput] = useState({
    transaction_type: 'sale',
    amount: '',
    is_vat_inclusive: false,
    item_category: 'standard'
  });

  const handleInputChange = (field, value) => {
    setVatInput(prev => ({ ...prev, [field]: value }));
  };

  const calculateVAT = async () => {
    if (!vatInput.amount) {
      alert('Please enter an amount');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...vatInput,
        amount: parseFloat(vatInput.amount) || 0
      };

      const response = await axios.post(`${API}/calculate-vat`, payload);
      setResult(response.data);
      setExpandedSection('result');
    } catch (error) {
      console.error('Error calculating VAT:', error);
      alert(error.response?.data?.detail || 'Error calculating VAT.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setVatInput({
      transaction_type: 'sale',
      amount: '',
      is_vat_inclusive: false,
      item_category: 'standard'
    });
    setResult(null);
    setExpandedSection('transaction');
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return '₦0';
    return '₦' + new Intl.NumberFormat('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
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

  const categories = [
    { value: 'standard', label: 'Standard (7.5% VAT)' },
    { value: 'exempt', label: 'Exempt (0% VAT)' },
    { value: 'zero_rated', label: 'Zero-Rated (0% VAT)' }
  ];

  return (
    <div 
      className="min-h-screen pb-24"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.9)), url('https://customer-assets.emergentagent.com/job_naija-taxcalc/artifacts/iakm5flx_Gemini_Generated_Image_k1jwlnk1jwlnk1jw%20%283%29.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="p-4 pt-32 space-y-4">
        {/* Results */}
        {result && (
          <div className="rounded-xl overflow-hidden" style={glassStyle}>
            <div className="p-4 bg-gradient-to-r from-orange-500/30 to-orange-600/20">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-orange-500/30 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-orange-400" />
                </div>
                <span className="font-semibold text-white">VAT Calculation Results</span>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg text-center bg-orange-500/20">
                  <p className="text-xs text-gray-400">VAT Amount</p>
                  <p className="text-xl font-bold text-orange-400">{formatCurrency(result.vat_amount)}</p>
                </div>
                <div className="p-3 rounded-lg text-center bg-white/5">
                  <p className="text-xs text-gray-400">VAT Rate</p>
                  <p className="text-xl font-bold text-white">{result.vat_rate}%</p>
                </div>
              </div>
              <div className="p-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>Net Amount:</span>
                    <span className="text-white">{formatCurrency(result.net_amount)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>VAT ({result.vat_rate}%):</span>
                    <span className="text-orange-400">+{formatCurrency(result.vat_amount)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300 border-t border-white/10 pt-2">
                    <span className="font-semibold">Gross Amount:</span>
                    <span className="text-white font-bold">{formatCurrency(result.gross_amount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Details */}
        <div className="rounded-xl overflow-hidden" style={glassStyle}>
          <button
            onClick={() => toggleSection('transaction')}
            className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-white/20 to-white/10"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Receipt className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-white">Transaction Details</span>
            </div>
            {expandedSection === 'transaction' ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
          </button>
          {expandedSection === 'transaction' && (
            <div className="p-4 pt-2 space-y-4">
              {/* Transaction Type */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">Transaction Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {['sale', 'purchase'].map(type => (
                    <button
                      key={type}
                      onClick={() => handleInputChange('transaction_type', type)}
                      className={`py-3 rounded-lg font-medium text-sm transition-all ${
                        vatInput.transaction_type === type
                          ? 'bg-orange-500 text-white'
                          : 'bg-white/10 text-gray-300 border border-white/20'
                      }`}
                    >
                      {type === 'sale' ? 'Sale (Output VAT)' : 'Purchase (Input VAT)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Amount (₦) *</label>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Enter amount"
                  value={vatInput.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  className="w-full px-3 py-3 rounded-lg text-white placeholder-gray-500 text-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                />
              </div>

              {/* VAT Inclusive Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <span className="text-sm text-gray-300">Amount is VAT inclusive?</span>
                <button
                  onClick={() => handleInputChange('is_vat_inclusive', !vatInput.is_vat_inclusive)}
                  className={`w-12 h-6 rounded-full transition-all ${
                    vatInput.is_vat_inclusive ? 'bg-orange-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    vatInput.is_vat_inclusive ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">Item Category</label>
                <div className="space-y-2">
                  {categories.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => handleInputChange('item_category', cat.value)}
                      className={`w-full py-3 px-4 rounded-lg text-left text-sm transition-all ${
                        vatInput.item_category === cat.value
                          ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                          : 'bg-white/5 border-white/10 text-gray-300'
                      } border`}
                    >
                      {cat.label}
                    </button>
                  ))}
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
            onClick={calculateVAT}
            disabled={loading || !vatInput.amount}
            className="flex-[2] py-3 px-4 rounded-xl font-semibold flex items-center justify-center space-x-2 active:scale-95 transition-transform disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: 'white' }}
          >
            <Calculator className="h-5 w-5" />
            <span>{loading ? 'Calculating...' : 'Calculate VAT'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileVATCalculator;
