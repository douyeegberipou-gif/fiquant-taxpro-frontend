import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// ============================================================================
// FIQUANT TAXPRO - STATUTORY-COMPLIANT PDF GENERATOR
// Compliant with Nigeria Tax Act (NTA) 2025 & Nigeria Tax Administration Act (NTAA) 2025
// Designed for Form H1 filing and NRS statutory submissions
// ============================================================================

// Utility function to format currency for PDF (with proper encoding)
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount) || amount === '') {
    return 'N 0.00';
  }
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) {
    return 'N 0.00';
  }
  return `N ${numAmount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Utility function to format percentage
const formatPercentage = (rate) => {
  if (rate === null || rate === undefined || isNaN(rate) || rate === '') {
    return '0.00%';
  }
  const numRate = parseFloat(rate);
  if (isNaN(numRate)) {
    return '0.00%';
  }
  return `${(numRate * 100).toFixed(2)}%`;
};

// Utility function to format date
const formatDate = () => {
  return new Date().toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Add statutory header with NRS compliance notice
const addStatutoryHeader = (doc, title, formType, isLandscape = false) => {
  const pageWidth = isLandscape ? 297 : 210;
  const margin = 15;
  
  // Header background
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, pageWidth, 25, 'F');
  
  // Main title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 215, 0); // Gold color
  doc.text('FIQUANT TAXPRO', margin, 12);
  
  // Form type
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(formType, margin, 20);
  
  // Statutory compliance notice
  doc.setFontSize(8);
  doc.text('NTA 2025 / NTAA 2025 Compliant', pageWidth - margin - 50, 12);
  doc.text('For NRS Statutory Filing', pageWidth - margin - 50, 18);
  
  // Document title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(title, margin, 35);
  
  // Generation info
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${formatDate()}`, margin, 42);
  
  return 50;
};

// Add statutory footer with certification
const addStatutoryFooter = (doc, isLandscape = false) => {
  const pageWidth = isLandscape ? 297 : 210;
  const pageHeight = isLandscape ? 210 : 297;
  const margin = 15;
  const pageCount = doc.internal.getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Footer line
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);
    
    // Statutory declaration
    doc.setFontSize(7);
    doc.setTextColor(60, 60, 60);
    doc.text('This document is computer-generated and valid for statutory filing with the Nigeria Revenue Service (NRS).', margin, pageHeight - 20);
    doc.text('Calculations are based on the Nigeria Tax Act (NTA) 2025 and Nigeria Tax Administration Act (NTAA) 2025.', margin, pageHeight - 16);
    
    // Fiquant branding
    doc.setFont('helvetica', 'bold');
    doc.text('Fiquant TaxPro', margin, pageHeight - 10);
    doc.setFont('helvetica', 'normal');
    doc.text(' | www.fiquanttaxpro.com | © 2026 Fiquant Consult', margin + 30, pageHeight - 10);
    
    // Page number
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 25, pageHeight - 10);
  }
};

