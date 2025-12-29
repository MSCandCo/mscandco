-- ===========================================
-- ENHANCE ALL EDUCATIONAL TEMPLATES
-- More elaborate, relational, and professional content
-- ===========================================
-- Date: 2025-01-28
-- Purpose: Update all educational templates with enhanced content and consistent styling
-- Total Templates Updated: 10
-- ===========================================
-- 
-- STYLING APPLIED:
-- - Header h1: 22px font-size, 24px padding, line-height: 1.3
-- - Body text: 14px font-size
-- - Signature: 14px font-size, #4a5568 color
-- - Buttons: 14px font-size
-- - Footer: 60px logo, "Empowering Artists. Protecting the Planet." slogan
-- - No logo in header
-- ===========================================

-- 1. Educational - Weekly Newsletter
UPDATE marketing_email_templates
SET 
  subject_template = 'Your Weekly Newsletter is Here – Stay Ahead of the Game',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">📰 Your Weekly Newsletter</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Your weekly music industry newsletter for <strong>{{week_date}}</strong> is here! We''ve curated the most important news, insights, and opportunities to help you stay informed and ahead of industry trends.</p>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">What''s Inside This Week</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">This week''s newsletter brings you:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Latest industry news and market trends</li>
        <li style="margin-bottom: 8px;">Expert tips and actionable strategies</li>
        <li style="margin-bottom: 8px;">Platform updates and new features</li>
        <li style="margin-bottom: 8px;">Success stories from fellow artists and professionals</li>
        <li style="margin-bottom: 8px;">Exclusive opportunities and resources</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7;"><strong>💡 Why This Matters:</strong> Staying informed about industry developments helps you make better decisions, spot opportunities early, and adapt to changes in the music landscape. Our weekly newsletter is designed to give you the insights you need, when you need them.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{newsletter_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Read Full Newsletter</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>Want to customize your newsletter?</strong> You can always adjust your email preferences to receive more or less frequent updates, or focus on topics that matter most to you. We''re here to help you stay informed in the way that works best for you.</p>
    </div>
    
    <p style="font-size: 14px; margin-top: 40px; color: #4a5568; line-height: 1.6;">
      Best regards,<br>
      <strong style="color: #2d3748;">The MSC & Co Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 30px; padding: 20px; color: #a0aec0; font-size: 12px; background: #ffffff; border-radius: 8px;">
    <div style="text-align: center; margin-bottom: 15px;">
      <img src="https://staging.mscandco.com/logos/MSCandCoLogoV2.png" alt="MSC & Co" style="max-width: 60px; height: auto; display: inline-block;" />
    </div>
    <p style="margin: 0 0 10px 0; font-weight: 500; color: #718096;">Empowering Artists. Protecting the Planet.</p>
    <p style="margin: 0;">
      <a href="{{unsubscribe_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Unsubscribe</a> | 
      <a href="{{preferences_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Email Preferences</a> | 
      <a href="{{support_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Support</a>
    </p>
  </div>
</body>
</html>',
  body_text_template = 'Your Weekly Newsletter is Here – Stay Ahead of the Game

Hi {{user_name}},

Your weekly music industry newsletter for {{week_date}} is here! We''ve curated the most important news, insights, and opportunities to help you stay informed and ahead of industry trends.

What''s Inside This Week

This week''s newsletter brings you:
- Latest industry news and market trends
- Expert tips and actionable strategies
- Platform updates and new features
- Success stories from fellow artists and professionals
- Exclusive opportunities and resources

💡 Why This Matters: Staying informed about industry developments helps you make better decisions, spot opportunities early, and adapt to changes in the music landscape. Our weekly newsletter is designed to give you the insights you need, when you need them.

Read Full Newsletter: {{newsletter_url}}

Want to customize your newsletter? You can always adjust your email preferences to receive more or less frequent updates, or focus on topics that matter most to you. We''re here to help you stay informed in the way that works best for you.

Best regards,
The MSC & Co Team'
WHERE name = 'Educational - Weekly Newsletter';

