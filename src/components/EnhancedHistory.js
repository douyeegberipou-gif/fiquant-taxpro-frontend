import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card.jsx';
import { Badge } from './ui/badge.jsx';
import { Button } from './ui/button.jsx';
import { 
  Users, 
  Building2, 
  ChevronRight, 
  Printer, 
  DollarSign,
  FileText,
  Eye,
  History as HistoryIcon,
  Calendar
} from 'lucide-react';
import { generatePayeReport, generateCitReport } from '../utils/pdfGenerator';
import UpgradePrompt from './UpgradePrompt';
import { useUpgrade } from '../hooks/useUpgrade';

const EnhancedHistory = ({ history, citHistory, formatCurrency, hasFeature }) => {
  const [expandedItems, setExpandedItems] = useState(new Set());
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

  const toggleExpanded = (id, type) => {
    const itemKey = `${type}-${id}`;
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemKey)) {
        newSet.delete(itemKey);
      } else {
        newSet.add(itemKey);
      }
      return newSet;
    });
  };

  const isExpanded = (id, type) => {
    return expandedItems.has(`${type}-${id}`);
  };

  const handlePrintPAYE = (calculation) => {
    if (!hasFeature || !hasFeature('pdf_export')) {
      setShowUpgradePrompt(true);
      return;
    }
    
    try {
      // Reconstruct taxInput with all fields the calculator uses
      const taxInput = {
        staff_name: calculation.staff_name || 'Historical Calculation',
        tin: calculation.tin || '',
        month: calculation.month || new Date(calculation.timestamp).toLocaleDateString('en-US', { month: 'long' }),
        year: calculation.year || new Date(calculation.timestamp).getFullYear().toString(),
        state_of_residence: calculation.state_of_residence || 'Not specified',
        tax_authority: calculation.tax_authority || '',
        basic_salary: calculation.basic_salary || 0,
        transport_allowance: calculation.transport_allowance || 0,
        housing_allowance: calculation.housing_allowance || 0,
        meal_allowance: calculation.meal_allowance || 0,
        utility_allowance: calculation.utility_allowance || 0,
        medical_allowance: calculation.medical_allowance || 0,
        other_allowances: calculation.other_allowances || 0,
        bik_vehicle_value: calculation.bik_vehicle_value || 0,
        bik_housing_value: calculation.bik_housing_value || 0,
        bonus: calculation.bonus || 0,
        pension_contribution: calculation.pension_contribution || 0,
        nhf_contribution: calculation.nhf_contribution || 0,
        nhf_applicable: calculation.nhf_applicable !== false,
        life_insurance_premium: calculation.life_insurance_premium || 0,
        health_insurance_premium: calculation.health_insurance_premium || 0,
        nhis_contribution: calculation.nhis_contribution || 0,
        annual_rent: calculation.annual_rent || 0,
        mortgage_interest: calculation.mortgage_interest || 0
      };

      // Calculate annual values from monthly if not present
      const annualTax = calculation.tax_due || calculation.annual_tax || (calculation.monthly_tax * 12);
      const annualNet = calculation.net_annual_income || calculation.annual_net_income || (calculation.monthly_net_income * 12);

      // The result object for PDF generation - match exact field names expected by pdfGenerator
      const result = {
        monthly_gross_income: calculation.monthly_gross_income,
        annual_gross_income: calculation.annual_gross_income,
        total_reliefs: calculation.total_reliefs,
        taxable_income: calculation.taxable_income,
        tax_due: annualTax,
        monthly_tax: calculation.monthly_tax,
        effective_tax_rate: calculation.effective_tax_rate,
        net_annual_income: annualNet,
        monthly_net_income: calculation.monthly_net_income,
        // Tax breakdown for the PDF bands section
        tax_breakdown: calculation.tax_breakdown || calculation.tax_bands || [],
        // Relief breakdown values
        cra_relief: calculation.cra_relief || 0,
        pension_relief: calculation.pension_relief || 0,
        nhf_relief: calculation.nhf_relief || 0,
        nhis_relief: calculation.nhis_relief || 0,
        life_insurance_relief: calculation.life_insurance_relief || 0,
        health_insurance_relief: calculation.health_insurance_relief || 0,
        rent_relief: calculation.rent_relief || 0,
        mortgage_interest_relief: calculation.mortgage_interest_relief || 0
      };

      generatePayeReport(taxInput, result);
    } catch (error) {
      console.error('Error generating PAYE report:', error);
      alert('Failed to generate PDF report. Please try again.');
    }
  };

  const handlePrintCIT = (calculation) => {
    if (!hasFeature || !hasFeature('pdf_export')) {
      setShowUpgradePrompt(true);
      return;
    }
    
    try {
      const citInput = {
        company_name: calculation.company_name || 'Historical Calculation',
        year_of_assessment: calculation.year_of_assessment || new Date(calculation.timestamp).getFullYear().toString(),
        tax_year: calculation.tax_year || new Date(calculation.timestamp).getFullYear().toString(),
        annual_turnover: calculation.annual_turnover || 0,
        total_fixed_assets: calculation.total_fixed_assets || 0,
        gross_income: calculation.gross_income || 0,
        other_income: calculation.other_income || 0,
        cost_of_goods_sold: calculation.cost_of_goods_sold || 0,
        staff_costs: calculation.staff_costs || 0,
        rent_expenses: calculation.rent_expenses || 0,
        professional_fees: calculation.professional_fees || 0,
        depreciation: calculation.depreciation || 0,
        interest_paid_unrelated: calculation.interest_paid_unrelated || 0,
        interest_paid_related: calculation.interest_paid_related || 0,
        other_deductible_expenses: calculation.other_deductible_expenses || 0,
        entertainment_expenses: calculation.entertainment_expenses || 0,
        fines_penalties: calculation.fines_penalties || 0,
        personal_expenses: calculation.personal_expenses || 0,
        excessive_interest: calculation.excessive_interest || 0,
        other_non_deductible: calculation.other_non_deductible || 0,
        carry_forward_losses: calculation.carry_forward_losses || 0,
        buildings_cost: calculation.buildings_cost || 0,
        furniture_fittings_cost: calculation.furniture_fittings_cost || 0,
        plant_machinery_cost: calculation.plant_machinery_cost || 0,
        motor_vehicle_cost: calculation.motor_vehicle_cost || 0,
        computer_equipment_cost: calculation.computer_equipment_cost || 0,
        wht_on_dividends: calculation.wht_on_dividends || 0,
        wht_on_interest: calculation.wht_on_interest || 0,
        wht_on_rent: calculation.wht_on_rent || 0,
        wht_on_contracts: calculation.wht_on_contracts || 0,
        other_wht_credits: calculation.other_wht_credits || 0,
        is_professional_service: calculation.is_professional_service || false,
        is_multinational: calculation.is_multinational || false
      };

      generateCitReport(citInput, calculation);
    } catch (error) {
      console.error('Error generating CIT report:', error);
      alert('Failed to generate PDF report. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Accordion Item component matching Tax Library style
  const AccordionItem = ({ calculation, expanded, onToggle, onPrint, isPAYE }) => (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 px-4 text-left hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPAYE ? 'bg-emerald-100' : 'bg-blue-100'}`}>
            {isPAYE ? (
              <Users className={`h-4 w-4 ${isPAYE ? 'text-emerald-600' : 'text-blue-600'}`} />
            ) : (
              <Building2 className="h-4 w-4 text-blue-600" />
            )}
          </div>
          <div>
            <span className="font-medium text-gray-900">
              {isPAYE 
                ? (calculation.staff_name || 'PAYE Calculation')
                : (calculation.company_name || 'CIT Calculation')
              }
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-500">{formatDate(calculation.timestamp)}</span>
              <Badge 
                className={`text-[10px] px-1.5 py-0 ${isPAYE ? 'bg-emerald-100 text-emerald-700 border-0' : 'bg-blue-100 text-blue-700 border-0'}`}
              >
                {calculation.type}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900">
              {isPAYE ? formatCurrency(calculation.monthly_tax) : formatCurrency(calculation.total_tax_due)}
            </p>
            <p className="text-xs text-gray-500">{isPAYE ? 'Monthly Tax' : 'Total Tax'}</p>
          </div>
          <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </div>
      </button>
      {expanded && (
        <div className="pb-4 px-4">
          {isPAYE ? (
            <div className="space-y-4">
              {/* Staff Information */}
              <div className="grid md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Staff Name</p>
                  <p className="text-sm font-medium text-gray-900">{calculation.staff_name || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Month</p>
                  <p className="text-sm font-medium text-gray-900">{calculation.month || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">State of Residence</p>
                  <p className="text-sm font-medium text-gray-900">{calculation.state_of_residence || 'Not specified'}</p>
                </div>
              </div>

              {/* Income & Deductions Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-900">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 bg-gray-50">Income Component</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900 bg-gray-50">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-700">Basic Salary</td>
                      <td className="py-3 px-4 text-gray-700 text-right">{formatCurrency(calculation.basic_salary || (calculation.annual_basic_salary / 12) || 0)}</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-700">Transport Allowance</td>
                      <td className="py-3 px-4 text-gray-700 text-right">{formatCurrency(calculation.transport_allowance || (calculation.annual_transport_allowance / 12) || 0)}</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-700">Housing Allowance</td>
                      <td className="py-3 px-4 text-gray-700 text-right">{formatCurrency(calculation.housing_allowance || (calculation.annual_housing_allowance / 12) || 0)}</td>
                    </tr>
                    {(calculation.meal_allowance > 0 || calculation.annual_meal_allowance > 0) && (
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-700">Meal Allowance</td>
                        <td className="py-3 px-4 text-gray-700 text-right">{formatCurrency(calculation.meal_allowance || (calculation.annual_meal_allowance / 12) || 0)}</td>
                      </tr>
                    )}
                    {(calculation.utility_allowance > 0 || calculation.annual_utility_allowance > 0) && (
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-700">Utility Allowance</td>
                        <td className="py-3 px-4 text-gray-700 text-right">{formatCurrency(calculation.utility_allowance || (calculation.annual_utility_allowance / 12) || 0)}</td>
                      </tr>
                    )}
                    {(calculation.medical_allowance > 0 || calculation.annual_medical_allowance > 0) && (
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-700">Medical Allowance</td>
                        <td className="py-3 px-4 text-gray-700 text-right">{formatCurrency(calculation.medical_allowance || (calculation.annual_medical_allowance / 12) || 0)}</td>
                      </tr>
                    )}
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-700">Other Allowances</td>
                      <td className="py-3 px-4 text-gray-700 text-right">{formatCurrency(calculation.other_allowances || (calculation.annual_other_allowances / 12) || 0)}</td>
                    </tr>
                    <tr className="border-b border-gray-100 bg-emerald-50">
                      <td className="py-3 px-4 font-medium text-gray-900">Monthly Gross Income</td>
                      <td className="py-3 px-4 font-medium text-gray-900 text-right">{formatCurrency(calculation.monthly_gross_income)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Reliefs Section */}
              {(calculation.pension_relief > 0 || calculation.nhf_relief > 0 || calculation.life_insurance_relief > 0 || 
                calculation.health_insurance_relief > 0 || calculation.nhis_relief > 0 || calculation.rent_relief > 0 ||
                calculation.mortgage_interest_relief > 0 || calculation.total_reliefs > 0) && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-emerald-600">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 bg-emerald-50">Tax Reliefs Applied</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900 bg-emerald-50">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculation.pension_relief > 0 && (
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-4 text-gray-700">Pension Relief (8%)</td>
                          <td className="py-2 px-4 text-gray-700 text-right">{formatCurrency(calculation.pension_relief)}</td>
                        </tr>
                      )}
                      {calculation.nhf_relief > 0 && (
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-4 text-gray-700">NHF Relief (2.5%)</td>
                          <td className="py-2 px-4 text-gray-700 text-right">{formatCurrency(calculation.nhf_relief)}</td>
                        </tr>
                      )}
                      {calculation.nhis_relief > 0 && (
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-4 text-gray-700">NHIS Relief</td>
                          <td className="py-2 px-4 text-gray-700 text-right">{formatCurrency(calculation.nhis_relief)}</td>
                        </tr>
                      )}
                      {calculation.life_insurance_relief > 0 && (
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-4 text-gray-700">Life Insurance Relief</td>
                          <td className="py-2 px-4 text-gray-700 text-right">{formatCurrency(calculation.life_insurance_relief)}</td>
                        </tr>
                      )}
                      {calculation.health_insurance_relief > 0 && (
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-4 text-gray-700">Health Insurance Relief</td>
                          <td className="py-2 px-4 text-gray-700 text-right">{formatCurrency(calculation.health_insurance_relief)}</td>
                        </tr>
                      )}
                      {calculation.rent_relief > 0 && (
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-4 text-gray-700">Rent Relief</td>
                          <td className="py-2 px-4 text-gray-700 text-right">{formatCurrency(calculation.rent_relief)}</td>
                        </tr>
                      )}
                      {calculation.mortgage_interest_relief > 0 && (
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-4 text-gray-700">Mortgage Interest Relief</td>
                          <td className="py-2 px-4 text-gray-700 text-right">{formatCurrency(calculation.mortgage_interest_relief)}</td>
                        </tr>
                      )}
                      <tr className="bg-emerald-100">
                        <td className="py-3 px-4 font-medium text-gray-900">Total Reliefs</td>
                        <td className="py-3 px-4 font-medium text-gray-900 text-right">{formatCurrency(calculation.total_reliefs)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tax Results */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-900 text-white rounded-lg">
                  <p className="text-sm text-gray-300 mb-1">Monthly Tax</p>
                  <p className="text-2xl font-bold">{formatCurrency(calculation.monthly_tax)}</p>
                </div>
                <div className="p-4 bg-emerald-600 text-white rounded-lg">
                  <p className="text-sm text-emerald-100 mb-1">Monthly Net Income</p>
                  <p className="text-2xl font-bold">{formatCurrency(calculation.monthly_net_income)}</p>
                </div>
              </div>

              {/* Annual Summary */}
              <div className="border-l-4 border-l-gray-900 bg-gray-50 rounded-r-lg p-4">
                <p className="font-medium text-gray-900 mb-2">Annual Summary</p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Annual Gross</p>
                    <p className="font-medium">{formatCurrency(calculation.annual_gross_income)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Annual Tax</p>
                    <p className="font-medium text-red-600">{formatCurrency(calculation.tax_due || calculation.annual_tax || (calculation.monthly_tax * 12))}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Annual Net</p>
                    <p className="font-medium text-emerald-600">{formatCurrency(calculation.net_annual_income || calculation.annual_net_income || (calculation.monthly_net_income * 12))}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Company Information */}
              <div className="grid md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Company Name</p>
                  <p className="text-sm font-medium text-gray-900">{calculation.company_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Year of Assessment</p>
                  <p className="text-sm font-medium text-gray-900">{calculation.year_of_assessment || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Company Size</p>
                  <Badge className="bg-blue-100 text-blue-700 border-0">{calculation.company_size || 'Standard'}</Badge>
                </div>
              </div>

              {/* Financial Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-900">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 bg-gray-50">Item</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900 bg-gray-50">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-700">Annual Turnover</td>
                      <td className="py-3 px-4 text-gray-700 text-right">{formatCurrency(calculation.annual_turnover)}</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-700">Gross Income</td>
                      <td className="py-3 px-4 text-gray-700 text-right">{formatCurrency(calculation.gross_income)}</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-700">Total Deductions</td>
                      <td className="py-3 px-4 text-gray-700 text-right">{formatCurrency(calculation.total_deductions)}</td>
                    </tr>
                    <tr className="border-b border-gray-100 bg-blue-50">
                      <td className="py-3 px-4 font-medium text-gray-900">Taxable Profit</td>
                      <td className="py-3 px-4 font-medium text-gray-900 text-right">{formatCurrency(calculation.taxable_profit)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Tax Results */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-900 text-white rounded-lg">
                  <p className="text-sm text-gray-300 mb-1">CIT Due</p>
                  <p className="text-2xl font-bold">{formatCurrency(calculation.cit_due)}</p>
                </div>
                <div className="p-4 bg-red-600 text-white rounded-lg">
                  <p className="text-sm text-red-100 mb-1">Total Tax Due</p>
                  <p className="text-2xl font-bold">{formatCurrency(calculation.total_tax_due)}</p>
                </div>
              </div>

              {/* Additional Details */}
              {(calculation.capital_allowances_total > 0 || calculation.wht_credits_total > 0) && (
                <div className="border-l-4 border-l-blue-500 bg-blue-50/50 rounded-r-lg p-4">
                  <p className="font-medium text-gray-900 mb-2">Additional Details</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {calculation.capital_allowances_total > 0 && (
                      <div>
                        <p className="text-gray-500">Capital Allowances</p>
                        <p className="font-medium text-emerald-600">{formatCurrency(calculation.capital_allowances_total)}</p>
                      </div>
                    )}
                    {calculation.wht_credits_total > 0 && (
                      <div>
                        <p className="text-gray-500">WHT Credits</p>
                        <p className="font-medium text-emerald-600">{formatCurrency(calculation.wht_credits_total)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Print Button */}
          <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
            <Button
              onClick={onPrint}
              className="bg-gray-900 hover:bg-gray-800 text-white"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Report
              {hasFeature && !hasFeature('pdf_export') && (
                <Badge className="ml-2 text-[10px] px-1.5 py-0 bg-amber-100 text-amber-700 border-0">
                  PRO+
                </Badge>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  if (history.length === 0 && citHistory.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-gray-200 bg-gray-50/50">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center">
                <HistoryIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Calculation History</h1>
                <p className="text-sm text-gray-500">Review your past tax calculations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Calculation History</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Your tax calculations will appear here. Start by using the PAYE or CIT calculators.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Combine and sort all history by timestamp
  const allHistory = [
    ...history.map(item => ({ ...item, type: 'PAYE' })),
    ...citHistory.map(item => ({ ...item, type: 'CIT' }))
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Group by date
  const groupedHistory = allHistory.reduce((groups, item) => {
    const date = new Date(item.timestamp).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {});

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Black with white text like Bulk PAYE */}
      <div className="bg-white rounded-t-2xl shadow-sm border border-gray-100 overflow-hidden mx-4 mt-4">
        <div className="bg-gradient-to-r from-gray-900 to-black text-white px-8 py-6">
          <div className="flex items-center gap-3">
            <HistoryIcon className="h-6 w-6 text-yellow-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Calculation History</h1>
              <p className="text-sm text-gray-300">Review and reprint your past tax calculations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-gray-600">PAYE Calculations:</span>
              <span className="font-medium text-gray-900">{history.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-gray-600">CIT Calculations:</span>
              <span className="font-medium text-gray-900">{citHistory.length}</span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Total: {allHistory.length} calculations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {Object.entries(groupedHistory).map(([date, calculations]) => (
            <Card key={date} className="border border-gray-200 shadow-none">
              <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {date}
                  <Badge className="bg-gray-200 text-gray-700 border-0 text-xs ml-2">
                    {calculations.length} calculation{calculations.length !== 1 ? 's' : ''}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {calculations.map((calculation) => (
                  <AccordionItem
                    key={`${calculation.type}-${calculation.id}`}
                    calculation={calculation}
                    expanded={isExpanded(calculation.id, calculation.type)}
                    onToggle={() => toggleExpanded(calculation.id, calculation.type)}
                    onPrint={() => calculation.type === 'PAYE' 
                      ? handlePrintPAYE(calculation) 
                      : handlePrintCIT(calculation)
                    }
                    isPAYE={calculation.type === 'PAYE'}
                  />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-gray-50/50 mt-8">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <p className="text-xs text-gray-500 text-center">
            Click on any calculation to view detailed breakdown and print reports.
            History is stored securely in your account.
          </p>
        </div>
      </div>

      {/* Upgrade Prompt */}
      {showUpgradePrompt && (
        <UpgradePrompt
          type="feature"
          feature="pdf_export"
          onUpgrade={handleUpgrade}
          onTrial={handleTrial}
          onClose={() => setShowUpgradePrompt(false)}
        />
      )}
    </div>
  );
};

export default EnhancedHistory;
