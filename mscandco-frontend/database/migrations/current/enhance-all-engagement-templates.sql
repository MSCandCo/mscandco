-- ===========================================
-- ENHANCE ALL ENGAGEMENT TEMPLATES
-- More elaborate, relational, and professional content
-- ===========================================
-- Date: 2025-01-28
-- Purpose: Update all engagement templates with enhanced content and consistent styling
-- Total Templates Updated: 9
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

-- 1. Engagement - Quarterly Report
UPDATE marketing_email_templates
SET 
  subject_template = 'Your Q{{quarter}} {{year}} Performance Report – See How Far You''ve Come',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">📊 Your Q{{quarter}} {{year}} Performance Report</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">As we close out Q{{quarter}} of {{year}}, we wanted to share your performance summary with you. Your journey this quarter has been impressive, and we''re excited to show you what you''ve accomplished: <strong>{{quarter_stats}}</strong>. This report reflects the dedication and effort you''ve put into your music career.</p>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">What This Report Shows</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">Your quarterly report provides insights into:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Overall performance metrics and key achievements</li>
        <li style="margin-bottom: 8px;">Growth trends and progress over the quarter</li>
        <li style="margin-bottom: 8px;">Areas where you''ve excelled and opportunities for growth</li>
        <li style="margin-bottom: 8px;">Comparative data to help you understand your trajectory</li>
        <li style="margin-bottom: 8px;">Actionable insights to guide your next quarter''s strategy</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7;"><strong>💡 Use This Data Strategically:</strong> Quarterly reports are powerful tools for reflection and planning. Take time to review your numbers, celebrate your wins, and identify patterns that can inform your strategy for the coming quarter. Every data point tells a story about your growth and impact.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{dashboard_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">View Full Performance Report</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>Keep the momentum going:</strong> Use the insights from this report to refine your approach, double down on what''s working, and adjust where needed. Your next quarter is an opportunity to build on this foundation and achieve even greater results.</p>
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
  body_text_template = 'Your Q{{quarter}} {{year}} Performance Report – See How Far You''ve Come

Hi {{user_name}},

As we close out Q{{quarter}} of {{year}}, we wanted to share your performance summary with you. Your journey this quarter has been impressive, and we''re excited to show you what you''ve accomplished: {{quarter_stats}}. This report reflects the dedication and effort you''ve put into your music career.

What This Report Shows

Your quarterly report provides insights into:
- Overall performance metrics and key achievements
- Growth trends and progress over the quarter
- Areas where you''ve excelled and opportunities for growth
- Comparative data to help you understand your trajectory
- Actionable insights to guide your next quarter''s strategy

💡 Use This Data Strategically: Quarterly reports are powerful tools for reflection and planning. Take time to review your numbers, celebrate your wins, and identify patterns that can inform your strategy for the coming quarter. Every data point tells a story about your growth and impact.

View Full Performance Report: {{dashboard_url}}

Keep the momentum going: Use the insights from this report to refine your approach, double down on what''s working, and adjust where needed. Your next quarter is an opportunity to build on this foundation and achieve even greater results.

Best regards,
The MSC & Co Team'
WHERE name = 'Engagement - Quarterly Report';

-- 2. Engagement - Anniversary
UPDATE marketing_email_templates
SET 
  subject_template = '🎉 Celebrating {{years}} Years Together – Thank You for Being Part of Our Community',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🎉 {{years}}-Year Anniversary with MSC & Co</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Today marks a special milestone – it''s been <strong>{{years}} years</strong> since you joined the MSC & Co community! We''re incredibly grateful to have you with us on this journey. Your loyalty, trust, and continued partnership mean the world to us, and we wanted to celebrate this milestone with you.</p>
    
    <div style="background: #fff7ed; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f59e0b;">
      <h2 style="color: #92400e; margin-top: 0; font-size: 20px; font-weight: 600;">Your Anniversary Gift</h2>
      <p style="color: #78350f; margin-bottom: 16px; line-height: 1.7;">As a token of our appreciation, we''re delighted to offer you: <strong>{{anniversary_gift}}</strong></p>
      <p style="color: #78350f; margin: 0; line-height: 1.7;">This gift is our way of saying thank you for being such an integral part of our community and for the trust you''ve placed in us over the past {{years}} years.</p>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7;"><strong>🌟 A Partnership That Matters:</strong> Over these {{years}} years, we''ve grown together, learned from each other, and built something meaningful. Your success stories, feedback, and engagement have helped shape MSC & Co into what it is today. We''re honored to be part of your music journey.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{dashboard_url}}" style="background: #f093fb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Claim Your Anniversary Gift</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f093fb;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>Here''s to many more years:</strong> We''re committed to continuing to support your growth, provide value, and be a trusted partner in your music career. Thank you for choosing MSC & Co, and here''s to celebrating many more milestones together!</p>
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
  body_text_template = '🎉 Celebrating {{years}} Years Together – Thank You for Being Part of Our Community

