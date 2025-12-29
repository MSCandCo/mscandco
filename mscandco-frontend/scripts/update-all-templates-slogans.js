/**
 * Script to generate SQL UPDATE statements for all marketing email templates
 * Updates footer with logo and appropriate slogan based on category
 */

const fs = require('fs');
const path = require('path');

// Read the original template file to extract template names and categories
const templateFile = path.join(__dirname, '../database/migrations/current/create-marketing-email-templates.sql');
const content = fs.readFileSync(templateFile, 'utf8');

// Extract template information
const templatePattern = /name.*?'([^']+)'.*?category.*?'([^']+)'/gs;
const templates = [];
let match;

while ((match = templatePattern.exec(content)) !== null) {
  templates.push({
    name: match[1],
    category: match[2]
  });
}

// Slogan mapping based on category
const getSlogan = (category, name) => {
  // Welcome & Onboarding templates use warmer artist-focused slogan
  if (category === 'onboarding' || name.toLowerCase().includes('welcome')) {
    return "Empowering Every Artist. Protecting Our Planet.";
  }
  
  // Milestone templates use warmer, personal slogan
  if (category === 'milestone' || name.toLowerCase().includes('milestone')) {
    return "Empowering Every Artist. Protecting Our Planet.";
  }
  
  // All other templates use master brand slogan
  return "Empowering Artists. Protecting the Planet.";
};

// Generate footer HTML
const generateFooter = (slogan) => {
  return `  <div style="text-align: center; margin-top: 30px; padding: 20px; color: #a0aec0; font-size: 12px; background: #ffffff; border-radius: 8px;">
    <div style="text-align: center; margin-bottom: 15px;">
      <img src="https://staging.mscandco.com/logos/MSCandCoLogoV2.png" alt="MSC & Co" style="max-width: 60px; height: auto; display: inline-block;" />
    </div>
    <p style="margin: 0 0 10px 0; font-weight: 500; color: #718096;">${slogan}</p>
    <p style="margin: 0;">
      <a href="{{unsubscribe_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Unsubscribe</a> | 
      <a href="{{preferences_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Email Preferences</a> | 
      <a href="{{support_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Support</a>
    </p>
  </div>`;
};

// Generate SQL UPDATE statements
let sql = `-- ===========================================
-- UPDATE ALL MARKETING EMAIL TEMPLATES
-- Apply improved footer with logo and appropriate slogans
-- ===========================================
-- Date: ${new Date().toISOString().split('T')[0]}
-- Purpose: Update footer section for all templates with logo and category-appropriate slogans
-- ===========================================

`;

templates.forEach((template, index) => {
  const slogan = getSlogan(template.category, template.name);
  const footer = generateFooter(slogan);
  
  // Escape single quotes in footer for SQL
  const footerEscaped = footer.replace(/'/g, "''");
  
  sql += `-- ${index + 1}. ${template.name} (${template.category})
UPDATE marketing_email_templates
SET body_html_template = REGEXP_REPLACE(
  body_html_template,
  '<div style="text-align: center[^>]*>.*?</div>\\s*</body>',
  E'${footerEscaped}\\n</body>',
  'gs'
)
WHERE name = '${template.name}';

`;
});

sql += `-- ===========================================
-- UPDATE COMPLETE
-- Updated ${templates.length} templates with appropriate slogans
-- ===========================================
`;

// Write to file
const outputFile = path.join(__dirname, '../database/migrations/current/update-all-templates-footer-slogans.sql');
fs.writeFileSync(outputFile, sql);

console.log(`Generated SQL update file: ${outputFile}`);
console.log(`Total templates: ${templates.length}`);
console.log(`Templates by category:`);
const byCategory = templates.reduce((acc, t) => {
  acc[t.category] = (acc[t.category] || 0) + 1;
  return acc;
}, {});
Object.entries(byCategory).forEach(([cat, count]) => {
  console.log(`  ${cat}: ${count}`);
});

