import React, { useState, useEffect } from 'react';
import { 
  Building2, Calculator, FileText, AlertTriangle, CheckCircle, 
  Info, Save, Lock, ChevronDown, ChevronUp, Plus, Trash2, 
  Download, HelpCircle, ArrowRight, ArrowLeft, Loader2, Settings, Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import UpgradePrompt from './UpgradePrompt';
import { generateDeferredTaxReport } from '../utils/pdfGenerator';
import CalculatorEntryIndicator from './CalculatorEntryIndicator';

// Capital Allowance Rates - Old Law (with Initial Allowances)
const CAPITAL_ALLOWANCE_RATES_OLD = {
  'Land': { initial: 0, annual: 0 },
  'Buildings': { initial: 0.15, annual: 0.10 },
  'Plant & Machinery': { initial: 0.50, annual: 0.25 },
  'Motor Vehicles': { initial: 0.50, annual: 0.25 },
  'Furniture & Fittings': { initial: 0.25, annual: 0.20 },
  'Computer Equipment': { initial: 0.50, annual: 0.25 }
};

// Capital Allowance Rates - NTA 2025 (Initial Allowances Abolished)
const CAPITAL_ALLOWANCE_RATES_NTA = {
  'Land': { initial: 0, annual: 0 },
  'Buildings': { initial: 0, annual: 0.10 },
  'Plant & Machinery': { initial: 0, annual: 0.25 },
  'Motor Vehicles': { initial: 0, annual: 0.25 },
  'Furniture & Fittings': { initial: 0, annual: 0.20 },
  'Computer Equipment': { initial: 0, annual: 0.25 }
};

const DeferredTaxCalculator = ({ 
  formatCurrency,
  hasFeature,
  user,
  onShowTrialModal,
  onShowUpgradeModal,
  openUpgradeModal,
  onSaveCalculation,
  savesUsed = 0,
  savesLimit = 5,
  isAuthenticated,
  onSaveTemplate,
  hasTemplateAccess = false,
  templateData = null,
  onTemplateLoaded = null,
  onOpenTemplates = null,
  onShowUserGuide = null
}) => {
  // Step state
  const [currentStep, setCurrentStep] = useState(1);
  const [isComputing, setIsComputing] = useState(false);
  
  // Tax Law Version: 'nta_2025' (no initial allowance) or 'old_law' (with initial allowance)
  const [taxLawVersion, setTaxLawVersion] = useState('nta_2025');
  
  // PPE Input Mode: 'auto' or 'manual'
  const [ppeInputMode, setPpeInputMode] = useState('auto');
  
  // Company Profile (Step 1)
  const [companyProfile, setCompanyProfile] = useState({
    company_name: '',
    company_size: '', // 'standard' or 'small'
    turnover: '',
    fixed_assets: '',
    financial_year_end: '2026-12-31'
  });
  
  // Temporary Differences (Step 2) - Enhanced PPE structure
  const [temporaryDifferences, setTemporaryDifferences] = useState({
    ppe: [
      { 
        asset_type: 'Land', 
        // Auto mode fields
        cost: '', 
        depreciation_rate: '', 
        years_used: '',
        depreciation_method: 'straight_line',
        // Calculated/Manual fields
        carrying_amount: '', 
        tax_base: '',
        // Flag for auto calculation
        auto_calculated: true
      },
      { 
        asset_type: 'Buildings', 
        cost: '', 
        depreciation_rate: '5', 
        years_used: '',
        depreciation_method: 'straight_line',
        carrying_amount: '', 
        tax_base: '',
        auto_calculated: true
      },
      { 
        asset_type: 'Plant & Machinery', 
        cost: '', 
        depreciation_rate: '20', 
        years_used: '',
        depreciation_method: 'straight_line',
        carrying_amount: '', 
        tax_base: '',
        auto_calculated: true
      },
      { 
        asset_type: 'Motor Vehicles', 
        cost: '', 
        depreciation_rate: '25', 
        years_used: '',
        depreciation_method: 'straight_line',
        carrying_amount: '', 
        tax_base: '',
        auto_calculated: true
      },
      { 
        asset_type: 'Furniture & Fittings', 
        cost: '', 
        depreciation_rate: '15', 
        years_used: '',
        depreciation_method: 'straight_line',
        carrying_amount: '', 
        tax_base: '',
        auto_calculated: true
      },
      { 
        asset_type: 'Computer Equipment', 
        cost: '', 
        depreciation_rate: '33.33', 
        years_used: '',
        depreciation_method: 'straight_line',
        carrying_amount: '', 
        tax_base: '',
        auto_calculated: true
      }
    ],
    inventory: { carrying_amount: '', tax_base: '' },
    receivables: {
      gross_receivables: '',
      ecl_impairment: '',
      tax_deductible_amount: ''
    },
    provisions: [
      { provision_type: 'Warranty provision', carrying_amount: '' },
      { provision_type: 'Bonus/incentive accruals', carrying_amount: '' },
      { provision_type: 'Legal claims/litigation', carrying_amount: '' },
      { provision_type: 'Restructuring provision', carrying_amount: '' },
      { provision_type: 'Leave pay accrual', carrying_amount: '' },
      { provision_type: 'Other provisions', carrying_amount: '' }
    ],
    contract_assets: { carrying_amount: '' },
    contract_liabilities: { carrying_amount: '' },
    revaluation: {
      original_cost: '',
      revalued_amount: '',
      recognized_in_equity: false
    },
    leases: {
      rou_asset: '',
      lease_liability: ''
    },
    tax_losses: {
      amount: '',
      has_evidence_of_future_profits: false
    },
    other: []
  });
  
  // Results (Step 4)
  const [results, setResults] = useState(null);
  
  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    ppe: true,
    inventory: false,
    receivables: false,
    provisions: false,
    contracts: false,
    revaluation: false,
    leases: false,
    taxLosses: false,
    other: false
  });
  
  // Upgrade prompt state
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  
  // Tax rate based on company size
  const taxRate = companyProfile.company_size === 'standard' ? 0.34 : 0;
  
  // Check if user has access to deferred tax calculator
  const hasAccess = hasFeature ? hasFeature('deferred_tax_calc') : false;
  
  // Calculate Carrying Amount based on depreciation
  const calculateCarryingAmount = (cost, depRate, years, method) => {
    const costNum = parseFloat(cost) || 0;
    const rateNum = parseFloat(depRate) / 100 || 0;
    const yearsNum = parseInt(years) || 0;
    
    if (costNum === 0) return 0;
    
    if (method === 'reducing_balance') {
      // Reducing balance: CA = Cost × (1 - rate)^years
      return Math.max(0, costNum * Math.pow(1 - rateNum, yearsNum));
    } else {
      // Straight line: CA = Cost - (Cost × rate × years)
      const accDepreciation = costNum * rateNum * yearsNum;
      return Math.max(0, costNum - accDepreciation);
    }
  };
  
  // Calculate Tax Written Down Value (TWDV) based on selected tax law version
  const calculateTWDV = (cost, assetType, years) => {
    const costNum = parseFloat(cost) || 0;
    const yearsNum = parseInt(years) || 0;
    
    // Select rates based on tax law version
    const ratesTable = taxLawVersion === 'old_law' 
      ? CAPITAL_ALLOWANCE_RATES_OLD 
      : CAPITAL_ALLOWANCE_RATES_NTA;
    const rates = ratesTable[assetType] || { initial: 0, annual: 0 };
    
    if (costNum === 0) return 0;
    
    // Year 0: No allowance claimed yet
    if (yearsNum === 0) return costNum;
    
    // Year 1: Initial Allowance claimed (if applicable under selected law)
    let twdv = costNum * (1 - rates.initial);
    
    // Subsequent years: Annual Allowance on reducing balance
    for (let i = 1; i < yearsNum; i++) {
      twdv = twdv * (1 - rates.annual);
    }
    
    return Math.max(0, twdv);
  };
  
  // Auto-calculate PPE values when inputs change or tax law version changes
  useEffect(() => {
    if (ppeInputMode === 'auto') {
      setTemporaryDifferences(prev => ({
        ...prev,
        ppe: prev.ppe.map(item => {
          if (item.cost && item.years_used) {
            const carryingAmount = calculateCarryingAmount(
              item.cost, 
              item.depreciation_rate, 
              item.years_used, 
              item.depreciation_method
            );
            const taxBase = calculateTWDV(item.cost, item.asset_type, item.years_used);
            return {
              ...item,
              carrying_amount: carryingAmount.toFixed(2),
              tax_base: taxBase.toFixed(2),
              auto_calculated: true
            };
          }
          return item;
        })
      }));
    }
  }, [ppeInputMode, taxLawVersion, temporaryDifferences.ppe.map(p => `${p.cost}-${p.depreciation_rate}-${p.years_used}-${p.depreciation_method}`).join(',')]);
  
  // Load template data when provided
  useEffect(() => {
    if (templateData) {
      // Load company profile
      if (templateData.companyProfile) {
        setCompanyProfile(templateData.companyProfile);
      }
      
      // Load temporary differences
      if (templateData.temporaryDifferences) {
        setTemporaryDifferences(templateData.temporaryDifferences);
      }
      
      // Load PPE input mode
      if (templateData.ppeInputMode) {
        setPpeInputMode(templateData.ppeInputMode);
      }
      
      // Load tax law version
      if (templateData.taxLawVersion) {
        setTaxLawVersion(templateData.taxLawVersion);
      }
      
      // Reset to step 1 for review
      setCurrentStep(1);
      setResults(null);
      
      // Notify parent that template was loaded
      if (onTemplateLoaded) {
        onTemplateLoaded();
      }
    }
  }, [templateData, onTemplateLoaded]);
  
  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Handle company profile change
  const handleProfileChange = (field, value) => {
    setCompanyProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle PPE change (auto mode)
  const handlePPEAutoChange = (index, field, value) => {
    setTemporaryDifferences(prev => ({
      ...prev,
      ppe: prev.ppe.map((item, i) => {
        if (i === index) {
          const updated = { ...item, [field]: value };
          // Recalculate if we have cost and years
          if (updated.cost && updated.years_used) {
            updated.carrying_amount = calculateCarryingAmount(
              updated.cost,
              updated.depreciation_rate,
              updated.years_used,
              updated.depreciation_method
            ).toFixed(2);
            updated.tax_base = calculateTWDV(
              updated.cost,
              updated.asset_type,
              updated.years_used
            ).toFixed(2);
            updated.auto_calculated = true;
          }
          return updated;
        }
        return item;
      })
    }));
  };
  
  // Handle PPE change (manual mode)
  const handlePPEManualChange = (index, field, value) => {
    setTemporaryDifferences(prev => ({
      ...prev,
      ppe: prev.ppe.map((item, i) => 
        i === index ? { ...item, [field]: value, auto_calculated: false } : item
      )
    }));
  };
  
  // Handle provisions change
  const handleProvisionChange = (index, value) => {
    setTemporaryDifferences(prev => ({
      ...prev,
      provisions: prev.provisions.map((item, i) => 
        i === index ? { ...item, carrying_amount: value } : item
      )
    }));
  };
  
  // Add other temporary difference row
  const addOtherRow = () => {
    setTemporaryDifferences(prev => ({
      ...prev,
      other: [...prev.other, { description: '', carrying_amount: '', tax_base: '', type: 'taxable' }]
    }));
  };
  
  // Remove other temporary difference row
  const removeOtherRow = (index) => {
    setTemporaryDifferences(prev => ({
      ...prev,
      other: prev.other.filter((_, i) => i !== index)
    }));
  };
  
  // Calculate temporary difference for a single item
  const calcTempDiff = (carrying, taxBase) => {
    const ca = parseFloat(carrying) || 0;
    const tb = parseFloat(taxBase) || 0;
    return ca - tb;
  };
  
  // Format number with commas
  const formatNumber = (num) => {
    if (!num && num !== 0) return '';
    return parseFloat(num).toLocaleString('en-NG');
  };
  
  // Compute all deferred tax
  const computeDeferredTax = () => {
    setIsComputing(true);
    
    // Simulate computation delay for UX
    setTimeout(() => {
      // If small company, return zero
      if (companyProfile.company_size === 'small') {
        setResults({
          isSmallCompany: true,
          netPosition: 0,
          netType: 'none',
          message: 'Your company is exempt from CIT, CGT, and Development Levy under NTA 2025.',
          warnings: []
        });
        setIsComputing(false);
        setCurrentStep(4);
        return;
      }
      
      let totalTaxableTD = 0;
      let totalDeductibleTD = 0;
      const warnings = [];
      const breakdown = {
        ppe: { taxable: 0, deductible: 0 },
        inventory: { taxable: 0, deductible: 0 },
        receivables: { taxable: 0, deductible: 0 },
        provisions: { taxable: 0, deductible: 0 },
        contracts: { taxable: 0, deductible: 0 },
        revaluation: { taxable: 0, deductible: 0 },
        leases: { taxable: 0, deductible: 0 },
        taxLosses: { taxable: 0, deductible: 0 },
        other: { taxable: 0, deductible: 0 }
      };
      
      // PPE
      temporaryDifferences.ppe.forEach(item => {
        const diff = calcTempDiff(item.carrying_amount, item.tax_base);
        if (diff > 0) {
          totalTaxableTD += diff;
          breakdown.ppe.taxable += diff;
        } else if (diff < 0) {
          totalDeductibleTD += Math.abs(diff);
          breakdown.ppe.deductible += Math.abs(diff);
        }
      });
      
      // Inventory
      const invDiff = calcTempDiff(
        temporaryDifferences.inventory.carrying_amount,
        temporaryDifferences.inventory.tax_base
      );
      if (invDiff < 0) {
        totalDeductibleTD += Math.abs(invDiff);
        breakdown.inventory.deductible += Math.abs(invDiff);
      } else if (invDiff > 0) {
        totalTaxableTD += invDiff;
        breakdown.inventory.taxable += invDiff;
      }
      
      // Receivables
      const grossRec = parseFloat(temporaryDifferences.receivables.gross_receivables) || 0;
      const eclImp = parseFloat(temporaryDifferences.receivables.ecl_impairment) || 0;
      const taxDed = parseFloat(temporaryDifferences.receivables.tax_deductible_amount) || 0;
      const recCarrying = grossRec - eclImp;
      const recTaxBase = grossRec - taxDed;
      const recDiff = recCarrying - recTaxBase;
      if (recDiff < 0) {
        totalDeductibleTD += Math.abs(recDiff);
        breakdown.receivables.deductible += Math.abs(recDiff);
      }
      
      // Provisions (all create DTA, tax base = 0)
      temporaryDifferences.provisions.forEach(item => {
        const amount = parseFloat(item.carrying_amount) || 0;
        if (amount > 0) {
          totalDeductibleTD += amount;
          breakdown.provisions.deductible += amount;
        }
      });
      
      // Contract Assets (creates DTA)
      const contractAsset = parseFloat(temporaryDifferences.contract_assets.carrying_amount) || 0;
      if (contractAsset > 0) {
        totalDeductibleTD += contractAsset;
        breakdown.contracts.deductible += contractAsset;
      }
      
      // Contract Liabilities (creates DTL)
      const contractLiab = parseFloat(temporaryDifferences.contract_liabilities.carrying_amount) || 0;
      if (contractLiab > 0) {
        totalTaxableTD += contractLiab;
        breakdown.contracts.taxable += contractLiab;
      }
      
      // Revaluation (creates DTL)
      const revalOriginal = parseFloat(temporaryDifferences.revaluation.original_cost) || 0;
      const revalAmount = parseFloat(temporaryDifferences.revaluation.revalued_amount) || 0;
      const revalSurplus = revalAmount - revalOriginal;
      if (revalSurplus > 0) {
        totalTaxableTD += revalSurplus;
        breakdown.revaluation.taxable += revalSurplus;
        if (temporaryDifferences.revaluation.recognized_in_equity) {
          warnings.push('Revaluation surplus deferred tax should be recognized in equity (Revaluation Reserve), not profit or loss.');
        }
      }
      
      // Leases (ROU creates DTL, Liability creates DTA)
      const rouAsset = parseFloat(temporaryDifferences.leases.rou_asset) || 0;
      const leaseLiab = parseFloat(temporaryDifferences.leases.lease_liability) || 0;
      if (rouAsset > 0) {
        totalTaxableTD += rouAsset;
        breakdown.leases.taxable += rouAsset;
      }
      if (leaseLiab > 0) {
        totalDeductibleTD += leaseLiab;
        breakdown.leases.deductible += leaseLiab;
      }
      
      // Tax Losses
      const taxLossAmount = parseFloat(temporaryDifferences.tax_losses.amount) || 0;
      if (taxLossAmount > 0) {
        if (temporaryDifferences.tax_losses.has_evidence_of_future_profits) {
          totalDeductibleTD += taxLossAmount;
          breakdown.taxLosses.deductible += taxLossAmount;
        } else {
          warnings.push(`Deferred tax asset on tax losses (${formatCurrency(taxLossAmount * taxRate)}) NOT recognized due to uncertain recoverability. Provide evidence of future taxable profits to recognize this asset.`);
        }
      }
      
      // Other differences
      temporaryDifferences.other.forEach(item => {
        const diff = calcTempDiff(item.carrying_amount, item.tax_base);
        if (item.type === 'taxable' && diff > 0) {
          totalTaxableTD += diff;
          breakdown.other.taxable += diff;
        } else if (item.type === 'deductible' && diff < 0) {
          totalDeductibleTD += Math.abs(diff);
          breakdown.other.deductible += Math.abs(diff);
        }
      });
      
      // Apply tax rate
      const grossDTL = totalTaxableTD * taxRate;
      const grossDTA = totalDeductibleTD * taxRate;
      
      // Recognition criteria
      const finalDTL = grossDTL;
      let finalDTA = grossDTA;
      
      // DTA recognition check (simplified)
      if (!temporaryDifferences.tax_losses.has_evidence_of_future_profits && grossDTL === 0 && grossDTA > 0) {
        warnings.push('Deferred tax asset may not be fully recognized due to uncertain recoverability. Review recoverability test.');
      }
      
      // Net position
      const netPosition = finalDTL - finalDTA;
      const netType = netPosition > 0 ? 'liability' : netPosition < 0 ? 'asset' : 'none';
      
      setResults({
        isSmallCompany: false,
        totalTaxableTD,
        totalDeductibleTD,
        grossDTL,
        grossDTA,
        finalDTL,
        finalDTA,
        netPosition: Math.abs(netPosition),
        netType,
        warnings,
        breakdown,
        taxRate
      });
      
      setIsComputing(false);
      setCurrentStep(4);
    }, 1500);
  };
  
  // Validate Step 1
  const validateStep1 = () => {
    if (!companyProfile.company_name) return false;
    if (!companyProfile.company_size) return false;
    if (!companyProfile.turnover || parseFloat(companyProfile.turnover) <= 0) return false;
    if (companyProfile.fixed_assets === '' || parseFloat(companyProfile.fixed_assets) < 0) return false;
    return true;
  };
  
  // Reset calculator
  const resetCalculator = () => {
    setCurrentStep(1);
    setPpeInputMode('auto');
    setCompanyProfile({
      company_name: '',
      company_size: '',
      turnover: '',
      fixed_assets: '',
      financial_year_end: '2026-12-31'
    });
    setTemporaryDifferences({
      ppe: [
        { asset_type: 'Land', cost: '', depreciation_rate: '', years_used: '', depreciation_method: 'straight_line', carrying_amount: '', tax_base: '', auto_calculated: true },
        { asset_type: 'Buildings', cost: '', depreciation_rate: '5', years_used: '', depreciation_method: 'straight_line', carrying_amount: '', tax_base: '', auto_calculated: true },
        { asset_type: 'Plant & Machinery', cost: '', depreciation_rate: '20', years_used: '', depreciation_method: 'straight_line', carrying_amount: '', tax_base: '', auto_calculated: true },
        { asset_type: 'Motor Vehicles', cost: '', depreciation_rate: '25', years_used: '', depreciation_method: 'straight_line', carrying_amount: '', tax_base: '', auto_calculated: true },
        { asset_type: 'Furniture & Fittings', cost: '', depreciation_rate: '15', years_used: '', depreciation_method: 'straight_line', carrying_amount: '', tax_base: '', auto_calculated: true },
        { asset_type: 'Computer Equipment', cost: '', depreciation_rate: '33.33', years_used: '', depreciation_method: 'straight_line', carrying_amount: '', tax_base: '', auto_calculated: true }
      ],
      inventory: { carrying_amount: '', tax_base: '' },
      receivables: { gross_receivables: '', ecl_impairment: '', tax_deductible_amount: '' },
      provisions: [
        { provision_type: 'Warranty provision', carrying_amount: '' },
        { provision_type: 'Bonus/incentive accruals', carrying_amount: '' },
        { provision_type: 'Legal claims/litigation', carrying_amount: '' },
        { provision_type: 'Restructuring provision', carrying_amount: '' },
        { provision_type: 'Leave pay accrual', carrying_amount: '' },
        { provision_type: 'Other provisions', carrying_amount: '' }
      ],
      contract_assets: { carrying_amount: '' },
      contract_liabilities: { carrying_amount: '' },
      revaluation: { original_cost: '', revalued_amount: '', recognized_in_equity: false },
      leases: { rou_asset: '', lease_liability: '' },
      tax_losses: { amount: '', has_evidence_of_future_profits: false },
      other: []
    });
    setResults(null);
  };
  
  // Render locked state for non-Pro users
  if (!hasAccess && !user?.admin_enabled) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardHeader className="rounded-t-lg" style={{ background: 'linear-gradient(to right, #1a1a2e, #16213e)', color: '#D4AF37' }}>
            <CardTitle className="flex items-center space-x-2" style={{ color: '#D4AF37' }}>
              <Calculator className="h-5 w-5" />
              <span>Deferred Tax Calculator</span>
            </CardTitle>
            <CardDescription style={{ color: '#9CA3AF' }}>
              IAS 12 compliant deferred tax computation
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <Lock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Pro Feature</h3>
              <p className="text-gray-600 mb-4">
                Calculate deferred tax assets and liabilities compliant with IAS 12 and Nigeria Tax Act 2025.
              </p>
              <ul className="text-left max-w-md mx-auto space-y-2 mb-6">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Auto-calculate Carrying Amount & TWDV
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  9 categories of temporary differences
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Professional PDF reports
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Journal entry guidance
                </li>
              </ul>
            </div>
            <Button 
              onClick={() => openUpgradeModal ? openUpgradeModal('pro') : (onShowUpgradeModal && onShowUpgradeModal())}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white"
            >
              Upgrade to Pro
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Progress bar component
  const ProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        {[
          { step: 1, label: 'Company Profile' },
          { step: 2, label: 'Temporary Differences' },
          { step: 3, label: 'Computing' },
          { step: 4, label: 'Results' }
        ].map((item, index) => (
          <div key={item.step} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              currentStep >= item.step 
                ? 'bg-yellow-500 text-white' 
                : 'bg-gray-200 text-gray-500'
            }`}>
              {currentStep > item.step ? <CheckCircle className="h-5 w-5" /> : item.step}
            </div>
            <span className={`ml-2 text-sm hidden sm:inline ${
              currentStep >= item.step ? 'text-gray-900 font-medium' : 'text-gray-500'
            }`}>
              {item.label}
            </span>
            {index < 3 && (
              <div className={`w-12 sm:w-24 h-1 mx-2 ${
                currentStep > item.step ? 'bg-yellow-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
  
  // Collapsible section header
  const SectionHeader = ({ title, section, icon: Icon }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <div className="flex items-center space-x-3">
        <Icon className="h-5 w-5 text-gray-600" />
        <span className="font-medium text-gray-900">{title}</span>
      </div>
      {expandedSections[section] ? (
        <ChevronUp className="h-5 w-5 text-gray-400" />
      ) : (
        <ChevronDown className="h-5 w-5 text-gray-400" />
      )}
    </button>
  );
  
  // Temp diff display with color coding
  const TempDiffDisplay = ({ carrying, taxBase }) => {
    const diff = calcTempDiff(carrying, taxBase);
    if (!carrying && !taxBase) return <span className="text-gray-400">-</span>;
    
    if (diff > 0) {
      return (
        <span className="text-red-600 font-medium">
          {formatCurrency(diff)} <span className="text-xs">(DTL)</span>
        </span>
      );
    } else if (diff < 0) {
      return (
        <span className="text-green-600 font-medium">
          {formatCurrency(Math.abs(diff))} <span className="text-xs">(DTA)</span>
        </span>
      );
    }
    return <span className="text-gray-500">No difference</span>;
  };

  return (
    <>
    {/* Bobbing Entry Indicator */}
    <CalculatorEntryIndicator />
    
    <div className="max-w-5xl mx-auto">
      {/* Header Card */}
      <Card className="bg-white shadow-lg mb-6">
        <CardHeader className="rounded-t-lg" style={{ background: 'linear-gradient(to right, #1a1a2e, #16213e)', color: '#D4AF37' }}>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2" style={{ color: '#D4AF37' }}>
                <Calculator className="h-5 w-5" />
                <span>Deferred Tax Calculator</span>
              </CardTitle>
              <CardDescription style={{ color: '#9CA3AF' }}>
                IAS 12 & NTA 2025 compliant computation
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {onOpenTemplates && (
                <Button
                  onClick={onOpenTemplates}
                  size="sm"
                  className="shadow-lg rounded-full hover:opacity-90"
                  style={{ backgroundColor: '#B89750', color: 'white' }}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Saved Templates
                  {!hasTemplateAccess && <Lock className="h-3 w-3 ml-1" />}
                </Button>
              )}
              {onShowUserGuide && (
                <Button
                  onClick={onShowUserGuide}
                  size="sm"
                  className="bg-gray-900 hover:bg-gray-800 text-white shadow-lg animate-pulse-glow rounded-full"
                >
                  <HelpCircle className="h-4 w-4 mr-1" />
                  User Guide
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <ProgressBar />
          
          {/* Step 1: Company Profile */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-gray-600" />
                Company Profile
              </h3>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    placeholder="ABC Nigeria Limited"
                    value={companyProfile.company_name}
                    onChange={(e) => handleProfileChange('company_name', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="financial_year_end">Financial Year End *</Label>
                  <Input
                    id="financial_year_end"
                    type="date"
                    value={companyProfile.financial_year_end}
                    onChange={(e) => handleProfileChange('financial_year_end', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label>Company Size Classification *</Label>
                <div className="grid sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleProfileChange('company_size', 'standard')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      companyProfile.company_size === 'standard'
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">Standard Company</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Turnover &gt;₦100M OR Fixed Assets &gt;₦250M
                    </div>
                    <div className="text-xs text-yellow-600 mt-2 font-medium">
                      Tax Rate: 34% (30% CIT + 4% Dev. Levy)
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleProfileChange('company_size', 'small')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      companyProfile.company_size === 'small'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">Small Company</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Turnover ≤₦100M AND Fixed Assets ≤₦250M
                    </div>
                    <div className="text-xs text-green-600 mt-2 font-medium">
                      Tax Rate: 0% (Exempt under NTA 2025)
                    </div>
                  </button>
                </div>
              </div>
              
              {/* Tax Law Version Selection */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  Capital Allowance Basis *
                  <Info className="h-4 w-4 text-gray-400" />
                </Label>
                <div className="grid sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setTaxLawVersion('nta_2025')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      taxLawVersion === 'nta_2025'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      NTA 2025
                      <Badge variant="outline" className="text-xs border-blue-500 text-blue-600">Recommended</Badge>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Initial Allowances abolished
                    </div>
                    <div className="text-xs text-blue-600 mt-2 font-medium">
                      Only Annual Allowances apply
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setTaxLawVersion('old_law')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      taxLawVersion === 'old_law'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">Old Law (Pre-NTA)</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Initial Allowances included
                    </div>
                    <div className="text-xs text-purple-600 mt-2 font-medium">
                      Initial + Annual Allowances apply
                    </div>
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Select the capital allowance regime to use for computing tax written-down values (TWDV).
                </p>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="turnover">Annual Turnover (₦) *</Label>
                  <Input
                    id="turnover"
                    type="number"
                    placeholder="500,000,000"
                    value={companyProfile.turnover}
                    onChange={(e) => handleProfileChange('turnover', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fixed_assets">Total Fixed Assets (₦) *</Label>
                  <Input
                    id="fixed_assets"
                    type="number"
                    placeholder="280,000,000"
                    value={companyProfile.fixed_assets}
                    onChange={(e) => handleProfileChange('fixed_assets', e.target.value)}
                  />
                </div>
              </div>
              
              {companyProfile.company_size && (
                <Alert className={companyProfile.company_size === 'small' ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
                  <Info className={`h-4 w-4 ${companyProfile.company_size === 'small' ? 'text-green-600' : 'text-yellow-600'}`} />
                  <AlertDescription className={companyProfile.company_size === 'small' ? 'text-green-800' : 'text-yellow-800'}>
                    {companyProfile.company_size === 'small' 
                      ? 'Small companies are exempt from CIT under NTA 2025. Deferred Tax = ₦0'
                      : `Applicable Deferred Tax Rate: 34% (30% CIT + 4% Development Levy)`
                    }
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    if (companyProfile.company_size === 'small') {
                      computeDeferredTax();
                    } else {
                      setCurrentStep(2);
                    }
                  }}
                  disabled={!validateStep1()}
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  {companyProfile.company_size === 'small' ? 'Calculate' : 'Next'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          
          {/* Step 2: Temporary Differences Input */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Temporary Differences Input</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={taxLawVersion === 'nta_2025' ? 'border-blue-500 text-blue-600' : 'border-purple-500 text-purple-600'}>
                    {taxLawVersion === 'nta_2025' ? 'NTA 2025' : 'Old Law'}
                  </Badge>
                  <Badge variant="outline">Tax Rate: {(taxRate * 100).toFixed(0)}%</Badge>
                </div>
              </div>
              
              <p className="text-sm text-gray-600">
                Enter asset details and the calculator will compute carrying amounts and tax bases automatically.
                {taxLawVersion === 'nta_2025' 
                  ? ' Tax bases use NTA 2025 rates (no initial allowances).'
                  : ' Tax bases use old law rates (including initial allowances).'}
              </p>
              
              {/* Section A: PPE with Auto/Manual Toggle */}
              <div className="border rounded-lg overflow-hidden">
                <SectionHeader title="A. Property, Plant & Equipment (PPE)" section="ppe" icon={Building2} />
                {expandedSections.ppe && (
                  <div className="p-4 space-y-4">
                    {/* Mode Toggle */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">Input Mode:</span>
                      </div>
                      <div className="flex bg-white rounded-lg p-1 border">
                        <button
                          onClick={() => setPpeInputMode('auto')}
                          className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                            ppeInputMode === 'auto'
                              ? 'bg-yellow-500 text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <Zap className="h-4 w-4 mr-1.5" />
                          Auto Calculate
                        </button>
                        <button
                          onClick={() => setPpeInputMode('manual')}
                          className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                            ppeInputMode === 'manual'
                              ? 'bg-gray-800 text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <Settings className="h-4 w-4 mr-1.5" />
                          Manual Entry
                        </button>
                      </div>
                    </div>
                    
                    {ppeInputMode === 'auto' ? (
                      <>
                        <Alert className={taxLawVersion === 'nta_2025' ? "border-blue-200 bg-blue-50" : "border-purple-200 bg-purple-50"}>
                          <Info className={taxLawVersion === 'nta_2025' ? "h-4 w-4 text-blue-600" : "h-4 w-4 text-purple-600"} />
                          <AlertDescription className={taxLawVersion === 'nta_2025' ? "text-blue-800 text-sm" : "text-purple-800 text-sm"}>
                            <strong>Auto Mode ({taxLawVersion === 'nta_2025' ? 'NTA 2025' : 'Old Law'}):</strong> Enter Cost, Depreciation Rate & Years. The calculator will compute:
                            <br />• <strong>Carrying Amount</strong> = Cost - Accumulated Depreciation (accounting)
                            <br />• <strong>TWDV</strong> = Cost - Capital Allowances ({taxLawVersion === 'nta_2025' ? 'Annual only, no Initial' : 'Initial + Annual rates'})
                          </AlertDescription>
                        </Alert>
                        
                        <div className="space-y-4">
                          {temporaryDifferences.ppe.map((item, index) => {
                            const rates = taxLawVersion === 'old_law' 
                              ? CAPITAL_ALLOWANCE_RATES_OLD[item.asset_type] 
                              : CAPITAL_ALLOWANCE_RATES_NTA[item.asset_type];
                            return (
                            <div key={index} className="p-4 border rounded-lg bg-white">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-gray-900">{item.asset_type}</h4>
                                {item.asset_type !== 'Land' && rates && (
                                  <span className="text-xs text-gray-500">
                                    CA Rate: {taxLawVersion === 'old_law' && rates.initial > 0 
                                      ? `Initial ${(rates.initial * 100)}% + ` 
                                      : ''}Annual {(rates.annual * 100)}%
                                  </span>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="space-y-1">
                                  <Label className="text-xs">Original Cost (₦)</Label>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    value={item.cost}
                                    onChange={(e) => handlePPEAutoChange(index, 'cost', e.target.value)}
                                    className="h-9"
                                  />
                                </div>
                                
                                <div className="space-y-1">
                                  <Label className="text-xs">Depreciation Rate (%)</Label>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    value={item.depreciation_rate}
                                    onChange={(e) => handlePPEAutoChange(index, 'depreciation_rate', e.target.value)}
                                    className="h-9"
                                    disabled={item.asset_type === 'Land'}
                                  />
                                </div>
                                
                                <div className="space-y-1">
                                  <Label className="text-xs">Years Used</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={item.years_used}
                                    onChange={(e) => handlePPEAutoChange(index, 'years_used', e.target.value)}
                                    className="h-9"
                                  />
                                </div>
                                
                                <div className="space-y-1">
                                  <Label className="text-xs">Method</Label>
                                  <select
                                    value={item.depreciation_method}
                                    onChange={(e) => handlePPEAutoChange(index, 'depreciation_method', e.target.value)}
                                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                                    disabled={item.asset_type === 'Land'}
                                  >
                                    <option value="straight_line">Straight Line</option>
                                    <option value="reducing_balance">Reducing Balance</option>
                                  </select>
                                </div>
                              </div>
                              
                              {/* Calculated Results */}
                              {item.cost && item.years_used && (
                                <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-3 text-sm">
                                  <div className="p-2 bg-gray-50 rounded">
                                    <div className="text-xs text-gray-500">Carrying Amount</div>
                                    <div className="font-semibold text-gray-900">{formatCurrency(parseFloat(item.carrying_amount) || 0)}</div>
                                  </div>
                                  <div className="p-2 bg-gray-50 rounded">
                                    <div className="text-xs text-gray-500">Tax Base (TWDV)</div>
                                    <div className="font-semibold text-gray-900">{formatCurrency(parseFloat(item.tax_base) || 0)}</div>
                                  </div>
                                  <div className={`p-2 rounded ${calcTempDiff(item.carrying_amount, item.tax_base) > 0 ? 'bg-red-50' : calcTempDiff(item.carrying_amount, item.tax_base) < 0 ? 'bg-green-50' : 'bg-gray-50'}`}>
                                    <div className="text-xs text-gray-500">Temp. Difference</div>
                                    <TempDiffDisplay carrying={item.carrying_amount} taxBase={item.tax_base} />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                          })}
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-gray-500">
                          <HelpCircle className="h-4 w-4 inline mr-1" />
                          Manual Mode: Enter Carrying Amount and Tax Base directly.
                        </p>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b bg-gray-50">
                                <th className="text-left p-2 font-medium">Asset Type</th>
                                <th className="text-right p-2 font-medium">Carrying Amount (₦)</th>
                                <th className="text-right p-2 font-medium">Tax Base / TWDV (₦)</th>
                                <th className="text-right p-2 font-medium">Temp. Difference</th>
                              </tr>
                            </thead>
                            <tbody>
                              {temporaryDifferences.ppe.map((item, index) => (
                                <tr key={index} className="border-b">
                                  <td className="p-2 text-gray-700">{item.asset_type}</td>
                                  <td className="p-2">
                                    <Input
                                      type="number"
                                      className="text-right"
                                      placeholder="0"
                                      value={item.carrying_amount}
                                      onChange={(e) => handlePPEManualChange(index, 'carrying_amount', e.target.value)}
                                    />
                                  </td>
                                  <td className="p-2">
                                    <Input
                                      type="number"
                                      className="text-right"
                                      placeholder="0"
                                      value={item.tax_base}
                                      onChange={(e) => handlePPEManualChange(index, 'tax_base', e.target.value)}
                                    />
                                  </td>
                                  <td className="p-2 text-right">
                                    <TempDiffDisplay carrying={item.carrying_amount} taxBase={item.tax_base} />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              {/* Section B: Inventory */}
              <div className="border rounded-lg overflow-hidden">
                <SectionHeader title="B. Inventory" section="inventory" icon={FileText} />
                {expandedSections.inventory && (
                  <div className="p-4 space-y-4">
                    <p className="text-sm text-gray-500">
                      <HelpCircle className="h-4 w-4 inline mr-1" />
                      If inventory written down to NRV, enter amounts below. Write-downs create deductible differences (DTA).
                    </p>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Carrying Amount (₦)</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={temporaryDifferences.inventory.carrying_amount}
                          onChange={(e) => setTemporaryDifferences(prev => ({
                            ...prev,
                            inventory: { ...prev.inventory, carrying_amount: e.target.value }
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tax Base (Original Cost) (₦)</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={temporaryDifferences.inventory.tax_base}
                          onChange={(e) => setTemporaryDifferences(prev => ({
                            ...prev,
                            inventory: { ...prev.inventory, tax_base: e.target.value }
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Temp. Difference</Label>
                        <div className="h-10 flex items-center">
                          <TempDiffDisplay 
                            carrying={temporaryDifferences.inventory.carrying_amount} 
                            taxBase={temporaryDifferences.inventory.tax_base} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Section C: Trade Receivables */}
              <div className="border rounded-lg overflow-hidden">
                <SectionHeader title="C. Trade Receivables (ECL/Impairment)" section="receivables" icon={FileText} />
                {expandedSections.receivables && (
                  <div className="p-4 space-y-4">
                    <p className="text-sm text-gray-500">
                      <HelpCircle className="h-4 w-4 inline mr-1" />
                      ECL under IFRS 9 creates deductible temporary differences until actually written off for tax.
                    </p>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Gross Receivables (₦)</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={temporaryDifferences.receivables.gross_receivables}
                          onChange={(e) => setTemporaryDifferences(prev => ({
                            ...prev,
                            receivables: { ...prev.receivables, gross_receivables: e.target.value }
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>ECL/Impairment Allowance (₦)</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={temporaryDifferences.receivables.ecl_impairment}
                          onChange={(e) => setTemporaryDifferences(prev => ({
                            ...prev,
                            receivables: { ...prev.receivables, ecl_impairment: e.target.value }
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tax Deductible Bad Debts (₦)</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={temporaryDifferences.receivables.tax_deductible_amount}
                          onChange={(e) => setTemporaryDifferences(prev => ({
                            ...prev,
                            receivables: { ...prev.receivables, tax_deductible_amount: e.target.value }
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Section D: Provisions */}
              <div className="border rounded-lg overflow-hidden">
                <SectionHeader title="D. Provisions & Accruals" section="provisions" icon={FileText} />
                {expandedSections.provisions && (
                  <div className="p-4 space-y-4">
                    <p className="text-sm text-gray-500">
                      <HelpCircle className="h-4 w-4 inline mr-1" />
                      Provisions are not tax-deductible until paid. All provisions create deductible temporary differences (DTA).
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {temporaryDifferences.provisions.map((item, index) => (
                        <div key={index} className="space-y-2">
                          <Label>{item.provision_type}</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={item.carrying_amount}
                            onChange={(e) => handleProvisionChange(index, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Section E: Contract Assets & Liabilities */}
              <div className="border rounded-lg overflow-hidden">
                <SectionHeader title="E. Contract Assets & Liabilities (IFRS 15)" section="contracts" icon={FileText} />
                {expandedSections.contracts && (
                  <div className="p-4 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Contract Asset (Accrued Revenue) (₦)</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={temporaryDifferences.contract_assets.carrying_amount}
                          onChange={(e) => setTemporaryDifferences(prev => ({
                            ...prev,
                            contract_assets: { carrying_amount: e.target.value }
                          }))}
                        />
                        <p className="text-xs text-gray-500">Creates DTA - revenue recognized but not yet taxable</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Contract Liability (Advance Payment) (₦)</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={temporaryDifferences.contract_liabilities.carrying_amount}
                          onChange={(e) => setTemporaryDifferences(prev => ({
                            ...prev,
                            contract_liabilities: { carrying_amount: e.target.value }
                          }))}
                        />
                        <p className="text-xs text-gray-500">Creates DTL - cash taxed but revenue not yet recognized</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Section F: Revaluation */}
              <div className="border rounded-lg overflow-hidden">
                <SectionHeader title="F. Revaluation Surplus" section="revaluation" icon={FileText} />
                {expandedSections.revaluation && (
                  <div className="p-4 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Original Cost (₦)</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={temporaryDifferences.revaluation.original_cost}
                          onChange={(e) => setTemporaryDifferences(prev => ({
                            ...prev,
                            revaluation: { ...prev.revaluation, original_cost: e.target.value }
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Revalued Amount (₦)</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={temporaryDifferences.revaluation.revalued_amount}
                          onChange={(e) => setTemporaryDifferences(prev => ({
                            ...prev,
                            revaluation: { ...prev.revaluation, revalued_amount: e.target.value }
                          }))}
                        />
                      </div>
                    </div>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={temporaryDifferences.revaluation.recognized_in_equity}
                        onChange={(e) => setTemporaryDifferences(prev => ({
                          ...prev,
                          revaluation: { ...prev.revaluation, recognized_in_equity: e.target.checked }
                        }))}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">This revaluation surplus was recognized in equity (not profit/loss)</span>
                    </label>
                  </div>
                )}
              </div>
              
              {/* Section G: Leases */}
              <div className="border rounded-lg overflow-hidden">
                <SectionHeader title="G. Leases (IFRS 16)" section="leases" icon={FileText} />
                {expandedSections.leases && (
                  <div className="p-4 space-y-4">
                    <p className="text-sm text-gray-500">
                      <HelpCircle className="h-4 w-4 inline mr-1" />
                      ROU Asset creates DTL, Lease Liability creates DTA. Net impact is usually small.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Right-of-Use (ROU) Asset (₦)</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={temporaryDifferences.leases.rou_asset}
                          onChange={(e) => setTemporaryDifferences(prev => ({
                            ...prev,
                            leases: { ...prev.leases, rou_asset: e.target.value }
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Lease Liability (₦)</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={temporaryDifferences.leases.lease_liability}
                          onChange={(e) => setTemporaryDifferences(prev => ({
                            ...prev,
                            leases: { ...prev.leases, lease_liability: e.target.value }
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Section H: Tax Losses */}
              <div className="border rounded-lg overflow-hidden">
                <SectionHeader title="H. Tax Loss Carryforward" section="taxLosses" icon={FileText} />
                {expandedSections.taxLosses && (
                  <div className="p-4 space-y-4">
                    <div className="space-y-2">
                      <Label>Tax Losses Carried Forward (₦)</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={temporaryDifferences.tax_losses.amount}
                        onChange={(e) => setTemporaryDifferences(prev => ({
                          ...prev,
                          tax_losses: { ...prev.tax_losses, amount: e.target.value }
                        }))}
                      />
                    </div>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={temporaryDifferences.tax_losses.has_evidence_of_future_profits}
                        onChange={(e) => setTemporaryDifferences(prev => ({
                          ...prev,
                          tax_losses: { ...prev.tax_losses, has_evidence_of_future_profits: e.target.checked }
                        }))}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">I have evidence of future taxable profits (profit forecasts, business plan)</span>
                    </label>
                    {temporaryDifferences.tax_losses.amount && !temporaryDifferences.tax_losses.has_evidence_of_future_profits && (
                      <Alert className="border-orange-200 bg-orange-50">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <AlertDescription className="text-orange-800 text-sm">
                          Without evidence of future profits, the deferred tax asset on tax losses may not be recognized.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </div>
              
              {/* Section I: Other */}
              <div className="border rounded-lg overflow-hidden">
                <SectionHeader title="I. Other Temporary Differences" section="other" icon={FileText} />
                {expandedSections.other && (
                  <div className="p-4 space-y-4">
                    {temporaryDifferences.other.length > 0 && (
                      <div className="space-y-3">
                        {temporaryDifferences.other.map((item, index) => (
                          <div key={index} className="grid grid-cols-5 gap-2 items-end">
                            <div className="col-span-2">
                              <Label>Description</Label>
                              <Input
                                placeholder="Description"
                                value={item.description}
                                onChange={(e) => {
                                  const newOther = [...temporaryDifferences.other];
                                  newOther[index].description = e.target.value;
                                  setTemporaryDifferences(prev => ({ ...prev, other: newOther }));
                                }}
                              />
                            </div>
                            <div>
                              <Label>Carrying (₦)</Label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={item.carrying_amount}
                                onChange={(e) => {
                                  const newOther = [...temporaryDifferences.other];
                                  newOther[index].carrying_amount = e.target.value;
                                  setTemporaryDifferences(prev => ({ ...prev, other: newOther }));
                                }}
                              />
                            </div>
                            <div>
                              <Label>Tax Base (₦)</Label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={item.tax_base}
                                onChange={(e) => {
                                  const newOther = [...temporaryDifferences.other];
                                  newOther[index].tax_base = e.target.value;
                                  setTemporaryDifferences(prev => ({ ...prev, other: newOther }));
                                }}
                              />
                            </div>
                            <div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeOtherRow(index)}
                                className="w-full text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <Button
                      variant="outline"
                      onClick={addOtherRow}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Another Row
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <Button
                  onClick={computeDeferredTax}
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  Calculate Deferred Tax
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          
          {/* Step 3: Computing */}
          {currentStep === 3 && isComputing && (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Computing Deferred Tax...</h3>
              <p className="text-gray-600">Applying IAS 12 recognition criteria</p>
            </div>
          )}
          
          {/* Step 4: Results */}
          {currentStep === 4 && results && (
            <div className="space-y-6">
              {/* Results Summary Card */}
              <div className={`p-6 rounded-xl ${
                results.isSmallCompany 
                  ? 'bg-green-50 border-2 border-green-200'
                  : results.netType === 'liability'
                    ? 'bg-red-50 border-2 border-red-200'
                    : results.netType === 'asset'
                      ? 'bg-green-50 border-2 border-green-200'
                      : 'bg-gray-50 border-2 border-gray-200'
              }`}>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {companyProfile.company_name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">
                    Financial Year End: {new Date(companyProfile.financial_year_end).toLocaleDateString('en-NG')} | Tax Rate: {(results.taxRate * 100 || 0).toFixed(0)}%
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Capital Allowance Basis: <span className={taxLawVersion === 'nta_2025' ? 'text-blue-600 font-medium' : 'text-purple-600 font-medium'}>
                      {taxLawVersion === 'nta_2025' ? 'NTA 2025 (No Initial Allowances)' : 'Old Law (With Initial Allowances)'}
                    </span>
                  </p>
                  
                  <div className="text-3xl font-bold mb-2" style={{ color: results.netType === 'liability' ? '#DC2626' : results.netType === 'asset' ? '#16A34A' : '#6B7280' }}>
                    {results.isSmallCompany 
                      ? 'EXEMPT'
                      : results.netType === 'liability'
                        ? `Net DTL: ${formatCurrency(results.netPosition)}`
                        : results.netType === 'asset'
                          ? `Net DTA: ${formatCurrency(results.netPosition)}`
                          : 'No Net Deferred Tax'
                    }
                  </div>
                  
                  <p className="text-gray-600">
                    {results.isSmallCompany 
                      ? results.message
                      : results.netType === 'liability'
                        ? 'You will pay MORE tax in the future'
                        : results.netType === 'asset'
                          ? 'You will pay LESS tax in the future'
                          : 'Your temporary differences are perfectly balanced'
                    }
                  </p>
                </div>
              </div>
              
              {/* Warnings */}
              {results.warnings && results.warnings.length > 0 && (
                <div className="space-y-2">
                  {results.warnings.map((warning, index) => (
                    <Alert key={index} className="border-orange-200 bg-orange-50">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-orange-800 text-sm">
                        {warning}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
              
              {/* Detailed Breakdown */}
              {!results.isSmallCompany && (
                <>
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Gross vs. Net Position</h4>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="p-4 bg-red-50 rounded-lg text-center">
                        <div className="text-sm text-gray-600">Gross DTL</div>
                        <div className="text-xl font-bold text-red-600">{formatCurrency(results.grossDTL)}</div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg text-center">
                        <div className="text-sm text-gray-600">Gross DTA</div>
                        <div className="text-xl font-bold text-green-600">({formatCurrency(results.grossDTA)})</div>
                      </div>
                      <div className={`p-4 rounded-lg text-center ${results.netType === 'liability' ? 'bg-red-100' : 'bg-green-100'}`}>
                        <div className="text-sm text-gray-600">Net Position</div>
                        <div className={`text-xl font-bold ${results.netType === 'liability' ? 'text-red-700' : 'text-green-700'}`}>
                          {results.netType === 'liability' ? '' : '('}{formatCurrency(results.netPosition)}{results.netType === 'liability' ? '' : ')'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Journal Entry Guide */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Journal Entry Guide</h4>
                    <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
                      {results.netType === 'asset' ? (
                        <>
                          <div className="flex justify-between mb-1">
                            <span>Dr. Deferred Tax Asset (SOFP)</span>
                            <span>{formatCurrency(results.netPosition)}</span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span className="ml-8">Cr. Deferred Tax Income (P&L)</span>
                            <span>{formatCurrency(results.netPosition)}</span>
                          </div>
                        </>
                      ) : results.netType === 'liability' ? (
                        <>
                          <div className="flex justify-between mb-1">
                            <span>Dr. Deferred Tax Expense (P&L)</span>
                            <span>{formatCurrency(results.netPosition)}</span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span className="ml-8">Cr. Deferred Tax Liability (SOFP)</span>
                            <span>{formatCurrency(results.netPosition)}</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-gray-600">No journal entry required - balanced position</div>
                      )}
                    </div>
                    {results.breakdown?.revaluation?.taxable > 0 && temporaryDifferences.revaluation.recognized_in_equity && (
                      <p className="text-xs text-gray-500 mt-2">
                        Note: Deferred tax on revaluation surplus should be recognized in equity (Revaluation Reserve), not P&L.
                      </p>
                    )}
                  </div>
                </>
              )}
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={resetCalculator}
                >
                  New Calculation
                </Button>
                
                {hasFeature && hasFeature('pdf_export') && (
                  <Button
                    onClick={() => generateDeferredTaxReport(companyProfile, temporaryDifferences, results, formatCurrency, taxLawVersion)}
                    className="bg-black hover:bg-gray-800 text-white"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                )}
                
                {onSaveCalculation && (
                  <Button
                    variant="outline"
                    onClick={() => onSaveCalculation('deferred_tax', { companyProfile, temporaryDifferences, ppeInputMode, taxLawVersion }, results)}
                    disabled={savesUsed >= savesLimit}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save ({savesUsed}/{savesLimit})
                  </Button>
                )}
                
                {onSaveTemplate && (
                  <Button
                    variant="outline"
                    onClick={() => onSaveTemplate({ companyProfile, temporaryDifferences, ppeInputMode, taxLawVersion })}
                    className="border-amber-500 text-amber-700 hover:bg-amber-50"
                    disabled={!hasTemplateAccess}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Save as Template
                    {!hasTemplateAccess && <Lock className="ml-2 h-3 w-3" />}
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Upgrade Prompt Modal */}
      {showUpgradePrompt && (
        <UpgradePrompt
          feature="Deferred Tax Calculator"
          onClose={() => setShowUpgradePrompt(false)}
          onUpgrade={() => {
            setShowUpgradePrompt(false);
            onShowUpgradeModal && onShowUpgradeModal();
          }}
        />
      )}
    </div>
    </>
  );
};

export default DeferredTaxCalculator;