-- 2. Educational - Monthly Newsletter
UPDATE marketing_email_templates
SET 
  subject_template = 'Your Monthly Roundup – Highlights from {{month_name}}',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">📅 Monthly Newsletter – {{month_name}}</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">As <strong>{{month_name}}</strong> comes to a close, we''ve compiled a comprehensive monthly roundup featuring the most impactful news, platform updates, success stories, and insights from the past month. This is your opportunity to catch up on everything that matters in the music industry.</p>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">This Month''s Highlights</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">Your monthly digest includes:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Major industry news and trends from {{month_name}}</li>
        <li style="margin-bottom: 8px;">Platform updates and new features you should know about</li>
        <li style="margin-bottom: 8px;">Inspiring success stories from our community</li>
        <li style="margin-bottom: 8px;">Key insights and lessons learned</li>
        <li style="margin-bottom: 8px;">Looking ahead: What''s coming next month</li>
      </ul>
    </div>
    
    <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #92400e; line-height: 1.7;"><strong>🎯 Take Action:</strong> Use this monthly overview to reflect on your own progress, identify areas for growth, and plan your strategy for the coming month. Each issue is designed to provide both inspiration and practical guidance.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{newsletter_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Read Monthly Roundup</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>Thank you for being part of our community!</strong> Your engagement and feedback help us create content that truly serves your needs. If there''s a topic you''d like to see covered in future newsletters, we''d love to hear from you.</p>
    </div>
    
    <p style="font-size: 14px; margin-top: 40px; color: #4a5568; line-height: 1.6;">
      Best regards,<br>
      <strong style="color: #2d3748;">The MSC & Co Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 30px; padding: 20px; color: #a0aec0; font-size: 12px; background: #ffffff; border-radius: 8px;">
    <div style="text-align: center; margin-bottom: 15px;">
      <img src="https://staging.mscandco.com/logos/MSCandCoLogoV2.png" alt="MSC & Co" style="max-width: 60px; height: auto; display: inline-block;" />
    </div>
    <p style="margin: 0 0 10px 0; font-weight: 500; color: #718096;">Empowering Artists. Protecting the Planet.</p>
    <p style="margin: 0;">
      <a href="{{unsubscribe_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Unsubscribe</a> | 
      <a href="{{preferences_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Email Preferences</a> | 
      <a href="{{support_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Support</a>
    </p>
  </div>
</body>
</html>',
  body_text_template = 'Your Monthly Roundup – Highlights from {{month_name}}

Hi {{user_name}},

As {{month_name}} comes to a close, we''ve compiled a comprehensive monthly roundup featuring the most impactful news, platform updates, success stories, and insights from the past month. This is your opportunity to catch up on everything that matters in the music industry.

This Month''s Highlights

Your monthly digest includes:
- Major industry news and trends from {{month_name}}
- Platform updates and new features you should know about
- Inspiring success stories from our community
- Key insights and lessons learned
- Looking ahead: What''s coming next month

🎯 Take Action: Use this monthly overview to reflect on your own progress, identify areas for growth, and plan your strategy for the coming month. Each issue is designed to provide both inspiration and practical guidance.

Read Monthly Roundup: {{newsletter_url}}

Thank you for being part of our community! Your engagement and feedback help us create content that truly serves your needs. If there''s a topic you''d like to see covered in future newsletters, we''d love to hear from you.

Best regards,
The MSC & Co Team'
WHERE name = 'Educational - Monthly Newsletter';

-- 3. Educational - Industry News
UPDATE marketing_email_templates
SET 
  subject_template = 'Music Industry News – Stay Informed and Ahead',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">📰 Music Industry News</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">The music industry moves fast, and staying informed is crucial to your success. We''ve curated the latest industry news and developments that matter most: <strong>{{news_items}}</strong>. These insights can help you make informed decisions and spot opportunities before they become mainstream.</p>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">Why Industry News Matters</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">Keeping up with industry developments helps you:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Understand emerging trends and market shifts</li>
        <li style="margin-bottom: 8px;">Identify new opportunities for growth and collaboration</li>
        <li style="margin-bottom: 8px;">Make strategic decisions based on industry knowledge</li>
        <li style="margin-bottom: 8px;">Stay competitive in an ever-evolving landscape</li>
        <li style="margin-bottom: 8px;">Network with awareness of current industry conversations</li>
      </ul>
    </div>
    
    <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #92400e; line-height: 1.7;"><strong>💡 Pro Tip:</strong> Take a few minutes each week to review industry news. It''s an investment in your career that pays dividends in better decision-making, stronger networking, and staying ahead of the curve.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{news_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Read Full News Report</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>Want more frequent updates?</strong> You can adjust your email preferences to receive industry news more frequently, or explore our resource library for deeper analysis and insights on specific topics.</p>
    </div>
    
    <p style="font-size: 14px; margin-top: 40px; color: #4a5568; line-height: 1.6;">
      Best regards,<br>
      <strong style="color: #2d3748;">The MSC & Co Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 30px; padding: 20px; color: #a0aec0; font-size: 12px; background: #ffffff; border-radius: 8px;">
    <div style="text-align: center; margin-bottom: 15px;">
      <img src="https://staging.mscandco.com/logos/MSCandCoLogoV2.png" alt="MSC & Co" style="max-width: 60px; height: auto; display: inline-block;" />
    </div>
    <p style="margin: 0 0 10px 0; font-weight: 500; color: #718096;">Empowering Artists. Protecting the Planet.</p>
    <p style="margin: 0;">
      <a href="{{unsubscribe_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Unsubscribe</a> | 
      <a href="{{preferences_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Email Preferences</a> | 
      <a href="{{support_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Support</a>
    </p>
  </div>
