import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card.jsx';
import { Badge } from './ui/badge.jsx';
import { Button } from './ui/button.jsx';
import { 
  Users, 
  Building2, 
  ChevronRight, 
  Printer, 
  DollarSign,
  FileText,
  Eye,
  History as HistoryIcon,
  Calendar,
  Save,
  Tag,
  Trash2,
  Download,
  FileSpreadsheet,
  Calculator,
  TrendingUp,
  Receipt,
  Lock,
  Mail
} from 'lucide-react';
import { generatePayeReport, generateCitReport, generateCgtReport, generateVatReport } from '../utils/pdfGenerator';
import { generateDetailedReport } from '../utils/detailedExcelReport';
import UpgradePrompt from './UpgradePrompt';
import ExcelDownloadLimitModal from './ExcelDownloadLimitModal';
import { useUpgrade } from '../hooks/useUpgrade';
import * as XLSX from 'xlsx';

const API = process.env.REACT_APP_BACKEND_URL;

const EnhancedHistory = ({ history, citHistory, formatCurrency, hasFeature, historyLocked = false, onUnlockHistory, onShowUpgradeModal }) => {
  const [activeView, setActiveView] = useState(historyLocked ? 'saved' : 'history'); // Default to 'saved' if history is locked
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [savedCalculations, setSavedCalculations] = useState([]);
  const [savedCalcsLoading, setSavedCalcsLoading] = useState(false);
  const [savedCalcsTotal, setSavedCalcsTotal] = useState(0);
  const { startTrial, requestUpgrade } = useUpgrade();
  
  // Excel download limit state
  const [showExcelLimitModal, setShowExcelLimitModal] = useState(false);
  const [excelDownloadsUsed, setExcelDownloadsUsed] = useState(0);
  const [excelDownloadsLimit, setExcelDownloadsLimit] = useState(1);
  const [userTier, setUserTier] = useState('free');
  const [isDownloading, setIsDownloading] = useState(null); // Track which calc is downloading

  // Fetch saved calculations when view changes to 'saved'
  useEffect(() => {
    if (activeView === 'saved') {
      fetchSavedCalculations();
    }
  }, [activeView]);

  const fetchSavedCalculations = async () => {
    setSavedCalcsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setSavedCalculations([]);
        return;
      }
      const response = await axios.get(`${API}/api/calculations/saved?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedCalculations(response.data.calculations || []);
      setSavedCalcsTotal(response.data.total || 0);
    } catch (error) {
      console.error('Error fetching saved calculations:', error);
      setSavedCalculations([]);
    } finally {
      setSavedCalcsLoading(false);
    }
  };

  const handleDeleteSaved = async (calcId) => {
    if (!window.confirm('Are you sure you want to delete this saved calculation?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/api/calculations/${calcId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh the list
      fetchSavedCalculations();
    } catch (error) {
      console.error('Error deleting saved calculation:', error);
      alert('Failed to delete calculation');
    }
  };

  const handleUpgrade = async () => {
    const result = await requestUpgrade('pro');
    if (result.success) {
      setShowUpgradePrompt(false);
    }
  };

  const handleTrial = async () => {
    const result = await startTrial('pro');
    if (result.success) {
      setShowUpgradePrompt(false);
    } else {
      alert(result.message);
    }
  };

  // Handle detailed Excel report download
  const handleDetailedExcelDownload = async (savedCalc) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to download detailed reports');
      return;
    }
    
    setIsDownloading(savedCalc.id);
    
    try {
      // First, check/track the download with backend
      const response = await axios.post(`${API}/api/excel-downloads/track`, {
        calculation_id: savedCalc.id,
        calculation_type: savedCalc.calculation_type
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.data.success) {
        // User hit their limit
        setExcelDownloadsUsed(response.data.downloads_used);
        setExcelDownloadsLimit(response.data.downloads_limit);
        setUserTier(response.data.tier);
        setShowExcelLimitModal(true);
        return;
      }
      
      // Download allowed - generate the report
      generateDetailedReport(savedCalc);
      
      // Update local state
      setExcelDownloadsUsed(response.data.downloads_used);
      setExcelDownloadsLimit(response.data.downloads_limit);
      setUserTier(response.data.tier);
      
    } catch (error) {
      console.error('Error downloading detailed report:', error);
      alert('Failed to download report. Please try again.');
    } finally {
      setIsDownloading(null);
    }
  };

  const handleUpgradeFromExcelModal = () => {
    setShowExcelLimitModal(false);
    if (onShowUpgradeModal) {
      onShowUpgradeModal();
    } else {
      setShowUpgradePrompt(true);
    }
  };

  const toggleExpanded = (id, type) => {
    const itemKey = `${type}-${id}`;
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemKey)) {
        newSet.delete(itemKey);
      } else {
        newSet.add(itemKey);
      }
      return newSet;
    });
  };

  const isExpanded = (id, type) => {
    return expandedItems.has(`${type}-${id}`);
  };

  const handlePrintPAYE = (calculation) => {
    if (!hasFeature || !hasFeature('pdf_export')) {
      setShowUpgradePrompt(true);
      return;
    }
    
    try {
      // Reconstruct taxInput with all fields the calculator uses
      const taxInput = {
        staff_name: calculation.staff_name || 'Historical Calculation',
        tin: calculation.tin || '',
        month: calculation.month || new Date(calculation.timestamp).toLocaleDateString('en-US', { month: 'long' }),
        year: calculation.year || new Date(calculation.timestamp).getFullYear().toString(),
        state_of_residence: calculation.state_of_residence || 'Not specified',
        tax_authority: calculation.tax_authority || '',
        basic_salary: calculation.basic_salary || 0,
        transport_allowance: calculation.transport_allowance || 0,
        housing_allowance: calculation.housing_allowance || 0,
        meal_allowance: calculation.meal_allowance || 0,
        utility_allowance: calculation.utility_allowance || 0,
        medical_allowance: calculation.medical_allowance || 0,
        other_allowances: calculation.other_allowances || 0,
        bik_vehicle_value: calculation.bik_vehicle_value || 0,
        bik_housing_value: calculation.bik_housing_value || 0,
        bonus: calculation.bonus || 0,
        pension_contribution: calculation.pension_contribution || 0,
        nhf_contribution: calculation.nhf_contribution || 0,
        nhf_applicable: calculation.nhf_applicable !== false,
        life_insurance_premium: calculation.life_insurance_premium || 0,
        health_insurance_premium: calculation.health_insurance_premium || 0,
        nhis_contribution: calculation.nhis_contribution || 0,
        annual_rent: calculation.annual_rent || 0,
        mortgage_interest: calculation.mortgage_interest || 0
      };

      // Calculate annual values from monthly if not present
      const annualTax = calculation.tax_due || calculation.annual_tax || (calculation.monthly_tax * 12);
      const annualNet = calculation.net_annual_income || calculation.annual_net_income || (calculation.monthly_net_income * 12);

      // The result object for PDF generation - match exact field names expected by pdfGenerator
      const result = {
        monthly_gross_income: calculation.monthly_gross_income,
        annual_gross_income: calculation.annual_gross_income,
        total_reliefs: calculation.total_reliefs,
        taxable_income: calculation.taxable_income,
        tax_due: annualTax,
        monthly_tax: calculation.monthly_tax,
        effective_tax_rate: calculation.effective_tax_rate,
        net_annual_income: annualNet,
        monthly_net_income: calculation.monthly_net_income,
        // Tax breakdown for the PDF bands section
        tax_breakdown: calculation.tax_breakdown || calculation.tax_bands || [],
        // Relief breakdown values
        cra_relief: calculation.cra_relief || 0,
        pension_relief: calculation.pension_relief || 0,
        nhf_relief: calculation.nhf_relief || 0,
        nhis_relief: calculation.nhis_relief || 0,
        life_insurance_relief: calculation.life_insurance_relief || 0,
        health_insurance_relief: calculation.health_insurance_relief || 0,
        rent_relief: calculation.rent_relief || 0,
        mortgage_interest_relief: calculation.mortgage_interest_relief || 0
      };

      generatePayeReport(taxInput, result);
    } catch (error) {
      console.error('Error generating PAYE report:', error);
      alert('Failed to generate PDF report. Please try again.');
    }
  };

  const handlePrintCIT = (calculation) => {
    if (!hasFeature || !hasFeature('pdf_export')) {
      setShowUpgradePrompt(true);
      return;
    }
    
    try {
      const citInput = {
        company_name: calculation.company_name || 'Historical Calculation',
        year_of_assessment: calculation.year_of_assessment || new Date(calculation.timestamp).getFullYear().toString(),
        tax_year: calculation.tax_year || new Date(calculation.timestamp).getFullYear().toString(),
        annual_turnover: calculation.annual_turnover || 0,
        total_fixed_assets: calculation.total_fixed_assets || 0,
        gross_income: calculation.gross_income || 0,
        other_income: calculation.other_income || 0,
        cost_of_goods_sold: calculation.cost_of_goods_sold || 0,
        staff_costs: calculation.staff_costs || 0,
        rent_expenses: calculation.rent_expenses || 0,
        professional_fees: calculation.professional_fees || 0,
        depreciation: calculation.depreciation || 0,
        interest_paid_unrelated: calculation.interest_paid_unrelated || 0,
        interest_paid_related: calculation.interest_paid_related || 0,
        other_deductible_expenses: calculation.other_deductible_expenses || 0,
        entertainment_expenses: calculation.entertainment_expenses || 0,
        fines_penalties: calculation.fines_penalties || 0,
        personal_expenses: calculation.personal_expenses || 0,
        excessive_interest: calculation.excessive_interest || 0,
        other_non_deductible: calculation.other_non_deductible || 0,
        carry_forward_losses: calculation.carry_forward_losses || 0,
        buildings_cost: calculation.buildings_cost || 0,
        furniture_fittings_cost: calculation.furniture_fittings_cost || 0,
        plant_machinery_cost: calculation.plant_machinery_cost || 0,
        motor_vehicle_cost: calculation.motor_vehicle_cost || 0,
        computer_equipment_cost: calculation.computer_equipment_cost || 0,
        wht_on_dividends: calculation.wht_on_dividends || 0,
        wht_on_interest: calculation.wht_on_interest || 0,
        wht_on_rent: calculation.wht_on_rent || 0,
        wht_on_contracts: calculation.wht_on_contracts || 0,
        other_wht_credits: calculation.other_wht_credits || 0,
        is_professional_service: calculation.is_professional_service || false,
        is_multinational: calculation.is_multinational || false
      };

      generateCitReport(citInput, calculation);
    } catch (error) {
      console.error('Error generating CIT report:', error);
      alert('Failed to generate PDF report. Please try again.');
    }
  };

  // Handle printing saved calculations based on type
  const handlePrintSaved = (savedCalc) => {
    if (!hasFeature || !hasFeature('pdf_export')) {
      setShowUpgradePrompt(true);
      return;
    }

    const calcType = savedCalc.calculation_type?.toLowerCase();
    const inputData = savedCalc.input_data || {};
    const resultData = savedCalc.result_data || {};

    try {
      switch (calcType) {
        case 'paye':
          generatePayeReport(inputData, resultData);
          break;
        case 'cit':
          generateCitReport(inputData, resultData);
          break;
        case 'vat':
          if (typeof generateVatReport === 'function') {
            generateVatReport(inputData, resultData);
          } else {
            alert('VAT PDF export not available');
          }
          break;
        case 'cgt':
          if (typeof generateCgtReport === 'function') {
            generateCgtReport(inputData, resultData);
          } else {
            alert('CGT PDF export not available');
          }
          break;
        default:
          alert(`PDF export not available for ${calcType} calculations`);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report');
    }
  };

  // Export saved calculations to Excel
  const handleExportSavedToExcel = () => {
    if (!hasFeature || !hasFeature('excel_export')) {
      setShowUpgradePrompt(true);
      return;
    }

    if (savedCalculations.length === 0) {
      alert('No saved calculations to export');
      return;
    }

    try {
      // Create workbook with summary sheet
      const wb = XLSX.utils.book_new();

      // Summary sheet
      const summaryData = savedCalculations.map(calc => ({
        'Name': calc.name || 'Unnamed',
        'Type': calc.calculation_type?.toUpperCase() || 'Unknown',
        'Tags': (calc.tags || []).join(', '),
        'Saved Date': new Date(calc.saved_at).toLocaleDateString('en-NG'),
        'Include in Analytics': calc.include_in_analytics ? 'Yes' : 'No'
      }));

      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

      // Separate sheets by calculation type
      const calcTypes = ['paye', 'cit', 'vat', 'cgt'];
      
      calcTypes.forEach(type => {
        const typeCalcs = savedCalculations.filter(c => c.calculation_type?.toLowerCase() === type);
        if (typeCalcs.length > 0) {
          const typeData = typeCalcs.map(calc => {
            const input = calc.input_data || {};
            const result = calc.result_data || {};
            
            // Build row based on type
            if (type === 'paye') {
              return {
                'Name': calc.name || 'Unnamed',
                'Staff Name': input.staff_name || '',
                'Basic Salary': input.basic_salary || 0,
                'Monthly Gross': result.monthly_gross_income || 0,
                'Annual Tax': result.tax_due || 0,
                'Monthly Tax': result.monthly_tax || 0,
                'Net Monthly': result.monthly_net_income || 0,
                'Effective Rate': `${(result.effective_tax_rate || 0).toFixed(2)}%`,
                'Saved Date': new Date(calc.saved_at).toLocaleDateString('en-NG')
              };
            } else if (type === 'cit') {
              return {
                'Name': calc.name || 'Unnamed',
                'Company': input.company_name || '',
                'Gross Income': input.gross_income || 0,
                'Taxable Income': result.taxable_income || 0,
                'Total Tax Due': result.total_tax_due || 0,
                'Company Size': result.company_size || '',
                'Saved Date': new Date(calc.saved_at).toLocaleDateString('en-NG')
              };
            } else if (type === 'vat') {
              return {
                'Name': calc.name || 'Unnamed',
                'Business': input.business_name || '',
                'Output VAT': result.total_output_vat || 0,
                'Input VAT': result.total_input_vat || 0,
                'Net VAT': result.net_vat_payable || 0,
                'Saved Date': new Date(calc.saved_at).toLocaleDateString('en-NG')
              };
            } else if (type === 'cgt') {
              return {
                'Name': calc.name || 'Unnamed',
                'Asset Type': input.asset_type || '',
                'Capital Gain': result.capital_gain || 0,
                'CGT Due': result.cgt_due || 0,
                'Saved Date': new Date(calc.saved_at).toLocaleDateString('en-NG')
              };
            }
            return { 'Name': calc.name || 'Unnamed' };
          });

          const typeSheet = XLSX.utils.json_to_sheet(typeData);
          XLSX.utils.book_append_sheet(wb, typeSheet, type.toUpperCase());
        }
      });

      // Generate and download
      const fileName = `Saved_Calculations_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export to Excel');
    }
  };

  // Export single saved calculation to Excel
  const handleExportSingleToExcel = (savedCalc) => {
    if (!hasFeature || !hasFeature('excel_export')) {
      setShowUpgradePrompt(true);
      return;
    }

    try {
      const wb = XLSX.utils.book_new();
      const input = savedCalc.input_data || {};
      const result = savedCalc.result_data || {};
      const calcType = savedCalc.calculation_type?.toLowerCase();

      // Create detailed sheet
      let detailData = [];
      
      if (calcType === 'paye') {
        detailData = [
          { 'Field': 'Calculation Name', 'Value': savedCalc.name || 'Unnamed' },
          { 'Field': 'Staff Name', 'Value': input.staff_name || '' },
          { 'Field': 'Month/Year', 'Value': `${input.month || ''} ${input.year || ''}` },
          { 'Field': '', 'Value': '' },
          { 'Field': '--- INCOME ---', 'Value': '' },
          { 'Field': 'Basic Salary', 'Value': input.basic_salary || 0 },
          { 'Field': 'Transport Allowance', 'Value': input.transport_allowance || 0 },
          { 'Field': 'Housing Allowance', 'Value': input.housing_allowance || 0 },
          { 'Field': 'Other Allowances', 'Value': input.other_allowances || 0 },
          { 'Field': '', 'Value': '' },
          { 'Field': '--- RESULTS ---', 'Value': '' },
          { 'Field': 'Monthly Gross Income', 'Value': result.monthly_gross_income || 0 },
          { 'Field': 'Annual Gross Income', 'Value': result.annual_gross_income || 0 },
          { 'Field': 'Total Reliefs', 'Value': result.total_reliefs || 0 },
          { 'Field': 'Taxable Income', 'Value': result.taxable_income || 0 },
          { 'Field': 'Annual Tax Due', 'Value': result.tax_due || 0 },
          { 'Field': 'Monthly Tax', 'Value': result.monthly_tax || 0 },
          { 'Field': 'Monthly Net Income', 'Value': result.monthly_net_income || 0 },
          { 'Field': 'Effective Tax Rate', 'Value': `${(result.effective_tax_rate || 0).toFixed(2)}%` }
        ];
      } else if (calcType === 'cit') {
        detailData = [
          { 'Field': 'Calculation Name', 'Value': savedCalc.name || 'Unnamed' },
          { 'Field': 'Company Name', 'Value': input.company_name || '' },
          { 'Field': 'Year', 'Value': input.year_of_assessment || '' },
          { 'Field': '', 'Value': '' },
          { 'Field': '--- INCOME ---', 'Value': '' },
          { 'Field': 'Gross Income', 'Value': input.gross_income || 0 },
          { 'Field': 'Other Income', 'Value': input.other_income || 0 },
          { 'Field': '', 'Value': '' },
          { 'Field': '--- RESULTS ---', 'Value': '' },
          { 'Field': 'Company Size', 'Value': result.company_size || '' },
          { 'Field': 'Taxable Income', 'Value': result.taxable_income || 0 },
          { 'Field': 'CIT Rate', 'Value': `${result.cit_rate || 0}%` },
          { 'Field': 'Total Tax Due', 'Value': result.total_tax_due || 0 }
        ];
      } else {
        // Generic for VAT/CGT
        detailData = [
          { 'Field': 'Calculation Name', 'Value': savedCalc.name || 'Unnamed' },
          { 'Field': 'Type', 'Value': calcType?.toUpperCase() || '' },
          { 'Field': 'Saved Date', 'Value': new Date(savedCalc.saved_at).toLocaleDateString('en-NG') }
        ];
        // Add all input fields
        Object.entries(input).forEach(([key, value]) => {
          detailData.push({ 'Field': key.replace(/_/g, ' '), 'Value': value });
        });
        detailData.push({ 'Field': '', 'Value': '' });
        detailData.push({ 'Field': '--- RESULTS ---', 'Value': '' });
        Object.entries(result).forEach(([key, value]) => {
          if (typeof value !== 'object') {
            detailData.push({ 'Field': key.replace(/_/g, ' '), 'Value': value });
          }
        });
      }

      const sheet = XLSX.utils.json_to_sheet(detailData);
      XLSX.utils.book_append_sheet(wb, sheet, 'Calculation');

      const fileName = `${savedCalc.name || 'Calculation'}_${calcType?.toUpperCase()}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export to Excel');
    }
  };

  // Get icon for calculation type
  const getCalcTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'paye': return <Users className="h-4 w-4 text-emerald-600" />;
      case 'cit': return <Building2 className="h-4 w-4 text-blue-600" />;
      case 'vat': return <Receipt className="h-4 w-4 text-purple-600" />;
      case 'cgt': return <TrendingUp className="h-4 w-4 text-orange-600" />;
      default: return <Calculator className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCalcTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'paye': return 'bg-emerald-100';
      case 'cit': return 'bg-blue-100';
      case 'vat': return 'bg-purple-100';
      case 'cgt': return 'bg-orange-100';
      default: return 'bg-gray-100';
    }
  };

  const getCalcTypeBadgeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'paye': return 'bg-emerald-100 text-emerald-700';
      case 'cit': return 'bg-blue-100 text-blue-700';
      case 'vat': return 'bg-purple-100 text-purple-700';
      case 'cgt': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Accordion Item component matching Tax Library style
  const AccordionItem = ({ calculation, expanded, onToggle, onPrint, isPAYE }) => (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 px-4 text-left hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPAYE ? 'bg-emerald-100' : 'bg-blue-100'}`}>
            {isPAYE ? (
              <Users className={`h-4 w-4 ${isPAYE ? 'text-emerald-600' : 'text-blue-600'}`} />
            ) : (
              <Building2 className="h-4 w-4 text-blue-600" />
            )}
          </div>
          <div>
            <span className="font-medium text-gray-900">
              {isPAYE 
                ? (calculation.staff_name || 'PAYE Calculation')
                : (calculation.company_name || 'CIT Calculation')
              }
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-500">{formatDate(calculation.timestamp)}</span>
              <Badge 
                className={`text-[10px] px-1.5 py-0 ${isPAYE ? 'bg-emerald-100 text-emerald-700 border-0' : 'bg-blue-100 text-blue-700 border-0'}`}
              >
                {calculation.type}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900">
              {isPAYE ? formatCurrency(calculation.monthly_tax) : formatCurrency(calculation.total_tax_due)}
            </p>
            <p className="text-xs text-gray-500">{isPAYE ? 'Monthly Tax' : 'Total Tax'}</p>
          </div>
          <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </div>
      </button>
      {expanded && (
        <div className="pb-4 px-4">
          {isPAYE ? (
            <div className="space-y-4">
              {/* Staff Information */}
              <div className="grid md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Staff Name</p>
                  <p className="text-sm font-medium text-gray-900">{calculation.staff_name || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Month</p>
                  <p className="text-sm font-medium text-gray-900">{calculation.month || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">State of Residence</p>
                  <p className="text-sm font-medium text-gray-900">{calculation.state_of_residence || 'Not specified'}</p>
                </div>
              </div>

              {/* Income & Deductions Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-900">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 bg-gray-50">Income Component</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900 bg-gray-50">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-700">Basic Salary</td>
                      <td className="py-3 px-4 text-gray-700 text-right">{formatCurrency(calculation.basic_salary || (calculation.annual_basic_salary / 12) || 0)}</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-700">Transport Allowance</td>
                      <td className="py-3 px-4 text-gray-700 text-right">{formatCurrency(calculation.transport_allowance || (calculation.annual_transport_allowance / 12) || 0)}</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-700">Housing Allowance</td>
                      <td className="py-3 px-4 text-gray-700 text-right">{formatCurrency(calculation.housing_allowance || (calculation.annual_housing_allowance / 12) || 0)}</td>
                    </tr>
                    {(calculation.meal_allowance > 0 || calculation.annual_meal_allowance > 0) && (
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-700">Meal Allowance</td>
                        <td className="py-3 px-4 text-gray-700 text-right">{formatCurrency(calculation.meal_allowance || (calculation.annual_meal_allowance / 12) || 0)}</td>
                      </tr>
                    )}
                    {(calculation.utility_allowance > 0 || calculation.annual_utility_allowance > 0) && (
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-700">Utility Allowance</td>
                        <td className="py-3 px-4 text-gray-700 text-right">{formatCurrency(calculation.utility_allowance || (calculation.annual_utility_allowance / 12) || 0)}</td>
                      </tr>
                    )}
                    {(calculation.medical_allowance > 0 || calculation.annual_medical_allowance > 0) && (
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-700">Medical Allowance</td>
                        <td className="py-3 px-4 text-gray-700 text-right">{formatCurrency(calculation.medical_allowance || (calculation.annual_medical_allowance / 12) || 0)}</td>
                      </tr>
                    )}
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-700">Other Allowances</td>
                      <td className="py-3 px-4 text-gray-700 text-right">{formatCurrency(calculation.other_allowances || (calculation.annual_other_allowances / 12) || 0)}</td>
                    </tr>
                    <tr className="border-b border-gray-100 bg-emerald-50">
                      <td className="py-3 px-4 font-medium text-gray-900">Monthly Gross Income</td>
                      <td className="py-3 px-4 font-medium text-gray-900 text-right">{formatCurrency(calculation.monthly_gross_income)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Reliefs Section */}
              {(calculation.pension_relief > 0 || calculation.nhf_relief > 0 || calculation.life_insurance_relief > 0 || 
                calculation.health_insurance_relief > 0 || calculation.nhis_relief > 0 || calculation.rent_relief > 0 ||
                calculation.mortgage_interest_relief > 0 || calculation.total_reliefs > 0) && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-emerald-600">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 bg-emerald-50">Tax Reliefs Applied</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900 bg-emerald-50">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculation.pension_relief > 0 && (
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-4 text-gray-700">Pension Relief (8%)</td>
                          <td className="py-2 px-4 text-gray-700 text-right">{formatCurrency(calculation.pension_relief)}</td>
                        </tr>
                      )}
                      {calculation.nhf_relief > 0 && (
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-4 text-gray-700">NHF Relief (2.5%)</td>
                          <td className="py-2 px-4 text-gray-700 text-right">{formatCurrency(calculation.nhf_relief)}</td>
                        </tr>
                      )}
                      {calculation.nhis_relief > 0 && (
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-4 text-gray-700">NHIS Relief</td>
                          <td className="py-2 px-4 text-gray-700 text-right">{formatCurrency(calculation.nhis_relief)}</td>
                        </tr>
                      )}
                      {calculation.life_insurance_relief > 0 && (
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-4 text-gray-700">Life Insurance Relief</td>
                          <td className="py-2 px-4 text-gray-700 text-right">{formatCurrency(calculation.life_insurance_relief)}</td>
                        </tr>
                      )}
                      {calculation.health_insurance_relief > 0 && (
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-4 text-gray-700">Health Insurance Relief</td>
                          <td className="py-2 px-4 text-gray-700 text-right">{formatCurrency(calculation.health_insurance_relief)}</td>
                        </tr>
                      )}
                      {calculation.rent_relief > 0 && (
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-4 text-gray-700">Rent Relief</td>
                          <td className="py-2 px-4 text-gray-700 text-right">{formatCurrency(calculation.rent_relief)}</td>
                        </tr>
                      )}
                      {calculation.mortgage_interest_relief > 0 && (
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-4 text-gray-700">Mortgage Interest Relief</td>
                          <td className="py-2 px-4 text-gray-700 text-right">{formatCurrency(calculation.mortgage_interest_relief)}</td>
                        </tr>
                      )}
                      <tr className="bg-emerald-100">
                        <td className="py-3 px-4 font-medium text-gray-900">Total Reliefs</td>
                        <td className="py-3 px-4 font-medium text-gray-900 text-right">{formatCurrency(calculation.total_reliefs)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tax Results */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-900 text-white rounded-lg">
                  <p className="text-sm text-gray-300 mb-1">Monthly Tax</p>
                  <p className="text-2xl font-bold">{formatCurrency(calculation.monthly_tax)}</p>
                </div>
                <div className="p-4 bg-emerald-600 text-white rounded-lg">
                  <p className="text-sm text-emerald-100 mb-1">Monthly Net Income</p>
                  <p className="text-2xl font-bold">{formatCurrency(calculation.monthly_net_income)}</p>
                </div>
              </div>

              {/* Annual Summary */}
              <div className="border-l-4 border-l-gray-900 bg-gray-50 rounded-r-lg p-4">
                <p className="font-medium text-gray-900 mb-2">Annual Summary</p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Annual Gross</p>
                    <p className="font-medium">{formatCurrency(calculation.annual_gross_income)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Annual Tax</p>
                    <p className="font-medium text-red-600">{formatCurrency(calculation.tax_due || calculation.annual_tax || (calculation.monthly_tax * 12))}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Annual Net</p>
                    <p className="font-medium text-emerald-600">{formatCurrency(calculation.net_annual_income || calculation.annual_net_income || (calculation.monthly_net_income * 12))}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Company Information */}
              <div className="grid md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Company Name</p>
                  <p className="text-sm font-medium text-gray-900">{calculation.company_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Year of Assessment</p>
                  <p className="text-sm font-medium text-gray-900">{calculation.year_of_assessment || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Company Size</p>
                  <Badge className="bg-blue-100 text-blue-700 border-0">{calculation.company_size || 'Standard'}</Badge>
                </div>
              </div>

              {/* Financial Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-900">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 bg-gray-50">Item</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900 bg-gray-50">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-700">Annual Turnover</td>
                      <td className="py-3 px-4 text-gray-700 text-right">{formatCurrency(calculation.annual_turnover)}</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-700">Gross Income</td>
                      <td className="py-3 px-4 text-gray-700 text-right">{formatCurrency(calculation.gross_income)}</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-700">Total Deductions</td>
                      <td className="py-3 px-4 text-gray-700 text-right">{formatCurrency(calculation.total_deductions)}</td>
                    </tr>
                    <tr className="border-b border-gray-100 bg-blue-50">
                      <td className="py-3 px-4 font-medium text-gray-900">Taxable Profit</td>
                      <td className="py-3 px-4 font-medium text-gray-900 text-right">{formatCurrency(calculation.taxable_profit)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Tax Results */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-900 text-white rounded-lg">
                  <p className="text-sm text-gray-300 mb-1">CIT Due</p>
                  <p className="text-2xl font-bold">{formatCurrency(calculation.cit_due)}</p>
                </div>
                <div className="p-4 bg-red-600 text-white rounded-lg">
                  <p className="text-sm text-red-100 mb-1">Total Tax Due</p>
                  <p className="text-2xl font-bold">{formatCurrency(calculation.total_tax_due)}</p>
                </div>
              </div>

              {/* Additional Details */}
              {(calculation.capital_allowances_total > 0 || calculation.wht_credits_total > 0) && (
                <div className="border-l-4 border-l-blue-500 bg-blue-50/50 rounded-r-lg p-4">
                  <p className="font-medium text-gray-900 mb-2">Additional Details</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {calculation.capital_allowances_total > 0 && (
                      <div>
                        <p className="text-gray-500">Capital Allowances</p>
                        <p className="font-medium text-emerald-600">{formatCurrency(calculation.capital_allowances_total)}</p>
                      </div>
                    )}
                    {calculation.wht_credits_total > 0 && (
                      <div>
                        <p className="text-gray-500">WHT Credits</p>
                        <p className="font-medium text-emerald-600">{formatCurrency(calculation.wht_credits_total)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Print Button */}
          <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
            <Button
              onClick={onPrint}
              className="bg-gray-900 hover:bg-gray-800 text-white"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Report
              {hasFeature && !hasFeature('pdf_export') && (
                <Badge className="ml-2 text-[10px] px-1.5 py-0 bg-amber-100 text-amber-700 border-0">
                  PRO+
                </Badge>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  // Combine and sort all history by timestamp
  const allHistory = [
    ...history.map(item => ({ ...item, type: 'PAYE' })),
    ...citHistory.map(item => ({ ...item, type: 'CIT' }))
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Group by date
  const groupedHistory = allHistory.reduce((groups, item) => {
    const date = new Date(item.timestamp).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {});

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Black with white text like Bulk PAYE */}
      <div className="bg-white rounded-t-2xl shadow-sm border border-gray-100 overflow-hidden mx-4 mt-4">
        <div className="bg-gradient-to-r from-gray-900 to-black text-white px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HistoryIcon className="h-6 w-6 text-yellow-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Calculation History</h1>
                <p className="text-sm text-gray-300">Review and manage your tax calculations</p>
              </div>
            </div>
            
            {/* Toggle Switch - Like PAYE Single/Bulk */}
            <div className="flex bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setActiveView('history')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeView === 'history'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <HistoryIcon className="h-4 w-4 inline mr-2" />
                Full History
              </button>
              <button
                onClick={() => setActiveView('saved')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeView === 'saved'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <Save className="h-4 w-4 inline mr-2" />
                Saved Calculations
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Conditional Content based on activeView */}
      {activeView === 'history' ? (
        <>
          {historyLocked ? (
            /* Locked History State */
            <div className="max-w-2xl mx-auto py-16 px-4 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Unlock Full History</h2>
              <p className="text-gray-600 mb-6">
                Access your complete calculation history, reprint reports, and track your tax calculations over time.
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-left">
                    <span className="text-gray-500">Starter</span>
                    <p className="font-semibold text-gray-800">30-day history</p>
                  </div>
                  <div className="text-left">
                    <span className="text-gray-500">Pro</span>
                    <p className="font-semibold text-gray-800">90-day history</p>
                  </div>
                  <div className="text-left">
                    <span className="text-gray-500">Premium+</span>
                    <p className="font-semibold text-gray-800">Unlimited history</p>
                  </div>
                </div>
              </div>
              <Button 
                onClick={onUnlockHistory}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                data-testid="history-upgrade-btn"
              >
                Unlock History
              </Button>
              <p className="text-sm text-gray-500 mt-4">
                You can still view your <button onClick={() => setActiveView('saved')} className="text-emerald-600 hover:underline font-medium">Saved Calculations</button> above.
              </p>
            </div>
          ) : (
            <>
              {/* Summary Stats for History */}
              <div className="border-b border-gray-200 bg-white">
                <div className="max-w-6xl mx-auto px-4 py-4">
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-gray-600">PAYE Calculations:</span>
                      <span className="font-medium text-gray-900">{history.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-gray-600">CIT Calculations:</span>
                      <span className="font-medium text-gray-900">{citHistory.length}</span>
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-500">Total: {allHistory.length} calculations</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* History Content */}
              <div className="max-w-6xl mx-auto px-4 py-8">
                {allHistory.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Calculation History</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                      Your tax calculations will appear here. Start by using the PAYE or CIT calculators.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedHistory).map(([date, calculations]) => (
                      <Card key={date} className="border border-gray-200 shadow-none">
                        <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-3">
                          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                        {date}
                        <Badge className="bg-gray-200 text-gray-700 border-0 text-xs ml-2">
                          {calculations.length} calculation{calculations.length !== 1 ? 's' : ''}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      {calculations.map((calculation) => (
                        <AccordionItem
                          key={`${calculation.type}-${calculation.id}`}
                          calculation={calculation}
                          expanded={isExpanded(calculation.id, calculation.type)}
                          onToggle={() => toggleExpanded(calculation.id, calculation.type)}
                          onPrint={() => calculation.type === 'PAYE' 
                            ? handlePrintPAYE(calculation) 
                            : handlePrintCIT(calculation)
                          }
                          isPAYE={calculation.type === 'PAYE'}
                        />
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
            </>
          )}
        </>
      ) : (
        <>
          {/* Summary Stats for Saved */}
          <div className="border-b border-gray-200 bg-white">
            <div className="max-w-6xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4 text-emerald-500" />
                    <span className="text-gray-600">Saved Calculations:</span>
                    <span className="font-medium text-gray-900">{savedCalcsTotal}</span>
                  </div>
                </div>
                {savedCalculations.length > 0 && (
                  <Button
                    onClick={handleExportSavedToExcel}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    size="sm"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export All to Excel
                    {hasFeature && !hasFeature('excel_export') && (
                      <Badge className="ml-2 text-[10px] px-1.5 py-0 bg-amber-100 text-amber-700 border-0">
                        PRO+
                      </Badge>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Saved Calculations Content */}
          <div className="max-w-6xl mx-auto px-4 py-8">
            {savedCalcsLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500">Loading saved calculations...</p>
              </div>
            ) : savedCalculations.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <Save className="h-8 w-8 text-emerald-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Saved Calculations</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  Save your calculations from the calculator results page to access them here anytime.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {savedCalculations.map((savedCalc) => (
                  <Card key={savedCalc.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          {/* Type Icon */}
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCalcTypeColor(savedCalc.calculation_type)}`}>
                            {getCalcTypeIcon(savedCalc.calculation_type)}
                          </div>
                          
                          {/* Details */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">
                                {savedCalc.name || 'Unnamed Calculation'}
                              </h3>
                              <Badge className={`text-[10px] px-2 py-0.5 border-0 ${getCalcTypeBadgeColor(savedCalc.calculation_type)}`}>
                                {savedCalc.calculation_type?.toUpperCase()}
                              </Badge>
                            </div>
                            
                            {/* Tags */}
                            {savedCalc.tags && savedCalc.tags.length > 0 && (
                              <div className="flex items-center gap-1 mb-2">
                                <Tag className="h-3 w-3 text-gray-400" />
                                <div className="flex flex-wrap gap-1">
                                  {savedCalc.tags.map((tag, idx) => (
                                    <span key={idx} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Meta info */}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(savedCalc.saved_at).toLocaleDateString('en-NG', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                              {savedCalc.include_in_analytics && (
                                <span className="flex items-center gap-1 text-emerald-600">
                                  <Eye className="h-3 w-3" />
                                  In Analytics
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Button
                            onClick={() => handlePrintSaved(savedCalc)}
                            variant="outline"
                            size="sm"
                            className="text-gray-700 hover:bg-gray-100"
                          >
                            <Printer className="h-4 w-4 mr-1" />
                            PDF
                            {hasFeature && !hasFeature('pdf_export') && (
                              <Badge className="ml-1 text-[8px] px-1 py-0 bg-amber-100 text-amber-700 border-0">
                                PRO+
                              </Badge>
                            )}
                          </Button>
                          <Button
                            onClick={() => handleDetailedExcelDownload(savedCalc)}
                            variant="outline"
                            size="sm"
                            className="text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                            disabled={isDownloading === savedCalc.id}
                          >
                            {isDownloading === savedCalc.id ? (
                              <div className="animate-spin w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full mr-1" />
                            ) : (
                              <FileSpreadsheet className="h-4 w-4 mr-1" />
                            )}
                            Audit Report
                            <Badge className="ml-1 text-[8px] px-1 py-0 bg-emerald-100 text-emerald-700 border-0">
                              NEW
                            </Badge>
                          </Button>
                          <Button
                            onClick={() => handleExportSingleToExcel(savedCalc)}
                            variant="outline"
                            size="sm"
                            className="text-gray-700 hover:bg-gray-100"
                          >
                            <FileSpreadsheet className="h-4 w-4 mr-1" />
                            Excel
                            {hasFeature && !hasFeature('excel_export') && (
                              <Badge className="ml-1 text-[8px] px-1 py-0 bg-amber-100 text-amber-700 border-0">
                                PRO+
                              </Badge>
                            )}
                          </Button>
                          <Button
                            onClick={() => handleDeleteSaved(savedCalc.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Expandable Result Summary */}
                      {savedCalc.result_data && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            {savedCalc.calculation_type?.toLowerCase() === 'paye' && (
                              <>
                                <div>
                                  <p className="text-gray-500 text-xs">Monthly Gross</p>
                                  <p className="font-medium text-gray-900">{formatCurrency(savedCalc.result_data.monthly_gross_income || 0)}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500 text-xs">Monthly Tax</p>
                                  <p className="font-medium text-red-600">{formatCurrency(savedCalc.result_data.monthly_tax || 0)}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500 text-xs">Monthly Net</p>
                                  <p className="font-medium text-emerald-600">{formatCurrency(savedCalc.result_data.monthly_net_income || 0)}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500 text-xs">Effective Rate</p>
                                  <p className="font-medium text-gray-900">{(savedCalc.result_data.effective_tax_rate || 0).toFixed(2)}%</p>
                                </div>
                              </>
                            )}
                            {savedCalc.calculation_type?.toLowerCase() === 'cit' && (
                              <>
                                <div>
                                  <p className="text-gray-500 text-xs">Company Size</p>
                                  <p className="font-medium text-gray-900">{savedCalc.result_data.company_size || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500 text-xs">Taxable Income</p>
                                  <p className="font-medium text-gray-900">{formatCurrency(savedCalc.result_data.taxable_income || 0)}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500 text-xs">CIT Rate</p>
                                  <p className="font-medium text-gray-900">{savedCalc.result_data.cit_rate || 0}%</p>
                                </div>
                                <div>
                                  <p className="text-gray-500 text-xs">Total Tax Due</p>
                                  <p className="font-medium text-red-600">{formatCurrency(savedCalc.result_data.total_tax_due || 0)}</p>
                                </div>
                              </>
                            )}
                            {savedCalc.calculation_type?.toLowerCase() === 'vat' && (
                              <>
                                <div>
                                  <p className="text-gray-500 text-xs">Output VAT</p>
                                  <p className="font-medium text-gray-900">{formatCurrency(savedCalc.result_data.total_output_vat || 0)}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500 text-xs">Input VAT</p>
                                  <p className="font-medium text-gray-900">{formatCurrency(savedCalc.result_data.total_input_vat || 0)}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500 text-xs">Net VAT Payable</p>
                                  <p className="font-medium text-red-600">{formatCurrency(savedCalc.result_data.net_vat_payable || 0)}</p>
                                </div>
                              </>
                            )}
                            {savedCalc.calculation_type?.toLowerCase() === 'cgt' && (
                              <>
                                <div>
                                  <p className="text-gray-500 text-xs">Capital Gain</p>
                                  <p className="font-medium text-gray-900">{formatCurrency(savedCalc.result_data.capital_gain || 0)}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500 text-xs">CGT Due</p>
                                  <p className="font-medium text-red-600">{formatCurrency(savedCalc.result_data.cgt_due || 0)}</p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Footer */}
      <div className="border-t border-gray-200 bg-gray-50/50 mt-8">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <p className="text-xs text-gray-500 text-center">
            {activeView === 'history' 
              ? 'Click on any calculation to view detailed breakdown and print reports. History is stored securely in your account.'
              : 'Your saved calculations are stored securely. Export to PDF or Excel for your records.'
            }
          </p>
        </div>
      </div>

      {/* Upgrade Prompt */}
      {showUpgradePrompt && (
        <UpgradePrompt
          type="feature"
          feature="pdf_export"
          onUpgrade={handleUpgrade}
          onTrial={handleTrial}
          onClose={() => setShowUpgradePrompt(false)}
        />
      )}

      {/* Excel Download Limit Modal */}
      <ExcelDownloadLimitModal
        isOpen={showExcelLimitModal}
        onClose={() => setShowExcelLimitModal(false)}
        currentTier={userTier}
        downloadsUsed={excelDownloadsUsed}
        downloadsLimit={excelDownloadsLimit}
        onUpgrade={handleUpgradeFromExcelModal}
      />
    </div>
  );
};

export default EnhancedHistory;
