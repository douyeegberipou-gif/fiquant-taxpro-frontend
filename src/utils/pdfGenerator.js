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
    doc.text('Fiquant TaxPro™', margin, pageHeight - 10);
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
  const pageHeight = 210;
  const margin = 10;
  
  let yPos = 15;
  
  // ===== MAIN TITLE - Centered at top =====
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('PAYE TAX COMPUTATION SCHEDULE', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;
  
  // ===== SECTION 1: TAXPAYER INFORMATION (Horizontal Header) =====
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Taxpayer Information', margin, yPos);
  yPos += 6;
  
  // Taxpayer Info Row 1 - horizontal layout
  const taxpayerInfoRow1 = [
    ['Taxpayer Name', taxInput.staff_name || 'Not specified', 'Tax ID (TIN)', taxInput.tin || 'Not specified']
  ];
  
  autoTable(doc, {
    body: taxpayerInfoRow1,
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 30, fillColor: [245, 245, 245] },
      1: { cellWidth: 100 },
      2: { fontStyle: 'bold', cellWidth: 30, fillColor: [245, 245, 245] },
      3: { cellWidth: 50 }
    },
    margin: { left: margin, right: margin }
  });
  yPos = doc.lastAutoTable.finalY + 2;
  
  // Taxpayer Info Row 2 - horizontal layout
  const taxpayerInfoRow2 = [
    ['Assessment Year', taxInput.year || '2026', 'State of Residence', taxInput.state_of_residence || 'Not specified']
  ];
  
  autoTable(doc, {
    body: taxpayerInfoRow2,
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 30, fillColor: [245, 245, 245] },
      1: { cellWidth: 100 },
      2: { fontStyle: 'bold', cellWidth: 30, fillColor: [245, 245, 245] },
      3: { cellWidth: 50 }
    },
    margin: { left: margin, right: margin }
  });
  yPos = doc.lastAutoTable.finalY + 2;
  
  // Generated timestamp
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${formatDate()} | NTA 2025 Compliant | Form H1`, margin, yPos + 4);
  doc.setTextColor(0, 0, 0);
  yPos += 10;
  
  // ===== SECTION 2: INCOME SUMMARY (Horizontal) =====
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Income Summary', margin, yPos);
  yPos += 6;
  
  // Financial Summary Row - horizontal layout with key figures
  const incomeSummaryRow = [
    ['Gross Income', formatCurrency(result.annual_gross_income || 0), 'Total Reliefs', formatCurrency(result.total_reliefs || 0), 'Annual Tax Due', formatCurrency(result.tax_due || 0)]
  ];
  
  autoTable(doc, {
    body: incomeSummaryRow,
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 28, fillColor: [59, 130, 246], textColor: [255, 255, 255] },
      1: { cellWidth: 50, halign: 'right' },
      2: { fontStyle: 'bold', cellWidth: 28, fillColor: [34, 197, 94], textColor: [255, 255, 255] },
      3: { cellWidth: 50, halign: 'right' },
      4: { fontStyle: 'bold', cellWidth: 30, fillColor: [220, 38, 38], textColor: [255, 255, 255] },
      5: { cellWidth: 50, halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: margin, right: margin }
  });
  yPos = doc.lastAutoTable.finalY + 8;
  
  // Calculate all values upfront
  const monthlyBasic = parseFloat(taxInput.basic_salary) || 0;
  const monthlyHousing = parseFloat(taxInput.housing_allowance) || 0;
  const monthlyTransport = parseFloat(taxInput.transport_allowance) || 0;
  const monthlyMeal = parseFloat(taxInput.meal_allowance) || 0;
  const monthlyUtility = parseFloat(taxInput.utility_allowance) || 0;
  const monthlyMedical = parseFloat(taxInput.medical_allowance) || 0;
  const monthlyOther = parseFloat(taxInput.other_allowances) || 0;
  const monthlyTotal = monthlyBasic + monthlyHousing + monthlyTransport + monthlyMeal + monthlyUtility + monthlyMedical + monthlyOther;
  const annualTotal = monthlyTotal * 12;
  
  const bikVehicle = parseFloat(taxInput.bik_vehicle_value) || parseFloat(result.bik_vehicle_value) || 0;
  const bikHousing = parseFloat(taxInput.bik_housing_value) || parseFloat(result.bik_housing_value) || 0;
  const bonus = parseFloat(taxInput.bonus) || parseFloat(result.bonus) || 0;
  const hasBIK = bikVehicle > 0 || bikHousing > 0 || bonus > 0;
  const totalBikTaxable = (bikVehicle * 0.05) + (bikHousing * 0.20) + bonus;
  
  const pensionMonthly = parseFloat(taxInput.pension_contribution) || (monthlyBasic + monthlyHousing + monthlyTransport) * 0.08;
  const nhfMonthly = parseFloat(taxInput.nhf_contribution) || 0;
  const lifeInsurance = parseFloat(taxInput.life_insurance_premium) || 0;
  const healthInsurance = parseFloat(taxInput.health_insurance_premium) || 0;
  const nhis = parseFloat(taxInput.nhis_contribution) || 0;
  const rentRelief = parseFloat(result.rent_relief) || 0;
  const mortgageRelief = parseFloat(taxInput.mortgage_interest) || 0;
  const totalAnnualReliefs = parseFloat(result.total_reliefs) || 0;
  
  // Define column positions for compact 2-column layout
  const col1Start = margin;
  const col2Start = pageWidth / 2 + 5;
  const colWidth = (pageWidth - margin * 2 - 10) / 2;
  
  // ============== ROW 1: SECTION A (Left) & SECTION B + D (Right) ==============
  const row1Y = yPos;
  
  // SECTION A: SCHEDULE OF EMOLUMENTS (Left)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text('A. Schedule of Emoluments', col1Start, row1Y);
  doc.setTextColor(0, 0, 0);
  
  const emolumentsData = [
    ['Basic Salary', formatCurrency(monthlyBasic), formatCurrency(monthlyBasic * 12)],
    ['Housing Allowance', formatCurrency(monthlyHousing), formatCurrency(monthlyHousing * 12)],
    ['Transport Allowance', formatCurrency(monthlyTransport), formatCurrency(monthlyTransport * 12)],
    ['Meal Allowance', formatCurrency(monthlyMeal), formatCurrency(monthlyMeal * 12)],
    ['Utility Allowance', formatCurrency(monthlyUtility), formatCurrency(monthlyUtility * 12)],
    ['Medical Allowance', formatCurrency(monthlyMedical), formatCurrency(monthlyMedical * 12)],
    ['Other Allowances', formatCurrency(monthlyOther), formatCurrency(monthlyOther * 12)]
  ];
  
  autoTable(doc, {
    head: [['Component', 'Monthly', 'Annual']],
    body: emolumentsData,
    foot: [['TOTAL EMOLUMENTS', formatCurrency(monthlyTotal), formatCurrency(annualTotal)]],
    startY: row1Y + 2,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.2 },
    headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
    footStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: colWidth * 0.44 },
      1: { cellWidth: colWidth * 0.28, halign: 'right' },
      2: { cellWidth: colWidth * 0.28, halign: 'right' }
    },
    tableWidth: colWidth,
    margin: { left: col1Start }
  });
  const emolEndY = doc.lastAutoTable.finalY;
  
  // RIGHT COLUMN: SECTION B (BIK) + SECTION D (Tax Computation)
  let rightColY = row1Y;
  
  // SECTION B: BENEFITS IN KIND (Right - Top)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(139, 92, 246);
  doc.text('B. Benefits in Kind', col2Start, rightColY);
  doc.setTextColor(0, 0, 0);
  
  if (hasBIK) {
    const bikData = [];
    if (bikVehicle > 0) bikData.push(['Motor Vehicle (5%)', formatCurrency(bikVehicle), formatCurrency(bikVehicle * 0.05)]);
    if (bikHousing > 0) bikData.push(['Housing BIK (20%)', formatCurrency(bikHousing), formatCurrency(bikHousing * 0.20)]);
    if (bonus > 0) bikData.push(['Bonus (100%)', formatCurrency(bonus), formatCurrency(bonus)]);
    
    autoTable(doc, {
      head: [['BIK Type', 'Value', 'Taxable']],
      body: bikData,
      foot: [['TOTAL BIK', '', formatCurrency(totalBikTaxable)]],
      startY: rightColY + 2,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 1.2 },
      headStyles: { fillColor: [139, 92, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
      footStyles: { fillColor: [139, 92, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: colWidth * 0.44 },
        1: { cellWidth: colWidth * 0.28, halign: 'right' },
        2: { cellWidth: colWidth * 0.28, halign: 'right' }
      },
      tableWidth: colWidth,
      margin: { left: col2Start }
    });
  } else {
    autoTable(doc, {
      body: [['No Benefits in Kind reported', '-', '-']],
      startY: rightColY + 2,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 1.2, textColor: [120, 120, 120] },
      columnStyles: {
        0: { cellWidth: colWidth * 0.5 },
        1: { cellWidth: colWidth * 0.25, halign: 'right' },
        2: { cellWidth: colWidth * 0.25, halign: 'right' }
      },
      tableWidth: colWidth,
      margin: { left: col2Start }
    });
  }
  rightColY = doc.lastAutoTable.finalY + 3;
  
  // SECTION D: TAX COMPUTATION (Right - Below BIK)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 38, 38);
  doc.text('D. Tax Computation', col2Start, rightColY);
  doc.setTextColor(0, 0, 0);
  
  const taxComputationData = [
    ['Total Annual Gross Income', formatCurrency(result.annual_gross_income)],
    ['Less: Total Reliefs', formatCurrency(result.total_reliefs)],
    ['Chargeable Income', formatCurrency(result.taxable_income)],
    ['Effective Tax Rate', formatPercentage(result.effective_tax_rate)]
  ];
  
  autoTable(doc, {
    body: taxComputationData,
    startY: rightColY + 2,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.2 },
    columnStyles: {
      0: { cellWidth: colWidth * 0.55, fillColor: [250, 250, 250] },
      1: { cellWidth: colWidth * 0.45, halign: 'right', fontStyle: 'bold' }
    },
    tableWidth: colWidth,
    margin: { left: col2Start }
  });
  
  // TAX PAYABLE highlight box
  autoTable(doc, {
    body: [['ANNUAL TAX PAYABLE', formatCurrency(result.tax_due || 0)]],
    startY: doc.lastAutoTable.finalY,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: colWidth * 0.55, fillColor: [220, 38, 38], textColor: [255, 255, 255] },
      1: { cellWidth: colWidth * 0.45, halign: 'right', fillColor: [254, 242, 242], textColor: [220, 38, 38] }
    },
    tableWidth: colWidth,
    margin: { left: col2Start }
  });
  const rightEndY = doc.lastAutoTable.finalY;
  
  // ============== ROW 2: SECTION C (Left) & SECTION E + F (Right) ==============
  const row2Y = Math.max(emolEndY, rightEndY) + 4;
  
  // SECTION C: STATUTORY DEDUCTIONS & RELIEFS (Left)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(34, 197, 94);
  doc.text('C. Statutory Deductions & Reliefs', col1Start, row2Y);
  doc.setTextColor(0, 0, 0);
  
  const deductionsData = [
    ['Pension (8%)', formatCurrency(pensionMonthly), formatCurrency(pensionMonthly * 12)],
    ['NHF (2.5%)', formatCurrency(nhfMonthly), formatCurrency(nhfMonthly * 12)],
    ['Life Insurance', formatCurrency(lifeInsurance), formatCurrency(lifeInsurance * 12)],
    ['Health Insurance', formatCurrency(healthInsurance), formatCurrency(healthInsurance * 12)],
    ['NHIS', formatCurrency(nhis), formatCurrency(nhis * 12)],
    ['Rent Relief', '-', formatCurrency(rentRelief)],
    ['Mortgage Interest', '-', formatCurrency(mortgageRelief)]
  ];
  
  autoTable(doc, {
    head: [['Relief Type', 'Monthly', 'Annual']],
    body: deductionsData,
    foot: [['TOTAL RELIEFS', '', formatCurrency(totalAnnualReliefs)]],
    startY: row2Y + 2,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.2 },
    headStyles: { fillColor: [34, 197, 94], textColor: [255, 255, 255], fontStyle: 'bold' },
    footStyles: { fillColor: [34, 197, 94], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: colWidth * 0.44 },
      1: { cellWidth: colWidth * 0.28, halign: 'right' },
      2: { cellWidth: colWidth * 0.28, halign: 'right' }
    },
    tableWidth: colWidth,
    margin: { left: col1Start }
  });
  const deductionsEndY = doc.lastAutoTable.finalY;
  
  // RIGHT COLUMN: SECTION E (Tax Brackets) + SECTION F (Monthly Summary)
  let rightCol2Y = row2Y;
  
  // SECTION E: TAX BRACKET BREAKDOWN (Right - Top)
  if (result.tax_breakdown && result.tax_breakdown.length > 0) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(234, 179, 8);
    doc.text('E. Tax Bracket Breakdown', col2Start, rightCol2Y);
    doc.setTextColor(0, 0, 0);
    
    const bracketData = result.tax_breakdown.map(bracket => {
      let rangeText = bracket.range || 'N/A';
      rangeText = rangeText.replace(/₦/g, 'N').replace(/\u20a6/g, 'N');
      return [rangeText, bracket.rate || '0%', formatCurrency(bracket.taxable_amount || 0), formatCurrency(bracket.tax_amount || 0)];
    });
    
    const totalTaxable = result.tax_breakdown.reduce((sum, b) => sum + (parseFloat(b.taxable_amount) || 0), 0);
    const totalTax = result.tax_breakdown.reduce((sum, b) => sum + (parseFloat(b.tax_amount) || 0), 0);
    
    autoTable(doc, {
      head: [['Income Band', 'Rate', 'Taxable', 'Tax']],
      body: bracketData,
      foot: [['TOTAL', '', formatCurrency(totalTaxable), formatCurrency(totalTax)]],
      startY: rightCol2Y + 2,
      theme: 'grid',
      styles: { fontSize: 6.5, cellPadding: 1 },
      headStyles: { fillColor: [234, 179, 8], textColor: [0, 0, 0], fontStyle: 'bold' },
      footStyles: { fillColor: [234, 179, 8], textColor: [0, 0, 0], fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: colWidth * 0.38 },
        1: { cellWidth: colWidth * 0.12, halign: 'center' },
        2: { cellWidth: colWidth * 0.25, halign: 'right' },
        3: { cellWidth: colWidth * 0.25, halign: 'right' }
      },
      tableWidth: colWidth,
      margin: { left: col2Start }
    });
    rightCol2Y = doc.lastAutoTable.finalY + 3;
  }
  
  // SECTION F: MONTHLY PAYE SUMMARY (Right - Below Tax Brackets)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 100, 100);
  doc.text('F. Monthly PAYE Summary', col2Start, rightCol2Y);
  doc.setTextColor(0, 0, 0);
  
  const monthlySummaryData = [
    ['Monthly Gross Income', formatCurrency(result.monthly_gross_income)],
    ['Monthly PAYE Deduction', formatCurrency(result.monthly_tax)],
    ['Monthly Net Income', formatCurrency(result.monthly_net_income)]
  ];
  
  autoTable(doc, {
    body: monthlySummaryData,
    startY: rightCol2Y + 2,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.5 },
    columnStyles: {
      0: { cellWidth: colWidth * 0.55, fillColor: [250, 250, 250] },
      1: { cellWidth: colWidth * 0.45, halign: 'right', fontStyle: 'bold' }
    },
    tableWidth: colWidth,
    margin: { left: col2Start }
  });
  
  // ===== FOOTER =====
  const footerY = pageHeight - 12;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
  doc.text('Fiquant TaxPro™ | www.fiquanttaxpro.com | This computation is for guidance only. Consult a tax professional for official filings.', margin, footerY);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - margin, footerY, { align: 'right' });
  
  doc.save(`PAYE_Statutory_Report_${taxInput.staff_name || 'Employee'}_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Generate Single PAYE Report and return as Base64