</body>
</html>',
  body_text_template = 'Music Industry News – Stay Informed and Ahead

Hi {{user_name}},

The music industry moves fast, and staying informed is crucial to your success. We''ve curated the latest industry news and developments that matter most: {{news_items}}. These insights can help you make informed decisions and spot opportunities before they become mainstream.

Why Industry News Matters

Keeping up with industry developments helps you:
- Understand emerging trends and market shifts
- Identify new opportunities for growth and collaboration
- Make strategic decisions based on industry knowledge
- Stay competitive in an ever-evolving landscape
- Network with awareness of current industry conversations

💡 Pro Tip: Take a few minutes each week to review industry news. It''s an investment in your career that pays dividends in better decision-making, stronger networking, and staying ahead of the curve.

Read Full News Report: {{news_url}}

Want more frequent updates? You can adjust your email preferences to receive industry news more frequently, or explore our resource library for deeper analysis and insights on specific topics.

Best regards,
The MSC & Co Team'
WHERE name = 'Educational - Industry News';

-- 4. Educational - Tips & Tricks
UPDATE marketing_email_templates
SET 
  subject_template = 'Pro Tips – Level Up Your Music Career',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">💡 Pro Tips – Level Up Your Craft</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">This week''s pro tip focuses on <strong>{{tip_title}}</strong> – a proven strategy that successful artists and industry professionals use to achieve better results. We''ve broken down the approach so you can apply it to your own work and see real improvements.</p>
    
    <div style="background: #f0fdf4; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #10b981;">
      <h2 style="color: #065f46; margin-top: 0; font-size: 20px; font-weight: 600;">Why This Tip Works</h2>
      <p style="color: #047857; margin-bottom: 16px; line-height: 1.7;">This strategy has been tested and proven effective because it:</p>
      <ul style="margin: 0; padding-left: 25px; color: #047857; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Addresses common challenges artists face</li>
        <li style="margin-bottom: 8px;">Provides actionable steps you can implement immediately</li>
        <li style="margin-bottom: 8px;">Builds on best practices from successful professionals</li>
        <li style="margin-bottom: 8px;">Delivers measurable improvements when applied consistently</li>
      </ul>
    </div>
    
    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #92400e; line-height: 1.7;"><strong>🎯 Apply It Today:</strong> The best way to benefit from any tip is to put it into practice right away. Start with small steps, track your progress, and gradually integrate the full strategy into your workflow. Consistency is key to seeing results.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{tips_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Read Full Tips & Strategies</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>Want more tips?</strong> Our tips library is constantly growing with actionable advice from industry experts. Each tip is designed to be practical, immediately applicable, and focused on real results. Explore our full collection to discover strategies that can transform your approach.</p>
    </div>
    
    <p style="font-size: 14px; margin-top: 40px; color: #4a5568; line-height: 1.6;">
      Best regards,<br>
      <strong style="color: #2d3748;">The MSC & Co Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 30px; padding: 20px; color: #a0aec0; font-size: 12px; background: #ffffff; border-radius: 8px;">
    <div style="text-align: center; margin-bottom: 15px;">
      <img src="https://staging.mscandco.com/logos/MSCandCoLogoV2.png" alt="MSC & Co" style="max-width: 60px; height: auto; display: inline-block;" />
    </div>
    <p style="margin: 0 0 10px 0; font-weight: 500; color: #718096;">Empowering Artists. Protecting the Planet.</p>
    <p style="margin: 0;">
      <a href="{{unsubscribe_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Unsubscribe</a> | 
      <a href="{{preferences_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Email Preferences</a> | 
      <a href="{{support_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Support</a>
    </p>
  </div>
</body>
</html>',
  body_text_template = 'Pro Tips – Level Up Your Music Career

Hi {{user_name}},

This week''s pro tip focuses on {{tip_title}} – a proven strategy that successful artists and industry professionals use to achieve better results. We''ve broken down the approach so you can apply it to your own work and see real improvements.

Why This Tip Works