Hi {{user_name}},

Today marks a special milestone – it''s been {{years}} years since you joined the MSC & Co community! We''re incredibly grateful to have you with us on this journey. Your loyalty, trust, and continued partnership mean the world to us, and we wanted to celebrate this milestone with you.

Your Anniversary Gift

As a token of our appreciation, we''re delighted to offer you: {{anniversary_gift}}

This gift is our way of saying thank you for being such an integral part of our community and for the trust you''ve placed in us over the past {{years}} years.

🌟 A Partnership That Matters: Over these {{years}} years, we''ve grown together, learned from each other, and built something meaningful. Your success stories, feedback, and engagement have helped shape MSC & Co into what it is today. We''re honored to be part of your music journey.

Claim Your Anniversary Gift: {{dashboard_url}}

Here''s to many more years: We''re committed to continuing to support your growth, provide value, and be a trusted partner in your music career. Thank you for choosing MSC & Co, and here''s to celebrating many more milestones together!

Best regards,
The MSC & Co Team'
WHERE name = 'Engagement - Anniversary';

-- 3. Engagement - Feature Recommendation
UPDATE marketing_email_templates
SET 
  subject_template = '💡 A Feature We Think You''ll Love – Personalized Recommendation for You',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">💡 Feature Recommendation Just for You</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">We''ve been paying attention to how you use MSC & Co, and based on your activity and goals, we think you''ll love <strong>{{feature_name}}</strong>. This feature is designed to help you: <strong>{{feature_description}}</strong>. We believe it could make a real difference in how you work and achieve your objectives.</p>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">Why We''re Recommending This</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">This feature could benefit you because it:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Aligns with your current workflow and usage patterns</li>
        <li style="margin-bottom: 8px;">Addresses challenges you may be facing or goals you''re working toward</li>
        <li style="margin-bottom: 8px;">Has proven valuable for users with similar needs and objectives</li>
        <li style="margin-bottom: 8px;">Can help streamline your processes and save you time</li>
        <li style="margin-bottom: 8px;">Offers new capabilities that complement what you''re already doing</li>
      </ul>
    </div>
    
    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #92400e; line-height: 1.7;"><strong>🎯 Try It Risk-Free:</strong> We''ve made it easy to explore this feature and see how it works for you. Give it a try, and if it doesn''t fit your needs, no worries – but we think you''ll find it valuable and wonder how you managed without it.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{feature_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Explore This Feature</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>We''re here to help:</strong> If you have questions about this feature or want to learn more about how it can support your specific goals, don''t hesitate to reach out. Our team is here to help you get the most value from everything MSC & Co has to offer.</p>
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
  body_text_template = '💡 A Feature We Think You''ll Love – Personalized Recommendation for You

Hi {{user_name}},

We''ve been paying attention to how you use MSC & Co, and based on your activity and goals, we think you''ll love {{feature_name}}. This feature is designed to help you: {{feature_description}}. We believe it could make a real difference in how you work and achieve your objectives.

Why We''re Recommending This

This feature could benefit you because it:
- Aligns with your current workflow and usage patterns
- Addresses challenges you may be facing or goals you''re working toward
- Has proven valuable for users with similar needs and objectives
- Can help streamline your processes and save you time
- Offers new capabilities that complement what you''re already doing

🎯 Try It Risk-Free: We''ve made it easy to explore this feature and see how it works for you. Give it a try, and if it doesn''t fit your needs, no worries – but we think you''ll find it valuable and wonder how you managed without it.

Explore This Feature: {{feature_url}}

We''re here to help: If you have questions about this feature or want to learn more about how it can support your specific goals, don''t hesitate to reach out. Our team is here to help you get the most value from everything MSC & Co has to offer.

Best regards,
The MSC & Co Team'
WHERE name = 'Engagement - Feature Recommendation';