// ============================================================================
// PAYE REPORT - Form H1 Compliant (Annual Individual Return Schedule)
// ============================================================================
export const generatePayeReport = (taxInput, result) => {
  // Use landscape for more columns
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = 297;
  const margin = 15;
  
  let yPos = addStatutoryHeader(doc, 'PAYE TAX COMPUTATION SCHEDULE', 'Form H1 - Annual Individual Return', true);
  
  // ============== SECTION A: TAXPAYER IDENTIFICATION ==============
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('SECTION A: TAXPAYER IDENTIFICATION (Mandatory for NRS Filing)', margin, yPos);
  yPos += 6;
  
  const taxpayerData = [
    ['Taxpayer Name', taxInput.staff_name || 'Not Specified', 'Tax Identification Number (TIN)', taxInput.tin || 'Not Specified'],
    ['Assessment Year', taxInput.year || '2026', 'Assessment Period', taxInput.month || 'Annual'],
    ['State of Residence', taxInput.state_of_residence || 'Not Specified', 'Relevant Tax Authority', taxInput.tax_authority || 'SIRS']
  ];
  
  autoTable(doc, {
    body: taxpayerData,
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50, fillColor: [245, 245, 245] },
      1: { cellWidth: 70 },
      2: { fontStyle: 'bold', cellWidth: 60, fillColor: [245, 245, 245] },
      3: { cellWidth: 70 }
    },
    margin: { left: margin, right: margin }
  });
  
  yPos = doc.lastAutoTable.finalY + 8;
  
  // ============== SECTION B: EMOLUMENTS SCHEDULE ==============
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('SECTION B: SCHEDULE OF EMOLUMENTS (NTA 2025 Section 3)', margin, yPos);
  yPos += 6;
  
  // Calculate monthly and annual values
  const monthlyBasic = parseFloat(taxInput.basic_salary) || 0;
  const monthlyHousing = parseFloat(taxInput.housing_allowance) || 0;
  const monthlyTransport = parseFloat(taxInput.transport_allowance) || 0;
  const monthlyMeal = parseFloat(taxInput.meal_allowance) || 0;
  const monthlyUtility = parseFloat(taxInput.utility_allowance) || 0;
  const monthlyMedical = parseFloat(taxInput.medical_allowance) || 0;
  const monthlyOther = parseFloat(taxInput.other_allowances) || 0;
  
  const emolumentsData = [
    ['Basic Salary', formatCurrency(monthlyBasic), formatCurrency(monthlyBasic * 12)],
    ['Housing Allowance', formatCurrency(monthlyHousing), formatCurrency(monthlyHousing * 12)],
    ['Transport Allowance', formatCurrency(monthlyTransport), formatCurrency(monthlyTransport * 12)],
    ['Meal/Feeding Allowance', formatCurrency(monthlyMeal), formatCurrency(monthlyMeal * 12)],
    ['Utility Allowance', formatCurrency(monthlyUtility), formatCurrency(monthlyUtility * 12)],
    ['Medical Allowance', formatCurrency(monthlyMedical), formatCurrency(monthlyMedical * 12)],
    ['Other Allowances', formatCurrency(monthlyOther), formatCurrency(monthlyOther * 12)]
  ];
  
  // Calculate totals
  const monthlyTotal = monthlyBasic + monthlyHousing + monthlyTransport + monthlyMeal + monthlyUtility + monthlyMedical + monthlyOther;
  const annualTotal = monthlyTotal * 12;
  
  autoTable(doc, {
    head: [['Emolument Component', 'Monthly Amount (N)', 'Annual Amount (N)']],
    body: emolumentsData,
    foot: [['TOTAL CASH EMOLUMENTS', formatCurrency(monthlyTotal), formatCurrency(annualTotal)]],
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
    footStyles: { fillColor: [34, 197, 94], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 50, halign: 'right' },
      2: { cellWidth: 50, halign: 'right' }
    },
    margin: { left: margin, right: margin }
  });
  
  yPos = doc.lastAutoTable.finalY + 8;
  
  // ============== SECTION C: BENEFITS IN KIND (BIK) ==============
  const bikVehicle = parseFloat(taxInput.bik_vehicle_value) || parseFloat(result.bik_vehicle_value) || 0;
  const bikHousing = parseFloat(taxInput.bik_housing_value) || parseFloat(result.bik_housing_value) || 0;
  const bonus = parseFloat(taxInput.bonus) || parseFloat(result.bonus) || 0;
  const hasBIK = bikVehicle > 0 || bikHousing > 0 || bonus > 0;
  
  if (hasBIK) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('SECTION C: BENEFITS IN KIND (NTA 2025 Section 14)', margin, yPos);
    yPos += 6;
    
    const bikData = [];
    if (bikVehicle > 0) {
      bikData.push(['Motor Vehicle', formatCurrency(bikVehicle), '5%', formatCurrency(bikVehicle * 0.05)]);
    }
    if (bikHousing > 0) {
      bikData.push(['Accommodation/Housing', formatCurrency(bikHousing), '20%', formatCurrency(bikHousing * 0.20)]);
    }
    if (bonus > 0) {
      bikData.push(['Bonus/Performance Pay', formatCurrency(bonus), '100%', formatCurrency(bonus)]);
    }
    
    const totalBikTaxable = (bikVehicle * 0.05) + (bikHousing * 0.20) + bonus;
    
    autoTable(doc, {
      head: [['BIK Type', 'Asset/Gross Value (N)', 'Taxable Rate', 'Taxable Value (N)']],
      body: bikData,
      foot: [['TOTAL TAXABLE BIK', '', '', formatCurrency(totalBikTaxable)]],
      startY: yPos,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [102, 51, 153], textColor: [255, 255, 255], fontStyle: 'bold' },
      footStyles: { fillColor: [102, 51, 153], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 50, halign: 'right' },
        2: { cellWidth: 30, halign: 'center' },
        3: { cellWidth: 50, halign: 'right' }
      },
      margin: { left: margin, right: margin }
    });
    
    yPos = doc.lastAutoTable.finalY + 8;
  }
  
  // ============== SECTION D: STATUTORY DEDUCTIONS & RELIEFS ==============
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('SECTION D: STATUTORY DEDUCTIONS & TAX RELIEFS (NTA 2025 Schedule 6)', margin, yPos);
  yPos += 6;
  
  const pensionMonthly = parseFloat(taxInput.pension_contribution) || (monthlyBasic + monthlyHousing + monthlyTransport) * 0.08;
  const nhfMonthly = parseFloat(taxInput.nhf_contribution) || 0;
  const lifeInsurance = parseFloat(taxInput.life_insurance_premium) || 0;
  const healthInsurance = parseFloat(taxInput.health_insurance_premium) || 0;
  const nhis = parseFloat(taxInput.nhis_contribution) || 0;
  const rentRelief = parseFloat(result.rent_relief) || 0;
  const mortgageRelief = parseFloat(taxInput.mortgage_interest) || 0;
  
  const deductionsData = [
    ['Pension Contribution (8% of Basic+Housing+Transport)', formatCurrency(pensionMonthly), formatCurrency(pensionMonthly * 12)],
    ['National Housing Fund (NHF) - 2.5%', formatCurrency(nhfMonthly), formatCurrency(nhfMonthly * 12)],
    ['Life Insurance Premium', formatCurrency(lifeInsurance), formatCurrency(lifeInsurance * 12)],
    ['Health Insurance Premium', formatCurrency(healthInsurance), formatCurrency(healthInsurance * 12)],
    ['NHIS Contribution', formatCurrency(nhis), formatCurrency(nhis * 12)],
    ['Rent Relief (20% of rent, max N500,000)', '-', formatCurrency(rentRelief)],
    ['Mortgage Interest Relief', '-', formatCurrency(mortgageRelief)]
  ];
  
  const totalAnnualReliefs = parseFloat(result.total_reliefs) || 0;
  
  autoTable(doc, {
    head: [['Deduction/Relief Type', 'Monthly (N)', 'Annual (N)']],
    body: deductionsData,
    foot: [['TOTAL ALLOWABLE RELIEFS', '', formatCurrency(totalAnnualReliefs)]],
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [0, 128, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
    footStyles: { fillColor: [0, 128, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 40, halign: 'right' },
      2: { cellWidth: 40, halign: 'right' }
    },
    margin: { left: margin, right: margin }
  });
  
  yPos = doc.lastAutoTable.finalY + 8;
  
  // Check if we need a new page
  if (yPos > 160) {
    doc.addPage('landscape');
    yPos = 20;
  }
  
  // ============== SECTION E: TAX COMPUTATION ==============
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('SECTION E: TAX COMPUTATION (NTA 2025 Schedule 1 - Tax Rates)', margin, yPos);
  yPos += 6;
  
  const taxComputationData = [
    ['A', 'Total Annual Gross Income', formatCurrency(result.annual_gross_income)],
    ['B', 'Less: Total Allowable Reliefs', formatCurrency(result.total_reliefs)],
    ['C', 'Chargeable/Taxable Income (A - B)', formatCurrency(result.taxable_income)],
    ['D', 'Tax Payable on Chargeable Income', formatCurrency(result.tax_due)],
    ['E', 'Effective Tax Rate', formatPercentage(result.effective_tax_rate)]
  ];
  
  autoTable(doc, {
    head: [['Ref', 'Description', 'Amount (N)']],
    body: taxComputationData,
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 80 },
      2: { cellWidth: 50, halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: margin, right: margin }
  });
  
  yPos = doc.lastAutoTable.finalY + 8;
  
  // ============== SECTION F: TAX BRACKET BREAKDOWN ==============
  if (result.tax_breakdown && result.tax_breakdown.length > 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('SECTION F: TAX BRACKET BREAKDOWN (NTA 2025 Schedule 1)', margin, yPos);
    yPos += 6;
    
    const bracketData = result.tax_breakdown.map(bracket => {
      let rangeText = bracket.range || 'N/A';
      rangeText = rangeText.replace(/₦/g, 'N ').replace(/\u20a6/g, 'N ');
      return [
        rangeText,
        bracket.rate || '0%',
        formatCurrency(bracket.taxable_amount || 0),
        formatCurrency(bracket.tax_amount || 0)
      ];
    });
    
    // Calculate total
    const totalTaxable = result.tax_breakdown.reduce((sum, b) => sum + (parseFloat(b.taxable_amount) || 0), 0);
    const totalTax = result.tax_breakdown.reduce((sum, b) => sum + (parseFloat(b.tax_amount) || 0), 0);
    
    autoTable(doc, {
      head: [['Income Band', 'Tax Rate', 'Taxable Amount (N)', 'Tax Payable (N)']],
      body: bracketData,
      foot: [['TOTAL', '', formatCurrency(totalTaxable), formatCurrency(totalTax)]],
      startY: yPos,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
      footStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 45, halign: 'right' },
        3: { cellWidth: 45, halign: 'right' }
      },
      margin: { left: margin, right: margin }
    });
    
    yPos = doc.lastAutoTable.finalY + 8;
  }
  
  // ============== SECTION G: MONTHLY PAYE SUMMARY ==============
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('SECTION G: MONTHLY PAYE DEDUCTION SUMMARY', margin, yPos);
  yPos += 6;
  
  const monthlySummaryData = [
    ['Monthly Gross Income', formatCurrency(result.monthly_gross_income)],
    ['Monthly PAYE Tax Deduction', formatCurrency(result.monthly_tax)],
    ['Monthly Net Income (After PAYE)', formatCurrency(result.monthly_net_income)]
  ];
  
  autoTable(doc, {
    head: [['Description', 'Amount (N)']],
    body: monthlySummaryData,
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [34, 197, 94], textColor: [255, 255, 255], fontStyle: 'bold' },
    bodyStyles: { fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 50, halign: 'right' }
    },
    margin: { left: margin, right: margin }
  });
  
  addStatutoryFooter(doc, true);
  
  doc.save(`PAYE_Statutory_Report_${taxInput.staff_name || 'Employee'}_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Generate Single PAYE Report and return as Base64
export const generatePayeReportAsBase64 = (taxInput, result) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  
  // Same content as generatePayeReport but return base64
  let yPos = addStatutoryHeader(doc, 'PAYE TAX COMPUTATION SCHEDULE', 'Form H1 - Annual Individual Return', true);
  
  // [Simplified for email - same structure as above]
  const taxpayerData = [
    ['Taxpayer Name', taxInput.staff_name || 'Not Specified', 'TIN', taxInput.tin || 'Not Specified'],
    ['Year', taxInput.year || '2026', 'Period', taxInput.month || 'Annual']
  ];
  
  autoTable(doc, {
    body: taxpayerData,
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 9 },
    margin: { left: 15, right: 15 }
  });
  
  yPos = doc.lastAutoTable.finalY + 8;
  
  // Summary table
  const summaryData = [
    ['Annual Gross Income', formatCurrency(result.annual_gross_income)],
    ['Total Reliefs', formatCurrency(result.total_reliefs)],
    ['Taxable Income', formatCurrency(result.taxable_income)],
    ['Annual Tax Due', formatCurrency(result.tax_due)],
    ['Monthly PAYE', formatCurrency(result.monthly_tax)],
    ['Monthly Net Income', formatCurrency(result.monthly_net_income)]
  ];
  
  autoTable(doc, {
    head: [['Description', 'Amount (N)']],
    body: summaryData,
    startY: yPos,
    theme: 'grid',
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
    margin: { left: 15, right: 15 }
  });
  
  addStatutoryFooter(doc, true);
  
  return doc.output('datauristring');
};

// ============================================================================
// BULK PAYE REPORT - Employer Schedule (Form H1 Employer Declaration)
// ============================================================================
export const generateBulkPayeReport = (employees, summaryTotals = null, companyInfo = null) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const margin = 10;
  const pageWidth = 297;
  
  let yPos = 15;
  
  // ============== SECTION 1: TAXPAYER INFORMATION ==============
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Taxpayer Information', margin, yPos);
  yPos += 8;
  
  // Taxpayer Info in horizontal layout
  const taxpayerData = [
    ['Taxpayer Name', companyInfo?.company_name || 'Not specified', 'Year of Assessment', companyInfo?.payroll_year || new Date().getFullYear().toString()]
  ];
  
  autoTable(doc, {
    body: taxpayerData,
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 35, fillColor: [245, 245, 245] },
      1: { cellWidth: 80 },
      2: { fontStyle: 'bold', cellWidth: 40, fillColor: [245, 245, 245] },
      3: { cellWidth: 30 }
    },
    margin: { left: margin, right: margin }
  });
  
  yPos = doc.lastAutoTable.finalY + 3;
  
  // Generated timestamp
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${formatDate()}`, margin, yPos);
  doc.setTextColor(0, 0, 0);
  yPos += 8;
  
  // ============== SECTION 2: PAYROLL SUMMARY (Horizontal Layout) ==============
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Payroll Summary', margin, yPos);
  yPos += 6;
  
  // Calculate totals for summary
  const calculatedEmployees = employees.filter(emp => emp.calculated && emp.result);
  const calculatedTotals = calculatedEmployees.reduce((acc, emp) => ({
    basic: acc.basic + (parseFloat(emp.basic_salary) || 0),
    housing: acc.housing + (parseFloat(emp.housing_allowance) || 0),
    transport: acc.transport + (parseFloat(emp.transport_allowance) || 0),
    other: acc.other + (parseFloat(emp.meal_allowance) || 0) + (parseFloat(emp.utility_allowance) || 0) + (parseFloat(emp.medical_allowance) || 0) + (parseFloat(emp.other_allowances) || 0),
    bik: acc.bik + (parseFloat(emp.bik_vehicle_value) || 0) * 0.05 + (parseFloat(emp.bik_housing_value) || 0) * 0.20 + (parseFloat(emp.bonus) || 0),
    gross: acc.gross + (emp.result?.monthly_gross_income || 0),
    reliefs: acc.reliefs + (emp.result?.total_reliefs || 0),
    taxable: acc.taxable + (emp.result?.taxable_income || 0),
    tax: acc.tax + (emp.result?.tax_due || 0),
    monthlyTax: acc.monthlyTax + (emp.result?.monthly_tax || 0),
    netPay: acc.netPay + (emp.result?.monthly_net_income || 0)
  }), { basic: 0, housing: 0, transport: 0, other: 0, bik: 0, gross: 0, reliefs: 0, taxable: 0, tax: 0, monthlyTax: 0, netPay: 0 });
  
  // Payroll Summary - Row 1: Company Info
  const summaryRow1 = [
    ['Company Name', companyInfo?.company_name || 'Not specified', 'Company TIN', companyInfo?.company_tin || 'Not specified'],
    ['Tax Authority', companyInfo?.tax_authority || 'Not specified', 'Payroll Period', companyInfo?.payroll_month && companyInfo?.payroll_year ? `${companyInfo.payroll_month} ${companyInfo.payroll_year}` : 'Not specified']
  ];
  
  autoTable(doc, {
    body: summaryRow1,
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 30, fillColor: [245, 245, 245] },
      1: { cellWidth: 65 },
      2: { fontStyle: 'bold', cellWidth: 30, fillColor: [245, 245, 245] },
      3: { cellWidth: 65 }
    },
    margin: { left: margin, right: margin }
  });
  
  yPos = doc.lastAutoTable.finalY + 3;
  
  // Payroll Summary - Row 2: Financial Totals (horizontal)
  const summaryRow2 = [
    ['Employees', calculatedEmployees.length.toString(), 'Monthly Gross', formatCurrency(calculatedTotals.gross), 'Monthly Tax (PAYE)', formatCurrency(calculatedTotals.monthlyTax)],
    ['Monthly Net Pay', formatCurrency(calculatedTotals.netPay), 'Annual Tax', formatCurrency(calculatedTotals.tax), '', '']
  ];
  
  autoTable(doc, {
    body: summaryRow2,
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 30, fillColor: [34, 197, 94], textColor: [255, 255, 255] },
      1: { cellWidth: 45, halign: 'right' },
      2: { fontStyle: 'bold', cellWidth: 35, fillColor: [34, 197, 94], textColor: [255, 255, 255] },
      3: { cellWidth: 45, halign: 'right' },
      4: { fontStyle: 'bold', cellWidth: 40, fillColor: [34, 197, 94], textColor: [255, 255, 255] },
      5: { cellWidth: 45, halign: 'right' }
    },
    margin: { left: margin, right: margin }
  });
  
  yPos = doc.lastAutoTable.finalY + 8;
  
  // ============== SECTION 3: EMPLOYER PAYE SCHEDULE (Employee Details Table) - UNCHANGED ==============
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('EMPLOYER PAYE SCHEDULE', margin, yPos);
  yPos += 6;
  
  // Employee Schedule Table - NRS Compliant Columns (EXACTLY AS BEFORE)
  const tableData = calculatedEmployees.map((emp, index) => [
    index + 1,
    emp.name || 'N/A',
    emp.tin || 'N/A',
    formatCurrency(emp.basic_salary),
    formatCurrency(emp.housing_allowance),
    formatCurrency(emp.transport_allowance),
    formatCurrency((parseFloat(emp.meal_allowance) || 0) + (parseFloat(emp.utility_allowance) || 0) + (parseFloat(emp.medical_allowance) || 0) + (parseFloat(emp.other_allowances) || 0)),
    formatCurrency((parseFloat(emp.bik_vehicle_value) || 0) * 0.05 + (parseFloat(emp.bik_housing_value) || 0) * 0.20 + (parseFloat(emp.bonus) || 0)),
    formatCurrency(emp.result.annual_gross_income),
    formatCurrency(emp.result.total_reliefs),
    formatCurrency(emp.result.taxable_income),
    formatCurrency(emp.result.tax_due),
    formatCurrency(emp.result.monthly_tax)
  ]);
  
  autoTable(doc, {
    head: [['S/N', 'Employee Name', 'TIN', 'Basic (N)', 'Housing (N)', 'Transport (N)', 'Other Allow. (N)', 'BIK Taxable (N)', 'Annual Gross (N)', 'Reliefs (N)', 'Taxable Inc. (N)', 'Annual Tax (N)', 'Monthly PAYE (N)']],
    body: tableData,
    foot: [['', 'TOTAL', '', formatCurrency(calculatedTotals.basic), formatCurrency(calculatedTotals.housing), formatCurrency(calculatedTotals.transport), formatCurrency(calculatedTotals.other), formatCurrency(calculatedTotals.bik), formatCurrency(calculatedTotals.gross * 12), formatCurrency(calculatedTotals.reliefs), formatCurrency(calculatedTotals.taxable), formatCurrency(calculatedTotals.tax), formatCurrency(calculatedTotals.monthlyTax)]],
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7 },
    footStyles: { fillColor: [34, 197, 94], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 30 },
      2: { cellWidth: 20 },
      3: { cellWidth: 22, halign: 'right' },
      4: { cellWidth: 22, halign: 'right' },
      5: { cellWidth: 22, halign: 'right' },
      6: { cellWidth: 22, halign: 'right' },
      7: { cellWidth: 22, halign: 'right' },
      8: { cellWidth: 25, halign: 'right' },
      9: { cellWidth: 22, halign: 'right' },
      10: { cellWidth: 25, halign: 'right' },
      11: { cellWidth: 22, halign: 'right' },
      12: { cellWidth: 22, halign: 'right' }
    },
    margin: { left: margin, right: margin }
  });
  
  // Simple footer - page numbers only
  const pageCount = doc.internal.getNumberOfPages();
  const pageHeight = 210;
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Left side: Fiquant TaxPro branding
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text('Fiquant TaxPro', margin, pageHeight - 15);
    
    // Center: Website and copyright
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    const centerText = 'www.fiquanttaxpro.com | © 2026 Fiquant Consult';
    const centerX = pageWidth / 2;
    doc.text(centerText, centerX, pageHeight - 15, { align: 'center' });
    
    // Right side: Page number
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 25, pageHeight - 15);
    
    // Bottom line: Generated timestamp
    doc.setFontSize(8);
    doc.setTextColor(150, 130, 100);
    doc.text(`Generated: ${formatDate()}`, margin, pageHeight - 8);
  }
  
  doc.save(`Employer_PAYE_Schedule_${new Date().toISOString().split('T')[0]}.pdf`);
};