This strategy has been tested and proven effective because it:
- Addresses common challenges artists face
- Provides actionable steps you can implement immediately
- Builds on best practices from successful professionals
- Delivers measurable improvements when applied consistently

🎯 Apply It Today: The best way to benefit from any tip is to put it into practice right away. Start with small steps, track your progress, and gradually integrate the full strategy into your workflow. Consistency is key to seeing results.

Read Full Tips & Strategies: {{tips_url}}

Want more tips? Our tips library is constantly growing with actionable advice from industry experts. Each tip is designed to be practical, immediately applicable, and focused on real results. Explore our full collection to discover strategies that can transform your approach.

Best regards,
The MSC & Co Team'
WHERE name = 'Educational - Tips & Tricks';

-- 5. Educational - Tutorial Series
UPDATE marketing_email_templates
SET 
  subject_template = 'New Tutorial Series – Master Your Craft with Step-by-Step Guides',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🎓 New Tutorial Series Available</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">We''re excited to announce our new tutorial series: <strong>{{tutorial_title}}</strong>. This comprehensive, step-by-step guide is designed to walk you through everything you need to know, from the basics to advanced techniques, helping you master new skills and elevate your craft.</p>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">What You''ll Learn</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">This tutorial series covers:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Fundamental concepts explained clearly and concisely</li>
        <li style="margin-bottom: 8px;">Step-by-step instructions you can follow at your own pace</li>
        <li style="margin-bottom: 8px;">Real-world examples and practical applications</li>
        <li style="margin-bottom: 8px;">Common pitfalls and how to avoid them</li>
        <li style="margin-bottom: 8px;">Advanced techniques to take your skills to the next level</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7;"><strong>📚 Learning at Your Own Pace:</strong> These tutorials are designed to be self-paced, so you can work through them when it''s convenient for you. Each lesson builds on the previous one, ensuring you develop a solid foundation before moving on to more advanced concepts.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{tutorial_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Start Learning Now</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>Ready to begin?</strong> Whether you''re just starting out or looking to refine your skills, this tutorial series is designed to meet you where you are and take you where you want to go. Dive in and start learning today!</p>
    </div>
    
    <p style="font-size: 14px; margin-top: 40px; color: #4a5568; line-height: 1.6;">
      Best regards,<br>
      <strong style="color: #2d3748;">The MSC & Co Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 30px; padding: 20px; color: #a0aec0; font-size: 12px; background: #ffffff; border-radius: 8px;">
    <div style="text-align: center; margin-bottom: 15px;">
      <img src="https://staging.mscandco.com/logos/MSCandCoLogoV2.png" alt="MSC & Co" style="max-width: 60px; height: auto; display: inline-block;" />
    </div>
    <p style="margin: 0 0 10px 0; font-weight: 500; color: #718096;">Empowering Artists. Protecting the Planet.</p>
    <p style="margin: 0;">
      <a href="{{unsubscribe_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Unsubscribe</a> | 
      <a href="{{preferences_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Email Preferences</a> | 
      <a href="{{support_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Support</a>
    </p>
  </div>
</body>
</html>',
  body_text_template = 'New Tutorial Series – Master Your Craft with Step-by-Step Guides

Hi {{user_name}},

We''re excited to announce our new tutorial series: {{tutorial_title}}. This comprehensive, step-by-step guide is designed to walk you through everything you need to know, from the basics to advanced techniques, helping you master new skills and elevate your craft.

What You''ll Learn

This tutorial series covers:
- Fundamental concepts explained clearly and concisely
- Step-by-step instructions you can follow at your own pace
- Real-world examples and practical applications
- Common pitfalls and how to avoid them
- Advanced techniques to take your skills to the next level

📚 Learning at Your Own Pace: These tutorials are designed to be self-paced, so you can work through them when it''s convenient for you. Each lesson builds on the previous one, ensuring you develop a solid foundation before moving on to more advanced concepts.

Start Learning Now: {{tutorial_url}}

Ready to begin? Whether you''re just starting out or looking to refine your skills, this tutorial series is designed to meet you where you are and take you where you want to go. Dive in and start learning today!

Best regards,
The MSC & Co Team'
WHERE name = 'Educational - Tutorial Series';

