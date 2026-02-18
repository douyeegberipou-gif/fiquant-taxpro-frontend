import React, { useState, useRef } from 'react';
import { Users, Plus, Trash2, Calculator, Download, Eye, EyeOff, Upload, FileSpreadsheet, Printer, AlertTriangle, Building2, Lock, Info } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { generateBulkPayeReport } from '../utils/pdfGenerator';
import UpgradePrompt from './UpgradePrompt';
import BulkLimitModal from './BulkLimitModal';
import FeatureGateModal from './FeatureGateModal';
import { useUpgrade } from '../hooks/useUpgrade';
import { useBulkPayeLimit } from '../hooks/useBulkPayeLimit';

const BulkPayrollCalculator = ({ 
  formatCurrency, 
  calculatePayeTax,
  hasFeature,
  onShowTrialModal,
  onShowUpgradeModal
}) => {
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradeContext, setUpgradeContext] = useState({ type: 'feature', feature: 'bulk_paye' });
  const { startTrial, requestUpgrade, requestAddon } = useUpgrade();
  
  // Bulk PAYE limit tracking
  const bulkLimit = useBulkPayeLimit();
  
  // CSV import feature gate
  const [showCsvGate, setShowCsvGate] = useState(false);

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
  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: '',
      tin: '',
      basic_salary: '',
      transport_allowance: '',
      housing_allowance: '',
      meal_allowance: '',
      utility_allowance: '',
      medical_allowance: '',
      other_allowances: '',
      bik_vehicle_value: '',
      bik_housing_value: '',
      bonus: '',
      pension_contribution: '',
      nhf_contribution: '',
      life_insurance_premium: '',
      health_insurance_premium: '',
      nhis_contribution: '',
      annual_rent: '',
      mortgage_interest: '',
      calculated: false,
      result: null
    }
  ]);

  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Company information for the payroll
  const [companyInfo, setCompanyInfo] = useState({
    company_name: '',
    company_tin: '',
    tax_authority: '',
    employer_contact: '',
    employer_address: '',
    payroll_month: '',
    payroll_year: new Date().getFullYear().toString()
  });

  const updateCompanyInfo = (field, value) => {
    setCompanyInfo(prev => ({ ...prev, [field]: value }));
  };

  const addEmployee = () => {
    const newEmployee = {
      id: employees.length + 1,
      name: '',
      tin: '',
      basic_salary: '',
      transport_allowance: '',
      housing_allowance: '',
      meal_allowance: '',
      utility_allowance: '',
      medical_allowance: '',
      other_allowances: '',
      bik_vehicle_value: '',
      bik_housing_value: '',
      bonus: '',
      pension_contribution: '',
      nhf_contribution: '',
      life_insurance_premium: '',
      health_insurance_premium: '',
      nhis_contribution: '',
      annual_rent: '',
      mortgage_interest: '',
      calculated: false,
      result: null
    };
    setEmployees([...employees, newEmployee]);
  };

  const removeEmployee = (id) => {
    if (employees.length > 1) {
      setEmployees(employees.filter(emp => emp.id !== id));
    }
  };

  const updateEmployee = (id, field, value) => {
    setEmployees(employees.map(emp => 
      emp.id === id ? { ...emp, [field]: value, calculated: false, result: null } : emp
    ));
  };

  const calculateBulkPayroll = async () => {
    // Check staff count limit
    const activeEmployees = employees.filter(emp => emp.name && emp.basic_salary);
    const staffCount = activeEmployees.length;
    
    if (staffCount > bulkLimit.staffLimit) {
      bulkLimit.setShowLimitModal(true);
      return;
    }
    
    // Check monthly limit for free users
    if (!bulkLimit.isPaidUser && bulkLimit.isMonthlyLimitReached) {
      bulkLimit.setShowLimitModal(true);
      return;
    }

    setLoading(true);
    
    // Increment bulk count for free users
    if (!bulkLimit.isPaidUser) {
      bulkLimit.incrementBulkCount();
    }
    
    const updatedEmployees = [];

    for (const employee of employees) {
      if (employee.name && employee.basic_salary) {
        try {
          const taxInput = {
            basic_salary: parseFloat(employee.basic_salary) || 0,
            transport_allowance: parseFloat(employee.transport_allowance) || 0,
            housing_allowance: parseFloat(employee.housing_allowance) || 0,
            meal_allowance: parseFloat(employee.meal_allowance) || 0,
            utility_allowance: parseFloat(employee.utility_allowance) || 0,
            medical_allowance: parseFloat(employee.medical_allowance) || 0,
            other_allowances: parseFloat(employee.other_allowances) || 0,
            pension_contribution: parseFloat(employee.pension_contribution) || 0,
            nhf_contribution: parseFloat(employee.nhf_contribution) || 0,
            // NHF is applicable only if a value is entered; empty field means not applicable
            nhf_applicable: employee.nhf_contribution && employee.nhf_contribution.toString().trim() !== '',
            life_insurance_premium: parseFloat(employee.life_insurance_premium) || 0,
            health_insurance_premium: parseFloat(employee.health_insurance_premium) || 0,
            nhis_contribution: parseFloat(employee.nhis_contribution) || 0,
            annual_rent: parseFloat(employee.annual_rent) || 0,
            mortgage_interest: parseFloat(employee.mortgage_interest) || 0
          };

          const result = await calculatePayeTax(taxInput);
          updatedEmployees.push({
            ...employee,
            calculated: true,
            result: result
          });
        } catch (error) {
          console.error(`Error calculating tax for ${employee.name}:`, error);
          updatedEmployees.push({
            ...employee,
            calculated: false,
            result: null
          });
        }
      } else {
        updatedEmployees.push(employee);
      }
    }

    setEmployees(updatedEmployees);
    setShowResults(true);
    setLoading(false);
  };

  const getTotals = () => {
    const calculatedEmployees = employees.filter(emp => emp.calculated && emp.result);
    
    const totals = calculatedEmployees.reduce((acc, emp) => {
      return {
        totalGross: acc.totalGross + emp.result.monthly_gross_income,
        totalTax: acc.totalTax + emp.result.monthly_tax,
        totalNet: acc.totalNet + emp.result.monthly_net_income,
        employeeCount: acc.employeeCount + 1
      };
    }, { totalGross: 0, totalTax: 0, totalNet: 0, employeeCount: 0 });

    return totals;
  };

  const exportToCSV = () => {
    const calculatedEmployees = employees.filter(emp => emp.calculated && emp.result);
    
    const headers = [
      'Employee Name', 'TIN', 'Basic Salary', 'Transport Allowance', 'Housing Allowance',
      'Meal Allowance', 'Utility Allowance', 'Medical Allowance', 'Other Allowances', 
      'BIK Vehicle Value', 'BIK Housing Value', 'Bonus',
      'Pension Contribution', 'NHF Contribution', 'Life Insurance', 'Health Insurance', 
      'NHIS', 'Annual Rent', 'Mortgage Interest', 'Monthly Gross', 'Monthly Tax', 'Monthly Net',
      'BIK Vehicle Taxable', 'BIK Housing Taxable', 'Total BIK Taxable'
    ];

    const csvContent = [
      headers.join(','),
      ...calculatedEmployees.map(emp => [
        emp.name,
        emp.tin,
        emp.basic_salary,
        emp.transport_allowance,
        emp.housing_allowance,
        emp.meal_allowance,
        emp.utility_allowance,
        emp.medical_allowance,
        emp.other_allowances,
        emp.bik_vehicle_value || 0,
        emp.bik_housing_value || 0,
        emp.bonus || 0,
        emp.pension_contribution,
        emp.nhf_contribution,
        emp.life_insurance_premium,
        emp.health_insurance_premium,
        emp.nhis_contribution,
        emp.annual_rent,
        emp.mortgage_interest,
        emp.result.monthly_gross_income,
        emp.result.monthly_tax,
        emp.result.monthly_net_income,
        emp.result.bik_vehicle_taxable || 0,
        emp.result.bik_housing_taxable || 0,
        emp.result.total_bik_taxable || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll_calculation_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadExcelTemplate = () => {
    // Feature gate - CSV/Excel features are Premium only
    if (!hasFeature || !hasFeature('csv_import')) {
      setShowCsvGate(true);
      return;
    }
    
    try {
      console.log('Creating Excel template...');
      
      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      
      // Create the main data worksheet
      const worksheetData = [];
      
      // Title and header information with Fiquant Consult branding
      worksheetData.push(['FIQUANT CONSULT - PAYE BULK UPLOAD TEMPLATE']);
      worksheetData.push(['Generated on:', new Date().toLocaleDateString()]);
      worksheetData.push(['']);
      worksheetData.push(['INSTRUCTIONS:']);
      worksheetData.push(['1. Fill in employee details in the rows below']);
      worksheetData.push(['2. Fields marked with * are required']);
      worksheetData.push(['3. Leave Pension empty for auto-calculation (8%). NHF field: enter value if applicable, leave empty if not.']);
      worksheetData.push(['4. All amounts should be in Nigerian Naira (₦)']);
      worksheetData.push(['5. Save the file and upload it back to Fiquant TaxPro']);
      worksheetData.push(['6. DO NOT modify the watermark or template structure']);
      worksheetData.push(['7. BIK (Benefits in Kind): Vehicle=5% taxable, Housing=20% taxable, Bonus=100% taxable']);
      worksheetData.push(['']);
      worksheetData.push(['SAMPLE DATA PROVIDED BELOW - REPLACE WITH YOUR ACTUAL DATA:']);
      worksheetData.push(['']);
      
      // Headers row (updated with BIK fields)
      const headers = [
        'Employee Name*', 'TIN', 'Basic Salary*', 'Transport Allowance', 'Housing Allowance',
        'Meal Allowance', 'Utility Allowance', 'Medical Allowance', 'Other Allowances', 
        'BIK Vehicle Value', 'BIK Housing Value', 'Bonus',
        'Pension Contribution', 'NHF Contribution', 'Life Insurance Premium', 
        'Health Insurance Premium', 'NHIS Contribution', 'Annual Rent', 'Mortgage Interest'
      ];
      worksheetData.push(headers);
      
      // Sample data (with BIK fields)
      const sampleData = [
        ['John Doe', '12345678', 500000, 50000, 200000, 30000, 20000, 25000, 25000, 5000000, 0, 1000000, '', '', 10000, 15000, 5000, 1200000, 500000],
        ['Jane Smith', '87654321', 400000, 40000, 150000, 25000, 15000, 20000, 20000, 0, 3000000, 500000, '', '', 8000, 12000, 4000, 1000000, 0],
        ['Mike Johnson', '11223344', 600000, 60000, 250000, 35000, 25000, 30000, 30000, 8000000, 4000000, 2000000, '', '', 12000, 18000, 6000, 1500000, 750000],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''], // Empty row for user data
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''], // Empty row for user data
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''], // Empty row for user data
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''], // Empty row for user data
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''], // Empty row for user data
      ];
      
      // Add sample data
      sampleData.forEach(row => {
        worksheetData.push(row);
      });
      
      // Add more empty rows for user data
      for (let i = 0; i < 15; i++) {
        worksheetData.push(['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
      }
      
      // Add permanent watermark rows at the bottom (protected)
      worksheetData.push(['']);
      worksheetData.push(['']);
      worksheetData.push(['© FIQUANT CONSULT - TEMPLATE PROTECTED']);
      worksheetData.push(['This template is provided by Fiquant Consult']);
      worksheetData.push(['For support: contact@fiquantconsult.com']);
      worksheetData.push(['Template Version: 1.0']);
      worksheetData.push(['Generated: ' + new Date().toISOString()]);
      
      // Create worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      
      // Set column widths (updated for new fields)
      const columnWidths = [
        { wch: 20 }, // Employee Name
        { wch: 15 }, // TIN
        { wch: 15 }, // Basic Salary
        { wch: 15 }, // Transport
        { wch: 15 }, // Housing
        { wch: 12 }, // Meal
        { wch: 12 }, // Utility
        { wch: 12 }, // Medical
        { wch: 12 }, // Other
        { wch: 15 }, // Pension
        { wch: 12 }, // NHF
        { wch: 15 }, // Life Insurance
        { wch: 15 }, // Health Insurance
        { wch: 12 }, // NHIS
        { wch: 15 }, // Annual Rent
        { wch: 15 }  // Mortgage Interest
      ];
      worksheet['!cols'] = columnWidths;
      
      // Add the worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'PAYE Template');
      
      // Create a second worksheet with instructions
      const instructionsData = [
        ['FIQUANT CONSULT - PAYE CALCULATOR INSTRUCTIONS'],
        [''],
        ['HOW TO USE THIS TEMPLATE:'],
        [''],
        ['1. DOWNLOAD & OPEN:'],
        ['   - This file is already downloaded to your computer'],
        ['   - Open it in Microsoft Excel or Google Sheets'],
        [''],
        ['2. FILL IN DATA:'],
        ['   - Replace sample data with your actual employee information'],
        ['   - Employee Name and Basic Salary are required fields (marked with *)'],
        ['   - Leave Pension empty for automatic calculation (8% of basic)'],
        ['   - NHF: Enter value if applicable, leave empty if not applicable'],
        [''],
        ['3. SAVE & UPLOAD:'],
        ['   - Save the file (keep it as .xlsx format)'],
        ['   - Return to Fiquant TaxPro website'],
        ['   - Click "Upload File" button'],
        ['   - Select this saved file'],
        [''],
        ['4. CALCULATE:'],
        ['   - Click "Calculate All" to process all employee taxes'],
        ['   - Review results and export if needed'],
        [''],
        ['FIELD DESCRIPTIONS:'],
        [''],
        ['• Employee Name*: Full name (Required)'],
        ['• TIN: Tax Identification Number'],
        ['• Basic Salary*: Monthly basic salary in Naira (Required)'],
        ['• Transport Allowance: Monthly transport allowance'],
        ['• Housing Allowance: Monthly housing allowance'],
        ['• Meal Allowance: Monthly meal allowance'],
        ['• Utility Allowance: Monthly utility/electricity allowance'],
        ['• Medical Allowance: Monthly medical/healthcare allowance'],
        ['• Other Allowances: Any other monthly allowances'],
        ['• Pension Contribution: Leave empty for 8% auto-calculation'],
        ['• NHF Contribution: Enter value if applicable, leave empty if not applicable'],
        ['• Life Insurance Premium: Monthly life insurance premium'],
        ['• Health Insurance Premium: Monthly health insurance premium'],
        ['• NHIS Contribution: Monthly NHIS contribution'],
        ['• Annual Rent: Total annual rent paid (for rent relief)'],
        ['• Mortgage Interest: Annual mortgage interest for owner-occupied housing (NTA 2025 relief)'],
        [''],
        ['TAX CALCULATION FEATURES:'],
        [''],
        ['• Automatic PAYE calculation based on 2026 Nigerian tax laws'],
        ['• Progressive tax brackets applied'],
        ['• All applicable reliefs and deductions included'],
        ['• Pension relief: 8% of basic salary'],
        ['• NHF relief: 2.5% of basic salary'],
        ['• Rent relief: 20% of annual rent (max ₦500,000)'],
        ['• Mortgage interest relief: For owner-occupied housing per NTA 2025'],
        ['• Life insurance, health insurance, and NHIS reliefs'],
        [''],
        ['SUPPORT:'],
        ['For technical support or questions about tax calculations,'],
        ['please contact Fiquant Consult at info@fiquantconsult.com'],
        [''],
        ['© 2025 FIQUANT CONSULT - ALL RIGHTS RESERVED'],
        ['This template and tax calculator are proprietary to Fiquant Consult'],
      ];
      
      const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
      instructionsSheet['!cols'] = [{ wch: 70 }]; // Wide column for instructions
      XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');
      
      console.log('Workbook created, generating Excel file...');
      
      // Use writeFile method directly (more reliable in browsers)
      XLSX.writeFile(workbook, `Fiquant_Consult_PAYE_Template_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      console.log('Excel template downloaded successfully');
      
      // Show success message with troubleshooting tips
      const successMessage = `Excel template download initiated successfully! 

📁 File: Fiquant_Consult_PAYE_Template_${new Date().toISOString().split('T')[0]}.xlsx

If you don't see the download:
• Check your browser's download folder or notifications
• Ensure popup blocker is disabled for this site
• Try a different browser (Chrome, Firefox, Safari, Edge)
• Check if downloads are blocked in browser settings
• Look for download notification in browser's bottom bar
• Some corporate networks may block downloads

Need help? Contact Fiquant Consult support.`;
      
      alert(successMessage);
      
    } catch (error) {
      console.error('Error creating Excel template:', error);
      console.error('Error stack:', error.stack);
      
      const errorMessage = `Error creating Excel template: ${error.message}

Troubleshooting steps:
1. Refresh the page and try again
2. Clear your browser cache and cookies
3. Try a different browser
4. Disable browser extensions temporarily
5. Check if JavaScript is enabled

If the problem persists, please contact Fiquant Consult support with this error message.`;
      
      alert(errorMessage);
    }
  };

  const handleFileUpload = (event) => {
    // Feature gate - CSV/Excel features are Premium only
    if (!hasFeature || !hasFeature('csv_import')) {
      setShowCsvGate(true);
      event.target.value = ''; // Reset file input
      return;
    }
    
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        let workbook;
        let worksheet;
        
        // Check file type and parse accordingly
        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          // Parse Excel file
          const data = new Uint8Array(e.target.result);
          workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first worksheet (PAYE Template)
          const sheetName = workbook.SheetNames[0];
          worksheet = workbook.Sheets[sheetName];
          
          // Convert to array of arrays
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });
          
          // Find the header row (contains "Employee Name*")
          let headerRowIndex = -1;
          for (let i = 0; i < jsonData.length; i++) {
            if (jsonData[i] && jsonData[i][0] && jsonData[i][0].includes('Employee Name*')) {
              headerRowIndex = i;
              break;
            }
          }
          
          if (headerRowIndex === -1) {
            alert('Invalid Excel file format. Please use the downloaded Fiquant Consult template.');
            setUploading(false);
            return;
          }
          
          // Extract data rows (skip sample data and get only user-filled data)
          const dataRows = jsonData.slice(headerRowIndex + 1)
            .filter(row => {
              // Filter out sample data and empty rows
              if (!row || !row[0]) return false;
              const name = row[0].toString().trim();
              // Skip sample data
              if (name === 'John Doe' || name === 'Jane Smith' || name === 'Mike Johnson') return false;
              // Skip empty rows and watermark rows
              if (name === '' || name.includes('FIQUANT CONSULT') || name.includes('©')) return false;
              return true;
            });
          
          // Convert to employee objects (updated with BIK fields)
          const uploadedEmployees = dataRows.map((row, index) => ({
            id: index + 1,
            name: row[0] ? row[0].toString().trim() : '',
            tin: row[1] ? row[1].toString().trim() : '',
            basic_salary: row[2] ? row[2].toString().trim() : '',
            transport_allowance: row[3] ? row[3].toString().trim() : '',
            housing_allowance: row[4] ? row[4].toString().trim() : '',
            meal_allowance: row[5] ? row[5].toString().trim() : '',
            utility_allowance: row[6] ? row[6].toString().trim() : '',
            medical_allowance: row[7] ? row[7].toString().trim() : '',
            other_allowances: row[8] ? row[8].toString().trim() : '',
            bik_vehicle_value: row[9] ? row[9].toString().trim() : '',
            bik_housing_value: row[10] ? row[10].toString().trim() : '',
            bonus: row[11] ? row[11].toString().trim() : '',
            pension_contribution: row[12] ? row[12].toString().trim() : '',
            nhf_contribution: row[13] ? row[13].toString().trim() : '',
            life_insurance_premium: row[14] ? row[14].toString().trim() : '',
            health_insurance_premium: row[15] ? row[15].toString().trim() : '',
            nhis_contribution: row[16] ? row[16].toString().trim() : '',
            annual_rent: row[17] ? row[17].toString().trim() : '',
            mortgage_interest: row[18] ? row[18].toString().trim() : '',
            calculated: false,
            result: null
          })).filter(emp => emp.name && emp.basic_salary);
          
          if (uploadedEmployees.length === 0) {
            alert('No valid employee data found in the Excel file. Please fill in employee details and ensure at least Employee Name and Basic Salary are provided.');
            setUploading(false);
            return;
          }
          
          setEmployees(uploadedEmployees);
          alert(`Successfully imported ${uploadedEmployees.length} employees from Excel file!`);
          
        } else if (file.name.endsWith('.csv')) {
          // Handle CSV files (legacy support)
          const text = e.target.result;
          const lines = text.split('\n');
          
          let headerRowIndex = -1;
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('Employee Name*')) {
              headerRowIndex = i;
              break;
            }
          }

          if (headerRowIndex === -1) {
            alert('Invalid CSV file format. Please use the downloaded template.');
            setUploading(false);
            return;
          }

          const dataRows = lines.slice(headerRowIndex + 1)
            .filter(line => line.trim() && !line.startsWith(','))
            .map(line => {
              const values = [];
              let current = '';
              let inQuotes = false;
              
              for (let char of line) {
                if (char === '"') {
                  inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                  values.push(current.trim());
                  current = '';
                } else {
                  current += char;
                }
              }
              values.push(current.trim());
              return values;
            });

          const uploadedEmployees = dataRows.map((row, index) => ({
            id: index + 1,
            name: row[0] || '',
            tin: row[1] || '',
            basic_salary: row[2] || '',
            transport_allowance: row[3] || '',
            housing_allowance: row[4] || '',
            meal_allowance: row[5] || '',
            utility_allowance: row[6] || '',
            medical_allowance: row[7] || '',
            other_allowances: row[8] || '',
            bik_vehicle_value: row[9] || '',
            bik_housing_value: row[10] || '',
            bonus: row[11] || '',
            pension_contribution: row[12] || '',
            nhf_contribution: row[13] || '',
            life_insurance_premium: row[14] || '',
            health_insurance_premium: row[15] || '',
            nhis_contribution: row[16] || '',
            annual_rent: row[17] || '',
            mortgage_interest: row[18] || '',
            calculated: false,
            result: null
          })).filter(emp => emp.name.trim() && emp.basic_salary.trim());

          if (uploadedEmployees.length === 0) {
            alert('No valid employee data found in the CSV file. Please check the format.');
            setUploading(false);
            return;
          }

          setEmployees(uploadedEmployees);
          alert(`Successfully imported ${uploadedEmployees.length} employees from CSV file!`);
          
        } else {
          alert('Unsupported file format. Please use the Excel template (.xlsx) downloaded from this site.');
          setUploading(false);
          return;
        }
        
      } catch (error) {
        console.error('Error parsing file:', error);
        alert('Error reading the file. Please ensure you are using the correct Fiquant Consult template format.');
      } finally {
        setUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    // Read file based on type
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  };

  const totals = getTotals();

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-900 to-black text-white px-8 py-6">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-yellow-400" />
            <div>
              <h1 className="text-2xl font-bold">Bulk Payroll Calculator</h1>
              <p className="text-gray-300 text-sm mt-1">Calculate PAYE tax for multiple employees efficiently</p>
            </div>
          </div>
        </div>
        
        <div className="p-8">
          {/* Disclaimer Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-amber-800 flex items-start">
              <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Note:</strong> Users are solely responsible for the validity, accuracy and completeness of the financial information they supply.
              </span>
            </p>
          </div>

          {/* Company Information Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
              <Building2 className="h-4 w-4 mr-2 text-gray-600" />
              Company Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <Label htmlFor="company_name" className="text-xs text-gray-600">Company Name</Label>
                <Input
                  id="company_name"
                  value={companyInfo.company_name}
                  onChange={(e) => updateCompanyInfo('company_name', e.target.value)}
                  placeholder="Enter company name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="company_tin" className="text-xs text-gray-600">Company TIN</Label>
                <Input
                  id="company_tin"
                  value={companyInfo.company_tin}
                  onChange={(e) => updateCompanyInfo('company_tin', e.target.value)}
                  placeholder="e.g., 12345678-0001"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="tax_authority" className="text-xs text-gray-600">Tax Authority</Label>
                <Input
                  id="tax_authority"
                  value={companyInfo.tax_authority}
                  onChange={(e) => updateCompanyInfo('tax_authority', e.target.value)}
                  placeholder="e.g., LIRS, FIRS"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="payroll_month" className="text-xs text-gray-600">Payroll Month</Label>
                <select
                  id="payroll_month"
                  value={companyInfo.payroll_month}
                  onChange={(e) => updateCompanyInfo('payroll_month', e.target.value)}
                  className="mt-1 w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="payroll_year" className="text-xs text-gray-600">Payroll Year</Label>
                <Input
                  id="payroll_year"
                  type="number"
                  value={companyInfo.payroll_year}
                  onChange={(e) => updateCompanyInfo('payroll_year', e.target.value)}
                  placeholder="e.g., 2026"
                  min="2020"
                  max="2030"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="employer_contact" className="text-xs text-gray-600">Employer Contact (Optional)</Label>
                <Input
                  id="employer_contact"
                  value={companyInfo.employer_contact}
                  onChange={(e) => updateCompanyInfo('employer_contact', e.target.value)}
                  placeholder="e.g., 08012345678"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="employer_address" className="text-xs text-gray-600">Employer Address (Optional)</Label>
                <Input
                  id="employer_address"
                  value={companyInfo.employer_address}
                  onChange={(e) => updateCompanyInfo('employer_address', e.target.value)}
                  placeholder="e.g., 1 Akin Adesola, Lagos"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Bulk PAYE Limits Info */}
          {!bulkLimit.isPaidUser && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-blue-800 font-medium">Free Tier Limits</p>
                  <p className="text-blue-700 mt-1">
                    Max {bulkLimit.staffLimit} staff per calculation • {bulkLimit.remainingBulkCalcs} of {bulkLimit.monthlyLimit} monthly calculations remaining
                  </p>
                  <p className="text-blue-600 text-xs mt-1">
                    Upgrade to Starter for 10 staff unlimited, or Pro for 25 staff
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mt-4">
            {/* Left side - Excel Upload Actions */}
            <div className="flex space-x-4">
              <button 
                onClick={calculateBulkPayroll} 
                disabled={loading || employees.every(emp => !emp.name || !emp.basic_salary)}
                className="inline-flex items-center px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                data-testid="bulk-paye-calculate-btn"
              >
                <Calculator className="h-4 w-4 mr-2" />
                {loading ? 'Calculating...' : 'Calculate All'}
              </button>
            </div>

            {/* Right side - Results & Export */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowResults(!showResults)}
                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-all duration-200"
              >
                {showResults ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showResults ? 'Hide Results' : 'Show Results'}
              </button>
              {totals.employeeCount > 0 && (
                <button onClick={exportToCSV} className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-all duration-200">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </button>
              )}
            </div>
          </div>

          {/* Excel Template Section */}
          <div className="mt-8 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-400 rounded-xl">
                  <FileSpreadsheet className="h-6 w-6 text-gray-900" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Excel Template Upload</h3>
                  <p className="text-sm text-gray-600 mt-1">Download template, fill employee data, then upload for bulk processing</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={downloadExcelTemplate}
                  className="inline-flex items-center px-5 py-2.5 bg-white border border-yellow-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-yellow-50 transition-all duration-200 shadow-sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </button>
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                  />
                  <button
                    disabled={uploading}
                    className="inline-flex items-center px-5 py-2.5 bg-yellow-400 text-gray-900 text-sm font-medium rounded-xl hover:bg-yellow-500 disabled:opacity-50 transition-all duration-200 shadow-sm"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload File'}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Troubleshooting Tips */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-900 font-medium mb-2">💡 Download Not Working?</p>
              <div className="text-xs text-blue-700 space-y-1">
                <p>• Check your browser's download folder or notifications</p>
                <p>• Disable popup blocker for this site</p>
                <p>• Try a different browser (Chrome, Firefox, Safari, Edge)</p>
                <p>• Ensure downloads are enabled in browser settings</p>
                <p>• Some corporate networks may restrict downloads</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Input Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Bulk upload - Direct Entry</h2>
              <p className="text-sm text-gray-600 mt-1">Manually enter employee data for tax calculations</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Employees:</span>
                <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                  {employees.length}
                </span>
              </div>
              <div className="flex space-x-3">
                <button onClick={addEmployee} className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-all duration-200">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Employee
                </button>
                <button 
                  onClick={calculateBulkPayroll} 
                  disabled={loading || employees.every(emp => !emp.name || !emp.basic_salary)}
                  className="inline-flex items-center px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  {loading ? 'Calculating...' : 'Calculate All'}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-8">
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-900">
              <span className="font-medium">Relief Fields:</span> Leave pension empty for auto-calculation (8% of basic salary). NHF: enter value if applicable, leave empty if not applicable. 
              Other reliefs are optional but help reduce taxable income.
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider min-w-[40px]">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider min-w-[150px]">Employee Name *</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider min-w-[120px]">TIN</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider min-w-[120px]">Basic Salary *</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider min-w-[120px]">Transport</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider min-w-[120px]">Housing</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider min-w-[120px]">Meal</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider min-w-[100px]">Utility</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider min-w-[100px]">Medical</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider min-w-[100px]">Other</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider min-w-[100px]">Pension</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider min-w-[100px]">NHF</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider min-w-[100px]">Life Ins.</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider min-w-[100px]">Health Ins.</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider min-w-[100px]">NHIS</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider min-w-[120px]">Annual Rent</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider min-w-[120px]">Mortgage Int.</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider min-w-[80px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {employees.map((employee, index) => (
                    <tr key={employee.id} className={`${employee.calculated ? 'bg-green-50' : 'bg-white'} hover:bg-gray-50 transition-colors duration-150`}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {index + 1}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          placeholder="Employee Name"
                          value={employee.name}
                          onChange={(e) => updateEmployee(employee.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          placeholder="TIN Number"
                          value={employee.tin}
                          onChange={(e) => updateEmployee(employee.id, 'tin', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          placeholder="₦500,000"
                          value={employee.basic_salary}
                          onChange={(e) => updateEmployee(employee.id, 'basic_salary', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          placeholder="₦50,000"
                          value={employee.transport_allowance}
                          onChange={(e) => updateEmployee(employee.id, 'transport_allowance', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          placeholder="200,000"
                          value={employee.housing_allowance}
                          onChange={(e) => updateEmployee(employee.id, 'housing_allowance', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          placeholder="30,000"
                          value={employee.meal_allowance}
                          onChange={(e) => updateEmployee(employee.id, 'meal_allowance', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          placeholder="20,000"
                          value={employee.utility_allowance}
                          onChange={(e) => updateEmployee(employee.id, 'utility_allowance', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          placeholder="25,000"
                          value={employee.medical_allowance}
                          onChange={(e) => updateEmployee(employee.id, 'medical_allowance', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          placeholder="25,000"
                          value={employee.other_allowances}
                          onChange={(e) => updateEmployee(employee.id, 'other_allowances', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          placeholder="Auto (8%)"
                          value={employee.pension_contribution}
                          onChange={(e) => updateEmployee(employee.id, 'pension_contribution', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          placeholder="Auto (2.5%)"
                          value={employee.nhf_contribution}
                          onChange={(e) => updateEmployee(employee.id, 'nhf_contribution', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          placeholder="10,000"
                          value={employee.life_insurance_premium}
                          onChange={(e) => updateEmployee(employee.id, 'life_insurance_premium', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          placeholder="15,000"
                          value={employee.health_insurance_premium}
                          onChange={(e) => updateEmployee(employee.id, 'health_insurance_premium', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          placeholder="5,000"
                          value={employee.nhis_contribution}
                          onChange={(e) => updateEmployee(employee.id, 'nhis_contribution', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          placeholder="₦1,200,000"
                          value={employee.annual_rent}
                          onChange={(e) => updateEmployee(employee.id, 'annual_rent', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          placeholder="₦500,000"
                          value={employee.mortgage_interest}
                          onChange={(e) => updateEmployee(employee.id, 'mortgage_interest', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button
                          onClick={() => removeEmployee(employee.id)}
                          disabled={employees.length === 1}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      {showResults && totals.employeeCount > 0 && (
        <Card className="bg-white border-green-100 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Payroll Calculation Results</span>
              <Badge className="bg-green-100 text-green-800">
                {totals.employeeCount} Calculated
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TIN</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Gross</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Tax</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Net</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Annual Tax</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.filter(emp => emp.calculated && emp.result).map((employee) => (
                    <tr key={employee.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {employee.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {employee.tin || 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(employee.result.monthly_gross_income)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 text-right">
                        {formatCurrency(employee.result.monthly_tax)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 text-right font-medium">
                        {formatCurrency(employee.result.monthly_net_income)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-600 text-right">
                        {formatCurrency(employee.result.tax_due)}
                      </td>
                    </tr>
                  ))}
                  {/* Totals Row */}
                  <tr className="bg-blue-50 border-t-2 border-blue-200">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-blue-900" colSpan="2">
                      TOTALS ({totals.employeeCount} employees)
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-blue-900 text-right">
                      {formatCurrency(totals.totalGross)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-red-700 text-right">
                      {formatCurrency(totals.totalTax)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-green-700 text-right">
                      {formatCurrency(totals.totalNet)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-blue-700 text-right">
                      {formatCurrency(totals.totalTax * 12)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards - Matching History Section Style */}
      {showResults && totals.employeeCount > 0 && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-900 text-white rounded-lg">
              <p className="text-sm text-gray-300 mb-1">Total Tax</p>
              <p className="text-2xl font-bold">{formatCurrency(totals.totalTax)}</p>
            </div>
            <div className="p-4 bg-emerald-600 text-white rounded-lg">
              <p className="text-sm text-emerald-100 mb-1">Total Net Pay</p>
              <p className="text-2xl font-bold">{formatCurrency(totals.totalNet)}</p>
            </div>
          </div>
          
          {/* Annual Summary */}
          <div className="border-l-4 border-l-gray-900 bg-gray-50 rounded-r-lg p-4">
            <p className="font-medium text-gray-900 mb-2">Payroll Summary</p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Total Employees</p>
                <p className="font-medium">{totals.employeeCount}</p>
              </div>
              <div>
                <p className="text-gray-500">Total Gross Pay</p>
                <p className="font-medium">{formatCurrency(totals.totalGross)}</p>
              </div>
              <div>
                <p className="text-gray-500">Annual Tax</p>
                <p className="font-medium text-red-600">{formatCurrency(totals.totalTax * 12)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <Alert>
        <AlertDescription>
          <strong>How to use:</strong>
          <br />
          <strong>Method 1 (Manual):</strong> Add employees by clicking "Add Employee", fill in their details, then click "Calculate All".
          <br />
          <strong>Method 2 (Excel Upload):</strong> Download the Excel template, fill in your employee data offline, then upload the file for instant bulk processing.
          <br />
          Both methods support export to CSV for further analysis.
        </AlertDescription>
      </Alert>

      {/* Print Report Button for Bulk PAYE */}
      {showResults && totals.employeeCount > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <button
            onClick={() => {
              // Check if user has PDF export feature
              if (!hasFeature || !hasFeature('pdf_export')) {
                setUpgradeContext({ type: 'feature', feature: 'pdf_export' });
                setShowUpgradePrompt(true);
                return;
              }
              generateBulkPayeReport(employees, totals, companyInfo);
            }}
            className="w-full inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-sm"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Bulk Report (PDF)
            {hasFeature && !hasFeature('pdf_export') && (
              <Badge variant="outline" className="ml-2 text-xs bg-gray-800 text-yellow-300 border-yellow-300">
                PRO+
              </Badge>
            )}
          </button>
        </div>
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

      {/* Bulk PAYE Monthly Limit Modal */}
      <BulkLimitModal
        isOpen={bulkLimit.showLimitModal}
        onClose={bulkLimit.closeLimitModal}
        onStartTrial={onShowTrialModal}
        onViewPlans={onShowUpgradeModal}
        nextResetDate={bulkLimit.getNextResetDate()}
        limitType={bulkLimit.isMonthlyLimitReached ? 'monthly' : 'staff'}
      />

      {/* CSV Import Feature Gate Modal */}
      <FeatureGateModal
        isOpen={showCsvGate}
        onClose={() => setShowCsvGate(false)}
        feature="csv_import"
        onStartTrial={onShowTrialModal}
        onViewPlans={onShowUpgradeModal}
      />
    </div>
  );
};

export default BulkPayrollCalculator;