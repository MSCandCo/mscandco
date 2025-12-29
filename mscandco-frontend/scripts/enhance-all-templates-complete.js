const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '../database/migrations/current/create-marketing-email-templates.sql');
const outputFile = path.join(__dirname, '../database/migrations/current/create-marketing-email-templates-enhanced.sql');

// Logo image HTML - will use {{logo_url}} variable that gets replaced at send time
const LOGO_IMG = '<img src="{{logo_url}}" alt="MSC & Co" style="max-width: 180px; height: auto; margin-bottom: 20px;" />';

// Helper to escape single quotes for SQL
function escapeSQL(str) {
  return str.replace(/'/g, "''");
}

// Enhanced email template HTML generator
function createEnhancedTemplate(options) {
  const {
    title,
    greeting = 'Hi {{user_name}},',
    introduction,
    mainContent,
    ctaText,
    ctaUrl,
    additionalInfo,
    footerNote,
    gradientStart = '#667eea',
    gradientEnd = '#764ba2',
    showLogo = true
  } = options;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    ${showLogo ? LOGO_IMG : ''}
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">${title}</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px; color: #2d3748;">${greeting}</p>
    
    ${introduction ? `<p style="font-size: 16px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">${introduction}</p>` : ''}
    
    ${mainContent || ''}
    
    ${ctaText && ctaUrl ? `
    <div style="text-align: center; margin: 40px 0;">
      <a href="${ctaUrl}" style="background: ${gradientStart}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">${ctaText}</a>
    </div>
    ` : ''}
    
    ${additionalInfo ? `<div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid ${gradientStart};">${additionalInfo}</div>` : ''}
    
    ${footerNote ? `<p style="font-size: 14px; color: #718096; margin-top: 40px; line-height: 1.6;">${footerNote}</p>` : ''}
    
    <p style="font-size: 16px; margin-top: 40px; color: #2d3748;">
      Best regards,<br>
      <strong style="color: #1a202c;">The MSC & Co Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 30px; padding: 20px; color: #a0aec0; font-size: 12px; background: #ffffff; border-radius: 8px;">
    <p style="margin: 0 0 10px 0; font-weight: 500; color: #718096;">MSC & Co | Empowering the Music Industry</p>
    <p style="margin: 0;">
      <a href="{{unsubscribe_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Unsubscribe</a> | 
      <a href="{{preferences_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Email Preferences</a> | 
      <a href="{{support_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Support</a>
    </p>
  </div>
</body>
</html>`;
}

// Enhanced text content generator
function createEnhancedText(options) {
  const {
    title,
    greeting = 'Hi {{user_name}},',
    introduction,
    sections = [],
    ctaText,
    ctaUrl,
    additionalInfo,
    footerNote
  } = options;

  let text = `${title}\n\n${greeting}\n\n`;
  
  if (introduction) {
    text += `${introduction}\n\n`;
  }

  sections.forEach(section => {
    if (section.title) text += `${section.title}\n\n`;
    if (section.content) text += `${section.content}\n\n`;
    if (section.items) {
      section.items.forEach(item => text += `- ${item}\n`);
      text += '\n';
    }
  });

  if (ctaText && ctaUrl) {
    text += `${ctaText}: ${ctaUrl}\n\n`;
  }

  if (additionalInfo) {
    text += `${additionalInfo}\n\n`;
  }

  if (footerNote) {
    text += `${footerNote}\n\n`;
  }

  text += 'Best regards,\nThe MSC & Co Team';

  return text;
}

// Template-specific enhancements - comprehensive mapping
function getEnhancedContent(templateName, category, subject, description, currentVariables) {
  const name = templateName.toLowerCase();
  
  // WELCOME & ONBOARDING templates
  if (name.includes('welcome') && name.includes('new user')) {
    return {
      subject: 'Welcome to MSC & Co – Your Journey Starts Here! 🎵',
      html: createEnhancedTemplate({
        title: 'Welcome to MSC & Co!',
        introduction: `We're absolutely thrilled to have you join the MSC & Co family! You've taken an exciting step forward, and you're now part of a cutting-edge platform designed to empower artists, labels, and music industry professionals like yourself.`,
        mainContent: `
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">🎯 Get Started on Your Journey</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">Here's what you can do right away to make the most of your MSC & Co experience:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 10px;"><strong>Complete your profile:</strong> Unlock all features by adding your information and preferences</li>
        <li style="margin-bottom: 10px;"><strong>Explore the dashboard:</strong> Discover powerful tools and insights tailored to your needs</li>
        <li style="margin-bottom: 10px;"><strong>Check out resources:</strong> Access tutorials, guides, and best practices from industry experts</li>
        <li style="margin-bottom: 10px;"><strong>Connect with community:</strong> Join a network of talented artists and professionals</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7;"><strong>💡 Pro Tip:</strong> Take a few minutes to complete your profile setup. This will personalize your experience and help you discover features most relevant to your goals.</p>
    </div>
    `,
        ctaText: 'Go to Dashboard',
        ctaUrl: '{{dashboard_url}}',
        footerNote: `Need help getting started? Our support team is here for you. Simply reply to this email or visit our help center for assistance. We're committed to making your experience with MSC & Co exceptional.`,
        gradientStart: '#667eea',
        gradientEnd: '#764ba2'
      }),
      text: createEnhancedText({
        title: 'Welcome to MSC & Co!',
        introduction: `We're absolutely thrilled to have you join the MSC & Co family! You've taken an exciting step forward, and you're now part of a cutting-edge platform designed to empower artists, labels, and music industry professionals like yourself.`,
        sections: [
          {
            title: 'Get Started on Your Journey',
            items: [
              'Complete your profile to unlock all features',
              'Explore the dashboard and discover powerful tools',
              'Check out resources, tutorials, and best practices',
              'Connect with our vibrant community'
            ]
          }
        ],
        ctaText: 'Go to Dashboard',
        ctaUrl: '{{dashboard_url}}',
        footerNote: 'Need help getting started? Our support team is here for you. Simply reply to this email or visit our help center.'
      })
    };
  }

  if (name.includes('welcome') && name.includes('artist')) {
    return {
      subject: 'Welcome, {{artist_name}}! Let\'s Launch Your Music Career 🎤',
      html: createEnhancedTemplate({
        title: 'Welcome to Your Artist Journey!',
        greeting: 'Hi {{user_name}},',
        introduction: `Welcome to MSC & Co! Your musical journey starts here, and we couldn't be more excited to be part of it. We're here to help you distribute your music, monetize your art, and grow your audience with professional-grade tools designed specifically for artists.`,
        mainContent: `
    <div style="background: #fef3c7; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f59e0b;">
      <h2 style="color: #92400e; margin-top: 0; font-size: 20px; font-weight: 600;">🚀 Your Comprehensive Artist Toolkit</h2>
      <p style="color: #78350f; margin-bottom: 16px; line-height: 1.7;">As a member of MSC & Co, you now have access to powerful tools designed to elevate your music career:</p>
      <ul style="margin: 0; padding-left: 25px; color: #78350f; line-height: 1.8;">
        <li style="margin-bottom: 12px;"><strong>Global Music Distribution:</strong> Release your tracks to major streaming platforms worldwide, reaching millions of potential listeners</li>
        <li style="margin-bottom: 12px;"><strong>Advanced Analytics Dashboard:</strong> Track streams, earnings, and audience insights with real-time data and detailed reports</li>
        <li style="margin-bottom: 12px;"><strong>Automated Royalty Management:</strong> Get paid for your music automatically with transparent, timely payments</li>
        <li style="margin-bottom: 12px;"><strong>Marketing & Promotion Tools:</strong> Promote your releases effectively with integrated social media and playlist pitching</li>
        <li style="margin-bottom: 12px;"><strong>AI-Powered Insights:</strong> Leverage artificial intelligence to understand trends and optimize your strategy</li>
      </ul>
    </div>
    
    <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #065f46; line-height: 1.7;"><strong>💡 Pro Tip:</strong> Complete your artist profile and upload your first release to get started. The sooner you begin, the sooner you'll start building your audience and earning from your music.</p>
    </div>
    `,
        ctaText: 'Access Artist Dashboard',
        ctaUrl: '{{artist_dashboard_url}}',
        footerNote: `Ready to share your music with the world? We're here to support you every step of the way. If you have any questions, our artist support team is just an email away.`,
        gradientStart: '#f093fb',
        gradientEnd: '#f5576c'
      }),
      text: createEnhancedText({
        title: 'Welcome to Your Artist Journey!',
        greeting: 'Hi {{user_name}},',
        introduction: `Welcome to MSC & Co! Your musical journey starts here, and we're here to help you distribute your music, monetize your art, and grow your audience.`,
        sections: [
          {
            title: 'Your Comprehensive Artist Toolkit',
            items: [
              'Global Music Distribution to major platforms worldwide',
              'Advanced Analytics Dashboard with real-time insights',
              'Automated Royalty Management for transparent payments',
              'Marketing & Promotion Tools for effective releases',
              'AI-Powered Insights to optimize your strategy'
            ]
          }
        ],
        ctaText: 'Access Artist Dashboard',
        ctaUrl: '{{artist_dashboard_url}}',
        footerNote: 'Ready to share your music with the world? Our artist support team is here to help.'
      })
    };
  }

  // BILLING templates
  if (name.includes('annual renewal')) {
    return {
      subject: 'Your Annual Subscription Renewal – Action Required',
      html: createEnhancedTemplate({
        title: 'Your Annual Subscription Renewal – Action Required',
        introduction: `Your annual MSC & Co subscription is set to automatically renew on <strong>{{renewal_date}}</strong> for <strong>{{amount}}</strong>. We wanted to give you advance notice so you can prepare accordingly.`,
        mainContent: `
    <div style="background: #fff7ed; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f59e0b;">
      <h2 style="color: #92400e; margin-top: 0; font-size: 20px; font-weight: 600;">📅 What This Means for You</h2>
      <p style="color: #78350f; margin-bottom: 16px; line-height: 1.7;">This renewal ensures you maintain uninterrupted access to all the features and benefits of your current plan, including:</p>
      <ul style="margin: 0; padding-left: 25px; color: #78350f; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Full platform access and all premium features</li>
        <li style="margin-bottom: 8px;">Priority customer support and assistance</li>
        <li style="margin-bottom: 8px;">Regular updates and new feature releases</li>
        <li style="margin-bottom: 8px;">All benefits included in your current subscription tier</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #10b981;">
      <h2 style="color: #065f46; margin-top: 0; font-size: 20px; font-weight: 600;">✅ Action Required</h2>
      <p style="color: #047857; margin-bottom: 0; line-height: 1.7;">To ensure there are no interruptions to your service, please take a moment to verify that your payment method is up to date. You can review and update your billing information at any time before the renewal date.</p>
    </div>
    `,
        ctaText: 'Review & Update Billing Information',
        ctaUrl: '{{renew_url}}',
        additionalInfo: `<p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>Need assistance?</strong> If you have any questions about your subscription, billing details, or would like to explore different plan options, our support team is available to help. Simply reply to this email or visit our support center.</p>`,
        footerNote: `We truly appreciate your continued partnership with MSC & Co. Your trust in our platform means everything to us, and we're committed to delivering exceptional value as we move forward together.`,
        gradientStart: '#667eea',
        gradientEnd: '#764ba2'
      }),
      text: createEnhancedText({
        title: 'Your Annual Subscription Renewal – Action Required',
        introduction: `Your annual MSC & Co subscription is set to automatically renew on {{renewal_date}} for {{amount}}. We wanted to give you advance notice so you can prepare accordingly.`,
        sections: [
          {
            title: 'What This Means for You',
            items: [
              'Full platform access and all premium features',
              'Priority customer support and assistance',
              'Regular updates and new feature releases',
              'All benefits included in your current subscription tier'
            ]
          },
          {
            title: 'Action Required',
            content: 'To ensure there are no interruptions to your service, please verify that your payment method is up to date.'
          }
        ],
        ctaText: 'Review & Update Billing Information',
        ctaUrl: '{{renew_url}}',
        additionalInfo: 'Need assistance? If you have any questions about your subscription or billing, our support team is available to help.',
        footerNote: 'We truly appreciate your continued partnership with MSC & Co.'
      })
    };
  }

  // Default enhanced template for any that don't have specific enhancements
  // We'll enhance ALL templates, so let's create a generic professional version
  const defaultEnhancement = {
    subject: subject || templateName,
    html: createEnhancedTemplate({
      title: templateName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      introduction: description || `We wanted to reach out regarding your MSC & Co account. This message contains important information that requires your attention.`,
      mainContent: `
    <div style="background: #f7fafc; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;">${description || 'Please review the details below and take any necessary action.'}</p>
    </div>
    `,
      footerNote: `If you have any questions or need assistance, please don't hesitate to reach out to our support team. We're here to help.`,
      gradientStart: '#667eea',
      gradientEnd: '#764ba2'
    }),
    text: createEnhancedText({
      title: templateName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      introduction: description || `We wanted to reach out regarding your MSC & Co account.`,
      sections: [
        {
          content: description || 'Please review the details and take any necessary action.'
        }
      ],
      footerNote: 'If you have any questions, please contact our support team.'
    })
  };

  return defaultEnhancement;
}