-- 6. Educational - Best Practices
UPDATE marketing_email_templates
SET 
  subject_template = 'Best Practices Guide – Industry Standards and Proven Strategies',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">⭐ Best Practices Guide</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">We''ve compiled a comprehensive best practices guide on <strong>{{topic}}</strong> – a topic that''s essential for success in today''s music industry. This guide distills industry standards, proven strategies, and expert recommendations into actionable insights you can implement right away.</p>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">What Makes This Guide Valuable</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">This best practices guide provides:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Industry-standard approaches that have proven successful</li>
        <li style="margin-bottom: 8px;">Clear guidelines to help you make informed decisions</li>
        <li style="margin-bottom: 8px;">Real-world examples from successful professionals</li>
        <li style="margin-bottom: 8px;">Common mistakes to avoid and how to navigate challenges</li>
        <li style="margin-bottom: 8px;">Actionable steps you can implement immediately</li>
      </ul>
    </div>
    
    <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #92400e; line-height: 1.7;"><strong>💡 Why Best Practices Matter:</strong> Following industry best practices doesn''t mean doing things exactly like everyone else – it means learning from the collective wisdom of successful professionals and adapting proven strategies to work for your unique situation and goals.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{guide_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Read Best Practices Guide</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>Apply what you learn:</strong> The most effective way to benefit from best practices is to understand the principles behind them and adapt them to your specific context. Use this guide as a foundation, then customize the approaches to fit your unique style and goals.</p>
    </div>
    
    <p style="font-size: 14px; margin-top: 40px; color: #4a5568; line-height: 1.6;">
      Best regards,<br>
      <strong style="color: #2d3748;">The MSC & Co Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 30px; padding: 20px; color: #a0aec0; font-size: 12px; background: #ffffff; border-radius: 8px;">
    <div style="text-align: center; margin-bottom: 15px;">
      <img src="https://staging.mscandco.com/logos/MSCandCoLogoV2.png" alt="MSC & Co" style="max-width: 60px; height: auto; display: inline-block;" />
    </div>
    <p style="margin: 0 0 10px 0; font-weight: 500; color: #718096;">Empowering Artists. Protecting the Planet.</p>
    <p style="margin: 0;">
      <a href="{{unsubscribe_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Unsubscribe</a> | 
      <a href="{{preferences_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Email Preferences</a> | 
      <a href="{{support_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Support</a>
    </p>
  </div>
</body>
</html>',
  body_text_template = 'Best Practices Guide – Industry Standards and Proven Strategies

Hi {{user_name}},

We''ve compiled a comprehensive best practices guide on {{topic}} – a topic that''s essential for success in today''s music industry. This guide distills industry standards, proven strategies, and expert recommendations into actionable insights you can implement right away.

What Makes This Guide Valuable

This best practices guide provides:
- Industry-standard approaches that have proven successful
- Clear guidelines to help you make informed decisions
- Real-world examples from successful professionals
- Common mistakes to avoid and how to navigate challenges
- Actionable steps you can implement immediately

💡 Why Best Practices Matter: Following industry best practices doesn''t mean doing things exactly like everyone else – it means learning from the collective wisdom of successful professionals and adapting proven strategies to work for your unique situation and goals.

Read Best Practices Guide: {{guide_url}}

Apply what you learn: The most effective way to benefit from best practices is to understand the principles behind them and adapt them to your specific context. Use this guide as a foundation, then customize the approaches to fit your unique style and goals.

Best regards,
The MSC & Co Team'
WHERE name = 'Educational - Best Practices';

-- 7. Educational - Case Study
UPDATE marketing_email_templates
SET 
  subject_template = 'Case Study – Learn from Real Success Stories',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">📚 Case Study – Real Success Story</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">We''re excited to share an inspiring case study: <strong>{{case_study_title}}</strong>. This real success story takes you behind the scenes to see exactly what strategies, decisions, and approaches led to breakthrough results. Learn from someone who''s been where you are and found a path to success.</p>
    
    <div style="background: #fff7ed; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f59e0b;">
      <h2 style="color: #92400e; margin-top: 0; font-size: 20px; font-weight: 600;">What You''ll Discover</h2>
      <p style="color: #78350f; margin-bottom: 16px; line-height: 1.7;">This case study reveals:</p>
      <ul style="margin: 0; padding-left: 25px; color: #78350f; line-height: 1.8;">
        <li style="margin-bottom: 8px;">The specific strategies and tactics that drove success</li>
        <li style="margin-bottom: 8px;">Challenges faced and how they were overcome</li>
        <li style="margin-bottom: 8px;">Key decisions that made a significant impact</li>
        <li style="margin-bottom: 8px;">Measurable results and outcomes achieved</li>
        <li style="margin-bottom: 8px;">Lessons learned that you can apply to your own journey</li>
      </ul>
    </div>
    
    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #92400e; line-height: 1.7;"><strong>🎯 Learn and Adapt:</strong> While every situation is unique, case studies provide valuable insights into what works. Use this story as inspiration and a source of ideas, then adapt the successful strategies to fit your own goals, resources, and circumstances.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{case_study_url}}" style="background: #f5af19; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Read Full Case Study</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f5af19;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>Success is possible:</strong> Every successful artist and professional started somewhere. Case studies like this one show that with the right approach, persistence, and strategy, remarkable results are achievable. Let this story inspire and guide you on your own path to success.</p>
    </div>
    
    <p style="font-size: 14px; margin-top: 40px; color: #4a5568; line-height: 1.6;">
      Best regards,<br>
      <strong style="color: #2d3748;">The MSC & Co Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 30px; padding: 20px; color: #a0aec0; font-size: 12px; background: #ffffff; border-radius: 8px;">
    <div style="text-align: center; margin-bottom: 15px;">
      <img src="https://staging.mscandco.com/logos/MSCandCoLogoV2.png" alt="MSC & Co" style="max-width: 60px; height: auto; display: inline-block;" />
    </div>
    <p style="margin: 0 0 10px 0; font-weight: 500; color: #718096;">Empowering Artists. Protecting the Planet.</p>
    <p style="margin: 0;">
      <a href="{{unsubscribe_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Unsubscribe</a> | 
      <a href="{{preferences_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Email Preferences</a> | 
      <a href="{{support_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Support</a>
    </p>
  </div>
