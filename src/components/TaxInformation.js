import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  Calendar, 
  CreditCard, 
  Building2, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Calculator,
  FileText,
  Clock,
  TrendingUp,
  DollarSign,
  Globe,
  Shield,
  Zap,
  BookOpen
} from 'lucide-react';

const TaxInformation = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', title: 'NTA 2026 Overview', icon: BookOpen },
    { id: 'quarterly', title: 'Quarterly Payments', icon: Calendar },
    { id: 'rates', title: 'Tax Rates & Structure', icon: Calculator },
    { id: 'compliance', title: 'Compliance Requirements', icon: Shield },
    { id: 'vat', title: 'VAT & Digital Services', icon: Globe },
    { id: 'corporate', title: 'Corporate Provisions', icon: Building2 },
    { id: 'banking', title: 'Banking & TIN Requirements', icon: CreditCard },
    { id: 'deadlines', title: 'Payment Deadlines', icon: Clock }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">New Nigeria Tax Act (NTA) 2025</h3>
                  <p className="text-blue-800 mt-2">
                    Effective January 1, 2026 - Comprehensive tax reforms signed by President Bola Tinubu on June 26, 2025
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-green-200">
                <CardHeader className="bg-green-50">
                  <CardTitle className="text-green-800 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Key Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <span>₦800,000 annual income tax-free threshold</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <span>Reduced Corporate Income Tax from 30% to 25%</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <span>Small companies (₦50M turnover) exempt from CIT</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <span>Streamlined tax administration under Nigeria Revenue Service (NRS)</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-amber-200">
                <CardHeader className="bg-amber-50">
                  <CardTitle className="text-amber-800 flex items-center">
                    <Info className="h-5 w-5 mr-2" />
                    Major Changes
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                      <span><strong>FIRS</strong> renamed to <strong>Nigeria Revenue Service (NRS)</strong></span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                      <span>Mandatory quarterly estimated tax payments</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                      <span>VAT increases: 10% (2025) → 12.5% (2026-2029) → 15% (2030+)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                      <span>Digital services tax for non-resident suppliers</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="border-red-200">
              <CardHeader className="bg-red-50">
                <CardTitle className="text-red-800 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Critical Compliance Alert
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-red-700 font-medium">
                  <strong>Tax Ombudsman Office:</strong> An independent Tax Ombudsman office has been established to address taxpayer complaints and ensure fairness in tax administration.
                </p>
                <p className="text-red-600 mt-2">
                  All taxpayers must obtain a unified Taxpayer Identification Number (TIN) linked to national identity systems for streamlined tax administration.
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 'quarterly':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-purple-900 mb-3">Quarterly Estimated Tax Payment System</h3>
              <p className="text-purple-800">
                The NTA mandates companies to estimate their annual tax liability and remit payments in four quarterly installments to enhance cash flow management.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                    Payment Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">Q1 Payment</span>
                      <Badge variant="outline">March 31</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Q2 Payment</span>
                      <Badge variant="outline">June 30</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <span className="font-medium">Q3 Payment</span>
                      <Badge variant="outline">September 30</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="font-medium">Q4 Payment</span>
                      <Badge variant="outline">December 31</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                    Calculation Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
                      <p className="font-medium text-blue-900">Step 1: Estimate Annual Tax</p>
                      <p className="text-blue-700 text-sm">Calculate expected annual tax liability based on projected income</p>
                    </div>
                    <div className="p-3 border-l-4 border-green-500 bg-green-50">
                      <p className="font-medium text-green-900">Step 2: Quarterly Payments</p>
                      <p className="text-green-700 text-sm">Divide annual estimate by 4 and pay each quarter</p>
                    </div>
                    <div className="p-3 border-l-4 border-purple-500 bg-purple-50">
                      <p className="font-medium text-purple-900">Step 3: Year-end Reconciliation</p>
                      <p className="text-purple-700 text-sm">Reconcile with actual earnings for refund/additional payment</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-green-200">
              <CardHeader className="bg-green-50">
                <CardTitle className="text-green-800">Year-End Reconciliation Process</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-medium text-blue-900">File Annual Return</h4>
                    <p className="text-blue-700 text-sm">Submit actual income and tax calculations</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Calculator className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-medium text-green-900">NRS Reconciliation</h4>
                    <p className="text-green-700 text-sm">Compare quarterly payments vs actual liability</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <h4 className="font-medium text-purple-900">Refund/Payment</h4>
                    <p className="text-purple-700 text-sm">Receive refund or pay additional tax due</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-900">Important Notice</p>
                  <p className="text-amber-800 text-sm mt-1">
                    Failure to make quarterly payments may result in penalties and interest charges. Ensure accurate estimation to avoid cash flow issues during reconciliation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'rates':
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                    Personal Income Tax (PAYE)
                  </CardTitle>
                  <CardDescription>New progressive tax structure effective 2026</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                      <span className="text-sm">₦0 - ₦800,000</span>
                      <Badge className="bg-green-600">0% (Tax-Free)</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                      <span className="text-sm">₦800,001 - ₦3,000,000</span>
                      <Badge className="bg-blue-600">15%</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                      <span className="text-sm">₦3,000,001 - ₦12,000,000</span>
                      <Badge className="bg-yellow-600">18%</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                      <span className="text-sm">₦12,000,001 - ₦25,000,000</span>
                      <Badge className="bg-orange-600">21%</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                      <span className="text-sm">₦25,000,001 - ₦50,000,000</span>
                      <Badge className="bg-red-600">23%</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                      <span className="text-sm">Above ₦50,000,000</span>
                      <Badge className="bg-purple-600">25%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="h-5 w-5 mr-2 text-green-600" />
                    Corporate Income Tax (CIT)
                  </CardTitle>
                  <CardDescription>Reduced rates and exemptions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-green-900">2025 Rate</span>
                        <Badge className="bg-green-600">27.5%</Badge>
                      </div>
                      <p className="text-green-700 text-sm">Transitional rate for 2025</p>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-blue-900">2026+ Rate</span>
                        <Badge className="bg-blue-600">25%</Badge>
                      </div>
                      <p className="text-blue-700 text-sm">New standard rate from 2026</p>
                    </div>
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-amber-900">Small Companies</span>
                        <Badge className="bg-amber-600">0% (Exempt)</Badge>
                      </div>
                      <p className="text-amber-700 text-sm">Turnover below ₦50 million</p>
                    </div>
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-purple-900">Development Levy</span>
                        <Badge className="bg-purple-600">4%</Badge>
                      </div>
                      <p className="text-purple-700 text-sm">On assessable profits (consolidates 4 previous levies)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Multinational Minimum Tax</CardTitle>
                <CardDescription>Global compliance requirements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-900">15% Minimum Effective Tax Rate</p>
                      <p className="text-red-700 text-sm mt-1">
                        Applies to companies that are part of multinational groups with global turnover of €750 million+ 
                        OR have annual turnover of ₦50 billion+
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Capital Gains Tax</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Companies</span>
                      <Badge variant="destructive">30%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Individuals</span>
                      <Badge variant="outline">Up to 25%</Badge>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      Exemption: Proceeds &lt; ₦150M and gains &lt; ₦10M in 12 months
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">VAT Rates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">2025</span>
                      <Badge className="bg-blue-600">10%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">2026-2029</span>
                      <Badge className="bg-yellow-600">12.5%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">2030+</span>
                      <Badge className="bg-red-600">15%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Fossil Fuel Surcharge</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Rate</span>
                      <Badge className="bg-green-600">5%</Badge>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      Exemptions: Kerosene, LPG, CNG, renewable energy
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'banking':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-6 w-6 text-red-600 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-red-900">Mandatory TIN Requirement for Banking</h3>
                  <p className="text-red-800 mt-2">
                    <strong>Critical Compliance:</strong> No bank account can be opened or operated by individuals or corporates in Nigeria without a valid Tax Identification Number (TIN).
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-blue-200">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="text-blue-800 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    TIN Requirements for Banking
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <Shield className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-900">Account Opening</p>
                        <p className="text-red-700 text-sm">TIN mandatory for new personal and corporate accounts</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-900">Existing Accounts</p>
                        <p className="text-amber-700 text-sm">Banks may freeze accounts without valid TIN</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <Globe className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-purple-900">KYC Compliance</p>
                        <p className="text-purple-700 text-sm">TIN integrated into Know Your Customer processes</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200">
                <CardHeader className="bg-green-50">
                  <CardTitle className="text-green-800 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    How to Obtain TIN
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 border-l-4 border-blue-500 bg-blue-50">
                      <span className="bg-blue-600 text-white text-sm px-2 py-1 rounded">1</span>
                      <div>
                        <p className="font-medium text-blue-900">Visit NRS Office</p>
                        <p className="text-blue-700 text-sm">Or State Board of Internal Revenue</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border-l-4 border-green-500 bg-green-50">
                      <span className="bg-green-600 text-white text-sm px-2 py-1 rounded">2</span>
                      <div>
                        <p className="font-medium text-green-900">Online Registration</p>
                        <p className="text-green-700 text-sm">Use NRS digital platforms</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border-l-4 border-purple-500 bg-purple-50">
                      <span className="bg-purple-600 text-white text-sm px-2 py-1 rounded">3</span>
                      <div>
                        <p className="font-medium text-purple-900">Required Documents</p>
                        <p className="text-purple-700 text-sm">ID, passport photo, address proof</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-yellow-200">
              <CardHeader className="bg-yellow-50">
                <CardTitle className="text-yellow-800">Unified TIN System</CardTitle>
                <CardDescription>New national identification integration</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Key Features:</h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Single TIN for all tax types</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Linked to National ID systems</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Real-time verification</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Cross-platform integration</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Benefits:</h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li className="flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-blue-600" />
                        <span>Streamlined tax administration</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-blue-600" />
                        <span>Reduced compliance burden</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-blue-600" />
                        <span>Enhanced data integrity</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-blue-600" />
                        <span>Improved tax collection</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">Penalties for Non-Compliance</p>
                  <p className="text-red-700 text-sm mt-1">
                    Banks face penalties for opening accounts without TIN verification. Customers risk account freezing and financial service restrictions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'compliance':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-3">Digital Compliance Revolution</h3>
              <p className="text-green-800">
                The NTA introduces mandatory digital compliance systems including e-invoicing, real-time VAT reporting, and electronic transaction monitoring.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-blue-200">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="text-blue-800 flex items-center text-sm">
                    <FileText className="h-4 w-4 mr-2" />
                    E-Invoicing & Fiscalization
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="p-2 bg-blue-50 rounded text-sm">
                      <p className="font-medium text-blue-900">Mandatory for VAT-registered businesses</p>
                    </div>
                    <div className="p-2 bg-green-50 rounded text-sm">
                      <p className="font-medium text-green-900">Real-time transaction monitoring</p>
                    </div>
                    <div className="p-2 bg-purple-50 rounded text-sm">
                      <p className="font-medium text-purple-900">Linked to NRS systems</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200">
                <CardHeader className="bg-green-50">
                  <CardTitle className="text-green-800 flex items-center text-sm">
                    <Globe className="h-4 w-4 mr-2" />
                    Digital Services Tax
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="p-2 bg-red-50 rounded text-sm">
                      <p className="font-medium text-red-900">Non-resident suppliers must register for VAT</p>
                    </div>
                    <div className="p-2 bg-blue-50 rounded text-sm">
                      <p className="font-medium text-blue-900">Covers e-commerce platforms</p>
                    </div>
                    <div className="p-2 bg-yellow-50 rounded text-sm">
                      <p className="font-medium text-yellow-900">Digital content providers included</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200">
                <CardHeader className="bg-purple-50">
                  <CardTitle className="text-purple-800 flex items-center text-sm">
                    <Shield className="h-4 w-4 mr-2" />
                    Transfer Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="p-2 bg-blue-50 rounded text-sm">
                      <p className="font-medium text-blue-900">Advance Pricing Agreements (APAs)</p>
                    </div>
                    <div className="p-2 bg-red-50 rounded text-sm">
                      <p className="font-medium text-red-900">Controlled Foreign Company rules</p>
                    </div>
                    <div className="p-2 bg-green-50 rounded text-sm">
                      <p className="font-medium text-green-900">Enhanced documentation requirements</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Penalty Framework</CardTitle>
                <CardDescription>Comprehensive enforcement mechanisms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Administrative Penalties:</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                        <span className="text-sm">Failure to register</span>
                        <Badge variant="destructive">₦50,000+</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                        <span className="text-sm">Late filing</span>
                        <Badge className="bg-yellow-600">₦25,000+</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                        <span className="text-sm">Non-remittance of WHT</span>
                        <Badge className="bg-blue-600">10% of tax</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Criminal Penalties:</h4>
                    <div className="space-y-2">
                      <div className="p-2 bg-red-50 rounded text-sm">
                        <p className="font-medium text-red-900">Tax Evasion</p>
                        <p className="text-red-700">Up to 5 years imprisonment</p>
                      </div>
                      <div className="p-2 bg-purple-50 rounded text-sm">
                        <p className="font-medium text-purple-900">Obstruction of Tax Officers</p>
                        <p className="text-purple-700">₦5 million fine + 2 years</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardHeader className="bg-orange-50">
                <CardTitle className="text-orange-800">Thin Capitalization Rules</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-orange-800 font-medium mb-2">Enhanced Interest Deduction Restrictions</p>
                  <p className="text-orange-700 text-sm">
                    Interest deductibility limits expanded from foreign-connected parties to all connected-party arrangements, 
                    increasing tax exposure and discouraging thin capitalization practices.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'vat':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">VAT & Digital Economy Reforms</h3>
              <p className="text-blue-800">
                Progressive VAT rate increases and comprehensive digital services tax framework to capture revenue from the digital economy.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-red-200">
                <CardHeader className="bg-red-50">
                  <CardTitle className="text-red-800 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    VAT Rate Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-blue-900">2025</span>
                        <Badge className="bg-blue-600 text-lg px-3 py-1">10%</Badge>
                      </div>
                      <p className="text-blue-700 text-sm">Current rate maintained</p>
                    </div>
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-yellow-900">2026 - 2029</span>
                        <Badge className="bg-yellow-600 text-lg px-3 py-1">12.5%</Badge>
                      </div>
                      <p className="text-yellow-700 text-sm">Transitional increase</p>
                    </div>
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-red-900">2030+</span>
                        <Badge className="bg-red-600 text-lg px-3 py-1">15%</Badge>
                      </div>
                      <p className="text-red-700 text-sm">Final rate implementation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200">
                <CardHeader className="bg-green-50">
                  <CardTitle className="text-green-800 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Zero-Rated Items
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Basic food items</span>
                    </div>
                    <div className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Medical products & services</span>
                    </div>
                    <div className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Educational materials</span>
                    </div>
                    <div className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Electricity supply</span>
                    </div>
                    <div className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Export goods & services</span>
                    </div>
                    <div className="text-xs text-green-700 mt-2 p-2 bg-green-100 rounded">
                      <strong>Benefit:</strong> Suppliers can reclaim input VAT on zero-rated supplies
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-purple-600" />
                  Digital Services Tax Framework
                </CardTitle>
                <CardDescription>Comprehensive coverage of the digital economy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">E-commerce Platforms</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Online marketplaces</li>
                      <li>• Digital storefronts</li>
                      <li>• Booking platforms</li>
                      <li>• Ride-hailing services</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-2">Digital Content</h4>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• Streaming services</li>
                      <li>• Software downloads</li>
                      <li>• Online courses</li>
                      <li>• Digital media</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Online Services</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Cloud computing</li>
                      <li>• SaaS applications</li>
                      <li>• Digital advertising</li>
                      <li>• Online consultancy</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200">
              <CardHeader className="bg-amber-50">
                <CardTitle className="text-amber-800">Input VAT Recovery Enhancement</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-900">Expanded Recovery Rights</h4>
                    <p className="text-green-700 text-sm mt-1">
                      Businesses can now claim input VAT on all purchases including services and capital assets, 
                      provided they are directly related to taxable supplies.
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <h5 className="font-medium text-blue-900 text-sm">Recoverable Input VAT:</h5>
                      <ul className="text-xs text-blue-700 mt-1 space-y-1">
                        <li>• Capital equipment purchases</li>
                        <li>• Professional services</li>
                        <li>• Business-related expenses</li>
                        <li>• Import-related costs</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <h5 className="font-medium text-red-900 text-sm">Non-Recoverable:</h5>
                      <ul className="text-xs text-red-700 mt-1 space-y-1">
                        <li>• Entertainment expenses</li>
                        <li>• Personal use items</li>
                        <li>• Non-business activities</li>
                        <li>• Blocked input VAT items</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'corporate':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-3">Corporate Tax Incentives & Compliance</h3>
              <p className="text-green-800">
                Significant reductions in corporate tax rates with enhanced compliance requirements for multinational enterprises.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-green-200">
                <CardHeader className="bg-green-50">
                  <CardTitle className="text-green-800 flex items-center">
                    <Building2 className="h-5 w-5 mr-2" />
                    Small Company Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-green-900">CIT Exemption</span>
                        <Badge className="bg-green-600">0%</Badge>
                      </div>
                      <p className="text-green-700 text-sm">Annual turnover below ₦50 million</p>
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-blue-900">Development Levy Exemption</span>
                        <Badge className="bg-blue-600">Exempt</Badge>
                      </div>
                      <p className="text-blue-700 text-sm">No 4% development levy for small companies</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-amber-800 text-sm">
                        <strong>Qualification:</strong> Must maintain turnover below ₦50 million annually 
                        and meet other compliance requirements.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="text-blue-800 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Standard CIT Rates
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-yellow-900">2025 Transition Rate</span>
                        <Badge className="bg-yellow-600">27.5%</Badge>
                      </div>
                      <p className="text-yellow-700 text-sm">One-year transitional rate</p>
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-blue-900">2026+ Standard Rate</span>
                        <Badge className="bg-blue-600">25%</Badge>
                      </div>
                      <p className="text-blue-700 text-sm">New permanent rate (down from 30%)</p>
                    </div>
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-purple-900">Development Levy</span>
                        <Badge className="bg-purple-600">4%</Badge>
                      </div>
                      <p className="text-purple-700 text-sm">Consolidates 4 previous levies</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-red-200">
              <CardHeader className="bg-red-50">
                <CardTitle className="text-red-800">Multinational Enterprise (MNE) Rules</CardTitle>
                <CardDescription>Enhanced compliance for large corporations</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-900 mb-2">15% Minimum Effective Tax Rate</h4>
                    <p className="text-red-700 text-sm mb-3">Applies to companies meeting either criteria:</p>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="p-3 bg-white border border-red-200 rounded">
                        <p className="font-medium text-red-900 text-sm">Global Criterion</p>
                        <p className="text-red-700 text-xs">Part of multinational group with €750M+ global turnover</p>
                      </div>
                      <div className="p-3 bg-white border border-red-200 rounded">
                        <p className="font-medium text-red-900 text-sm">Local Criterion</p>
                        <p className="text-red-700 text-xs">Annual turnover of ₦50 billion or more</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-medium text-purple-900 mb-2">Controlled Foreign Company (CFC) Rules</h4>
                    <p className="text-purple-700 text-sm">
                      Nigerian companies must report and may be taxed on undistributed profits 
                      of foreign entities they control, preventing profit shifting to low-tax jurisdictions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Development Levy Consolidation</CardTitle>
                <CardDescription>Simplification of multiple levy systems</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Previous Levies (Consolidated):</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                        <span className="text-sm">Tertiary Education Tax</span>
                        <Badge variant="outline" className="line-through">2.5%</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                        <span className="text-sm">NASENI Levy</span>
                        <Badge variant="outline" className="line-through">0.25%</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                        <span className="text-sm">IT Development Levy</span>
                        <Badge variant="outline" className="line-through">1%</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                        <span className="text-sm">Police Trust Fund</span>
                        <Badge variant="outline" className="line-through">0.25%</Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">New Unified Structure:</h4>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-green-900">Development Levy</span>
                        <Badge className="bg-green-600">4%</Badge>
                      </div>
                      <p className="text-green-700 text-sm">
                        Single levy on assessable profits replacing all four previous levies
                      </p>
                    </div>
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-blue-700 text-sm">
                        <strong>Benefit:</strong> Simplified compliance with single levy instead of four separate ones
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200">
              <CardHeader className="bg-amber-50">
                <CardTitle className="text-amber-800">Stamp Duty Modernization</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Digital Instruments Coverage:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">E-contracts and agreements</span>
                      </div>
                      <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">Electronic signatures</span>
                      </div>
                      <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">Virtual transaction documents</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Loan Capital Provisions:</h4>
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded">
                      <p className="text-amber-800 text-sm">
                        <strong>New Requirement:</strong> Loans with duration exceeding 12 months 
                        are now subject to stamp duty, closing previous compliance gaps.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'deadlines':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <Clock className="h-6 w-6 text-red-600 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-red-900">Nigerian Tax Payment Calendar</h3>
                  <p className="text-red-800 mt-2">
                    Critical deadlines for tax compliance under the New Nigeria Tax Act 2026
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-red-200">
                <CardHeader className="bg-red-50">
                  <CardTitle className="text-red-800 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Monthly Obligations
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-red-900">PAYE</span>
                        <Badge className="bg-red-600">10th</Badge>
                      </div>
                      <p className="text-red-700 text-sm">Personal Income Tax deductions</p>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-blue-900">VAT</span>
                        <Badge className="bg-blue-600">21st</Badge>
                      </div>
                      <p className="text-blue-700 text-sm">Value Added Tax returns and payments</p>
                    </div>
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-purple-900">WHT</span>
                        <Badge className="bg-purple-600">21st</Badge>
                      </div>
                      <p className="text-purple-700 text-sm">Withholding Tax remittances</p>
                    </div>
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-amber-900">Pension</span>
                        <Badge className="bg-amber-600">7 days</Badge>
                      </div>
                      <p className="text-amber-700 text-sm">After month end</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200">
                <CardHeader className="bg-green-50">
                  <CardTitle className="text-green-800 flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Quarterly & Annual
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-blue-900">Q1 CIT Estimate</span>
                        <Badge className="bg-blue-600">Mar 31</Badge>
                      </div>
                      <p className="text-blue-700 text-sm">First quarter estimated tax</p>
                    </div>
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-green-900">Q2 CIT Estimate</span>
                        <Badge className="bg-green-600">Jun 30</Badge>
                      </div>
                      <p className="text-green-700 text-sm">Second quarter estimated tax</p>
                    </div>
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-yellow-900">Q3 CIT Estimate</span>
                        <Badge className="bg-yellow-600">Sep 30</Badge>
                      </div>
                      <p className="text-yellow-700 text-sm">Third quarter estimated tax</p>
                    </div>
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-red-900">Annual CIT Return</span>
                        <Badge className="bg-red-600">Jun 30</Badge>
                      </div>
                      <p className="text-red-700 text-sm">Following year - final reconciliation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>2026 Implementation Timeline</CardTitle>
                <CardDescription>Key dates for NTA compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                      <p className="font-bold text-green-900">Jan 1, 2026</p>
                      <p className="text-green-700 text-sm">NTA Effective Date</p>
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                      <p className="font-bold text-blue-900">Q1 2026</p>
                      <p className="text-blue-700 text-sm">First Quarterly Payments</p>
                    </div>
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                      <p className="font-bold text-yellow-900">Mid-2026</p>
                      <p className="text-yellow-700 text-sm">E-invoicing Mandatory</p>
                    </div>
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
                      <p className="font-bold text-purple-900">Dec 2026</p>
                      <p className="text-purple-700 text-sm">First Year Reconciliation</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200">
              <CardHeader className="bg-amber-50">
                <CardTitle className="text-amber-800">Late Payment Consequences</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Interest Charges:</h4>
                    <div className="p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-red-800 font-medium">21% per annum</p>
                      <p className="text-red-700 text-sm">On outstanding tax amounts</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Penalties:</h4>
                    <div className="space-y-2">
                      <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-yellow-800 text-sm"><strong>Late Filing:</strong> ₦25,000 minimum</p>
                      </div>
                      <div className="p-2 bg-red-50 border border-red-200 rounded">
                        <p className="text-red-800 text-sm"><strong>Non-Payment:</strong> 10% of tax due</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Pro Tip: Use Fiquant TaxPro</p>
                  <p className="text-blue-700 text-sm mt-1">
                    Our calculators are updated with all NTA 2026 provisions. Set up payment reminders 
                    and ensure accurate quarterly estimates to avoid penalties and interest charges.
                  </p>
                </div>
              </div>
            </div>

            {/* WHT Information Section */}
            <div className="space-y-6">
              <Card className="bg-white border-orange-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5 text-orange-600" />
                    <span>Withholding Tax (WHT) 2026</span>
                  </CardTitle>
                  <CardDescription>
                    Current WHT rates for various transactions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-orange-900">Dividends & Interest</h4>
                        <Badge variant="outline" className="text-sm text-orange-700 border-orange-300">
                          10%
                        </Badge>
                      </div>
                      <p className="text-sm text-orange-700">Both resident and non-resident recipients</p>
                    </div>
                    
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-orange-900">Rent & Lease Payments</h4>
                        <Badge variant="outline" className="text-sm text-orange-700 border-orange-300">
                          10%
                        </Badge>
                      </div>
                      <p className="text-sm text-orange-700">All rent, hire, or lease transactions</p>
                    </div>

                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-orange-900">Professional Services</h4>
                        <div className="text-right">
                          <Badge variant="outline" className="text-sm text-orange-700 border-orange-300 mb-1">
                            5% Resident
                          </Badge>
                          <br />
                          <Badge variant="outline" className="text-sm text-orange-700 border-orange-300">
                            10% Non-Resident
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-orange-700">Consultancy, technical, management fees</p>
                    </div>

                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-orange-900">Goods & Construction</h4>
                        <Badge variant="outline" className="text-sm text-orange-700 border-orange-300">
                          2-5%
                        </Badge>
                      </div>
                      <p className="text-sm text-orange-700">Supply of goods, construction contracts</p>
                    </div>

                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-orange-900">Royalties</h4>
                        <div className="text-right">
                          <Badge variant="outline" className="text-sm text-orange-700 border-orange-300 mb-1">
                            10% Corporate
                          </Badge>
                          <br />
                          <Badge variant="outline" className="text-sm text-orange-700 border-orange-300">
                            5% Non-Corporate
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-orange-700">Intellectual property, licensing</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-orange-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <span>WHT Key Requirements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Deduction Timing</span>
                    <span className="font-medium text-orange-600">At payment or when due</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">FIRS Remittance</span>
                    <span className="font-medium text-orange-600">By 21st of following month</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">SIRS Remittance</span>
                    <span className="font-medium text-orange-600">By 30th of following month</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Late Payment Penalty</span>
                    <span className="font-medium text-red-600">10% per annum + interest</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Non-Deduction Fine</span>
                    <span className="font-medium text-red-600">10% of undeducted amount</span>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        );

      default:
        return <div>Select a section to view detailed information</div>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Nigerian Tax Information Center</h1>
        <p className="text-gray-600">
          Comprehensive guide to Nigeria's New Tax Act 2025 and related tax provisions effective January 2026
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tax Information Sections</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                        activeSection === section.id 
                          ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' 
                          : 'text-gray-700'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{section.title}</span>
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-6">
              <ScrollArea className="h-[800px] pr-4">
                {renderContent()}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TaxInformation;