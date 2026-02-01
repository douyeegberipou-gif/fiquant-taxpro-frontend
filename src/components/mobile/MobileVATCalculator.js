import React, { useState } from 'react';
import axios from 'axios';
import { Receipt, Calculator, DollarSign, FileText, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { MobileAdBanner } from './MobileAdBanner';

/**
 * MOBILE-ONLY VAT Calculator
 */
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = BACKEND_URL ? `${BACKEND_URL}/api` : null;

// Transaction types with VAT categories - matches web app
const transactionTypes = {
  // VAT EXEMPT
  'medical_services': { name: 'Medical Services', category: 'exempt', description: 'Healthcare, hospital services' },
  'educational_services': { name: 'Educational Services', category: 'exempt', description: 'Tuition fees for education' },
  'basic_food_items': { name: 'Basic Food Items', category: 'exempt', description: 'Staple foods, agro products' },
  'medical_pharmaceuticals': { name: 'Medical & Pharmaceutical', category: 'exempt', description: 'Medical and pharmaceutical items' },
  'agricultural_inputs': { name: 'Agricultural Inputs', category: 'exempt', description: 'Fertilizers, seeds, veterinary medicines' },
  'baby_products': { name: 'Baby Products', category: 'exempt', description: 'Baby food, clothing' },
  'petroleum_products': { name: 'Petroleum Products', category: 'exempt', description: 'Diesel, fuel, kerosene' },
  'renewable_energy': { name: 'Renewable Energy Equipment', category: 'exempt', description: 'Solar panels, wind turbines' },
  'electric_vehicles': { name: 'Electric Vehicles', category: 'exempt', description: 'EVs and parts' },
  'land_transactions': { name: 'Land Transactions', category: 'exempt', description: 'Sale, lease of land' },
  'shared_transport': { name: 'Shared Passenger Transport', category: 'exempt', description: 'Shared road transport' },
  
  // ZERO-RATED
  'non_oil_exports': { name: 'Non-Oil Exports', category: 'zero_rated', description: 'Exported goods (non-oil)' },
  'diplomatic_purchases': { name: 'Diplomatic Purchases', category: 'zero_rated', description: 'Goods for diplomats' },
  'humanitarian_projects': { name: 'Humanitarian Projects', category: 'zero_rated', description: 'Donor-funded projects' },
  'exported_services': { name: 'Exported Services', category: 'zero_rated', description: 'Services exported abroad' },
  
  // STANDARD RATED (7.5%)
  'professional_services': { name: 'Professional Services', category: 'standard', description: 'Consulting, legal, accounting' },
  'construction_services': { name: 'Construction Services', category: 'standard', description: 'Building, construction' },
  'retail_sales': { name: 'Retail Sales', category: 'standard', description: 'General retail goods' },
  'manufacturing': { name: 'Manufacturing', category: 'standard', description: 'Manufactured goods' },
  'telecommunications': { name: 'Telecommunications', category: 'standard', description: 'Telecom, internet services' },
  'financial_services': { name: 'Financial Services', category: 'standard', description: 'Banking, insurance' },
  'hospitality': { name: 'Hospitality Services', category: 'standard', description: 'Hotels, restaurants' },
  'entertainment': { name: 'Entertainment Services', category: 'standard', description: 'Cinema, sports, recreation' },
  'real_estate_rental': { name: 'Real Estate Rental', category: 'standard', description: 'Property rentals' },
  'other_standard': { name: 'Other Goods/Services', category: 'standard', description: 'Other taxable items (7.5%)' }
};

export const MobileVATCalculator = () => {
  const [expandedSection, setExpandedSection] = useState('transaction');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const [vatInput, setVatInput] = useState({
    transaction_type: '',
    amount: '',
    is_vat_inclusive: false
  });

  const handleInputChange = (field, value) => {
    setVatInput(prev => ({ ...prev, [field]: value }));
  };

  const calculateVAT = async () => {
    if (!vatInput.amount) {
      alert('Please enter an amount');
      return;
    }
    if (!vatInput.transaction_type) {
      alert('Please select a transaction type');
      return;
    }

    setLoading(true);
    try {
      // Get the category from transaction type
      const transactionConfig = transactionTypes[vatInput.transaction_type];
      const payload = {
        amount: parseFloat(vatInput.amount) || 0,
        is_vat_inclusive: vatInput.is_vat_inclusive,
        item_category: transactionConfig.category // Backend expects item_category
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
      transaction_type: '',
      amount: '',
      is_vat_inclusive: false
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

  // Group transaction types by category for better UX
  const exemptTypes = Object.entries(transactionTypes).filter(([_, v]) => v.category === 'exempt');
  const zeroRatedTypes = Object.entries(transactionTypes).filter(([_, v]) => v.category === 'zero_rated');
  const standardTypes = Object.entries(transactionTypes).filter(([_, v]) => v.category === 'standard');

  const selectedTransaction = vatInput.transaction_type ? transactionTypes[vatInput.transaction_type] : null;

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
      <div className="p-4 pt-40 space-y-4">
        {/* Mobile Ad Banner */}
        <MobileAdBanner placement="calculator" />
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
              {/* Transaction Type Dropdown */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">Transaction Type *</label>
                <select
                  value={vatInput.transaction_type}
                  onChange={(e) => handleInputChange('transaction_type', e.target.value)}
                  className="w-full px-3 py-3 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 appearance-none"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                >
                  <option value="" className="bg-gray-800">Select transaction type...</option>
                  <optgroup label="Standard Rated (7.5% VAT)" className="bg-gray-800">
                    {standardTypes.map(([key, val]) => (
                      <option key={key} value={key} className="bg-gray-800">{val.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="VAT Exempt (0%)" className="bg-gray-800">
                    {exemptTypes.map(([key, val]) => (
                      <option key={key} value={key} className="bg-gray-800">{val.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Zero-Rated (0% - Input VAT Recoverable)" className="bg-gray-800">
                    {zeroRatedTypes.map(([key, val]) => (
                      <option key={key} value={key} className="bg-gray-800">{val.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Show selected transaction info */}
              {selectedTransaction && (
                <div className="p-3 rounded-lg text-xs" style={{ background: 'rgba(249, 115, 22, 0.15)' }}>
                  <p className="text-orange-400 font-medium">{selectedTransaction.name}</p>
                  <p className="text-gray-400 mt-1">{selectedTransaction.description}</p>
                  <p className="text-gray-300 mt-1">
                    VAT Status: <span className="text-white font-medium">
                      {selectedTransaction.category === 'standard' ? '7.5% VAT' : 
                       selectedTransaction.category === 'exempt' ? 'Exempt (0%)' : 'Zero-Rated (0%)'}
                    </span>
                  </p>
                </div>
              )}

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

              {/* VAT Inclusive Toggle - Fixed width */}
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <span className="text-sm text-gray-300 flex-shrink-0">VAT inclusive?</span>
                <button
                  onClick={() => handleInputChange('is_vat_inclusive', !vatInput.is_vat_inclusive)}
                  className={`w-14 h-7 rounded-full transition-all flex-shrink-0 relative ${
                    vatInput.is_vat_inclusive ? 'bg-orange-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${
                    vatInput.is_vat_inclusive ? 'left-8' : 'left-1'
                  }`} />
                </button>
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
            disabled={loading || !vatInput.amount || !vatInput.transaction_type}
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