</body>
</html>',
  body_text_template = 'Case Study – Learn from Real Success Stories

Hi {{user_name}},

We''re excited to share an inspiring case study: {{case_study_title}}. This real success story takes you behind the scenes to see exactly what strategies, decisions, and approaches led to breakthrough results. Learn from someone who''s been where you are and found a path to success.

What You''ll Discover

This case study reveals:
- The specific strategies and tactics that drove success
- Challenges faced and how they were overcome
- Key decisions that made a significant impact
- Measurable results and outcomes achieved
- Lessons learned that you can apply to your own journey

🎯 Learn and Adapt: While every situation is unique, case studies provide valuable insights into what works. Use this story as inspiration and a source of ideas, then adapt the successful strategies to fit your own goals, resources, and circumstances.

Read Full Case Study: {{case_study_url}}

Success is possible: Every successful artist and professional started somewhere. Case studies like this one show that with the right approach, persistence, and strategy, remarkable results are achievable. Let this story inspire and guide you on your own path to success.

Best regards,
The MSC & Co Team'
WHERE name = 'Educational - Case Study';

-- 8. Educational - Webinar Invitation
UPDATE marketing_email_templates
SET 
  subject_template = 'Join Our Live Webinar – {{webinar_title}}',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🎤 Live Webinar Invitation</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">You''re invited to join us for an exclusive live webinar: <strong>{{webinar_title}}</strong> on <strong>{{webinar_date}}</strong>. This interactive session is designed to provide you with valuable insights, practical strategies, and an opportunity to ask questions directly to industry experts.</p>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">What to Expect</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">This live webinar will cover:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;">In-depth exploration of key topics and current trends</li>
        <li style="margin-bottom: 8px;">Practical strategies you can implement immediately</li>
        <li style="margin-bottom: 8px;">Live Q&A session for your specific questions</li>
        <li style="margin-bottom: 8px;">Expert insights and real-world examples</li>
        <li style="margin-bottom: 8px;">Access to recording if you can''t attend live</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7;"><strong>⏰ Don''t miss out:</strong> This webinar is free to attend, but registration is required and space is limited. Register now to secure your spot and receive the link to join the live session, plus access to the recording afterward.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{webinar_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Register for Webinar</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>Can''t make it live?</strong> No problem! When you register, you''ll automatically receive access to the recording after the webinar concludes, so you can watch it at your convenience and still benefit from all the valuable content.</p>
    </div>
    
    <p style="font-size: 14px; margin-top: 40px; color: #4a5568; line-height: 1.6;">
      Best regards,<br>
      <strong style="color: #2d3748;">The MSC & Co Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 30px; padding: 20px; color: #a0aec0; font-size: 12px; background: #ffffff; border-radius: 8px;">
    <div style="text-align: center; margin-bottom: 15px;">
      <img src="https://staging.mscandco.com/logos/MSCandCoLogoV2.png" alt="MSC & Co" style="max-width: 60px; height: auto; display: inline-block;" />
    </div>
    <p style="margin: 0 0 10px 0; font-weight: 500; color: #718096;">Empowering Artists. Protecting the Planet.</p>
    <p style="margin: 0;">
      <a href="{{unsubscribe_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Unsubscribe</a> | 
      <a href="{{preferences_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Email Preferences</a> | 
      <a href="{{support_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Support</a>
    </p>
  </div>
