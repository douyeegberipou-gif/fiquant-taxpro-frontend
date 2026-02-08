import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useAds } from '../contexts/AdContext';
import { 
  BookOpen,
  Calculator,
  Calendar,
  Building2,
  Users,
  FileText,
  Scale,
  Clock,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Info,
  Percent,
  Wallet,
  Shield,
  TrendingUp,
  Globe
} from 'lucide-react';

const TaxInformation = ({ initialSection = null }) => {
  const [activeTab, setActiveTab] = useState(initialSection || 'overview');
  const [expandedSection, setExpandedSection] = useState(null);
  const { canShowAds } = useAds();
  
  // Update active tab when initialSection prop changes
  React.useEffect(() => {
    if (initialSection) {
      setActiveTab(initialSection);
    }
  }, [initialSection]);
  
  // Determine if sidebar ads should be shown (only for free/unauthenticated users)
  const showSidebarAds = canShowAds();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'paye', label: 'PAYE & Personal', icon: Users },
    { id: 'corporate', label: 'Corporate Tax', icon: Building2 },
    { id: 'cgt', label: 'Capital Gains', icon: TrendingUp },
    { id: 'vat', label: 'VAT & Indirect', icon: Percent },
    { id: 'reliefs', label: 'Reliefs & Allowances', icon: Shield },
    { id: 'compliance', label: 'Compliance', icon: FileText },
    { id: 'deadlines', label: 'Deadlines', icon: Calendar }
  ];

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Professional accordion component
  const AccordionItem = ({ title, children, id, badge = null }) => (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between py-4 px-1 text-left hover:bg-gray-50/50 transition-colors"
      >
        <span className="font-medium text-gray-900 flex items-center gap-2">
          {title}
          {badge && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-normal">
              {badge}
            </span>
          )}
        </span>
        <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${expandedSection === id ? 'rotate-90' : ''}`} />
      </button>
      {expandedSection === id && (
        <div className="pb-4 px-1 text-gray-600 text-sm leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );

  // Info box component
  const InfoBox = ({ type = 'info', title, children }) => {
    const styles = {
      info: 'border-l-4 border-l-gray-900 bg-gray-50',
      warning: 'border-l-4 border-l-amber-500 bg-amber-50/50',
      success: 'border-l-4 border-l-emerald-500 bg-emerald-50/50',
      note: 'border-l-4 border-l-blue-500 bg-blue-50/50'
    };
    const icons = {
      info: <Info className="h-4 w-4 text-gray-700" />,
      warning: <AlertCircle className="h-4 w-4 text-amber-600" />,
      success: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
      note: <BookOpen className="h-4 w-4 text-blue-600" />
    };
    
    return (
      <div className={`${styles[type]} rounded-r-lg p-4 my-4`}>
        <div className="flex items-start gap-3">
          {icons[type]}
          <div>
            {title && <p className="font-medium text-gray-900 mb-1">{title}</p>}
            <div className="text-sm text-gray-700">{children}</div>
          </div>
        </div>
      </div>
    );
  };

  // Data table component
  const DataTable = ({ headers, rows, highlight = null }) => (
    <div className="overflow-x-auto my-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-gray-900">
            {headers.map((h, i) => (
              <th key={i} className="text-left py-3 px-4 font-semibold text-gray-900 bg-gray-50">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={`border-b border-gray-100 ${highlight === i ? 'bg-amber-50' : 'hover:bg-gray-50'}`}>
              {row.map((cell, j) => (
                <td key={j} className="py-3 px-4 text-gray-700">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Nigerian Tax Framework</h2>
              <p className="text-gray-600">A comprehensive guide to taxation in Nigeria, covering the Nigeria Tax Act (NTA) 2025 and current regulations.</p>
            </div>

            <InfoBox type="warning" title="NTA 2025 Effective Date">
              The Nigeria Tax Act 2025 was signed by President Bola Tinubu on June 26, 2025. 
              The provisions become <strong>effective January 1, 2026</strong>. This guide covers both current law and upcoming changes.
            </InfoBox>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border border-gray-200 shadow-none">
                <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                  <CardTitle className="text-base font-semibold text-gray-900">Previous Law (Pre-2026)</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-baseline gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-900 mt-1.5 flex-shrink-0"></span>
                      <span><strong>VAT Rate:</strong> 7.5% (since February 2020)</span>
                    </li>
                    <li className="flex items-baseline gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-900 mt-1.5 flex-shrink-0"></span>
                      <span><strong>CIT (Large):</strong> 30% for turnover above ₦100M</span>
                    </li>
                    <li className="flex items-baseline gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-900 mt-1.5 flex-shrink-0"></span>
                      <span><strong>CIT (Medium):</strong> 20% for ₦25M-₦100M turnover</span>
                    </li>
                    <li className="flex items-baseline gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-900 mt-1.5 flex-shrink-0"></span>
                      <span><strong>CIT (Small):</strong> 0% for turnover ≤₦25M</span>
                    </li>
                    <li className="flex items-baseline gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-900 mt-1.5 flex-shrink-0"></span>
                      <span><strong>TET:</strong> 3% of assessable profits</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border border-amber-200 shadow-none">
                <CardHeader className="border-b border-amber-100 bg-amber-50/30">
                  <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    NTA 2025 Key Changes
                    <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">From Jan 2026</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-baseline gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></span>
                      <span><strong>VAT Rate:</strong> Remains at 7.5% (no change)</span>
                    </li>
                    <li className="flex items-baseline gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></span>
                      <span>₦800,000 annual income exempt from minimum tax</span>
                    </li>
                    <li className="flex items-baseline gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></span>
                      <span>Small company threshold: ₦50M turnover AND ₦250M fixed assets</span>
                    </li>
                    <li className="flex items-baseline gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></span>
                      <span>4% Development Levy replaces TET, NITDA, NASENI & PTF levies</span>
                    </li>
                    <li className="flex items-baseline gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></span>
                      <span>Initial capital allowances repealed; only annual allowances remain</span>
                    </li>
                    <li className="flex items-baseline gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></span>
                      <span>Mortgage interest relief for owner-occupied property</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="border border-gray-200 shadow-none">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-base font-semibold text-gray-900">NTA 2025 Tax Reliefs Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="font-medium text-gray-900 mb-1">Rent Relief</p>
                    <p className="text-gray-600">Lower of 20% of rent paid OR ₦500,000</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900 mb-1">Pension Relief</p>
                    <p className="text-gray-600">Up to 20% of Gross Emolument</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900 mb-1">Life Assurance Premium</p>
                    <p className="text-gray-600">Deductible on taxpayer's own life</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900 mb-1">NHF & NHIS Contributions</p>
                    <p className="text-gray-600">Contributions to NHF and NHIS</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="font-medium text-gray-900 mb-1">Mortgage Interest Relief</p>
                    <p className="text-gray-600">Interest on owner-occupied property</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900 mb-1">Gratuity & Pioneer Dividend</p>
                    <p className="text-gray-600">Specific conditions apply</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'paye':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">PAYE & Personal Income Tax</h2>
              <p className="text-gray-600">Pay-As-You-Earn (PAYE) is the method of collecting personal income tax from employees through their employers.</p>
            </div>

            <Card className="border border-gray-200 shadow-none">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-base font-semibold text-gray-900">Personal Income Tax Rates (NTA 2025)</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <DataTable 
                  headers={['Annual Taxable Income', 'Rate', 'Cumulative Range']}
                  rows={[
                    ['First ₦800,000', '0%', 'Tax-free'],
                    ['Next ₦2,200,000', '15%', '₦800,001 - ₦3,000,000'],
                    ['Next ₦9,000,000', '18%', '₦3,000,001 - ₦12,000,000'],
                    ['Next ₦13,000,000', '21%', '₦12,000,001 - ₦25,000,000'],
                    ['Next ₦25,000,000', '23%', '₦25,000,001 - ₦50,000,000'],
                    ['Above ₦50,000,000', '25%', 'Maximum Rate']
                  ]}
                />
                <InfoBox type="info" title="Key Changes">
                  The first <strong>₦800,000</strong> per annum is tax-exempt. High earners are subject to a maximum rate of <strong>25%</strong>.
                </InfoBox>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-none">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-base font-semibold text-gray-900">Tax Reliefs (NTA 2025)</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <AccordionItem title="Rent Relief" id="rent-relief" badge="NTA 2025">
                  <p className="mb-3">Rent Relief replaces the former Consolidated Relief Allowance (CRA).</p>
                  <p className="font-medium text-gray-900">Amount: The <strong>lower of</strong>:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 mt-2">
                    <li>20% of actual rent paid, OR</li>
                    <li>₦500,000</li>
                  </ul>
                  <p className="mt-3 text-gray-600">Documentation of rent payments is required to claim this relief.</p>
                </AccordionItem>
                <AccordionItem title="Pension Relief" id="pension">
                  <p>Contributions to approved pension schemes are tax-deductible up to <strong>20% of Gross Emolument</strong>.</p>
                  <p className="mt-2 text-gray-600">This applies to contributions made under the Pension Reform Act to registered pension fund administrators.</p>
                </AccordionItem>
                <AccordionItem title="National Housing Fund (NHF) Contribution" id="nhf">
                  <p>Contributions to the National Housing Fund are tax-deductible.</p>
                </AccordionItem>
                <AccordionItem title="Life Assurance Premium Relief" id="life-ins">
                  <p>Premiums paid on life assurance policies on the taxpayer's own life are deductible.</p>
                </AccordionItem>
                <AccordionItem title="National Health Insurance Scheme (NHIS)" id="nhis">
                  <p>Contributions to the National Health Insurance Scheme are tax-deductible.</p>
                </AccordionItem>
                <AccordionItem title="Interest on Owner-Occupied Residential Property" id="mortgage" badge="NTA 2025">
                  <p className="mb-3">A person is entitled to a deduction of interest paid on mortgage for an owner-occupied residential property, subject to the following conditions:</p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>The property must be utilized <strong>solely</strong> as the person's place of residence</li>
                    <li>The interest claim must be <strong>evidenced by a statement</strong> from the financial institution</li>
                    <li>A <strong>maximum of one property</strong> shall be eligible for this deduction</li>
                    <li>The property must be <strong>located in Nigeria</strong></li>
                  </ul>
                </AccordionItem>
                <AccordionItem title="Gratuity" id="gratuity">
                  <p>Gratuities paid to employees upon retirement or termination of employment may qualify for tax relief under certain conditions.</p>
                </AccordionItem>
                <AccordionItem title="Dividend from Pioneer Company" id="pioneer-dividend">
                  <p>Dividends received from companies enjoying pioneer status may be exempt from tax during the tax relief period.</p>
                </AccordionItem>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-none">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-base font-semibold text-gray-900">Employer Obligations</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-sm space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Deduction Requirements</h4>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Deduct PAYE from employee salaries at source</li>
                      <li>• Maintain accurate payroll records</li>
                      <li>• Issue tax deduction cards to employees</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Remittance Requirements</h4>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Remit deducted tax within 10 days of payment</li>
                      <li>• File monthly PAYE returns</li>
                      <li>• Submit annual returns by January 31</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'corporate':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Corporate Income Tax</h2>
              <p className="text-gray-600">Companies Income Tax (CIT) applies to the profits of all companies operating in Nigeria.</p>
            </div>

            <Card className="border border-gray-200 shadow-none">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-base font-semibold text-gray-900">Company Classification & Rates</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <DataTable 
                  headers={['Classification', 'Criteria (NTA 2025)', 'CIT Rate']}
                  rows={[
                    ['Small Company', 'Turnover ≤ ₦50M AND Fixed Assets ≤ ₦250M', '0%'],
                    ['Large/Other Company', 'Turnover > ₦50M OR Fixed Assets > ₦250M', '30%']
                  ]}
                />
                <InfoBox type="info" title="NTA 2025 Simplification">
                  The NTA 2025 abolished the "medium company" classification. Companies are now classified as either <strong>Small</strong> (0% CIT) or <strong>Large/Other</strong> (30% CIT). Small companies are exempt from CIT, Capital Gains Tax (CGT), and the 4% Development Levy. Both criteria (turnover ≤ ₦50M <strong>AND</strong> total fixed assets ≤ ₦250M) must be met to qualify as a small company.
                </InfoBox>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-none">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-base font-semibold text-gray-900">Capital Allowances (NTA 2025)</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <InfoBox type="warning" title="Initial Allowances Repealed">
                  Under NTA 2025, initial allowances have been repealed. Companies now claim only <strong>annual allowances</strong> on qualifying capital expenditure, calculated on a straight-line basis.
                </InfoBox>
                <DataTable 
                  headers={['Qualifying Expenditure', 'Annual Allowance Rate']}
                  rows={[
                    ['Building Expenditure', '10%'],
                    ['Plant Expenditure', '20%'],
                    ['Motor Vehicle Expenditure', '25%']
                  ]}
                />
                <div className="mt-4 space-y-3 text-sm">
                  <h4 className="font-medium text-gray-900">Key Rules</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Capital allowances are restricted to <strong>two-thirds of assessable profits</strong> for most companies</li>
                    <li>• <strong>Exemptions from restriction:</strong> Manufacturing, agricultural, and upstream/midstream gas sectors</li>
                    <li>• Unabsorbed allowances can be carried forward to subsequent years</li>
                    <li>• Allowances cannot be claimed for assets where VAT was not charged or import duties not paid</li>
                    <li>• Prorated where non-taxable income constitutes 10% or more of total income</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-none">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-base font-semibold text-gray-900">Development Levy (NTA 2025)</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-sm">
                <p className="text-gray-700 mb-3">The NTA 2025 introduces a unified <strong>4% Development Levy</strong> on assessable profits, consolidating and replacing several previous levies:</p>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Levies Replaced</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Tertiary Education Tax (TET) - formerly 3%</li>
                      <li>• NITDA Levy</li>
                      <li>• NASENI Levy</li>
                      <li>• Nigeria Police Trust Fund Levy</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Exemptions</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Small companies (turnover ≤₦50M AND fixed assets ≤₦250M)</li>
                      <li>• Non-resident companies</li>
                    </ul>
                  </div>
                </div>
                <InfoBox type="info" title="Simplification Benefit">
                  This consolidation simplifies compliance by replacing multiple levies with a single 4% charge, reducing administrative burden for businesses.
                </InfoBox>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-none">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-base font-semibold text-gray-900">Quarterly Estimated Tax Payments</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-sm">
                <p className="text-gray-700 mb-4">Under NTA 2025, companies must make quarterly estimated tax payments:</p>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { q: 'Q1', date: 'March 31', pct: '25%' },
                    { q: 'Q2', date: 'June 30', pct: '50%' },
                    { q: 'Q3', date: 'Sept 30', pct: '75%' },
                    { q: 'Q4', date: 'Dec 31', pct: '100%' }
                  ].map(item => (
                    <div key={item.q} className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="font-semibold text-gray-900">{item.q}</p>
                      <p className="text-xs text-gray-500">{item.date}</p>
                      <p className="text-sm text-amber-600 font-medium">{item.pct}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'cgt':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Capital Gains Tax (CGT)</h2>
              <p className="text-gray-600">Taxation on profits from the disposal of capital assets under NTA 2025.</p>
            </div>

            <Card className="border border-gray-200 shadow-none">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-base font-semibold text-gray-900">CGT Rate Structure (NTA 2025)</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <InfoBox type="info" title="Major Change">
                  The NTA 2025 replaced the flat 10% CGT rate with differentiated rates: <strong>30% for companies</strong> (aligned with CIT) and <strong>progressive rates up to 25%</strong> for individuals (aligned with PIT bands).
                </InfoBox>

                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="py-3 px-4 text-left font-semibold text-gray-900">Taxpayer Type</th>
                        <th className="py-3 px-4 text-left font-semibold text-gray-900">CGT Rate</th>
                        <th className="py-3 px-4 text-left font-semibold text-gray-900">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">Large Companies</td>
                        <td className="py-3 px-4"><Badge className="bg-red-100 text-red-700">30%</Badge></td>
                        <td className="py-3 px-4 text-gray-600">Aligned with Corporate Income Tax rate</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">Small Companies</td>
                        <td className="py-3 px-4"><Badge className="bg-green-100 text-green-700">0%</Badge></td>
                        <td className="py-3 px-4 text-gray-600">Turnover ≤₦50M AND assets ≤₦250M</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">Individuals (High Income)</td>
                        <td className="py-3 px-4"><Badge className="bg-amber-100 text-amber-700">Up to 25%</Badge></td>
                        <td className="py-3 px-4 text-gray-600">Progressive rates based on PIT bands</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium">Individuals (≤₦800K income)</td>
                        <td className="py-3 px-4"><Badge className="bg-green-100 text-green-700">0%</Badge></td>
                        <td className="py-3 px-4 text-gray-600">Fully exempt from CGT</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-none">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-base font-semibold text-gray-900">CGT Exemptions</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <AccordionItem title="Small Disposals Exemption" id="cgt-small">
                  <div className="space-y-2">
                    <p>Exempt if <strong>both</strong> conditions are met in any 12-month period:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Total disposal proceeds ≤ <strong>₦150 million</strong></li>
                      <li>Total gains ≤ <strong>₦10 million</strong></li>
                    </ul>
                    <p className="text-gray-500 mt-2">Applies to shares and other capital assets.</p>
                  </div>
                </AccordionItem>

                <AccordionItem title="Reinvestment Relief" id="cgt-reinvest">
                  <div className="space-y-2">
                    <p><strong>Full exemption</strong> if disposal proceeds are reinvested in:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Shares of a Nigerian company</li>
                      <li>Within <strong>12 months</strong> of the disposal</li>
                    </ul>
                    <p className="text-gray-500 mt-2">This encourages capital market participation and domestic investment.</p>
                  </div>
                </AccordionItem>

                <AccordionItem title="Personal Asset Exemptions" id="cgt-personal">
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="font-medium text-green-800">Principal Private Residence</p>
                      <ul className="list-disc pl-6 text-green-700 text-sm mt-1">
                        <li>Owner-occupied house (once per lifetime)</li>
                        <li>Land not exceeding 1 acre</li>
                        <li>Must not be used for commercial purposes</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="font-medium text-blue-800">Personal Chattels</p>
                      <ul className="list-disc pl-6 text-blue-700 text-sm mt-1">
                        <li>Movable property valued ≤ ₦5 million</li>
                        <li>Or 3× the national minimum wage</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="font-medium text-purple-800">Private Vehicles</p>
                      <ul className="list-disc pl-6 text-purple-700 text-sm mt-1">
                        <li>Up to <strong>2 private vehicles per year</strong></li>
                      </ul>
                    </div>
                  </div>
                </AccordionItem>

                <AccordionItem title="Institutional Exemptions" id="cgt-institutional">
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Pension funds</strong> – All CGT exempt</li>
                    <li><strong>REITs</strong> – Exempt if gains are reinvested</li>
                    <li><strong>Charities & religious institutions</strong></li>
                    <li><strong>Venture capital & private equity</strong> gains from labeled startups</li>
                    <li><strong>Corporate reorganizations</strong> (mergers, acquisitions)</li>
                  </ul>
                </AccordionItem>

                <AccordionItem title="Compensation Exemption" id="cgt-compensation">
                  <p>Compensation for <strong>loss of employment or injury</strong> is exempt up to <strong>₦50 million</strong> (increased from ₦10 million under the old law).</p>
                </AccordionItem>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-none">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-base font-semibold text-gray-900">Scope & Special Rules</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <AccordionItem title="Digital & Virtual Assets" id="cgt-digital" badge="NEW">
                  <p>NTA 2025 explicitly includes <strong>digital and virtual assets</strong> (cryptocurrency, NFTs, etc.) within the scope of CGT. Gains from disposal of such assets are now taxable.</p>
                </AccordionItem>

                <AccordionItem title="Indirect Share Transfers" id="cgt-indirect" badge="NEW">
                  <div className="space-y-2">
                    <p>CGT now applies to <strong>indirect transfers</strong> of Nigerian assets, including:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Offshore transfers of shares in foreign companies</li>
                      <li>Where &gt;50% of value derives from Nigerian assets</li>
                    </ul>
                    <p className="text-gray-500 mt-2">Subject to applicable tax treaties.</p>
                  </div>
                </AccordionItem>

                <AccordionItem title="Grandfathering Provisions" id="cgt-grandfather">
                  <div className="space-y-2">
                    <p>For assets held before January 1, 2026:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Cost base resets to <strong>higher of</strong>: original acquisition cost OR market value as at December 31, 2025</li>
                      <li>Pre-2026 gains taxed under old rules upon disposal</li>
                    </ul>
                    <p className="text-gray-500 mt-2">This protects existing investments from retrospective taxation.</p>
                  </div>
                </AccordionItem>

                <AccordionItem title="Allowable Deductions" id="cgt-deductions">
                  <p>The following costs can be deducted when calculating chargeable gains:</p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>Brokerage fees and commissions</li>
                    <li>Legal fees for acquisition/disposal</li>
                    <li>Realized capital losses</li>
                    <li>Foreign exchange losses incidental to the investment</li>
                    <li>Enhancement expenditure on the asset</li>
                  </ul>
                </AccordionItem>
              </CardContent>
            </Card>

            <InfoBox type="note" title="CGT Filing">
              CGT is typically self-assessed and must be filed within <strong>30 days</strong> of the disposal transaction. Late filing attracts penalties under NTA 2025.
            </InfoBox>
          </div>
        );

      case 'vat':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">VAT & Indirect Taxes</h2>
              <p className="text-gray-600">Value Added Tax and other consumption-based taxes in Nigeria.</p>
            </div>

            <Card className="border border-gray-200 shadow-none">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-base font-semibold text-gray-900">VAT Rate Structure</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="p-4 bg-gray-900 text-white rounded-lg text-center">
                    <p className="text-3xl font-bold">7.5%</p>
                    <p className="text-sm text-gray-300">Standard Rate</p>
                  </div>
                  <div className="p-4 bg-gray-100 rounded-lg text-center">
                    <p className="text-3xl font-bold text-gray-900">0%</p>
                    <p className="text-sm text-gray-600">Zero-Rated</p>
                  </div>
                  <div className="p-4 bg-gray-100 rounded-lg text-center">
                    <p className="text-3xl font-bold text-gray-900">Exempt</p>
                    <p className="text-sm text-gray-600">VAT Exempt</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">The current VAT rate of 7.5% has been in effect since February 1, 2020.</p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-none">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-base font-semibold text-gray-900">VAT-Exempt Items</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <AccordionItem title="Basic Food Items" id="food">
                  <ul className="grid md:grid-cols-2 gap-x-4 gap-y-1 text-gray-700">
                    <li>• Rice, beans, cereals</li>
                    <li>• Bread and similar bakery products</li>
                    <li>• Fresh fruits and vegetables</li>
                    <li>• Milk and dairy products</li>
                    <li>• Fish and meat (unprocessed)</li>
                    <li>• Cooking oils</li>
                  </ul>
                </AccordionItem>
                <AccordionItem title="Medical & Pharmaceutical" id="medical">
                  <ul className="space-y-1 text-gray-700">
                    <li>• Pharmaceutical products</li>
                    <li>• Medical equipment</li>
                    <li>• Hospital services</li>
                    <li>• Veterinary medicine</li>
                  </ul>
                </AccordionItem>
                <AccordionItem title="Educational Items" id="educational">
                  <ul className="space-y-1 text-gray-700">
                    <li>• Books and educational materials</li>
                    <li>• School fees and tuition</li>
                    <li>• Educational equipment</li>
                  </ul>
                </AccordionItem>
                <AccordionItem title="Other Exemptions" id="other-exempt">
                  <ul className="space-y-1 text-gray-700">
                    <li>• Baby products</li>
                    <li>• Agricultural equipment and inputs</li>
                    <li>• Commercial vehicles</li>
                    <li>• All exports (zero-rated)</li>
                  </ul>
                </AccordionItem>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-none">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-base font-semibold text-gray-900">Digital Services & Significant Economic Presence (SEP)</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-sm">
                <p className="text-gray-700 mb-3">Non-resident companies providing digital services to Nigerian consumers are liable to VAT. The NTA 2025 expands taxation through <strong>Significant Economic Presence (SEP)</strong> rules.</p>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Covered Services</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Streaming platforms</li>
                      <li>• Digital advertising</li>
                      <li>• Online marketplaces</li>
                      <li>• Software subscriptions</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">VAT Registration Threshold</h4>
                    <p className="text-gray-600">Non-resident companies with annual turnover of ₦25 million or more from Nigeria must register for VAT.</p>
                  </div>
                </div>
                <InfoBox type="info" title="SEP Rules (NTA 2025)">
                  <div className="space-y-2">
                    <p><strong>Key SEP Provisions:</strong></p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Non-residents are taxable on Nigeria-source income even without physical presence</li>
                      <li>Services paid from Nigeria are taxable, even if performed outside Nigeria</li>
                      <li>Tax rate: <strong>30% on profits</strong> or <strong>minimum 4% of turnover</strong>, whichever is higher</li>
                      <li><strong>15% Minimum Effective Tax Rate (ETR)</strong> applies to companies with turnover &gt;₦20B or MNE groups with global turnover ≥€750M</li>
                    </ul>
                  </div>
                </InfoBox>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-none">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-base font-semibold text-gray-900">Withholding Tax (WHT)</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <DataTable 
                  headers={['Payment Type', 'Corporate Rate', 'Individual Rate']}
                  rows={[
                    ['Dividends', '10%', '10%'],
                    ['Interest', '10%', '10%'],
                    ['Royalties', '10%', '5%'],
                    ['Rent', '10%', '10%'],
                    ['Contracts/Supplies', '5%', '5%'],
                    ['Professional Services', '10%', '5%'],
                    ['Directors Fees', '10%', '10%']
                  ]}
                />
                <InfoBox type="info">
                  WHT is an advance payment of tax. Credit is given against final tax liability when filing returns.
                </InfoBox>
              </CardContent>
            </Card>
          </div>
        );

      case 'reliefs':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tax Reliefs & Allowances</h2>
              <p className="text-gray-600">Available deductions and incentives to reduce tax liability under the NTA 2025.</p>
            </div>

            <Card className="border border-gray-200 shadow-none">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-base font-semibold text-gray-900">Personal Tax Reliefs (NTA 2025)</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <DataTable 
                  headers={['Relief Type', 'Amount/Rate', 'Conditions']}
                  rows={[
                    ['Rent Relief', 'Lower of 20% of rent paid OR ₦500,000', 'Replaces CRA under NTA 2025'],
                    ['Pension Relief', 'Up to 20% of Gross Emolument', 'Contributions to approved pension schemes'],
                    ['Life Assurance Premium', 'Actual premium paid', 'Policy on taxpayer\'s own life'],
                    ['National Housing Fund (NHF)', 'Actual contribution', 'Contributions to NHF'],
                    ['National Health Insurance (NHIS)', 'Actual contribution', 'Contributions to NHIS'],
                    ['Gratuity', 'As applicable', 'On retirement or termination'],
                    ['Interest on Owner-Occupied Property', 'Actual interest paid', 'See conditions below'],
                    ['Dividend from Pioneer Company', 'Exempt during relief period', 'Company must have pioneer status']
                  ]}
                />
              </CardContent>
            </Card>

            <Card className="border border-amber-200 shadow-none">
              <CardHeader className="border-b border-amber-100 bg-amber-50/30">
                <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  Interest on Owner-Occupied Residential Property
                  <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">NTA 2025</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-sm">
                <p className="text-gray-700 mb-4">A person is entitled to a deduction of interest paid on mortgage for an owner-occupied residential property, subject to the following conditions:</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p>The property must be utilized <strong>solely</strong> as the person's place of residence</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p>The interest claim must be <strong>evidenced by a statement</strong> from the financial institution</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p>A <strong>maximum of one property</strong> shall be eligible for this deduction</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p>The property must be <strong>located in Nigeria</strong></p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-none">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-base font-semibold text-gray-900">Tax-Free Threshold (NTA 2025)</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-sm">
                <InfoBox type="success" title="₦800,000 Annual Threshold">
                  Under the NTA 2025, persons with gross income of <strong>₦800,000 or less per annum</strong> are exempt from minimum tax. 
                  This provides significant relief for low-income earners.
                </InfoBox>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-none">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-base font-semibold text-gray-900">Corporate Tax Incentives</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <AccordionItem title="Pioneer Status" id="pioneer">
                  <p className="mb-2">Tax holiday of 3-5 years for companies engaged in pioneer industries including:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Manufacturing</li>
                    <li>Agriculture and agro-processing</li>
                    <li>Mining and solid minerals</li>
                    <li>Tourism and hospitality</li>
                    <li>ICT and telecommunications</li>
                  </ul>
                </AccordionItem>
                <AccordionItem title="Export Incentives" id="export">
                  <ul className="space-y-2 text-gray-700">
                    <li><strong>Export Expansion Grant:</strong> 10-15% of export proceeds</li>
                    <li><strong>Export Development Fund:</strong> Financial support for export promotion</li>
                    <li><strong>Export Processing Zones:</strong> Tax-free manufacturing for export</li>
                  </ul>
                </AccordionItem>
                <AccordionItem title="Small Company Relief (NTA 2025)" id="small-biz">
                  <p>Companies meeting <strong>both</strong> criteria are exempt from CIT, CGT, and the Development Levy:</p>
                  <ul className="list-disc list-inside space-y-1 mt-2 text-gray-700">
                    <li>Annual gross turnover ≤ ₦50 million</li>
                    <li>Total fixed assets ≤ ₦250 million</li>
                  </ul>
                  <p className="mt-2 text-gray-600">Note: Owners must still pay Personal Income Tax (PIT) on salaries or allowances drawn from the company.</p>
                </AccordionItem>
                <AccordionItem title="Research & Development" id="rd">
                  <p>120% deduction for qualifying R&D expenditure incurred in Nigeria.</p>
                </AccordionItem>
                <AccordionItem title="Rural Investment Allowance" id="rural">
                  <p>15-100% additional allowance for companies providing infrastructure in rural areas:</p>
                  <ul className="list-disc list-inside space-y-1 mt-2 text-gray-700">
                    <li>Electricity: 50%</li>
                    <li>Water: 30%</li>
                    <li>Tarred Road: 15%</li>
                    <li>Telephone: 25%</li>
                  </ul>
                </AccordionItem>
              </CardContent>
            </Card>

            <Card className="border border-amber-200 shadow-none">
              <CardHeader className="border-b border-amber-100 bg-amber-50/30">
                <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  NTA 2025 Relief Changes
                  <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">From Jan 2026</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-sm space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p><strong>₦800,000 Tax-Free Threshold:</strong> Persons with gross income ≤₦800,000/year exempt from minimum tax</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p><strong>Mortgage Interest Relief:</strong> Interest on owner-occupied residential property now deductible</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p><strong>Pioneer Dividend Relief:</strong> Dividends from pioneer companies exempt during relief period</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'compliance':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tax Compliance</h2>
              <p className="text-gray-600">Requirements for tax registration, filing, and maintaining compliance.</p>
            </div>

            <Card className="border border-gray-200 shadow-none">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-base font-semibold text-gray-900">TIN Requirements</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-sm">
                <p className="text-gray-700 mb-4">A Tax Identification Number (TIN) is mandatory for:</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Individuals</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Opening bank accounts</li>
                      <li>• Registering businesses</li>
                      <li>• Obtaining government contracts</li>
                      <li>• Registering vehicles</li>
                      <li>• Processing land transactions</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Companies</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Incorporation at CAC</li>
                      <li>• Opening corporate accounts</li>
                      <li>• Government tender participation</li>
                      <li>• Import/export activities</li>
                      <li>• Filing statutory returns</li>
                    </ul>
                  </div>
                </div>
                <InfoBox type="info" title="JTB TIN Verification">
                  Verify TIN status through the Joint Tax Board portal: jtb.gov.ng
                </InfoBox>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-none">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-base font-semibold text-gray-900">Filing Requirements</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <AccordionItem title="Personal Income Tax" id="pit-filing">
                  <ul className="space-y-2 text-gray-700">
                    <li><strong>Monthly PAYE:</strong> Within 10 days of salary payment</li>
                    <li><strong>Annual Returns:</strong> By March 31 of the following year</li>
                    <li><strong>Self-Assessment:</strong> Required for self-employed individuals</li>
                  </ul>
                </AccordionItem>
                <AccordionItem title="Companies Income Tax" id="cit-filing">
                  <ul className="space-y-2 text-gray-700">
                    <li><strong>New Companies:</strong> Within 18 months of incorporation</li>
                    <li><strong>Existing Companies:</strong> Within 6 months after accounting year-end</li>
                    <li><strong>Quarterly Payments:</strong> As per schedule (NTA 2025)</li>
                  </ul>
                </AccordionItem>
                <AccordionItem title="VAT Returns" id="vat-filing">
                  <ul className="space-y-2 text-gray-700">
                    <li><strong>Monthly Filing:</strong> By 21st of the following month</li>
                    <li><strong>Electronic Filing:</strong> Mandatory via FIRS platform</li>
                    <li><strong>Retention:</strong> Keep records for minimum 6 years</li>
                  </ul>
                </AccordionItem>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-none">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-base font-semibold text-gray-900">Penalties for Non-Compliance</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <DataTable 
                  headers={['Offense', 'Penalty']}
                  rows={[
                    ['Late Filing', '₦25,000 first month + ₦5,000 per subsequent month'],
                    ['Late Payment', 'Interest at CBN MPR + spread'],
                    ['WHT Non-Deduction', '10% of undeducted amount + interest'],
                    ['WHT Late Remittance', '10% penalty per annum + interest'],
                    ['Failure to Register', '₦10,000 first month + ₦2,000 per month'],
                    ['False Returns', 'Up to ₦50,000 fine and/or 3 years imprisonment']
                  ]}
                />
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-none">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-base font-semibold text-gray-900">Record Keeping</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-sm">
                <p className="text-gray-700 mb-4">Taxpayers must maintain the following records:</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-gray-600">
                    <li>• Books of account</li>
                    <li>• Invoices and receipts</li>
                    <li>• Bank statements</li>
                    <li>• Contracts and agreements</li>
                  </ul>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Payroll records</li>
                    <li>• Asset registers</li>
                    <li>• Tax computation files</li>
                    <li>• Correspondence with tax authorities</li>
                  </ul>
                </div>
                <InfoBox type="warning" title="Retention Period">
                  All records must be kept for a minimum of <strong>6 years</strong> from the end of the relevant tax year.
                </InfoBox>
              </CardContent>
            </Card>
          </div>
        );

      case 'deadlines':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tax Deadlines & Calendar</h2>
              <p className="text-gray-600">Key dates for tax filings and payments throughout the year.</p>
            </div>

            <Card className="border border-gray-200 shadow-none">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-base font-semibold text-gray-900">Monthly Obligations</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <DataTable 
                  headers={['Obligation', 'Due Date', 'Applicable To']}
                  rows={[
                    ['PAYE Remittance', '10th of following month', 'Employers'],
                    ['VAT Returns & Payment', '21st of following month', 'VAT-registered businesses'],
                    ['WHT Remittance', '21st of following month', 'Agents required to withhold']
                  ]}
                />
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-none">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-base font-semibold text-gray-900">Annual Deadlines</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  {[
                    { month: 'January', items: [{ name: 'Employer Annual PAYE Returns', date: 'January 31' }] },
                    { month: 'March', items: [
                      { name: 'Personal Income Tax Returns', date: 'March 31' },
                      { name: 'Q1 Estimated Tax Payment (NTA 2025)', date: 'March 31', new: true }
                    ]},
                    { month: 'June', items: [
                      { name: 'CIT Returns (December year-end)', date: 'June 30' },
                      { name: 'Q2 Estimated Tax Payment (NTA 2025)', date: 'June 30', new: true }
                    ]},
                    { month: 'September', items: [
                      { name: 'Q3 Estimated Tax Payment (NTA 2025)', date: 'September 30', new: true }
                    ]},
                    { month: 'December', items: [
                      { name: 'Q4 Estimated Tax Payment (NTA 2025)', date: 'December 31', new: true }
                    ]}
                  ].map((period) => (
                    <div key={period.month} className="border-l-2 border-gray-200 pl-4">
                      <h4 className="font-semibold text-gray-900 mb-2">{period.month}</h4>
                      <div className="space-y-2">
                        {period.items.map((item, i) => (
                          <div key={i} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700 flex items-center gap-2">
                              {item.name}
                              {item.new && <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">NTA 2025</Badge>}
                            </span>
                            <span className="font-medium text-gray-900">{item.date}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-none">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-base font-semibold text-gray-900">Late Payment Consequences</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Late Filing</h4>
                    <p className="text-sm text-gray-600">₦25,000 for first month, plus ₦5,000 for each subsequent month</p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Late Payment</h4>
                    <p className="text-sm text-gray-600">Interest at CBN Monetary Policy Rate plus applicable spread</p>
                  </div>
                </div>
                <InfoBox type="success" title="Pro Tip">
                  Set calendar reminders at least 5 business days before each deadline to ensure timely compliance and avoid penalties.
                </InfoBox>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Black with white text like Bulk PAYE */}
      <div className="bg-white rounded-t-2xl shadow-sm border border-gray-100 overflow-hidden mx-4 mt-4">
        <div className="bg-gradient-to-r from-gray-900 to-black text-white px-8 py-6">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-yellow-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Tax Library</h1>
              <p className="text-sm text-gray-300">Nigerian Tax Information Guide</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className={`flex-1 min-w-0 ${showSidebarAds ? 'max-w-4xl' : 'max-w-6xl'}`}>
            {renderContent()}
          </div>
          
          {/* Right Sidebar Ad - Only shown to free/unauthenticated users */}
          {showSidebarAds && (
            <div className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-24">
                {/* 
                  ============================================
                  GOOGLE ADSENSE / PAID ADS PLACEHOLDER
                  ============================================
                  Replace these placeholder ads with actual ad code:
                  
                  For Google AdSense:
                  <ins className="adsbygoogle"
                       style={{ display: 'block' }}
                       data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                       data-ad-slot="XXXXXXXXXX"
                       data-ad-format="auto"
                       data-full-width-responsive="true">
                  </ins>
                  
                  For other ad networks, insert their respective ad code here.
                  
                  IMPORTANT: Ads are automatically hidden for:
                  - Pro subscribers
                  - Premium subscribers  
                  - Enterprise subscribers
                  - Admin users
                  ============================================
                */}
                
                {/* Primary Ad Slot - Sidebar Rectangle (300x250 or responsive) */}
                <div 
                  className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-lg"
                  data-ad-slot="sidebar-primary"
                  data-ad-format="rectangle"
                >
                  <div className="text-xs font-medium uppercase tracking-wider text-blue-200 mb-3">Sponsored</div>
                  <h3 className="text-lg font-bold mb-2">Professional Tax Services</h3>
                  <p className="text-sm text-blue-100 mb-4">
                    Expert tax consultation, filing, and audit support for individuals and businesses.
                  </p>
                  <ul className="text-sm text-blue-100 space-y-2 mb-4">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-300" />
                      <span>NTA 2025 Compliance</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-300" />
                      <span>Tax Planning & Advisory</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-300" />
                      <span>FIRS Representation</span>
                    </li>
                  </ul>
                  <a 
                    href="#contact" 
                    className="block w-full text-center bg-white text-blue-700 font-semibold py-2.5 px-4 rounded-lg hover:bg-blue-50 transition-colors"
                    data-ad-click="sidebar-primary-cta"
                  >
                    Get Started
                  </a>
                </div>
                
                {/* Secondary Ad Slot - Smaller format */}
                <div 
                  className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-5"
                  data-ad-slot="sidebar-secondary"
                  data-ad-format="small-rectangle"
                >
                  <div className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-3">Advertisement</div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Calculator className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">Tax Calculator Pro</h4>
                      <p className="text-xs text-gray-500">Upgrade for more features</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Unlock advanced analytics, bulk calculations, and priority support.
                  </p>
                  <a 
                    href="#pricing" 
                    className="text-sm font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1"
                    data-ad-click="sidebar-secondary-cta"
                  >
                    View Plans
                    <ChevronRight className="h-4 w-4" />
                  </a>
                </div>
                
                {/* Ad-free upgrade prompt */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-400">
                    <a href="#pricing" className="hover:text-gray-600 underline">Upgrade to Pro</a> for ad-free experience
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-gray-50/50 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <p className="text-xs text-gray-500 text-center">
            This information is provided for general guidance only. For specific tax advice, please consult a qualified tax professional.
            Information last updated January 2026.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TaxInformation;