export const generatePayeReportAsBase64 = (taxInput, result) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = 297;
  const margin = 10;
  
  let yPos = 15;
  
  // Taxpayer Information Header
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Taxpayer Information', margin, yPos);
  yPos += 6;
  
  const taxpayerData = [
    ['Taxpayer Name', taxInput.staff_name || 'Not Specified', 'TIN', taxInput.tin || 'Not Specified'],
    ['Year', taxInput.year || '2026', 'State', taxInput.state_of_residence || 'Not Specified']
  ];
  
  autoTable(doc, {
    body: taxpayerData,
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 30, fillColor: [245, 245, 245] },
      1: { cellWidth: 100 },
      2: { fontStyle: 'bold', cellWidth: 30, fillColor: [245, 245, 245] },
      3: { cellWidth: 50 }
    },
    margin: { left: margin, right: margin }
  });
  
  yPos = doc.lastAutoTable.finalY + 6;
  
  // Income Summary
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Income Summary', margin, yPos);
  yPos += 6;
  
  const summaryRow = [
    ['Gross Income', formatCurrency(result.annual_gross_income || 0), 'Total Reliefs', formatCurrency(result.total_reliefs || 0), 'Tax Due', formatCurrency(result.tax_due || 0)]
  ];
  
  autoTable(doc, {
    body: summaryRow,
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 28, fillColor: [59, 130, 246], textColor: [255, 255, 255] },
      1: { cellWidth: 45, halign: 'right' },
      2: { fontStyle: 'bold', cellWidth: 28, fillColor: [34, 197, 94], textColor: [255, 255, 255] },
      3: { cellWidth: 45, halign: 'right' },
      4: { fontStyle: 'bold', cellWidth: 25, fillColor: [220, 38, 38], textColor: [255, 255, 255] },
      5: { cellWidth: 45, halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: margin, right: margin }
  });
  
  yPos = doc.lastAutoTable.finalY + 8;
  
  // Detailed summary table
  const detailData = [
    ['Annual Gross Income', formatCurrency(result.annual_gross_income)],
    ['Total Reliefs', formatCurrency(result.total_reliefs)],
    ['Taxable Income', formatCurrency(result.taxable_income)],
    ['Annual Tax Due', formatCurrency(result.tax_due)],
    ['Monthly PAYE', formatCurrency(result.monthly_tax)],
    ['Monthly Net Income', formatCurrency(result.monthly_net_income)]
  ];
  
  autoTable(doc, {
    head: [['Description', 'Amount (₦)']],
    body: detailData,
    startY: yPos,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 60, fillColor: [250, 250, 250] },
      1: { cellWidth: 50, halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: margin, right: margin }
  });
  
  // Footer
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text('Fiquant TaxPro™ | Generated: ' + formatDate(), margin, 200);
  
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
    
    // Left side: Fiquant TaxPro™ branding
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text('Fiquant TaxPro™', margin, pageHeight - 15);
    
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
// VAT REPORT - Monthly VAT Return Schedule (Clean Version - No Header)
// ============================================================================
export const generateVATReport = (vatInput, result) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const margin = 15;
  const pageWidth = 297;
  
  let yPos = 15;
  
  // Document Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('VAT COMPUTATION SCHEDULE', margin, yPos);
  yPos += 6;
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Monthly VAT Return - NTA 2025', margin, yPos);
  yPos += 4;
  doc.setFontSize(8);
  doc.text(`Generated: ${formatDate()}`, margin, yPos);
  yPos += 10;
  
  // Business Information
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('SECTION A: BUSINESS IDENTIFICATION', margin, yPos);
  yPos += 6;
  
  const businessData = [
    ['Company Name', vatInput.company_name || result.company_name || 'Not Specified', 'TIN', vatInput.tin || 'Not Specified'],
    ['Tax Authority', vatInput.tax_authority || 'Not Specified', 'Return Period', vatInput.month || result.month || 'Monthly']
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
  
  // Sales Breakdown
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('SECTION B: SALES BREAKDOWN', margin, yPos);
  yPos += 6;
  
  const salesBreakdownData = [
    ['A', 'Total Sales', formatCurrency(result.total_sales || 0)],
    ['B', 'Standard Rated Sales (7.5%)', formatCurrency(result.standard_rated_sales || 0)],
    ['C', 'VAT Exempt Sales', formatCurrency(result.vat_exempt_sales || 0)],
    ['D', 'Zero-Rated Sales', formatCurrency(result.zero_rated_sales || 0)]
  ];
  
  autoTable(doc, {
    head: [['Ref', 'Description', 'Amount (N)']],
    body: salesBreakdownData,
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 80 },
      2: { cellWidth: 50, halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: margin, right: margin }
  });
  
  yPos = doc.lastAutoTable.finalY + 8;
  
  // VAT Computation
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('SECTION C: VAT COMPUTATION', margin, yPos);
  yPos += 6;
  
  const vatComputationData = [
    ['E', 'VAT Rate', `${result.vat_rate || 7.5}%`],
    ['F', 'Output VAT Due', formatCurrency(result.output_vat || 0)]
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
      1: { cellWidth: 80 },
      2: { cellWidth: 50, halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: margin, right: margin }
  });
  
  yPos = doc.lastAutoTable.finalY + 8;
  
  // Transaction Breakdown (if available)
  if (result.transaction_breakdown && result.transaction_breakdown.length > 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('SECTION D: TRANSACTION BREAKDOWN', margin, yPos);
    yPos += 6;
    
    const transactionData = result.transaction_breakdown.map((t, idx) => [
      idx + 1,
      t.description || `Transaction ${idx + 1}`,
      t.type || 'N/A',
      t.category ? t.category.replace('_', ' ').toUpperCase() : 'N/A',
      formatCurrency(t.amount || 0),
      formatCurrency(t.vat_amount || 0)
    ]);
    
    autoTable(doc, {
      head: [['S/N', 'Description', 'Type', 'Category', 'Amount (N)', 'VAT (N)']],
      body: transactionData,
      startY: yPos,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [34, 197, 94], textColor: [255, 255, 255] },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 50 },
        2: { cellWidth: 40 },
        3: { cellWidth: 30 },
        4: { cellWidth: 35, halign: 'right' },
        5: { cellWidth: 35, halign: 'right' }
      },
      margin: { left: margin, right: margin }
    });
  }
  
  // Simple footer
  const pageCount = doc.internal.getNumberOfPages();
  const pageHeight = 210;
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Fiquant TaxPro™ | www.fiquanttaxpro.com', margin, pageHeight - 10);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 25, pageHeight - 10);
  }
  
  doc.save(`VAT_Schedule_${vatInput.company_name || 'Company'}_${new Date().toISOString().split('T')[0]}.pdf`);
};