</body>
</html>',
  body_text_template = 'Join Our Live Webinar – {{webinar_title}}

Hi {{user_name}},

You''re invited to join us for an exclusive live webinar: {{webinar_title}} on {{webinar_date}}. This interactive session is designed to provide you with valuable insights, practical strategies, and an opportunity to ask questions directly to industry experts.

What to Expect

This live webinar will cover:
- In-depth exploration of key topics and current trends
- Practical strategies you can implement immediately
- Live Q&A session for your specific questions
- Expert insights and real-world examples
- Access to recording if you can''t attend live

⏰ Don''t miss out: This webinar is free to attend, but registration is required and space is limited. Register now to secure your spot and receive the link to join the live session, plus access to the recording afterward.

Register for Webinar: {{webinar_url}}

Can''t make it live? No problem! When you register, you''ll automatically receive access to the recording after the webinar concludes, so you can watch it at your convenience and still benefit from all the valuable content.

Best regards,
The MSC & Co Team'
WHERE name = 'Educational - Webinar Invitation';

-- 9. Educational - Resource Library
UPDATE marketing_email_templates
SET 
  subject_template = 'Resource Library Updated – New Content Available',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">📖 Resource Library – New Content Added</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Great news! We''ve just added new content to our resource library: <strong>{{new_resources}}</strong>. Our resource library is continuously growing with carefully curated materials designed to support your growth, expand your knowledge, and help you achieve your goals in the music industry.</p>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">What''s in the Resource Library</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">Our comprehensive library includes:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;">In-depth guides and tutorials on key topics</li>
        <li style="margin-bottom: 8px;">Best practices and industry standards</li>
        <li style="margin-bottom: 8px;">Case studies and success stories</li>
        <li style="margin-bottom: 8px;">Tools, templates, and downloadable resources</li>
        <li style="margin-bottom: 8px;">Expert interviews and video content</li>
        <li style="margin-bottom: 8px;">Regularly updated content to stay current</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7;"><strong>💡 Your Learning Hub:</strong> Think of the resource library as your personal learning hub, always available when you need it. Whether you''re looking to learn something new, solve a specific problem, or explore advanced techniques, you''ll find valuable resources organized and ready to use.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{library_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Browse Resource Library</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>Explore and learn:</strong> The library is organized by topic and category, making it easy to find exactly what you''re looking for. Bookmark your favorites, download resources for offline access, and come back anytime to continue learning at your own pace.</p>
    </div>
    
    <p style="font-size: 14px; margin-top: 40px; color: #4a5568; line-height: 1.6;">
      Best regards,<br>
      <strong style="color: #2d3748;">The MSC & Co Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 30px; padding: 20px; color: #a0aec0; font-size: 12px; background: #ffffff; border-radius: 8px;">
    <div style="text-align: center; margin-bottom: 15px;">
      <img src="https://staging.mscandco.com/logos/MSCandCoLogoV2.png" alt="MSC & Co" style="max-width: 60px; height: auto; display: inline-block;" />
    </div>
    <p style="margin: 0 0 10px 0; font-weight: 500; color: #718096;">Empowering Artists. Protecting the Planet.</p>
    <p style="margin: 0;">
      <a href="{{unsubscribe_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Unsubscribe</a> | 
      <a href="{{preferences_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Email Preferences</a> | 
      <a href="{{support_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Support</a>
    </p>
  </div>
</body>
</html>',
  body_text_template = 'Resource Library Updated – New Content Available

Hi {{user_name}},

Great news! We''ve just added new content to our resource library: {{new_resources}}. Our resource library is continuously growing with carefully curated materials designed to support your growth, expand your knowledge, and help you achieve your goals in the music industry.

What''s in the Resource Library

Our comprehensive library includes:
- In-depth guides and tutorials on key topics
- Best practices and industry standards
- Case studies and success stories
- Tools, templates, and downloadable resources
- Expert interviews and video content
- Regularly updated content to stay current

💡 Your Learning Hub: Think of the resource library as your personal learning hub, always available when you need it. Whether you''re looking to learn something new, solve a specific problem, or explore advanced techniques, you''ll find valuable resources organized and ready to use.

Browse Resource Library: {{library_url}}

Explore and learn: The library is organized by topic and category, making it easy to find exactly what you''re looking for. Bookmark your favorites, download resources for offline access, and come back anytime to continue learning at your own pace.

Best regards,
The MSC & Co Team'
WHERE name = 'Educational - Resource Library';

