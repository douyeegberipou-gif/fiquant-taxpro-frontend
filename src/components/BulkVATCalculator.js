import React, { useState, useRef } from 'react';
import { Receipt, Plus, Trash2, Calculator, Download, Eye, EyeOff, Upload, FileSpreadsheet, Printer, AlertTriangle, Building2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import UpgradePrompt from './UpgradePrompt';
import { useUpgrade } from '../hooks/useUpgrade';

const BulkVATCalculator = ({ formatCurrency, hasFeature }) => {
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradeContext, setUpgradeContext] = useState({ type: 'feature', feature: 'bulk_vat' });
  const { startTrial, requestUpgrade, requestAddon } = useUpgrade();

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

  const handleAddon = async () => {
    const result = await requestAddon(upgradeContext.feature, 1);
    if (result.success) {
      setShowUpgradePrompt(false);
    }
  };

  // VAT transaction types
  const transactionTypes = {
    // Standard Rated (7.5% VAT)
    'professional_services': { name: 'Professional Services', category: 'standard', vat_rate: 0.075 },
    'construction_services': { name: 'Construction Services', category: 'standard', vat_rate: 0.075 },
    'retail_sales': { name: 'Retail Sales', category: 'standard', vat_rate: 0.075 },
    'manufacturing': { name: 'Manufacturing', category: 'standard', vat_rate: 0.075 },
    'telecommunications': { name: 'Telecommunications', category: 'standard', vat_rate: 0.075 },
    'financial_services': { name: 'Financial Services', category: 'standard', vat_rate: 0.075 },
    'hospitality': { name: 'Hospitality & Tourism', category: 'standard', vat_rate: 0.075 },
    'transportation': { name: 'Transportation Services', category: 'standard', vat_rate: 0.075 },
    'other_standard': { name: 'Other Standard Rated', category: 'standard', vat_rate: 0.075 },
    // Zero Rated (0% VAT)
    'exports': { name: 'Export of Goods', category: 'zero', vat_rate: 0 },
    'medical_services': { name: 'Medical & Healthcare Services', category: 'zero', vat_rate: 0 },
    'educational_services': { name: 'Educational Services', category: 'zero', vat_rate: 0 },
    'basic_food': { name: 'Basic Food Items', category: 'zero', vat_rate: 0 },
    'agricultural_inputs': { name: 'Agricultural Equipment & Inputs', category: 'zero', vat_rate: 0 },
    'export_services': { name: 'Export of Services', category: 'zero', vat_rate: 0 },
    // Exempt
    'exempt_medical': { name: 'Medical Equipment (Exempt)', category: 'exempt', vat_rate: 0 },
    'exempt_educational': { name: 'Educational Materials (Exempt)', category: 'exempt', vat_rate: 0 },
  };

  const [transactions, setTransactions] = useState([
    {
      id: 1,
      description: '',
      customer_name: '',
      customer_tin: '',
      transaction_type: '',
      sale_amount: '',
      input_vat: '',
      calculated: false,
      result: null
    }
  ]);

  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Business information
  const [businessInfo, setBusinessInfo] = useState({
    business_name: '',
    business_tin: '',
    vat_registration_no: '',
    business_address: '',
    reporting_period: '',
    reporting_year: new Date().getFullYear().toString()
  });

  const updateBusinessInfo = (field, value) => {
    setBusinessInfo(prev => ({ ...prev, [field]: value }));
  };

  const addTransaction = () => {
    const newTransaction = {
      id: transactions.length + 1,
      description: '',
      customer_name: '',
      customer_tin: '',
      transaction_type: '',
      sale_amount: '',
      input_vat: '',
      calculated: false,
      result: null
    };
    setTransactions([...transactions, newTransaction]);
  };

  const removeTransaction = (id) => {
    if (transactions.length > 1) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  const updateTransaction = (id, field, value) => {
    setTransactions(transactions.map(t => 
      t.id === id ? { ...t, [field]: value, calculated: false, result: null } : t
    ));
  };

  const getTransactionTypeKey = (typeName) => {
    const entry = Object.entries(transactionTypes).find(([key, value]) => value.name === typeName);
    return entry ? entry[0] : '';
  };

  const calculateVAT = (transaction) => {
    const saleAmount = parseFloat(transaction.sale_amount) || 0;
    const inputVat = parseFloat(transaction.input_vat) || 0;
    const typeKey = transaction.transaction_type;
    const typeInfo = transactionTypes[typeKey];
    
    if (!typeInfo || saleAmount <= 0) {
      return null;
    }

    const vatRate = typeInfo.vat_rate;
    const category = typeInfo.category;
    
    let outputVat = 0;
    let netVatPayable = 0;
    let vatRefundable = 0;

    if (category === 'standard') {
      outputVat = saleAmount * vatRate;
      netVatPayable = outputVat - inputVat;
      if (netVatPayable < 0) {
        vatRefundable = Math.abs(netVatPayable);
        netVatPayable = 0;
      }
    } else if (category === 'zero') {
      outputVat = 0;
      vatRefundable = inputVat; // Input VAT is refundable for zero-rated
      netVatPayable = 0;
    } else if (category === 'exempt') {
      outputVat = 0;
      netVatPayable = 0;
      vatRefundable = 0; // Input VAT not recoverable for exempt supplies
    }

    return {
      sale_amount: saleAmount,
      vat_rate: vatRate * 100,
      category: category,
      output_vat: outputVat,
      input_vat: inputVat,
      net_vat_payable: netVatPayable,
      vat_refundable: vatRefundable,
      total_invoice: saleAmount + outputVat
    };
  };

  const calculateAllTransactions = () => {
    setLoading(true);
    
    setTimeout(() => {
      const updatedTransactions = transactions.map(transaction => {
        const result = calculateVAT(transaction);
        return {
          ...transaction,
          calculated: result !== null,
          result: result
        };
      });
      
      setTransactions(updatedTransactions);
      setShowResults(true);
      setLoading(false);
    }, 500);
  };

  const getTotals = () => {
    const calculated = transactions.filter(t => t.calculated && t.result);
    return {
      count: calculated.length,
      total_sales: calculated.reduce((sum, t) => sum + (t.result?.sale_amount || 0), 0),
      total_output_vat: calculated.reduce((sum, t) => sum + (t.result?.output_vat || 0), 0),
      total_input_vat: calculated.reduce((sum, t) => sum + (t.result?.input_vat || 0), 0),
      total_net_vat: calculated.reduce((sum, t) => sum + (t.result?.net_vat_payable || 0), 0),
      total_refundable: calculated.reduce((sum, t) => sum + (t.result?.vat_refundable || 0), 0),
      total_invoice: calculated.reduce((sum, t) => sum + (t.result?.total_invoice || 0), 0),
      standard_count: calculated.filter(t => t.result?.category === 'standard').length,
      zero_count: calculated.filter(t => t.result?.category === 'zero').length,
      exempt_count: calculated.filter(t => t.result?.category === 'exempt').length
    };
  };

  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    
    // Get transaction type options
    const standardTypes = Object.entries(transactionTypes).filter(([k, v]) => v.category === 'standard').map(([k, v]) => v.name);
    const zeroTypes = Object.entries(transactionTypes).filter(([k, v]) => v.category === 'zero').map(([k, v]) => v.name);
    const exemptTypes = Object.entries(transactionTypes).filter(([k, v]) => v.category === 'exempt').map(([k, v]) => v.name);
    
    // Create main template data
    const templateData = [
      ['Description', 'Customer Name', 'Customer TIN', 'Transaction Type', 'Sale Amount (₦)', 'Input VAT Paid (₦)'],
      ['Consulting Services Q1', 'ABC Company Ltd', '12345678901', 'Professional Services', '1000000', '25000'],
      ['Equipment Export', 'XYZ International', '98765432109', 'Export of Goods', '5000000', '150000'],
      ['Medical Supplies', 'Healthcare Corp', '11223344556', 'Medical & Healthcare Services', '2500000', '50000']
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 25 }, // Description
      { wch: 20 }, // Customer Name
      { wch: 15 }, // Customer TIN
      { wch: 30 }, // Transaction Type
      { wch: 18 }, // Sale Amount
      { wch: 18 }  // Input VAT
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'VAT Transactions');
    
    // Add Transaction Types Reference Sheet
    const txnTypesData = [
      ['TRANSACTION TYPE OPTIONS - Use these exact values in the "Transaction Type" column'],
      [''],
      ['Value to Enter', 'Category', 'VAT Rate', 'Description'],
      [''],
      ['=== STANDARD RATED (7.5% VAT) ===', '', '', ''],
    ];
    
    Object.entries(transactionTypes).filter(([k, v]) => v.category === 'standard').forEach(([key, type]) => {
      txnTypesData.push([type.name, 'Standard', '7.5%', 'Output VAT applies']);
    });
    
    txnTypesData.push(['']);
    txnTypesData.push(['=== ZERO RATED (0% VAT) ===', '', '', '']);
    
    Object.entries(transactionTypes).filter(([k, v]) => v.category === 'zero').forEach(([key, type]) => {
      txnTypesData.push([type.name, 'Zero-Rated', '0%', 'Input VAT refundable']);
    });
    
    txnTypesData.push(['']);
    txnTypesData.push(['=== EXEMPT ===', '', '', '']);
    
    Object.entries(transactionTypes).filter(([k, v]) => v.category === 'exempt').forEach(([key, type]) => {
      txnTypesData.push([type.name, 'Exempt', 'N/A', 'No VAT, Input VAT not recoverable']);
    });
    
    txnTypesData.push(['']);
    txnTypesData.push(['IMPORTANT: Copy the exact text from "Value to Enter" column into your VAT Transactions sheet']);
    
    const txnTypesWs = XLSX.utils.aoa_to_sheet(txnTypesData);
    txnTypesWs['!cols'] = [{ wch: 35 }, { wch: 15 }, { wch: 10 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, txnTypesWs, 'Transaction Types');
    
    // Add Instructions Sheet
    const instructionsData = [
      ['FIQUANT TAXPRO - BULK VAT CALCULATOR INSTRUCTIONS'],
      [''],
      ['HOW TO USE THIS TEMPLATE:'],
      [''],
      ['1. DOWNLOAD & OPEN:'],
      ['   - This file is downloaded to your computer'],
      ['   - Open it in Microsoft Excel (recommended) or Google Sheets'],
      [''],
      ['2. FILL IN DATA (VAT Transactions sheet):'],
      ['   - Replace sample data with your actual transaction information'],
      ['   - Description and Sale Amount are required fields'],
      [''],
      ['3. TRANSACTION TYPE SELECTION:'],
      ['   - Go to the "Transaction Types" sheet to see all valid options'],
      ['   - Copy the EXACT text from the "Value to Enter" column'],
      ['   - Paste it into the Transaction Type column of your data'],
      [''],
      ['4. INPUT VAT:'],
      ['   - Enter the total input VAT paid on purchases related to each transaction'],
      ['   - For zero-rated supplies, input VAT is fully refundable'],
      ['   - For exempt supplies, input VAT is NOT recoverable'],
      [''],
      ['5. SAVE & UPLOAD:'],
      ['   - Save the file (keep as .xlsx format)'],
      ['   - Return to Fiquant TaxPro website'],
      ['   - Click "Upload File" button and select this file'],
      [''],
      ['6. CALCULATE:'],
      ['   - Click "Calculate All VAT" to process'],
      ['   - Review results including net VAT payable/refundable'],
      ['   - Export VAT return report as needed'],
      [''],
      ['FIELD DESCRIPTIONS:'],
      [''],
      ['• Description: Brief description of the transaction'],
      ['• Customer Name: Name of customer/client'],
      ['• Customer TIN: Customer Tax ID (optional)'],
      ['• Transaction Type: Select from Transaction Types sheet'],
      ['• Sale Amount: Total sale value excluding VAT'],
      ['• Input VAT Paid: VAT paid on related purchases'],
      [''],
      ['VAT RATE INFORMATION (NTA 2025):'],
      ['• Standard Rate: 7.5% on taxable supplies'],
      ['• Zero Rate: 0% on exports, medical, education, basic food'],
      ['• Exempt: No VAT charged, no input VAT recovery'],
    ];
    
    const instructionsWs = XLSX.utils.aoa_to_sheet(instructionsData);
    instructionsWs['!cols'] = [{ wch: 80 }];
    XLSX.utils.book_append_sheet(wb, instructionsWs, 'Instructions');
    
    // Reorder sheets
    wb.SheetNames = ['VAT Transactions', 'Transaction Types', 'Instructions'];
    
    XLSX.writeFile(wb, 'bulk_vat_template.xlsx');
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first sheet (VAT Transactions)
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Find header row
        let headerRowIndex = 0;
        for (let i = 0; i < jsonData.length; i++) {
          if (jsonData[i] && jsonData[i][0] && jsonData[i][0].toString().includes('Description')) {
            headerRowIndex = i;
            break;
          }
        }
        
        // Parse data rows
        const dataRows = jsonData.slice(headerRowIndex + 1).filter(row => row && row.length > 0 && row[0]);
        
        const uploadedTransactions = dataRows.map((row, index) => ({
          id: index + 1,
          description: row[0] ? row[0].toString().trim() : '',
          customer_name: row[1] ? row[1].toString().trim() : '',
          customer_tin: row[2] ? row[2].toString().trim() : '',
          transaction_type: getTransactionTypeKey(row[3] ? row[3].toString().trim() : ''),
          sale_amount: row[4] ? row[4].toString().trim() : '',
          input_vat: row[5] ? row[5].toString().trim() : '',
          calculated: false,
          result: null
        })).filter(t => t.description || t.sale_amount);
        
        if (uploadedTransactions.length > 0) {
          setTransactions(uploadedTransactions);
          alert(`Successfully uploaded ${uploadedTransactions.length} VAT transactions.`);
        } else {
          alert('No valid transaction data found in the file.');
        }
      } catch (error) {
        console.error('Error parsing file:', error);
        alert('Error reading file. Please ensure it\'s a valid Excel file.');
      } finally {
        setUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const exportResults = () => {
    const totals = getTotals();
    const calculated = transactions.filter(t => t.calculated && t.result);
    
    // Create results data
    const resultsData = [
      ['FIQUANT TAXPRO - BULK VAT CALCULATION REPORT'],
      [''],
      ['Business Information:'],
      [`Business Name: ${businessInfo.business_name || 'N/A'}`],
      [`TIN: ${businessInfo.business_tin || 'N/A'}`],
      [`VAT Reg No: ${businessInfo.vat_registration_no || 'N/A'}`],
      [`Reporting Period: ${businessInfo.reporting_period || 'N/A'} ${businessInfo.reporting_year}`],
      [''],
      ['SUMMARY:'],
      [`Total Transactions: ${totals.count}`],
      [`Standard Rated: ${totals.standard_count} | Zero Rated: ${totals.zero_count} | Exempt: ${totals.exempt_count}`],
      [`Total Sales: ₦${totals.total_sales.toLocaleString()}`],
      [`Total Output VAT: ₦${totals.total_output_vat.toLocaleString()}`],
      [`Total Input VAT: ₦${totals.total_input_vat.toLocaleString()}`],
      [`Net VAT Payable: ₦${totals.total_net_vat.toLocaleString()}`],
      [`VAT Refundable: ₦${totals.total_refundable.toLocaleString()}`],
      [''],
      ['TRANSACTION DETAILS:'],
      ['Description', 'Customer', 'Type', 'Category', 'Sale Amount', 'VAT Rate', 'Output VAT', 'Input VAT', 'Net VAT', 'Total Invoice'],
    ];
    
    calculated.forEach(t => {
      const typeInfo = transactionTypes[t.transaction_type];
      resultsData.push([
        t.description,
        t.customer_name,
        typeInfo?.name || t.transaction_type,
        t.result.category,
        t.result.sale_amount,
        `${t.result.vat_rate}%`,
        t.result.output_vat,
        t.result.input_vat,
        t.result.net_vat_payable > 0 ? t.result.net_vat_payable : -t.result.vat_refundable,
        t.result.total_invoice
      ]);
    });
    
    const ws = XLSX.utils.aoa_to_sheet(resultsData);
    ws['!cols'] = [
      { wch: 25 }, { wch: 20 }, { wch: 25 }, { wch: 12 }, { wch: 15 },
      { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
    ];
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'VAT Report');
    
    XLSX.writeFile(wb, `VAT_Report_${businessInfo.reporting_period || 'Period'}_${businessInfo.reporting_year}.xlsx`);
  };

  const totals = getTotals();

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-900 to-black text-white px-8 py-6">
          <div className="flex items-center space-x-3">
            <Receipt className="h-6 w-6 text-yellow-400" />
            <div>
              <h1 className="text-2xl font-bold">Bulk VAT Calculator</h1>
              <p className="text-gray-300 text-sm mt-1">Calculate VAT for multiple transactions efficiently</p>
            </div>
          </div>
        </div>
        
        <div className="p-8">
          {/* Disclaimer Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-amber-800 flex items-start">
              <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Note:</strong> VAT calculations based on NTA 2025 rates. Standard rate is 7.5%. Users are responsible for verifying transaction classifications.
              </span>
            </p>
          </div>

          {/* Business Information Section */}
          <Card className="border border-gray-200 shadow-none mb-6">
            <CardHeader className="border-b border-gray-100 py-4">
              <CardTitle className="text-base font-semibold flex items-center">
                <Building2 className="h-4 w-4 mr-2 text-gray-500" />
                Business Information
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Enter your business details for the VAT return
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Business Name</Label>
                  <Input
                    value={businessInfo.business_name}
                    onChange={(e) => updateBusinessInfo('business_name', e.target.value)}
                    placeholder="Enter business name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">TIN</Label>
                  <Input
                    value={businessInfo.business_tin}
                    onChange={(e) => updateBusinessInfo('business_tin', e.target.value)}
                    placeholder="Tax ID Number"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">VAT Registration No.</Label>
                  <Input
                    value={businessInfo.vat_registration_no}
                    onChange={(e) => updateBusinessInfo('vat_registration_no', e.target.value)}
                    placeholder="VAT Reg Number"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Business Address</Label>
                  <Input
                    value={businessInfo.business_address}
                    onChange={(e) => updateBusinessInfo('business_address', e.target.value)}
                    placeholder="Business address"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Reporting Period</Label>
                  <select
                    value={businessInfo.reporting_period}
                    onChange={(e) => updateBusinessInfo('reporting_period', e.target.value)}
                    className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm"
                  >
                    <option value="">Select period</option>
                    <option value="January">January</option>
                    <option value="February">February</option>
                    <option value="March">March</option>
                    <option value="April">April</option>
                    <option value="May">May</option>
                    <option value="June">June</option>
                    <option value="July">July</option>
                    <option value="August">August</option>
                    <option value="September">September</option>
                    <option value="October">October</option>
                    <option value="November">November</option>
                    <option value="December">December</option>
                    <option value="Q1">Q1 (Jan-Mar)</option>
                    <option value="Q2">Q2 (Apr-Jun)</option>
                    <option value="Q3">Q3 (Jul-Sep)</option>
                    <option value="Q4">Q4 (Oct-Dec)</option>
                  </select>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Year</Label>
                  <Input
                    type="number"
                    value={businessInfo.reporting_year}
                    onChange={(e) => updateBusinessInfo('reporting_year', e.target.value)}
                    placeholder="Year"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload/Download Actions */}
          <div className="flex flex-wrap gap-3 mb-6">
            <Button
              onClick={downloadTemplate}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Template
            </Button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx,.xls"
              className="hidden"
            />
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="flex items-center gap-2"
              disabled={uploading}
            >
              <Upload className="h-4 w-4" />
              {uploading ? 'Uploading...' : 'Upload File'}
            </Button>
            
            <Button
              onClick={addTransaction}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Transaction
            </Button>
          </div>

          {/* Transactions Table */}
          <Card className="border border-gray-200 shadow-none mb-6">
            <CardHeader className="border-b border-gray-100 py-4">
              <CardTitle className="text-base font-semibold flex items-center justify-between">
                <span className="flex items-center">
                  <FileSpreadsheet className="h-4 w-4 mr-2 text-gray-500" />
                  VAT Transactions ({transactions.length})
                </span>
                <Button
                  onClick={() => setShowResults(!showResults)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500"
                >
                  {showResults ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="ml-1">{showResults ? 'Hide' : 'Show'} Results</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">#</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Description</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Customer</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Transaction Type</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Sale Amount (₦)</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Input VAT (₦)</th>
                      {showResults && (
                        <>
                          <th className="px-4 py-3 text-left font-medium text-gray-700">Output VAT</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-700">Net VAT</th>
                        </>
                      )}
                      <th className="px-4 py-3 text-center font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((transaction, index) => (
                      <tr key={transaction.id} className={transaction.calculated ? 'bg-green-50/30' : ''}>
                        <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                        <td className="px-4 py-3">
                          <Input
                            value={transaction.description}
                            onChange={(e) => updateTransaction(transaction.id, 'description', e.target.value)}
                            placeholder="Description"
                            className="h-8 text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            value={transaction.customer_name}
                            onChange={(e) => updateTransaction(transaction.id, 'customer_name', e.target.value)}
                            placeholder="Customer"
                            className="h-8 text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={transaction.transaction_type}
                            onChange={(e) => updateTransaction(transaction.id, 'transaction_type', e.target.value)}
                            className="w-full h-8 text-sm border border-gray-300 rounded-md px-2"
                          >
                            <option value="">Select type</option>
                            <optgroup label="Standard Rated (7.5%)">
                              {Object.entries(transactionTypes)
                                .filter(([k, v]) => v.category === 'standard')
                                .map(([key, type]) => (
                                  <option key={key} value={key}>{type.name}</option>
                                ))}
                            </optgroup>
                            <optgroup label="Zero Rated (0%)">
                              {Object.entries(transactionTypes)
                                .filter(([k, v]) => v.category === 'zero')
                                .map(([key, type]) => (
                                  <option key={key} value={key}>{type.name}</option>
                                ))}
                            </optgroup>
                            <optgroup label="Exempt">
                              {Object.entries(transactionTypes)
                                .filter(([k, v]) => v.category === 'exempt')
                                .map(([key, type]) => (
                                  <option key={key} value={key}>{type.name}</option>
                                ))}
                            </optgroup>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            value={transaction.sale_amount}
                            onChange={(e) => updateTransaction(transaction.id, 'sale_amount', e.target.value)}
                            placeholder="0.00"
                            className="h-8 text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            value={transaction.input_vat}
                            onChange={(e) => updateTransaction(transaction.id, 'input_vat', e.target.value)}
                            placeholder="0.00"
                            className="h-8 text-sm"
                          />
                        </td>
                        {showResults && (
                          <>
                            <td className="px-4 py-3 font-medium text-gray-900">
                              {transaction.calculated ? formatCurrency(transaction.result?.output_vat || 0) : '-'}
                            </td>
                            <td className="px-4 py-3 font-medium">
                              {transaction.calculated ? (
                                transaction.result?.net_vat_payable > 0 ? (
                                  <span className="text-red-600">{formatCurrency(transaction.result.net_vat_payable)}</span>
                                ) : transaction.result?.vat_refundable > 0 ? (
                                  <span className="text-green-600">({formatCurrency(transaction.result.vat_refundable)})</span>
                                ) : (
                                  <span className="text-gray-500">₦0</span>
                                )
                              ) : '-'}
                            </td>
                          </>
                        )}
                        <td className="px-4 py-3 text-center">
                          <Button
                            onClick={() => removeTransaction(transaction.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            disabled={transactions.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Calculate Button */}
          <div className="flex justify-center mb-6">
            <Button
              onClick={calculateAllTransactions}
              disabled={loading || transactions.every(t => !t.sale_amount)}
              className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-xl"
            >
              {loading ? (
                <>
                  <Calculator className="h-4 w-4 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate All VAT
                </>
              )}
            </Button>
          </div>

          {/* Summary Card */}
          {showResults && totals.count > 0 && (
            <Card className="border border-gray-200 shadow-none">
              <CardHeader className="border-b border-gray-100 py-4 bg-gray-50">
                <CardTitle className="text-base font-semibold">VAT Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Sales</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(totals.total_sales)}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-xs text-purple-600 uppercase tracking-wide mb-1">Output VAT</p>
                    <p className="text-xl font-bold text-purple-900">{formatCurrency(totals.total_output_vat)}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600 uppercase tracking-wide mb-1">Input VAT</p>
                    <p className="text-xl font-bold text-blue-900">{formatCurrency(totals.total_input_vat)}</p>
                  </div>
                  <div className={`p-4 rounded-lg ${totals.total_net_vat > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                    <p className={`text-xs uppercase tracking-wide mb-1 ${totals.total_net_vat > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {totals.total_net_vat > 0 ? 'VAT Payable' : 'VAT Refundable'}
                    </p>
                    <p className={`text-xl font-bold ${totals.total_net_vat > 0 ? 'text-red-900' : 'text-green-900'}`}>
                      {formatCurrency(totals.total_net_vat > 0 ? totals.total_net_vat : totals.total_refundable)}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 border-t border-gray-200 pt-4">
                  <Badge variant="outline" className="text-gray-600">
                    Standard: {totals.standard_count}
                  </Badge>
                  <Badge variant="outline" className="text-green-600">
                    Zero-Rated: {totals.zero_count}
                  </Badge>
                  <Badge variant="outline" className="text-orange-600">
                    Exempt: {totals.exempt_count}
                  </Badge>
                </div>
                
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={exportResults}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export VAT Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Upgrade Prompt */}
      {showUpgradePrompt && (
        <UpgradePrompt
          feature={upgradeContext.feature}
          type={upgradeContext.type}
          onClose={() => setShowUpgradePrompt(false)}
          onUpgrade={handleUpgrade}
          onTrial={handleTrial}
          onAddon={handleAddon}
        />
      )}
    </div>
  );
};

export default BulkVATCalculator;
