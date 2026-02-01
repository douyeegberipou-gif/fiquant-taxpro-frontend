import React, { useState } from 'react';
import { 
  BookOpen, Users, Building2, TrendingUp, Percent, Shield, Calendar, FileText,
  ChevronDown, ChevronUp, Info, AlertTriangle, CheckCircle
} from 'lucide-react';
import { MobileAdBanner } from './MobileAdBanner';

const MobileTaxLibrary = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedItems, setExpandedItems] = useState(new Set(['intro']));

  const toggleExpand = (id) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'paye', label: 'PAYE', icon: Users },
    { id: 'cit', label: 'CIT', icon: Building2 },
    { id: 'cgt', label: 'CGT', icon: TrendingUp },
    { id: 'vat', label: 'VAT', icon: Percent },
    { id: 'reliefs', label: 'Reliefs', icon: Shield },
    { id: 'compliance', label: 'Compliance', icon: FileText },
    { id: 'deadlines', label: 'Deadlines', icon: Calendar },
  ];

  const glassStyle = {
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.15)'
  };

  const AccordionItem = ({ title, id, children, badge }) => (
    <div className="border-b border-white/10 last:border-b-0">
      <button
        onClick={() => toggleExpand(id)}
        className="w-full py-3 px-1 flex items-center justify-between text-left"
      >
        <span className="text-white font-medium text-sm flex items-center gap-2">
          {title}
          {badge && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 font-medium">
              {badge}
            </span>
          )}
        </span>
        {expandedItems.has(id) ? (
          <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
        )}
      </button>
      {expandedItems.has(id) && (
        <div className="pb-3 px-1 text-gray-300 text-sm leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );

  const InfoBox = ({ type = 'info', title, children }) => {
    const styles = {
      info: 'border-l-2 border-blue-400 bg-blue-500/10',
      warning: 'border-l-2 border-yellow-400 bg-yellow-500/10',
      success: 'border-l-2 border-green-400 bg-green-500/10'
    };
    return (
      <div className={`p-3 rounded-r-lg my-3 ${styles[type]}`}>
        {title && <p className="text-white font-medium text-sm mb-1">{title}</p>}
        <div className="text-gray-300 text-xs leading-relaxed">{children}</div>
      </div>
    );
  };

  const DataRow = ({ label, value, highlight }) => (
    <div className={`flex justify-between items-center py-2 px-2 ${highlight ? 'bg-yellow-500/10 rounded' : ''}`}>
      <span className="text-gray-300 text-xs">{label}</span>
      <span className={`text-xs font-medium ${highlight ? 'text-yellow-400' : 'text-white'}`}>{value}</span>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden" style={glassStyle}>
              <div className="p-3 bg-white/5">
                <AccordionItem title="NTA 2025 Effective Date" id="intro">
                  <p>The Nigeria Tax Act 2025 was signed by President Bola Tinubu on June 26, 2025. The provisions become effective <strong className="text-yellow-400">January 1, 2026</strong>. This guide covers both current law and upcoming changes.</p>
                </AccordionItem>

                <AccordionItem title="Previous Law (Pre-2026)" id="prev-law">
                  <ul className="space-y-2 text-xs">
                    <li>• <strong>VAT Rate:</strong> 7.5% (since February 2020)</li>
                    <li>• <strong>CIT (Large):</strong> 30% for turnover above ₦100M</li>
                    <li>• <strong>CIT (Medium):</strong> 20% for ₦25M-₦100M turnover</li>
                    <li>• <strong>CIT (Small):</strong> 0% for turnover ≤₦25M</li>
                    <li>• <strong>TET:</strong> 3% of assessable profits</li>
                  </ul>
                </AccordionItem>

                <AccordionItem title="NTA 2025 Key Changes" id="nta-changes" badge="NEW">
                  <ul className="space-y-2 text-xs">
                    <li>• <strong>VAT Rate:</strong> Remains at 7.5% (no change)</li>
                    <li>• <strong className="text-green-400">₦800,000</strong> annual income exempt from minimum tax</li>
                    <li>• Small company threshold: ₦50M turnover AND ₦250M fixed assets</li>
                    <li>• <strong>4% Development Levy</strong> replaces TET, NITDA, NASENI & PTF levies</li>
                    <li>• Initial capital allowances repealed; only annual allowances remain</li>
                    <li>• <strong className="text-yellow-400">Mortgage interest relief</strong> for owner-occupied property</li>
                  </ul>
                </AccordionItem>

                <AccordionItem title="NTA 2025 Tax Reliefs Summary" id="reliefs-summary">
                  <div className="space-y-2 text-xs">
                    <div className="p-2 bg-yellow-500/10 rounded">
                      <strong className="text-yellow-400">Rent Relief</strong>
                      <p className="text-gray-400">Lower of 20% of rent paid OR ₦500,000</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded">
                      <strong>Pension Relief</strong>
                      <p className="text-gray-400">Up to 20% of Gross Emolument</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded">
                      <strong>Life Assurance Premium</strong>
                      <p className="text-gray-400">Deductible on taxpayer's own life</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded">
                      <strong>NHF & NHIS Contributions</strong>
                      <p className="text-gray-400">Contributions to NHF and NHIS</p>
                    </div>
                    <div className="p-2 bg-yellow-500/10 rounded">
                      <strong className="text-yellow-400">Mortgage Interest Relief</strong>
                      <p className="text-gray-400">Interest on owner-occupied property</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded">
                      <strong>Gratuity & Pioneer Dividend</strong>
                      <p className="text-gray-400">Specific conditions apply</p>
                    </div>
                  </div>
                </AccordionItem>
              </div>
            </div>
          </div>
        );

      case 'paye':
        return (
          <div className="space-y-4">
            <InfoBox type="info" title="PAYE Overview">
              Pay-As-You-Earn (PAYE) is the method of collecting personal income tax from employees through their employers.
            </InfoBox>

            <div className="rounded-xl overflow-hidden" style={glassStyle}>
              <div className="p-3 bg-white/5 font-medium text-white text-sm border-b border-white/10">
                Personal Income Tax Rates (NTA 2025)
              </div>
              <div className="p-3">
                <DataRow label="First ₦800,000" value="0% (Tax-free)" highlight />
                <DataRow label="Next ₦2,200,000 (₦800K - ₦3M)" value="15%" />
                <DataRow label="Next ₦9,000,000 (₦3M - ₦12M)" value="18%" />
                <DataRow label="Next ₦13,000,000 (₦12M - ₦25M)" value="21%" />
                <DataRow label="Next ₦25,000,000 (₦25M - ₦50M)" value="23%" />
                <DataRow label="Above ₦50,000,000" value="25% (Maximum)" highlight />
              </div>
            </div>

            <div className="rounded-xl overflow-hidden" style={glassStyle}>
              <div className="p-3 bg-white/5 font-medium text-white text-sm border-b border-white/10">
                Tax Reliefs (NTA 2025)
              </div>
              <div className="p-3">
                <AccordionItem title="Rent Relief" id="paye-rent" badge="NTA 2025">
                  <p className="mb-2">Rent Relief replaces the former Consolidated Relief Allowance (CRA).</p>
                  <p><strong className="text-yellow-400">Amount:</strong> The lower of:</p>
                  <ul className="list-disc list-inside mt-1 text-xs">
                    <li>20% of actual rent paid, OR</li>
                    <li>₦500,000</li>
                  </ul>
                  <p className="mt-2 text-gray-400 text-xs">Documentation of rent payments is required to claim this relief.</p>
                </AccordionItem>

                <AccordionItem title="Pension Relief" id="paye-pension">
                  <p>Contributions to approved pension schemes are tax-deductible up to <strong className="text-yellow-400">20% of Gross Emolument</strong>.</p>
                  <p className="mt-2 text-gray-400 text-xs">This applies to contributions made under the Pension Reform Act to registered pension fund administrators.</p>
                </AccordionItem>

                <AccordionItem title="National Housing Fund (NHF)" id="paye-nhf">
                  <p>Contributions to the National Housing Fund are tax-deductible.</p>
                </AccordionItem>

                <AccordionItem title="Life Assurance Premium Relief" id="paye-life">
                  <p>Premiums paid on life assurance policies on the taxpayer's own life are deductible.</p>
                </AccordionItem>

                <AccordionItem title="National Health Insurance (NHIS)" id="paye-nhis">
                  <p>Contributions to the National Health Insurance Scheme are tax-deductible.</p>
                </AccordionItem>

                <AccordionItem title="Mortgage Interest Relief" id="paye-mortgage" badge="NTA 2025">
                  <p className="mb-2">Interest paid on mortgage for owner-occupied residential property is deductible, subject to:</p>
                  <ul className="list-disc list-inside text-xs space-y-1">
                    <li>Property must be <strong>solely</strong> used as residence</li>
                    <li>Interest claim must be <strong>evidenced</strong> by financial institution statement</li>
                    <li><strong>Maximum one property</strong> eligible</li>
                    <li>Property must be <strong>located in Nigeria</strong></li>
                  </ul>
                </AccordionItem>

                <AccordionItem title="Gratuity" id="paye-gratuity">
                  <p>Gratuities paid to employees upon retirement or termination may qualify for tax relief under certain conditions.</p>
                </AccordionItem>

                <AccordionItem title="Pioneer Company Dividend" id="paye-pioneer">
                  <p>Dividends received from companies enjoying pioneer status may be exempt from tax during the tax relief period.</p>
                </AccordionItem>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden" style={glassStyle}>
              <div className="p-3 bg-white/5 font-medium text-white text-sm border-b border-white/10">
                Employer Obligations
              </div>
              <div className="p-3">
                <AccordionItem title="Deduction Requirements" id="paye-deduct">
                  <ul className="list-disc list-inside text-xs space-y-1">
                    <li>Deduct PAYE from employee salaries at source</li>
                    <li>Maintain accurate payroll records</li>
                    <li>Issue tax deduction cards to employees</li>
                  </ul>
                </AccordionItem>

                <AccordionItem title="Remittance Requirements" id="paye-remit">
                  <ul className="list-disc list-inside text-xs space-y-1">
                    <li>Remit deducted tax within <strong className="text-yellow-400">10 days</strong> of payment</li>
                    <li>File monthly PAYE returns</li>
                    <li>Submit annual returns by <strong className="text-yellow-400">January 31</strong></li>
                  </ul>
                </AccordionItem>
              </div>
            </div>
          </div>
        );

      case 'cit':
        return (
          <div className="space-y-4">
            <InfoBox type="info" title="CIT Overview">
              Companies Income Tax (CIT) applies to the profits of all companies operating in Nigeria.
            </InfoBox>

            <div className="rounded-xl overflow-hidden" style={glassStyle}>
              <div className="p-3 bg-white/5 font-medium text-white text-sm border-b border-white/10">
                Company Classification & Rates (NTA 2025)
              </div>
              <div className="p-3 space-y-2">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-green-400 font-medium">Small Company</span>
                    <span className="text-green-400 font-bold text-lg">0%</span>
                  </div>
                  <p className="text-gray-400 text-xs mt-1">Turnover ≤₦50M <strong>AND</strong> Fixed Assets ≤₦250M</p>
                </div>
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-red-400 font-medium">Large/Other Company</span>
                    <span className="text-red-400 font-bold text-lg">30%</span>
                  </div>
                  <p className="text-gray-400 text-xs mt-1">Turnover &gt;₦50M OR Fixed Assets &gt;₦250M</p>
                </div>
              </div>
              <div className="p-3">
                <InfoBox type="info" title="NTA 2025 Simplification">
                  The NTA 2025 abolished the "medium company" classification. Small companies are exempt from CIT, CGT, and the 4% Development Levy. <strong>Both</strong> criteria must be met to qualify as small.
                </InfoBox>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden" style={glassStyle}>
              <div className="p-3 bg-white/5 font-medium text-white text-sm border-b border-white/10">
                Capital Allowances (NTA 2025)
              </div>
              <div className="p-3">
                <InfoBox type="warning" title="Initial Allowances Repealed">
                  Under NTA 2025, initial allowances have been repealed. Companies now claim only <strong>annual allowances</strong> on qualifying capital expenditure (straight-line basis).
                </InfoBox>

                <AccordionItem title="Annual Allowance Rates" id="cit-rates">
                  <DataRow label="Building Expenditure" value="10%" />
                  <DataRow label="Plant Expenditure" value="20%" />
                  <DataRow label="Motor Vehicle Expenditure" value="25%" />
                </AccordionItem>

                <AccordionItem title="Key Rules" id="cit-rules">
                  <ul className="list-disc list-inside text-xs space-y-1">
                    <li>Capital allowances restricted to <strong>two-thirds of assessable profits</strong> for most companies</li>
                    <li><strong>Exemptions:</strong> Manufacturing, agricultural, upstream/midstream gas sectors</li>
                    <li>Unabsorbed allowances can be carried forward</li>
                    <li>Cannot claim for assets where VAT was not charged or import duties not paid</li>
                    <li>Prorated where non-taxable income ≥10% of total income</li>
                  </ul>
                </AccordionItem>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden" style={glassStyle}>
              <div className="p-3 bg-white/5 font-medium text-white text-sm border-b border-white/10">
                Development Levy (NTA 2025)
              </div>
              <div className="p-3">
                <AccordionItem title="4% Development Levy" id="cit-levy" badge="NEW">
                  <p className="mb-2">The NTA 2025 introduces a unified <strong className="text-yellow-400">4% Development Levy</strong> on assessable profits, replacing:</p>
                  <ul className="list-disc list-inside text-xs space-y-1">
                    <li>Tertiary Education Tax (TET) - formerly 3%</li>
                    <li>NITDA Levy</li>
                    <li>NASENI Levy</li>
                    <li>Nigeria Police Trust Fund Levy</li>
                  </ul>
                  <p className="mt-2 text-xs"><strong>Exempt:</strong> Small companies, Non-resident companies</p>
                </AccordionItem>

                <AccordionItem title="Quarterly Estimated Tax Payments" id="cit-quarterly">
                  <p className="mb-2">Companies must make quarterly estimated tax payments:</p>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 bg-white/5 rounded">
                      <p className="font-bold">Q1</p>
                      <p className="text-gray-400">Mar 31</p>
                      <p className="text-yellow-400">25%</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded">
                      <p className="font-bold">Q2</p>
                      <p className="text-gray-400">Jun 30</p>
                      <p className="text-yellow-400">50%</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded">
                      <p className="font-bold">Q3</p>
                      <p className="text-gray-400">Sep 30</p>
                      <p className="text-yellow-400">75%</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded">
                      <p className="font-bold">Q4</p>
                      <p className="text-gray-400">Dec 31</p>
                      <p className="text-yellow-400">100%</p>
                    </div>
                  </div>
                </AccordionItem>
              </div>
            </div>
          </div>
        );

      case 'cgt':
        return (
          <div className="space-y-4">
            <InfoBox type="warning" title="Major CGT Changes (NTA 2025)">
              The flat 10% CGT rate has been replaced with differentiated rates: <strong>30% for companies</strong> (aligned with CIT) and <strong>progressive rates up to 25%</strong> for individuals (aligned with PIT bands).
            </InfoBox>

            <div className="rounded-xl overflow-hidden" style={glassStyle}>
              <div className="p-3 bg-white/5 font-medium text-white text-sm border-b border-white/10">
                CGT Rate Structure (NTA 2025)
              </div>
              <div className="p-3 space-y-2">
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-red-400 font-medium">Large Companies</span>
                    <span className="text-red-400 font-bold text-lg">30%</span>
                  </div>
                  <p className="text-gray-400 text-xs mt-1">Aligned with Corporate Income Tax rate</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-green-400 font-medium">Small Companies</span>
                    <span className="text-green-400 font-bold text-lg">0%</span>
                  </div>
                  <p className="text-gray-400 text-xs mt-1">Turnover ≤₦50M AND assets ≤₦250M</p>
                </div>
                <div className="p-3 bg-yellow-500/10 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-400 font-medium">Individuals (High Income)</span>
                    <span className="text-yellow-400 font-bold text-lg">Up to 25%</span>
                  </div>
                  <p className="text-gray-400 text-xs mt-1">Progressive rates based on PIT bands</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-green-400 font-medium">Individuals (≤₦800K income)</span>
                    <span className="text-green-400 font-bold text-lg">0%</span>
                  </div>
                  <p className="text-gray-400 text-xs mt-1">Fully exempt from CGT</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden" style={glassStyle}>
              <div className="p-3 bg-white/5 font-medium text-white text-sm border-b border-white/10">
                CGT Exemptions
              </div>
              <div className="p-3">
                <AccordionItem title="Small Disposals Exemption" id="cgt-small">
                  <p className="mb-2">Exempt if <strong>both</strong> conditions are met in any 12-month period:</p>
                  <ul className="list-disc list-inside text-xs space-y-1">
                    <li>Total disposal proceeds ≤ <strong className="text-yellow-400">₦150 million</strong></li>
                    <li>Total gains ≤ <strong className="text-yellow-400">₦10 million</strong></li>
                  </ul>
                  <p className="mt-2 text-gray-400 text-xs">Applies to shares and other capital assets.</p>
                </AccordionItem>

                <AccordionItem title="Reinvestment Relief" id="cgt-reinvest">
                  <p><strong className="text-green-400">Full exemption</strong> if disposal proceeds are reinvested in:</p>
                  <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                    <li>Shares of a Nigerian company</li>
                    <li>Within <strong>12 months</strong> of the disposal</li>
                  </ul>
                  <p className="mt-2 text-gray-400 text-xs">Encourages capital market participation and domestic investment.</p>
                </AccordionItem>

                <AccordionItem title="Personal Asset Exemptions" id="cgt-personal">
                  <div className="space-y-2">
                    <div className="p-2 bg-green-500/10 rounded">
                      <p className="font-medium text-green-400 text-xs">Principal Private Residence</p>
                      <p className="text-gray-400 text-xs">Owner-occupied house (once per lifetime), land ≤1 acre, not for commercial use</p>
                    </div>
                    <div className="p-2 bg-blue-500/10 rounded">
                      <p className="font-medium text-blue-400 text-xs">Personal Chattels</p>
                      <p className="text-gray-400 text-xs">Movable property valued ≤₦5 million or 3× minimum wage</p>
                    </div>
                    <div className="p-2 bg-purple-500/10 rounded">
                      <p className="font-medium text-purple-400 text-xs">Private Vehicles</p>
                      <p className="text-gray-400 text-xs">Up to <strong>2 private vehicles per year</strong></p>
                    </div>
                  </div>
                </AccordionItem>

                <AccordionItem title="Institutional Exemptions" id="cgt-institutional">
                  <ul className="list-disc list-inside text-xs space-y-1">
                    <li><strong>Pension funds</strong> – All CGT exempt</li>
                    <li><strong>REITs</strong> – Exempt if gains are reinvested</li>
                    <li><strong>Charities & religious institutions</strong></li>
                    <li><strong>Venture capital & private equity</strong> gains from labeled startups</li>
                    <li><strong>Corporate reorganizations</strong> (mergers, acquisitions)</li>
                  </ul>
                </AccordionItem>

                <AccordionItem title="Compensation Exemption" id="cgt-comp">
                  <p>Compensation for <strong>loss of employment or injury</strong> is exempt up to <strong className="text-yellow-400">₦50 million</strong> (increased from ₦10 million under old law).</p>
                </AccordionItem>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden" style={glassStyle}>
              <div className="p-3 bg-white/5 font-medium text-white text-sm border-b border-white/10">
                Scope & Special Rules
              </div>
              <div className="p-3">
                <AccordionItem title="Digital & Virtual Assets" id="cgt-digital" badge="NEW">
                  <p>NTA 2025 explicitly includes <strong className="text-yellow-400">digital and virtual assets</strong> (cryptocurrency, NFTs, etc.) within the scope of CGT. Gains from disposal of such assets are now taxable.</p>
                </AccordionItem>

                <AccordionItem title="Indirect Share Transfers" id="cgt-indirect" badge="NEW">
                  <p className="mb-2">CGT now applies to <strong>indirect transfers</strong> of Nigerian assets, including:</p>
                  <ul className="list-disc list-inside text-xs space-y-1">
                    <li>Offshore transfers of shares in foreign companies</li>
                    <li>Where &gt;50% of value derives from Nigerian assets</li>
                  </ul>
                  <p className="mt-2 text-gray-400 text-xs">Subject to applicable tax treaties.</p>
                </AccordionItem>

                <AccordionItem title="Grandfathering Provisions" id="cgt-grandfather">
                  <p className="mb-2">For assets held before January 1, 2026:</p>
                  <ul className="list-disc list-inside text-xs space-y-1">
                    <li>Cost base resets to <strong>higher of</strong>: original acquisition cost OR market value as at December 31, 2025</li>
                    <li>Pre-2026 gains taxed under old rules upon disposal</li>
                  </ul>
                  <p className="mt-2 text-gray-400 text-xs">Protects existing investments from retrospective taxation.</p>
                </AccordionItem>

                <AccordionItem title="Allowable Deductions" id="cgt-deductions">
                  <p className="mb-2">Costs deductible when calculating chargeable gains:</p>
                  <ul className="list-disc list-inside text-xs space-y-1">
                    <li>Brokerage fees and commissions</li>
                    <li>Legal fees for acquisition/disposal</li>
                    <li>Realized capital losses</li>
                    <li>Foreign exchange losses incidental to investment</li>
                    <li>Enhancement expenditure on the asset</li>
                  </ul>
                </AccordionItem>
              </div>
            </div>

            <InfoBox type="info" title="CGT Filing">
              CGT is self-assessed and must be filed within <strong>30 days</strong> of the disposal transaction. Late filing attracts penalties under NTA 2025.
            </InfoBox>
          </div>
        );

      case 'vat':
        return (
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden" style={glassStyle}>
              <div className="p-3 bg-white/5 font-medium text-white text-sm border-b border-white/10">
                VAT Rate Structure
              </div>
              <div className="p-3 grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-gray-900 rounded-lg">
                  <p className="text-2xl font-bold text-white">7.5%</p>
                  <p className="text-xs text-gray-400">Standard Rate</p>
                </div>
                <div className="p-3 bg-white/10 rounded-lg">
                  <p className="text-2xl font-bold text-white">0%</p>
                  <p className="text-xs text-gray-400">Zero-Rated</p>
                </div>
                <div className="p-3 bg-white/10 rounded-lg">
                  <p className="text-lg font-bold text-white">Exempt</p>
                  <p className="text-xs text-gray-400">VAT Exempt</p>
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs text-gray-400">The current VAT rate of 7.5% has been in effect since February 1, 2020.</p>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden" style={glassStyle}>
              <div className="p-3 bg-white/5 font-medium text-white text-sm border-b border-white/10">
                VAT-Exempt Items
              </div>
              <div className="p-3">
                <AccordionItem title="Basic Food Items" id="vat-food">
                  <ul className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                    <li>• Rice, beans, cereals</li>
                    <li>• Bread & bakery products</li>
                    <li>• Fresh fruits & vegetables</li>
                    <li>• Milk & dairy products</li>
                    <li>• Fish & meat (unprocessed)</li>
                    <li>• Cooking oils</li>
                  </ul>
                </AccordionItem>

                <AccordionItem title="Medical & Pharmaceutical" id="vat-medical">
                  <ul className="list-disc list-inside text-xs space-y-1">
                    <li>Pharmaceutical products</li>
                    <li>Medical equipment</li>
                    <li>Hospital services</li>
                    <li>Veterinary medicine</li>
                  </ul>
                </AccordionItem>

                <AccordionItem title="Educational Items" id="vat-edu">
                  <ul className="list-disc list-inside text-xs space-y-1">
                    <li>Books and educational materials</li>
                    <li>School fees and tuition</li>
                    <li>Educational equipment</li>
                  </ul>
                </AccordionItem>

                <AccordionItem title="Other Exemptions" id="vat-other">
                  <ul className="list-disc list-inside text-xs space-y-1">
                    <li>Baby products</li>
                    <li>Agricultural equipment and inputs</li>
                    <li>Commercial vehicles</li>
                    <li>All exports (zero-rated)</li>
                  </ul>
                </AccordionItem>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden" style={glassStyle}>
              <div className="p-3 bg-white/5 font-medium text-white text-sm border-b border-white/10">
                Digital Services & SEP Rules
              </div>
              <div className="p-3">
                <AccordionItem title="Significant Economic Presence (SEP)" id="vat-sep" badge="NTA 2025">
                  <p className="mb-2">Non-resident companies providing digital services to Nigerian consumers are liable to VAT:</p>
                  <div className="space-y-2 text-xs">
                    <p><strong>Covered Services:</strong></p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Streaming platforms</li>
                      <li>Digital advertising</li>
                      <li>Online marketplaces</li>
                      <li>Software subscriptions</li>
                    </ul>
                    <p className="mt-2"><strong>Registration Threshold:</strong> Annual turnover of ₦25 million+ from Nigeria</p>
                    <p className="mt-2"><strong>Key SEP Provisions:</strong></p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Non-residents taxable on Nigeria-source income (no physical presence needed)</li>
                      <li>Tax rate: <strong className="text-yellow-400">30% on profits</strong> or <strong className="text-yellow-400">minimum 4% of turnover</strong></li>
                      <li><strong>15% Minimum Effective Tax Rate (ETR)</strong> for companies with turnover &gt;₦20B</li>
                    </ul>
                  </div>
                </AccordionItem>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden" style={glassStyle}>
              <div className="p-3 bg-white/5 font-medium text-white text-sm border-b border-white/10">
                Withholding Tax (WHT)
              </div>
              <div className="p-3">
                <AccordionItem title="WHT Rates" id="vat-wht">
                  <div className="space-y-1 text-xs">
                    <DataRow label="Dividends" value="10% (Corp & Ind)" />
                    <DataRow label="Interest" value="10% (Corp & Ind)" />
                    <DataRow label="Royalties" value="10% Corp / 5% Ind" />
                    <DataRow label="Rent" value="10% (Corp & Ind)" />
                    <DataRow label="Contracts/Supplies" value="5% (Corp & Ind)" />
                    <DataRow label="Professional Services" value="10% Corp / 5% Ind" />
                    <DataRow label="Directors Fees" value="10% (Corp & Ind)" />
                  </div>
                  <p className="mt-2 text-gray-400 text-xs">WHT is an advance payment of tax. Credit is given against final tax liability when filing returns.</p>
                </AccordionItem>
              </div>
            </div>
          </div>
        );

      case 'reliefs':
        return (
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden" style={glassStyle}>
              <div className="p-3 bg-white/5 font-medium text-white text-sm border-b border-white/10">
                Personal Tax Reliefs (NTA 2025)
              </div>
              <div className="p-3">
                <AccordionItem title="Relief Rates Table" id="rel-table">
                  <div className="space-y-2 text-xs">
                    <DataRow label="Rent Relief" value="20% of rent OR ₦500K" highlight />
                    <DataRow label="Pension Relief" value="Up to 20% of Gross" />
                    <DataRow label="Life Assurance Premium" value="Actual premium paid" />
                    <DataRow label="NHF Contribution" value="Actual contribution" />
                    <DataRow label="NHIS Contribution" value="Actual contribution" />
                    <DataRow label="Gratuity" value="As applicable" />
                    <DataRow label="Mortgage Interest" value="Actual interest paid" highlight />
                    <DataRow label="Pioneer Dividend" value="Exempt during relief" />
                  </div>
                </AccordionItem>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden" style={glassStyle}>
              <div className="p-3 bg-yellow-500/10 font-medium text-yellow-400 text-sm border-b border-white/10">
                Mortgage Interest Relief Conditions
              </div>
              <div className="p-3 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">Property must be utilized <strong>solely</strong> as residence</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">Interest claim must be <strong>evidenced</strong> by financial institution statement</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300"><strong>Maximum one property</strong> eligible</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">Property must be <strong>located in Nigeria</strong></p>
                </div>
              </div>
            </div>

            <InfoBox type="success" title="₦800,000 Tax-Free Threshold">
              Under NTA 2025, persons with gross income of <strong>₦800,000 or less per annum</strong> are exempt from minimum tax.
            </InfoBox>

            <div className="rounded-xl overflow-hidden" style={glassStyle}>
              <div className="p-3 bg-white/5 font-medium text-white text-sm border-b border-white/10">
                Corporate Tax Incentives
              </div>
              <div className="p-3">
                <AccordionItem title="Pioneer Status" id="rel-pioneer">
                  <p className="mb-2">Tax holiday of 3-5 years for companies in pioneer industries:</p>
                  <ul className="list-disc list-inside text-xs space-y-1">
                    <li>Manufacturing</li>
                    <li>Agriculture and agro-processing</li>
                    <li>Mining and solid minerals</li>
                    <li>Tourism and hospitality</li>
                    <li>ICT and telecommunications</li>
                  </ul>
                </AccordionItem>

                <AccordionItem title="Export Incentives" id="rel-export">
                  <ul className="text-xs space-y-2">
                    <li><strong className="text-yellow-400">Export Expansion Grant:</strong> 10-15% of export proceeds</li>
                    <li><strong className="text-yellow-400">Export Development Fund:</strong> Financial support for export promotion</li>
                    <li><strong className="text-yellow-400">Export Processing Zones:</strong> Tax-free manufacturing for export</li>
                  </ul>
                </AccordionItem>

                <AccordionItem title="Small Company Relief" id="rel-small" badge="NTA 2025">
                  <p className="mb-2">Companies meeting <strong>both</strong> criteria are exempt from CIT, CGT, and Development Levy:</p>
                  <ul className="list-disc list-inside text-xs space-y-1">
                    <li>Annual gross turnover ≤ ₦50 million</li>
                    <li>Total fixed assets ≤ ₦250 million</li>
                  </ul>
                  <p className="mt-2 text-gray-400 text-xs">Note: Owners must still pay PIT on salaries/allowances drawn from the company.</p>
                </AccordionItem>

                <AccordionItem title="R&D Deduction" id="rel-rd">
                  <p><strong className="text-green-400">120% deduction</strong> for qualifying R&D expenditure incurred in Nigeria.</p>
                </AccordionItem>

                <AccordionItem title="Rural Investment Allowance" id="rel-rural">
                  <p className="mb-2">Additional allowance for companies providing infrastructure in rural areas:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <DataRow label="Electricity" value="50%" />
                    <DataRow label="Water" value="30%" />
                    <DataRow label="Tarred Road" value="15%" />
                    <DataRow label="Telephone" value="25%" />
                  </div>
                </AccordionItem>
              </div>
            </div>
          </div>
        );

      case 'compliance':
        return (
          <div className="space-y-4">
            <InfoBox type="info" title="Tax Compliance">
              Requirements for tax registration, filing, and maintaining compliance in Nigeria.
            </InfoBox>

            <div className="rounded-xl overflow-hidden" style={glassStyle}>
              <div className="p-3 bg-white/5 font-medium text-white text-sm border-b border-white/10">
                TIN Requirements
              </div>
              <div className="p-3">
                <AccordionItem title="Individuals" id="tin-individuals">
                  <ul className="list-disc list-inside text-xs space-y-1">
                    <li>Opening bank accounts</li>
                    <li>Registering businesses</li>
                    <li>Obtaining government contracts</li>
                    <li>Registering vehicles</li>
                    <li>Processing land transactions</li>
                  </ul>
                </AccordionItem>

                <AccordionItem title="Companies" id="tin-companies">
                  <ul className="list-disc list-inside text-xs space-y-1">
                    <li>Incorporation at CAC</li>
                    <li>Opening corporate accounts</li>
                    <li>Government tender participation</li>
                    <li>Import/export activities</li>
                    <li>Filing statutory returns</li>
                  </ul>
                </AccordionItem>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden" style={glassStyle}>
              <div className="p-3 bg-white/5 font-medium text-white text-sm border-b border-white/10">
                Filing Requirements
              </div>
              <div className="p-3">
                <AccordionItem title="Personal Income Tax" id="pit-filing">
                  <ul className="list-disc list-inside text-xs space-y-1">
                    <li><strong className="text-yellow-400">Monthly PAYE:</strong> Within 10 days of salary payment</li>
                    <li><strong className="text-yellow-400">Annual Returns:</strong> By March 31 of following year</li>
                    <li>Self-Assessment required for self-employed individuals</li>
                  </ul>
                </AccordionItem>

                <AccordionItem title="Companies Income Tax" id="cit-filing">
                  <ul className="list-disc list-inside text-xs space-y-1">
                    <li><strong>New Companies:</strong> Within 18 months of incorporation</li>
                    <li><strong>Existing Companies:</strong> Within 6 months after year-end</li>
                    <li><strong>Quarterly Payments:</strong> As per NTA 2025 schedule</li>
                  </ul>
                </AccordionItem>

                <AccordionItem title="VAT Returns" id="vat-filing">
                  <ul className="list-disc list-inside text-xs space-y-1">
                    <li><strong>Monthly Filing:</strong> By 21st of following month</li>
                    <li><strong>Electronic Filing:</strong> Mandatory via FIRS platform</li>
                    <li><strong>Retention:</strong> Keep records for minimum 6 years</li>
                  </ul>
                </AccordionItem>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden" style={glassStyle}>
              <div className="p-3 bg-red-500/10 font-medium text-red-400 text-sm border-b border-white/10">
                Penalties for Non-Compliance
              </div>
              <div className="p-3">
                <DataRow label="Late Filing" value="₦25K + ₦5K/month" />
                <DataRow label="Late Payment" value="CBN MPR + spread" />
                <DataRow label="WHT Non-Deduction" value="10% + interest" />
                <DataRow label="Failure to Register" value="₦10K + ₦2K/month" />
                <DataRow label="False Returns" value="₦50K / 3 years" highlight />
              </div>
            </div>

            <div className="rounded-xl overflow-hidden" style={glassStyle}>
              <div className="p-3 bg-white/5 font-medium text-white text-sm border-b border-white/10">
                Record Keeping
              </div>
              <div className="p-3">
                <AccordionItem title="Required Records" id="records">
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                    <p>• Books of account</p>
                    <p>• Invoices & receipts</p>
                    <p>• Bank statements</p>
                    <p>• Contracts</p>
                    <p>• Payroll records</p>
                    <p>• Asset registers</p>
                    <p>• Tax computations</p>
                    <p>• Tax correspondence</p>
                  </div>
                </AccordionItem>
              </div>
            </div>

            <InfoBox type="warning" title="Retention Period">
              All records must be kept for a minimum of <strong>6 years</strong> from the end of the relevant tax year.
            </InfoBox>
          </div>
        );

      case 'deadlines':
        return (
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden" style={glassStyle}>
              <div className="p-3 bg-white/5 font-medium text-white text-sm border-b border-white/10">
                Monthly Filing Deadlines
              </div>
              <div className="p-3 space-y-2">
                <DataRow label="PAYE Remittance" value="10th of following month" highlight />
                <DataRow label="VAT Returns" value="21st of following month" />
                <DataRow label="WHT Remittance" value="21st of following month" />
              </div>
            </div>

            <div className="rounded-xl overflow-hidden" style={glassStyle}>
              <div className="p-3 bg-white/5 font-medium text-white text-sm border-b border-white/10">
                Annual Filing Deadlines
              </div>
              <div className="p-3 space-y-2">
                <DataRow label="CIT Returns" value="6 months after year-end" />
                <DataRow label="Annual Returns (Employers)" value="January 31st" highlight />
                <DataRow label="Audited Accounts" value="6 months after year-end" />
              </div>
            </div>

            <div className="rounded-xl overflow-hidden" style={glassStyle}>
              <div className="p-3 bg-white/5 font-medium text-white text-sm border-b border-white/10">
                Other Important Deadlines
              </div>
              <div className="p-3">
                <AccordionItem title="CGT Filing" id="dead-cgt">
                  <p>CGT must be filed within <strong className="text-yellow-400">30 days</strong> of the disposal transaction.</p>
                </AccordionItem>

                <AccordionItem title="VAT Registration" id="dead-vat">
                  <p>Register within <strong>6 months</strong> of commencing business if annual turnover exceeds ₦25 million.</p>
                </AccordionItem>

                <AccordionItem title="Tax Clearance Certificate" id="dead-tcc">
                  <p>Apply at least <strong>90 days</strong> before expiration of current certificate.</p>
                </AccordionItem>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden" style={glassStyle}>
              <div className="p-3 bg-red-500/10 font-medium text-red-400 text-sm border-b border-white/10">
                Penalties for Non-Compliance
              </div>
              <div className="p-3">
                <AccordionItem title="Late Filing Penalties" id="dead-penalties">
                  <ul className="list-disc list-inside text-xs space-y-1">
                    <li><strong>Late filing:</strong> ₦25,000 first month + ₦5,000/month thereafter</li>
                    <li><strong>Late payment:</strong> Interest at CBN MPR + 5%</li>
                    <li><strong>Understatement:</strong> 10% of underpaid tax</li>
                    <li><strong>Failure to register:</strong> ₦50,000</li>
                    <li><strong>False returns:</strong> Criminal prosecution possible</li>
                  </ul>
                </AccordionItem>
              </div>
            </div>

            <InfoBox type="warning" title="Important Reminder">
              All filings should be done electronically through the FIRS TaxPro-Max platform. Keep records for at least <strong>6 years</strong> from the relevant tax year.
            </InfoBox>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      className="min-h-screen pb-24"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.9)), url('https://customer-assets.emergentagent.com/job_naija-taxcalc/artifacts/iakm5flx_Gemini_Generated_Image_k1jwlnk1jwlnk1jw%20%283%29.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="p-4 pt-40 space-y-4">
        {/* Mobile Ad Banner */}
        <MobileAdBanner placement="tax-library" />

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto gap-2 pb-2 -mx-4 px-4 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-all flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-yellow-500 text-black'
                    : 'bg-white/10 text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="mt-4">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default MobileTaxLibrary;
