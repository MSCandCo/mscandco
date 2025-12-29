-- ===========================================
-- ENHANCE ALL ADMIN (PRODUCT) TEMPLATES
-- More elaborate, relational, and professional content
-- ===========================================
-- Date: 2025-01-28
-- Purpose: Update all admin/product templates with enhanced content and consistent styling
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

-- 1. Product - Major Update
UPDATE marketing_email_templates
SET 
  subject_template = '🚀 Major Update – {{update_name}}',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🚀 Major Update</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Big news! We''ve just launched <strong>{{update_name}}</strong>, and this is a significant step forward for MSC & Co. {{update_details}}. This isn''t just an incremental improvement – we''ve reimagined key aspects of the platform to better serve you, our community of artists and music professionals. These changes reflect your feedback, industry trends, and our commitment to providing you with cutting-edge tools that help you succeed in today''s music industry.</p>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">What This Means for You</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">This major update brings substantial improvements across the platform:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;"><strong>Enhanced performance:</strong> Faster load times, smoother interactions, and improved reliability across all features</li>
        <li style="margin-bottom: 8px;"><strong>Better user experience:</strong> Streamlined workflows, intuitive interfaces, and features designed around how you actually work</li>
        <li style="margin-bottom: 8px;"><strong>New capabilities:</strong> Expanded functionality that opens up new possibilities for your music career</li>
        <li style="margin-bottom: 8px;"><strong>Improved insights:</strong> Better analytics and reporting to help you make data-driven decisions</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>💡 Getting Started:</strong> We''ve prepared comprehensive guides and resources to help you get the most out of these updates. Whether you''re a longtime user or new to the platform, we''ve got you covered with tutorials, best practices, and dedicated support.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{update_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Explore Update</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Your feedback drives innovation:</strong> This update wouldn''t have been possible without the valuable insights you''ve shared with us. We''re constantly listening, learning, and evolving the platform based on your needs. As you explore these changes, we''d love to hear what you think and how we can continue to improve your experience.</p>
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
  body_text_template = '🚀 Major Update – {{update_name}}

Hi {{user_name}},

Big news! We''ve just launched {{update_name}}, and this is a significant step forward for MSC & Co. {{update_details}}. This isn''t just an incremental improvement – we''ve reimagined key aspects of the platform to better serve you, our community of artists and music professionals. These changes reflect your feedback, industry trends, and our commitment to providing you with cutting-edge tools that help you succeed in today''s music industry.

What This Means for You

This major update brings substantial improvements across the platform:
- Enhanced performance: Faster load times, smoother interactions, and improved reliability across all features
- Better user experience: Streamlined workflows, intuitive interfaces, and features designed around how you actually work
- New capabilities: Expanded functionality that opens up new possibilities for your music career
- Improved insights: Better analytics and reporting to help you make data-driven decisions

💡 Getting Started: We''ve prepared comprehensive guides and resources to help you get the most out of these updates. Whether you''re a longtime user or new to the platform, we''ve got you covered with tutorials, best practices, and dedicated support.

Explore Update: {{update_url}}

Your feedback drives innovation: This update wouldn''t have been possible without the valuable insights you''ve shared with us. We''re constantly listening, learning, and evolving the platform based on your needs. As you explore these changes, we''d love to hear what you think and how we can continue to improve your experience.

Best regards,
The MSC & Co Team'
WHERE name = 'Product - Major Update';

-- 2. Product - New Feature Launch
UPDATE marketing_email_templates
SET 
  subject_template = '✨ New Feature – {{feature_name}}',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">✨ New Feature</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">We''re excited to introduce <strong>{{feature_name}}</strong> – a powerful new capability designed to help you achieve more with your music. {{feature_description}}. This feature represents our ongoing commitment to innovation and our dedication to providing you with tools that genuinely make a difference in your creative journey. Built based on feedback from artists like you, we believe this will become an integral part of how you work and grow.</p>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">What You Can Do</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">This new feature opens up exciting possibilities:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;"><strong>Streamline your workflow:</strong> Save time and effort with intuitive tools that integrate seamlessly into your existing processes</li>
        <li style="margin-bottom: 8px;"><strong>Unlock new capabilities:</strong> Access functionality that wasn''t available before, opening up new creative and professional opportunities</li>
        <li style="margin-bottom: 8px;"><strong>Enhance your results:</strong> Achieve better outcomes with features designed to amplify your efforts</li>
        <li style="margin-bottom: 8px;"><strong>Stay ahead of the curve:</strong> Use cutting-edge tools that keep you competitive in today''s music industry</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>🚀 Ready to Try It?</strong> Getting started is easy! We''ve created step-by-step guides and tutorials to help you make the most of this feature from day one. Our support team is also standing by if you have any questions or need assistance.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{feature_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Try Feature</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>We want to hear from you:</strong> As you explore this new feature, your feedback is invaluable. Share your thoughts, suggestions, and experiences – they directly inform how we continue to evolve and improve the platform. Thank you for being part of the MSC & Co community!</p>
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
  body_text_template = '✨ New Feature – {{feature_name}}

Hi {{user_name}},

We''re excited to introduce {{feature_name}} – a powerful new capability designed to help you achieve more with your music. {{feature_description}}. This feature represents our ongoing commitment to innovation and our dedication to providing you with tools that genuinely make a difference in your creative journey. Built based on feedback from artists like you, we believe this will become an integral part of how you work and grow.

What You Can Do

This new feature opens up exciting possibilities:
- Streamline your workflow: Save time and effort with intuitive tools that integrate seamlessly into your existing processes
- Unlock new capabilities: Access functionality that wasn''t available before, opening up new creative and professional opportunities
- Enhance your results: Achieve better outcomes with features designed to amplify your efforts
- Stay ahead of the curve: Use cutting-edge tools that keep you competitive in today''s music industry

🚀 Ready to Try It? Getting started is easy! We''ve created step-by-step guides and tutorials to help you make the most of this feature from day one. Our support team is also standing by if you have any questions or need assistance.

Try Feature: {{feature_url}}

We want to hear from you: As you explore this new feature, your feedback is invaluable. Share your thoughts, suggestions, and experiences – they directly inform how we continue to evolve and improve the platform. Thank you for being part of the MSC & Co community!

Best regards,
The MSC & Co Team'
WHERE name = 'Product - New Feature Launch';

-- 3. Product - Partnership Announcement
UPDATE marketing_email_templates
SET 
  subject_template = '🤝 Partnership Announcement – {{partner_name}}',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🤝 Partnership Announcement</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">We''re thrilled to announce our partnership with <strong>{{partner_name}}</strong>! This collaboration represents an exciting new chapter for MSC & Co and, most importantly, for you. {{partnership_details}}. Together, we''re working to create better solutions, expand opportunities, and deliver even more value to the artists and music professionals who trust us with their careers. This partnership aligns perfectly with our mission to empower artists while building a more sustainable music industry.</p>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">What This Means for You</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">This partnership brings exciting benefits:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;"><strong>Expanded resources:</strong> Access to additional tools, services, and opportunities through our combined networks</li>
        <li style="margin-bottom: 8px;"><strong>Enhanced value:</strong> More comprehensive solutions that address your needs from multiple angles</li>
        <li style="margin-bottom: 8px;"><strong>New opportunities:</strong> Additional pathways for growth, collaboration, and success in your music career</li>
        <li style="margin-bottom: 8px;"><strong>Better support:</strong> Combined expertise and resources to serve you more effectively</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>🌱 Building Something Better:</strong> This partnership is just the beginning. We''re committed to using this collaboration to create meaningful improvements that benefit the entire MSC & Co community. Stay tuned for updates as we roll out new initiatives and opportunities.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{partnership_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Learn More</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Your success is our priority:</strong> Every partnership we enter, every feature we build, and every decision we make is guided by one question: how does this serve our community? This collaboration is no different – it''s designed with your success in mind. Great things are ahead!</p>
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
  body_text_template = '🤝 Partnership Announcement – {{partner_name}}

Hi {{user_name}},

We''re thrilled to announce our partnership with {{partner_name}}! This collaboration represents an exciting new chapter for MSC & Co and, most importantly, for you. {{partnership_details}}. Together, we''re working to create better solutions, expand opportunities, and deliver even more value to the artists and music professionals who trust us with their careers. This partnership aligns perfectly with our mission to empower artists while building a more sustainable music industry.

What This Means for You

This partnership brings exciting benefits:
- Expanded resources: Access to additional tools, services, and opportunities through our combined networks
- Enhanced value: More comprehensive solutions that address your needs from multiple angles
- New opportunities: Additional pathways for growth, collaboration, and success in your music career
- Better support: Combined expertise and resources to serve you more effectively

🌱 Building Something Better: This partnership is just the beginning. We''re committed to using this collaboration to create meaningful improvements that benefit the entire MSC & Co community. Stay tuned for updates as we roll out new initiatives and opportunities.

Learn More: {{partnership_url}}

Your success is our priority: Every partnership we enter, every feature we build, and every decision we make is guided by one question: how does this serve our community? This collaboration is no different – it''s designed with your success in mind. Great things are ahead!

Best regards,
The MSC & Co Team'
WHERE name = 'Product - Partnership Announcement';

-- 4. Product - Service Update
UPDATE marketing_email_templates
SET 
  subject_template = '⚡ Service Update – Enhanced Experience',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">⚡ Service Update</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">We''ve been working behind the scenes to make your MSC & Co experience even better, and we''re excited to share the improvements we''ve made. {{improvements}}. These enhancements are the result of listening to your feedback, analyzing how you use the platform, and continuously striving to deliver the best possible experience. Your experience just got better, and we think you''ll notice the difference immediately.</p>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">What''s Improved</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">Here''s what you can expect:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;"><strong>Better performance:</strong> Faster response times, smoother interactions, and more reliable service across all features</li>
        <li style="margin-bottom: 8px;"><strong>Enhanced usability:</strong> More intuitive interfaces and streamlined workflows that make your daily tasks easier</li>
        <li style="margin-bottom: 8px;"><strong>Improved reliability:</strong> Increased stability and uptime so you can work without interruptions</li>
        <li style="margin-bottom: 8px;"><strong>Refined details:</strong> Polished features and thoughtful improvements that enhance the overall experience</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>✨ Your Feedback Matters:</strong> These improvements wouldn''t have been possible without your insights. Your suggestions and experiences help us prioritize what to work on and ensure we''re building features that truly make a difference.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{update_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">See Improvements</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Continuous improvement:</strong> This update is part of our ongoing commitment to excellence. We''re always working to enhance the platform, and these improvements represent just a snapshot of the progress we''re making every day. Thank you for being part of our journey!</p>
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
  body_text_template = '⚡ Service Update – Enhanced Experience

Hi {{user_name}},

We''ve been working behind the scenes to make your MSC & Co experience even better, and we''re excited to share the improvements we''ve made. {{improvements}}. These enhancements are the result of listening to your feedback, analyzing how you use the platform, and continuously striving to deliver the best possible experience. Your experience just got better, and we think you''ll notice the difference immediately.

What''s Improved

Here''s what you can expect:
- Better performance: Faster response times, smoother interactions, and more reliable service across all features
- Enhanced usability: More intuitive interfaces and streamlined workflows that make your daily tasks easier
- Improved reliability: Increased stability and uptime so you can work without interruptions
- Refined details: Polished features and thoughtful improvements that enhance the overall experience

✨ Your Feedback Matters: These improvements wouldn''t have been possible without your insights. Your suggestions and experiences help us prioritize what to work on and ensure we''re building features that truly make a difference.

See Improvements: {{update_url}}

Continuous improvement: This update is part of our ongoing commitment to excellence. We''re always working to enhance the platform, and these improvements represent just a snapshot of the progress we''re making every day. Thank you for being part of our journey!

Best regards,
The MSC & Co Team'
WHERE name = 'Product - Service Update';

-- 5. Product - Maintenance Notification
UPDATE marketing_email_templates
SET 
  subject_template = '🔧 Scheduled Maintenance – {{maintenance_date}}',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🔧 Scheduled Maintenance</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">We wanted to give you advance notice that we''ll be performing scheduled maintenance on <strong>{{maintenance_date}}</strong> at <strong>{{maintenance_time}}</strong>. During this time, there will be a brief period of downtime while we implement important updates and improvements to the platform. We''ve scheduled this maintenance during off-peak hours to minimize disruption, and we''re working to complete it as quickly as possible.</p>
    
    <div style="background: #fff7ed; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f59e0b;">
      <h2 style="color: #92400e; margin-top: 0; font-size: 20px; font-weight: 600;">What to Expect</h2>
      <p style="color: #78350f; margin-bottom: 16px; line-height: 1.7;">During the maintenance window:</p>
      <ul style="margin: 0; padding-left: 25px; color: #78350f; line-height: 1.8;">
        <li style="margin-bottom: 8px;"><strong>Brief downtime:</strong> The platform will be temporarily unavailable while we perform the updates</li>
        <li style="margin-bottom: 8px;"><strong>Automatic restoration:</strong> Service will resume automatically once maintenance is complete</li>
        <li style="margin-bottom: 8px;"><strong>No data loss:</strong> All your information, releases, and account data are safe and secure</li>
        <li style="margin-bottom: 8px;"><strong>Improved experience:</strong> When we''re back, you''ll benefit from the updates we''re implementing</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>📅 Plan Ahead:</strong> If you have important work scheduled during this time, we recommend completing it before the maintenance window begins. We appreciate your understanding and patience as we work to improve the platform.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{status_url}}" style="background: #f5af19; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Check Status</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f5af19;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Why we do this:</strong> Regular maintenance is essential to keeping the platform running smoothly, securely, and efficiently. These updates enable us to improve performance, add new features, fix issues, and ensure we''re providing you with the best possible experience. We''ll be back soon, better than ever!</p>
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
  body_text_template = '🔧 Scheduled Maintenance – {{maintenance_date}}

Hi {{user_name}},

We wanted to give you advance notice that we''ll be performing scheduled maintenance on {{maintenance_date}} at {{maintenance_time}}. During this time, there will be a brief period of downtime while we implement important updates and improvements to the platform. We''ve scheduled this maintenance during off-peak hours to minimize disruption, and we''re working to complete it as quickly as possible.

What to Expect

During the maintenance window:
- Brief downtime: The platform will be temporarily unavailable while we perform the updates
- Automatic restoration: Service will resume automatically once maintenance is complete
- No data loss: All your information, releases, and account data are safe and secure
- Improved experience: When we''re back, you''ll benefit from the updates we''re implementing

📅 Plan Ahead: If you have important work scheduled during this time, we recommend completing it before the maintenance window begins. We appreciate your understanding and patience as we work to improve the platform.

Check Status: {{status_url}}

Why we do this: Regular maintenance is essential to keeping the platform running smoothly, securely, and efficiently. These updates enable us to improve performance, add new features, fix issues, and ensure we''re providing you with the best possible experience. We''ll be back soon, better than ever!

Best regards,
The MSC & Co Team'
WHERE name = 'Product - Maintenance Notification';

-- 6. Product - Platform Milestone
UPDATE marketing_email_templates
SET 
  subject_template = '🏆 Platform Milestone – {{milestone_description}}',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🏆 Platform Milestone</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">We''re celebrating a major milestone! <strong>{{milestone_description}}</strong>. This achievement wouldn''t have been possible without you and the incredible community of artists, creators, and music professionals who make MSC & Co what it is. Your trust, your creativity, and your success drive everything we do. This milestone belongs to all of us, and we''re deeply grateful to have you as part of this journey.</p>
    
    <div style="background: #f0fdf4; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #10b981;">
      <h2 style="color: #065f46; margin-top: 0; font-size: 20px; font-weight: 600;">What This Represents</h2>
      <p style="color: #047857; margin-bottom: 16px; line-height: 1.7;">This milestone reflects our shared success:</p>
      <ul style="margin: 0; padding-left: 25px; color: #047857; line-height: 1.8;">
        <li style="margin-bottom: 8px;"><strong>Community growth:</strong> A thriving ecosystem of artists supporting each other and achieving great things together</li>
        <li style="margin-bottom: 8px;"><strong>Innovation:</strong> Continuous evolution and improvement of the tools and services you rely on</li>
        <li style="margin-bottom: 8px;"><strong>Impact:</strong> Real, meaningful change in how artists create, distribute, and succeed in the music industry</li>
        <li style="margin-bottom: 8px;"><strong>Partnership:</strong> A shared commitment to building something better for the music industry</li>
      </ul>
    </div>
    
    <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #92400e; line-height: 1.7; font-size: 14px;"><strong>🎉 Thank You:</strong> Every milestone we reach is a testament to the amazing work you do and the trust you place in us. Your success is our success, and we''re honored to be part of your creative journey. Here''s to many more milestones ahead!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{celebration_url}}" style="background: #2ecc71; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Join Celebration</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #2ecc71;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Looking forward:</strong> While we celebrate this achievement, we''re already focused on the next milestone. We''re continuously working to improve, innovate, and create new opportunities for you. The best is yet to come, and we''re excited to continue this journey together!</p>
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
  body_text_template = '🏆 Platform Milestone – {{milestone_description}}

Hi {{user_name}},

We''re celebrating a major milestone! {{milestone_description}}. This achievement wouldn''t have been possible without you and the incredible community of artists, creators, and music professionals who make MSC & Co what it is. Your trust, your creativity, and your success drive everything we do. This milestone belongs to all of us, and we''re deeply grateful to have you as part of this journey.

What This Represents

This milestone reflects our shared success:
- Community growth: A thriving ecosystem of artists supporting each other and achieving great things together
- Innovation: Continuous evolution and improvement of the tools and services you rely on
- Impact: Real, meaningful change in how artists create, distribute, and succeed in the music industry
- Partnership: A shared commitment to building something better for the music industry

🎉 Thank You: Every milestone we reach is a testament to the amazing work you do and the trust you place in us. Your success is our success, and we''re honored to be part of your creative journey. Here''s to many more milestones ahead!

Join Celebration: {{celebration_url}}

Looking forward: While we celebrate this achievement, we''re already focused on the next milestone. We''re continuously working to improve, innovate, and create new opportunities for you. The best is yet to come, and we''re excited to continue this journey together!

Best regards,
The MSC & Co Team'
WHERE name = 'Product - Platform Milestone';

-- 7. Product - API Update
UPDATE marketing_email_templates
SET 
  subject_template = '🔌 API Update – New Capabilities',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🔌 API Update</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">We''ve released an important API update that brings new capabilities and improvements for developers and integrators. {{api_changes}}. This update enhances the flexibility and power of our API, enabling you to build more sophisticated integrations, automate workflows, and create custom solutions that perfectly fit your needs. Whether you''re building tools for yourself or creating solutions for others, these updates expand what''s possible with MSC & Co.</p>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">What''s New</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">Key improvements in this update:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;"><strong>New endpoints:</strong> Expanded functionality with additional API endpoints for enhanced integration capabilities</li>
        <li style="margin-bottom: 8px;"><strong>Improved performance:</strong> Faster response times and more efficient data handling</li>
        <li style="margin-bottom: 8px;"><strong>Better documentation:</strong> Comprehensive guides and examples to help you get started quickly</li>
        <li style="margin-bottom: 8px;"><strong>Enhanced reliability:</strong> More stable and consistent API behavior across all endpoints</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>📚 Documentation Available:</strong> We''ve updated our API documentation with detailed information about all changes, migration guides for existing integrations, and code examples to help you implement the updates smoothly.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{api_docs_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">View API Docs</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Need help?</strong> If you have questions about the API updates or need assistance with your integration, our developer support team is here to help. We''re committed to making these updates as smooth as possible for you.</p>
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
  body_text_template = '🔌 API Update – New Capabilities

Hi {{user_name}},

We''ve released an important API update that brings new capabilities and improvements for developers and integrators. {{api_changes}}. This update enhances the flexibility and power of our API, enabling you to build more sophisticated integrations, automate workflows, and create custom solutions that perfectly fit your needs. Whether you''re building tools for yourself or creating solutions for others, these updates expand what''s possible with MSC & Co.

What''s New

Key improvements in this update:
- New endpoints: Expanded functionality with additional API endpoints for enhanced integration capabilities
- Improved performance: Faster response times and more efficient data handling
- Better documentation: Comprehensive guides and examples to help you get started quickly
- Enhanced reliability: More stable and consistent API behavior across all endpoints

📚 Documentation Available: We''ve updated our API documentation with detailed information about all changes, migration guides for existing integrations, and code examples to help you implement the updates smoothly.

View API Docs: {{api_docs_url}}

Need help? If you have questions about the API updates or need assistance with your integration, our developer support team is here to help. We''re committed to making these updates as smooth as possible for you.

Best regards,
The MSC & Co Team'
WHERE name = 'Product - API Update';

-- 8. Product - Integration Launch
UPDATE marketing_email_templates
SET 
  subject_template = '🔗 New Integration – {{integration_name}}',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🔗 New Integration</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">We''re excited to announce a new integration with <strong>{{integration_name}}</strong>! {{integration_details}}. This integration streamlines your workflow by connecting MSC & Co with tools you already use, eliminating manual steps and creating a more seamless experience. By bringing these platforms together, we''re making it easier for you to manage your music career, automate repetitive tasks, and focus on what matters most – creating great music.</p>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">How This Helps You</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">This integration provides:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;"><strong>Seamless connectivity:</strong> Connect your existing tools and workflows for a unified experience</li>
        <li style="margin-bottom: 8px;"><strong>Time savings:</strong> Automate processes and reduce manual work with synchronized data</li>
        <li style="margin-bottom: 8px;"><strong>Better efficiency:</strong> Work more effectively with tools that communicate seamlessly</li>
        <li style="margin-bottom: 8px;"><strong>Expanded capabilities:</strong> Access additional functionality through the combined power of integrated platforms</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>⚡ Quick Setup:</strong> Getting started is straightforward – we''ve designed the integration to be simple and intuitive. Our setup guide walks you through the process step by step, and if you need help, our support team is ready to assist.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{integration_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Set Up Integration</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Building your toolkit:</strong> This integration is part of our ongoing effort to create a comprehensive ecosystem of connected tools that work together to support your music career. We''re continuously exploring new integrations and partnerships that can make your work easier and more effective.</p>
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
  body_text_template = '🔗 New Integration – {{integration_name}}

Hi {{user_name}},

We''re excited to announce a new integration with {{integration_name}}! {{integration_details}}. This integration streamlines your workflow by connecting MSC & Co with tools you already use, eliminating manual steps and creating a more seamless experience. By bringing these platforms together, we''re making it easier for you to manage your music career, automate repetitive tasks, and focus on what matters most – creating great music.

How This Helps You

This integration provides:
- Seamless connectivity: Connect your existing tools and workflows for a unified experience
- Time savings: Automate processes and reduce manual work with synchronized data
- Better efficiency: Work more effectively with tools that communicate seamlessly
- Expanded capabilities: Access additional functionality through the combined power of integrated platforms

⚡ Quick Setup: Getting started is straightforward – we''ve designed the integration to be simple and intuitive. Our setup guide walks you through the process step by step, and if you need help, our support team is ready to assist.

Set Up Integration: {{integration_url}}

Building your toolkit: This integration is part of our ongoing effort to create a comprehensive ecosystem of connected tools that work together to support your music career. We''re continuously exploring new integrations and partnerships that can make your work easier and more effective.

Best regards,
The MSC & Co Team'
WHERE name = 'Product - Integration Launch';

-- 9. Product - Mobile App Launch
UPDATE marketing_email_templates
SET 
  subject_template = '📱 Mobile App Launch – Take Music On The Go',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">📱 Mobile App Launch</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">We''re thrilled to announce the launch of the MSC & Co mobile app! Now you can manage your music career from anywhere, at any time. {{app_features}}. This app brings the power of MSC & Co directly to your smartphone, giving you the flexibility to stay connected with your music, your audience, and your career whether you''re in the studio, on the road, or anywhere in between. We''ve designed it to be fast, intuitive, and powerful – everything you need to stay on top of your music career, right in your pocket.</p>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">What You Can Do</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">With the mobile app, you can:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;"><strong>Stay connected:</strong> Access your account, releases, and analytics from anywhere</li>
        <li style="margin-bottom: 8px;"><strong>Manage on the go:</strong> Handle essential tasks quickly and efficiently from your mobile device</li>
        <li style="margin-bottom: 8px;"><strong>Real-time updates:</strong> Get instant notifications about important events and milestones</li>
        <li style="margin-bottom: 8px;"><strong>Seamless sync:</strong> Everything stays synchronized between your mobile app and desktop experience</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>🚀 Get Started Today:</strong> Download the app now and start managing your music career on the go. It''s free, easy to use, and available for both iOS and Android devices. Your mobile music management solution is ready when you are!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{app_download_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Download App</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Music wherever you are:</strong> The music industry doesn''t stop when you leave your desk, and neither should your ability to manage your career. With the MSC & Co mobile app, you have the tools you need at your fingertips, wherever your music takes you.</p>
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
  body_text_template = '📱 Mobile App Launch – Take Music On The Go

Hi {{user_name}},

We''re thrilled to announce the launch of the MSC & Co mobile app! Now you can manage your music career from anywhere, at any time. {{app_features}}. This app brings the power of MSC & Co directly to your smartphone, giving you the flexibility to stay connected with your music, your audience, and your career whether you''re in the studio, on the road, or anywhere in between. We''ve designed it to be fast, intuitive, and powerful – everything you need to stay on top of your music career, right in your pocket.

What You Can Do

With the mobile app, you can:
- Stay connected: Access your account, releases, and analytics from anywhere
- Manage on the go: Handle essential tasks quickly and efficiently from your mobile device
- Real-time updates: Get instant notifications about important events and milestones
- Seamless sync: Everything stays synchronized between your mobile app and desktop experience

🚀 Get Started Today: Download the app now and start managing your music career on the go. It''s free, easy to use, and available for both iOS and Android devices. Your mobile music management solution is ready when you are!

Download App: {{app_download_url}}

Music wherever you are: The music industry doesn''t stop when you leave your desk, and neither should your ability to manage your career. With the MSC & Co mobile app, you have the tools you need at your fingertips, wherever your music takes you.

Best regards,
The MSC & Co Team'
WHERE name = 'Product - Mobile App Launch';

-- 10. Product - Beta Feature Invite
UPDATE marketing_email_templates
SET 
  subject_template = '🧪 Beta Feature – Be The First To Try',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🧪 Beta Feature</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">You''ve been selected for exclusive beta access to <strong>{{beta_feature_name}}</strong>! {{beta_details}}. As a valued member of our community, we''re offering you the opportunity to try this exciting new feature before it''s released to everyone. This is your chance to get hands-on experience with cutting-edge functionality, provide early feedback that shapes the final product, and help us make this feature the best it can be. Your input is invaluable, and we''re excited to hear what you think.</p>
    
    <div style="background: #fff7ed; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f59e0b;">
      <h2 style="color: #92400e; margin-top: 0; font-size: 20px; font-weight: 600;">What to Expect</h2>
      <p style="color: #78350f; margin-bottom: 16px; line-height: 1.7;">As a beta tester, you''ll get:</p>
      <ul style="margin: 0; padding-left: 25px; color: #78350f; line-height: 1.8;">
        <li style="margin-bottom: 8px;"><strong>Early access:</strong> Be among the first to experience and use this new feature</li>
        <li style="margin-bottom: 8px;"><strong>Direct influence:</strong> Your feedback directly shapes how the feature evolves and improves</li>
        <li style="margin-bottom: 8px;"><strong>Priority support:</strong> Dedicated assistance as you explore and test the new functionality</li>
        <li style="margin-bottom: 8px;"><strong>Exclusive updates:</strong> Regular communication about improvements and changes based on feedback</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>🎯 Your Feedback Matters:</strong> This is a beta version, which means we''re actively refining and improving it. Your experience, suggestions, and honest feedback are crucial to making this feature truly exceptional. We''re listening, and we want to hear from you!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{beta_url}}" style="background: #f5af19; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Join Beta</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f5af19;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Thank you for being part of our community:</strong> We''re grateful for your continued trust and engagement. Your willingness to test new features and share your insights makes MSC & Co better for everyone. This beta program is our way of saying thank you and involving you in our innovation process.</p>
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
  body_text_template = '🧪 Beta Feature – Be The First To Try

Hi {{user_name}},

You''ve been selected for exclusive beta access to {{beta_feature_name}}! {{beta_details}}. As a valued member of our community, we''re offering you the opportunity to try this exciting new feature before it''s released to everyone. This is your chance to get hands-on experience with cutting-edge functionality, provide early feedback that shapes the final product, and help us make this feature the best it can be. Your input is invaluable, and we''re excited to hear what you think.

What to Expect

As a beta tester, you''ll get:
- Early access: Be among the first to experience and use this new feature
- Direct influence: Your feedback directly shapes how the feature evolves and improves
- Priority support: Dedicated assistance as you explore and test the new functionality
- Exclusive updates: Regular communication about improvements and changes based on feedback

🎯 Your Feedback Matters: This is a beta version, which means we''re actively refining and improving it. Your experience, suggestions, and honest feedback are crucial to making this feature truly exceptional. We''re listening, and we want to hear from you!

Join Beta: {{beta_url}}

Thank you for being part of our community: We''re grateful for your continued trust and engagement. Your willingness to test new features and share your insights makes MSC & Co better for everyone. This beta program is our way of saying thank you and involving you in our innovation process.

Best regards,
The MSC & Co Team'
WHERE name = 'Product - Beta Feature Invite';

-- ===========================================
-- UPDATE COMPLETE
-- ===========================================
-- Updated 10 admin/product templates with enhanced content:
-- 1. Product - Major Update
-- 2. Product - New Feature Launch
-- 3. Product - Partnership Announcement
-- 4. Product - Service Update
-- 5. Product - Maintenance Notification
-- 6. Product - Platform Milestone
-- 7. Product - API Update
-- 8. Product - Integration Launch
-- 9. Product - Mobile App Launch
-- 10. Product - Beta Feature Invite
-- ===========================================

