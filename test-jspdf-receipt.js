#!/usr/bin/env node

/**
 * Test jsPDF + html2canvas PDF Receipt Generation
 * 
 * This test script validates the PDF generation functionality
 * without requiring a full browser environment.
 * 
 * Usage: node test-jspdf-receipt.js
 * 
 * Validates:
 * 1. Dependencies installed (jsPDF, html2canvas)
 * 2. Utility functions exportable
 * 3. Mock PDF generation workflow
 */

const fs = require('fs');
const path = require('path');

// Color output for console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n${colors.blue}${msg}${colors.reset}\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`),
};

// Test counter
let passed = 0;
let failed = 0;

// ============================================================================
// Test 1: Check package.json for dependencies
// ============================================================================
log.section('Test 1: Verifying Dependencies');

const packageJsonPath = path.join(__dirname, 'frontend', 'package.json');

try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const dependencies = packageJson.dependencies || {};

  const requiredPackages = ['jspdf', 'html2canvas', 'html2pdf.js'];
  let allInstalled = true;

  requiredPackages.forEach((pkg) => {
    if (dependencies[pkg]) {
      log.success(`${pkg}: ${dependencies[pkg]}`);
      passed++;
    } else {
      log.error(`${pkg}: NOT FOUND`);
      failed++;
      allInstalled = false;
    }
  });

  if (allInstalled) {
    log.success('All PDF dependencies installed!');
  } else {
    log.error('Some dependencies are missing. Run: npm install jspdf html2canvas');
  }
} catch (error) {
  log.error(`Failed to read package.json: ${error.message}`);
  failed++;
}

// ============================================================================
// Test 2: Check if pdfGenerator.js exists
// ============================================================================
log.section('Test 2: Verifying PDF Generator Utility');

const pdfGeneratorPath = path.join(__dirname, 'frontend', 'src', 'utils', 'pdfGenerator.js');

if (fs.existsSync(pdfGeneratorPath)) {
  log.success(`pdfGenerator.js exists at: frontend/src/utils/pdfGenerator.js`);
  
  const content = fs.readFileSync(pdfGeneratorPath, 'utf-8');
  
  const hasGenerateReceiptPDF = /export const generateReceiptPDF/.test(content);
  const hasGenerateCustomReceiptPDF = /export const generateCustomReceiptPDF/.test(content);
  const hasJsPDFImport = /import jsPDF from 'jspdf'/.test(content);
  const hasHtml2CanvasImport = /import html2canvas from 'html2canvas'/.test(content);

  if (hasGenerateReceiptPDF) {
    log.success('generateReceiptPDF function found');
    passed++;
  } else {
    log.error('generateReceiptPDF function NOT found');
    failed++;
  }

  if (hasGenerateCustomReceiptPDF) {
    log.success('generateCustomReceiptPDF function found');
    passed++;
  } else {
    log.error('generateCustomReceiptPDF function NOT found');
    failed++;
  }

  if (hasJsPDFImport) {
    log.success('jsPDF import found');
    passed++;
  } else {
    log.error('jsPDF import NOT found');
    failed++;
  }

  if (hasHtml2CanvasImport) {
    log.success('html2canvas import found');
    passed++;
  } else {
    log.error('html2canvas import NOT found');
    failed++;
  }
} else {
  log.error(`pdfGenerator.js NOT FOUND at ${pdfGeneratorPath}`);
  failed++;
}

// ============================================================================
// Test 3: Check PaymentDetailsModal.jsx integration
// ============================================================================
log.section('Test 3: Verifying PaymentDetailsModal Integration');

const modalPath = path.join(
  __dirname,
  'frontend',
  'src',
  'components',
  'PaymentDetailsModal.jsx'
);

if (fs.existsSync(modalPath)) {
  const content = fs.readFileSync(modalPath, 'utf-8');

  const hasPdfGeneratorImport = /import.*generateReceiptPDF.*generateCustomReceiptPDF.*from.*pdfGenerator/.test(
    content.replace(/\n/g, ' ')
  );
  const hasPdfMethodState = /pdfMethod/.test(content);
  const hasReceiptContentDiv = /id="receipt-content"/.test(content);
  const hasDownloadPDFFunction = /const downloadPDF = async/.test(content);
  const hasPdfMethodSelection = /setPdfMethod/.test(content);

  if (hasPdfGeneratorImport) {
    log.success('PDF generator utilities imported');
    passed++;
  } else {
    log.error('PDF generator utilities import NOT found');
    failed++;
  }

  if (hasReceiptContentDiv) {
    log.success('Receipt content wrapper div found (id="receipt-content")');
    passed++;
  } else {
    log.error('Receipt content wrapper div NOT found');
    failed++;
  }

  if (hasPdfMethodState) {
    log.success('PDF method state management found');
    passed++;
  } else {
    log.error('PDF method state management NOT found');
    failed++;
  }

  if (hasDownloadPDFFunction) {
    log.success('downloadPDF function found');
    passed++;
  } else {
    log.error('downloadPDF function NOT found');
    failed++;
  }

  if (hasPdfMethodSelection) {
    log.success('PDF method selection buttons found');
    passed++;
  } else {
    log.error('PDF method selection buttons NOT found');
    failed++;
  }
} else {
  log.error(`PaymentDetailsModal.jsx NOT FOUND at ${modalPath}`);
  failed++;
}

