import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Utility function to format currency
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₦0.00';
  return `₦${parseFloat(amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

// Add header with logo and branding
const addHeader = (doc, title) => {
  // Company header background
  doc.setFillColor(0, 0, 0); // Black background
  doc.rect(0, 0, 220, 35, 'F');
  
  // Add the new Fiquant Consult logo
  try {
    // Create a canvas to load and process the logo
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const logoImg = new Image();
    logoImg.crossOrigin = "anonymous";
    
    // Set up the image load handler
    logoImg.onload = function() {
      // Set canvas size
      canvas.width = logoImg.width;
      canvas.height = logoImg.height;
      
      // Draw the image to canvas
      ctx.drawImage(logoImg, 0, 0);
      
      // Convert to base64 and add to PDF
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', 15, 8, 20, 20); // x, y, width, height
    };
    
    // Load the logo
    logoImg.src = 'https://customer-assets.emergentagent.com/job_taxpro-ng/artifacts/i2zrdiwl_Fiquant%20Consult%20-%20Transparent%202.png';
    
    // Fallback: Add logo directly (this might work with newer jsPDF versions)
    doc.addImage('https://customer-assets.emergentagent.com/job_taxpro-ng/artifacts/i2zrdiwl_Fiquant%20Consult%20-%20Transparent%202.png', 'PNG', 15, 8, 20, 20);
  } catch (error) {
    console.log('Logo loading failed, using text-only header');
  }
  
  // Company name and branding
  doc.setTextColor(255, 255, 255); // White text
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Fiquant Consult', 45, 18);
  
  // Subtitle
  doc.setFontSize(10);
  doc.setTextColor(255, 215, 0); // Gold color for subtitle
  doc.text('Nigerian Tax Calculator 2026 - Professional Edition', 45, 25);
  
  // Report title
  doc.setTextColor(0, 0, 0); // Black text
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 20, 50);
  
  // Generated date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${formatDate()}`, 20, 57);
  
  // Return the Y position where content should start
  return 65;
};

// Add footer
const addFooter = (doc) => {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('© 2024 Fiquant Consult - Professional Tax Calculation Services', 20, 285);
    doc.text(`Page ${i} of ${pageCount}`, 180, 285);
  }
};