// ============================================================================
// CIT REPORT - Company Income Tax Schedule (Clean Version - No Header)
// ============================================================================
export const generateCITReport = (citInput, result) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const margin = 10;
  const pageWidth = 297;
  const pageHeight = 210;
  const leftColStart = margin;
  const rightColStart = 150;
  
  let yPos = 15;
  
  // ===== MAIN TITLE - Centered at top =====
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('CIT TAX COMPUTATION SCHEDULE', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;
  
  // ===== SECTION 1: TAXPAYER INFORMATION (Horizontal Header - matching PAYE format) =====
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Taxpayer Information', margin, yPos);
  yPos += 6;
  
  // Taxpayer Info Row 1 - horizontal layout (4 columns)
  const taxpayerInfoRow1 = [
    ['Taxpayer Name', citInput.company_name || 'Not specified', 'Tax ID (TIN)', citInput.tin || 'Not specified']
  ];
  
  autoTable(doc, {
    body: taxpayerInfoRow1,
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 35, fillColor: [245, 245, 245] },
      1: { cellWidth: 95 },
      2: { fontStyle: 'bold', cellWidth: 30, fillColor: [245, 245, 245] },
      3: { cellWidth: 55 }
    },
    margin: { left: margin, right: margin }
  });
  yPos = doc.lastAutoTable.finalY + 2;
  
  // Taxpayer Info Row 2 - horizontal layout (4 columns)
  const taxpayerInfoRow2 = [
    ['Assessment Year', citInput.year_of_assessment || new Date().getFullYear().toString(), 'Tax Year', citInput.tax_year || `${(parseInt(citInput.year_of_assessment) || new Date().getFullYear()) - 1}`]
  ];
  
  autoTable(doc, {
    body: taxpayerInfoRow2,
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 35, fillColor: [245, 245, 245] },
      1: { cellWidth: 95 },
      2: { fontStyle: 'bold', cellWidth: 30, fillColor: [245, 245, 245] },
      3: { cellWidth: 55 }
    },
    margin: { left: margin, right: margin }
  });
  yPos = doc.lastAutoTable.finalY + 2;
  
  // Taxpayer Info Row 3 - Company Size and Effective Tax Rate
  const effectiveRate = result.taxable_profit > 0 ? ((result.total_tax_due / result.taxable_profit) * 100).toFixed(2) : '0.00';
  const taxpayerInfoRow3 = [
    ['Company Size', result.company_size || 'Medium', 'Effective Tax Rate', `${effectiveRate}%`]
  ];
  
  autoTable(doc, {
    body: taxpayerInfoRow3,
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 35, fillColor: [245, 245, 245] },
      1: { cellWidth: 95 },
      2: { fontStyle: 'bold', cellWidth: 30, fillColor: [245, 245, 245] },
      3: { cellWidth: 55 }
    },
    margin: { left: margin, right: margin }
  });
  yPos = doc.lastAutoTable.finalY + 2;
  
  // Taxpayer Info Row 4 - Compliance Deadlines
  const taxpayerInfoRow4 = [
    ['Filing Deadline', result.filing_deadline || '90 days after year-end', 'Payment Deadline', result.payment_deadline || '60 days after year-end']
  ];
  
  autoTable(doc, {
    body: taxpayerInfoRow4,
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 35, fillColor: [245, 245, 245] },
      1: { cellWidth: 95 },
      2: { fontStyle: 'bold', cellWidth: 30, fillColor: [245, 245, 245] },
      3: { cellWidth: 55 }
    },
    margin: { left: margin, right: margin }
  });
  yPos = doc.lastAutoTable.finalY + 2;
  
  // Taxpayer Info Row 5 - Annual Turnover
  const taxpayerInfoRow5 = [
    ['Annual Turnover', formatCurrency(citInput.annual_turnover || 0), '', '']
  ];
  
  autoTable(doc, {
    body: taxpayerInfoRow5,
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 35, fillColor: [245, 245, 245] },
      1: { cellWidth: 95 },
      2: { fontStyle: 'bold', cellWidth: 30, fillColor: [245, 245, 245] },
      3: { cellWidth: 55 }
    },
    margin: { left: margin, right: margin }
  });
  yPos = doc.lastAutoTable.finalY + 2;
  
  // Generated timestamp
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${formatDate()} | NTA 2025 Compliant | CIT Form`, margin, yPos + 4);
  doc.setTextColor(0, 0, 0);
  yPos += 10;
  
  // ===== SECTION 2: FINANCIAL SUMMARY (Horizontal - matching PAYE Income Summary) =====
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Financial Summary', margin, yPos);
  yPos += 6;
  
  // Financial Summary Row - horizontal layout with key figures (matching PAYE)
  const financialSummaryRow = [
    ['Gross Revenue', formatCurrency(result.gross_income || citInput.gross_income || 0), 'Taxable Profit', formatCurrency(result.taxable_profit || 0), 'Net Tax Payable', formatCurrency(result.net_tax_payable || result.total_tax_due || 0)]
  ];
  
  autoTable(doc, {
    body: financialSummaryRow,
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 28, fillColor: [59, 130, 246], textColor: [255, 255, 255] },
      1: { cellWidth: 50, halign: 'right' },
      2: { fontStyle: 'bold', cellWidth: 28, fillColor: [34, 197, 94], textColor: [255, 255, 255] },
      3: { cellWidth: 50, halign: 'right' },
      4: { fontStyle: 'bold', cellWidth: 35, fillColor: [220, 38, 38], textColor: [255, 255, 255] },
      5: { cellWidth: 50, halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: margin, right: margin }
  });
  yPos = doc.lastAutoTable.finalY + 8;
  
  // ===== TWO-COLUMN COMPUTATION LAYOUT (matching PAYE structure) =====
  const col1Start = margin;
  const col2Start = pageWidth / 2 + 5;
  const colWidth = (pageWidth - margin * 2 - 10) / 2;
  
  // ============== ROW 1: SECTION A (Left) & SECTION B + D (Right) ==============
  const row1Y = yPos;
  
  // SECTION A: INCOME & EXPENSES (Left)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text('A. Income & Expenses', col1Start, row1Y);
  doc.setTextColor(0, 0, 0);
  
  autoTable(doc, {
    head: [['Item', 'Amount']],
    body: [
      ['Gross Income/Revenue', formatCurrency(result.gross_income || citInput.gross_income || 0)],
      ['Other Income', formatCurrency(citInput.other_income || 0)],
      ['Total Deductible Expenses', formatCurrency(result.total_deductible_expenses || 0)],
      ['Non-Deductible Expenses', formatCurrency(result.total_non_deductible_expenses || 0)]
    ],
    foot: [['ADJUSTED PROFIT', formatCurrency(result.adjusted_profit || result.assessable_profit || 0)]],
    startY: row1Y + 2,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.2 },
    headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
    footStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: colWidth * 0.6 },
      1: { cellWidth: colWidth * 0.4, halign: 'right' }
    },
    tableWidth: colWidth,
    margin: { left: col1Start }
  });
  const sectionAEndY = doc.lastAutoTable.finalY;
  
  // SECTION C: WHT CREDITS (Left - directly below Section A)
  let leftColY = sectionAEndY + 3;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(139, 92, 246);
  doc.text('C. WHT Credits Breakdown', col1Start, leftColY);
  doc.setTextColor(0, 0, 0);
  
  const whtData = [];
  if (result.wht_credits_breakdown) {
    Object.entries(result.wht_credits_breakdown).forEach(([source, amount]) => {
      if (amount > 0) {
        whtData.push([`WHT on ${source.charAt(0).toUpperCase() + source.slice(1)}`, formatCurrency(amount)]);
      }
    });
  }
  if (whtData.length === 0) {
    whtData.push(['No WHT Credits', 'N 0.00']);
  }
  
  autoTable(doc, {
    head: [['Source', 'Amount']],
    body: whtData,
    foot: [['TOTAL WHT CREDITS', formatCurrency(result.total_wht_credits || 0)]],
    startY: leftColY + 2,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.2 },
    headStyles: { fillColor: [139, 92, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
    footStyles: { fillColor: [139, 92, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: colWidth * 0.6 },
      1: { cellWidth: colWidth * 0.4, halign: 'right' }
    },
    tableWidth: colWidth,
    margin: { left: col1Start }
  });
  
  // RIGHT COLUMN: SECTION B (Reliefs) + SECTION D (Tax Computation)
  let rightColY = row1Y;
  
  // SECTION B: RELIEFS & ALLOWANCES (Right - Top)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(34, 197, 94);
  doc.text('B. Reliefs & Allowances', col2Start, rightColY);
  doc.setTextColor(0, 0, 0);
  
  autoTable(doc, {
    head: [['Relief Type', 'Amount']],
    body: [
      ['Current Year CA', formatCurrency(result.current_year_ca || result.total_capital_allowances || 0)],
      ['Unutilised CA b/f', formatCurrency(result.unutilised_ca_bf || 0)],
      ['CA Utilised', formatCurrency(result.capital_allowances_utilised || result.total_capital_allowances || 0)],
      ['Unutilised CA c/f', formatCurrency(result.unutilised_ca_cf || 0)],
      ['Loss Relief Applied', formatCurrency(result.carry_forward_losses_applied || citInput.carry_forward_losses || 0)]
    ],
    foot: [['TOTAL RELIEFS', formatCurrency((result.total_capital_allowances || 0) + (result.carry_forward_losses_applied || 0))]],
    startY: rightColY + 2,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.2 },
    headStyles: { fillColor: [34, 197, 94], textColor: [255, 255, 255], fontStyle: 'bold' },
    footStyles: { fillColor: [34, 197, 94], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: colWidth * 0.55 },
      1: { cellWidth: colWidth * 0.45, halign: 'right' }
    },
    tableWidth: colWidth,
    margin: { left: col2Start }
  });
  rightColY = doc.lastAutoTable.finalY + 3;
  
  // SECTION D: TAX COMPUTATION (Right - Below Reliefs)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 38, 38);
  doc.text('D. Tax Computation', col2Start, rightColY);
  doc.setTextColor(0, 0, 0);
  
  const citRate = result.cit_rate ? (result.cit_rate * 100).toFixed(0) + '%' : '30%';
  const devLevyRate = result.development_levy_rate ? (result.development_levy_rate * 100).toFixed(0) + '%' : '4%';
  
  autoTable(doc, {
    body: [
      ['Taxable Profit (CIT Base)', formatCurrency(result.taxable_profit || 0)],
      [`CIT @ ${citRate}`, formatCurrency(result.cit_due || 0)],
      [`Dev. Levy @ ${devLevyRate}`, formatCurrency(result.development_levy || 0)],
      ['Minimum ETR Tax', formatCurrency(result.minimum_etr_tax || 0)],
      ['Total Tax Due', formatCurrency(result.total_tax_due || 0)],
      ['Less: WHT Credits', `(${formatCurrency(result.total_wht_credits || 0)})`]
    ],
    startY: rightColY + 2,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.2 },
    columnStyles: {
      0: { cellWidth: colWidth * 0.55, fillColor: [250, 250, 250] },
      1: { cellWidth: colWidth * 0.45, halign: 'right', fontStyle: 'bold' }
    },
    tableWidth: colWidth,
    margin: { left: col2Start }
  });
  
  // TAX PAYABLE highlight box
  autoTable(doc, {
    body: [['NET TAX PAYABLE', formatCurrency(result.net_tax_payable || result.total_tax_due || 0)]],
    startY: doc.lastAutoTable.finalY,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: colWidth * 0.55, fillColor: [220, 38, 38], textColor: [255, 255, 255] },
      1: { cellWidth: colWidth * 0.45, halign: 'right', fillColor: [254, 242, 242], textColor: [220, 38, 38] }
    },
    tableWidth: colWidth,
    margin: { left: col2Start }
  });
  const rightEndY = doc.lastAutoTable.finalY;
  
  // ===== FOOTER =====
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);
  
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(130, 130, 130);
  doc.text('Fiquant TaxPro™ | www.fiquanttaxpro.com | This computation is for guidance only. Consult a tax professional for official filings.', margin, pageHeight - 6);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
  
  doc.save(`CIT_Schedule_${citInput.company_name || 'Company'}_${new Date().toISOString().split('T')[0]}.pdf`);
};

// ============================================================================
// CGT REPORT - Capital Gains Tax Schedule (Clean Version - No Header)
// ============================================================================
export const generateCGTReport = (cgtInput, result) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const margin = 15;
  const pageWidth = 297;
  
  let yPos = 15;
  
  // Document Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('CAPITAL GAINS TAX SCHEDULE', margin, yPos);
  yPos += 6;
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('CGT Return - NTA 2025', margin, yPos);
  yPos += 4;
  doc.setFontSize(8);
  doc.text(`Generated: ${formatDate()}`, margin, yPos);
  yPos += 10;
  
  // Taxpayer Information
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('SECTION A: TAXPAYER IDENTIFICATION', margin, yPos);
  yPos += 6;
  
  // Get asset type label
  const assetTypeLabels = {
    'crypto': 'Cryptocurrency',
    'shares': 'Share Sale',
    'property': 'Real Estate Property',
    'business_assets': 'Business Assets',
    'intellectual_property': 'Intellectual Property'
  };
  const assetTypeLabel = assetTypeLabels[cgtInput.asset_type] || cgtInput.asset_type || 'Not Specified';
  
  const taxpayerData = [
    ['Taxpayer Name', cgtInput.taxpayer_name || 'Not Specified', 'TIN', cgtInput.tin || 'Not Specified'],
    ['Assessment Year', cgtInput.year || result.calculation_date?.split('/')[2] || '2026', 'Asset Type', assetTypeLabel],
    ['Taxpayer Type', (cgtInput.taxpayer_type || 'individual').charAt(0).toUpperCase() + (cgtInput.taxpayer_type || 'individual').slice(1), 'Calculation Date', result.calculation_date || 'N/A']
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
  
  // Asset-specific Details
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('SECTION B: TRANSACTION DETAILS', margin, yPos);
  yPos += 6;
  
  let assetDetails = [];
  
  if (cgtInput.asset_type === 'crypto' || result.cryptoType) {
    assetDetails = [
      ['Cryptocurrency', result.cryptoType ? result.cryptoType.charAt(0).toUpperCase() + result.cryptoType.slice(1) : 'N/A'],
      ['Quantity', result.quantity ? result.quantity.toString() : 'N/A']
    ];
  } else if (cgtInput.asset_type === 'shares' || result.companyName !== undefined) {
    assetDetails = [
      ['Company Name', result.companyName || 'N/A'],
      ['Share Type', result.shareType ? result.shareType.charAt(0).toUpperCase() + result.shareType.slice(1) : 'N/A'],
      ['Quantity', result.quantity ? `${result.quantity} shares` : 'N/A']
    ];
  } else {
    assetDetails = [
      ['Asset Type', result.assetType ? result.assetType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A'],
      ['Asset Description', result.assetDescription || 'N/A']
    ];
  }
  
  autoTable(doc, {
    body: assetDetails,
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
  
  const effectiveRate = result.effective_rate ? result.effective_rate.toFixed(2) + '%' : '0%';
  const isExempt = result.exempt === true;
  const isLoss = result.chargeable_gain < 0;
  
  const cgtComputationData = [
    ['A', 'Total Proceeds', formatCurrency(result.totalProceeds || 0)],
    ['B', 'Less: Total Cost (Acquisition + Incidental)', formatCurrency(result.totalCost || 0)],
    ['C', isLoss ? 'Capital Loss (A - B)' : 'Capital Gain (A - B)', formatCurrency(Math.abs(result.chargeable_gain || 0))],
    ['D', 'Exemption Status', isExempt ? 'EXEMPT' : 'Taxable'],
    ['E', 'Effective CGT Rate', effectiveRate],
    ['F', 'CGT Payable', formatCurrency(result.tax_due || 0)],
    ['G', 'Net Gain After Tax', formatCurrency(result.net_gain || 0)]
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
  
  yPos = doc.lastAutoTable.finalY + 8;
  
  // Exemption Information (if applicable)
  if (isExempt) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('SECTION D: EXEMPTION DETAILS', margin, yPos);
    yPos += 6;
    
    const exemptionData = [
      ['Exemption Type', 'Small Investor Relief (NTA 2025)'],
      ['Criteria', 'Proceeds < N150M AND Gains < N10M for Individuals']
    ];
    
    autoTable(doc, {
      body: exemptionData,
      startY: yPos,
      theme: 'grid',
      styles: { fontSize: 9 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50, fillColor: [219, 234, 254] },
        1: { cellWidth: 120 }
      },
      margin: { left: margin, right: margin }
    });
  }
  
  // Simple footer
  const pageCount = doc.internal.getNumberOfPages();
  const pageHeight = 210;
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Fiquant TaxPro™ | www.fiquanttaxpro.com', margin, pageHeight - 10);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 25, pageHeight - 10);
  }
  
  doc.save(`CGT_Schedule_${cgtInput.taxpayer_name || 'Taxpayer'}_${new Date().toISOString().split('T')[0]}.pdf`);
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

// ============================================================================
// DEFERRED TAX REPORT - IAS 12 COMPLIANT
// ============================================================================
export const generateDeferredTaxReport = (companyProfile, temporaryDifferences, results, formatCurrencyFn, taxLawVersion = 'nta_2025') => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const margin = 10;
  const pageWidth = 297;
  const pageHeight = 210;
  let yPos = 15;
  
  // ===== SECTION 1: HEADER =====
  doc.setFillColor(26, 26, 46);
  doc.rect(0, 0, pageWidth, 25, 'F');
  
  doc.setTextColor(212, 175, 55);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('FIQUANT TAXPRO - DEFERRED TAX COMPUTATION', margin, 12);
  
  doc.setFontSize(10);
  doc.setTextColor(156, 163, 175);
  doc.text('IAS 12 & NTA 2025 Compliant', margin, 20);
  
  doc.setFontSize(8);
  doc.text(`Generated: ${formatDate()}`, pageWidth - margin - 50, 12);
  doc.text(taxLawVersion === 'nta_2025' ? 'CA Basis: NTA 2025 (No Initial Allowances)' : 'CA Basis: Old Law (With Initial Allowances)', pageWidth - margin - 50, 18);
  
  yPos = 32;
  doc.setTextColor(0, 0, 0);
  
  // ===== SECTION 2: COMPANY INFORMATION (Horizontal) =====
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Company Information', margin, yPos);
  yPos += 5;
  
  const yearEnd = companyProfile.financial_year_end 
    ? new Date(companyProfile.financial_year_end).toLocaleDateString('en-NG')
    : 'N/A';
  
  const companyInfoRow1 = [
    ['Company Name', companyProfile.company_name || 'N/A', 'Financial Year End', yearEnd, 'Company Size', companyProfile.company_size === 'standard' ? 'Standard' : 'Small']
  ];
  
  autoTable(doc, {
    body: companyInfoRow1,
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 28, fillColor: [245, 245, 245] },
      1: { cellWidth: 65 },
      2: { fontStyle: 'bold', cellWidth: 30, fillColor: [245, 245, 245] },
      3: { cellWidth: 35 },
      4: { fontStyle: 'bold', cellWidth: 25, fillColor: [245, 245, 245] },
      5: { cellWidth: 30 }
    },
    margin: { left: margin, right: margin }
  });
  yPos = doc.lastAutoTable.finalY + 2;
  
  const companyInfoRow2 = [
    ['Annual Turnover', formatCurrency(companyProfile.turnover), 'Total Fixed Assets', formatCurrency(companyProfile.fixed_assets), 'Tax Rate', results.taxRate ? `${(results.taxRate * 100).toFixed(0)}%` : '0%']
  ];
  
  autoTable(doc, {
    body: companyInfoRow2,
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 28, fillColor: [245, 245, 245] },
      1: { cellWidth: 65, halign: 'right' },
      2: { fontStyle: 'bold', cellWidth: 30, fillColor: [245, 245, 245] },
      3: { cellWidth: 35, halign: 'right' },
      4: { fontStyle: 'bold', cellWidth: 25, fillColor: [245, 245, 245] },
      5: { cellWidth: 30, halign: 'center' }
    },
    margin: { left: margin, right: margin }
  });
  yPos = doc.lastAutoTable.finalY + 6;
  
  // ===== SECTION 3: RESULT SUMMARY BANNER =====
  const resultColor = results.isSmallCompany 
    ? [22, 163, 74] // Green for exempt
    : results.netType === 'liability'
      ? [220, 38, 38] // Red for DTL
      : results.netType === 'asset'
        ? [22, 163, 74] // Green for DTA
        : [107, 114, 128]; // Gray for none
  
  doc.setFillColor(resultColor[0], resultColor[1], resultColor[2]);
  doc.roundedRect(margin, yPos, pageWidth - margin * 2, 18, 2, 2, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  
  const resultText = results.isSmallCompany 
    ? 'EXEMPT - Small Company (NTA 2025) - No Deferred Tax Computation Required'
    : results.netType === 'liability'
      ? `NET DEFERRED TAX LIABILITY: ${formatCurrency(results.netPosition)} - You will pay MORE tax in the future`
      : results.netType === 'asset'
        ? `NET DEFERRED TAX ASSET: ${formatCurrency(results.netPosition)} - You will pay LESS tax in the future`
        : 'NO NET DEFERRED TAX - Temporary differences are balanced';
  
  doc.text(resultText, pageWidth / 2, yPos + 11, { align: 'center' });
  
  yPos += 24;
  doc.setTextColor(0, 0, 0);
  
  // Skip detailed breakdown if small company
  if (results.isSmallCompany) {
    // Add footer and return
    addDeferredTaxFooter(doc, pageWidth);
    doc.save(`Deferred_Tax_${companyProfile.company_name || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`);
    return;
  }
  
  // ===== SECTION 4: TWO-COLUMN LAYOUT =====
  const leftColWidth = 140;
  const rightColStart = margin + leftColWidth + 5;
  let leftY = yPos;
  let rightY = yPos;
  
  // ===== LEFT COLUMN: TEMPORARY DIFFERENCES BREAKDOWN =====
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('A. TEMPORARY DIFFERENCES ANALYSIS', margin, leftY);
  leftY += 5;
  
  // PPE Details
  if (temporaryDifferences.ppe && temporaryDifferences.ppe.length > 0) {
    const ppeData = temporaryDifferences.ppe
      .filter(item => item.cost && parseFloat(item.cost) > 0)
      .map(item => {
        const carrying = parseFloat(item.carrying_amount) || 0;
        const taxBase = parseFloat(item.tax_base) || 0;
        const diff = carrying - taxBase;
        const diffType = diff > 0 ? 'Taxable' : diff < 0 ? 'Deductible' : '-';
        return [
          item.asset_type,
          formatCurrency(carrying),
          formatCurrency(taxBase),
          formatCurrency(Math.abs(diff)),
          diffType
        ];
      });
    
    if (ppeData.length > 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Property, Plant & Equipment (PPE)', margin + 2, leftY);
      leftY += 4;
      
      autoTable(doc, {
        head: [['Asset Type', 'Carrying Amt', 'Tax Base (TWDV)', 'Temp Diff', 'Type']],
        body: ppeData,
        startY: leftY,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 1.5 },
        headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontSize: 7 },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 26, halign: 'right' },
          2: { cellWidth: 26, halign: 'right' },
          3: { cellWidth: 22, halign: 'right' },
          4: { cellWidth: 18, halign: 'center' }
        },
        didParseCell: function(data) {
          if (data.section === 'body' && data.column.index === 4) {
            if (data.cell.text[0] === 'Taxable') {
              data.cell.styles.textColor = [220, 38, 38];
            } else if (data.cell.text[0] === 'Deductible') {
              data.cell.styles.textColor = [22, 163, 74];
            }
          }
        },
        margin: { left: margin, right: pageWidth - leftColWidth - margin }
      });
      leftY = doc.lastAutoTable.finalY + 4;
    }
  }
  
  // Other Temporary Differences Summary
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Other Temporary Differences Summary', margin + 2, leftY);
  leftY += 4;
  
  const otherDiffData = [];
  
  // Inventory
  if (results.breakdown.inventory.taxable > 0 || results.breakdown.inventory.deductible > 0) {
    otherDiffData.push(['Inventory Write-downs', 
      formatCurrency(results.breakdown.inventory.taxable), 
      formatCurrency(results.breakdown.inventory.deductible)
    ]);
  }
  
  // Receivables
  if (results.breakdown.receivables.taxable > 0 || results.breakdown.receivables.deductible > 0) {
    otherDiffData.push(['Trade Receivables (ECL)', 
      formatCurrency(results.breakdown.receivables.taxable), 
      formatCurrency(results.breakdown.receivables.deductible)
    ]);
  }
  
  // Provisions
  if (results.breakdown.provisions.taxable > 0 || results.breakdown.provisions.deductible > 0) {
    otherDiffData.push(['Provisions', 
      formatCurrency(results.breakdown.provisions.taxable), 
      formatCurrency(results.breakdown.provisions.deductible)
    ]);
  }
  
  // Contracts
  if (results.breakdown.contracts.taxable > 0 || results.breakdown.contracts.deductible > 0) {
    otherDiffData.push(['Contract Assets/Liabilities', 
      formatCurrency(results.breakdown.contracts.taxable), 
      formatCurrency(results.breakdown.contracts.deductible)
    ]);
  }
  
  // Revaluation
  if (results.breakdown.revaluation.taxable > 0 || results.breakdown.revaluation.deductible > 0) {
    otherDiffData.push(['Revaluation Surplus', 
      formatCurrency(results.breakdown.revaluation.taxable), 
      formatCurrency(results.breakdown.revaluation.deductible)
    ]);
  }
  
  // Leases
  if (results.breakdown.leases.taxable > 0 || results.breakdown.leases.deductible > 0) {
    otherDiffData.push(['Leases (IFRS 16)', 
      formatCurrency(results.breakdown.leases.taxable), 
      formatCurrency(results.breakdown.leases.deductible)
    ]);
  }
  
  // Tax Losses
  if (results.breakdown.taxLosses.taxable > 0 || results.breakdown.taxLosses.deductible > 0) {
    otherDiffData.push(['Unused Tax Losses', 
      formatCurrency(results.breakdown.taxLosses.taxable), 
      formatCurrency(results.breakdown.taxLosses.deductible)
    ]);
  }
  
  // Other
  if (results.breakdown.other.taxable > 0 || results.breakdown.other.deductible > 0) {
    otherDiffData.push(['Other Differences', 
      formatCurrency(results.breakdown.other.taxable), 
      formatCurrency(results.breakdown.other.deductible)
    ]);
  }
  
  // PPE Total
  otherDiffData.unshift(['PPE Total', 
    formatCurrency(results.breakdown.ppe.taxable), 
    formatCurrency(results.breakdown.ppe.deductible)
  ]);
  
  // Totals
  otherDiffData.push(['TOTAL', 
    formatCurrency(results.totalTaxableTD), 
    formatCurrency(results.totalDeductibleTD)
  ]);
  
  autoTable(doc, {
    head: [['Category', 'Taxable TD', 'Deductible TD']],
    body: otherDiffData,
    startY: leftY,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [107, 114, 128], textColor: [255, 255, 255], fontSize: 7 },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 35, halign: 'right', textColor: [220, 38, 38] },
      2: { cellWidth: 35, halign: 'right', textColor: [22, 163, 74] }
    },
    didParseCell: function(data) {
      if (data.section === 'body' && data.row.index === otherDiffData.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [245, 245, 245];
      }
    },
    margin: { left: margin, right: pageWidth - leftColWidth - margin }
  });
  leftY = doc.lastAutoTable.finalY + 6;
  
  // ===== RIGHT COLUMN: TAX COMPUTATION =====
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('B. DEFERRED TAX COMPUTATION', rightColStart, rightY);
  rightY += 5;
  
  // Tax Rate Info
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Applicable Tax Rate: ${(results.taxRate * 100).toFixed(0)}%`, rightColStart + 2, rightY);
  rightY += 5;
  
  // DT Computation
  const taxComputationData = [
    ['Taxable Temporary Differences', formatCurrency(results.totalTaxableTD)],
    [`× Tax Rate (${(results.taxRate * 100).toFixed(0)}%)`, ''],
    ['= Gross Deferred Tax Liability (DTL)', formatCurrency(results.grossDTL)],
    ['', ''],
    ['Deductible Temporary Differences', formatCurrency(results.totalDeductibleTD)],
    [`× Tax Rate (${(results.taxRate * 100).toFixed(0)}%)`, ''],
    ['= Gross Deferred Tax Asset (DTA)', formatCurrency(results.grossDTA)],
    ['', ''],
    ['Net Position (DTL - DTA)', ''],
    [results.netType === 'liability' ? 'NET DEFERRED TAX LIABILITY' : results.netType === 'asset' ? 'NET DEFERRED TAX ASSET' : 'NO NET DEFERRED TAX', formatCurrency(results.netPosition)]
  ];
  
  autoTable(doc, {
    body: taxComputationData,
    startY: rightY,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 40, halign: 'right', fontStyle: 'bold' }
    },
    didParseCell: function(data) {
      if (data.row.index === 2) {
        data.cell.styles.textColor = [220, 38, 38];
        data.cell.styles.fontStyle = 'bold';
      }
      if (data.row.index === 6) {
        data.cell.styles.textColor = [22, 163, 74];
        data.cell.styles.fontStyle = 'bold';
      }
      if (data.row.index === 9) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fontSize = 10;
        if (results.netType === 'liability') {
          data.cell.styles.textColor = [220, 38, 38];
        } else if (results.netType === 'asset') {
          data.cell.styles.textColor = [22, 163, 74];
        }
      }
    },
    margin: { left: rightColStart, right: margin }
  });
  rightY = doc.lastAutoTable.finalY + 8;
  
  // Journal Entry
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('C. JOURNAL ENTRY GUIDE', rightColStart, rightY);
  rightY += 5;
  
  let journalData;
  if (results.netType === 'asset') {
    journalData = [
      ['Dr.', 'Deferred Tax Asset (SOFP)', formatCurrency(results.netPosition)],
      ['Cr.', 'Deferred Tax Income (P&L)', formatCurrency(results.netPosition)]
    ];
  } else if (results.netType === 'liability') {
    journalData = [
      ['Dr.', 'Deferred Tax Expense (P&L)', formatCurrency(results.netPosition)],
      ['Cr.', 'Deferred Tax Liability (SOFP)', formatCurrency(results.netPosition)]
    ];
  } else {
    journalData = [
      ['', 'No journal entry required', '']
    ];
  }
  
  autoTable(doc, {
    body: journalData,
    startY: rightY,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 12, fontStyle: 'bold', halign: 'center', fillColor: [245, 245, 245] },
      1: { cellWidth: 60 },
      2: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: rightColStart, right: margin }
  });
  rightY = doc.lastAutoTable.finalY + 8;
  
  // Recognition Note
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('IAS 12 Recognition Criteria:', rightColStart, rightY);
  rightY += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  const noteLines = [
    '• DTL: Recognized for ALL taxable temporary differences',
    '• DTA: Recognized ONLY when probable future taxable profits',
    '  are available against which deductible TDs can be utilized'
  ];
  noteLines.forEach(line => {
    doc.text(line, rightColStart, rightY);
    rightY += 3.5;
  });
  
  // Warnings Section (if any)
  if (results.warnings && results.warnings.length > 0) {
    const warningsY = Math.max(leftY, rightY) + 5;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 38, 38);
    doc.text('D. NOTES & WARNINGS', margin, warningsY);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    let warnY = warningsY + 5;
    results.warnings.forEach((warning, index) => {
      const lines = doc.splitTextToSize(`${index + 1}. ${warning}`, pageWidth - margin * 2);
      if (warnY + lines.length * 4 > pageHeight - 20) {
        doc.addPage();
        warnY = 20;
      }
      doc.text(lines, margin, warnY);
      warnY += lines.length * 4 + 2;
    });
  }
  
  // Footer
  addDeferredTaxFooter(doc, pageWidth);
  
  doc.save(`Deferred_Tax_${companyProfile.company_name || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Helper function for Deferred Tax footer
const addDeferredTaxFooter = (doc, pageWidth) => {
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Generated by Fiquant TaxPro™ | Page ${i} of ${totalPages}`,
      pageWidth / 2,
      200,
      { align: 'center' }
    );
    doc.text(
      'This report is for informational purposes. Consult a tax professional for specific advice.',
      pageWidth / 2,
      205,
      { align: 'center' }
    );
  }
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
  generatePaymentProcessingReport,
  generateDeferredTaxReport
};
