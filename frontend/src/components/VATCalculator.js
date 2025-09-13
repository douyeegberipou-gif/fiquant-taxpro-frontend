import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.jsx';
import { Input } from './ui/input.jsx';
import { Label } from './ui/label.jsx';
import { Button } from './ui/button.jsx';
import { Separator } from './ui/separator.jsx';
import { Alert, AlertDescription } from './ui/alert.jsx';
import { Calculator, Building2, AlertTriangle, Printer } from 'lucide-react';
import { generateVatReport } from '../utils/pdfGenerator';

const VATCalculator = ({ formatCurrency }) => {
  const [vatInput, setVatInput] = useState({
    company_name: '',
    month: '',
    total_sales: '',
    vat_exempt_sales: '',
    zero_rated_sales: '',
    taxable_purchases: '',
    input_vat_paid: '',
    is_registered_business: true
  });

  const [vatResult, setVatResult] = useState(null);
  const [vatLoading, setVatLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setVatInput(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateVAT = () => {
    setVatLoading(true);
    
    try {
      const totalSales = parseFloat(vatInput.total_sales) || 0;
      const vatExemptSales = parseFloat(vatInput.vat_exempt_sales) || 0;
      const zeroRatedSales = parseFloat(vatInput.zero_rated_sales) || 0;
      const taxablePurchases = parseFloat(vatInput.taxable_purchases) || 0;
      const inputVatPaid = parseFloat(vatInput.input_vat_paid) || 0;

      // Calculate taxable sales (total sales minus exempt and zero-rated)
      const taxableSales = totalSales - vatExemptSales - zeroRatedSales;
      
      // VAT rate is 10% for 2025
      const vatRate = 0.10;
      
      // Calculate output VAT (VAT to be collected)
      const outputVat = taxableSales * vatRate;
      
      // Calculate input VAT (for registered businesses)
      let inputVatRecoverable = 0;
      if (vatInput.is_registered_business) {
        inputVatRecoverable = inputVatPaid > 0 ? inputVatPaid : (taxablePurchases * vatRate);
      }
      
      // Calculate net VAT position
      const netVatPayable = outputVat - inputVatRecoverable;
      
      const result = {
        total_sales: totalSales,
        taxable_sales: taxableSales,
        vat_exempt_sales: vatExemptSales,
        zero_rated_sales: zeroRatedSales,
        output_vat: outputVat,
        input_vat_recoverable: inputVatRecoverable,
        net_vat_payable: netVatPayable,
        vat_rate: vatRate * 100,
        is_refund: netVatPayable < 0,
        company_name: vatInput.company_name,
        month: vatInput.month,
        timestamp: new Date().toISOString()
      };
      
      setVatResult(result);
    } catch (error) {
      console.error('Error calculating VAT:', error);
      alert('Error calculating VAT. Please check your input values.');
    } finally {
      setVatLoading(false);
    }
  };

  const resetForm = () => {
    setVatInput({
      company_name: '',
      month: '',
      total_sales: '',
      vat_exempt_sales: '',
      zero_rated_sales: '',
      taxable_purchases: '',
      input_vat_paid: '',
      is_registered_business: true
    });
    setVatResult(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <Card className="bg-white border-blue-100 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="h-5 w-5" />
              <span>VAT Details</span>
            </CardTitle>
            <CardDescription className="text-blue-100">
              Enter your business VAT information
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Company Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Building2 className="h-4 w-4 mr-2 text-blue-600" />
                Company Information
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    type="text"
                    placeholder="Your Company Ltd"
                    value={vatInput.company_name}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="month">Month *</Label>
                  <select
                    id="month"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={vatInput.month}
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
              </div>
            </div>

            <Separator />

            {/* Sales Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Sales Information</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="total_sales">Total Sales *</Label>
                  <Input
                    id="total_sales"
                    type="number"
                    placeholder="₦10,000,000"
                    value={vatInput.total_sales}
                    onChange={(e) => handleInputChange('total_sales', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vat_exempt_sales">VAT Exempt Sales</Label>
                  <Input
                    id="vat_exempt_sales"
                    type="number"
                    placeholder="₦1,000,000"
                    value={vatInput.vat_exempt_sales}
                    onChange={(e) => handleInputChange('vat_exempt_sales', e.target.value)}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="zero_rated_sales">Zero-Rated Sales (Exports)</Label>
                  <Input
                    id="zero_rated_sales"
                    type="number"
                    placeholder="₦500,000"
                    value={vatInput.zero_rated_sales}
                    onChange={(e) => handleInputChange('zero_rated_sales', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Purchase Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Purchase Information</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxable_purchases">Taxable Purchases</Label>
                  <Input
                    id="taxable_purchases"
                    type="number"
                    placeholder="₦5,000,000"
                    value={vatInput.taxable_purchases}
                    onChange={(e) => handleInputChange('taxable_purchases', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="input_vat_paid">Input VAT Paid</Label>
                  <Input
                    id="input_vat_paid"
                    type="number"
                    placeholder="₦500,000"
                    value={vatInput.input_vat_paid}
                    onChange={(e) => handleInputChange('input_vat_paid', e.target.value)}
                  />
                </div>
              </div>
              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-800 text-sm">
                  Leave Input VAT Paid empty to auto-calculate (10% of taxable purchases)
                </AlertDescription>
              </Alert>
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
                onClick={calculateVAT} 
                disabled={vatLoading || !vatInput.company_name || !vatInput.total_sales}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {vatLoading ? 'Calculating...' : 'Calculate VAT'}
              </Button>
              <Button 
                onClick={resetForm} 
                variant="outline"
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {vatResult && (
          <Card className="bg-white border-blue-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
              <CardTitle>VAT Calculation Results</CardTitle>
              <CardDescription className="text-indigo-100">
                Based on Nigerian VAT laws (10% rate for 2025)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-600 font-medium">Output VAT</p>
                  <p className="text-xl font-bold text-blue-800">
                    {formatCurrency(vatResult.output_vat)}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-green-600 font-medium">Input VAT Recoverable</p>
                  <p className="text-xl font-bold text-green-800">
                    {formatCurrency(vatResult.input_vat_recoverable)}
                  </p>
                </div>
                <div className={`p-4 rounded-lg border col-span-2 ${
                  vatResult.is_refund ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <p className={`text-sm font-medium ${
                    vatResult.is_refund ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {vatResult.is_refund ? 'VAT Refund Due' : 'Net VAT Payable'}
                  </p>
                  <p className={`text-2xl font-bold ${
                    vatResult.is_refund ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {formatCurrency(Math.abs(vatResult.net_vat_payable))}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Detailed Breakdown */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Sales Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Sales:</span>
                    <span className="font-medium">{formatCurrency(vatResult.total_sales)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">VAT Exempt Sales:</span>
                    <span className="font-medium">{formatCurrency(vatResult.vat_exempt_sales)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Zero-Rated Sales:</span>
                    <span className="font-medium">{formatCurrency(vatResult.zero_rated_sales)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-900 font-medium">Taxable Sales:</span>
                    <span className="font-bold">{formatCurrency(vatResult.taxable_sales)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">VAT Rate Applied:</span>
                    <span className="font-medium">{vatResult.vat_rate}%</span>
                  </div>
                </div>
              </div>

              {/* Print Report Button */}
              <div className="pt-4 border-t">
                <Button
                  onClick={() => generateVatReport(vatInput, vatResult)}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white flex items-center justify-center space-x-2"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print Report (PDF)</span>
                </Button>
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
    </div>
  );
};

export default VATCalculator;