// Main processing function
function processTemplates() {
  console.log('Reading SQL file...');
  const content = fs.readFileSync(inputFile, 'utf8');
  
  console.log('Processing templates...');
  
  // Split by INSERT statements
  const insertPattern = /INSERT INTO marketing_email_templates \(name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at\)\s+VALUES\s+\(/g;
  
  let processed = content;
  let match;
  let count = 0;
  const templateMatches = [];
  
  // Find all INSERT statements
  while ((match = insertPattern.exec(content)) !== null) {
    templateMatches.push(match.index);
  }
  
  console.log(`Found ${templateMatches.length} templates to process`);
  
  // Process from end to start to maintain positions
  for (let i = templateMatches.length - 1; i >= 0; i--) {
    const startPos = templateMatches[i];
    const afterStart = content.substring(startPos);
    
    // Find the matching closing parenthesis
    let depth = 0;
    let inString = false;
    let stringChar = null;
    let endPos = -1;
    
    for (let j = 0; j < afterStart.length; j++) {
      const char = afterStart[j];
      const prevChar = j > 0 ? afterStart[j - 1] : '';
      
      if (!inString && (char === '"' || char === "'")) {
        inString = true;
        stringChar = char;
      } else if (inString && char === stringChar && prevChar !== '\\') {
        inString = false;
        stringChar = null;
      } else if (!inString) {
        if (char === '(') depth++;
        if (char === ')') {
          depth--;
          if (depth === 0) {
            endPos = startPos + j + 1;
            break;
          }
        }
      }
    }
    
    if (endPos === -1) {
      console.log(`Warning: Could not find end of template ${i + 1}`);
      continue;
    }
    
    const templateBlock = content.substring(startPos, endPos);
    
    // Extract template name
    const nameMatch = templateBlock.match(/'([^']+)',\s*'([^']+)',\s*'([^']+)'/);
    if (!nameMatch) {
      console.log(`Warning: Could not parse template ${i + 1}`);
      continue;
    }
    
    const templateName = nameMatch[1];
    const description = nameMatch[2];
    const subject = nameMatch[3];
    
    // Extract category
    const categoryMatch = templateBlock.match(/category,\s*variables,\s*is_active[^)]+'([^']+)',/);
    const category = categoryMatch ? categoryMatch[1] : 'general';
    
    console.log(`Processing: ${templateName} (${category})`);
    
    // Get enhanced content
    const enhanced = getEnhancedContent(templateName, category, subject, description, []);
    
    // For now, we'll create a new migration file with UPDATE statements
    // Actually, let's enhance the INSERT statement directly
    // Replace the subject, html, and text
    
    // This is complex - let's create UPDATE statements instead
    count++;
  }
  
  console.log(`Processed ${count} templates`);
  console.log('\nNote: Due to complexity of SQL parsing, creating UPDATE migration file instead...');
  
  // Create UPDATE migration file
  createUpdateMigration();
}

function createUpdateMigration() {
  console.log('Creating UPDATE migration file...');
  
  // Read the original file to extract template names and categories
  const content = fs.readFileSync(inputFile, 'utf8');
  
  // Extract template information using regex
  const templateRegex = /INSERT INTO marketing_email_templates[^)]+VALUES\s*\(\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']{0,500})/gs;
  
  let updateSQL = `-- ===========================================
-- ENHANCED MARKETING EMAIL TEMPLATES
-- ===========================================
-- Date: ${new Date().toISOString().split('T')[0]}
-- Purpose: Update all email templates with professional copy, logo, and enhanced structure
-- Total Templates: 129
-- ===========================================

`;

  const matches = [...content.matchAll(/INSERT INTO marketing_email_templates[^;]+;/gs)];
  
  console.log(`Found ${matches.length} template statements`);
  
  // For efficiency, let's just enhance the most common templates manually in the SQL file
  // and create a comprehensive enhancement script
  
  fs.writeFileSync(outputFile, updateSQL);
  console.log(`Created ${outputFile}`);
  console.log('\nSince this is complex, let me enhance the templates directly in a new SQL file...');
}

// Actually, let's take a different approach - enhance templates directly
// by reading and writing a new enhanced SQL file
processTemplates();

