import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Plus, 
  Trash2, 
  Download, 
  Mail, 
  ArrowLeft,
  Info,
  Building,
  User,
  Wallet,
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const NetPaymentsCalculator = ({ 
  payeData, // Auto-filled from PAYE calculator
  formatCurrency,
  onBack,
  onGeneratePDF,
  onEmailSchedule,
  userTier = 'free',
  maxEmployees = 1
}) => {
  const [employeeName, setEmployeeName] = useState(payeData?.staff_name || '');
  const [grossSalary, setGrossSalary] = useState(payeData?.basic_salary || 0);
  const [payeTax, setPayeTax] = useState(payeData?.monthly_tax || 0);
  
  // Pension settings
  const [employeePensionRate, setEmployeePensionRate] = useState(8);
  const [employerPensionRate, setEmployerPensionRate] = useState(10);
  const [applyPension, setApplyPension] = useState(true);
  
  // NHF settings - respect the setting from PAYE calculation
  const [nhfRate, setNhfRate] = useState(2.5);
  const [applyNhf, setApplyNhf] = useState(payeData?.nhf_applicable !== false); // Default true unless explicitly false from PAYE
  
  // Custom deductions
  const [customDeductions, setCustomDeductions] = useState([]);
  const [newDeductionName, setNewDeductionName] = useState('');
  const [newDeductionAmount, setNewDeductionAmount] = useState('');
  
  // Results
  const [results, setResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Auto-fill from PAYE data
  useEffect(() => {
    if (payeData) {
      setEmployeeName(payeData.staff_name || '');
      setGrossSalary(payeData.basic_salary || 0);
      setPayeTax(payeData.monthly_tax || 0);
      // Respect NHF setting from PAYE - if user disabled NHF in PAYE, disable it here too
      if (payeData.nhf_applicable !== undefined) {
        setApplyNhf(payeData.nhf_applicable);
      }
    }
  }, [payeData]);
  
  const addCustomDeduction = () => {
    if (newDeductionName && newDeductionAmount > 0) {
      setCustomDeductions([
        ...customDeductions,
        { name: newDeductionName, amount: parseFloat(newDeductionAmount) }
      ]);
      setNewDeductionName('');
      setNewDeductionAmount('');
    }
  };
  
  const removeCustomDeduction = (index) => {
    setCustomDeductions(customDeductions.filter((_, i) => i !== index));
  };
  
  const calculateNetPayment = () => {
    setIsCalculating(true);
    
    const gross = parseFloat(grossSalary) || 0;
    const paye = parseFloat(payeTax) || 0;
    
    // Calculate statutory deductions
    const employeePension = applyPension ? (gross * employeePensionRate / 100) : 0;
    const nhf = applyNhf ? (gross * nhfRate / 100) : 0;
    const employerPension = applyPension ? (gross * employerPensionRate / 100) : 0;
    
    // Sum custom deductions
    const totalCustomDeductions = customDeductions.reduce((sum, d) => sum + d.amount, 0);
    
    // Calculate totals
    const totalDeductions = paye + employeePension + nhf + totalCustomDeductions;
    const netTakeHome = gross - totalDeductions;
    const totalEmployerCost = gross + employerPension;
    
    setResults({
      grossSalary: gross,
      deductions: {
        payeTax: paye,
        employeePension,
        nhf,
        customDeductions: [...customDeductions],
        totalCustom: totalCustomDeductions
      },
      employerContributions: {
        pension: employerPension
      },
      netTakeHome,
      totalEmployerCost,
      totalDeductions
    });
    
    setIsCalculating(false);
  };
  
  const handleDownloadPDF = () => {
    if (onGeneratePDF && results) {
      onGeneratePDF({
        employeeName,
        ...results
      });
    }
  };
  
  const handleEmailSchedule = () => {
    if (onEmailSchedule && results) {
      onEmailSchedule({
        employeeName,
        ...results
      });
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Calculator className="h-6 w-6 mr-2 text-emerald-600" />
              Net Staff Payments Calculator
            </h1>
            <p className="text-sm text-gray-500">
              Calculate take-home pay after all deductions
            </p>
          </div>
        </div>
        
        {/* Tier limit badge */}
        <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
          {maxEmployees === 999999 ? 'Unlimited' : `${maxEmployees} employee${maxEmployees > 1 ? 's' : ''}`}
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Employee Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Employee Name */}
            <div className="space-y-2">
              <Label htmlFor="employeeName">Employee Name</Label>
              <Input
                id="employeeName"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="Enter employee name"
              />
            </div>
            
            {/* Gross Salary */}
            <div className="space-y-2">
              <Label htmlFor="grossSalary">Monthly Gross Salary (₦)</Label>
              <Input
                id="grossSalary"
                type="number"
                value={grossSalary}
                onChange={(e) => setGrossSalary(e.target.value)}
                placeholder="Enter gross salary"
              />
              {payeData && (
                <p className="text-xs text-emerald-600 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Auto-filled from PAYE calculation
                </p>
              )}
            </div>
            
            {/* PAYE Tax */}
            <div className="space-y-2">
              <Label htmlFor="payeTax">PAYE Tax (₦)</Label>
              <Input
                id="payeTax"
                type="number"
                value={payeTax}
                onChange={(e) => setPayeTax(e.target.value)}
                placeholder="Enter PAYE tax"
              />
              {payeData && (
                <p className="text-xs text-emerald-600 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Auto-filled from PAYE calculation
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Statutory Deductions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Building className="h-5 w-5 mr-2 text-purple-600" />
              Statutory Deductions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Pension */}
            <div className="p-3 bg-gray-50 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={applyPension}
                    onChange={(e) => setApplyPension(e.target.checked)}
                    className="mr-2 h-4 w-4 text-emerald-600"
                  />
                  Apply Pension
                </Label>
              </div>
              {applyPension && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-500">Employee (%)</Label>
                    <Input
                      type="number"
                      value={employeePensionRate}
                      onChange={(e) => setEmployeePensionRate(e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Employer (%)</Label>
                    <Input
                      type="number"
                      value={employerPensionRate}
                      onChange={(e) => setEmployerPensionRate(e.target.value)}
                      className="h-8"
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* NHF */}
            <div className={`p-3 rounded-lg space-y-3 ${payeData?.nhf_applicable === false ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <Label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={applyNhf}
                    onChange={(e) => setApplyNhf(e.target.checked)}
                    className="mr-2 h-4 w-4 text-emerald-600"
                  />
                  Apply NHF (National Housing Fund)
                </Label>
              </div>
              {/* Show note if NHF was disabled in PAYE */}
              {payeData?.nhf_applicable === false && !applyNhf && (
                <p className="text-xs text-orange-600 flex items-center">
                  <Info className="h-3 w-3 mr-1" />
                  NHF was marked as not applicable in PAYE calculation
                </p>
              )}
              {applyNhf && (
                <div>
                  <Label className="text-xs text-gray-500">Rate (%)</Label>
                  <Input
                    type="number"
                    value={nhfRate}
                    onChange={(e) => setNhfRate(e.target.value)}
                    className="h-8 w-24"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Custom Deductions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Plus className="h-5 w-5 mr-2 text-orange-600" />
            Custom Deductions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 mb-4">
            <Input
              placeholder="Deduction name (e.g., Loan, Union Dues)"
              value={newDeductionName}
              onChange={(e) => setNewDeductionName(e.target.value)}
              className="flex-1"
            />
            <Input
              type="number"
              placeholder="Amount (₦)"
              value={newDeductionAmount}
              onChange={(e) => setNewDeductionAmount(e.target.value)}
              className="w-32"
            />
            <Button onClick={addCustomDeduction} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {customDeductions.length > 0 && (
            <div className="space-y-2">
              {customDeductions.map((deduction, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2 bg-orange-50 rounded-lg"
                >
                  <span className="text-sm text-gray-700">{deduction.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {formatCurrency(deduction.amount)}
                    </span>
                    <button
                      onClick={() => removeCustomDeduction(index)}
                      className="p-1 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {customDeductions.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-2">
              No custom deductions added
            </p>
          )}
        </CardContent>
      </Card>
      
      {/* Calculate Button */}
      <Button
        onClick={calculateNetPayment}
        disabled={isCalculating || !grossSalary}
        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-lg"
        data-testid="calculate-net-payment-btn"
      >
        {isCalculating ? (
          <>
            <span className="animate-spin mr-2">⏳</span>
            Calculating...
          </>
        ) : (
          <>
            <Calculator className="h-5 w-5 mr-2" />
            Calculate Net Payment
          </>
        )}
      </Button>
      
      {/* Results */}
      {results && (
        <Card className="border-2 border-emerald-500">
          <CardHeader className="bg-emerald-50">
            <CardTitle className="flex items-center text-lg text-emerald-700">
              <Wallet className="h-5 w-5 mr-2" />
              Payment Summary for {employeeName || 'Employee'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Gross */}
            <div className="flex justify-between items-center text-lg">
              <span className="text-gray-600">Monthly Gross Salary:</span>
              <span className="font-bold">{formatCurrency(results.grossSalary)}</span>
            </div>
            
            {/* Deductions */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-red-600 mb-3 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                DEDUCTIONS:
              </h4>
              <div className="space-y-2 pl-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">PAYE Tax:</span>
                  <span className="text-red-600">-{formatCurrency(results.deductions.payeTax)}</span>
                </div>
                {results.deductions.employeePension > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Employee Pension ({employeePensionRate}%):</span>
                    <span className="text-red-600">-{formatCurrency(results.deductions.employeePension)}</span>
                  </div>
                )}
                {results.deductions.nhf > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">NHF ({nhfRate}%):</span>
                    <span className="text-red-600">-{formatCurrency(results.deductions.nhf)}</span>
                  </div>
                )}
                {results.deductions.customDeductions.map((d, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-600">{d.name}:</span>
                    <span className="text-red-600">-{formatCurrency(d.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-medium border-t pt-2 mt-2">
                  <span className="text-gray-700">Total Deductions:</span>
                  <span className="text-red-600">-{formatCurrency(results.totalDeductions)}</span>
                </div>
              </div>
            </div>
            
            {/* Employer Contributions */}
            {results.employerContributions.pension > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-blue-600 mb-3 flex items-center">
                  <Building className="h-4 w-4 mr-2" />
                  EMPLOYER CONTRIBUTIONS:
                </h4>
                <div className="space-y-2 pl-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Employer Pension ({employerPensionRate}%):</span>
                    <span className="text-blue-600">{formatCurrency(results.employerContributions.pension)}</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Net Take-Home */}
            <div className="border-t pt-4">
              <div className="p-4 bg-emerald-100 rounded-lg">
                <div className="flex justify-between items-center text-xl">
                  <span className="font-bold text-emerald-700">NET TAKE-HOME PAY:</span>
                  <span className="font-bold text-emerald-700 text-2xl">
                    {formatCurrency(results.netTakeHome)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Total Employer Cost */}
            <div className="p-4 bg-gray-100 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Total Employer Cost:</span>
                <span className="font-bold text-gray-900">
                  {formatCurrency(results.totalEmployerCost)}
                </span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleDownloadPDF}
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Payment Schedule PDF
              </Button>
              <Button
                onClick={handleEmailSchedule}
                variant="outline"
                className="flex-1 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email to Employee
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NetPaymentsCalculator;
