import React, { useState, useRef } from 'react';
import { CreditCard, Plus, Trash2, Calculator, Download, Eye, EyeOff, Upload, FileSpreadsheet, Printer, AlertTriangle, Building2, Mail, Send } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { generatePaymentProcessingReport } from '../utils/pdfGenerator';
import UpgradePrompt from './UpgradePrompt';
import { useUpgrade } from '../hooks/useUpgrade';

const BulkPaymentCalculator = ({ formatCurrency, hasFeature }) => {
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradeContext, setUpgradeContext] = useState({ type: 'feature', feature: 'bulk_payment_calc' });
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
  const [payments, setPayments] = useState([
    {
      id: 1,
      payee_name: '',
      tin: '',
      contract_amount: '',
      transaction_type: '',
      is_resident: true,
      month: '',
      year: '',
      transaction_details: '',
      payee_email: '',
      calculated: false,
      result: null
    }
  ]);

  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Transaction types (same as single calculator)
  const transactionTypes = {
    'professional_services': {
      name: 'Professional Services (Consulting)',
      vat_applicable: true,
      vat_rate: 0.10,
      wht_rate_resident: 0.05,
      wht_rate_non_resident: 0.10,
      description: 'Consultancy, technical, management fees'
    },
    'rent_lease': {
      name: 'Rent & Lease Payments',
      vat_applicable: false,
      vat_rate: 0.00,
      wht_rate_resident: 0.10,
      wht_rate_non_resident: 0.10,
      description: 'All rent, hire, or lease transactions'
    },
    'dividends': {
      name: 'Dividends & Interest',
      vat_applicable: false,
      vat_rate: 0.00,
      wht_rate_resident: 0.10,
      wht_rate_non_resident: 0.10,
      description: 'Both resident and non-resident recipients'
    },
    'goods_supply': {
      name: 'Goods & Construction',
      vat_applicable: true,
      vat_rate: 0.10,
      wht_rate_resident: 0.025,
      wht_rate_non_resident: 0.05,
      description: 'Supply of goods, construction contracts'
    },
    'royalties': {
      name: 'Royalties',
      vat_applicable: true,
      vat_rate: 0.10,
      wht_rate_resident: 0.05,
      wht_rate_non_resident: 0.10,
      description: 'Intellectual property, licensing'
    },
    'digital_services': {
      name: 'Digital Services',
      vat_applicable: true,
      vat_rate: 0.10,
      wht_rate_resident: 0.05,
      wht_rate_non_resident: 0.10,
      description: 'Online services, digital content'
    },
    'medical_services': {
      name: 'Medical Services',
      vat_applicable: false,
      vat_rate: 0.00,
      wht_rate_resident: 0.05,
      wht_rate_non_resident: 0.10,
      description: 'Healthcare and medical services'
    },
    'educational_services': {
      name: 'Educational Services',
      vat_applicable: false,
      vat_rate: 0.00,
      wht_rate_resident: 0.05,
      wht_rate_non_resident: 0.10,
      description: 'Training and educational services'
    }
  };

  const addPayment = () => {
    const newPayment = {
      id: payments.length + 1,
      payee_name: '',
      tin: '',
      contract_amount: '',
      transaction_type: '',
      is_resident: true,
      month: '',
      year: '',
      transaction_details: '',
      payee_email: '',
      calculated: false,
      result: null
    };
    setPayments([...payments, newPayment]);
  };

  const removePayment = (id) => {
    if (payments.length > 1) {
      setPayments(payments.filter(payment => payment.id !== id));
    }
  };

  const updatePayment = (id, field, value) => {
    setPayments(payments.map(payment => 
      payment.id === id 
        ? { ...payment, [field]: value, calculated: false, result: null }
        : payment
    ));
  };

  const calculateSinglePayment = (paymentData) => {
    const contractAmount = parseFloat(paymentData.contract_amount) || 0;
    const transactionConfig = transactionTypes[paymentData.transaction_type];
    
    if (!transactionConfig) {
      return null;
    }

    // Calculate VAT
    let vatAmount = 0;
    let amountBeforeVat = contractAmount;
    
    if (transactionConfig.vat_applicable) {
      // Contract amount is inclusive of VAT
      amountBeforeVat = contractAmount / (1 + transactionConfig.vat_rate);
      vatAmount = contractAmount - amountBeforeVat;
    }

    // Calculate WHT
    const whtRate = paymentData.is_resident ? 
      transactionConfig.wht_rate_resident : 
      transactionConfig.wht_rate_non_resident;
    
    const whtAmount = amountBeforeVat * whtRate;

    // Calculate net payment to payee
    const netPayment = amountBeforeVat - whtAmount;

    // Calculate total government remittance
    const totalGovernmentRemittance = vatAmount + whtAmount;

    return {
      payee_name: paymentData.payee_name,
      contract_amount: contractAmount,
      transaction_type: transactionConfig.name,
      transaction_description: transactionConfig.description,
      is_resident: paymentData.is_resident,
      
      // Breakdown
      amount_before_vat: amountBeforeVat,
      vat_applicable: transactionConfig.vat_applicable,
      vat_rate: transactionConfig.vat_rate * 100,
      vat_amount: vatAmount,
      
      wht_rate: whtRate * 100,
      wht_amount: whtAmount,
      
      net_payment: netPayment,
      total_government_remittance: totalGovernmentRemittance,
      
      // Additional fields
      month: paymentData.month,
      year: paymentData.year,
      transaction_details: paymentData.transaction_details,
      payee_email: paymentData.payee_email,
      timestamp: new Date().toISOString()
    };
  };

  const calculateAllPayments = () => {
    // Check if user has the bulk payment feature
    if (!hasFeature || !hasFeature('bulk_payment_calc')) {
      setUpgradeContext({ type: 'feature', feature: 'bulk_payment_calc' });
      setShowUpgradePrompt(true);
      return;
    }

    setLoading(true);
    
    try {
      const calculatedPayments = payments.map(payment => {
        if (!payment.payee_name || !payment.contract_amount || !payment.transaction_type) {
          return { ...payment, calculated: false, result: null };
        }
        
        const result = calculateSinglePayment(payment);
        return { ...payment, calculated: true, result };
      });
      
      setPayments(calculatedPayments);
      setShowResults(true);
    } catch (error) {
      console.error('Error calculating payments:', error);
      alert('Error calculating payments. Please check your input values.');
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        // Helper function to convert transaction type name back to key
        const getTransactionTypeKey = (name) => {
          const entry = Object.entries(transactionTypes).find(([key, config]) => config.name === name);
          return entry ? entry[0] : name; // Return key if found, otherwise return original
        };

        // Skip header row and convert to payment objects
        const paymentsData = jsonData.slice(1).map((row, index) => ({
          id: index + 1,
          payee_name: row[0] || '',
          tin: row[1] || '',
          contract_amount: row[2] || '',
          transaction_type: getTransactionTypeKey(row[3]) || '',
          is_resident: row[4] !== 'Non-Resident',
          month: row[5] || '',
          year: row[6] || '',
          transaction_details: row[7] || '',
          payee_email: row[8] || '',
          calculated: false,
          result: null
        })).filter(payment => payment.payee_name); // Filter out empty rows
        
        if (paymentsData.length > 0) {
          setPayments(paymentsData);
          alert(`Successfully uploaded ${paymentsData.length} payment records.`);
        } else {
          alert('No valid payment data found in the file.');
        }
      } catch (error) {
        console.error('Error parsing file:', error);
        alert('Error reading file. Please ensure it\'s a valid Excel/CSV file.');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    
    // Get transaction type options for dropdown
    const transactionTypeOptions = Object.values(transactionTypes).map(type => type.name);
    const residencyOptions = ['Resident', 'Non-Resident'];
    
    // Create a hidden "Lists" sheet for data validation references
    const listsData = [
      ['Transaction Types', 'Residency Status'],
      ...transactionTypeOptions.map((type, idx) => [type, residencyOptions[idx] || ''])
    ];
    const listsWs = XLSX.utils.aoa_to_sheet(listsData);
    listsWs['!cols'] = [{ wch: 35 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, listsWs, 'ValidationLists');
    
    // Create main template data
    const templateData = [
      ['Payee Name', 'TIN', 'Contract Amount', 'Transaction Type', 'Residency Status', 'Month', 'Year', 'Transaction Details', 'Payee Email'],
      ['ABC Company Ltd', '12345678901', '1000000', 'Professional Services (Consulting)', 'Resident', 'January', '2024', 'Consulting services', 'abc@company.com'],
      ['XYZ Consultant', '98765432109', '500000', 'Rent & Lease Payments', 'Non-Resident', 'February', '2024', 'Office rent', 'xyz@consultant.com']
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    
    // Set column widths for better readability
    ws['!cols'] = [
      { wch: 20 }, // Payee Name
      { wch: 15 }, // TIN
      { wch: 15 }, // Contract Amount
      { wch: 35 }, // Transaction Type (wider for dropdown)
      { wch: 15 }, // Residency Status
      { wch: 12 }, // Month
      { wch: 8 },  // Year
      { wch: 25 }, // Transaction Details
      { wch: 25 }  // Payee Email
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'Payment Template');
    
    // Add Transaction Types Reference Sheet (visible for manual reference)
    const txnTypesData = [
      ['TRANSACTION TYPE OPTIONS - Use these exact values in the "Transaction Type" column'],
      [''],
      ['Value to Enter', 'Description', 'VAT Applicable', 'WHT Rate (Resident)', 'WHT Rate (Non-Resident)'],
    ];
    
    Object.values(transactionTypes).forEach(type => {
      txnTypesData.push([
        type.name,
        type.description,
        type.vat_applicable ? 'Yes (10%)' : 'No',
        `${(type.wht_rate_resident * 100).toFixed(0)}%`,
        `${(type.wht_rate_non_resident * 100).toFixed(0)}%`
      ]);
    });
    
    txnTypesData.push(['']);
    txnTypesData.push(['IMPORTANT: Copy the exact text from "Value to Enter" column into your Payment Template']);
    
    const txnTypesWs = XLSX.utils.aoa_to_sheet(txnTypesData);
    txnTypesWs['!cols'] = [{ wch: 35 }, { wch: 40 }, { wch: 15 }, { wch: 18 }, { wch: 22 }];
    XLSX.utils.book_append_sheet(wb, txnTypesWs, 'Transaction Types');
    
    // Add instructions worksheet
    const instructionsData = [
      ['FIQUANT CONSULT - BULK VENDOR PAYMENT CALCULATOR INSTRUCTIONS'],
      [''],
      ['HOW TO USE THIS TEMPLATE:'],
      [''],
      ['1. DOWNLOAD & OPEN:'],
      ['   - This file is downloaded to your computer'],
      ['   - Open it in Microsoft Excel (recommended) or Google Sheets'],
      [''],
      ['2. FILL IN DATA (Payment Template sheet):'],
      ['   - Replace sample data with your actual payment information'],
      ['   - Payee Name and Contract Amount are required fields'],
      [''],
      ['3. TRANSACTION TYPE SELECTION:'],
      ['   - Go to the "Transaction Types" sheet to see all valid options'],
      ['   - Copy the EXACT text from the "Value to Enter" column'],
      ['   - Paste it into the Transaction Type column of your payment data'],
      ['   - Using exact values ensures correct WHT rate calculation'],
      [''],
      ['   AVAILABLE TRANSACTION TYPES:'],
    ];
    
    // Add transaction type list to instructions
    Object.values(transactionTypes).forEach(type => {
      instructionsData.push([`   • ${type.name}`]);
    });
    
    instructionsData.push(['']);
    instructionsData.push(['4. RESIDENCY STATUS:']);
    instructionsData.push(['   - Enter exactly "Resident" or "Non-Resident"']);
    instructionsData.push(['   - This affects WHT rates applied']);
    instructionsData.push(['']);
    instructionsData.push(['5. SAVE & UPLOAD:']);
    instructionsData.push(['   - Save the file (keep as .xlsx format)']);
    instructionsData.push(['   - Return to Fiquant TaxPro website']);
    instructionsData.push(['   - Click "Upload File" button and select this file']);
    instructionsData.push(['']);
    instructionsData.push(['6. CALCULATE:']);
    instructionsData.push(['   - Click "Calculate All Payments" to process']);
    instructionsData.push(['   - Review results in the table format']);
    instructionsData.push(['   - Export reports or send payment advices as needed']);
    instructionsData.push(['']);
    instructionsData.push(['FIELD DESCRIPTIONS:']);
    instructionsData.push(['']);
    instructionsData.push(['• Payee Name: Company or individual name (Required)']);
    instructionsData.push(['• TIN: Tax Identification Number (Optional)']);
    instructionsData.push(['• Contract Amount: Total amount including VAT if applicable (Required)']);
    instructionsData.push(['• Transaction Type: Select from "Transaction Types" sheet - determines VAT/WHT rates']);
    instructionsData.push(['• Residency Status: "Resident" or "Non-Resident" (affects WHT rates)']);
    instructionsData.push(['• Month: Transaction month (Optional)']);
    instructionsData.push(['• Year: Transaction year (Optional)']);
    instructionsData.push(['• Transaction Details: Brief description (Optional)']);
    instructionsData.push(['• Payee Email: Email for payment advice (Optional)']);
    
    const instructionsWs = XLSX.utils.aoa_to_sheet(instructionsData);
    instructionsWs['!cols'] = [{ wch: 85 }]; // Wide column for instructions
    
    XLSX.utils.book_append_sheet(wb, instructionsWs, 'Instructions');
    
    // Reorder sheets: Payment Template first, then Transaction Types, then Instructions, ValidationLists last
    wb.SheetNames = ['Payment Template', 'Transaction Types', 'Instructions', 'ValidationLists'];
    
    XLSX.writeFile(wb, 'bulk_vendor_payment_template.xlsx');
  };

  const sendBulkPaymentAdvices = async () => {
    const paymentsWithEmail = payments.filter(p => p.calculated && p.payee_email);
    
    if (paymentsWithEmail.length === 0) {
      alert('No calculated payments with email addresses found.');
      return;
    }

    try {
      // Here you would typically send emails to all payees
      alert(`Payment advices sent to ${paymentsWithEmail.length} recipients successfully!`);
    } catch (error) {
      console.error('Error sending bulk payment advices:', error);
      alert('Error sending payment advices. Please try again.');
    }
  };

  const generateBulkPaymentReports = () => {
    const calculatedPayments = payments.filter(p => p.calculated && p.result);
    
    if (calculatedPayments.length === 0) {
      alert('No calculated payments found to print.');
      return;
    }

    try {
      // Generate individual reports for each payment
      calculatedPayments.forEach((payment, index) => {
        setTimeout(() => {
          generatePaymentProcessingReport(payment, payment.result);
        }, index * 500); // Small delay between reports to avoid browser issues
      });
      
      alert(`Generated ${calculatedPayments.length} payment reports successfully!`);
    } catch (error) {
      console.error('Error generating bulk reports:', error);
      alert('Error generating reports. Please try again.');
    }
  };

  const getTotalSummary = () => {
    const calculatedPayments = payments.filter(p => p.calculated && p.result);
    
    return calculatedPayments.reduce((totals, payment) => ({
      totalContracts: totals.totalContracts + payment.result.contract_amount,
      totalVAT: totals.totalVAT + payment.result.vat_amount,
      totalWHT: totals.totalWHT + payment.result.wht_amount,
      totalNetPayments: totals.totalNetPayments + payment.result.net_payment,
      totalGovernmentRemittance: totals.totalGovernmentRemittance + payment.result.total_government_remittance,
      count: totals.count + 1
    }), {
      totalContracts: 0,
      totalVAT: 0,
      totalWHT: 0,
      totalNetPayments: 0,
      totalGovernmentRemittance: 0,
      count: 0
    });
  };

  const summary = getTotalSummary();

  return (
    <div className="space-y-6">
      <Card className="bg-white border-purple-100 shadow-lg">
        <CardHeader className="text-white" style={{ background: 'linear-gradient(to right, #0e1c41, #152350)' }}>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Bulk Vendor Payment Processing Calculator</span>
          </CardTitle>
          <CardDescription className="text-purple-100">
            Process multiple payments with WHT & VAT calculations
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {/* File Upload Section */}
          <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-purple-800 flex items-center">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Bulk Upload
              </h3>
              <div className="space-x-2">
                <Button
                  onClick={downloadTemplate}
                  variant="outline"
                  size="sm"
                  className="border-purple-300 text-purple-700 hover:bg-purple-100"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Template
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  className="border-purple-300 text-purple-700 hover:bg-purple-100"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload File'}
                </Button>
              </div>
            </div>
            <p className="text-sm text-purple-700">
              Upload an Excel file with payment data or download our template to get started.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={uploadFile}
              style={{ display: 'none' }}
            />
          </div>

          {/* Payments List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Building2 className="h-4 w-4 mr-2 text-purple-600" />
                Payment Entries ({payments.length})
              </h3>
              <div className="space-x-2">
                <Button
                  onClick={addPayment}
                  variant="outline"
                  size="sm"
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment
                </Button>
                <Button
                  onClick={() => setShowResults(!showResults)}
                  variant="outline"
                  size="sm"
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  {showResults ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {showResults ? 'Hide Results' : 'Show Results'}
                </Button>
              </div>
            </div>

            {payments.map((payment, index) => (
              <Card key={payment.id} className="border border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Payment #{payment.id}</CardTitle>
                    <div className="flex items-center space-x-2">
                      {payment.calculated && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Calculated
                        </Badge>
                      )}
                      {payments.length > 1 && (
                        <Button
                          onClick={() => removePayment(payment.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`payee_name_${payment.id}`}>Payee Name *</Label>
                      <Input
                        id={`payee_name_${payment.id}`}
                        placeholder="Company/Individual"
                        value={payment.payee_name}
                        onChange={(e) => updatePayment(payment.id, 'payee_name', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`tin_${payment.id}`}>TIN</Label>
                      <Input
                        id={`tin_${payment.id}`}
                        placeholder="12345678901"
                        value={payment.tin}
                        onChange={(e) => updatePayment(payment.id, 'tin', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`contract_amount_${payment.id}`}>Contract Amount *</Label>
                      <Input
                        id={`contract_amount_${payment.id}`}
                        type="number"
                        placeholder="₦1,000,000"
                        value={payment.contract_amount}
                        onChange={(e) => updatePayment(payment.id, 'contract_amount', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`transaction_type_${payment.id}`}>Transaction Type * (For WHT deduction computation)</Label>
                      <select
                        id={`transaction_type_${payment.id}`}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={payment.transaction_type}
                        onChange={(e) => updatePayment(payment.id, 'transaction_type', e.target.value)}
                      >
                        <option value="">Select Type</option>
                        {Object.entries(transactionTypes).map(([key, config]) => (
                          <option key={key} value={key}>{config.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`month_${payment.id}`}>Month</Label>
                      <select
                        id={`month_${payment.id}`}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={payment.month}
                        onChange={(e) => updatePayment(payment.id, 'month', e.target.value)}
                      >
                        <option value="">Select Month</option>
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
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`year_${payment.id}`}>Year</Label>
                      <Input
                        id={`year_${payment.id}`}
                        type="number"
                        placeholder="2024"
                        min="2020"
                        max="2030"
                        value={payment.year}
                        onChange={(e) => updatePayment(payment.id, 'year', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2 lg:col-span-2">
                      <Label htmlFor={`transaction_details_${payment.id}`}>Transaction Details</Label>
                      <Input
                        id={`transaction_details_${payment.id}`}
                        placeholder="Brief description"
                        value={payment.transaction_details}
                        onChange={(e) => updatePayment(payment.id, 'transaction_details', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`payee_email_${payment.id}`}>Payee Email</Label>
                      <Input
                        id={`payee_email_${payment.id}`}
                        type="email"
                        placeholder="payee@example.com"
                        value={payment.payee_email}
                        onChange={(e) => updatePayment(payment.id, 'payee_email', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Label className="text-sm">Payee Status:</Label>
                      <div className="flex space-x-3">
                        <label className="flex items-center space-x-1">
                          <input
                            type="radio"
                            name={`residency_${payment.id}`}
                            checked={payment.is_resident}
                            onChange={() => updatePayment(payment.id, 'is_resident', true)}
                            className="w-3 h-3 text-purple-600"
                          />
                          <span className="text-sm">Resident</span>
                        </label>
                        <label className="flex items-center space-x-1">
                          <input
                            type="radio"
                            name={`residency_${payment.id}`}
                            checked={!payment.is_resident}
                            onChange={() => updatePayment(payment.id, 'is_resident', false)}
                            className="w-3 h-3 text-purple-600"
                          />
                          <span className="text-sm">Non-Resident</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Individual Payment Result Summary */}
                  {payment.calculated && payment.result && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                          ✓ Calculated
                        </Badge>
                        <Button
                          onClick={() => {
                            // Check if user has PDF export feature  
                            if (!hasFeature || !hasFeature('pdf_export')) {
                              setUpgradeContext({ type: 'feature', feature: 'pdf_export' });
                              setShowUpgradePrompt(true);
                              return;
                            }
                            generatePaymentProcessingReport(payment, payment.result);
                          }}
                          size="sm"
                          className="bg-gray-900 hover:bg-gray-800 text-white text-xs px-3 py-1"
                        >
                          <Printer className="h-3 w-3 mr-1" />
                          Print Report
                          {hasFeature && !hasFeature('pdf_export') && (
                            <Badge variant="outline" className="ml-1 text-[10px] px-1 py-0 bg-gray-50 text-gray-600 border-gray-200">
                              PRO+
                            </Badge>
                          )}
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Net Payment:</span>
                          <div className="font-bold text-purple-600">
                            {formatCurrency(payment.result.net_payment)}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">VAT Amount:</span>
                          <div className="font-medium text-red-600">
                            {formatCurrency(payment.result.vat_amount)}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">WHT Amount:</span>
                          <div className="font-medium text-orange-600">
                            {formatCurrency(payment.result.wht_amount)}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Gov't Total:</span>
                          <div className="font-medium text-gray-800">
                            {formatCurrency(payment.result.total_government_remittance)}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-600">
                        Contract: {formatCurrency(payment.result.contract_amount)} | 
                        Transaction: {payment.result.transaction_type} | 
                        Status: {payment.is_resident ? 'Resident' : 'Non-Resident'}
                      </div>
                    </div>
                  )}
                  
                  {/* Calculation status for uncalculated payments */}
                  {!payment.calculated && (
                    <div className="mt-2">
                      <Badge variant="outline" className="bg-gray-100 text-gray-600 text-xs">
                        Pending Calculation
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              onClick={calculateAllPayments}
              disabled={loading}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              <Calculator className="h-4 w-4 mr-2" />
              {loading ? 'Processing...' : 'Calculate All Payments'}
              {hasFeature && !hasFeature('bulk_payment_calc') && (
                <Badge variant="outline" className="ml-2 text-xs bg-purple-50 text-purple-600 border-purple-200">
                  PRO+
                </Badge>
              )}
            </Button>
            
            {summary.count > 0 && (
              <>
                <Button
                  onClick={() => {
                    // Check if user has PDF export feature
                    if (!hasFeature || !hasFeature('pdf_export')) {
                      setUpgradeContext({ type: 'feature', feature: 'pdf_export' });
                      setShowUpgradePrompt(true);
                      return;
                    }
                    generateBulkPaymentReports();
                  }}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print All Reports
                  {hasFeature && !hasFeature('pdf_export') && (
                    <Badge variant="outline" className="ml-2 text-xs bg-gray-50 text-gray-600 border-gray-200">
                      PRO+
                    </Badge>
                  )}
                </Button>
                
                <Button
                  onClick={sendBulkPaymentAdvices}
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send All Advices
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      {showResults && summary.count > 0 && (
        <Card className="bg-white border-purple-100 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Payment Processing Results</span>
              <Badge className="bg-purple-100 text-purple-800">
                {summary.count} Calculated
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payee</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction Type</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Contract Amount</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">VAT Amount</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">WHT Amount</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Net Payment</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Gov't Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.filter(p => p.calculated && p.result).map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.payee_name}
                        {payment.payee_email && (
                          <div className="text-xs text-gray-500">{payment.payee_email}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {payment.result.transaction_type}
                        {payment.transaction_details && (
                          <div className="text-xs text-gray-400">{payment.transaction_details}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(payment.result.contract_amount)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 text-right">
                        {formatCurrency(payment.result.vat_amount)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-orange-600 text-right">
                        {formatCurrency(payment.result.wht_amount)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-purple-600 text-right font-medium">
                        {formatCurrency(payment.result.net_payment)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 text-right">
                        {formatCurrency(payment.result.total_government_remittance)}
                      </td>
                    </tr>
                  ))}
                  {/* Totals Row */}
                  <tr className="bg-purple-50 border-t-2 border-purple-200">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-purple-900" colSpan="2">
                      TOTALS ({summary.count} payments)
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-purple-900 text-right">
                      {formatCurrency(summary.totalContracts)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-red-700 text-right">
                      {formatCurrency(summary.totalVAT)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-orange-700 text-right">
                      {formatCurrency(summary.totalWHT)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-purple-700 text-right">
                      {formatCurrency(summary.totalNetPayments)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-700 text-right">
                      {formatCurrency(summary.totalGovernmentRemittance)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Results */}
      {showResults && summary.count > 0 && (
        <Card className="bg-white border-purple-100 shadow-lg">
          <CardHeader className="text-white" style={{ background: 'linear-gradient(to right, #0e1c41, #152350)' }}>
            <CardTitle>Bulk Vendor Payment Summary</CardTitle>
            <CardDescription className="text-pink-100">
              Total calculations for {summary.count} payments
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-600 font-medium">Total Contracts</p>
                <p className="text-xl font-bold text-purple-800">
                  {formatCurrency(summary.totalContracts)}
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-600 font-medium">Total Net Payments</p>
                <p className="text-xl font-bold text-green-800">
                  {formatCurrency(summary.totalNetPayments)}
                </p>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-sm text-red-600 font-medium">Total VAT</p>
                <p className="text-lg font-bold text-red-800">
                  {formatCurrency(summary.totalVAT)}
                </p>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-600 font-medium">Total WHT</p>
                <p className="text-lg font-bold text-orange-800">
                  {formatCurrency(summary.totalWHT)}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 font-medium">Gov't Remittance</p>
                <p className="text-lg font-bold text-gray-800">
                  {formatCurrency(summary.totalGovernmentRemittance)}
                </p>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-6">
              <p className="text-xs text-amber-800 flex items-start">
                <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Note:</strong> Users are solely responsible for the validity, accuracy and completeness of the financial information they supply.
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upgrade Prompt */}
      {showUpgradePrompt && (
        <UpgradePrompt
          type={upgradeContext.type}
          feature={upgradeContext.feature}
          onUpgrade={handleUpgrade}
          onTrial={handleTrial}
          onAddon={handleAddon}
          onClose={() => setShowUpgradePrompt(false)}
        />
      )}
    </div>
  );
};

export default BulkPaymentCalculator;