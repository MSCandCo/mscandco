#!/usr/bin/env node

/**
 * Generate Word Document from Permissions Reference
 * Converts PERMISSIONS_REFERENCE.md to a Word document with formatted tables
 */

const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType, AlignmentType, HeadingLevel } = require('docx');

async function generateWordDocument() {
  const markdownPath = path.join(__dirname, '..', 'PERMISSIONS_REFERENCE.md');
  const outputPath = path.join(__dirname, '..', 'PERMISSIONS_REFERENCE.docx');

  console.log('📖 Reading permissions reference...');
  const markdown = fs.readFileSync(markdownPath, 'utf-8');

  const sections = [];
  let currentSection = null;
  let currentTable = [];

  const lines = markdown.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) continue;

    // Handle headers
    if (line.startsWith('# ')) {
      sections.push({
        type: 'title',
        text: line.substring(2),
        level: 1
      });
    } else if (line.startsWith('## ')) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        type: 'section',
        title: line.substring(3),
        tables: []
      };
    } else if (line.startsWith('### ')) {
      if (currentSection && currentTable.length > 0) {
        currentSection.tables.push(createTableFromData(currentTable));
        currentTable = [];
      }
      currentSection = {
        type: 'subsection',
        title: line.substring(4),
        tables: []
      };
    } else if (line.startsWith('|')) {
      // This is a table row
      const cells = line.split('|').map(c => c.trim()).filter(c => c);
      
      if (cells[0].toLowerCase().includes('permission') || cells[0].toLowerCase().includes('operation') || cells[0].toLowerCase().includes('description')) {
        // This is a header row - start new table
        if (currentTable.length > 0 && currentSection) {
          currentSection.tables.push(createTableFromData(currentTable));
        }
        currentTable = [cells];
      } else if (cells.length > 0 && currentTable.length > 0) {
        // This is a data row
        currentTable.push(cells);
      }
    } else if (line.startsWith('---')) {
      // Separator, skip
      continue;
    } else if (line.length > 0 && !line.startsWith('|')) {
      // Regular text content
      if (!currentSection) {
        sections.push({
          type: 'paragraph',
          text: line
        });
      }
    }
  }

  // Add last table if exists
  if (currentSection && currentTable.length > 0) {
    currentSection.tables.push(createTableFromData(currentTable));
  }
  if (currentSection) {
    sections.push(currentSection);
  }

  console.log(`✅ Parsed ${sections.length} sections`);

  // Convert to Word document
  const children = [];

  for (const section of sections) {
    if (section.type === 'title') {
      children.push(
        new Paragraph({
          text: section.text,
          heading: HeadingLevel.TITLE,
          spacing: { after: 400 }
        })
      );
    } else if (section.type === 'section' || section.type === 'subsection') {
      children.push(
        new Paragraph({
          text: section.title,
          heading: section.type === 'section' ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 200 }
        })
      );

      for (const tableData of section.tables) {
        const tableRows = [];
        
        // Header row
        if (tableData.headers && tableData.headers.length > 0) {
          tableRows.push(
            new TableRow({
              children: tableData.headers.map(header => 
                new TableCell({
                  children: [new Paragraph({
                    text: header,
                    alignment: AlignmentType.CENTER
                  })],
                  shading: { fill: 'E0E0E0' },
                  verticalAlign: 'center'
                })
              )
            })
          );
        }

        // Data rows
        for (const row of tableData.rows) {
          tableRows.push(
            new TableRow({
              children: row.map((cell, idx) => 
                new TableCell({
                  children: [new Paragraph({
                    text: cell || '',
                    alignment: idx === 0 ? AlignmentType.LEFT : AlignmentType.LEFT
                  })],
                  verticalAlign: 'top'
                })
              )
            })
          );
        }

        children.push(
          new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
            margins: { top: 100, bottom: 100, left: 100, right: 100 }
          })
        );
        
        // Add spacing after table
        children.push(
          new Paragraph({
            text: '',
            spacing: { after: 200 }
          })
        );
      }
    } else if (section.type === 'paragraph') {
      children.push(
        new Paragraph({
          text: section.text,
          spacing: { after: 100 }
        })
      );
    }
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children: children
    }]
  });

  console.log('📝 Generating Word document...');
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Word document created: ${outputPath}`);
}

function createTableFromData(data) {
  if (data.length === 0) return null;

  const headers = data[0];
  const rows = data.slice(1);

  return { headers, rows };
}

// Run the script
generateWordDocument().catch(console.error);

