# HTML to PDF Conversion Guide

This guide explains how to use the HTML to PDF conversion utilities in the MSC & Co platform.

## Features

- ✅ High-quality PDF generation using Playwright
- ✅ Support for HTML strings, URLs, and files
- ✅ Customizable margins, formats, and page sizes
- ✅ Background graphics and images support
- ✅ Client-side and server-side conversion
- ✅ React hook for easy integration

## Installation

The required dependencies are already installed:
- `playwright` - For server-side PDF generation
- `jspdf` - For client-side PDF generation (alternative)

## Usage

### 1. Server-Side API Endpoint

Convert HTML to PDF via API:

```javascript
// POST /api/pdf/generate
const response = await fetch('/api/pdf/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    html: '<html><body><h1>Hello World</h1></body></html>',
    options: {
      format: 'A4',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      printBackground: true
    }
  })
});

const pdfBlob = await response.blob();
// Download or use the PDF blob
```

### 2. Convert from URL

```javascript
// GET /api/pdf/generate?url=https://example.com&format=A4&landscape=false
const response = await fetch('/api/pdf/generate?url=https://example.com&format=A4');
const pdfBlob = await response.blob();
```

### 3. Using React Hook

```javascript
import { useHtmlToPdf } from '@/hooks/useHtmlToPdf';

function MyComponent() {
  const { convertAndDownload, isGenerating, error } = useHtmlToPdf();

  const handleConvert = async () => {
    try {
      await convertAndDownload(
        '<html><body><h1>My Document</h1></body></html>',
        'my-document.pdf',
        {
          format: 'A4',
          margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
        }
      );
    } catch (err) {
      console.error('PDF generation failed:', err);
    }
  };

  return (
    <button onClick={handleConvert} disabled={isGenerating}>
      {isGenerating ? 'Generating PDF...' : 'Download PDF'}
    </button>
  );
}
```

### 4. Convert HTML Element (Client-Side)

```javascript
import { convertElementToPdfClient } from '@/lib/html-to-pdf';

const handleConvertElement = async () => {
  const element = document.getElementById('my-content');
  await convertElementToPdfClient(element, {
    filename: 'document.pdf',
    css: '@media print { body { font-size: 12pt; } }'
  });
};
```

### 5. Command-Line Tool

Convert HTML files to PDF from the command line:

```bash
# Basic conversion
node scripts/convert-html-to-pdf.js document.html

# With custom output file
node scripts/convert-html-to-pdf.js document.html output.pdf

# With options
node scripts/convert-html-to-pdf.js document.html output.pdf \
  --format=A4 \
  --landscape \
  --margin=10mm \
  --scale=1.2

# Help
node scripts/convert-html-to-pdf.js --help
```

### 6. Server-Side Direct Usage

```javascript
import { convertHtmlToPdfServer } from '@/lib/html-to-pdf';

// Convert HTML string
const pdfBuffer = await convertHtmlToPdfServer({
  html: '<html><body><h1>Hello</h1></body></html>',
  outputPath: './output.pdf', // Optional
  pdfOptions: {
    format: 'A4',
    margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
    printBackground: true
  }
});

// Convert from URL
const pdfBuffer = await convertHtmlToPdfServer({
  url: 'https://example.com',
  pdfOptions: {
    format: 'A4',
    landscape: false
  }
});
```

## PDF Options

### Format Options
- `format`: `'A4'` | `'Letter'` | `'Legal'` | `'Tabloid'` | `'Ledger'` | `'A0'` | `'A1'` | `'A2'` | `'A3'` | `'A5'` | `'A6'`
- `width`: Custom width (e.g., `'1920px'`)
- `height`: Custom height (e.g., `'1080px'`)

### Layout Options
- `landscape`: `boolean` - Use landscape orientation
- `scale`: `number` - Scale factor (default: 1)
- `margin`: Object with `top`, `right`, `bottom`, `left` (e.g., `'20mm'`)

### Content Options
- `printBackground`: `boolean` - Include background graphics (default: `true`)
- `preferCSSPageSize`: `boolean` - Use CSS page size (default: `true`)

### Advanced Options
- `displayHeaderFooter`: `boolean` - Show header/footer
- `headerTemplate`: `string` - HTML template for header
- `footerTemplate`: `string` - HTML template for footer
- `pageRanges`: `string` - Page ranges (e.g., `'1-5,8,11-13'`)
- `tagged`: `boolean` - Generate tagged PDF
- `outline`: `boolean` - Generate outline/bookmarks

## Examples

### Example 1: Invoice PDF

```javascript
const invoiceHTML = `
  <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .invoice { max-width: 800px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 30px; }
        .total { font-size: 24px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="invoice">
        <div class="header">
          <h1>Invoice #12345</h1>
        </div>
        <p>Date: ${new Date().toLocaleDateString()}</p>
        <p>Total: <span class="total">$1,234.56</span></p>
      </div>
    </body>
  </html>
`;

await convertAndDownload(invoiceHTML, 'invoice-12345.pdf', {
  format: 'A4',
  margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' }
});
```

### Example 2: Report with Header/Footer

```javascript
const reportHTML = `
  <html>
    <body>
      <h1>Monthly Report</h1>
      <p>Content here...</p>
    </body>
  </html>
`;

const pdfBuffer = await convertHtmlToPdfServer({
  html: reportHTML,
  pdfOptions: {
    format: 'A4',
    displayHeaderFooter: true,
    headerTemplate: '<div style="font-size:10px; text-align:center; width:100%;">MSC & Co Report</div>',
    footerTemplate: '<div style="font-size:10px; text-align:center; width:100%;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
    margin: { top: '25mm', right: '20mm', bottom: '25mm', left: '20mm' }
  }
});
```

### Example 3: Convert Web Page

```javascript
// Convert a live web page to PDF
const response = await fetch('/api/pdf/generate?url=https://mscandco.com/about&format=A4');
const pdfBlob = await response.blob();

// Download it
const url = URL.createObjectURL(pdfBlob);
const link = document.createElement('a');
link.href = url;
link.download = 'about-page.pdf';
link.click();
```

## Best Practices

1. **Wait for Content**: The utility automatically waits for fonts and images to load, but ensure your HTML is complete before conversion.

2. **Optimize HTML**: Use inline styles when possible to ensure consistent rendering.

3. **Page Breaks**: Use CSS `page-break-before` and `page-break-after` to control page breaks:
   ```css
   .page-break { page-break-before: always; }
   ```

4. **Fonts**: Use web-safe fonts or ensure fonts are properly loaded before conversion.

5. **Images**: Use absolute URLs or ensure relative paths are resolved correctly.

6. **Large Documents**: For very large documents, consider pagination or splitting into multiple PDFs.

## Troubleshooting

### Issue: PDF is blank or missing content
- Ensure `printBackground: true` is set
- Check that all CSS is inline or properly loaded
- Verify images use absolute URLs

### Issue: Fonts not rendering correctly
- Use web-safe fonts or ensure fonts are loaded
- Wait longer for fonts to load (increase timeout)

### Issue: Layout issues
- Use `preferCSSPageSize: false` and specify explicit `width` and `height`
- Check CSS media queries for print styles

### Issue: Server-side conversion fails
- Ensure Playwright is installed: `npm install playwright`
- Install browser binaries: `npx playwright install chromium`

## API Reference

See `/lib/html-to-pdf.js` for full function signatures and documentation.

## Related Files

- `/lib/html-to-pdf.js` - Core utility functions
- `/app/api/pdf/generate/route.js` - API endpoint
- `/hooks/useHtmlToPdf.js` - React hook
- `/scripts/convert-html-to-pdf.js` - CLI tool


