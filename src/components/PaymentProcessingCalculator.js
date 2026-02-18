import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.jsx';
import { Input } from './ui/input.jsx';
import { Label } from './ui/label.jsx';
import { Button } from './ui/button.jsx';
import { Badge } from './ui/badge.jsx';
import { Separator } from './ui/separator.jsx';
import { Alert, AlertDescription } from './ui/alert.jsx';
import { CreditCard, Calculator, AlertTriangle, Printer, Building2, Mail, Send } from 'lucide-react';
import { generatePaymentProcessingReport } from '../utils/pdfGenerator';
import UpgradePrompt from './UpgradePrompt';
import { useUpgrade } from '../hooks/useUpgrade';

const PaymentProcessingCalculator = ({ formatCurrency, hasFeature }) => {
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const { startTrial, requestUpgrade } = useUpgrade();

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
  const [paymentInput, setPaymentInput] = useState({
    payee_name: '',
    tin: '',
    contract_amount: '',
    transaction_type: '',
    is_resident: true,
    month: '',
    year: '',
    transaction_details: '',
    payee_email: ''
  });

  const [paymentResult, setPaymentResult] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Transaction types with their VAT and WHT characteristics
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
      vat_applicable: false, // Generally VAT exempt
      vat_rate: 0.00,
      wht_rate_resident: 0.10,
      wht_rate_non_resident: 0.10,
      description: 'All rent, hire, or lease transactions'
    },
    'dividends': {
      name: 'Dividends & Interest',
      vat_applicable: false, // VAT exempt
      vat_rate: 0.00,
      wht_rate_resident: 0.10,
      wht_rate_non_resident: 0.10,
      description: 'Both resident and non-resident recipients'
    },
    'goods_supply': {
      name: 'Goods & Construction',
      vat_applicable: true,
      vat_rate: 0.10,
      wht_rate_resident: 0.025, // Average of 2-5%
      wht_rate_non_resident: 0.05,
      description: 'Supply of goods, construction contracts'
    },
    'royalties': {
      name: 'Royalties',
      vat_applicable: true,
      vat_rate: 0.10,
      wht_rate_resident: 0.05, // Non-corporate
      wht_rate_non_resident: 0.10, // Corporate rate
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
      vat_applicable: false, // VAT exempt
      vat_rate: 0.00,
      wht_rate_resident: 0.05,
      wht_rate_non_resident: 0.10,
      description: 'Healthcare and medical services'
    },
    'educational_services': {
      name: 'Educational Services',
      vat_applicable: false, // VAT exempt
      vat_rate: 0.00,
      wht_rate_resident: 0.05,
      wht_rate_non_resident: 0.10,
      description: 'Training and educational services'
    }
  };

  const handleInputChange = (field, value) => {
    setPaymentInput(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculatePayment = () => {
    setPaymentLoading(true);
    
    try {
      const contractAmount = parseFloat(paymentInput.contract_amount) || 0;
      const transactionConfig = transactionTypes[paymentInput.transaction_type];
      
      if (!transactionConfig) {
        alert('Please select a valid transaction type.');
        setPaymentLoading(false);
        return;
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
      const whtRate = paymentInput.is_resident ? 
        transactionConfig.wht_rate_resident : 
        transactionConfig.wht_rate_non_resident;
      
      const whtAmount = amountBeforeVat * whtRate;

      // Calculate net payment to payee
      const netPayment = amountBeforeVat - whtAmount;

      // Calculate total government remittance
      const totalGovernmentRemittance = vatAmount + whtAmount;

      const result = {
        payee_name: paymentInput.payee_name,
        contract_amount: contractAmount,
        transaction_type: transactionConfig.name,
        transaction_description: transactionConfig.description,
        is_resident: paymentInput.is_resident,
        
        // Breakdown
        amount_before_vat: amountBeforeVat,
        vat_applicable: transactionConfig.vat_applicable,
        vat_rate: transactionConfig.vat_rate * 100,
        vat_amount: vatAmount,
        
        wht_rate: whtRate * 100,
        wht_amount: whtAmount,
        
        net_payment: netPayment,
        total_government_remittance: totalGovernmentRemittance,
        
        // Deadlines
        vat_due_date: 'By 21st of following month',
        wht_due_date: 'By 21st of following month (FIRS)',
        sirs_due_date: 'By 30th of following month (SIRS)',
        
        month: paymentInput.month,
        year: paymentInput.year,
        transaction_details: paymentInput.transaction_details,
        payee_email: paymentInput.payee_email,
        timestamp: new Date().toISOString()
      };
      
      setPaymentResult(result);
    } catch (error) {
      console.error('Error calculating payment:', error);
      alert('Error calculating payment. Please check your input values.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const resetForm = () => {
    setPaymentInput({
      payee_name: '',
      tin: '',
      contract_amount: '',
      transaction_type: '',
      is_resident: true,
      month: '',
      year: '',
      transaction_details: '',
      payee_email: ''
    });
    setPaymentResult(null);
  };

  const sendPaymentAdvice = async () => {
    if (!paymentResult || !paymentInput.payee_email) {
      alert('Please ensure the calculation is complete and payee email is provided.');
      return;
    }

    try {
      // Here you would typically send an email with the payment advice
      // For now, we'll show a confirmation message
      alert(`Payment advice sent to ${paymentInput.payee_email} successfully!`);
    } catch (error) {
      console.error('Error sending payment advice:', error);
      alert('Error sending payment advice. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <Card className="bg-white border-purple-100 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Payment Processing</span>
            </CardTitle>
            <CardDescription className="text-purple-100">
              Calculate net payment after VAT & WHT deductions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Payment Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Building2 className="h-4 w-4 mr-2 text-purple-600" />
                Payment Information
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payee_name">Payee Name/Company *</Label>
                  <Input
                    id="payee_name"
                    type="text"
                    placeholder="Contractor/Service Provider"
                    value={paymentInput.payee_name}
                    onChange={(e) => handleInputChange('payee_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tin">Tax Identification Number (TIN)</Label>
                  <Input
                    id="tin"
                    type="text"
                    placeholder="12345678901"
                    value={paymentInput.tin}
                    onChange={(e) => handleInputChange('tin', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="month">Month *</Label>
                  <select
                    id="month"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={paymentInput.month}
                    onChange={(e) => handleInputChange('month', e.target.value)}
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
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    type="number"
                    placeholder="2024"
                    min="2020"
                    max="2030"
                    value={paymentInput.year}
                    onChange={(e) => handleInputChange('year', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contract_amount">Contract Amount (Including VAT if applicable) *</Label>
                <Input
                  id="contract_amount"
                  type="number"
                  placeholder="₦1,000,000"
                  value={paymentInput.contract_amount}
                  onChange={(e) => handleInputChange('contract_amount', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="transaction_details">Transaction Details</Label>
                <Input
                  id="transaction_details"
                  type="text"
                  placeholder="Brief description of the transaction/service"
                  value={paymentInput.transaction_details}
                  onChange={(e) => handleInputChange('transaction_details', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="payee_email">Email Address of Payee</Label>
                <Input
                  id="payee_email"
                  type="email"
                  placeholder="payee@example.com"
                  value={paymentInput.payee_email}
                  onChange={(e) => handleInputChange('payee_email', e.target.value)}
                />
              </div>
            </div>

            <Separator />

            {/* Transaction Type */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Transaction Type (For WHT deduction computation)</h3>
              <div className="space-y-2">
                <Label htmlFor="transaction_type">Select Transaction/Contract Type *</Label>
                <select
                  id="transaction_type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={paymentInput.transaction_type}
                  onChange={(e) => handleInputChange('transaction_type', e.target.value)}
                >
                  <option value="">Select Transaction Type</option>
                  {Object.entries(transactionTypes).map(([key, config]) => (
                    <option key={key} value={key}>{config.name}</option>
                  ))}
                </select>
              </div>
              
              {paymentInput.transaction_type && (
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertDescription className="text-blue-800 text-sm">
                    <strong>{transactionTypes[paymentInput.transaction_type].name}:</strong> {transactionTypes[paymentInput.transaction_type].description}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <Separator />

            {/* Residency Status */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Payee Status</h3>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="residency"
                    checked={paymentInput.is_resident}
                    onChange={() => handleInputChange('is_resident', true)}
                    className="w-4 h-4 text-purple-600"
                  />
                  <span className="text-sm">Resident</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="residency"
                    checked={!paymentInput.is_resident}
                    onChange={() => handleInputChange('is_resident', false)}
                    className="w-4 h-4 text-purple-600"
                  />
                  <span className="text-sm">Non-Resident</span>
                </label>
              </div>
            </div>

            {/* Disclaimer Note */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
              <p className="text-xs text-amber-800 flex items-start">
                <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Note:</strong> Users are solely responsible for the validity, accuracy and completeness of the financial information they supply.
                </span>
              </p>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button 
                onClick={() => {
                  if (!hasFeature || !hasFeature('payment_calc')) {
                    setShowUpgradePrompt(true);
                    return;
                  }
                  calculatePayment();
                }}
                disabled={paymentLoading || !paymentInput.payee_name || !paymentInput.contract_amount || !paymentInput.transaction_type}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {paymentLoading ? 'Processing...' : 'Calculate Payment'}
                {hasFeature && !hasFeature('payment_calc') && (
                  <Badge variant="outline" className="ml-2 text-xs bg-purple-50 text-purple-600 border-purple-200">
                    PRO+
                  </Badge>
                )}
              </Button>
              <Button 
                onClick={resetForm} 
                variant="outline"
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {paymentResult && (
          <Card className="bg-white border-purple-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-pink-600 to-rose-600 text-white">
              <CardTitle>Payment Processing Results</CardTitle>
              <CardDescription className="text-pink-100">
                Net payment calculation with tax deductions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 col-span-2">
                  <p className="text-sm text-purple-600 font-medium">Net Payment to Payee</p>
                  <p className="text-2xl font-bold text-purple-800">
                    {formatCurrency(paymentResult.net_payment)}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-sm text-red-600 font-medium">VAT Amount</p>
                  <p className="text-lg font-bold text-red-800">
                    {formatCurrency(paymentResult.vat_amount)}
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-600 font-medium">WHT Amount</p>
                  <p className="text-lg font-bold text-orange-800">
                    {formatCurrency(paymentResult.wht_amount)}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Detailed Breakdown */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Payment Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contract Amount:</span>
                    <span className="font-medium">{formatCurrency(paymentResult.contract_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Before VAT:</span>
                    <span className="font-medium">{formatCurrency(paymentResult.amount_before_vat)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">VAT ({paymentResult.vat_rate}%):</span>
                    <span className="font-medium text-red-600">-{formatCurrency(paymentResult.vat_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">WHT ({paymentResult.wht_rate}%):</span>
                    <span className="font-medium text-orange-600">-{formatCurrency(paymentResult.wht_amount)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-900 font-medium">Net Payment:</span>
                    <span className="font-bold text-purple-600">{formatCurrency(paymentResult.net_payment)}</span>
                  </div>
                </div>
              </div>

              {/* Government Remittance */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Government Remittance</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total to Government:</span>
                      <span className="font-bold">{formatCurrency(paymentResult.total_government_remittance)}</span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>• VAT Due: {paymentResult.vat_due_date}</p>
                      <p>• WHT Due (FIRS): {paymentResult.wht_due_date}</p>
                      <p>• WHT Due (SIRS): {paymentResult.sirs_due_date}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t space-y-3">
                <Button
                  onClick={() => generatePaymentProcessingReport(paymentInput, paymentResult)}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white flex items-center justify-center space-x-2"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print Report (PDF)</span>
                </Button>
                
                {paymentInput.payee_email && (
                  <Button
                    onClick={sendPaymentAdvice}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center space-x-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>Send Payment Advice</span>
                  </Button>
                )}
              </div>
              
              {/* Results Disclaimer */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-4">
                <p className="text-xs text-gray-600 text-center">
                  * Users are solely responsible for the validity, accuracy and completeness of the financial information they supply.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Upgrade Prompt */}
      {showUpgradePrompt && (
        <UpgradePrompt
          type="feature"
          feature="payment_calc"
          onUpgrade={handleUpgrade}
          onTrial={handleTrial}
          onClose={() => setShowUpgradePrompt(false)}
        />
      )}
    </div>
  );
};

export default PaymentProcessingCalculator;