// ============================================================================
// VAT REPORT - Monthly VAT Return Schedule
// ============================================================================
export const generateVATReport = (vatInput, result) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const margin = 15;
  
  let yPos = addStatutoryHeader(doc, 'VAT COMPUTATION SCHEDULE', 'Monthly VAT Return - NTA 2025', true);
  
  // Business Information
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('SECTION A: BUSINESS IDENTIFICATION', margin, yPos);
  yPos += 6;
  
  const businessData = [
    ['Business Name', vatInput.business_name || 'Not Specified', 'TIN', vatInput.tin || 'Not Specified'],
    ['VAT Registration No.', vatInput.vat_reg_no || 'N/A', 'Return Period', vatInput.period || 'Monthly'],
    ['Business Address', vatInput.address || 'Not Specified', 'Industry Sector', vatInput.sector || 'Not Specified']
  ];
  
  autoTable(doc, {
    body: businessData,
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 9 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40, fillColor: [245, 245, 245] },
      1: { cellWidth: 80 },
      2: { fontStyle: 'bold', cellWidth: 40, fillColor: [245, 245, 245] },
      3: { cellWidth: 80 }
    },
    margin: { left: margin, right: margin }
  });
  
  yPos = doc.lastAutoTable.finalY + 8;
  
  // VAT Computation
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('SECTION B: VAT COMPUTATION', margin, yPos);
  yPos += 6;
  
  const vatComputationData = [
    ['A', 'Taxable Value/Standard Supplies', formatCurrency(vatInput.taxable_value || result.taxable_value || 0)],
    ['B', 'VAT Rate', '7.5%'],
    ['C', 'Output VAT (A x B)', formatCurrency(result.output_vat || result.vat_amount || 0)],
    ['D', 'Input VAT (Recoverable)', formatCurrency(vatInput.input_vat || 0)],
    ['E', 'Net VAT Payable/Refundable (C - D)', formatCurrency(result.net_vat || result.vat_amount || 0)]
  ];
  
  autoTable(doc, {
    head: [['Ref', 'Description', 'Amount (N)']],
    body: vatComputationData,
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 70 },
      2: { cellWidth: 50, halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: margin, right: margin }
  });
  
  addStatutoryFooter(doc, true);
  
  doc.save(`VAT_Schedule_${new Date().toISOString().split('T')[0]}.pdf`);
};