-- 4. Engagement - Success Story
UPDATE marketing_email_templates
SET 
  subject_template = '🌟 Your Success Story is Featured – Congratulations!',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🌟 Your Success Story is Featured</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">We have some exciting news! Your incredible success story has been featured: <strong>{{story_title}}</strong>. Your journey, achievements, and the impact you''ve made deserve to be celebrated and shared with our community. We''re thrilled to highlight your accomplishments and the inspiring work you''ve done.</p>
    
    <div style="background: #fff7ed; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f59e0b;">
      <h2 style="color: #92400e; margin-top: 0; font-size: 20px; font-weight: 600;">What This Means</h2>
      <p style="color: #78350f; margin-bottom: 16px; line-height: 1.7;">Having your story featured means:</p>
      <ul style="margin: 0; padding-left: 25px; color: #78350f; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Your achievements are being recognized and celebrated</li>
        <li style="margin-bottom: 8px;">Your story can inspire others in our community</li>
        <li style="margin-bottom: 8px;">You''re serving as an example of what''s possible</li>
        <li style="margin-bottom: 8px;">Your success is being shared with a wider audience</li>
        <li style="margin-bottom: 8px;">You''re part of a community that values and highlights excellence</li>
      </ul>
    </div>
    
    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #92400e; line-height: 1.7;"><strong>🎉 Share Your Success:</strong> We encourage you to share this featured story with your network, fans, and community. Your achievements deserve recognition, and sharing your story can inspire others while also celebrating the hard work and dedication that got you here.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{story_url}}" style="background: #f5af19; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Read Your Featured Story</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f5af19;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>Thank you for being an inspiration:</strong> Your success story reminds us all of what''s possible with dedication, creativity, and the right support. Thank you for being part of our community and for the positive impact you continue to make. We''re honored to feature your story and look forward to celebrating many more milestones with you.</p>
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
  body_text_template = '🌟 Your Success Story is Featured – Congratulations!

Hi {{user_name}},

We have some exciting news! Your incredible success story has been featured: {{story_title}}. Your journey, achievements, and the impact you''ve made deserve to be celebrated and shared with our community. We''re thrilled to highlight your accomplishments and the inspiring work you''ve done.

What This Means

Having your story featured means:
- Your achievements are being recognized and celebrated
- Your story can inspire others in our community
- You''re serving as an example of what''s possible
- Your success is being shared with a wider audience
- You''re part of a community that values and highlights excellence

🎉 Share Your Success: We encourage you to share this featured story with your network, fans, and community. Your achievements deserve recognition, and sharing your story can inspire others while also celebrating the hard work and dedication that got you here.

Read Your Featured Story: {{story_url}}

Thank you for being an inspiration: Your success story reminds us all of what''s possible with dedication, creativity, and the right support. Thank you for being part of our community and for the positive impact you continue to make. We''re honored to feature your story and look forward to celebrating many more milestones with you.

Best regards,
The MSC & Co Team'
WHERE name = 'Engagement - Success Story';

-- 5. Engagement - Community Spotlight
UPDATE marketing_email_templates
SET 
  subject_template = '👥 You''re in the Community Spotlight – Congratulations!',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">👥 Community Spotlight – You''re Featured</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Congratulations! You''ve been selected for our Community Spotlight, and we''re thrilled to feature you. This recognition reflects your valuable contributions to our community, your engagement, and the positive impact you make. We believe that highlighting members like you strengthens our entire community and inspires others to actively participate and share their talents.</p>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">Why You''re Being Featured</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">You''re in the spotlight because you:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Contribute positively to our community culture and discussions</li>
        <li style="margin-bottom: 8px;">Demonstrate excellence in your work and engagement</li>
        <li style="margin-bottom: 8px;">Support and inspire fellow community members</li>
        <li style="margin-bottom: 8px;">Exemplify the values we hold dear as a community</li>
        <li style="margin-bottom: 8px;">Make meaningful contributions that benefit everyone</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7;"><strong>🌟 Celebrate This Moment:</strong> Being featured in the Community Spotlight is a recognition of your impact and contributions. Take a moment to appreciate this achievement, and feel free to share this spotlight with your network. Your story and presence matter, and we''re proud to highlight them.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{spotlight_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">View Your Spotlight Feature</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>Thank you for being part of our community:</strong> Your active participation, positive engagement, and valuable contributions make our community stronger. We''re grateful to have you as part of MSC & Co and excited to continue this journey together. Keep shining!</p>
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
  body_text_template = '👥 You''re in the Community Spotlight – Congratulations!

Hi {{user_name}},

