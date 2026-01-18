import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { NativeAd } from './ads/NativeAd';
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
    { id: 'overview', title: 'Tax Law Overview', icon: BookOpen },
    { id: 'quarterly', title: 'Quarterly Payments', icon: Calendar },
    { id: 'rates', title: 'Tax Rates & Structure', icon: Calculator },
    { id: 'reliefs', title: 'Tax Reliefs', icon: TrendingUp },
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
                  <h3 className="text-lg font-semibold text-blue-900">Nigeria Tax Act (NTA) 2025</h3>
                  <p className="text-blue-800 mt-2">
                    Signed by President Bola Tinubu on June 26, 2025. <strong>Effective January 1, 2026.</strong> This page covers both current tax law (2025) and upcoming NTA 2025 changes.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-green-200">
                <CardHeader className="bg-green-50">
                  <CardTitle className="text-green-800 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Current Law (2025)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <span><strong>VAT:</strong> 7.5% (since February 2020)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <span><strong>CIT Large Companies:</strong> 30% (turnover above ₦100M)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <span><strong>CIT Medium Companies:</strong> 20% (turnover ₦25M-₦100M)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <span><strong>CIT Small Companies:</strong> 0% (turnover ≤₦25M)</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-amber-200">
                <CardHeader className="bg-amber-50">
                  <CardTitle className="text-amber-800 flex items-center">
                    <Info className="h-5 w-5 mr-2" />
                    NTA 2025 Changes (From Jan 1, 2026)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                      <span>₦800,000 annual income tax-free threshold</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                      <span><strong>FIRS</strong> renamed to <strong>Nigeria Revenue Service (NRS)</strong></span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                      <span>Small company threshold raised to ₦50M turnover AND ₦250M assets</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                      <span>4% Development Levy (consolidates multiple levies)</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="border-red-200">
              <CardHeader className="bg-red-50">
                <CardTitle className="text-red-800 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Important Notice
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-red-700 font-medium">
                  <strong>Tax Ombudsman Office:</strong> Under NTA 2025, an independent Tax Ombudsman office will be established to address taxpayer complaints and ensure fairness in tax administration.
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
                Under NTA 2025 (effective January 2026), companies will be required to estimate their annual tax liability and remit payments in four quarterly installments to enhance cash flow management.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                    Payment Schedule (NTA 2025)
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

            {/* Native Ad */}
            <NativeAd />

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
                  <CardDescription>NTA 2025 progressive structure (effective Jan 1, 2026)</CardDescription>
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
                  <CardDescription>Current rates (2025) and NTA 2025 changes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Current Rates (2025)</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-blue-800">Large Companies (turnover &gt;₦100M)</span>
                          <Badge className="bg-blue-600">30%</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-blue-800">Medium Companies (₦25M-₦100M)</span>
                          <Badge className="bg-blue-500">20%</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-blue-800">Small Companies (≤₦25M)</span>
                          <Badge className="bg-green-600">0%</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <h4 className="font-semibold text-amber-900 mb-2">NTA 2025 (From Jan 2026)</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-amber-800">Standard Rate</span>
                          <Badge className="bg-amber-600">25%</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-amber-800">Small Companies (new threshold)</span>
                          <Badge className="bg-green-600">0%</Badge>
                        </div>
                      </div>
                      <p className="text-xs text-amber-700 mt-2">Small company: Turnover ≤₦50M AND Fixed Assets ≤₦250M</p>
                    </div>
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-purple-900">Development Levy (NTA 2025)</span>
                        <Badge className="bg-purple-600">4%</Badge>
                      </div>
                      <p className="text-purple-700 text-sm">Consolidates TET, NASENI, IT Levy, Police Trust Fund</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Multinational Minimum Tax (NTA 2025)</CardTitle>
                <CardDescription>Global compliance requirements effective January 2026</CardDescription>
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
                      <span className="text-sm">Companies (NTA 2025)</span>
                      <Badge variant="destructive">30%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Individuals (NTA 2025)</span>
                      <Badge variant="outline">Up to 25%</Badge>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      Exemption: Proceeds &lt;₦150M and gains &lt;₦10M in 12 months
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">VAT Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Current (2025)</span>
                      <Badge className="bg-green-600">7.5%</Badge>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      Rate unchanged since February 1, 2020. Zero-rated: exports, basic food, medical, education.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Fossil Fuel Surcharge (NTA 2025)</CardTitle>
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

            {/* WHT Information Section */}
            <div className="space-y-6">
              <Card className="bg-white border-orange-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5 text-orange-600" />
                    <span>Withholding Tax (WHT) Rates</span>
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

              {/* Native Ad */}
              <NativeAd />
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
                        <p className="font-medium text-blue-900">Visit FIRS Office</p>
                        <p className="text-blue-700 text-sm">Or State Board of Internal Revenue</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border-l-4 border-green-500 bg-green-50">
                      <span className="bg-green-600 text-white text-sm px-2 py-1 rounded">2</span>
                      <div>
                        <p className="font-medium text-green-900">Online Registration</p>
                        <p className="text-green-700 text-sm">Use FIRS digital platforms (taxpromax.firs.gov.ng)</p>
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
                <CardDescription>National identification integration</CardDescription>
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
              <h3 className="text-lg font-semibold text-green-900 mb-3">Digital Compliance Requirements</h3>
              <p className="text-green-800">
                Modern compliance systems including e-invoicing, real-time VAT reporting, and electronic transaction monitoring are being implemented.
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
                      <p className="font-medium text-purple-900">Linked to FIRS/NRS systems</p>
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
                <CardDescription>Enforcement mechanisms</CardDescription>
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
                  <p className="text-orange-800 font-medium mb-2">Interest Deduction Restrictions</p>
                  <p className="text-orange-700 text-sm">
                    Interest deductibility is limited to 30% of EBITDA. Restrictions expanded from foreign-connected parties to all connected-party arrangements.
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
              <h3 className="text-lg font-semibold text-blue-900 mb-3">VAT & Digital Economy</h3>
              <p className="text-blue-800">
                Current VAT rate and digital services tax framework for the digital economy.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-green-200">
                <CardHeader className="bg-green-50">
                  <CardTitle className="text-green-800 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Current VAT Rate
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-green-900">Standard Rate (2025)</span>
                        <Badge className="bg-green-600 text-lg px-3 py-1">7.5%</Badge>
                      </div>
                      <p className="text-green-700 text-sm">In effect since February 1, 2020</p>
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="font-medium text-blue-900 mb-2">VAT Registration Threshold</p>
                      <p className="text-blue-700 text-sm">Companies with taxable supplies exceeding ₦50 million must register for VAT (NTA 2025)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200">
                <CardHeader className="bg-green-50">
                  <CardTitle className="text-green-800 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Zero-Rated & Exempt Items
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
                      <span className="text-sm">Export goods & services (zero-rated)</span>
                    </div>
                    <div className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Non-oil exports</span>
                    </div>
                    <div className="text-xs text-green-700 mt-2 p-2 bg-green-100 rounded">
                      <strong>Note:</strong> Suppliers can reclaim input VAT on zero-rated supplies
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
                <CardTitle className="text-amber-800">Input VAT Recovery</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-900">Recoverable Input VAT</h4>
                    <p className="text-green-700 text-sm mt-1">
                      Businesses can claim input VAT on purchases directly related to taxable supplies.
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <h5 className="font-medium text-blue-900 text-sm">Recoverable:</h5>
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
              <h3 className="text-lg font-semibold text-green-900 mb-3">Corporate Tax Provisions</h3>
              <p className="text-green-800">
                Current corporate tax rates and NTA 2025 changes for businesses.
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
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Current Definition (2025)</h4>
                      <p className="text-blue-700 text-sm">Gross turnover ≤ ₦25 million</p>
                      <Badge className="bg-green-600 mt-2">0% CIT</Badge>
                    </div>
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <h4 className="font-semibold text-amber-900 mb-2">NTA 2025 Definition (From Jan 2026)</h4>
                      <ul className="text-amber-700 text-sm space-y-1">
                        <li>• Gross turnover ≤ <strong>₦50 million</strong></li>
                        <li>• Total fixed assets ≤ <strong>₦250 million</strong></li>
                        <li>• <strong>Both criteria must be met</strong></li>
                      </ul>
                      <Badge className="bg-green-600 mt-2">0% CIT + Exempt from Development Levy</Badge>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-800 text-sm">
                        <strong>Note:</strong> Professional service providers do not qualify as small companies under NTA 2025.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="text-blue-800 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    CIT Rates
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Current Rates (2025)</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-blue-800">Large Companies (&gt;₦100M turnover)</span>
                          <Badge className="bg-blue-600">30%</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-blue-800">Medium Companies (₦25M-₦100M)</span>
                          <Badge className="bg-blue-500">20%</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-blue-800">Small Companies (≤₦25M)</span>
                          <Badge className="bg-green-600">0%</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <h4 className="font-semibold text-amber-900 mb-2">NTA 2025 Rate (From Jan 2026)</h4>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-amber-800">Standard Rate (large/medium)</span>
                        <Badge className="bg-amber-600">25%</Badge>
                      </div>
                      <p className="text-xs text-amber-700 mt-2">Reduced from 30%</p>
                    </div>
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-purple-900">Development Levy (NTA 2025)</span>
                        <Badge className="bg-purple-600">4%</Badge>
                      </div>
                      <p className="text-purple-700 text-sm">On assessable profits. Consolidates TET, NASENI, IT Levy, Police Trust Fund</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-red-200">
              <CardHeader className="bg-red-50">
                <CardTitle className="text-red-800">Multinational Enterprise (MNE) Rules (NTA 2025)</CardTitle>
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
                <CardTitle>Development Levy Consolidation (NTA 2025)</CardTitle>
                <CardDescription>Simplification of multiple levy systems</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Previous Levies (Being Consolidated):</h4>
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
          </div>
        );

      case 'reliefs':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-6 w-6 text-emerald-600 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-emerald-900">Tax Reliefs Under Nigerian Law</h3>
                  <p className="text-emerald-800 mt-2">
                    Tax reliefs reduce your taxable income or tax liability. Understanding available reliefs helps optimize your tax position legally.
                  </p>
                </div>
              </div>
            </div>

            {/* Personal Income Tax Reliefs */}
            <Card className="border-blue-200">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-blue-800 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Personal Income Tax (PAYE) Reliefs
                </CardTitle>
                <CardDescription>Deductions available to employees and individuals</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Consolidated Relief Allowance (CRA)</h4>
                  <p className="text-sm text-gray-600 mb-2">The primary relief for all taxpayers under PITA:</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>₦200,000</strong> or <strong>1% of gross income</strong> (whichever is higher), PLUS</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>20% of gross income</strong></span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Pension Contribution Relief</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>8% of pensionable earnings</strong> (Basic + Housing + Transport allowances)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Employer contributes additional 10% (not deducted from employee)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Governed by Pension Reform Act 2014</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">National Housing Fund (NHF) Relief</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>2.5% of basic salary</strong></span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span>Mandatory for formal sector employees earning ≥ minimum wage</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Exempt: Self-employed, informal sector, organizations with &lt;5 employees</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Life Insurance Premium Relief</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Actual premium paid</strong> on life insurance policies</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Policy must be with a Nigerian insurance company</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">National Health Insurance (NHIS) Relief</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Actual contributions</strong> to approved health insurance schemes</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Rent Relief</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>20% of annual rent paid</strong></span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span>Maximum relief: <strong>₦500,000</strong> per year</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Requires evidence of rent payment (receipts, tenancy agreement)</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Corporate Income Tax Reliefs */}
            <Card className="border-purple-200">
              <CardHeader className="bg-purple-50">
                <CardTitle className="text-purple-800 flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Corporate Income Tax (CIT) Reliefs
                </CardTitle>
                <CardDescription>Deductions and incentives for companies</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Capital Allowances</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Initial Allowance:</strong> 50-95% depending on asset type (year of acquisition)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Annual Allowance:</strong> 10-25% on reducing balance</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Plant & Machinery: 50% initial, 25% annual</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Buildings: 15% initial, 10% annual</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Motor Vehicles: 50% initial, 25% annual</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Small Company Relief</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>0% CIT rate</strong> for companies with turnover ≤ ₦25 million</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>20% CIT rate</strong> for medium companies (₦25M - ₦100M turnover)</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Pioneer Status Relief</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>3-5 years tax holiday</strong> for companies in pioneer industries</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Applies to: manufacturing, agriculture, solid minerals, exports</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Requires NIPC approval and minimum investment thresholds</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Export Processing Zone Relief</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>100% tax exemption</strong> for approved enterprises in Free Trade Zones</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Exemption from all federal, state, and local taxes</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Research & Development Relief</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>20% of R&D expenditure</strong> as additional deduction</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>R&D must be conducted in Nigeria with Nigerian institutions</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Investment in Infrastructure Relief</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>30% of cost</strong> as tax credit for rural infrastructure investment</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Applies to: roads, bridges, electricity, water in rural areas</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Capital Gains Tax Reliefs */}
            <Card className="border-orange-200">
              <CardHeader className="bg-orange-50">
                <CardTitle className="text-orange-800 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Capital Gains Tax (CGT) Exemptions
                </CardTitle>
                <CardDescription>Reliefs under NTA 2025</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Small Investor Relief (Shares/Crypto)</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Full exemption</strong> when: Proceeds &lt; ₦150M AND Gains ≤ ₦10M</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Primary Residence Exemption</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Full exemption</strong> on sale of principal private residence</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Must be owner-occupied as main home</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Personal Vehicle Exemption</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Up to 2 vehicles</strong> exempt from CGT</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Personal Effects Exemption</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Full exemption</strong> when proceeds &lt; ₦5 million</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Small Company Exemption</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>0% CGT</strong> for companies with turnover ≤ ₦50 million</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Rollover Relief</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Deferral of CGT</strong> when proceeds reinvested in similar assets within 12 months</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* VAT Exemptions */}
            <Card className="border-teal-200">
              <CardHeader className="bg-teal-50">
                <CardTitle className="text-teal-800 flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  VAT Exemptions & Zero-Rated Items
                </CardTitle>
                <CardDescription>Items not subject to 7.5% VAT</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Exempt Goods</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Basic food items (unprocessed agricultural produce)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Medical and pharmaceutical products</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Educational materials (books, educational equipment)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Baby products (baby food, diapers, clothing)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Agricultural equipment and inputs</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Exempt Services</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Medical services</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Educational services (tuition fees)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Transportation services (public transport)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Residential rent</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Zero-Rated (0% VAT with Input Credit)</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Exported goods and services</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Goods supplied to diplomats and international organizations</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Humanitarian goods by approved organizations</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Important Notes */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-6 w-6 text-amber-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-amber-900">Important Notes</h3>
                  <ul className="mt-2 space-y-2 text-amber-800 text-sm">
                    <li>• Reliefs must be claimed properly with supporting documentation</li>
                    <li>• Some reliefs require pre-approval from tax authorities</li>
                    <li>• Tax laws change - verify current provisions with FIRS</li>
                    <li>• For complex situations, consult a qualified tax professional</li>
                    <li>• This information is for guidance only and does not constitute tax advice</li>
                  </ul>
                </div>
              </div>
            </div>
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
                    Critical deadlines for tax compliance
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
                        <span className="font-medium text-purple-900">WHT (FIRS)</span>
                        <Badge className="bg-purple-600">21st</Badge>
                      </div>
                      <p className="text-purple-700 text-sm">Federal withholding tax remittance</p>
                    </div>
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-orange-900">WHT (SIRS)</span>
                        <Badge className="bg-orange-600">30th</Badge>
                      </div>
                      <p className="text-orange-700 text-sm">State withholding tax remittance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="text-blue-800 flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Annual Obligations
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-green-900">Personal Income Tax Return</span>
                        <Badge className="bg-green-600">March 31</Badge>
                      </div>
                      <p className="text-green-700 text-sm">Annual tax return for individuals</p>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-blue-900">Company Tax Return</span>
                        <Badge className="bg-blue-600">6 months after year-end</Badge>
                      </div>
                      <p className="text-blue-700 text-sm">Corporate income tax returns</p>
                    </div>
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-purple-900">CIT Payment</span>
                        <Badge className="bg-purple-600">60 days after year-end</Badge>
                      </div>
                      <p className="text-purple-700 text-sm">Corporate tax payment deadline</p>
                    </div>
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-amber-900">Audited Accounts</span>
                        <Badge className="bg-amber-600">18 months after incorporation</Badge>
                      </div>
                      <p className="text-amber-700 text-sm">For new companies</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-amber-200">
              <CardHeader className="bg-amber-50">
                <CardTitle className="text-amber-800">Late Payment Penalties</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="font-medium text-red-900 text-sm">Late Filing Penalty</p>
                      <p className="text-red-700 text-xs">₦25,000 for first month + ₦5,000 per subsequent month</p>
                    </div>
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="font-medium text-red-900 text-sm">Late Payment Interest</p>
                      <p className="text-red-700 text-xs">Interest at CBN Monetary Policy Rate + spread</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="font-medium text-red-900 text-sm">WHT Non-Deduction</p>
                      <p className="text-red-700 text-xs">10% of undeducted amount + interest</p>
                    </div>
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="font-medium text-red-900 text-sm">WHT Late Remittance</p>
                      <p className="text-red-700 text-xs">10% penalty per annum + interest</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">Pro Tip: Set Reminders</p>
                  <p className="text-green-700 text-sm mt-1">
                    Mark these dates on your calendar and set reminders at least 5 business days in advance to ensure timely compliance and avoid penalties.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="grid md:grid-cols-4 gap-6">
      {/* Sidebar Navigation */}
      <div className="md:col-span-1">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle className="text-sm">Tax Library</CardTitle>
            <CardDescription className="text-xs">Nigerian Tax Information Guide</CardDescription>
          </CardHeader>
          <CardContent className="p-2">
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{section.title}</span>
                  </button>
                );
              })}
            </nav>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="md:col-span-3">
        <ScrollArea className="h-[calc(100vh-200px)]">
          {renderContent()}
        </ScrollArea>
      </div>
    </div>
  );
};

export default TaxInformation;