// ============================================================================
// CIT REPORT - Company Income Tax Schedule
// ============================================================================
export const generateCITReport = (citInput, result) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const margin = 15;
  
  let yPos = addStatutoryHeader(doc, 'COMPANY INCOME TAX SCHEDULE', 'CIT Annual Return - NTA 2025', true);
  
  // Company Information
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('SECTION A: COMPANY IDENTIFICATION', margin, yPos);
  yPos += 6;
  
  const companyData = [
    ['Company Name', citInput.company_name || 'Not Specified', 'TIN', citInput.tin || 'Not Specified'],
    ['RC Number', citInput.rc_number || 'N/A', 'Assessment Year', citInput.year || '2026'],
    ['Company Size', result.company_size || 'Not Classified', 'Industry Sector', citInput.sector || 'Not Specified']
  ];
  
  autoTable(doc, {
    body: companyData,
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 9 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40, fillColor: [245, 245, 245] },
      1: { cellWidth: 80 },
      2: { fontStyle: 'bold', cellWidth: 40, fillColor: [245, 245, 245] },
      3: { cellWidth: 80 }
    },
    margin: { left: margin, right: margin }
  });
  
  yPos = doc.lastAutoTable.finalY + 8;
  
  // Tax Computation
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('SECTION B: CIT COMPUTATION (NTA 2025)', margin, yPos);
  yPos += 6;
  
  const citComputationData = [
    ['A', 'Gross Revenue', formatCurrency(citInput.gross_revenue || result.gross_revenue || 0)],
    ['B', 'Less: Allowable Expenses', formatCurrency(citInput.allowable_expenses || result.allowable_expenses || 0)],
    ['C', 'Assessable Profit (A - B)', formatCurrency(result.assessable_profit || 0)],
    ['D', 'Less: Capital Allowances', formatCurrency(result.capital_allowances || 0)],
    ['E', 'Chargeable Profit (C - D)', formatCurrency(result.chargeable_profit || result.taxable_profit || 0)],
    ['F', 'CIT Rate', result.cit_rate || '30%'],
    ['G', 'Company Income Tax Payable', formatCurrency(result.cit_payable || result.tax_due || 0)],
    ['H', 'Development Levy (4% of Assessable Profit)', formatCurrency(result.development_levy || 0)],
    ['I', 'Total Tax Liability (G + H)', formatCurrency(result.total_tax_liability || result.tax_due || 0)]
  ];
  
  autoTable(doc, {
    head: [['Ref', 'Description', 'Amount (N)']],
    body: citComputationData,
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 80 },
      2: { cellWidth: 50, halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: margin, right: margin }
  });
  
  addStatutoryFooter(doc, true);
  
  doc.save(`CIT_Schedule_${citInput.company_name || 'Company'}_${new Date().toISOString().split('T')[0]}.pdf`);
};