Congratulations! You''ve been selected for our Community Spotlight, and we''re thrilled to feature you. This recognition reflects your valuable contributions to our community, your engagement, and the positive impact you make. We believe that highlighting members like you strengthens our entire community and inspires others to actively participate and share their talents.

Why You''re Being Featured

You''re in the spotlight because you:
- Contribute positively to our community culture and discussions
- Demonstrate excellence in your work and engagement
- Support and inspire fellow community members
- Exemplify the values we hold dear as a community
- Make meaningful contributions that benefit everyone

🌟 Celebrate This Moment: Being featured in the Community Spotlight is a recognition of your impact and contributions. Take a moment to appreciate this achievement, and feel free to share this spotlight with your network. Your story and presence matter, and we''re proud to highlight them.

View Your Spotlight Feature: {{spotlight_url}}

Thank you for being part of our community: Your active participation, positive engagement, and valuable contributions make our community stronger. We''re grateful to have you as part of MSC & Co and excited to continue this journey together. Keep shining!

Best regards,
The MSC & Co Team'
WHERE name = 'Engagement - Community Spotlight';

-- 6. Engagement - Release Reminder
UPDATE marketing_email_templates
SET 
  subject_template = '🎵 Release Reminder – {{release_title}} Drops {{release_date}}',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🎵 Release Reminder</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Friendly reminder: Your new release <strong>{{release_title}}</strong> is scheduled to drop on <strong>{{release_date}}</strong>! We wanted to make sure you have everything ready and are prepared for launch day. This is an exciting moment, and we''re here to help ensure everything goes smoothly.</p>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">Pre-Release Checklist</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">Before your release goes live, make sure you''ve:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Reviewed all release details and metadata for accuracy</li>
        <li style="margin-bottom: 8px;">Prepared your marketing and promotional materials</li>
        <li style="margin-bottom: 8px;">Notified your fans and network about the upcoming release</li>
        <li style="margin-bottom: 8px;">Set up any pre-save or pre-order options if applicable</li>
        <li style="margin-bottom: 8px;">Double-checked distribution settings and territories</li>
      </ul>
    </div>
    
    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #92400e; line-height: 1.7;"><strong>⏰ Almost There:</strong> Release day is approaching, and this is the perfect time to review everything one final time and make any last-minute adjustments. You''ve put in the work, and now it''s time to share your music with the world!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{release_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Review Release Details</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>We''re here to support you:</strong> If you need to make any changes, have questions about your release, or want guidance on launch day strategies, our team is here to help. Don''t hesitate to reach out if you need anything before or after your release goes live.</p>
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
  body_text_template = '🎵 Release Reminder – {{release_title}} Drops {{release_date}}

Hi {{user_name}},

Friendly reminder: Your new release {{release_title}} is scheduled to drop on {{release_date}}! We wanted to make sure you have everything ready and are prepared for launch day. This is an exciting moment, and we''re here to help ensure everything goes smoothly.

Pre-Release Checklist

Before your release goes live, make sure you''ve:
- Reviewed all release details and metadata for accuracy
- Prepared your marketing and promotional materials
- Notified your fans and network about the upcoming release
- Set up any pre-save or pre-order options if applicable
- Double-checked distribution settings and territories

⏰ Almost There: Release day is approaching, and this is the perfect time to review everything one final time and make any last-minute adjustments. You''ve put in the work, and now it''s time to share your music with the world!

Review Release Details: {{release_url}}

We''re here to support you: If you need to make any changes, have questions about your release, or want guidance on launch day strategies, our team is here to help. Don''t hesitate to reach out if you need anything before or after your release goes live.

Best regards,
The MSC & Co Team'
WHERE name = 'Engagement - Release Reminder';

