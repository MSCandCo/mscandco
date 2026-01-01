#!/bin/bash

# Markdown to PDF Converter Script
# Converts a markdown file to PDF using md-to-pdf

if [ $# -eq 0 ]; then
    echo "Usage: ./scripts/convert-md-to-pdf.sh <input.md> [output.pdf]"
    echo ""
    echo "Example: ./scripts/convert-md-to-pdf.sh biomedical-job-search.md"
    exit 1
fi

INPUT_FILE="$1"
OUTPUT_FILE="${2:-${INPUT_FILE%.md}.pdf}"

# Check if input file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: File not found: $INPUT_FILE"
    exit 1
fi

echo "Converting $INPUT_FILE to PDF..."
echo "Output will be saved to: $OUTPUT_FILE"
echo ""

# Use npx to run md-to-pdf without installing globally
npx --yes md-to-pdf "$INPUT_FILE" --pdf-options '{"format":"A4","margin":{"top":"20mm","right":"15mm","bottom":"20mm","left":"15mm"},"printBackground":true}' --output "$OUTPUT_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully converted to PDF: $OUTPUT_FILE"
else
    echo ""
    echo "❌ Error converting file"
    exit 1
fi

