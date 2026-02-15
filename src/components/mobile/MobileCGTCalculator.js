import React, { useState } from 'react';
import axios from 'axios';
import { TrendingUp, Calculator, DollarSign, FileText, RotateCcw, ChevronDown, ChevronUp, Calendar, Shield, CheckCircle, Building2, Home, Car, Bitcoin, LineChart, Briefcase, User, Crown, Sparkles, Info } from 'lucide-react';
import { MobileAdBanner } from './MobileAdBanner';
import MobileActionPanel from './MobileActionPanel';
import { useAuth } from '../../contexts/AuthContext';
import { useFeatureGate } from '../../contexts/FeatureGateContext';
import { useAdCalculation } from '../../hooks/useAdCalculation';
import VideoAdModal from '../VideoAdModal';
import MilestoneModal from '../MilestoneModal';

/**
 * MOBILE CGT Calculator - Full Feature Parity with Web Version
 * Includes: Taxpayer Info, Asset Types (Crypto, Shares, Property, Business Assets),
 * NTA 2025 Exemptions, Dates, Detailed Costs
 * + Feature Gates, Ad-supported calculations, Milestone prompts, PDF Export, Templates, User Guide
 */
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = BACKEND_URL ? `${BACKEND_URL}/api` : null;

export const MobileCGTCalculator = ({ onShowUpgradeModal }) => {
  const [expandedSection, setExpandedSection] = useState('taxpayer');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeModule, setActiveModule] = useState('crypto'); // crypto, shares, property, business
  const [showMilestone, setShowMilestone] = useState(false);
  const [calculationCount, setCalculationCount] = useState(0);
  
  const { user, isAuthenticated } = useAuth();
  const { hasFeature, getUserTier } = useFeatureGate();
  const cgtAdCalc = useAdCalculation('cgt');
  
  const userTier = getUserTier ? getUserTier() : 'free';
  const isPaidUser = userTier === 'pro' || userTier === 'premium' || userTier === 'enterprise' || userTier === 'starter';
  
  // Common taxpayer information
  const [commonInfo, setCommonInfo] = useState({
    taxpayer_name: '',
    tin: '',
    year: new Date().getFullYear().toString(),
    taxpayer_type: 'individual' // individual or company
  });

  // Crypto CGT State
  const [cryptoInput, setCryptoInput] = useState({
    cryptoType: 'bitcoin',
    quantity: '',
    purchasePrice: '',
    purchaseDate: '',
    salePrice: '',
    saleDate: '',
    transactionFees: '',
    exchangeFees: ''
  });

  // Share Sale CGT State
  const [shareInput, setShareInput] = useState({
    companyName: '',
    shareType: 'listed',
    quantity: '',
    purchasePrice: '',
    purchaseDate: '',
    salePrice: '',
    saleDate: '',
    brokerageFees: '',
    stampDuty: ''
  });

  // Property/Asset CGT State
  const [assetInput, setAssetInput] = useState({
    assetType: 'property',
    assetDescription: '',
    purchasePrice: '',
    purchaseDate: '',
    salePrice: '',
    saleDate: '',
    improvementCosts: '',
    sellingExpenses: '',
    legalFees: '',
    is_primary_residence: false,
    is_personal_vehicle: false,
    company_turnover: ''
  });

  const handleCommonChange = (field, value) => {
    setCommonInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleCryptoChange = (field, value) => {
    setCryptoInput(prev => ({ ...prev, [field]: value }));
  };

  const handleShareChange = (field, value) => {
    setShareInput(prev => ({ ...prev, [field]: value }));
  };

  const handleAssetChange = (field, value) => {
    setAssetInput(prev => ({ ...prev, [field]: value }));
  };

  const calculateCGT = async () => {
    const performCalculation = async () => {
      setLoading(true);
      try {
        let payload = {
          ...commonInfo,
          asset_type: activeModule
        };

        if (activeModule === 'crypto') {
          if (!cryptoInput.purchasePrice || !cryptoInput.salePrice) {
            alert('Please enter purchase and sale prices');
            setLoading(false);
            return;
          }
          payload = {
            ...payload,
            ...cryptoInput,
            acquisition_cost: parseFloat(cryptoInput.purchasePrice) * (parseFloat(cryptoInput.quantity) || 1),
            disposal_proceeds: parseFloat(cryptoInput.salePrice) * (parseFloat(cryptoInput.quantity) || 1),
            improvement_costs: parseFloat(cryptoInput.transactionFees) || 0,
            selling_expenses: parseFloat(cryptoInput.exchangeFees) || 0
          };
        } else if (activeModule === 'shares') {
          if (!shareInput.purchasePrice || !shareInput.salePrice) {
            alert('Please enter purchase and sale prices');
            setLoading(false);
            return;
          }
          payload = {
            ...payload,
            ...shareInput,
            acquisition_cost: parseFloat(shareInput.purchasePrice) * (parseFloat(shareInput.quantity) || 1),
            disposal_proceeds: parseFloat(shareInput.salePrice) * (parseFloat(shareInput.quantity) || 1),
            improvement_costs: parseFloat(shareInput.brokerageFees) || 0,
            selling_expenses: parseFloat(shareInput.stampDuty) || 0
          };
        } else {
          if (!assetInput.purchasePrice || !assetInput.salePrice) {
            alert('Please enter purchase and sale prices');
            setLoading(false);
            return;
          }
          payload = {
            ...payload,
            ...assetInput,
            acquisition_cost: parseFloat(assetInput.purchasePrice) || 0,
            disposal_proceeds: parseFloat(assetInput.salePrice) || 0,
            improvement_costs: parseFloat(assetInput.improvementCosts) || 0,
            selling_expenses: (parseFloat(assetInput.sellingExpenses) || 0) + (parseFloat(assetInput.legalFees) || 0),
            company_turnover: parseFloat(assetInput.company_turnover) || 0
          };
        }

        const response = await axios.post(`${API}/calculate-cgt`, payload);
        setResult({
          ...response.data,
          module: activeModule,
          inputData: activeModule === 'crypto' ? cryptoInput : activeModule === 'shares' ? shareInput : assetInput
        });
        setExpandedSection('result');
        
        // Milestone prompts
        const newCount = calculationCount + 1;
        setCalculationCount(newCount);
        if (!isPaidUser && (newCount === 3 || newCount === 7 || newCount === 15)) {
          setTimeout(() => setShowMilestone(true), 1500);
        }
      } catch (error) {
        console.error('Error calculating CGT:', error);
        alert(error.response?.data?.detail || 'Error calculating CGT.');
      } finally {
        setLoading(false);
      }
    };
    
    cgtAdCalc.handleCalculateWithAd(performCalculation);
  };

  const resetForm = () => {
    setCommonInfo({ taxpayer_name: '', tin: '', year: new Date().getFullYear().toString(), taxpayer_type: 'individual' });
    setCryptoInput({ cryptoType: 'bitcoin', quantity: '', purchasePrice: '', purchaseDate: '', salePrice: '', saleDate: '', transactionFees: '', exchangeFees: '' });
    setShareInput({ companyName: '', shareType: 'listed', quantity: '', purchasePrice: '', purchaseDate: '', salePrice: '', saleDate: '', brokerageFees: '', stampDuty: '' });
    setAssetInput({ assetType: 'property', assetDescription: '', purchasePrice: '', purchaseDate: '', salePrice: '', saleDate: '', improvementCosts: '', sellingExpenses: '', legalFees: '', is_primary_residence: false, is_personal_vehicle: false, company_turnover: '' });
    setResult(null);
    setExpandedSection('taxpayer');
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return '₦0';
    return '₦' + new Intl.NumberFormat('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
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

  const cryptoTypes = ['Bitcoin', 'Ethereum', 'USDT', 'BNB', 'Solana', 'Other'];
  const assetTypes = [
    { value: 'property', label: 'Real Estate / Property', icon: Home },
    { value: 'business_assets', label: 'Business Assets', icon: Briefcase }
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
        <MobileAdBanner placement="calculator" />
        
        {/* Results */}
        {result && (
          <div className="rounded-xl overflow-hidden" style={glassStyle}>
            <div className={`p-4 ${result.is_exempt ? 'bg-gradient-to-r from-green-500/30 to-emerald-600/20' : 'bg-gradient-to-r from-blue-500/30 to-blue-600/20'}`}>
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${result.is_exempt ? 'bg-green-500/30' : 'bg-blue-500/30'}`}>
                  {result.is_exempt ? <CheckCircle className="h-4 w-4 text-green-400" /> : <FileText className="h-4 w-4 text-blue-400" />}
                </div>
                <span className="font-semibold text-white">{result.is_exempt ? 'CGT Exemption Applied!' : 'CGT Calculation Results'}</span>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {result.is_exempt && (
                <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/30">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="h-5 w-5 text-green-400" />
                    <span className="font-semibold text-green-400">Tax Exempt</span>
                  </div>
                  <p className="text-sm text-green-300">{result.exemption_reason}</p>
                  {result.tax_saved > 0 && (
                    <p className="text-xs text-green-400 mt-2">You saved: <span className="font-bold">{formatCurrency(result.tax_saved)}</span></p>
                  )}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-lg text-center ${result.is_exempt ? 'bg-green-500/20' : 'bg-blue-500/20'}`}>
                  <p className="text-xs text-gray-400">CGT Payable</p>
                  <p className={`text-xl font-bold ${result.is_exempt ? 'text-green-400' : 'text-blue-400'}`}>{result.is_exempt ? '₦0' : formatCurrency(result.tax_due || result.cgt_amount)}</p>
                </div>
                <div className="p-3 rounded-lg text-center bg-white/5">
                  <p className="text-xs text-gray-400">Effective Rate</p>
                  <p className="text-xl font-bold text-white">{result.is_exempt ? '0%' : `${result.effective_rate?.toFixed(1) || result.cgt_rate}%`}</p>
                </div>
              </div>
              <div className="p-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>Total Proceeds:</span>
                    <span className="text-white">{formatCurrency(result.totalProceeds || result.disposal_proceeds)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Total Cost:</span>
                    <span className="text-red-400">-{formatCurrency(result.totalCost || result.total_cost)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300 border-t border-white/10 pt-2">
                    <span className="font-semibold">Capital Gain:</span>
                    <span className={`font-bold ${(result.chargeable_gain || result.capital_gain) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(result.chargeable_gain || result.capital_gain)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Asset Type Selector */}
        <div className="rounded-xl overflow-hidden p-4" style={glassStyle}>
          <p className="text-xs text-gray-400 mb-3 font-medium">Select Asset Type</p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'crypto', label: 'Crypto', icon: Bitcoin },
              { id: 'shares', label: 'Shares', icon: LineChart },
              { id: 'property', label: 'Property', icon: Home },
              { id: 'business', label: 'Business', icon: Briefcase }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveModule(id)}
                className={`py-3 px-2 rounded-lg text-center transition-all ${activeModule === id ? 'bg-blue-500/30 border-blue-500 text-blue-400' : 'bg-white/5 border-white/10 text-gray-400'} border`}
              >
                <Icon className="h-5 w-5 mx-auto mb-1" />
                <span className="text-xs">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Taxpayer Information */}
        <CollapsibleSection
          title="Taxpayer Information"
          icon={User}
          isExpanded={expandedSection === 'taxpayer'}
          onToggle={() => toggleSection('taxpayer')}
          glassStyle={glassStyle}
        >
          <div className="space-y-3">
            <MobileInput label="Taxpayer Name" placeholder="John Doe / ABC Ltd" value={commonInfo.taxpayer_name} onChange={(v) => handleCommonChange('taxpayer_name', v)} />
            <div className="grid grid-cols-2 gap-3">
              <MobileInput label="TIN" placeholder="Tax ID" value={commonInfo.tin} onChange={(v) => handleCommonChange('tin', v)} />
              <MobileInput label="Year" placeholder="2026" value={commonInfo.year} onChange={(v) => handleCommonChange('year', v)} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-2">Taxpayer Type *</label>
              <div className="grid grid-cols-2 gap-2">
                {[{ value: 'individual', label: 'Individual', desc: '0-25% Progressive' }, { value: 'company', label: 'Company', desc: '30% Flat' }].map(type => (
                  <button
                    key={type.value}
                    onClick={() => handleCommonChange('taxpayer_type', type.value)}
                    className={`py-3 px-3 rounded-lg text-center transition-all ${commonInfo.taxpayer_type === type.value ? 'bg-blue-500/30 border-blue-500 text-blue-400' : 'bg-white/5 border-white/10 text-gray-300'} border`}
                  >
                    <div className="font-medium text-sm">{type.label}</div>
                    <div className="text-xs opacity-70">{type.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Crypto Module */}
        {activeModule === 'crypto' && (
          <CollapsibleSection
            title="Cryptocurrency Details"
            icon={Bitcoin}
            isExpanded={expandedSection === 'crypto'}
            onToggle={() => toggleSection('crypto')}
            glassStyle={glassStyle}
            required
          >
            <div className="space-y-3">
              <MobileSelect label="Crypto Type" value={cryptoInput.cryptoType} onChange={(v) => handleCryptoChange('cryptoType', v)} options={cryptoTypes} />
              <MobileInput label="Quantity" placeholder="1.5" value={cryptoInput.quantity} onChange={(v) => handleCryptoChange('quantity', v)} type="number" />
              <div className="grid grid-cols-2 gap-3">
                <MobileInput label="Purchase Price (₦)" placeholder="Per unit" value={cryptoInput.purchasePrice} onChange={(v) => handleCryptoChange('purchasePrice', v)} type="number" />
                <MobileInput label="Sale Price (₦)" placeholder="Per unit" value={cryptoInput.salePrice} onChange={(v) => handleCryptoChange('salePrice', v)} type="number" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <MobileInput label="Purchase Date" placeholder="" value={cryptoInput.purchaseDate} onChange={(v) => handleCryptoChange('purchaseDate', v)} type="date" />
                <MobileInput label="Sale Date" placeholder="" value={cryptoInput.saleDate} onChange={(v) => handleCryptoChange('saleDate', v)} type="date" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <MobileInput label="Transaction Fees" placeholder="₦0" value={cryptoInput.transactionFees} onChange={(v) => handleCryptoChange('transactionFees', v)} type="number" />
                <MobileInput label="Exchange Fees" placeholder="₦0" value={cryptoInput.exchangeFees} onChange={(v) => handleCryptoChange('exchangeFees', v)} type="number" />
              </div>
            </div>
          </CollapsibleSection>
        )}

        {/* Shares Module */}
        {activeModule === 'shares' && (
          <CollapsibleSection
            title="Share Sale Details"
            icon={LineChart}
            isExpanded={expandedSection === 'shares'}
            onToggle={() => toggleSection('shares')}
            glassStyle={glassStyle}
            required
          >
            <div className="space-y-3">
              <MobileInput label="Company Name" placeholder="Dangote Cement Plc" value={shareInput.companyName} onChange={(v) => handleShareChange('companyName', v)} />
              <div className="grid grid-cols-2 gap-2">
                {['listed', 'unlisted'].map(type => (
                  <button
                    key={type}
                    onClick={() => handleShareChange('shareType', type)}
                    className={`py-2 px-3 rounded-lg text-sm capitalize ${shareInput.shareType === type ? 'bg-blue-500/30 border-blue-500 text-blue-400' : 'bg-white/5 border-white/10 text-gray-300'} border`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <MobileInput label="Quantity (Shares)" placeholder="1000" value={shareInput.quantity} onChange={(v) => handleShareChange('quantity', v)} type="number" />
              <div className="grid grid-cols-2 gap-3">
                <MobileInput label="Purchase Price (₦)" placeholder="Per share" value={shareInput.purchasePrice} onChange={(v) => handleShareChange('purchasePrice', v)} type="number" />
                <MobileInput label="Sale Price (₦)" placeholder="Per share" value={shareInput.salePrice} onChange={(v) => handleShareChange('salePrice', v)} type="number" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <MobileInput label="Purchase Date" value={shareInput.purchaseDate} onChange={(v) => handleShareChange('purchaseDate', v)} type="date" />
                <MobileInput label="Sale Date" value={shareInput.saleDate} onChange={(v) => handleShareChange('saleDate', v)} type="date" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <MobileInput label="Brokerage Fees" placeholder="₦0" value={shareInput.brokerageFees} onChange={(v) => handleShareChange('brokerageFees', v)} type="number" />
                <MobileInput label="Stamp Duty" placeholder="₦0" value={shareInput.stampDuty} onChange={(v) => handleShareChange('stampDuty', v)} type="number" />
              </div>
              {/* Small Investor Relief Info */}
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-xs text-blue-300"><strong>Small Investor Relief:</strong> Automatic exemption if proceeds &lt;₦150M AND gains ≤₦10M</p>
              </div>
            </div>
          </CollapsibleSection>
        )}

        {/* Property/Business Module */}
        {(activeModule === 'property' || activeModule === 'business') && (
          <CollapsibleSection
            title={activeModule === 'property' ? 'Property Details' : 'Business Asset Details'}
            icon={activeModule === 'property' ? Home : Briefcase}
            isExpanded={expandedSection === 'asset'}
            onToggle={() => toggleSection('asset')}
            glassStyle={glassStyle}
            required
          >
            <div className="space-y-3">
              <MobileInput label="Asset Description" placeholder="3-bedroom house in Lekki" value={assetInput.assetDescription} onChange={(v) => handleAssetChange('assetDescription', v)} />
              <div className="grid grid-cols-2 gap-3">
                <MobileInput label="Purchase Price (₦)" placeholder="₦50,000,000" value={assetInput.purchasePrice} onChange={(v) => handleAssetChange('purchasePrice', v)} type="number" />
                <MobileInput label="Sale Price (₦)" placeholder="₦80,000,000" value={assetInput.salePrice} onChange={(v) => handleAssetChange('salePrice', v)} type="number" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <MobileInput label="Purchase Date" value={assetInput.purchaseDate} onChange={(v) => handleAssetChange('purchaseDate', v)} type="date" />
                <MobileInput label="Sale Date" value={assetInput.saleDate} onChange={(v) => handleAssetChange('saleDate', v)} type="date" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <MobileInput label="Improvements" placeholder="₦0" value={assetInput.improvementCosts} onChange={(v) => handleAssetChange('improvementCosts', v)} type="number" />
                <MobileInput label="Selling Costs" placeholder="₦0" value={assetInput.sellingExpenses} onChange={(v) => handleAssetChange('sellingExpenses', v)} type="number" />
                <MobileInput label="Legal Fees" placeholder="₦0" value={assetInput.legalFees} onChange={(v) => handleAssetChange('legalFees', v)} type="number" />
              </div>
              
              {/* Exemptions */}
              <div className="space-y-2 pt-3 border-t border-white/10">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-400" />
                  <label className="text-xs text-green-400 font-medium">NTA 2025 Exemptions</label>
                </div>
                
                {commonInfo.taxpayer_type === 'individual' && activeModule === 'property' && (
                  <MobileToggle label="Primary Residence?" checked={assetInput.is_primary_residence} onChange={(v) => handleAssetChange('is_primary_residence', v)} />
                )}
                
                {commonInfo.taxpayer_type === 'individual' && activeModule === 'business' && (
                  <MobileToggle label="Personal Vehicle? (max 2)" checked={assetInput.is_personal_vehicle} onChange={(v) => handleAssetChange('is_personal_vehicle', v)} />
                )}
                
                {commonInfo.taxpayer_type === 'company' && (
                  <div>
                    <MobileInput label="Annual Turnover (for exemption)" placeholder="≤₦50M = exempt" value={assetInput.company_turnover} onChange={(v) => handleAssetChange('company_turnover', v)} type="number" />
                    <p className="text-xs text-gray-500 mt-1">Small companies (turnover ≤₦50M) pay 0% CGT</p>
                  </div>
                )}
              </div>
            </div>
          </CollapsibleSection>
        )}

        {/* Actions & Tools Panel - PDF Export, Templates, User Guide */}
        <MobileActionPanel
          calculatorType="cgt"
          inputData={{ ...commonInfo, ...cryptoInput, ...shareInput, ...assetInput, activeModule }}
          resultData={result}
          onLoadTemplate={(templateData) => {
            if (templateData.taxpayer_name) setCommonInfo(prev => ({ ...prev, ...templateData }));
            if (templateData.cryptoType) setCryptoInput(prev => ({ ...prev, ...templateData }));
            if (templateData.companyName) setShareInput(prev => ({ ...prev, ...templateData }));
            if (templateData.assetDescription) setAssetInput(prev => ({ ...prev, ...templateData }));
            if (templateData.activeModule) setActiveModule(templateData.activeModule);
          }}
          onShowUpgradeModal={onShowUpgradeModal}
        />

        {/* Ad-supported info for free users */}
        {!isPaidUser && (
          <div className="p-3 rounded-xl" style={{ ...glassStyle, background: 'rgba(59, 130, 246, 0.15)' }}>
            <p className="text-xs text-blue-300 flex items-center gap-2">
              <Info className="h-4 w-4 flex-shrink-0" />
              {isAuthenticated && isAuthenticated() 
                ? `${cgtAdCalc.dailyLimit} free calculations daily. ${cgtAdCalc.remainingFreeCalcs} remaining today.`
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
                background: isPaidUser ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.1)',
                border: isPaidUser ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(255,255,255,0.2)'
              }}>
              {isPaidUser ? <Crown className="h-3 w-3 text-blue-400" /> : <User className="h-3 w-3 text-gray-400" />}
              <span className={isPaidUser ? 'text-blue-400' : 'text-gray-400'}>
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
            onClick={calculateCGT}
            disabled={loading}
            className="flex-[2] py-3 px-4 rounded-xl font-semibold flex items-center justify-center space-x-2 active:scale-95 transition-transform disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white' }}
          >
            <Calculator className="h-5 w-5" />
            <span>{loading ? 'Calculating...' : 'Calculate CGT'}</span>
          </button>
        </div>
      </div>
      
      {/* Video Ad Modal */}
      <VideoAdModal
        isOpen={cgtAdCalc.showAdModal}
        onClose={cgtAdCalc.closeAdModal}
        onAdComplete={cgtAdCalc.onAdComplete}
        calculatorType="CGT"
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
      {cgtAdCalc.showUpgradePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full border border-blue-500/30">
            <div className="text-center">
              <Sparkles className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Daily Limit Reached</h3>
              <p className="text-gray-400 text-sm mb-4">
                You've used all your free calculations for today. Upgrade to get unlimited access!
              </p>
              <button
                onClick={() => {
                  cgtAdCalc.closeUpgradePrompt();
                  if (onShowUpgradeModal) onShowUpgradeModal();
                }}
                className="w-full py-3 rounded-xl font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
              >
                View Upgrade Options
              </button>
              <button
                onClick={cgtAdCalc.closeUpgradePrompt}
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

// Components
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

const MobileInput = ({ label, placeholder, value, onChange, type = 'text' }) => (
  <div>
    <label className="block text-xs text-gray-400 mb-1">{label}</label>
    <input
      type={type}
      inputMode={type === 'number' ? 'numeric' : type === 'date' ? undefined : 'text'}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
      style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
    />
  </div>
);

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
        <option key={opt} value={opt.toLowerCase()} className="bg-gray-900">{opt}</option>
      ))}
    </select>
  </div>
);

const MobileToggle = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
    <span className="text-sm text-gray-300">{label}</span>
    <button
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 rounded-full transition-all relative ${checked ? 'bg-green-500' : 'bg-gray-600'}`}
    >
      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${checked ? 'left-6' : 'left-0.5'}`} />
    </button>
  </div>
);

export default MobileCGTCalculator;