// ============================================================================
// CGT REPORT - Capital Gains Tax Schedule
// ============================================================================
export const generateCGTReport = (cgtInput, result) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const margin = 15;
  
  let yPos = addStatutoryHeader(doc, 'CAPITAL GAINS TAX SCHEDULE', 'CGT Return - NTA 2025', true);
  
  // Taxpayer Information
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('SECTION A: TAXPAYER IDENTIFICATION', margin, yPos);
  yPos += 6;
  
  const taxpayerData = [
    ['Taxpayer Name', cgtInput.taxpayer_name || 'Not Specified', 'TIN', cgtInput.tin || 'Not Specified'],
    ['Assessment Year', cgtInput.year || '2026', 'Asset Type', cgtInput.asset_type || 'Not Specified']
  ];
  
  autoTable(doc, {
    body: taxpayerData,
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 9 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40, fillColor: [245, 245, 245] },
      1: { cellWidth: 80 },
      2: { fontStyle: 'bold', cellWidth: 40, fillColor: [245, 245, 245] },
      3: { cellWidth: 80 }
    },
    margin: { left: margin, right: margin }
  });
  
  yPos = doc.lastAutoTable.finalY + 8;
  
  // Asset Details
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('SECTION B: ASSET DISPOSAL DETAILS', margin, yPos);
  yPos += 6;
  
  const assetData = [
    ['Date of Acquisition', cgtInput.acquisition_date || 'N/A'],
    ['Date of Disposal', cgtInput.disposal_date || 'N/A'],
    ['Holding Period', result.holding_period || 'N/A'],
    ['Asset Description', cgtInput.asset_description || 'Not Specified']
  ];
  
  autoTable(doc, {
    body: assetData,
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 9 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50, fillColor: [245, 245, 245] },
      1: { cellWidth: 120 }
    },
    margin: { left: margin, right: margin }
  });
  
  yPos = doc.lastAutoTable.finalY + 8;
  
  // CGT Computation
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('SECTION C: CGT COMPUTATION (NTA 2025)', margin, yPos);
  yPos += 6;
  
  const cgtComputationData = [
    ['A', 'Disposal Proceeds', formatCurrency(cgtInput.disposal_proceeds || result.disposal_proceeds || 0)],
    ['B', 'Less: Cost of Acquisition', formatCurrency(cgtInput.acquisition_cost || result.acquisition_cost || 0)],
    ['C', 'Less: Incidental Costs (Improvement, Legal, etc.)', formatCurrency(cgtInput.incidental_costs || result.incidental_costs || 0)],
    ['D', 'Capital Gain/(Loss) (A - B - C)', formatCurrency(result.capital_gain || 0)],
    ['E', 'Exemption (if applicable)', formatCurrency(result.exemption || 0)],
    ['F', 'Chargeable Gain (D - E)', formatCurrency(result.chargeable_gain || result.taxable_gain || 0)],
    ['G', 'CGT Rate', result.cgt_rate || '10%'],
    ['H', 'Capital Gains Tax Payable', formatCurrency(result.cgt_payable || result.tax_due || 0)]
  ];
  
  autoTable(doc, {
    head: [['Ref', 'Description', 'Amount (N)']],
    body: cgtComputationData,
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 80 },
      2: { cellWidth: 50, halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: margin, right: margin }
  });
  
  addStatutoryFooter(doc, true);
  
  doc.save(`CGT_Schedule_${new Date().toISOString().split('T')[0]}.pdf`);
};

