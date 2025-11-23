const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function convertHtmlToPdf() {
  console.log('🚀 Starting HTML to PDF conversion...');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Set viewport to match slide dimensions
  await page.setViewportSize({ width: 1920, height: 1080 });

  // Load the HTML file
  const htmlPath = path.join(__dirname, 'MSC_EIC_Accelerator_10_Slides.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  await page.setContent(htmlContent, {
    waitUntil: 'networkidle'
  });

  // Wait for fonts to load
  await page.waitForTimeout(2000);

  // Generate PDF
  const pdfPath = path.join(__dirname, 'MSC_EIC_Accelerator_10_Slides.pdf');
  await page.pdf({
    path: pdfPath,
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

  await browser.close();

  console.log('✅ PDF created successfully: MSC_EIC_Accelerator_10_Slides.pdf');
}

convertHtmlToPdf().catch(console.error);