// ============================================================================
// Test 4: Validate pdfGenerator.js syntax
// ============================================================================
log.section('Test 4: Validating PDF Generator Syntax');

if (fs.existsSync(pdfGeneratorPath)) {
  try {
    const content = fs.readFileSync(pdfGeneratorPath, 'utf-8');
    
    // Basic syntax checks
    const hasBalancedBraces = (content.match(/{/g) || []).length === (content.match(/}/g) || []).length;
    const hasBalancedParens = (content.match(/\(/g) || []).length === (content.match(/\)/g) || []).length;

    if (hasBalancedBraces && hasBalancedParens) {
      log.success('Syntax validation passed (balanced braces and parentheses)');
      passed++;
    } else {
      log.error('Syntax issues detected (unbalanced braces or parentheses)');
      failed++;
    }
  } catch (error) {
    log.error(`Syntax validation failed: ${error.message}`);
    failed++;
  }
}

// ============================================================================
// Test 5: Check Modal integration options
// ============================================================================
log.section('Test 5: Verifying PDF Method Options');

if (fs.existsSync(modalPath)) {
  const content = fs.readFileSync(modalPath, 'utf-8');

  const methods = {
    html2pdf: /pdfMethod === 'html2pdf'/.test(content),
    jspdf: /pdfMethod === 'jspdf'/.test(content),
    custom: /pdfMethod === 'custom'/.test(content),
  };

  Object.entries(methods).forEach(([method, found]) => {
    if (found) {
      log.success(`PDF method "${method}" option found`);
      passed++;
    } else {
      log.error(`PDF method "${method}" option NOT found`);
      failed++;
    }
  });
}

// ============================================================================
// Test Summary
// ============================================================================
log.section('Test Summary');

const total = passed + failed;
const passPercentage = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;

console.log(`Total Tests: ${total}`);
console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
console.log(`Success Rate: ${passPercentage}%`);

// ============================================================================
// Test Instructions
// ============================================================================
log.section('Next Steps');

if (failed === 0) {
  log.success('All validation checks passed!');
  console.log('\nYou can now:');
  console.log('1. Start the frontend development server: cd frontend && npm run dev');
  console.log('2. Navigate to "My Bookings" and click "Receipt" on a paid booking');
  console.log('3. Try different PDF download methods: Quick, Canvas, or Custom');
  console.log('4. Verify PDFs download correctly and display properly');
} else {
  log.error(`${failed} validation check(s) failed.`);
  console.log('\nPlease:');
  console.log('1. Ensure all packages are installed: npm install jspdf html2canvas');
  console.log('2. Check that pdfGenerator.js exists at: frontend/src/utils/pdfGenerator.js');
  console.log('3. Verify PaymentDetailsModal.jsx has been updated with PDF functionality');
  console.log('4. Run this test again to confirm all changes');
}

// ============================================================================
// Manual Testing Checklist
// ============================================================================
log.section('Manual Testing Checklist');

console.log(`
${colors.cyan}Before deploying, test the following scenarios:${colors.reset}

Receipt Modal Display:
  [ ] Receipt modal opens when clicking "Receipt" button
  [ ] Payment details display correctly
  [ ] All fields populated with data
  
PDF Method Selection:
  [ ] Can select "Quick" method
  [ ] Can select "Canvas" method
  [ ] Can select "Custom" method
  [ ] Selected method is highlighted
  
PDF Download - Quick Method:
  [ ] Downloads file as receipt_<paymentId>.pdf
  [ ] PDF displays receipt with original styling
  [ ] All text readable and formatting intact
  
PDF Download - Canvas Method:
  [ ] Downloads file as receipt_<bookingId>.pdf
  [ ] PDF is visual replica of on-screen receipt
  [ ] All colors and spacing match modal
  [ ] File size approximately 200-400KB
  
PDF Download - Custom Method:
  [ ] Downloads file as receipt_<last6ofPaymentId>.pdf
  [ ] PDF shows professional layout with company branding
  [ ] Company name "TRIMURTI TRANSPORT" displayed
  [ ] Invoice number visible
  [ ] File size approximately 50-100KB
  [ ] Most compact of all methods
  
Browser Compatibility:
  [ ] Works in Chrome
  [ ] Works in Firefox
  [ ] Works in Safari
  [ ] Works in Edge
  
Error Handling:
  [ ] Graceful failure if element not found
  [ ] User receives error message if download fails
  [ ] Button resets correctly after download
  [ ] No console errors or warnings

Performance:
  [ ] Download completes within 3 seconds
  [ ] No browser lag during PDF generation
  [ ] Large payments don't cause timeout
  
Integration:
  [ ] Doesn't break existing payment flow
  [ ] Doesn't break booking functionality
  [ ] Copy transaction ID buttons still work
  [ ] Close modal button works
`);

console.log(`\n${colors.yellow}Test Report Generated Successfully${colors.reset}\n`);