// ============================================================================
// WHT REPORT - Withholding Tax Schedule
// ============================================================================
export const generateWHTReport = (whtInput, result) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const margin = 15;
  
  let yPos = addStatutoryHeader(doc, 'WITHHOLDING TAX SCHEDULE', 'WHT Return - NTA 2025', true);
  
  // Transaction Details
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('SECTION A: TRANSACTION DETAILS', margin, yPos);
  yPos += 6;
  
  const transactionData = [
    ['Payer Name', whtInput.payer_name || 'Not Specified', 'Payer TIN', whtInput.payer_tin || 'Not Specified'],
    ['Payee/Vendor Name', whtInput.payee_name || 'Not Specified', 'Payee TIN', whtInput.payee_tin || 'Not Specified'],
    ['Transaction Date', whtInput.transaction_date || 'N/A', 'Invoice Reference', whtInput.invoice_ref || 'N/A'],
    ['Transaction Type', whtInput.transaction_type || 'Not Specified', 'Currency', whtInput.currency || 'NGN']
  ];
  
  autoTable(doc, {
    body: transactionData,
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 9 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40, fillColor: [245, 245, 245] },
      1: { cellWidth: 70 },
      2: { fontStyle: 'bold', cellWidth: 40, fillColor: [245, 245, 245] },
      3: { cellWidth: 70 }
    },
    margin: { left: margin, right: margin }
  });
  
  yPos = doc.lastAutoTable.finalY + 8;
  
  // WHT Computation
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('SECTION B: WHT COMPUTATION', margin, yPos);
  yPos += 6;
  
  const whtComputationData = [
    ['A', 'Gross Payment Amount', formatCurrency(whtInput.gross_amount || result.gross_amount || 0)],
    ['B', 'WHT Rate', result.wht_rate || whtInput.wht_rate || '10%'],
    ['C', 'WHT Amount Deducted (A x B)', formatCurrency(result.wht_amount || result.tax_amount || 0)],
    ['D', 'Net Payment to Payee (A - C)', formatCurrency(result.net_payment || 0)]
  ];
  
  autoTable(doc, {
    head: [['Ref', 'Description', 'Amount (N)']],
    body: whtComputationData,
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 80 },
      2: { cellWidth: 50, halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: margin, right: margin }
  });
  
  addStatutoryFooter(doc, true);
  
  doc.save(`WHT_Schedule_${new Date().toISOString().split('T')[0]}.pdf`);
};

