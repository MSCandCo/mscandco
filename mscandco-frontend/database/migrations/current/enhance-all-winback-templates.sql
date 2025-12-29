-- ===========================================
-- ENHANCE ALL WIN-BACK TEMPLATES
-- More elaborate, relational, and professional content
-- ===========================================
-- Date: 2025-01-28
-- Purpose: Update all win-back templates with enhanced content and consistent styling
-- Total Templates Updated: 2
-- ===========================================
-- 
-- STYLING APPLIED:
-- - Header h1: 22px font-size, 24px padding, line-height: 1.3
-- - Body text: 14px font-size
-- - Signature: 14px font-size, #4a5568 color
-- - Buttons: 14px font-size
-- - Footer: 60px logo, "Empowering Every Artist. Protecting Our Planet." slogan (warmer for personal communications)
-- - No logo in header
-- ===========================================

-- 1. Win-Back - Inactive User
UPDATE marketing_email_templates
SET 
  subject_template = 'We Miss You, {{user_name}} – Exciting Updates Are Waiting',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🎵 We Miss You</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">It''s been a while since we''ve seen you on MSC & Co, and we wanted to reach out to let you know that we miss having you as part of our community. We''ve been busy making improvements and adding exciting new features that we think you''ll love. Your account is still here, waiting for you, and we''d be thrilled to have you back.</p>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">🎯 What You''ve Been Missing</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">Since you''ve been away, we''ve added some exciting new features and improvements:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;">{{new_feature_1}}</li>
        <li style="margin-bottom: 8px;">{{new_feature_2}}</li>
        <li style="margin-bottom: 8px;">{{new_feature_3}}</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7;"><strong>💡 We''re Here for You:</strong> We understand that life gets busy, priorities shift, and sometimes you need to step away. But we want you to know that we''re still here, ready to support you whenever you''re ready to dive back in. Your journey matters to us, and we''re committed to helping you succeed.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{dashboard_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Return to Dashboard</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>No pressure, just an invitation:</strong> We''re not here to hassle you or make you feel guilty – we genuinely miss you and want you to know that your place in our community is still here. If now isn''t the right time, that''s completely okay. But when you''re ready, we''ll be here with open arms and exciting new tools to help you on your music journey.</p>
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
    <p style="margin: 0 0 10px 0; font-weight: 500; color: #718096;">Empowering Every Artist. Protecting Our Planet.</p>
    <p style="margin: 0;">
      <a href="{{unsubscribe_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Unsubscribe</a> | 
      <a href="{{preferences_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Email Preferences</a> | 
      <a href="{{support_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Support</a>
    </p>
  </div>
</body>
</html>',
  body_text_template = 'We Miss You, {{user_name}} – Exciting Updates Are Waiting

Hi {{user_name}},

It''s been a while since we''ve seen you on MSC & Co, and we wanted to reach out to let you know that we miss having you as part of our community. We''ve been busy making improvements and adding exciting new features that we think you''ll love. Your account is still here, waiting for you, and we''d be thrilled to have you back.

🎯 What You''ve Been Missing

Since you''ve been away, we''ve added some exciting new features and improvements:
- {{new_feature_1}}
- {{new_feature_2}}
- {{new_feature_3}}

💡 We''re Here for You: We understand that life gets busy, priorities shift, and sometimes you need to step away. But we want you to know that we''re still here, ready to support you whenever you''re ready to dive back in. Your journey matters to us, and we''re committed to helping you succeed.

Return to Dashboard: {{dashboard_url}}

No pressure, just an invitation: We''re not here to hassle you or make you feel guilty – we genuinely miss you and want you to know that your place in our community is still here. If now isn''t the right time, that''s completely okay. But when you''re ready, we''ll be here with open arms and exciting new tools to help you on your music journey.

Best regards,
The MSC & Co Team'
WHERE name = 'Win-Back - Inactive User';

