import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.jsx';
import { Input } from './ui/input.jsx';
import { Label } from './ui/label.jsx';
import { Button } from './ui/button.jsx';
import { Separator } from './ui/separator.jsx';
import { Alert, AlertDescription } from './ui/alert.jsx';
import { Calculator, Building2, AlertTriangle, Printer, Plus, Trash2 } from 'lucide-react';
import { generateVatReport } from '../utils/pdfGenerator';

const VATCalculator = ({ formatCurrency, hasFeature }) => {
  const [vatInput, setVatInput] = useState({
    company_name: '',
    tin: '',
    month: '',
    transactions: [
      {
        id: 1,
        description: '',
        transaction_type: '',
        amount: ''
      }
    ],
    is_registered_business: true
  });

  const [vatResult, setVatResult] = useState(null);
  const [vatLoading, setVatLoading] = useState(false);

  // Comprehensive transaction types based on NTA 2026
  const transactionTypes = {
    // VAT EXEMPT (No VAT charged or recoverable)
    'medical_services': {
      name: 'Medical Services',
      category: 'exempt',
      description: 'Healthcare, hospital, medical practitioner services'
    },
    'educational_services': {
      name: 'Educational Services', 
      category: 'exempt',
      description: 'Tuition fees for nursery, primary, secondary, tertiary education'
    },
    'basic_food_items': {
      name: 'Basic Food Items',
      category: 'exempt', 
      description: 'Staple foods, agro and aqua-based products'
    },
    'medical_pharmaceuticals': {
      name: 'Medical & Pharmaceutical Products',
      category: 'exempt',
      description: 'All medical and pharmaceutical items'
    },
    'agricultural_inputs': {
      name: 'Agricultural Inputs',
      category: 'exempt',
      description: 'Fertilizers, seeds, seedlings, veterinary medicines'
    },
    'baby_products': {
      name: 'Baby Products',
      category: 'exempt',
      description: 'Baby food, clothing, and related items'
    },
    'sanitary_products': {
      name: 'Sanitary Products',
      category: 'exempt',
      description: 'Locally manufactured sanitary towels, pads, tampons'
    },
    'petroleum_products': {
      name: 'Petroleum Products',
      category: 'exempt',
      description: 'Diesel, aviation fuel, premium motor spirit, kerosene'
    },
    'renewable_energy': {
      name: 'Renewable Energy Equipment',
      category: 'exempt',
      description: 'Solar panels, wind turbines, renewable energy equipment'
    },
    'assistive_devices': {
      name: 'Assistive Devices',
      category: 'exempt',
      description: 'Wheelchairs, braille materials, disability aids'
    },
    'electric_vehicles': {
      name: 'Electric Vehicles & Parts',
      category: 'exempt',
      description: 'Electric vehicles, parts, assembly units'
    },
    'gas_electricity': {
      name: 'Gas for Electricity Generation',
      category: 'exempt',
      description: 'Gas supplied to electricity generating companies'
    },
    'electricity_transmission': {
      name: 'Electricity Transmission',
      category: 'exempt',
      description: 'Electricity transmission to national grid/DISCOs'
    },
    'land_transactions': {
      name: 'Land Transactions',
      category: 'exempt',
      description: 'Sale, lease, or transfer of land'
    },
    'cng_lpg': {
      name: 'CNG & LPG',
      category: 'exempt',
      description: 'Compressed natural gas, liquefied petroleum gas'
    },
    'biogas_biofuel': {
      name: 'Biogas & Biofuel Equipment',
      category: 'exempt',
      description: 'Clean cooking and transportation equipment'
    },
    'microfinance_services': {
      name: 'Microfinance Services',
      category: 'exempt',
      description: 'Services by microfinance banks and mortgage institutions'
    },
    'shared_transport': {
      name: 'Shared Passenger Transport',
      category: 'exempt',
      description: 'Shared passenger road transport services'
    },

    // ZERO-RATED (0% VAT but input VAT recoverable)
    'non_oil_exports': {
      name: 'Non-Oil Exports',
      category: 'zero_rated',
      description: 'All exported goods and services excluding oil and gas'
    },
    'diplomatic_purchases': {
      name: 'Diplomatic Purchases',
      category: 'zero_rated',
      description: 'Goods and services purchased by diplomats'
    },
    'humanitarian_projects': {
      name: 'Humanitarian Projects',
      category: 'zero_rated',
      description: 'Goods for donor-funded humanitarian projects'
    },
    'exported_services': {
      name: 'Exported Services',
      category: 'zero_rated',
      description: 'Services and intangible property exported'
    },

    // STANDARD RATED (10% VAT)
    'professional_services': {
      name: 'Professional Services',
      category: 'standard',
      description: 'Consulting, legal, accounting, engineering services'
    },
    'construction_services': {
      name: 'Construction Services',
      category: 'standard',
      description: 'Building, construction, engineering works'
    },
    'retail_sales': {
      name: 'Retail Sales',
      category: 'standard',
      description: 'General retail goods and merchandise'
    },
    'manufacturing': {
      name: 'Manufacturing',
      category: 'standard',
      description: 'Manufactured goods and products'
    },
    'telecommunications': {
      name: 'Telecommunications',
      category: 'standard',
      description: 'Telecom services, internet, mobile services'
    },
    'financial_services': {
      name: 'Financial Services',
      category: 'standard',
      description: 'Banking, insurance, investment services (taxable portion)'
    },
    'hospitality': {
      name: 'Hospitality Services',
      category: 'standard',
      description: 'Hotels, restaurants, catering services'
    },
    'entertainment': {
      name: 'Entertainment Services',
      category: 'standard',
      description: 'Cinema, sports, recreation services'
    },
    'transport_services': {
      name: 'Transport Services',
      category: 'standard',
      description: 'Private transport, logistics, freight services'
    },
    'rental_services': {
      name: 'Rental Services',
      category: 'standard',
      description: 'Equipment rental, property rental (commercial)'
    },
    'digital_services': {
      name: 'Digital Services',
      category: 'standard',
      description: 'Software, digital content, online services'
    },
    'advertising': {
      name: 'Advertising & Marketing',
      category: 'standard',
      description: 'Advertising, marketing, promotional services'
    }
  };

  const handleInputChange = (field, value) => {
    setVatInput(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTransactionChange = (index, field, value) => {
    setVatInput(prev => ({
      ...prev,
      transactions: prev.transactions.map((transaction, i) => 
        i === index ? { ...transaction, [field]: value } : transaction
      )
    }));
  };

  const addTransaction = () => {
    setVatInput(prev => ({
      ...prev,
      transactions: [
        ...prev.transactions,
        {
          id: Date.now(),
          description: '',
          transaction_type: '',
          amount: ''
        }
      ]
    }));
  };

  const removeTransaction = (index) => {
    if (vatInput.transactions.length > 1) {
      setVatInput(prev => ({
        ...prev,
        transactions: prev.transactions.filter((_, i) => i !== index)
      }));
    }
  };

  const calculateVAT = () => {
    setVatLoading(true);
    
    try {
      const vatRate = 0.075; // 7.5% VAT rate per NTA 2025

      let totalSales = 0;
      let standardRatedSales = 0;
      let vatExemptSales = 0;
      let zeroRatedSales = 0;
      
      const transactionBreakdown = [];

      // Process each transaction
      vatInput.transactions.forEach(transaction => {
        const amount = parseFloat(transaction.amount) || 0;
        const transactionConfig = transactionTypes[transaction.transaction_type];
        
        if (amount > 0 && transactionConfig) {
          totalSales += amount;
          
          const transactionDetail = {
            description: transaction.description,
            type: transactionConfig.name,
            amount: amount,
            category: transactionConfig.category,
            vat_amount: 0
          };

          switch (transactionConfig.category) {
            case 'standard':
              // Amount includes VAT, so extract VAT
              const amountExclVat = amount / (1 + vatRate);
              const vatAmount = amount - amountExclVat;
              standardRatedSales += amountExclVat;
              transactionDetail.vat_amount = vatAmount;
              transactionDetail.amount_excl_vat = amountExclVat;
              break;
            case 'exempt':
              vatExemptSales += amount;
              break;
            case 'zero_rated':
              zeroRatedSales += amount;
              break;
          }
          
          transactionBreakdown.push(transactionDetail);
        }
      });

      // Calculate VAT amounts
      const outputVat = standardRatedSales * vatRate;
      
      const result = {
        total_sales: totalSales,
        standard_rated_sales: standardRatedSales,
        vat_exempt_sales: vatExemptSales,
        zero_rated_sales: zeroRatedSales,
        output_vat: outputVat,
        vat_rate: vatRate * 100,
        company_name: vatInput.company_name,
        month: vatInput.month,
        transaction_breakdown: transactionBreakdown,
        is_registered_business: vatInput.is_registered_business,
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
      tin: '',
      month: '',
      transactions: [
        {
          id: 1,
          description: '',
          transaction_type: '',
          amount: ''
        }
      ],
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
              Enter your business VAT information with transaction types
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
                  <Label htmlFor="tin">Tax Identification Number (TIN)</Label>
                  <Input
                    id="tin"
                    type="text"
                    placeholder="12345678901"
                    value={vatInput.tin}
                    onChange={(e) => handleInputChange('tin', e.target.value)}
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
              
              <div className="space-y-2">
                <Label>VAT Registration Status</Label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="registration"
                      checked={vatInput.is_registered_business}
                      onChange={() => handleInputChange('is_registered_business', true)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">VAT Registered</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="registration"
                      checked={!vatInput.is_registered_business}
                      onChange={() => handleInputChange('is_registered_business', false)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">Not VAT Registered</span>
                  </label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Transactions */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Sales & Transactions</h3>
                <Button
                  type="button"
                  onClick={addTransaction}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Transaction</span>
                </Button>
              </div>
              
              {vatInput.transactions.map((transaction, index) => (
                <div key={transaction.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-gray-800">Transaction {index + 1}</h4>
                    {vatInput.transactions.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeTransaction(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        type="text"
                        placeholder="Sale description"
                        value={transaction.description}
                        onChange={(e) => handleTransactionChange(index, 'description', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Amount *</Label>
                      <Input
                        type="number"
                        placeholder="₦1,000,000"
                        value={transaction.amount}
                        onChange={(e) => handleTransactionChange(index, 'amount', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Transaction Type *</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={transaction.transaction_type}
                      onChange={(e) => handleTransactionChange(index, 'transaction_type', e.target.value)}
                    >
                      <option value="">Select Transaction Type</option>
                      <optgroup label="Standard Rated (10% VAT)">
                        {Object.entries(transactionTypes)
                          .filter(([_, config]) => config.category === 'standard')
                          .map(([key, config]) => (
                            <option key={key} value={key}>{config.name}</option>
                          ))}
                      </optgroup>
                      <optgroup label="VAT Exempt">
                        {Object.entries(transactionTypes)
                          .filter(([_, config]) => config.category === 'exempt')
                          .map(([key, config]) => (
                            <option key={key} value={key}>{config.name}</option>
                          ))}
                      </optgroup>
                      <optgroup label="Zero Rated (0% VAT)">
                        {Object.entries(transactionTypes)
                          .filter(([_, config]) => config.category === 'zero_rated')
                          .map(([key, config]) => (
                            <option key={key} value={key}>{config.name}</option>
                          ))}
                      </optgroup>
                    </select>
                  </div>
                  
                  {transaction.transaction_type && (
                    <Alert className="bg-blue-50 border-blue-200">
                      <AlertDescription className="text-blue-800 text-sm">
                        <strong>{transactionTypes[transaction.transaction_type].name}:</strong> {transactionTypes[transaction.transaction_type].description}
                        <br />
                        <strong>VAT Status:</strong> {transactionTypes[transaction.transaction_type].category.replace('_', ' ').toUpperCase()}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ))}
            </div>

            <Separator />

            {/* Disclaimer Note */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
              <p className="text-xs text-amber-800 flex items-start">
                <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Note:</strong> Users are solely responsible for the validity, accuracy and completeness of the financial information they supply. VAT classifications are based on NTA 2026.
                </span>
              </p>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button 
                onClick={calculateVAT} 
                disabled={vatLoading || !vatInput.company_name || vatInput.transactions.length === 0}
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
                Based on Nigerian Tax Act 2026 (10% rate for 2025)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-600 font-medium">Total Output VAT Due</p>
                  <p className="text-2xl font-bold text-blue-800">
                    {formatCurrency(vatResult.output_vat)}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    VAT to be charged on standard-rated sales
                  </p>
                </div>
              </div>

              <Separator />

              {/* Sales Breakdown */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Sales Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Sales:</span>
                    <span className="font-medium">{formatCurrency(vatResult.total_sales)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Standard Rated Sales (10%):</span>
                    <span className="font-medium">{formatCurrency(vatResult.standard_rated_sales)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">VAT Exempt Sales:</span>
                    <span className="font-medium">{formatCurrency(vatResult.vat_exempt_sales)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Zero-Rated Sales:</span>
                    <span className="font-medium">{formatCurrency(vatResult.zero_rated_sales)}</span>
                  </div>
                </div>
              </div>

              {/* Transaction Breakdown */}
              {vatResult.transaction_breakdown && vatResult.transaction_breakdown.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Transaction Analysis</h4>
                  <div className="space-y-2">
                    {vatResult.transaction_breakdown.map((transaction, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{transaction.description || `Transaction ${index + 1}`}</p>
                            <p className="text-xs text-gray-600">{transaction.type}</p>
                            <p className="text-xs text-blue-600 font-medium">
                              {transaction.category.replace('_', ' ').toUpperCase()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{formatCurrency(transaction.amount)}</p>
                            {transaction.vat_amount > 0 && (
                              <p className="text-xs text-blue-600">VAT: {formatCurrency(transaction.vat_amount)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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