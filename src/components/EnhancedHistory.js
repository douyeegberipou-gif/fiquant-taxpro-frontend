import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.jsx';
import { Badge } from './ui/badge.jsx';
import { Button } from './ui/button.jsx';
import { Separator } from './ui/separator.jsx';
import { 
  Users, 
  Building2, 
  ChevronDown, 
  ChevronUp, 
  Printer, 
  Calendar,
  DollarSign,
  FileText,
  Eye,
  History as HistoryIcon
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
    // Check if user has PDF export feature
    if (!hasFeature || !hasFeature('pdf_export')) {
      setShowUpgradePrompt(true);
      return;
    }
    
    try {
      // Reconstruct the tax input from the calculation history
      const taxInput = {
        staff_name: calculation.staff_name || 'Historical Calculation',
        month: calculation.month || new Date(calculation.timestamp).toLocaleDateString('en-US', { month: 'long' }),
        state_of_residence: calculation.state_of_residence || 'Not specified',
        basic_salary: calculation.basic_salary || 0,
        transport_allowance: calculation.transport_allowance || 0,
        housing_allowance: calculation.housing_allowance || 0,
        meal_allowance: calculation.meal_allowance || 0,
        other_allowances: calculation.other_allowances || 0,
        pension_contribution: calculation.pension_contribution || 0,
        nhf_contribution: calculation.nhf_contribution || 0,
        life_insurance_premium: calculation.life_insurance_premium || 0,
        health_insurance_premium: calculation.health_insurance_premium || 0,
        nhis_contribution: calculation.nhis_contribution || 0,
        annual_rent: calculation.annual_rent || 0
      };

      generatePayeReport(taxInput, calculation);
    } catch (error) {
      console.error('Error generating PAYE report:', error);
      alert('Failed to generate PDF report. Please try again.');
    }
  };

  const handlePrintCIT = (calculation) => {
    // Check if user has PDF export feature
    if (!hasFeature || !hasFeature('pdf_export')) {
      setShowUpgradePrompt(true);
      return;
    }
    
    try {
      // Reconstruct the CIT input from the calculation history
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

  if (history.length === 0 && citHistory.length === 0) {
    return (
      <div className="text-center py-12">
        <HistoryIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Calculation History</h3>
        <p className="text-gray-500">
          Your tax calculations will appear here. Start by using the PAYE or CIT calculators.
        </p>
      </div>
    );
  }

  // Combine and sort all history by timestamp
  const allHistory = [
    ...history.map(item => ({ ...item, type: 'PAYE' })),
    ...citHistory.map(item => ({ ...item, type: 'CIT' }))
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Calculation History</h2>
        <p className="text-gray-600">
          Review and reprint your past tax calculations. Click on any calculation to view detailed breakdown.
        </p>
      </div>

      <div className="space-y-4">
        {allHistory.map((calculation) => {
          const itemKey = `${calculation.type}-${calculation.id}`;
          const expanded = isExpanded(calculation.id, calculation.type);
          
          return (
            <Card key={itemKey} className="transition-all duration-200 hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {calculation.type === 'PAYE' ? (
                      <Users className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <Building2 className="h-5 w-5 text-blue-600" />
                    )}
                    <div>
                      <CardTitle className="text-lg">
                        {calculation.type === 'PAYE' 
                          ? (calculation.staff_name || 'PAYE Calculation')
                          : (calculation.company_name || 'CIT Calculation')
                        }
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {formatDate(calculation.timestamp)}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={calculation.type === 'PAYE' ? 'default' : 'secondary'}
                      className={calculation.type === 'PAYE' ? 'bg-emerald-600' : 'bg-blue-600'}
                    >
                      {calculation.type}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(calculation.id, calculation.type)}
                      className="p-2"
                    >
                      {expanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Summary Row */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-6 text-sm">
                    {calculation.type === 'PAYE' ? (
                      <>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Monthly Gross:</span>
                          <span className="font-medium">{formatCurrency(calculation.monthly_gross_income)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-600">Tax:</span>
                          <span className="font-medium text-red-600">{formatCurrency(calculation.monthly_tax)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-600">Net:</span>
                          <span className="font-medium text-green-600">{formatCurrency(calculation.monthly_net_income)}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center space-x-1">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Taxable Profit:</span>
                          <span className="font-medium">{formatCurrency(calculation.taxable_profit)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-600">Total Tax:</span>
                          <span className="font-medium text-red-600">{formatCurrency(calculation.total_tax_due)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Badge variant="outline" className="text-xs">
                            {calculation.company_size || 'Standard'}
                          </Badge>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleExpanded(calculation.id, calculation.type)}
                      className="text-xs"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      {expanded ? 'Hide Details' : 'View Details'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => calculation.type === 'PAYE' 
                        ? handlePrintPAYE(calculation) 
                        : handlePrintCIT(calculation)
                      }
                      className="text-xs"
                    >
                      <Printer className="h-3 w-3 mr-1" />
                      Print Report
                      {hasFeature && !hasFeature('pdf_export') && (
                        <Badge variant="outline" className="ml-1 text-[10px] px-1 py-0 bg-blue-50 text-blue-600 border-blue-200">
                          PRO+
                        </Badge>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {expanded && (
                <CardContent className="pt-0">
                  <Separator className="mb-4" />
                  
                  {calculation.type === 'PAYE' ? (
                    <div className="space-y-6">
                      {/* Staff Information */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <Users className="h-4 w-4 mr-2 text-emerald-600" />
                          Staff Information
                        </h4>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Name:</span>
                            <p className="font-medium">{calculation.staff_name || 'Not specified'}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Month:</span>
                            <p className="font-medium">{calculation.month || 'Not specified'}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">State:</span>
                            <p className="font-medium">{calculation.state_of_residence || 'Not specified'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Income Breakdown */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <DollarSign className="h-4 w-4 mr-2 text-emerald-600" />
                          Income Breakdown
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Basic Salary:</span>
                              <span className="font-medium">{formatCurrency(calculation.basic_salary)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Transport Allowance:</span>
                              <span className="font-medium">{formatCurrency(calculation.transport_allowance)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Housing Allowance:</span>
                              <span className="font-medium">{formatCurrency(calculation.housing_allowance)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Other Allowances:</span>
                              <span className="font-medium">{formatCurrency(calculation.other_allowances)}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Pension Contribution:</span>
                              <span className="font-medium">{formatCurrency(calculation.pension_contribution)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">NHF Contribution:</span>
                              <span className="font-medium">{formatCurrency(calculation.nhf_contribution)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Life Insurance:</span>
                              <span className="font-medium">{formatCurrency(calculation.life_insurance_premium)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Health Insurance:</span>
                              <span className="font-medium">{formatCurrency(calculation.health_insurance_premium)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Tax Calculation Results */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-emerald-600" />
                          Tax Calculation Results
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Monthly Gross Income:</span>
                                <span className="font-medium">{formatCurrency(calculation.monthly_gross_income)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Monthly Tax:</span>
                                <span className="font-medium text-red-600">{formatCurrency(calculation.monthly_tax)}</span>
                              </div>
                              <div className="flex justify-between border-t pt-2">
                                <span className="text-gray-900 font-medium">Monthly Net Income:</span>
                                <span className="font-bold text-green-600">{formatCurrency(calculation.monthly_net_income)}</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Annual Gross Income:</span>
                                <span className="font-medium">{formatCurrency(calculation.annual_gross_income)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Annual Tax:</span>
                                <span className="font-medium text-red-600">{formatCurrency(calculation.annual_tax)}</span>
                              </div>
                              <div className="flex justify-between border-t pt-2">
                                <span className="text-gray-900 font-medium">Annual Net Income:</span>
                                <span className="font-bold text-green-600">{formatCurrency(calculation.annual_net_income)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Company Information */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <Building2 className="h-4 w-4 mr-2 text-blue-600" />
                          Company Information
                        </h4>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Company Name:</span>
                            <p className="font-medium">{calculation.company_name}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Year of Assessment:</span>
                            <p className="font-medium">{calculation.year_of_assessment || 'Not specified'}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Company Size:</span>
                            <p className="font-medium">{calculation.company_size || 'Standard'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Financial Summary */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <DollarSign className="h-4 w-4 mr-2 text-blue-600" />
                          Financial Summary
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Annual Turnover:</span>
                              <span className="font-medium">{formatCurrency(calculation.annual_turnover)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Gross Income:</span>
                              <span className="font-medium">{formatCurrency(calculation.gross_income)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Deductions:</span>
                              <span className="font-medium">{formatCurrency(calculation.total_deductions)}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Taxable Profit:</span>
                              <span className="font-medium">{formatCurrency(calculation.taxable_profit)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">CIT Due:</span>
                              <span className="font-medium text-red-600">{formatCurrency(calculation.cit_due)}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                              <span className="text-gray-900 font-medium">Total Tax Due:</span>
                              <span className="font-bold text-red-600">{formatCurrency(calculation.total_tax_due)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Additional Details */}
                      {(calculation.capital_allowances_total > 0 || calculation.wht_credits_total > 0) && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-blue-600" />
                            Additional Details
                          </h4>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                              {calculation.capital_allowances_total > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Capital Allowances:</span>
                                  <span className="font-medium text-green-600">{formatCurrency(calculation.capital_allowances_total)}</span>
                                </div>
                              )}
                              {calculation.wht_credits_total > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">WHT Credits:</span>
                                  <span className="font-medium text-green-600">{formatCurrency(calculation.wht_credits_total)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {allHistory.length > 0 && (
        <div className="text-center text-sm text-gray-500 pt-4 border-t">
          Showing {allHistory.length} calculation{allHistory.length !== 1 ? 's' : ''} • 
          Click on any calculation to view detailed breakdown and print reports
        </div>
      )}

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