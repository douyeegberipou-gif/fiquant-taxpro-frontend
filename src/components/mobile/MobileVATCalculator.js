import React, { useState } from 'react';
import { Receipt, Calculator, FileText, RotateCcw, ChevronDown, ChevronUp, Building2, Plus, Trash2, Crown, Sparkles, Info, User } from 'lucide-react';
import { MobileAdBanner } from './MobileAdBanner';
import MobileActionPanel from './MobileActionPanel';
import { useAuth } from '../../contexts/AuthContext';
import { useFeatureGate } from '../../contexts/FeatureGateContext';
import { useAdCalculation } from '../../hooks/useAdCalculation';
import VideoAdModal from '../VideoAdModal';
import MilestoneModal from '../MilestoneModal';

/**
 * MOBILE VAT Calculator - Full Feature Parity with Web Version
 * Includes: Company Info, Multiple Transactions, VAT Categories
 * + Feature Gates, Ad-supported calculations, Milestone prompts, PDF Export, Templates, User Guide
 * Note: VAT calculation is done on frontend (no backend API call) to match web version
 */

// Transaction types with VAT categories - matches web app
const transactionTypes = {
  // VAT EXEMPT
  'medical_services': { name: 'Medical Services', category: 'exempt', description: 'Healthcare, hospital services' },
  'educational_services': { name: 'Educational Services', category: 'exempt', description: 'Tuition fees for education' },
  'basic_food_items': { name: 'Basic Food Items', category: 'exempt', description: 'Staple foods, agro products' },
  'medical_pharmaceuticals': { name: 'Medical & Pharmaceutical', category: 'exempt', description: 'Medical and pharmaceutical items' },
  'agricultural_inputs': { name: 'Agricultural Inputs', category: 'exempt', description: 'Fertilizers, seeds, veterinary medicines' },
  'baby_products': { name: 'Baby Products', category: 'exempt', description: 'Baby food, clothing' },
  'sanitary_products': { name: 'Sanitary Products', category: 'exempt', description: 'Locally manufactured sanitary towels' },
  'petroleum_products': { name: 'Petroleum Products', category: 'exempt', description: 'Diesel, fuel, kerosene' },
  'renewable_energy': { name: 'Renewable Energy Equipment', category: 'exempt', description: 'Solar panels, wind turbines' },
  'assistive_devices': { name: 'Assistive Devices', category: 'exempt', description: 'Wheelchairs, disability aids' },
  'electric_vehicles': { name: 'Electric Vehicles', category: 'exempt', description: 'EVs and parts' },
  'land_transactions': { name: 'Land Transactions', category: 'exempt', description: 'Sale, lease of land' },
  'shared_transport': { name: 'Shared Passenger Transport', category: 'exempt', description: 'Shared road transport' },
  'microfinance_services': { name: 'Microfinance Services', category: 'exempt', description: 'Microfinance bank services' },
  
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

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const MobileVATCalculator = ({ onShowUpgradeModal }) => {
  const [expandedSection, setExpandedSection] = useState('company');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showMilestone, setShowMilestone] = useState(false);
  const [calculationCount, setCalculationCount] = useState(0);
  
  const { user, isAuthenticated } = useAuth();
  const { hasFeature, getUserTier } = useFeatureGate();
  const vatAdCalc = useAdCalculation('vat');
  
  const userTier = getUserTier ? getUserTier() : 'free';
  const isPaidUser = userTier === 'pro' || userTier === 'premium' || userTier === 'enterprise' || userTier === 'starter';
  
  const [vatInput, setVatInput] = useState({
    company_name: '',
    tin: '',
    tax_authority: '',
    month: '',
    transactions: [{ id: 1, description: '', transaction_type: '', amount: '' }],
    is_registered_business: true
  });

  const handleInputChange = (field, value) => {
    setVatInput(prev => ({ ...prev, [field]: value }));
  };

  const handleTransactionChange = (id, field, value) => {
    setVatInput(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => t.id === id ? { ...t, [field]: value } : t)
    }));
  };

  const addTransaction = () => {
    const newId = Math.max(...vatInput.transactions.map(t => t.id)) + 1;
    setVatInput(prev => ({
      ...prev,
      transactions: [...prev.transactions, { id: newId, description: '', transaction_type: '', amount: '' }]
    }));
  };

  const removeTransaction = (id) => {
    if (vatInput.transactions.length > 1) {
      setVatInput(prev => ({
        ...prev,
        transactions: prev.transactions.filter(t => t.id !== id)
      }));
    }
  };

  const calculateVAT = async () => {
    const validTransactions = vatInput.transactions.filter(t => t.amount && t.transaction_type);
    if (validTransactions.length === 0) {
      alert('Please add at least one transaction with type and amount');
      return;
    }

    const performCalculation = async () => {
      setLoading(true);
      try {
        const vatRate = 0.075; // 7.5% VAT rate per NTA 2025
        
        // Calculate totals by category (matching web logic)
        let totalSales = 0;
        let standardRatedSales = 0;
        let exemptTotal = 0;
        let zeroRatedTotal = 0;
        const transactionBreakdown = [];

        validTransactions.forEach(t => {
          const config = transactionTypes[t.transaction_type];
          const amount = parseFloat(t.amount) || 0;
          
          if (amount > 0 && config) {
            totalSales += amount;
            
            const transactionDetail = {
              description: t.description || config.name,
              type: config.name,
              category: config.category,
              amount: amount,
              vat_amount: 0
            };

            if (config.category === 'standard') {
              // Amount includes VAT, extract VAT
              const amountExclVat = amount / (1 + vatRate);
              const vatAmount = amount - amountExclVat;
              standardRatedSales += amountExclVat;
              transactionDetail.vat_amount = vatAmount;
              transactionDetail.amount_excl_vat = amountExclVat;
            } else if (config.category === 'exempt') {
              exemptTotal += amount;
            } else if (config.category === 'zero_rated') {
              zeroRatedTotal += amount;
            }
            
            transactionBreakdown.push(transactionDetail);
          }
        });

        // Calculate output VAT
        const outputVat = standardRatedSales * vatRate;
        
        // Create result object (frontend calculation, no backend call)
        const result = {
          total_sales: totalSales,
          standard_rated_sales: standardRatedSales,
          vat_exempt_sales: exemptTotal,
          zero_rated_sales: zeroRatedTotal,
          output_vat: outputVat,
          vat_amount: outputVat,
          vat_rate: vatRate * 100,
          company_name: vatInput.company_name,
          tin: vatInput.tin,
          month: vatInput.month,
          transaction_breakdown: transactionBreakdown,
          is_registered_business: vatInput.is_registered_business,
          timestamp: new Date().toISOString()
        };
        
        setResult(result);
        setExpandedSection('result');
        
        // Milestone prompt
        const newCount = calculationCount + 1;
        setCalculationCount(newCount);
        if (!isPaidUser && (newCount === 3 || newCount === 7 || newCount === 15)) {
          setTimeout(() => setShowMilestone(true), 1500);
        }
      } catch (error) {
        console.error('Error calculating VAT:', error);
        alert('Error calculating VAT. Please check your input values.');
      } finally {
        setLoading(false);
      }
    };
    
    vatAdCalc.handleCalculateWithAd(performCalculation);
  };

  const resetForm = () => {
    setVatInput({
      company_name: '',
      tin: '',
      tax_authority: '',
      month: '',
      transactions: [{ id: 1, description: '', transaction_type: '', amount: '' }],
      is_registered_business: true
    });
    setResult(null);
    setExpandedSection('company');
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

  // Group transaction types by category
  const exemptTypes = Object.entries(transactionTypes).filter(([_, v]) => v.category === 'exempt');
  const zeroRatedTypes = Object.entries(transactionTypes).filter(([_, v]) => v.category === 'zero_rated');
  const standardTypes = Object.entries(transactionTypes).filter(([_, v]) => v.category === 'standard');

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
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg text-center bg-orange-500/20">
                  <p className="text-xs text-gray-400">Output VAT</p>
                  <p className="text-xl font-bold text-orange-400">{formatCurrency(result.output_vat || result.vat_amount)}</p>
                </div>
                <div className="p-3 rounded-lg text-center bg-white/5">
                  <p className="text-xs text-gray-400">Total Sales</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(result.total_sales)}</p>
                </div>
              </div>

              {/* Sales Breakdown */}
              <div className="p-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>
                <h4 className="text-sm font-semibold text-orange-400 mb-2">Sales Breakdown</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-gray-300">
                    <span>Standard Rated (7.5%):</span>
                    <span className="text-white">{formatCurrency(result.standard_rated_sales)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>VAT Exempt:</span>
                    <span className="text-white">{formatCurrency(result.vat_exempt_sales)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Zero-Rated:</span>
                    <span className="text-white">{formatCurrency(result.zero_rated_sales)}</span>
                  </div>
                </div>
              </div>

              {/* Transaction Breakdown */}
              {result.transaction_breakdown && result.transaction_breakdown.length > 0 && (
                <div className="p-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <h4 className="text-sm font-semibold text-orange-400 mb-2">Transaction Details</h4>
                  <div className="space-y-2 text-xs max-h-40 overflow-y-auto">
                    {result.transaction_breakdown.map((t, idx) => (
                      <div key={idx} className="flex justify-between items-center py-1 border-b border-white/10">
                        <div>
                          <p className="text-white">{t.description}</p>
                          <p className="text-gray-500">{t.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white">{formatCurrency(t.amount)}</p>
                          <p className="text-orange-400">VAT: {formatCurrency(t.vat_amount)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Company Information */}
        <CollapsibleSection
          title="Business Information"
          icon={Building2}
          isExpanded={expandedSection === 'company'}
          onToggle={() => toggleSection('company')}
          glassStyle={glassStyle}
        >
          <div className="space-y-3">
            <MobileInput label="Company Name" placeholder="ABC Nigeria Ltd" value={vatInput.company_name} onChange={(v) => handleInputChange('company_name', v)} />
            <div className="grid grid-cols-2 gap-3">
              <MobileInput label="TIN" placeholder="Tax ID" value={vatInput.tin} onChange={(v) => handleInputChange('tin', v)} />
              <MobileInput label="Tax Authority" placeholder="FIRS/LIRS" value={vatInput.tax_authority} onChange={(v) => handleInputChange('tax_authority', v)} />
            </div>
            <MobileSelect label="Return Period (Month)" value={vatInput.month} onChange={(v) => handleInputChange('month', v)} options={months} />
            <MobileToggle label="VAT Registered Business" checked={vatInput.is_registered_business} onChange={(v) => handleInputChange('is_registered_business', v)} />
          </div>
        </CollapsibleSection>

        {/* Transactions */}
        <CollapsibleSection
          title="Transactions"
          icon={Receipt}
          isExpanded={expandedSection === 'transactions'}
          onToggle={() => toggleSection('transactions')}
          glassStyle={glassStyle}
          required
        >
          <div className="space-y-4">
            {vatInput.transactions.map((transaction, index) => (
              <div key={transaction.id} className="p-3 rounded-lg border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-orange-400 font-medium">Transaction {index + 1}</span>
                  {vatInput.transactions.length > 1 && (
                    <button onClick={() => removeTransaction(transaction.id)} className="p-1 rounded-full bg-red-500/20 text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <MobileInput 
                  label="Description" 
                  placeholder="Invoice description" 
                  value={transaction.description} 
                  onChange={(v) => handleTransactionChange(transaction.id, 'description', v)} 
                />
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Transaction Type *</label>
                  <select
                    value={transaction.transaction_type}
                    onChange={(e) => handleTransactionChange(transaction.id, 'transaction_type', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg text-white text-sm focus:outline-none appearance-none"
                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                  >
                    <option value="" className="bg-gray-800">Select type...</option>
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
                    <optgroup label="Zero-Rated (0%)" className="bg-gray-800">
                      {zeroRatedTypes.map(([key, val]) => (
                        <option key={key} value={key} className="bg-gray-800">{val.name}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                {transaction.transaction_type && (
                  <p className="text-xs text-gray-500 p-2 rounded" style={{ background: 'rgba(249,115,22,0.1)' }}>
                    {transactionTypes[transaction.transaction_type]?.description}
                  </p>
                )}
                <MobileInput 
                  label="Amount (₦) *" 
                  placeholder="1,000,000" 
                  value={transaction.amount} 
                  onChange={(v) => handleTransactionChange(transaction.id, 'amount', v)} 
                  type="number" 
                />
              </div>
            ))}
            
            <button
              onClick={addTransaction}
              className="w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center space-x-2 border border-dashed border-orange-500/50 text-orange-400 active:scale-95 transition-transform"
            >
              <Plus className="h-5 w-5" />
              <span>Add Transaction</span>
            </button>
          </div>
        </CollapsibleSection>

        {/* Actions & Tools Panel - PDF Export, Templates, User Guide */}
        <MobileActionPanel
          calculatorType="vat"
          inputData={vatInput}
          resultData={result}
          onLoadTemplate={(templateData) => {
            setVatInput(prev => ({
              ...prev,
              ...templateData
            }));
          }}
          onShowUpgradeModal={onShowUpgradeModal}
        />

        {/* Ad-supported info for free users */}
        {!isPaidUser && (
          <div className="p-3 rounded-xl" style={{ ...glassStyle, background: 'rgba(249, 115, 22, 0.15)' }}>
            <p className="text-xs text-orange-300 flex items-center gap-2">
              <Info className="h-4 w-4 flex-shrink-0" />
              {isAuthenticated && isAuthenticated() 
                ? `${vatAdCalc.dailyLimit} free calculations daily. ${vatAdCalc.remainingFreeCalcs} remaining today.`
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
                background: isPaidUser ? 'rgba(249, 115, 22, 0.2)' : 'rgba(255,255,255,0.1)',
                border: isPaidUser ? '1px solid rgba(249, 115, 22, 0.3)' : '1px solid rgba(255,255,255,0.2)'
              }}>
              {isPaidUser ? <Crown className="h-3 w-3 text-orange-400" /> : <User className="h-3 w-3 text-gray-400" />}
              <span className={isPaidUser ? 'text-orange-400' : 'text-gray-400'}>
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
            onClick={calculateVAT}
            disabled={loading || vatInput.transactions.every(t => !t.amount || !t.transaction_type)}
            className="flex-[2] py-3 px-4 rounded-xl font-semibold flex items-center justify-center space-x-2 active:scale-95 transition-transform disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: 'white' }}
          >
            <Calculator className="h-5 w-5" />
            <span>{loading ? 'Calculating...' : 'Calculate VAT'}</span>
          </button>
        </div>
      </div>
      
      {/* Video Ad Modal */}
      <VideoAdModal
        isOpen={vatAdCalc.showAdModal}
        onClose={vatAdCalc.closeAdModal}
        onAdComplete={vatAdCalc.onAdComplete}
        calculatorType="VAT"
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
      
      {/* Upgrade Prompt */}
      {vatAdCalc.showUpgradePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full border border-orange-500/30">
            <div className="text-center">
              <Sparkles className="h-12 w-12 text-orange-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Daily Limit Reached</h3>
              <p className="text-gray-400 text-sm mb-4">
                You've used all your free calculations for today. Upgrade to get unlimited access!
              </p>
              <button
                onClick={() => {
                  vatAdCalc.closeUpgradePrompt();
                  if (onShowUpgradeModal) onShowUpgradeModal();
                }}
                className="w-full py-3 rounded-xl font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}
              >
                View Upgrade Options
              </button>
              <button
                onClick={vatAdCalc.closeUpgradePrompt}
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
const CollapsibleSection = ({ title, icon: Icon, isExpanded, onToggle, children, glassStyle, required }) => (
  <div className="rounded-xl overflow-hidden" style={glassStyle}>
    <button onClick={onToggle} className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-white/20 to-white/10">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-white" />
        </div>
        <span className="font-semibold text-white">{title}</span>
        {required && <span className="text-red-400 text-xs">*Required</span>}
      </div>
      {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
    </button>
    {isExpanded && <div className="p-4 pt-2">{children}</div>}
  </div>
);

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
      className="w-full px-3 py-2.5 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
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
      className="w-full px-3 py-2.5 rounded-lg text-white text-sm focus:outline-none appearance-none"
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
      className={`w-12 h-6 rounded-full transition-all relative ${checked ? 'bg-orange-500' : 'bg-gray-600'}`}
    >
      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${checked ? 'left-6' : 'left-0.5'}`} />
    </button>
  </div>
);

export default MobileVATCalculator;