// ============================================================================
// BULK VAT REPORT
// ============================================================================
export const generateBulkVATReport = (transactions) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const margin = 10;
  
  let yPos = addStatutoryHeader(doc, 'VAT TRANSACTION SCHEDULE', 'Monthly VAT Summary - NTA 2025', true);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Transactions: ${transactions.length}`, margin, yPos);
  yPos += 8;
  
  const tableData = transactions.filter(t => t.calculated && t.result).map((t, index) => [
    index + 1,
    t.invoice_ref || 'N/A',
    t.transaction_date || 'N/A',
    t.counterparty_name || 'N/A',
    t.counterparty_tin || 'N/A',
    t.description || 'N/A',
    formatCurrency(t.taxable_value),
    '7.5%',
    formatCurrency(t.result?.vat_amount || 0)
  ]);
  
  // Calculate totals
  const totalTaxable = transactions.filter(t => t.calculated).reduce((sum, t) => sum + (parseFloat(t.taxable_value) || 0), 0);
  const totalVAT = transactions.filter(t => t.calculated && t.result).reduce((sum, t) => sum + (t.result?.vat_amount || 0), 0);
  
  autoTable(doc, {
    head: [['S/N', 'Invoice Ref', 'Date', 'Counterparty', 'Counterparty TIN', 'Description', 'Taxable Value (N)', 'Rate', 'VAT Amount (N)']],
    body: tableData,
    foot: [['', '', '', '', '', 'TOTAL', formatCurrency(totalTaxable), '', formatCurrency(totalVAT)]],
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.5 },
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
    footStyles: { fillColor: [34, 197, 94], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 25 },
      2: { cellWidth: 22 },
      3: { cellWidth: 35 },
      4: { cellWidth: 25 },
      5: { cellWidth: 45 },
      6: { cellWidth: 30, halign: 'right' },
      7: { cellWidth: 15, halign: 'center' },
      8: { cellWidth: 30, halign: 'right' }
    },
    margin: { left: margin, right: margin }
  });
  
  addStatutoryFooter(doc, true);
  
  doc.save(`VAT_Schedule_${new Date().toISOString().split('T')[0]}.pdf`);
};

// ============================================================================
// BULK WHT REPORT (Vendor Payments)
// ============================================================================
export const generateBulkWHTReport = (payments) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const margin = 10;
  
  let yPos = addStatutoryHeader(doc, 'WITHHOLDING TAX SCHEDULE', 'WHT Summary - NTA 2025', true);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Payments: ${payments.length}`, margin, yPos);
  yPos += 8;
  
  const tableData = payments.filter(p => p.calculated && p.result).map((p, index) => [
    index + 1,
    p.invoice_ref || 'N/A',
    p.payment_date || 'N/A',
    p.vendor_name || 'N/A',
    p.vendor_tin || 'N/A',
    p.payment_type || 'N/A',
    formatCurrency(p.gross_amount),
    p.result?.wht_rate || '10%',
    formatCurrency(p.result?.wht_amount || 0),
    formatCurrency(p.result?.net_amount || 0)
  ]);
  
  // Calculate totals
  const totalGross = payments.filter(p => p.calculated).reduce((sum, p) => sum + (parseFloat(p.gross_amount) || 0), 0);
  const totalWHT = payments.filter(p => p.calculated && p.result).reduce((sum, p) => sum + (p.result?.wht_amount || 0), 0);
  const totalNet = payments.filter(p => p.calculated && p.result).reduce((sum, p) => sum + (p.result?.net_amount || 0), 0);
  
  autoTable(doc, {
    head: [['S/N', 'Invoice Ref', 'Date', 'Vendor Name', 'Vendor TIN', 'Payment Type', 'Gross (N)', 'Rate', 'WHT (N)', 'Net (N)']],
    body: tableData,
    foot: [['', '', '', '', '', 'TOTAL', formatCurrency(totalGross), '', formatCurrency(totalWHT), formatCurrency(totalNet)]],
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.5 },
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
    footStyles: { fillColor: [34, 197, 94], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 22 },
      2: { cellWidth: 20 },
      3: { cellWidth: 35 },
      4: { cellWidth: 22 },
      5: { cellWidth: 30 },
      6: { cellWidth: 28, halign: 'right' },
      7: { cellWidth: 15, halign: 'center' },
      8: { cellWidth: 28, halign: 'right' },
      9: { cellWidth: 28, halign: 'right' }
    },
    margin: { left: margin, right: margin }
  });
  
  addStatutoryFooter(doc, true);
  
  doc.save(`WHT_Schedule_${new Date().toISOString().split('T')[0]}.pdf`);
};

