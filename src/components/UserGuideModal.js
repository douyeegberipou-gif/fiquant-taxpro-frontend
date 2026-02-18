import React from 'react';
import { X, Calculator, FileText, CheckCircle, ArrowRight, HelpCircle } from 'lucide-react';

/**
 * UserGuideModal - Shows a simple walkthrough for using each calculator
 */
const UserGuideModal = ({ isOpen, onClose, calculatorType = 'PAYE' }) => {
  if (!isOpen) return null;

  const guides = {
    PAYE: {
      title: 'PAYE Calculator Guide',
      description: 'Calculate your Pay-As-You-Earn tax for employment income',
      steps: [
        { title: 'Enter Your Income', description: 'Input your gross monthly or annual salary in the "Basic Salary" field' },
        { title: 'Add Allowances', description: 'Enter allowances like housing, transport, meal, utility, and medical' },
        { title: 'Include Deductions', description: 'Add pension contributions, NHF, insurance premiums, and other reliefs' },
        { title: 'Calculate', description: 'Click "Calculate Tax" to see your PAYE breakdown with tax bands and net pay' }
      ],
      tips: [
        'NTA 2025 rates apply: 0% on first ₦800K, then 15%-25% progressive',
        'Pension contributions (up to 20%) are tax-deductible',
        'NHF (2.5%) and NHIS deductions reduce taxable income'
      ]
    },
    PAYE_BULK: {
      title: 'Bulk PAYE Calculator Guide',
      description: 'Process payroll tax calculations for multiple employees at once',
      steps: [
        { title: 'Choose Input Method', description: 'Select Manual Entry to add employees one by one, or Upload to import from a file' },
        { title: 'Manual Entry', description: 'Click "Add Employee" and fill in name, basic salary, and allowances for each staff member' },
        { title: 'File Upload', description: 'Download the template, fill in employee data in Excel/CSV, then upload the completed file' },
        { title: 'Review & Calculate', description: 'Verify the employee list, then click "Calculate All" to process the entire payroll' },
        { title: 'Download Results', description: 'Export the results as PDF or Excel for your records and filing' }
      ],
      tips: [
        'Download the template first to ensure correct data format',
        'Supported formats: CSV, Excel (.xlsx)',
        'You can edit individual entries after upload before calculating',
        'Pro/Premium users can process unlimited employees'
      ]
    },
    CIT: {
      title: 'CIT Calculator Guide',
      description: 'Calculate Company Income Tax for your business',
      steps: [
        { title: 'Company Details', description: 'Enter your company name, TIN, and annual turnover to determine company size' },
        { title: 'Revenue & Income', description: 'Input your gross income/revenue and any other income sources' },
        { title: 'Deductible Expenses', description: 'Enter staff costs, rent, professional fees, depreciation, and interest paid' },
        { title: 'Capital Allowances', description: 'Add costs of new assets and written-down values of existing assets' },
        { title: 'WHT Credits', description: 'Enter any withholding tax already deducted to offset your CIT liability' }
      ],
      tips: [
        'Small companies (≤₦50M turnover): 0% CIT rate',
        'Medium companies (₦50M-₦500M): 20% CIT rate',
        'Large companies (>₦500M): 30% CIT rate',
        'Development levy of 4% applies on assessable profit'
      ]
    },
    VAT: {
      title: 'VAT Calculator Guide',
      description: 'Calculate Value Added Tax for your business transactions',
      steps: [
        { title: 'Business Info', description: 'Enter your company name, TIN, and select the return period (month)' },
        { title: 'Add Transactions', description: 'Click "Add Transaction" for each invoice or sale you need to report' },
        { title: 'Select Type', description: 'Choose the transaction type - Standard (7.5%), Exempt (0%), or Zero-rated' },
        { title: 'Enter Amount', description: 'Input the transaction amount. VAT is auto-calculated for standard-rated items' }
      ],
      tips: [
        'Standard rate is 7.5% on taxable goods and services',
        'Medical, educational, and basic food items are VAT exempt',
        'Exports and diplomatic purchases are zero-rated',
        'VAT returns are due by the 21st of the following month'
      ]
    },
    CGT: {
      title: 'CGT Calculator Guide',
      description: 'Calculate Capital Gains Tax on asset disposals',
      steps: [
        { title: 'Select Asset Type', description: 'Choose from Crypto, Shares, Property, or Business Assets tabs' },
        { title: 'Taxpayer Info', description: 'Enter your name, TIN, and select Individual or Company status' },
        { title: 'Transaction Details', description: 'Input purchase price, sale price, quantities, and relevant dates' },
        { title: 'Add Costs', description: 'Include transaction fees, legal fees, and improvement costs to reduce your gain' }
      ],
      tips: [
        'Individuals: Progressive rates 0-25% based on gain amount',
        'Companies: 30% flat rate (0% for small companies ≤₦50M turnover)',
        'Share sales: Exempt if proceeds <₦150M AND gains ≤₦10M',
        'Private residence sales may qualify for exemption'
      ]
    }
  };

  const guide = guides[calculatorType] || guides.PAYE;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60"
        style={{ backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-lg mx-auto rounded-2xl overflow-hidden max-h-[85vh] overflow-y-auto"
        style={{
          backdropFilter: 'blur(16px)',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.95) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 px-5 py-4 border-b border-white/10" style={{ background: 'rgba(30, 41, 59, 0.98)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/fiquant-logo-bold-diamond.png" 
                alt="Fiquant" 
                className="w-8 h-8 object-contain"
              />
              <div>
                <h2 className="text-lg font-semibold text-white">{guide.title}</h2>
                <p className="text-xs text-gray-400">{guide.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Steps */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-400" />
              How to Use
            </h3>
            <div className="space-y-3">
              {guide.steps.map((step, index) => (
                <div 
                  key={index} 
                  className="flex gap-3 p-3 rounded-lg"
                  style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                >
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-400">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{step.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Quick Tips
            </h3>
            <ul className="space-y-2">
              {guide.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer CTA */}
          <div 
            className="p-4 rounded-xl text-center"
            style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}
          >
            <p className="text-sm text-gray-300 mb-2">
              Need more help? Check our Tax Library for detailed explanations.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Got it, let's calculate!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserGuideModal;