-- 7. Engagement - Collaboration Invite
UPDATE marketing_email_templates
SET 
  subject_template = '🤝 Collaboration Opportunity – {{artist_name}} Wants to Work With You',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🤝 Collaboration Opportunity</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Exciting news! <strong>{{artist_name}}</strong> has expressed interest in collaborating with you. They''ve shared the following details about this opportunity: <strong>{{collab_details}}</strong>. This could be a wonderful chance to create something new together, expand your network, and reach new audiences through partnership.</p>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">Why Collaborations Matter</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">Collaborative projects offer:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Opportunities to create unique and innovative content</li>
        <li style="margin-bottom: 8px;">Access to each other''s audiences and fanbases</li>
        <li style="margin-bottom: 8px;">Creative growth through shared ideas and perspectives</li>
        <li style="margin-bottom: 8px;">Networking and relationship-building in the industry</li>
        <li style="margin-bottom: 8px;">Mutual support and shared success</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7;"><strong>💡 Consider the Opportunity:</strong> Take time to review the collaboration details, consider how it aligns with your goals and creative vision, and think about how this partnership could benefit both parties. If it feels like a good fit, it could lead to something truly special.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{collab_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">View Collaboration Details</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>Next steps:</strong> If you''re interested in exploring this collaboration further, you can review all the details, connect with {{artist_name}}, and discuss the project to see if it''s a good match. Even if this particular opportunity isn''t the right fit right now, we''re glad you''re being considered for collaborations – it''s a sign of your growing reputation and influence.</p>
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
  body_text_template = '🤝 Collaboration Opportunity – {{artist_name}} Wants to Work With You

Hi {{user_name}},

Exciting news! {{artist_name}} has expressed interest in collaborating with you. They''ve shared the following details about this opportunity: {{collab_details}}. This could be a wonderful chance to create something new together, expand your network, and reach new audiences through partnership.

Why Collaborations Matter

Collaborative projects offer:
- Opportunities to create unique and innovative content
- Access to each other''s audiences and fanbases
- Creative growth through shared ideas and perspectives
- Networking and relationship-building in the industry
- Mutual support and shared success

💡 Consider the Opportunity: Take time to review the collaboration details, consider how it aligns with your goals and creative vision, and think about how this partnership could benefit both parties. If it feels like a good fit, it could lead to something truly special.

View Collaboration Details: {{collab_url}}

Next steps: If you''re interested in exploring this collaboration further, you can review all the details, connect with {{artist_name}}, and discuss the project to see if it''s a good match. Even if this particular opportunity isn''t the right fit right now, we''re glad you''re being considered for collaborations – it''s a sign of your growing reputation and influence.

Best regards,
The MSC & Co Team'
WHERE name = 'Engagement - Collaboration Invite';

-- 8. Engagement - Playlist Submission Success
UPDATE marketing_email_templates
SET 
  subject_template = '✅ Success! {{release_title}} Added to {{playlist_name}}',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">✅ Playlist Success</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Great news! Your track <strong>{{release_title}}</strong> has been successfully added to <strong>{{playlist_name}}</strong>! This is an exciting milestone that could significantly boost your visibility and streams. Getting featured on playlists is one of the most effective ways to reach new listeners and grow your audience.</p>
    
    <div style="background: #f0fdf4; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #10b981;">
      <h2 style="color: #065f46; margin-top: 0; font-size: 20px; font-weight: 600;">What This Means for You</h2>
      <p style="color: #047857; margin-bottom: 16px; line-height: 1.7;">Being featured on this playlist can lead to:</p>
      <ul style="margin: 0; padding-left: 25px; color: #047857; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Increased streams and discovery from new listeners</li>
        <li style="margin-bottom: 8px;">Greater visibility within your genre or niche</li>
        <li style="margin-bottom: 8px;">Potential for algorithmic playlists and recommendations</li>
        <li style="margin-bottom: 8px;">Exposure to audiences who actively curate and follow playlists</li>
        <li style="margin-bottom: 8px;">Momentum that can compound into more opportunities</li>
      </ul>
    </div>
    
    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #92400e; line-height: 1.7;"><strong>🎉 Share the Good News:</strong> Don''t forget to share this playlist feature with your fans and network! Let your audience know where they can find your music, and encourage them to follow the playlist and stream your track. This helps boost engagement and can lead to even more visibility.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{playlist_url}}" style="background: #2ecc71; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">View Playlist</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #2ecc71;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>Keep the momentum going:</strong> This playlist feature is a great achievement, and it can be a stepping stone to even more opportunities. Continue creating great music, engaging with your audience, and submitting to other playlists. Each success builds on the last, creating a compounding effect for your career.</p>
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
  body_text_template = '✅ Success! {{release_title}} Added to {{playlist_name}}

Hi {{user_name}},

Great news! Your track {{release_title}} has been successfully added to {{playlist_name}}! This is an exciting milestone that could significantly boost your visibility and streams. Getting featured on playlists is one of the most effective ways to reach new listeners and grow your audience.

What This Means for You

Being featured on this playlist can lead to:
- Increased streams and discovery from new listeners
- Greater visibility within your genre or niche
- Potential for algorithmic playlists and recommendations
- Exposure to audiences who actively curate and follow playlists
- Momentum that can compound into more opportunities