// Generate Single PAYE Report
export const generatePayeReport = (taxInput, result) => {
  const doc = new jsPDF();
  
  let yPos = addHeader(doc, 'PAYE Tax Calculation Report');
  
  // Employee Information Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Employee Information', 20, yPos);
  yPos += 10;
  
  // Income Details Table
  const incomeData = [
    ['Basic Salary', formatCurrency(taxInput.basic_salary)],
    ['Transport Allowance', formatCurrency(taxInput.transport_allowance)],
    ['Housing Allowance', formatCurrency(taxInput.housing_allowance)],
    ['Meal Allowance', formatCurrency(taxInput.meal_allowance)],
    ['Other Allowances', formatCurrency(taxInput.other_allowances)],
    ['Monthly Gross Income', formatCurrency(result.monthly_gross_income)]
  ];
  
  doc.autoTable({
    head: [['Income Component', 'Amount']],
    body: incomeData,
    startY: yPos,
    theme: 'grid',
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
    margin: { left: 20, right: 20 }
  });
  
  yPos = doc.lastAutoTable.finalY + 15;
  
  // Relief & Deductions Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Monthly Reliefs & Deductions', 20, yPos);
  yPos += 10;
  
  const reliefData = [
    ['Pension Contribution (8%)', formatCurrency(taxInput.pension_contribution || result.monthly_gross_income * 0.08)],
    ['NHF Contribution (2.5%)', formatCurrency(taxInput.nhf_contribution || result.monthly_gross_income * 0.025)],
    ['Life Insurance Premium', formatCurrency(taxInput.life_insurance_premium)],
    ['Health Insurance Premium', formatCurrency(taxInput.health_insurance_premium)],
    ['NHIS Contribution', formatCurrency(taxInput.nhis_contribution)],
    ['Annual Rent Relief', formatCurrency(result.annual_rent_relief)],
    ['Total Monthly Reliefs', formatCurrency(result.total_reliefs)]
  ];
  
  doc.autoTable({
    head: [['Relief Component', 'Amount']],
    body: reliefData,
    startY: yPos,
    theme: 'grid',
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
    margin: { left: 20, right: 20 }
  });
  
  yPos = doc.lastAutoTable.finalY + 15;
  
  // Tax Calculation Summary
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Tax Calculation Summary', 20, yPos);
  yPos += 10;
  
  const taxData = [
    ['Annual Gross Income', formatCurrency(result.annual_gross_income)],
    ['Annual Total Reliefs', formatCurrency(result.annual_total_reliefs)],
    ['Annual Taxable Income', formatCurrency(result.annual_taxable_income)],
    ['Annual Tax Due', formatCurrency(result.tax_due)],
    ['Monthly Tax (PAYE)', formatCurrency(result.monthly_tax)],
    ['Monthly Net Income', formatCurrency(result.monthly_net_income)]
  ];
  
  doc.autoTable({
    head: [['Calculation Component', 'Amount']],
    body: taxData,
    startY: yPos,
    theme: 'grid',
    headStyles: { fillColor: [34, 197, 94], textColor: [255, 255, 255] }, // Green header
    margin: { left: 20, right: 20 }
  });
  
  // Add tax bracket information if available
  if (result.tax_breakdown && result.tax_breakdown.length > 0) {
    yPos = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Tax Bracket Breakdown', 20, yPos);
    yPos += 10;
    
    const bracketData = result.tax_breakdown.map(bracket => [
      bracket.range,
      `${bracket.rate}%`,
      formatCurrency(bracket.taxable_amount),
      formatCurrency(bracket.tax_amount)
    ]);
    
    doc.autoTable({
      head: [['Income Range', 'Rate', 'Taxable Amount', 'Tax Amount']],
      body: bracketData,
      startY: yPos,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] }, // Blue header
      margin: { left: 20, right: 20 }
    });
  }
  
  addFooter(doc);
  
  // Save the PDF
  doc.save(`PAYE_Tax_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Generate Bulk PAYE Report
export const generateBulkPayeReport = (employees, totals) => {
  const doc = new jsPDF();
  
  let yPos = addHeader(doc, 'Bulk PAYE Tax Calculation Report');
  
  // Summary Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Payroll Summary', 20, yPos);
  yPos += 10;
  
  const summaryData = [
    ['Total Employees Processed', totals.employeeCount.toString()],
    ['Total Monthly Gross Pay', formatCurrency(totals.totalGross)],
    ['Total Monthly Tax (PAYE)', formatCurrency(totals.totalTax)],
    ['Total Monthly Net Pay', formatCurrency(totals.totalNet)],
    ['Total Annual Tax', formatCurrency(totals.totalTax * 12)]
  ];
  
  doc.autoTable({
    head: [['Summary Item', 'Amount/Count']],
    body: summaryData,
    startY: yPos,
    theme: 'grid',
    headStyles: { fillColor: [34, 197, 94], textColor: [255, 255, 255] },
    margin: { left: 20, right: 20 }
  });
  
  yPos = doc.lastAutoTable.finalY + 20;
  
  // Employee Details Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Employee Tax Details', 20, yPos);
  yPos += 10;
  
  const calculatedEmployees = employees.filter(emp => emp.calculated && emp.result);
  
  const employeeData = calculatedEmployees.map((emp, index) => [
    (index + 1).toString(),
    emp.name,
    emp.tin || 'N/A',
    formatCurrency(emp.result.monthly_gross_income),
    formatCurrency(emp.result.monthly_tax),
    formatCurrency(emp.result.monthly_net_income)
  ]);
  
  doc.autoTable({
    head: [['#', 'Employee Name', 'TIN', 'Monthly Gross', 'Monthly Tax', 'Monthly Net']],
    body: employeeData,
    startY: yPos,
    theme: 'grid',
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
    margin: { left: 20, right: 20 },
    styles: { fontSize: 8 }
  });
  
  addFooter(doc);
  
  // Save the PDF
  doc.save(`Bulk_PAYE_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Generate CIT Report
export const generateCitReport = (citInput, citResult) => {
  const doc = new jsPDF();
  
  let yPos = addHeader(doc, 'Corporate Income Tax (CIT) Calculation Report');
  
  // Company Information Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Company Information', 20, yPos);
  yPos += 10;
  
  const companyData = [
    ['Company Name', citInput.company_name || 'N/A'],
    ['Annual Turnover', formatCurrency(citInput.annual_turnover)],
    ['Total Fixed Assets', formatCurrency(citInput.total_fixed_assets)],
    ['Company Classification', citResult.company_type || 'N/A'],
    ['Professional Service Firm', citInput.is_professional_service ? 'Yes' : 'No'],
    ['Multinational Enterprise', citInput.is_multinational ? 'Yes' : 'No']
  ];
  
  doc.autoTable({
    head: [['Company Detail', 'Value']],
    body: companyData,
    startY: yPos,
    theme: 'grid',
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
    margin: { left: 20, right: 20 }
  });
  
  yPos = doc.lastAutoTable.finalY + 15;
  
  // Revenue & Income Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Revenue & Income', 20, yPos);
  yPos += 10;
  
  const revenueData = [
    ['Gross Income/Revenue', formatCurrency(citInput.gross_income)],
    ['Other Income', formatCurrency(citInput.other_income)],
    ['Total Income', formatCurrency(citResult.total_income)]
  ];
  
  doc.autoTable({
    head: [['Income Component', 'Amount']],
    body: revenueData,
    startY: yPos,
    theme: 'grid',
    headStyles: { fillColor: [34, 197, 94], textColor: [255, 255, 255] },
    margin: { left: 20, right: 20 }
  });
  
  yPos = doc.lastAutoTable.finalY + 15;
  
  // Deductible Expenses Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Deductible Expenses', 20, yPos);
  yPos += 10;
  
  const expenseData = [
    ['Cost of Goods Sold', formatCurrency(citInput.cost_of_goods_sold)],
    ['Staff Costs', formatCurrency(citInput.staff_costs)],
    ['Rent Expenses', formatCurrency(citInput.rent_expenses)],
    ['Professional Fees', formatCurrency(citInput.professional_fees)],
    ['Depreciation', formatCurrency(citInput.depreciation)],
    ['Interest Paid (Unrelated)', formatCurrency(citInput.interest_paid_unrelated)],
    ['Interest Paid (Related)', formatCurrency(citInput.interest_paid_related)],
    ['Other Deductible Expenses', formatCurrency(citInput.other_deductible_expenses)],
    ['Total Deductible Expenses', formatCurrency(citResult.total_deductible_expenses)]
  ];
  
  doc.autoTable({
    head: [['Expense Component', 'Amount']],
    body: expenseData,
    startY: yPos,
    theme: 'grid',
    headStyles: { fillColor: [239, 68, 68], textColor: [255, 255, 255] }, // Red header
    margin: { left: 20, right: 20 }
  });
  
  yPos = doc.lastAutoTable.finalY + 15;
  
  // Tax Calculation Summary
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('CIT Calculation Summary', 20, yPos);
  yPos += 10;
  
  const citSummaryData = [
    ['Profit Before Loss Relief', formatCurrency((citResult.taxable_profit || 0) + (citResult.carry_forward_losses_applied || 0))],
    ['Loss Relief Applied', formatCurrency(citResult.carry_forward_losses_applied || 0)],
    ['Taxable Profit', formatCurrency(citResult.taxable_profit)],
    ['CIT Rate Applied', `${citResult.cit_rate}%`],
    ['CIT Due', formatCurrency(citResult.cit_due)],
    ['Capital Allowances', formatCurrency(citResult.total_capital_allowances)],
    ['WHT Credits', formatCurrency(citResult.total_wht_credits)],
    ['Net Tax Payable', formatCurrency(citResult.net_tax_payable)],
    ['Development Levy (0.25%)', formatCurrency(citResult.development_levy)]
  ];
  
  doc.autoTable({
    head: [['Tax Component', 'Amount/Rate']],
    body: citSummaryData,
    startY: yPos,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] }, // Blue header
    margin: { left: 20, right: 20 }
  });
  
  // Add Capital Allowances breakdown if available
  if (citResult.capital_allowances_breakdown) {
    yPos = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Capital Allowances Breakdown', 20, yPos);
    yPos += 10;
    
    const allowanceData = Object.entries(citResult.capital_allowances_breakdown).map(([key, value]) => [
      key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      formatCurrency(value)
    ]);
    
    doc.autoTable({
      head: [['Asset Category', 'Allowance Amount']],
      body: allowanceData,
      startY: yPos,
      theme: 'grid',
      headStyles: { fillColor: [168, 85, 247], textColor: [255, 255, 255] }, // Purple header
      margin: { left: 20, right: 20 }
    });
  }
  
  addFooter(doc);
  
  // Save the PDF
  doc.save(`CIT_Tax_Report_${citInput.company_name || 'Company'}_${new Date().toISOString().split('T')[0]}.pdf`);
};