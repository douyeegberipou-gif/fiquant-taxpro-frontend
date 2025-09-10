import React, { useState, useRef } from 'react';
import { Users, Plus, Trash2, Calculator, Download, Eye, EyeOff, Upload, FileSpreadsheet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';

const BulkPayrollCalculator = ({ formatCurrency, calculatePayeTax }) => {
  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: '',
      tin: '',
      basic_salary: '',
      transport_allowance: '',
      housing_allowance: '',
      meal_allowance: '',
      other_allowances: '',
      pension_contribution: '',
      nhf_contribution: '',
      life_insurance_premium: '',
      health_insurance_premium: '',
      nhis_contribution: '',
      annual_rent: '',
      calculated: false,
      result: null
    }
  ]);

  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const addEmployee = () => {
    const newEmployee = {
      id: employees.length + 1,
      name: '',
      tin: '',
      basic_salary: '',
      transport_allowance: '',
      housing_allowance: '',
      meal_allowance: '',
      other_allowances: '',
      pension_contribution: '',
      nhf_contribution: '',
      life_insurance_premium: '',
      health_insurance_premium: '',
      nhis_contribution: '',
      annual_rent: '',
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
    setLoading(true);
    const updatedEmployees = [];

    for (const employee of employees) {
      if (employee.name && employee.basic_salary) {
        try {
          const taxInput = {
            basic_salary: parseFloat(employee.basic_salary) || 0,
            transport_allowance: parseFloat(employee.transport_allowance) || 0,
            housing_allowance: parseFloat(employee.housing_allowance) || 0,
            meal_allowance: parseFloat(employee.meal_allowance) || 0,
            other_allowances: parseFloat(employee.other_allowances) || 0,
            pension_contribution: parseFloat(employee.pension_contribution) || 0,
            nhf_contribution: parseFloat(employee.nhf_contribution) || 0,
            life_insurance_premium: parseFloat(employee.life_insurance_premium) || 0,
            health_insurance_premium: parseFloat(employee.health_insurance_premium) || 0,
            nhis_contribution: parseFloat(employee.nhis_contribution) || 0,
            annual_rent: parseFloat(employee.annual_rent) || 0
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
      'Meal Allowance', 'Other Allowances', 'Pension Contribution', 'NHF Contribution',
      'Life Insurance', 'Health Insurance', 'NHIS', 'Annual Rent', 
      'Monthly Gross', 'Monthly Tax', 'Monthly Net'
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
        emp.other_allowances,
        emp.pension_contribution,
        emp.nhf_contribution,
        emp.life_insurance_premium,
        emp.health_insurance_premium,
        emp.nhis_contribution,
        emp.annual_rent,
        emp.result.monthly_gross_income,
        emp.result.monthly_tax,
        emp.result.monthly_net_income
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
    // Create Excel template data
    const headers = [
      'Employee Name*', 'TIN', 'Basic Salary*', 'Transport Allowance', 'Housing Allowance',
      'Meal Allowance', 'Other Allowances', 'Pension Contribution', 'NHF Contribution',
      'Life Insurance Premium', 'Health Insurance Premium', 'NHIS Contribution', 'Annual Rent'
    ];

    const sampleData = [
      ['John Doe', '12345678', '500000', '50000', '200000', '30000', '25000', '', '', '10000', '15000', '5000', '1200000'],
      ['Jane Smith', '87654321', '400000', '40000', '150000', '25000', '20000', '', '', '8000', '12000', '4000', '1000000'],
      ['Mike Johnson', '11223344', '600000', '60000', '250000', '35000', '30000', '', '', '12000', '18000', '6000', '1500000']
    ];

    const instructions = [
      'INSTRUCTIONS:',
      '1. Fill in employee details in the rows below',
      '2. Fields marked with * are required',
      '3. Leave Pension and NHF empty for auto-calculation (8% and 2.5% respectively)',
      '4. All amounts should be in Nigerian Naira (₦)',
      '5. Save the file and upload it back to the app',
      '',
      'SAMPLE DATA PROVIDED BELOW - REPLACE WITH YOUR ACTUAL DATA:'
    ];

    // Create CSV content for Excel compatibility
    const csvContent = [
      'Fiquant TaxPro - PAYE Bulk Upload Template',
      `Generated on: ${new Date().toLocaleDateString()}`,
      '',
      ...instructions,
      '',
      headers.join(','),
      ...sampleData.map(row => row.join(','))
    ].join('\n');

    // Add BOM for proper Excel UTF-8 handling
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Fiquant_PAYE_Template_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n');
        
        // Find the header row (contains "Employee Name*")
        let headerRowIndex = -1;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes('Employee Name*')) {
            headerRowIndex = i;
            break;
          }
        }

        if (headerRowIndex === -1) {
          alert('Invalid file format. Please use the downloaded template.');
          setUploading(false);
          return;
        }

        // Parse data rows (skip header and empty lines)
        const dataRows = lines.slice(headerRowIndex + 1)
          .filter(line => line.trim() && !line.startsWith(','))
          .map(line => {
            // Handle CSV parsing with potential commas in quoted fields
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

        // Convert to employee objects
        const uploadedEmployees = dataRows.map((row, index) => ({
          id: index + 1,
          name: row[0] || '',
          tin: row[1] || '',
          basic_salary: row[2] || '',
          transport_allowance: row[3] || '',
          housing_allowance: row[4] || '',
          meal_allowance: row[5] || '',
          other_allowances: row[6] || '',
          pension_contribution: row[7] || '',
          nhf_contribution: row[8] || '',
          life_insurance_premium: row[9] || '',
          health_insurance_premium: row[10] || '',
          nhis_contribution: row[11] || '',
          annual_rent: row[12] || '',
          calculated: false,
          result: null
        })).filter(emp => emp.name.trim() && emp.basic_salary.trim());

        if (uploadedEmployees.length === 0) {
          alert('No valid employee data found in the file. Please check the format.');
          setUploading(false);
          return;
        }

        setEmployees(uploadedEmployees);
        alert(`Successfully imported ${uploadedEmployees.length} employees from the file.`);
        
      } catch (error) {
        console.error('Error parsing file:', error);
        alert('Error reading the file. Please ensure it\'s a valid CSV file created from our template.');
      } finally {
        setUploading(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.readAsText(file);
  };

  const totals = getTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white border-blue-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Bulk Payroll Calculator</span>
          </CardTitle>
          <CardDescription className="text-blue-100">
            Calculate PAYE tax for multiple employees in spreadsheet format
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            {/* Left side - Manual Entry */}
            <div className="flex space-x-3">
              <Button onClick={addEmployee} variant="outline" className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Employee</span>
              </Button>
              <Button 
                onClick={calculateBulkPayroll} 
                disabled={loading || employees.every(emp => !emp.name || !emp.basic_salary)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Calculator className="h-4 w-4 mr-2" />
                {loading ? 'Calculating...' : 'Calculate All'}
              </Button>
            </div>

            {/* Right side - Results & Export */}
            <div className="flex space-x-2">
              <Button
                onClick={() => setShowResults(!showResults)}
                variant="outline"
                className="flex items-center space-x-2"
              >
                {showResults ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span>{showResults ? 'Hide Results' : 'Show Results'}</span>
              </Button>
              {totals.employeeCount > 0 && (
                <Button onClick={exportToCSV} variant="outline" className="flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Export CSV</span>
                </Button>
              )}
            </div>
          </div>

          {/* Excel Template Section */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileSpreadsheet className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800">Excel Template Upload</h3>
                  <p className="text-sm text-green-700">Download template, fill employee data, then upload for bulk processing</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={downloadExcelTemplate}
                  variant="outline"
                  className="bg-white border-green-300 text-green-700 hover:bg-green-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                  />
                  <Button
                    disabled={uploading}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload File'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Input Table */}
      <Card className="bg-white border-emerald-100 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Employee Information</span>
            <Badge variant="outline">
              {employees.length} Employee{employees.length !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-6 pb-0">
            <Alert className="bg-blue-50 border-blue-200 mb-4">
              <AlertDescription className="text-blue-800 text-sm">
                <strong>Relief Fields:</strong> Leave pension and NHF empty for auto-calculation (8% and 2.5% of basic salary respectively). 
                Other reliefs are optional but help reduce taxable income.
              </AlertDescription>
            </Alert>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[40px]">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Employee Name *</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">TIN</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Basic Salary *</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Transport</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Housing</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Meal</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Other</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Pension</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">NHF</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Life Ins.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Health Ins.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">NHIS</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Annual Rent</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee, index) => (
                  <tr key={employee.id} className={employee.calculated ? 'bg-green-50' : ''}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Input
                        placeholder="Employee Name"
                        value={employee.name}
                        onChange={(e) => updateEmployee(employee.id, 'name', e.target.value)}
                        className="w-full"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Input
                        placeholder="TIN Number"
                        value={employee.tin}
                        onChange={(e) => updateEmployee(employee.id, 'tin', e.target.value)}
                        className="w-full"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Input
                        type="number"
                        placeholder="500,000"
                        value={employee.basic_salary}
                        onChange={(e) => updateEmployee(employee.id, 'basic_salary', e.target.value)}
                        className="w-full"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Input
                        type="number"
                        placeholder="50,000"
                        value={employee.transport_allowance}
                        onChange={(e) => updateEmployee(employee.id, 'transport_allowance', e.target.value)}
                        className="w-full"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Input
                        type="number"
                        placeholder="200,000"
                        value={employee.housing_allowance}
                        onChange={(e) => updateEmployee(employee.id, 'housing_allowance', e.target.value)}
                        className="w-full"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Input
                        type="number"
                        placeholder="30,000"
                        value={employee.meal_allowance}
                        onChange={(e) => updateEmployee(employee.id, 'meal_allowance', e.target.value)}
                        className="w-full"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Input
                        type="number"
                        placeholder="25,000"
                        value={employee.other_allowances}
                        onChange={(e) => updateEmployee(employee.id, 'other_allowances', e.target.value)}
                        className="w-full"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Input
                        type="number"
                        placeholder="Auto (8%)"
                        value={employee.pension_contribution}
                        onChange={(e) => updateEmployee(employee.id, 'pension_contribution', e.target.value)}
                        className="w-full"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Input
                        type="number"
                        placeholder="Auto (2.5%)"
                        value={employee.nhf_contribution}
                        onChange={(e) => updateEmployee(employee.id, 'nhf_contribution', e.target.value)}
                        className="w-full"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Input
                        type="number"
                        placeholder="10,000"
                        value={employee.life_insurance_premium}
                        onChange={(e) => updateEmployee(employee.id, 'life_insurance_premium', e.target.value)}
                        className="w-full"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Input
                        type="number"
                        placeholder="15,000"
                        value={employee.health_insurance_premium}
                        onChange={(e) => updateEmployee(employee.id, 'health_insurance_premium', e.target.value)}
                        className="w-full"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Input
                        type="number"
                        placeholder="5,000"
                        value={employee.nhis_contribution}
                        onChange={(e) => updateEmployee(employee.id, 'nhis_contribution', e.target.value)}
                        className="w-full"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Input
                        type="number"
                        placeholder="1,200,000"
                        value={employee.annual_rent}
                        onChange={(e) => updateEmployee(employee.id, 'annual_rent', e.target.value)}
                        className="w-full"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Button
                        onClick={() => removeEmployee(employee.id)}
                        disabled={employees.length === 1}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800"
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

      {/* Summary Cards */}
      {showResults && totals.employeeCount > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-blue-600 font-medium">Total Employees</p>
                <p className="text-2xl font-bold text-blue-800">{totals.employeeCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-green-600 font-medium">Total Gross Pay</p>
                <p className="text-xl font-bold text-green-800">{formatCurrency(totals.totalGross)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-red-600 font-medium">Total Tax</p>
                <p className="text-xl font-bold text-red-800">{formatCurrency(totals.totalTax)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-emerald-600 font-medium">Total Net Pay</p>
                <p className="text-xl font-bold text-emerald-800">{formatCurrency(totals.totalNet)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Instructions */}
      <Alert>
        <AlertDescription>
          <strong>How to use:</strong> Add employees by clicking "Add Employee", fill in their details (name and basic salary are required), 
          then click "Calculate All" to process the entire payroll. You can export results to CSV for further analysis.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default BulkPayrollCalculator;