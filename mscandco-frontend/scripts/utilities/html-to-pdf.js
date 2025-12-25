/**
 * Legacy HTML to PDF conversion script
 * Now uses the improved utility from lib/html-to-pdf.js
 */

const { convertHtmlFileToPdf } = require('./lib/html-to-pdf');
const path = require('path');

async function convertHtmlToPdf() {
  console.log('🚀 Starting HTML to PDF conversion...');

  const htmlPath = path.join(__dirname, 'MSC_EIC_Accelerator_10_Slides.html');
  const pdfPath = path.join(__dirname, 'MSC_EIC_Accelerator_10_Slides.pdf');

  await convertHtmlFileToPdf(htmlPath, pdfPath, {
    width: '1920px',
    height: '1080px',
    printBackground: true,
    preferCSSPageSize: true,
    margin: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  });

  console.log('✅ PDF created successfully: MSC_EIC_Accelerator_10_Slides.pdf');
}

convertHtmlToPdf().catch(console.error);