-- 10. Educational - Expert Interview
UPDATE marketing_email_templates
SET 
  subject_template = 'Expert Interview – Exclusive Insights from {{expert_name}}',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🎙️ Expert Interview – Exclusive Insights</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">We''re thrilled to share an exclusive interview with <strong>{{expert_name}}</strong>, focusing on <strong>{{interview_topic}}</strong>. This is your opportunity to gain insider insights, learn from someone with deep industry experience, and discover strategies and perspectives you won''t find anywhere else.</p>
    
    <div style="background: #fff7ed; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f59e0b;">
      <h2 style="color: #92400e; margin-top: 0; font-size: 20px; font-weight: 600;">What Makes This Interview Special</h2>
      <p style="color: #78350f; margin-bottom: 16px; line-height: 1.7;">In this exclusive conversation, you''ll discover:</p>
      <ul style="margin: 0; padding-left: 25px; color: #78350f; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Insider perspectives on {{interview_topic}} from an industry expert</li>
        <li style="margin-bottom: 8px;">Practical advice and actionable strategies</li>
        <li style="margin-bottom: 8px;">Behind-the-scenes insights and real-world experiences</li>
        <li style="margin-bottom: 8px;">Answers to questions you''ve always wanted to ask</li>
        <li style="margin-bottom: 8px;">Unique viewpoints that challenge conventional thinking</li>
      </ul>
    </div>
    
    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #92400e; line-height: 1.7;"><strong>💎 Exclusive Content:</strong> We''ve worked with {{expert_name}} to create an in-depth interview that goes beyond surface-level conversations. This is content you won''t find elsewhere, packed with valuable insights that can directly impact your approach and results.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{interview_url}}" style="background: #f5af19; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Watch Interview Now</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f5af19;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>Learn from the best:</strong> Interviews like this are an incredible way to learn directly from industry leaders and successful professionals. Take notes, reflect on the insights shared, and consider how you can adapt the strategies and perspectives to your own unique situation and goals.</p>
    </div>
    
    <p style="font-size: 14px; margin-top: 40px; color: #4a5568; line-height: 1.6;">
      Best regards,<br>
      <strong style="color: #2d3748;">The MSC & Co Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 30px; padding: 20px; color: #a0aec0; font-size: 12px; background: #ffffff; border-radius: 8px;">
    <div style="text-align: center; margin-bottom: 15px;">
      <img src="https://staging.mscandco.com/logos/MSCandCoLogoV2.png" alt="MSC & Co" style="max-width: 60px; height: auto; display: inline-block;" />
    </div>
    <p style="margin: 0 0 10px 0; font-weight: 500; color: #718096;">Empowering Artists. Protecting the Planet.</p>
    <p style="margin: 0;">
      <a href="{{unsubscribe_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Unsubscribe</a> | 
      <a href="{{preferences_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Email Preferences</a> | 
      <a href="{{support_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Support</a>
    </p>
  </div>
</body>
</html>',
  body_text_template = 'Expert Interview – Exclusive Insights from {{expert_name}}

Hi {{user_name}},

We''re thrilled to share an exclusive interview with {{expert_name}}, focusing on {{interview_topic}}. This is your opportunity to gain insider insights, learn from someone with deep industry experience, and discover strategies and perspectives you won''t find anywhere else.

What Makes This Interview Special

In this exclusive conversation, you''ll discover:
- Insider perspectives on {{interview_topic}} from an industry expert
- Practical advice and actionable strategies
- Behind-the-scenes insights and real-world experiences
- Answers to questions you''ve always wanted to ask
- Unique viewpoints that challenge conventional thinking

💎 Exclusive Content: We''ve worked with {{expert_name}} to create an in-depth interview that goes beyond surface-level conversations. This is content you won''t find elsewhere, packed with valuable insights that can directly impact your approach and results.

Watch Interview Now: {{interview_url}}

Learn from the best: Interviews like this are an incredible way to learn directly from industry leaders and successful professionals. Take notes, reflect on the insights shared, and consider how you can adapt the strategies and perspectives to your own unique situation and goals.

Best regards,
The MSC & Co Team'
WHERE name = 'Educational - Expert Interview';

-- ===========================================
-- UPDATE COMPLETE
-- ===========================================
-- Updated 10 educational templates with enhanced content:
-- 1. Educational - Weekly Newsletter
-- 2. Educational - Monthly Newsletter
-- 3. Educational - Industry News
-- 4. Educational - Tips & Tricks
-- 5. Educational - Tutorial Series
-- 6. Educational - Best Practices
-- 7. Educational - Case Study
-- 8. Educational - Webinar Invitation
-- 9. Educational - Resource Library
-- 10. Educational - Expert Interview
-- ===========================================


