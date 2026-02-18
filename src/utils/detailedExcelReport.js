import * as XLSX from 'xlsx';

/**
 * Generate a detailed Excel report for tax audit purposes
 * Includes all figures, deductions, reliefs with explanations
 */

// Format currency for Excel
const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) return 0;
  return amount;
};

// Format percentage for display
const formatPercent = (value) => {
  if (typeof value !== 'number' || isNaN(value)) return '0.00%';
  return `${(value * 100).toFixed(2)}%`;
};

/**
 * Generate detailed PAYE report for tax audit
 */
export const generateDetailedPAYEReport = (savedCalc) => {
  const input = savedCalc.input_data || {};
  const result = savedCalc.result_data || {};
  const wb = XLSX.utils.book_new();
  
  // Sheet 1: Cover Page & Summary
  const coverData = [
    ['FIQUANT TAXPRO - DETAILED TAX COMPUTATION REPORT'],
    ['Personal Income Tax (PAYE) Calculation'],
    [''],
    ['IMPORTANT: This report is prepared for tax audit purposes and contains detailed'],
    ['computations in accordance with the Nigeria Tax Act (NTA) 2025 provisions.'],
    [''],
    ['=== CALCULATION IDENTIFICATION ==='],
    ['Calculation Reference', savedCalc.id || 'N/A'],
    ['Calculation Name', savedCalc.name || 'Unnamed'],
    ['Generated On', new Date().toLocaleString('en-NG')],
    ['Calculation Date', savedCalc.saved_at ? new Date(savedCalc.saved_at).toLocaleString('en-NG') : 'N/A'],
    [''],
    ['=== TAXPAYER INFORMATION ==='],
    ['Staff Name', input.staff_name || 'Not Provided'],
    ['Staff ID', input.staff_id || 'Not Provided'],
    ['Tax Month', input.month || 'Not Specified'],
    ['Tax Year', input.year || new Date().getFullYear()],
    ['State of Residence', input.state_of_residence || 'Not Specified'],
    ['Tax Authority', input.tax_authority || 'FIRS'],
    [''],
    ['=== SUMMARY OF TAX COMPUTATION ==='],
    ['Total Annual Gross Income', formatCurrency(result.annual_gross_income || result.gross_annual_income)],
    ['Total Tax Reliefs', formatCurrency(result.total_reliefs)],
    ['Taxable Income', formatCurrency(result.taxable_income)],
    ['Annual Tax Due', formatCurrency(result.tax_due || result.annual_tax)],
    ['Monthly Tax Due', formatCurrency(result.monthly_tax)],
    ['Effective Tax Rate', formatPercent(result.effective_tax_rate)]
  ];
  
  const coverSheet = XLSX.utils.aoa_to_sheet(coverData);
  coverSheet['!cols'] = [{ wch: 35 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, coverSheet, 'Summary');
  
  // Sheet 2: Income Breakdown
  const incomeData = [
    ['SCHEDULE A: INCOME BREAKDOWN'],
    ['All figures are stated in Nigerian Naira (₦)'],
    [''],
    ['CATEGORY', 'MONTHLY (₦)', 'ANNUAL (₦)', 'LEGAL BASIS'],
    [''],
    ['A. BASIC COMPENSATION'],
    ['Basic Salary', formatCurrency(input.basic_salary), formatCurrency((input.basic_salary || 0) * 12), 'S.33 NTA 2025 - Gross Emoluments'],
    [''],
    ['B. REGULAR ALLOWANCES'],
    ['Transport Allowance', formatCurrency(input.transport_allowance), formatCurrency((input.transport_allowance || 0) * 12), 'S.33(1) NTA 2025'],
    ['Housing Allowance', formatCurrency(input.housing_allowance), formatCurrency((input.housing_allowance || 0) * 12), 'S.33(1) NTA 2025'],
    ['Meal/Lunch Allowance', formatCurrency(input.meal_allowance), formatCurrency((input.meal_allowance || 0) * 12), 'S.33(1) NTA 2025'],
    ['Utility Allowance', formatCurrency(input.utility_allowance), formatCurrency((input.utility_allowance || 0) * 12), 'S.33(1) NTA 2025'],
    ['Medical Allowance', formatCurrency(input.medical_allowance), formatCurrency((input.medical_allowance || 0) * 12), 'S.33(1) NTA 2025'],
    ['Other Allowances', formatCurrency(input.other_allowances), formatCurrency((input.other_allowances || 0) * 12), 'S.33(1) NTA 2025'],
    [''],
    ['C. BENEFITS IN KIND (BIK)'],
    ['Company Vehicle (5% of cost)', formatCurrency((input.bik_vehicle_value || 0) * 0.05 / 12), formatCurrency(result.bik_vehicle_taxable), 'S.3(2)(b) NTA 2025 - 5% of market value'],
    ['Accommodation Benefit', formatCurrency((result.bik_housing_taxable || 0) / 12), formatCurrency(result.bik_housing_taxable), 'S.3(2)(a) NTA 2025'],
    ['Performance Bonus', formatCurrency((input.bonus || 0) / 12), formatCurrency(input.bonus), 'S.33(1) NTA 2025 - Part of Gross Emoluments'],
    [''],
    ['TOTAL GROSS INCOME', formatCurrency(result.monthly_gross_income), formatCurrency(result.annual_gross_income || result.gross_annual_income), '']
  ];
  
  const incomeSheet = XLSX.utils.aoa_to_sheet(incomeData);
  incomeSheet['!cols'] = [{ wch: 30 }, { wch: 18 }, { wch: 18 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, incomeSheet, 'Income Details');
  
  // Sheet 3: Tax Reliefs & Deductions
  const reliefsData = [
    ['SCHEDULE B: TAX RELIEFS & EXEMPTIONS'],
    ['Computed in accordance with S.33-36 Nigeria Tax Act 2025'],
    [''],
    ['RELIEF TYPE', 'AMOUNT (₦)', 'COMPUTATION METHOD', 'LEGAL REFERENCE'],
    [''],
    ['A. PENSION CONTRIBUTION'],
    ['Pension Relief (8% of Basic + Housing + Transport)', formatCurrency(result.pension_relief), '8% × (Basic + Housing + Transport)', 'S.33(3) NTA 2025 & PRA 2014'],
    [''],
    ['B. NATIONAL HOUSING FUND'],
    ['NHF Contribution (2.5% of Basic)', formatCurrency(result.nhf_relief), '2.5% × Basic Salary (if applicable)', 'NHF Act Cap N45 LFN 2004'],
    [''],
    ['C. INSURANCE PREMIUMS'],
    ['Life Insurance Premium', formatCurrency(result.life_insurance_relief), 'Actual Premium Paid', 'S.33(4)(a) NTA 2025'],
    ['Health Insurance Premium', formatCurrency(result.health_insurance_relief), 'Actual Premium Paid', 'S.33(4)(b) NTA 2025'],
    ['NHIS Contribution', formatCurrency(result.nhis_relief), 'Actual Contribution', 'NHIS Act 1999'],
    [''],
    ['D. HOUSING RELATED'],
    ['Rent Relief', formatCurrency(result.rent_relief), 'Actual Rent Paid (capped)', 'S.33(5) NTA 2025'],
    ['Mortgage Interest Relief', formatCurrency(result.mortgage_interest_relief), 'Interest on owner-occupied property', 'S.33(6) NTA 2025'],
    [''],
    ['TOTAL TAX RELIEFS', formatCurrency(result.total_reliefs), '', '']
  ];
  
  const reliefsSheet = XLSX.utils.aoa_to_sheet(reliefsData);
  reliefsSheet['!cols'] = [{ wch: 40 }, { wch: 18 }, { wch: 35 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, reliefsSheet, 'Reliefs & Deductions');
  
  // Sheet 4: Tax Computation
  const taxData = [
    ['SCHEDULE C: TAX COMPUTATION'],
    ['Graduated Tax Rates per S.37 Nigeria Tax Act 2025'],
    [''],
    ['COMPUTATION STEP', 'AMOUNT (₦)', 'EXPLANATION'],
    [''],
    ['1. Total Gross Income', formatCurrency(result.annual_gross_income || result.gross_annual_income), 'Sum of all taxable income (Schedule A)'],
    ['2. Less: Total Reliefs', formatCurrency(result.total_reliefs), 'Sum of all allowable reliefs (Schedule B)'],
    ['3. Taxable Income', formatCurrency(result.taxable_income), 'Gross Income minus Reliefs'],
    [''],
    ['TAX BANDS APPLICATION (NTA 2025 RATES)'],
    ['First ₦300,000 @ 7%', formatCurrency(Math.min(result.taxable_income || 0, 300000) * 0.07), 'Band 1'],
    ['Next ₦300,000 @ 11%', formatCurrency(Math.min(Math.max((result.taxable_income || 0) - 300000, 0), 300000) * 0.11), 'Band 2'],
    ['Next ₦500,000 @ 15%', formatCurrency(Math.min(Math.max((result.taxable_income || 0) - 600000, 0), 500000) * 0.15), 'Band 3'],
    ['Next ₦500,000 @ 19%', formatCurrency(Math.min(Math.max((result.taxable_income || 0) - 1100000, 0), 500000) * 0.19), 'Band 4'],
    ['Next ₦1,600,000 @ 21%', formatCurrency(Math.min(Math.max((result.taxable_income || 0) - 1600000, 0), 1600000) * 0.21), 'Band 5'],
    ['Above ₦3,200,000 @ 24%', formatCurrency(Math.max((result.taxable_income || 0) - 3200000, 0) * 0.24), 'Band 6'],
    [''],
    ['ANNUAL TAX LIABILITY', formatCurrency(result.tax_due || result.annual_tax), 'Sum of tax across all bands'],
    ['MONTHLY TAX DEDUCTION', formatCurrency(result.monthly_tax), 'Annual Tax ÷ 12'],
    [''],
    ['EFFECTIVE TAX RATE', formatPercent(result.effective_tax_rate), 'Tax Due ÷ Gross Income'],
    [''],
    ['NET INCOME SUMMARY'],
    ['Annual Net Income', formatCurrency(result.net_annual_income), 'Gross Income - Tax Due'],
    ['Monthly Net Income', formatCurrency(result.monthly_net_income), 'Annual Net ÷ 12']
  ];
  
  const taxSheet = XLSX.utils.aoa_to_sheet(taxData);
  taxSheet['!cols'] = [{ wch: 35 }, { wch: 20 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, taxSheet, 'Tax Computation');
  
  // Sheet 5: Certification & Notes
  const certData = [
    ['SCHEDULE D: CERTIFICATION & NOTES'],
    [''],
    ['CERTIFICATION'],
    ['This tax computation has been prepared using Fiquant TaxPro software'],
    ['in accordance with the Nigeria Tax Act 2025 and related regulations.'],
    [''],
    ['The figures presented herein are based on the income and relief'],
    ['information provided by the taxpayer/employer.'],
    [''],
    ['IMPORTANT NOTES FOR TAX AUDIT'],
    ['1. All income figures should be supported by payslips or employment contracts'],
    ['2. Pension contributions should be evidenced by PFA statements'],
    ['3. NHF contributions require evidence of payment to FMBN'],
    ['4. Insurance premiums should be supported by policy documents and receipts'],
    ['5. Rent/Mortgage claims require tenancy agreements or mortgage statements'],
    [''],
    ['DOCUMENT CHECKLIST FOR TAX AUDIT'],
    ['□ Employment contract or letter of appointment'],
    ['□ Monthly payslips for the tax year'],
    ['□ Pension Fund Administrator (PFA) statement'],
    ['□ NHF payment evidence (if applicable)'],
    ['□ Life insurance policy and premium receipts'],
    ['□ Health insurance certificate and premium receipts'],
    ['□ Tenancy agreement or rent receipts (if claiming rent relief)'],
    ['□ Mortgage statement (if claiming mortgage interest relief)'],
    ['□ Tax Identification Number (TIN) certificate'],
    [''],
    ['DISCLAIMER'],
    ['This report is generated for informational purposes. While every effort'],
    ['has been made to ensure accuracy, taxpayers should verify all figures'],
    ['and consult with a qualified tax professional for specific advice.'],
    [''],
    ['Report Generated: ' + new Date().toLocaleString('en-NG')],
    ['Software: Fiquant TaxPro - www.fiquant.com'],
    ['Compliance: Nigeria Tax Act (NTA) 2025']
  ];
  
  const certSheet = XLSX.utils.aoa_to_sheet(certData);
  certSheet['!cols'] = [{ wch: 70 }];
  XLSX.utils.book_append_sheet(wb, certSheet, 'Certification');
  
  return wb;
};

/**
 * Generate detailed CIT report for tax audit
 */
export const generateDetailedCITReport = (savedCalc) => {
  const input = savedCalc.input_data || {};
  const result = savedCalc.result_data || {};
  const wb = XLSX.utils.book_new();
  
  // Sheet 1: Cover & Summary
  const coverData = [
    ['FIQUANT TAXPRO - DETAILED TAX COMPUTATION REPORT'],
    ['Companies Income Tax (CIT) Calculation'],
    [''],
    ['IMPORTANT: This report is prepared for tax audit purposes and contains detailed'],
    ['computations in accordance with the Companies Income Tax Act (CITA) as amended.'],
    [''],
    ['=== CALCULATION IDENTIFICATION ==='],
    ['Calculation Reference', savedCalc.id || 'N/A'],
    ['Calculation Name', savedCalc.name || 'Unnamed'],
    ['Generated On', new Date().toLocaleString('en-NG')],
    [''],
    ['=== COMPANY INFORMATION ==='],
    ['Company Name', input.company_name || 'Not Provided'],
    ['TIN', input.tin || 'Not Provided'],
    ['Year of Assessment', input.year_of_assessment || new Date().getFullYear()],
    ['Company Classification', result.company_size || 'Standard'],
    [''],
    ['=== TAX COMPUTATION SUMMARY ==='],
    ['Annual Turnover', formatCurrency(input.annual_turnover || result.annual_turnover)],
    ['Gross Revenue', formatCurrency(input.gross_income || result.gross_income)],
    ['Assessable Profit', formatCurrency(result.assessable_profit)],
    ['Total Deductions', formatCurrency(result.total_deductions || result.total_deductible_expenses)],
    ['Taxable Profit', formatCurrency(result.taxable_profit || result.taxable_income)],
    ['CIT Rate Applied', `${result.cit_rate || 30}%`],
    ['CIT Due', formatCurrency(result.cit_due)],
    ['Total Tax Due', formatCurrency(result.total_tax_due)]
  ];
  
  const coverSheet = XLSX.utils.aoa_to_sheet(coverData);
  coverSheet['!cols'] = [{ wch: 35 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, coverSheet, 'Summary');
  
  // Sheet 2: Revenue & Income
  const revenueData = [
    ['SCHEDULE A: REVENUE & INCOME ANALYSIS'],
    [''],
    ['INCOME CATEGORY', 'AMOUNT (₦)', 'LEGAL BASIS'],
    [''],
    ['A. OPERATING REVENUE'],
    ['Gross Revenue/Turnover', formatCurrency(input.gross_income || result.gross_income), 'S.24 CITA - Profits from trade/business'],
    ['Other Operating Income', formatCurrency(input.other_income), 'S.24 CITA'],
    [''],
    ['B. OTHER INCOME'],
    ['Investment Income', formatCurrency(input.investment_income), 'S.24 CITA'],
    ['Interest Income', formatCurrency(input.interest_income), 'S.24 CITA'],
    ['Rental Income', formatCurrency(input.rental_income), 'S.24 CITA'],
    ['Foreign Exchange Gains', formatCurrency(input.forex_gains), 'S.24 CITA'],
    [''],
    ['TOTAL GROSS INCOME', formatCurrency(result.gross_income || input.gross_income), '']
  ];
  
  const revenueSheet = XLSX.utils.aoa_to_sheet(revenueData);
  revenueSheet['!cols'] = [{ wch: 35 }, { wch: 20 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, revenueSheet, 'Revenue');
  
  // Sheet 3: Deductible Expenses
  const expensesData = [
    ['SCHEDULE B: DEDUCTIBLE EXPENSES'],
    ['Expenses wholly, exclusively and necessarily incurred - S.24 CITA'],
    [''],
    ['EXPENSE CATEGORY', 'AMOUNT (₦)', 'DEDUCTIBILITY', 'LEGAL BASIS'],
    [''],
    ['A. COST OF SALES'],
    ['Cost of Goods Sold', formatCurrency(input.cost_of_goods_sold), 'Fully Deductible', 'S.24(a) CITA'],
    [''],
    ['B. OPERATING EXPENSES'],
    ['Staff Costs/Salaries', formatCurrency(input.staff_costs), 'Fully Deductible', 'S.24(b) CITA'],
    ['Rent & Utilities', formatCurrency(input.rent_expenses), 'Fully Deductible', 'S.24(c) CITA'],
    ['Professional Fees', formatCurrency(input.professional_fees), 'Fully Deductible', 'S.24(d) CITA'],
    ['Other Deductible Expenses', formatCurrency(input.other_deductible_expenses), 'Fully Deductible', 'S.24 CITA'],
    [''],
    ['C. FINANCE COSTS'],
    ['Interest - Unrelated Parties', formatCurrency(input.interest_paid_unrelated), 'Fully Deductible', 'S.24(e) CITA'],
    ['Interest - Related Parties', formatCurrency(input.interest_paid_related), 'Subject to Thin Cap', 'S.24(e) & S.18 CITA'],
    [''],
    ['TOTAL DEDUCTIBLE EXPENSES', formatCurrency(result.total_deductible_expenses || result.total_deductions), '', ''],
    [''],
    ['D. NON-DEDUCTIBLE EXPENSES (Added Back)'],
    ['Depreciation', formatCurrency(input.depreciation), 'NOT Deductible', 'S.27 CITA - Use Capital Allowances'],
    ['Entertainment & Gifts', formatCurrency(input.entertainment_expenses), 'NOT Deductible', 'S.27(a) CITA'],
    ['Fines & Penalties', formatCurrency(input.fines_penalties), 'NOT Deductible', 'S.27(b) CITA'],
    ['Personal Expenses', formatCurrency(input.personal_expenses), 'NOT Deductible', 'S.27(c) CITA'],
    ['Other Non-Deductible', formatCurrency(input.other_non_deductible), 'NOT Deductible', 'S.27 CITA'],
    [''],
    ['TOTAL NON-DEDUCTIBLE', formatCurrency(result.total_non_deductible_expenses), '', '']
  ];
  
  const expensesSheet = XLSX.utils.aoa_to_sheet(expensesData);
  expensesSheet['!cols'] = [{ wch: 35 }, { wch: 18 }, { wch: 18 }, { wch: 35 }];
  XLSX.utils.book_append_sheet(wb, expensesSheet, 'Expenses');
  
  // Sheet 4: Capital Allowances
  const caData = [
    ['SCHEDULE C: CAPITAL ALLOWANCES'],
    ['Computed per Second Schedule to CITA'],
    [''],
    ['ASSET CLASS', 'COST (₦)', 'RATE', 'ALLOWANCE (₦)', 'LEGAL BASIS'],
    [''],
    ['Initial Allowances (Year of Acquisition)'],
    ['Buildings', formatCurrency(input.ca_buildings_cost), '15%', formatCurrency((input.ca_buildings_cost || 0) * 0.15), '2nd Schedule CITA'],
    ['Plant & Machinery', formatCurrency(input.ca_plant_machinery_cost), '50%', formatCurrency((input.ca_plant_machinery_cost || 0) * 0.50), '2nd Schedule CITA'],
    ['Motor Vehicles', formatCurrency(input.ca_motor_vehicles_cost), '50%', formatCurrency((input.ca_motor_vehicles_cost || 0) * 0.50), '2nd Schedule CITA'],
    ['Furniture & Fittings', formatCurrency(input.ca_furniture_cost), '25%', formatCurrency((input.ca_furniture_cost || 0) * 0.25), '2nd Schedule CITA'],
    ['Computer Equipment', formatCurrency(input.ca_computers_cost), '50%', formatCurrency((input.ca_computers_cost || 0) * 0.50), '2nd Schedule CITA'],
    [''],
    ['Annual Allowances'],
    ['Buildings', formatCurrency(input.ca_buildings_cost), '10%', formatCurrency((input.ca_buildings_cost || 0) * 0.10), '2nd Schedule CITA'],
    ['Plant & Machinery', formatCurrency(input.ca_plant_machinery_cost), '25%', formatCurrency((input.ca_plant_machinery_cost || 0) * 0.25), '2nd Schedule CITA'],
    ['Motor Vehicles', formatCurrency(input.ca_motor_vehicles_cost), '25%', formatCurrency((input.ca_motor_vehicles_cost || 0) * 0.25), '2nd Schedule CITA'],
    ['Furniture & Fittings', formatCurrency(input.ca_furniture_cost), '20%', formatCurrency((input.ca_furniture_cost || 0) * 0.20), '2nd Schedule CITA'],
    ['Computer Equipment', formatCurrency(input.ca_computers_cost), '25%', formatCurrency((input.ca_computers_cost || 0) * 0.25), '2nd Schedule CITA'],
    [''],
    ['TOTAL CAPITAL ALLOWANCES', '', '', formatCurrency(result.capital_allowances_total || result.total_capital_allowances), '']
  ];
  
  const caSheet = XLSX.utils.aoa_to_sheet(caData);
  caSheet['!cols'] = [{ wch: 25 }, { wch: 18 }, { wch: 10 }, { wch: 18 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, caSheet, 'Capital Allowances');
  
  // Sheet 5: Tax Computation
  const taxData = [
    ['SCHEDULE D: TAX COMPUTATION'],
    [''],
    ['COMPUTATION STEP', 'AMOUNT (₦)', 'EXPLANATION'],
    [''],
    ['1. Gross Revenue', formatCurrency(input.gross_income || result.gross_income), 'Total income from all sources'],
    ['2. Less: Cost of Goods Sold', formatCurrency(input.cost_of_goods_sold), 'Direct costs of goods/services'],
    ['3. Gross Profit', formatCurrency(result.gross_profit), 'Revenue - COGS'],
    ['4. Less: Operating Expenses', formatCurrency(result.total_deductible_expenses), 'Allowable business expenses'],
    ['5. Add: Non-Deductible Expenses', formatCurrency(result.total_non_deductible_expenses), 'Expenses added back'],
    ['6. Adjusted Profit', formatCurrency(result.adjusted_profit || result.assessable_profit), 'Before capital allowances'],
    ['7. Less: Capital Allowances', formatCurrency(result.capital_allowances_total), 'Per Schedule C'],
    ['8. Less: Loss Relief', formatCurrency(result.loss_relief_applied || input.carry_forward_losses), 'Losses b/f (max 4 years)'],
    ['9. Taxable Profit', formatCurrency(result.taxable_profit || result.taxable_income), 'Chargeable to CIT'],
    [''],
    ['CIT COMPUTATION'],
    ['Company Classification', result.company_size || 'Large', 'Based on turnover threshold'],
    ['Applicable CIT Rate', `${result.cit_rate || 30}%`, 'Per S.40 CITA'],
    ['CIT Due', formatCurrency(result.cit_due), 'Taxable Profit × CIT Rate'],
    [''],
    ['ADDITIONAL TAXES'],
    ['Education Tax (2.5%)', formatCurrency(result.education_tax || (result.assessable_profit || 0) * 0.025), 'Per Tertiary Education Tax Act'],
    ['NASENI Levy', formatCurrency(result.naseni_levy), 'If applicable'],
    ['Development Levy', formatCurrency(result.development_levy), 'If applicable'],
    [''],
    ['LESS: WHT CREDITS'],
    ['WHT on Contracts', formatCurrency(input.wht_contracts), 'Creditable against CIT'],
    ['WHT on Dividends', formatCurrency(input.wht_dividends), 'Creditable against CIT'],
    ['WHT on Other', formatCurrency(input.wht_other), 'Creditable against CIT'],
    ['Total WHT Credits', formatCurrency(result.wht_credits_total), ''],
    [''],
    ['NET TAX PAYABLE', formatCurrency(result.total_tax_due || result.net_tax_payable), '']
  ];
  
  const taxSheet = XLSX.utils.aoa_to_sheet(taxData);
  taxSheet['!cols'] = [{ wch: 35 }, { wch: 20 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, taxSheet, 'Tax Computation');
  
  // Sheet 6: Certification
  const certData = [
    ['SCHEDULE E: CERTIFICATION & AUDIT NOTES'],
    [''],
    ['CERTIFICATION'],
    ['This CIT computation has been prepared using Fiquant TaxPro software'],
    ['in accordance with the Companies Income Tax Act (CITA) as amended.'],
    [''],
    ['DOCUMENT CHECKLIST FOR TAX AUDIT'],
    ['□ Audited Financial Statements'],
    ['□ Tax Computation Workings'],
    ['□ Fixed Asset Register (for Capital Allowances)'],
    ['□ WHT Credit Notes'],
    ['□ Evidence of related party transactions'],
    ['□ Transfer pricing documentation (if applicable)'],
    ['□ Loss relief computation (if claiming)'],
    ['□ TIN Certificate'],
    ['□ CAC Registration Documents'],
    [''],
    ['NOTES ON COMPANY CLASSIFICATION (NTA 2025)'],
    ['Small Company: Turnover < ₦25 million - 0% CIT'],
    ['Medium Company: Turnover ₦25m - ₦100m - 20% CIT'],
    ['Large Company: Turnover > ₦100 million - 30% CIT'],
    [''],
    ['Report Generated: ' + new Date().toLocaleString('en-NG')],
    ['Software: Fiquant TaxPro']
  ];
  
  const certSheet = XLSX.utils.aoa_to_sheet(certData);
  certSheet['!cols'] = [{ wch: 70 }];
  XLSX.utils.book_append_sheet(wb, certSheet, 'Certification');
  
  return wb;
};

/**
 * Generate detailed VAT report for tax audit
 */
export const generateDetailedVATReport = (savedCalc) => {
  const input = savedCalc.input_data || {};
  const result = savedCalc.result_data || {};
  const wb = XLSX.utils.book_new();
  
  const summaryData = [
    ['FIQUANT TAXPRO - DETAILED VAT COMPUTATION REPORT'],
    ['Value Added Tax Calculation'],
    [''],
    ['=== COMPANY INFORMATION ==='],
    ['Company Name', input.company_name || 'Not Provided'],
    ['TIN', input.tin || 'Not Provided'],
    ['Tax Period', input.month || 'Not Specified'],
    [''],
    ['=== VAT COMPUTATION SUMMARY ==='],
    ['Total Sales', formatCurrency(result.total_sales)],
    ['Standard Rated Sales (7.5%)', formatCurrency(result.standard_rated_sales)],
    ['Zero-Rated Sales', formatCurrency(result.zero_rated_sales)],
    ['Exempt Sales', formatCurrency(result.vat_exempt_sales || result.exempt_sales)],
    [''],
    ['Output VAT (7.5%)', formatCurrency(result.output_vat || result.vat_amount)],
    ['Input VAT (Recoverable)', formatCurrency(input.input_vat || 0)],
    ['Net VAT Payable', formatCurrency((result.output_vat || result.vat_amount || 0) - (input.input_vat || 0))],
    [''],
    ['=== LEGAL BASIS ==='],
    ['VAT Rate: 7.5% per Value Added Tax Act as amended'],
    ['Exempt supplies per First Schedule to VAT Act'],
    ['Zero-rated supplies per Second Schedule to VAT Act'],
    [''],
    ['Report Generated: ' + new Date().toLocaleString('en-NG')]
  ];
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 40 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, summarySheet, 'VAT Summary');
  
  // Transaction breakdown if available
  if (result.transaction_breakdown && result.transaction_breakdown.length > 0) {
    const txnData = [
      ['TRANSACTION BREAKDOWN'],
      [''],
      ['Description', 'Category', 'Amount (₦)', 'VAT Amount (₦)'],
      ...result.transaction_breakdown.map(txn => [
        txn.description || txn.type,
        txn.category,
        formatCurrency(txn.amount),
        formatCurrency(txn.vat_amount)
      ])
    ];
    
    const txnSheet = XLSX.utils.aoa_to_sheet(txnData);
    txnSheet['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 18 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, txnSheet, 'Transactions');
  }
  
  return wb;
};

/**
 * Generate detailed CGT report for tax audit
 */
export const generateDetailedCGTReport = (savedCalc) => {
  const input = savedCalc.input_data || {};
  const result = savedCalc.result_data || {};
  const wb = XLSX.utils.book_new();
  
  const summaryData = [
    ['FIQUANT TAXPRO - DETAILED CGT COMPUTATION REPORT'],
    ['Capital Gains Tax Calculation'],
    [''],
    ['=== TAXPAYER INFORMATION ==='],
    ['Name', input.taxpayer_name || 'Not Provided'],
    ['TIN', input.tin || 'Not Provided'],
    [''],
    ['=== ASSET DETAILS ==='],
    ['Asset Type', result.asset_type || input.asset_type || 'Not Specified'],
    ['Description', input.asset_description || 'Not Provided'],
    ['Date of Acquisition', input.acquisition_date || 'Not Specified'],
    ['Date of Disposal', input.disposal_date || 'Not Specified'],
    [''],
    ['=== CGT COMPUTATION ==='],
    ['Disposal Proceeds', formatCurrency(result.disposal_proceeds || input.disposal_proceeds)],
    ['Less: Cost of Acquisition', formatCurrency(result.acquisition_cost || input.acquisition_cost)],
    ['Less: Incidental Costs', formatCurrency(result.incidental_costs || input.incidental_costs)],
    ['Less: Enhancement Costs', formatCurrency(result.enhancement_costs || input.enhancement_costs)],
    [''],
    ['Gross Capital Gain', formatCurrency(result.gross_gain)],
    ['Less: Exemptions', formatCurrency(result.exemption_amount || 0)],
    ['Chargeable Gain', formatCurrency(result.chargeable_gain || result.taxable_gain)],
    [''],
    ['CGT Rate', '10%'],
    ['CGT Payable', formatCurrency(result.cgt_payable || result.tax_payable)],
    [''],
    ['=== LEGAL BASIS ==='],
    ['Capital Gains Tax Act Cap C1 LFN 2004 as amended'],
    ['CGT Rate: 10% flat rate per S.2 CGTA'],
    [''],
    ['Report Generated: ' + new Date().toLocaleString('en-NG')]
  ];
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 35 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, summarySheet, 'CGT Summary');
  
  return wb;
};

/**
 * Main function to generate detailed report based on calculation type
 */
export const generateDetailedReport = (savedCalc) => {
  const calcType = savedCalc.calculation_type?.toLowerCase();
  
  let workbook;
  switch (calcType) {
    case 'paye':
      workbook = generateDetailedPAYEReport(savedCalc);
      break;
    case 'cit':
      workbook = generateDetailedCITReport(savedCalc);
      break;
    case 'vat':
      workbook = generateDetailedVATReport(savedCalc);
      break;
    case 'cgt':
      workbook = generateDetailedCGTReport(savedCalc);
      break;
    default:
      throw new Error(`Unknown calculation type: ${calcType}`);
  }
  
  const fileName = `TaxAudit_${calcType?.toUpperCase()}_${savedCalc.name || 'Report'}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
  
  return fileName;
};

export default generateDetailedReport;
