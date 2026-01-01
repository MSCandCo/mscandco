#!/usr/bin/env node

/**
 * Markdown to PDF Converter
 * Converts a markdown file to PDF format
 * 
 * Usage: node scripts/md-to-pdf.js <input.md> [output.pdf]
 */

const fs = require('fs');
const path = require('path');

async function convertMarkdownToPDF(inputPath, outputPath) {
  try {
    // Check if input file exists
    if (!fs.existsSync(inputPath)) {
      console.error(`Error: File not found: ${inputPath}`);
      process.exit(1);
    }

    // Read markdown file
    const markdown = fs.readFileSync(inputPath, 'utf8');

    // Try to use md-to-pdf if available, otherwise use alternative method
    try {
      const { mdToPdf } = require('md-to-pdf');
      
      const pdf = await mdToPdf(
        { content: markdown },
        {
          dest: outputPath,
          pdf_options: {
            format: 'A4',
            margin: {
              top: '20mm',
              right: '15mm',
              bottom: '20mm',
              left: '15mm',
            },
            printBackground: true,
          },
          stylesheet: `
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            h1, h2, h3, h4, h5, h6 {
              color: #2c3e50;
              margin-top: 1.5em;
              margin-bottom: 0.5em;
            }
            h1 { font-size: 2em; border-bottom: 2px solid #3498db; padding-bottom: 0.3em; }
            h2 { font-size: 1.5em; border-bottom: 1px solid #ecf0f1; padding-bottom: 0.3em; }
            h3 { font-size: 1.25em; }
            code {
              background-color: #f4f4f4;
              padding: 2px 6px;
              border-radius: 3px;
              font-family: 'Courier New', monospace;
              font-size: 0.9em;
            }
            pre {
              background-color: #f4f4f4;
              padding: 15px;
              border-radius: 5px;
              overflow-x: auto;
            }
            pre code {
              background-color: transparent;
              padding: 0;
            }
            blockquote {
              border-left: 4px solid #3498db;
              margin: 0;
              padding-left: 20px;
              color: #7f8c8d;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 1em 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px 12px;
              text-align: left;
            }
            th {
              background-color: #3498db;
              color: white;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
          `,
        }
      );

      if (pdf) {
        console.log(`✅ Successfully converted to PDF: ${outputPath}`);
        return;
      }
    } catch (error) {
      if (error.code === 'MODULE_NOT_FOUND') {
        console.log('md-to-pdf not found. Installing...');
        // Fall through to alternative method
      } else {
        throw error;
      }
    }

    // Alternative: Use puppeteer-based approach or suggest installation
    console.error('Error: md-to-pdf package is required.');
    console.error('Please install it by running: npm install md-to-pdf');
    console.error('Or use: npx md-to-pdf <input.md>');
    process.exit(1);

  } catch (error) {
    console.error('Error converting markdown to PDF:', error.message);
    process.exit(1);
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: node scripts/md-to-pdf.js <input.md> [output.pdf]');
  process.exit(1);
}

const inputPath = path.resolve(args[0]);
const outputPath = args[1] 
  ? path.resolve(args[1])
  : inputPath.replace(/\.md$/i, '.pdf');

convertMarkdownToPDF(inputPath, outputPath);