-- 2. Win-Back - 90 Day Inactive
UPDATE marketing_email_templates
SET 
  subject_template = 'We Really Miss You – It''s Been 90 Days and We''ve Transformed',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🎵 We Really Miss You</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">It''s been 90 days since we''ve seen you, and we wanted to reach out because we genuinely miss having you as part of our community. A lot has happened in those 90 days – we''ve transformed the platform, added powerful new features, and made improvements based on feedback from artists like you. The MSC & Co you knew is still here, but it''s better, stronger, and more focused on helping you succeed.</p>
    
    <div style="background: #fef2f2; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f5576c;">
      <h2 style="color: #991b1b; margin-top: 0; font-size: 20px; font-weight: 600;">🚀 What''s Changed in 90 Days</h2>
      <p style="color: #7f1d1d; margin-bottom: 16px; line-height: 1.7;">During the time you''ve been away, we''ve made significant improvements:</p>
      <ul style="margin: 0; padding-left: 25px; color: #7f1d1d; line-height: 1.8;">
        <li style="margin-bottom: 8px;">{{new_features}}</li>
      </ul>
      <p style="color: #7f1d1d; margin-top: 16px; margin-bottom: 0; line-height: 1.7;">We''ve listened to feedback, implemented requested features, and worked hard to create an even better experience for you.</p>
    </div>
    
    <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #92400e; line-height: 1.7;"><strong>💫 Your Account is Waiting:</strong> Everything you''ve built, all your work, and your place in our community – it''s all still here, exactly as you left it. We''ve been holding your spot because we believe in your journey and want to support you when you''re ready to continue. There''s no catch, no pressure – just an invitation to come back and see what we''ve built together.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{dashboard_url}}" style="background: #f5576c; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Come Back Now</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f5576c;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>We understand life happens:</strong> 90 days is a long time, and we know that priorities change, circumstances shift, and sometimes you need to focus on other things. That''s completely understandable. But we want you to know that when you''re ready – whether that''s today, next month, or next year – we''ll be here, ready to pick up where we left off and help you take the next step in your music journey.</p>
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
    <p style="margin: 0 0 10px 0; font-weight: 500; color: #718096;">Empowering Every Artist. Protecting Our Planet.</p>
    <p style="margin: 0;">
      <a href="{{unsubscribe_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Unsubscribe</a> | 
      <a href="{{preferences_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Email Preferences</a> | 
      <a href="{{support_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Support</a>
    </p>
  </div>
</body>
</html>',
  body_text_template = 'We Really Miss You – It''s Been 90 Days and We''ve Transformed

Hi {{user_name}},

It''s been 90 days since we''ve seen you, and we wanted to reach out because we genuinely miss having you as part of our community. A lot has happened in those 90 days – we''ve transformed the platform, added powerful new features, and made improvements based on feedback from artists like you. The MSC & Co you knew is still here, but it''s better, stronger, and more focused on helping you succeed.

🚀 What''s Changed in 90 Days

During the time you''ve been away, we''ve made significant improvements:
- {{new_features}}

We''ve listened to feedback, implemented requested features, and worked hard to create an even better experience for you.

💫 Your Account is Waiting: Everything you''ve built, all your work, and your place in our community – it''s all still here, exactly as you left it. We''ve been holding your spot because we believe in your journey and want to support you when you''re ready to continue. There''s no catch, no pressure – just an invitation to come back and see what we''ve built together.

Come Back Now: {{dashboard_url}}

We understand life happens: 90 days is a long time, and we know that priorities change, circumstances shift, and sometimes you need to focus on other things. That''s completely understandable. But we want you to know that when you''re ready – whether that''s today, next month, or next year – we''ll be here, ready to pick up where we left off and help you take the next step in your music journey.

Best regards,
The MSC & Co Team'
WHERE name = 'Win-Back - 90 Day Inactive';

-- ===========================================
-- UPDATE COMPLETE
-- ===========================================
-- Updated 2 win-back templates with enhanced content:
-- 1. Win-Back - Inactive User
-- 2. Win-Back - 90 Day Inactive
-- ===========================================