// ============================================================================
// PAYMENT PROCESSING REPORT - WHT/VAT on Vendor Payments
// ============================================================================
export const generatePaymentProcessingReport = (paymentInput, result) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const margin = 15;
  
  let yPos = addStatutoryHeader(doc, 'VENDOR PAYMENT TAX SCHEDULE', 'WHT/VAT Payment Processing - NTA 2025', true);
  
  // Transaction Details
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('SECTION A: TRANSACTION DETAILS', margin, yPos);
  yPos += 6;
  
  const transactionData = [
    ['Payee/Vendor Name', paymentInput.payee_name || 'Not Specified', 'Payee TIN', paymentInput.tin || 'Not Specified'],
    ['Transaction Type', paymentInput.transaction_type || 'N/A', 'Residency Status', paymentInput.is_resident ? 'Resident' : 'Non-Resident'],
    ['Transaction Period', `${paymentInput.month || ''} ${paymentInput.year || ''}`, 'Transaction Details', paymentInput.transaction_details || 'N/A']
  ];
  
  autoTable(doc, {
    body: transactionData,
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 9 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40, fillColor: [245, 245, 245] },
      1: { cellWidth: 80 },
      2: { fontStyle: 'bold', cellWidth: 40, fillColor: [245, 245, 245] },
      3: { cellWidth: 80 }
    },
    margin: { left: margin, right: margin }
  });
  
  yPos = doc.lastAutoTable.finalY + 8;
  
  // Tax Computation
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('SECTION B: TAX COMPUTATION', margin, yPos);
  yPos += 6;
  
  const taxComputationData = [
    ['A', 'Contract/Invoice Amount', formatCurrency(paymentInput.contract_amount || result.contract_amount || 0)],
    ['B', 'VAT Applicable', result.vat_applicable ? 'Yes' : 'No (Exempt)'],
    ['C', 'VAT Rate', result.vat_rate ? `${(result.vat_rate * 100).toFixed(1)}%` : '0%'],
    ['D', 'VAT Amount', formatCurrency(result.vat_amount || 0)],
    ['E', 'WHT Rate', result.wht_rate ? `${(result.wht_rate * 100).toFixed(1)}%` : '0%'],
    ['F', 'WHT Amount Deducted', formatCurrency(result.wht_amount || 0)],
    ['G', 'Total Deductions (VAT + WHT)', formatCurrency((result.vat_amount || 0) + (result.wht_amount || 0))],
    ['H', 'Net Amount Payable to Vendor', formatCurrency(result.net_amount || result.net_payment || 0)]
  ];
  
  autoTable(doc, {
    head: [['Ref', 'Description', 'Amount (N)']],
    body: taxComputationData,
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 80 },
      2: { cellWidth: 50, halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: margin, right: margin }
  });
  
  yPos = doc.lastAutoTable.finalY + 8;
  
  // Summary Box
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('SECTION C: PAYMENT SUMMARY', margin, yPos);
  yPos += 6;
  
  const summaryData = [
    ['Gross Amount', formatCurrency(paymentInput.contract_amount || result.contract_amount || 0)],
    ['Less: WHT Deducted', formatCurrency(result.wht_amount || 0)],
    ['Net Payment to Vendor', formatCurrency(result.net_amount || result.net_payment || 0)],
    ['VAT to Remit (if applicable)', formatCurrency(result.vat_amount || 0)]
  ];
  
  autoTable(doc, {
    body: summaryData,
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    bodyStyles: { fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 60, fillColor: [245, 245, 245] },
      1: { cellWidth: 50, halign: 'right' }
    },
    margin: { left: margin, right: margin }
  });
  
  addStatutoryFooter(doc, true);
  
  doc.save(`Payment_Processing_${paymentInput.payee_name || 'Vendor'}_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Backward compatibility alias for generateCITReport
export const generateCitReport = generateCITReport;

// Backward compatibility alias for generateCGTReport
export const generateCgtReport = generateCGTReport;

// Backward compatibility alias for generateVATReport
export const generateVatReport = generateVATReport;

// Alias for email functionality (not currently implemented, placeholder)
export const emailCitReport = async (citInput, result, email) => {
  console.log('Email CIT report not yet implemented');
  return false;
};

export default {
  generatePayeReport,
  generatePayeReportAsBase64,
  generateBulkPayeReport,
  generateVATReport,
  generateVatReport,
  generateCITReport,
  generateCitReport,
  generateCGTReport,
  generateCgtReport,
  generateWHTReport,
  generateBulkVATReport,
  generateBulkWHTReport,
  generatePaymentProcessingReport
};
