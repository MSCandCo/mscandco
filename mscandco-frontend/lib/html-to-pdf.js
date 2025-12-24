/**
 * HTML to PDF Conversion Utility
 * Provides both client-side and server-side HTML to PDF conversion
 * Uses Playwright for high-quality PDF generation
 */

/**
 * Convert HTML string or URL to PDF using Playwright (Server-side)
 * @param {Object} options - Conversion options
 * @param {string} options.html - HTML content string
 * @param {string} options.url - URL to convert (alternative to html)
 * @param {string} options.outputPath - Path to save PDF file
 * @param {Object} options.pdfOptions - Playwright PDF options
 * @returns {Promise<Buffer>} PDF buffer
 */
async function convertHtmlToPdfServer(options = {}) {
  const { chromium } = require('playwright');
  const { html, url, outputPath, pdfOptions = {} } = options;

  if (!html && !url) {
    throw new Error('Either html or url must be provided');
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // Set viewport for consistent rendering
    await page.setViewportSize({
      width: pdfOptions.width || 1920,
      height: pdfOptions.height || 1080
    });

    // Load content
    if (url) {
      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: 30000
      });
    } else {
      await page.setContent(html, {
        waitUntil: 'networkidle',
        timeout: 30000
      });
    }

    // Wait for fonts and images to load
    await page.waitForTimeout(2000);

    // Wait for any dynamic content
    await page.evaluate(() => {
      return new Promise((resolve) => {
        if (document.readyState === 'complete') {
          resolve();
        } else {
          window.addEventListener('load', resolve);
        }
      });
    });

    // Generate PDF with optimized settings
    const pdfBuffer = await page.pdf({
      path: outputPath || undefined,
      format: pdfOptions.format || 'A4',
      width: pdfOptions.width || undefined,
      height: pdfOptions.height || undefined,
      printBackground: pdfOptions.printBackground !== false,
      preferCSSPageSize: pdfOptions.preferCSSPageSize !== false,
      margin: pdfOptions.margin || {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      displayHeaderFooter: pdfOptions.displayHeaderFooter || false,
      headerTemplate: pdfOptions.headerTemplate || '',
      footerTemplate: pdfOptions.footerTemplate || '',
      scale: pdfOptions.scale || 1,
      landscape: pdfOptions.landscape || false,
      pageRanges: pdfOptions.pageRanges || '',
      tagged: pdfOptions.tagged || false,
      outline: pdfOptions.outline !== false,
      ...pdfOptions
    });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

/**
 * Convert HTML element to PDF (Client-side using browser print)
 * @param {HTMLElement} element - HTML element to convert
 * @param {Object} options - PDF options
 * @returns {Promise<void>}
 */
async function convertElementToPdfClient(element, options = {}) {
  const { filename = 'document.pdf', css = '' } = options;

  // Create a new window with the content
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    throw new Error('Popup blocked. Please allow popups for this site.');
  }

  // Clone the element and its styles
  const clonedElement = element.cloneNode(true);
  
  // Get all stylesheets
  const stylesheets = Array.from(document.styleSheets);
  let styleText = '';

  stylesheets.forEach((sheet) => {
    try {
      const rules = Array.from(sheet.cssRules || sheet.rules || []);
      rules.forEach((rule) => {
        styleText += rule.cssText + '\n';
      });
    } catch (e) {
      // Cross-origin stylesheets
      if (sheet.href) {
        styleText += `@import url('${sheet.href}');\n`;
      }
    }
  });

  // Write content to new window
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${filename}</title>
        <style>
          ${styleText}
          ${css}
          @media print {
            body { margin: 0; }
            @page { margin: 20mm; }
          }
        </style>
      </head>
      <body>
        ${clonedElement.outerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();

  // Wait for content to load
  await new Promise((resolve) => {
    printWindow.onload = resolve;
    setTimeout(resolve, 1000);
  });

  // Trigger print dialog
  printWindow.print();
}

/**
 * Convert HTML string to PDF via API endpoint
 * @param {string} html - HTML content
 * @param {Object} options - PDF options
 * @returns {Promise<Blob>} PDF blob
 */
async function convertHtmlToPdfViaAPI(html, options = {}) {
  const response = await fetch('/api/pdf/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      html,
      options
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to generate PDF');
  }

  return await response.blob();
}

/**
 * Download PDF blob
 * @param {Blob} pdfBlob - PDF blob
 * @param {string} filename - Filename
 */
function downloadPdf(pdfBlob, filename = 'document.pdf') {
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Convert HTML file to PDF
 * @param {string} htmlFilePath - Path to HTML file
 * @param {string} outputPath - Path to save PDF
 * @param {Object} options - PDF options
 * @returns {Promise<void>}
 */
async function convertHtmlFileToPdf(htmlFilePath, outputPath, options = {}) {
  const fs = require('fs');
  const path = require('path');

  const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
  
  // Resolve relative paths in HTML
  const htmlDir = path.dirname(htmlFilePath);
  const resolvedHtml = htmlContent.replace(
    /(href|src)=["']([^"']+)["']/g,
    (match, attr, value) => {
      if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) {
        return match;
      }
      const absolutePath = path.resolve(htmlDir, value);
      return `${attr}="file://${absolutePath}"`;
    }
  );

  return await convertHtmlToPdfServer({
    html: resolvedHtml,
    outputPath,
    pdfOptions: options
  });
}

// Export functions for use in different contexts
if (typeof window === 'undefined') {
  // Server-side exports
  module.exports = {
    convertHtmlToPdfServer,
    convertHtmlFileToPdf
  };
} else {
  // Client-side exports
  module.exports = {
    convertHtmlToPdfViaAPI,
    downloadPdf,
    convertElementToPdfClient
  };
}

// ES6 exports for Next.js
export {
  convertHtmlToPdfServer,
  convertHtmlFileToPdf,
  convertHtmlToPdfViaAPI,
  downloadPdf,
  convertElementToPdfClient
};

