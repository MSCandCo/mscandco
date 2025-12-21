#!/usr/bin/env node

/**
 * Command-line tool to convert HTML to PDF
 * 
 * Usage:
 *   node scripts/convert-html-to-pdf.js <input.html> [output.pdf] [options]
 * 
 * Options:
 *   --format=A4|Letter|Legal|Tabloid|Ledger|A0|A1|A2|A3|A4|A5|A6
 *   --landscape
 *   --margin=20mm (all sides) or --margin-top=20mm --margin-right=20mm etc.
 *   --width=1920px
 *   --height=1080px
 *   --scale=1
 *   --no-background
 */

const { convertHtmlFileToPdf } = require('../lib/html-to-pdf');
const path = require('path');
const fs = require('fs');

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
HTML to PDF Converter

Usage:
  node scripts/convert-html-to-pdf.js <input.html> [output.pdf] [options]

Options:
  --format=<format>        PDF format (A4, Letter, Legal, etc.)
  --landscape              Use landscape orientation
  --margin=<size>          Margin for all sides (e.g., 20mm)
  --margin-top=<size>      Top margin
  --margin-right=<size>    Right margin
  --margin-bottom=<size>   Bottom margin
  --margin-left=<size>     Left margin
  --width=<size>           Page width (e.g., 1920px)
  --height=<size>          Page height (e.g., 1080px)
  --scale=<number>         Scale factor (default: 1)
  --no-background          Don't print background graphics
  --help, -h               Show this help message

Examples:
  node scripts/convert-html-to-pdf.js document.html
  node scripts/convert-html-to-pdf.js document.html output.pdf --format=A4
  node scripts/convert-html-to-pdf.js document.html output.pdf --landscape --margin=10mm
    `);
    process.exit(0);
  }

  const inputFile = args[0];
  let outputFile = args[1] && !args[1].startsWith('--') ? args[1] : null;
  
  // Parse options
  const options = {};
  const optionArgs = outputFile ? args.slice(2) : args.slice(1);
  
  optionArgs.forEach(arg => {
    if (arg === '--landscape') {
      options.landscape = true;
    } else if (arg === '--no-background') {
      options.printBackground = false;
    } else if (arg.startsWith('--format=')) {
      options.format = arg.split('=')[1];
    } else if (arg.startsWith('--margin=')) {
      const margin = arg.split('=')[1];
      options.margin = {
        top: margin,
        right: margin,
        bottom: margin,
        left: margin
      };
    } else if (arg.startsWith('--margin-top=')) {
      options.margin = options.margin || {};
      options.margin.top = arg.split('=')[1];
    } else if (arg.startsWith('--margin-right=')) {
      options.margin = options.margin || {};
      options.margin.right = arg.split('=')[1];
    } else if (arg.startsWith('--margin-bottom=')) {
      options.margin = options.margin || {};
      options.margin.bottom = arg.split('=')[1];
    } else if (arg.startsWith('--margin-left=')) {
      options.margin = options.margin || {};
      options.margin.left = arg.split('=')[1];
    } else if (arg.startsWith('--width=')) {
      options.width = arg.split('=')[1];
    } else if (arg.startsWith('--height=')) {
      options.height = arg.split('=')[1];
    } else if (arg.startsWith('--scale=')) {
      options.scale = parseFloat(arg.split('=')[1]);
    }
  });

  // Generate output filename if not provided
  if (!outputFile) {
    const inputBasename = path.basename(inputFile, path.extname(inputFile));
    outputFile = `${inputBasename}.pdf`;
  }

  // Check if input file exists
  if (!fs.existsSync(inputFile)) {
    console.error(`❌ Error: Input file not found: ${inputFile}`);
    process.exit(1);
  }

  try {
    console.log(`🚀 Converting ${inputFile} to PDF...`);
    console.log(`📄 Output: ${outputFile}`);
    
    if (Object.keys(options).length > 0) {
      console.log(`⚙️  Options:`, JSON.stringify(options, null, 2));
    }

    await convertHtmlFileToPdf(inputFile, outputFile, options);
    
    console.log(`✅ PDF created successfully: ${outputFile}`);
  } catch (error) {
    console.error(`❌ Error converting HTML to PDF:`, error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main().catch(console.error);