🎉 Share the Good News: Don''t forget to share this playlist feature with your fans and network! Let your audience know where they can find your music, and encourage them to follow the playlist and stream your track. This helps boost engagement and can lead to even more visibility.

View Playlist: {{playlist_url}}

Keep the momentum going: This playlist feature is a great achievement, and it can be a stepping stone to even more opportunities. Continue creating great music, engaging with your audience, and submitting to other playlists. Each success builds on the last, creating a compounding effect for your career.

Best regards,
The MSC & Co Team'
WHERE name = 'Engagement - Playlist Submission Success';

-- 9. Engagement - Trend Alert
UPDATE marketing_email_templates
SET 
  subject_template = '📈 Trend Alert – Don''t Miss This Opportunity',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">📈 Trending Alert</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">There''s a trending opportunity we wanted to bring to your attention: <strong>{{trend_description}}</strong>. This is happening right now, and we believe it could be highly relevant to your work and goals. Early action on trending opportunities often leads to the best results, so we wanted to make sure you''re aware of this while it''s still gaining momentum.</p>
    
    <div style="background: #fef2f2; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f5576c;">
      <h2 style="color: #991b1b; margin-top: 0; font-size: 20px; font-weight: 600;">Why This Trend Matters</h2>
      <p style="color: #7f1d1d; margin-bottom: 16px; line-height: 1.7;">This trending opportunity could benefit you because:</p>
      <ul style="margin: 0; padding-left: 25px; color: #7f1d1d; line-height: 1.8;">
        <li style="margin-bottom: 8px;">It aligns with current market dynamics and audience interests</li>
        <li style="margin-bottom: 8px;">Early movers often capture the most value from trends</li>
        <li style="margin-bottom: 8px;">It presents a timely opportunity to engage with current conversations</li>
        <li style="margin-bottom: 8px;">Trending topics can drive increased visibility and engagement</li>
        <li style="margin-bottom: 8px;">It could open doors to new audiences and opportunities</li>
      </ul>
    </div>
    
    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #92400e; line-height: 1.7;"><strong>⏰ Act While It''s Hot:</strong> Trends move fast, and the window of opportunity can be narrow. If this aligns with your strategy and goals, consider exploring it now while momentum is building. The timing could make a significant difference in your results.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{trend_url}}" style="background: #f5576c; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Explore Trending Opportunity</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f5576c;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>Evaluate and decide:</strong> Take time to review this trend, consider how it fits with your current projects and goals, and decide if it makes sense to engage with it. Not every trend will be right for everyone, but we wanted to make sure you''re aware of this opportunity so you can make an informed decision.</p>
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
  body_text_template = '📈 Trend Alert – Don''t Miss This Opportunity

Hi {{user_name}},

There''s a trending opportunity we wanted to bring to your attention: {{trend_description}}. This is happening right now, and we believe it could be highly relevant to your work and goals. Early action on trending opportunities often leads to the best results, so we wanted to make sure you''re aware of this while it''s still gaining momentum.

Why This Trend Matters

This trending opportunity could benefit you because:
- It aligns with current market dynamics and audience interests
- Early movers often capture the most value from trends
- It presents a timely opportunity to engage with current conversations
- Trending topics can drive increased visibility and engagement
- It could open doors to new audiences and opportunities

⏰ Act While It''s Hot: Trends move fast, and the window of opportunity can be narrow. If this aligns with your strategy and goals, consider exploring it now while momentum is building. The timing could make a significant difference in your results.

Explore Trending Opportunity: {{trend_url}}

Evaluate and decide: Take time to review this trend, consider how it fits with your current projects and goals, and decide if it makes sense to engage with it. Not every trend will be right for everyone, but we wanted to make sure you''re aware of this opportunity so you can make an informed decision.

Best regards,
The MSC & Co Team'
WHERE name = 'Engagement - Trend Alert';

-- ===========================================
-- UPDATE COMPLETE
-- ===========================================
-- Updated 9 engagement templates with enhanced content:
-- 1. Engagement - Quarterly Report
-- 2. Engagement - Anniversary
-- 3. Engagement - Feature Recommendation
-- 4. Engagement - Success Story
-- 5. Engagement - Community Spotlight
-- 6. Engagement - Release Reminder
-- 7. Engagement - Collaboration Invite
-- 8. Engagement - Playlist Submission Success
-- 9. Engagement - Trend Alert
-- ===========================================


