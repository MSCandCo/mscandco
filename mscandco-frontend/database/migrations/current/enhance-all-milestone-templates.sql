-- ===========================================
-- ENHANCE ALL MILESTONE TEMPLATES
-- More elaborate, relational, and professional content
-- ===========================================
-- Date: 2025-01-28
-- Purpose: Update all milestone templates with enhanced content and consistent styling
-- Total Templates Updated: 11
-- ===========================================
-- 
-- STYLING APPLIED:
-- - Header h1: 22px font-size, 24px padding, line-height: 1.3
-- - Body text: 14px font-size
-- - Signature: 14px font-size, #4a5568 color
-- - Buttons: 14px font-size
-- - Footer: 60px logo, "Empowering Every Artist. Protecting Our Planet." slogan (warmer for personal celebrations)
-- - No logo in header
-- ===========================================

-- 1. Milestone - 1000 Streams
UPDATE marketing_email_templates
SET 
  subject_template = '🎉 Congratulations! You''ve Reached 1,000 Streams on {{release_title}}',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🎉 1,000 Streams Milestone</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Congratulations, {{user_name}}!</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">You''ve just achieved an incredible milestone – <strong>{{release_title}}</strong> has reached <strong>1,000 streams</strong>! This is a moment worth celebrating. Every stream represents someone discovering your music, connecting with your art, and becoming part of your journey. This milestone marks the beginning of something special.</p>
    
    <div style="background: #f0fdf4; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #10b981; text-align: center;">
      <p style="font-size: 48px; margin: 0; font-weight: bold; color: #065f46; line-height: 1;">1,000</p>
      <p style="font-size: 18px; margin: 10px 0 0 0; color: #047857; font-weight: 600;">Streams and Growing</p>
    </div>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">What This Achievement Means</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">Reaching 1,000 streams is significant because:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;">You''ve built an initial audience that''s actively engaging with your music</li>
        <li style="margin-bottom: 8px;">Your tracks are being discovered and shared by listeners</li>
        <li style="margin-bottom: 8px;">You''re establishing a foundation for continued growth</li>
        <li style="margin-bottom: 8px;">This momentum can compound into even greater opportunities</li>
        <li style="margin-bottom: 8px;">You''re proving that your music resonates with people</li>
      </ul>
    </div>
    
    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #92400e; line-height: 1.7;"><strong>🚀 Keep the Momentum Going:</strong> This is just the beginning! Use this achievement as fuel to keep creating, promoting, and connecting with your audience. Every milestone you reach opens doors to new possibilities and opportunities for growth.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{analytics_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">View Your Analytics</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>We''re proud of you:</strong> Reaching 1,000 streams is no small feat. It takes talent, dedication, and the courage to share your art with the world. We''re honored to be part of your journey and excited to see where you go from here. Keep creating, keep sharing, and keep celebrating these moments of growth.</p>
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
  body_text_template = '🎉 Congratulations! You''ve Reached 1,000 Streams on {{release_title}}

Congratulations, {{user_name}}!

You''ve just achieved an incredible milestone – {{release_title}} has reached 1,000 streams! This is a moment worth celebrating. Every stream represents someone discovering your music, connecting with your art, and becoming part of your journey. This milestone marks the beginning of something special.

1,000 Streams and Growing

What This Achievement Means

Reaching 1,000 streams is significant because:
- You''ve built an initial audience that''s actively engaging with your music
- Your tracks are being discovered and shared by listeners
- You''re establishing a foundation for continued growth
- This momentum can compound into even greater opportunities
- You''re proving that your music resonates with people

🚀 Keep the Momentum Going: This is just the beginning! Use this achievement as fuel to keep creating, promoting, and connecting with your audience. Every milestone you reach opens doors to new possibilities and opportunities for growth.

View Your Analytics: {{analytics_url}}

We''re proud of you: Reaching 1,000 streams is no small feat. It takes talent, dedication, and the courage to share your art with the world. We''re honored to be part of your journey and excited to see where you go from here. Keep creating, keep sharing, and keep celebrating these moments of growth.

Best regards,
The MSC & Co Team'
WHERE name = 'Milestone - 1000 Streams';

-- 2. Milestone - 1K Streams
UPDATE marketing_email_templates
SET 
  subject_template = '🎯 Amazing! You''ve Hit 1,000 Streams on {{release_title}}',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🎯 1,000 Streams Achievement</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Congratulations! Your release <strong>{{release_title}}</strong> has just reached <strong>1,000 streams</strong>! This is an exciting milestone that demonstrates your music is connecting with listeners. Every single stream represents someone choosing to listen, someone being moved by your art, and someone becoming part of your growing community.</p>
    
    <div style="background: #f0fdf4; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #10b981; text-align: center;">
      <p style="font-size: 48px; margin: 0; font-weight: bold; color: #065f46; line-height: 1;">1K</p>
      <p style="font-size: 18px; margin: 10px 0 0 0; color: #047857; font-weight: 600;">Streams and Counting</p>
    </div>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">Why This Matters</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">Reaching 1,000 streams is significant because:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;">You''ve built momentum with a dedicated listener base</li>
        <li style="margin-bottom: 8px;">Your music is being discovered and enjoyed by real people</li>
        <li style="margin-bottom: 8px;">This foundation sets you up for exponential growth</li>
        <li style="margin-bottom: 8px;">You''re proving your music has appeal and staying power</li>
        <li style="margin-bottom: 8px;">This milestone can attract more opportunities and attention</li>
      </ul>
    </div>
    
    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #92400e; line-height: 1.7;"><strong>🌟 Keep Building:</strong> This is just the beginning of your journey. Use this achievement to fuel your creative fire, engage with your listeners, and continue creating amazing music. The best is yet to come!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{analytics_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">View Analytics</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>Congratulations on this achievement:</strong> Reaching 1,000 streams takes dedication, talent, and the courage to share your art. We''re thrilled to celebrate this milestone with you and excited to see what you accomplish next!</p>
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
  body_text_template = '🎯 Amazing! You''ve Hit 1,000 Streams on {{release_title}}

Hi {{user_name}},

Congratulations! Your release {{release_title}} has just reached 1,000 streams! This is an exciting milestone that demonstrates your music is connecting with listeners. Every single stream represents someone choosing to listen, someone being moved by your art, and someone becoming part of your growing community.

1K Streams and Counting

Why This Matters

Reaching 1,000 streams is significant because:
- You''ve built momentum with a dedicated listener base
- Your music is being discovered and enjoyed by real people
- This foundation sets you up for exponential growth
- You''re proving your music has appeal and staying power
- This milestone can attract more opportunities and attention

🌟 Keep Building: This is just the beginning of your journey. Use this achievement to fuel your creative fire, engage with your listeners, and continue creating amazing music. The best is yet to come!

View Analytics: {{analytics_url}}

Congratulations on this achievement: Reaching 1,000 streams takes dedication, talent, and the courage to share your art. We''re thrilled to celebrate this milestone with you and excited to see what you accomplish next!

Best regards,
The MSC & Co Team'
WHERE name = 'Milestone - 1K Streams';

-- 3. Milestone - 10K Streams
UPDATE marketing_email_templates
SET 
  subject_template = '🎊 Incredible! You''ve Reached 10,000 Streams on {{release_title}}',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🎊 10,000 Streams Milestone</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Incredible news! <strong>{{release_title}}</strong> has just reached <strong>10,000 streams</strong>! This is a major achievement that demonstrates your music is truly resonating with listeners. You''ve moved from hundreds to thousands, showing that your audience is growing and your music is making a real impact. This milestone represents significant momentum in your music career.</p>
    
    <div style="background: #fef2f2; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f5576c; text-align: center;">
      <p style="font-size: 48px; margin: 0; font-weight: bold; color: #991b1b; line-height: 1;">10K</p>
      <p style="font-size: 18px; margin: 10px 0 0 0; color: #7f1d1d; font-weight: 600;">Streams and Growing Strong</p>
    </div>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">What This Achievement Represents</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">Reaching 10,000 streams shows:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Your music is finding its audience and gaining real traction</li>
        <li style="margin-bottom: 8px;">You''ve built a substantial listener base that''s actively engaging</li>
        <li style="margin-bottom: 8px;">Your tracks have staying power and appeal beyond initial releases</li>
        <li style="margin-bottom: 8px;">You''re positioned for algorithmic boosts and playlist features</li>
        <li style="margin-bottom: 8px;">This momentum can accelerate your growth even further</li>
      </ul>
    </div>
    
    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #92400e; line-height: 1.7;"><strong>🚀 You''re On Fire:</strong> 10,000 streams is a powerful milestone that validates your talent and hard work. Use this achievement to fuel your next steps, engage with your growing audience, and keep creating the music that''s clearly resonating with people!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{analytics_url}}" style="background: #f5576c; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">View Analytics</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f5576c;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>Congratulations on this incredible achievement:</strong> Reaching 10,000 streams is no small feat – it takes exceptional music, dedication, and the ability to connect with listeners. We''re thrilled to celebrate this milestone with you and can''t wait to see where your journey takes you next!</p>
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
  body_text_template = '🎊 Incredible! You''ve Reached 10,000 Streams on {{release_title}}

Hi {{user_name}},

Incredible news! {{release_title}} has just reached 10,000 streams! This is a major achievement that demonstrates your music is truly resonating with listeners. You''ve moved from hundreds to thousands, showing that your audience is growing and your music is making a real impact. This milestone represents significant momentum in your music career.

10K Streams and Growing Strong

What This Achievement Represents

Reaching 10,000 streams shows:
- Your music is finding its audience and gaining real traction
- You''ve built a substantial listener base that''s actively engaging
- Your tracks have staying power and appeal beyond initial releases
- You''re positioned for algorithmic boosts and playlist features
- This momentum can accelerate your growth even further

🚀 You''re On Fire: 10,000 streams is a powerful milestone that validates your talent and hard work. Use this achievement to fuel your next steps, engage with your growing audience, and keep creating the music that''s clearly resonating with people!

View Analytics: {{analytics_url}}

Congratulations on this incredible achievement: Reaching 10,000 streams is no small feat – it takes exceptional music, dedication, and the ability to connect with listeners. We''re thrilled to celebrate this milestone with you and can''t wait to see where your journey takes you next!

Best regards,
The MSC & Co Team'
WHERE name = 'Milestone - 10K Streams';

-- 4. Milestone - 100K Streams
UPDATE marketing_email_templates
SET 
  subject_template = '🌟 Outstanding! You''ve Reached 100,000 Streams on {{release_title}}',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🌟 100,000 Streams Milestone</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Outstanding achievement! <strong>{{release_title}}</strong> has reached <strong>100,000 streams</strong>! This is a monumental milestone that places you among the top tier of independent artists. You''ve moved from thousands to hundreds of thousands, demonstrating that your music has serious staying power and genuine appeal. This achievement represents a true following, not just passing interest.</p>
    
    <div style="background: #fff7ed; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f59e0b; text-align: center;">
      <p style="font-size: 48px; margin: 0; font-weight: bold; color: #92400e; line-height: 1;">100K</p>
      <p style="font-size: 18px; margin: 10px 0 0 0; color: #78350f; font-weight: 600;">Streams and Building a Legacy</p>
    </div>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">The Significance of This Milestone</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">Reaching 100,000 streams means:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;">You''ve built a substantial, engaged fanbase that actively supports your music</li>
        <li style="margin-bottom: 8px;">Your tracks are being discovered organically and through recommendations</li>
        <li style="margin-bottom: 8px;">You''re positioned for major playlist features and industry recognition</li>
        <li style="margin-bottom: 8px;">This level of engagement opens doors to new opportunities and partnerships</li>
        <li style="margin-bottom: 8px;">You''ve proven that independent artists can achieve major success</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7;"><strong>🏆 You''re Building Something Real:</strong> 100,000 streams isn''t just a number – it''s validation that you''re building a real career in music. This milestone puts you in a select group of artists who''ve truly broken through. Keep pushing, keep creating, and keep building on this incredible foundation!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{analytics_url}}" style="background: #f5af19; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">View Analytics</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f5af19;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>We''re in awe of your achievement:</strong> Reaching 100,000 streams is extraordinary. It takes exceptional talent, relentless dedication, and music that truly connects with people. We''re honored to be part of your journey and thrilled to celebrate this incredible milestone with you. Here''s to the next 100,000 and beyond!</p>
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
  body_text_template = '🌟 Outstanding! You''ve Reached 100,000 Streams on {{release_title}}

Hi {{user_name}},

Outstanding achievement! {{release_title}} has reached 100,000 streams! This is a monumental milestone that places you among the top tier of independent artists. You''ve moved from thousands to hundreds of thousands, demonstrating that your music has serious staying power and genuine appeal. This achievement represents a true following, not just passing interest.

100K Streams and Building a Legacy

The Significance of This Milestone

Reaching 100,000 streams means:
- You''ve built a substantial, engaged fanbase that actively supports your music
- Your tracks are being discovered organically and through recommendations
- You''re positioned for major playlist features and industry recognition
- This level of engagement opens doors to new opportunities and partnerships
- You''ve proven that independent artists can achieve major success

🏆 You''re Building Something Real: 100,000 streams isn''t just a number – it''s validation that you''re building a real career in music. This milestone puts you in a select group of artists who''ve truly broken through. Keep pushing, keep creating, and keep building on this incredible foundation!

View Analytics: {{analytics_url}}

We''re in awe of your achievement: Reaching 100,000 streams is extraordinary. It takes exceptional talent, relentless dedication, and music that truly connects with people. We''re honored to be part of your journey and thrilled to celebrate this incredible milestone with you. Here''s to the next 100,000 and beyond!

Best regards,
The MSC & Co Team'
WHERE name = 'Milestone - 100K Streams';

-- 5. Milestone - 1M Streams
UPDATE marketing_email_templates
SET 
  subject_template = '🏆 PHENOMENAL! You''ve Reached 1 Million Streams on {{release_title}}',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🏆 1 Million Streams Milestone</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">PHENOMENAL! <strong>{{release_title}}</strong> has reached <strong>ONE MILLION STREAMS</strong>! This is an absolutely extraordinary achievement that places you in the elite tier of independent artists. You''ve crossed the threshold from hundreds of thousands to millions, proving that your music has massive appeal, genuine staying power, and a dedicated fanbase. This milestone represents a true breakthrough in your music career.</p>
    
    <div style="background: #f0fdf4; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #10b981; text-align: center;">
      <p style="font-size: 48px; margin: 0; font-weight: bold; color: #065f46; line-height: 1;">1M</p>
      <p style="font-size: 18px; margin: 10px 0 0 0; color: #047857; font-weight: 600;">Streams and Making History</p>
    </div>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">What This Extraordinary Achievement Means</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">Reaching 1 million streams represents:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;">You''ve built a massive, engaged fanbase that''s actively supporting your music</li>
        <li style="margin-bottom: 8px;">Your music has genuine commercial appeal and mainstream potential</li>
        <li style="margin-bottom: 8px;">You''re positioned for major industry recognition and opportunities</li>
        <li style="margin-bottom: 8px;">This achievement opens doors to partnerships, collaborations, and career-defining moments</li>
        <li style="margin-bottom: 8px;">You''ve proven that independent artists can achieve massive success</li>
      </ul>
    </div>
    
    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #92400e; line-height: 1.7;"><strong>🌟 You''re a True Success Story:</strong> 1 million streams is a life-changing milestone. This achievement validates everything you''ve worked for, proves your music has universal appeal, and establishes you as a force in the industry. Use this moment to reflect on how far you''ve come and get excited about where you''re going!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{analytics_url}}" style="background: #2ecc71; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">View Analytics</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #2ecc71;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>We''re incredibly proud of you:</strong> Reaching 1 million streams is absolutely phenomenal. This achievement represents exceptional talent, unwavering dedication, and music that truly moves people. You''ve joined an elite group of artists who''ve achieved this milestone, and we''re honored to celebrate this extraordinary achievement with you. Here''s to the next million and all the incredible opportunities ahead!</p>
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
  body_text_template = '🏆 PHENOMENAL! You''ve Reached 1 Million Streams on {{release_title}}

Hi {{user_name}},

PHENOMENAL! {{release_title}} has reached ONE MILLION STREAMS! This is an absolutely extraordinary achievement that places you in the elite tier of independent artists. You''ve crossed the threshold from hundreds of thousands to millions, proving that your music has massive appeal, genuine staying power, and a dedicated fanbase. This milestone represents a true breakthrough in your music career.

1M Streams and Making History

What This Extraordinary Achievement Means

Reaching 1 million streams represents:
- You''ve built a massive, engaged fanbase that''s actively supporting your music
- Your music has genuine commercial appeal and mainstream potential
- You''re positioned for major industry recognition and opportunities
- This achievement opens doors to partnerships, collaborations, and career-defining moments
- You''ve proven that independent artists can achieve massive success

🌟 You''re a True Success Story: 1 million streams is a life-changing milestone. This achievement validates everything you''ve worked for, proves your music has universal appeal, and establishes you as a force in the industry. Use this moment to reflect on how far you''ve come and get excited about where you''re going!

View Analytics: {{analytics_url}}

We''re incredibly proud of you: Reaching 1 million streams is absolutely phenomenal. This achievement represents exceptional talent, unwavering dedication, and music that truly moves people. You''ve joined an elite group of artists who''ve achieved this milestone, and we''re honored to celebrate this extraordinary achievement with you. Here''s to the next million and all the incredible opportunities ahead!

Best regards,
The MSC & Co Team'
WHERE name = 'Milestone - 1M Streams';

-- 6. Milestone - First Release
UPDATE marketing_email_templates
SET 
  subject_template = '🎉 Congratulations on Your First Release – {{release_title}}',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🎉 Your First Release</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Congratulations, {{user_name}}!</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Amazing news! You''ve just released your first track: <strong>{{release_title}}</strong>! This is a huge milestone in your music journey – the moment you''ve taken that courageous step to share your art with the world. Your first release marks the beginning of something special, the start of your professional music career, and the foundation of everything you''ll build from here.</p>
    
    <div style="background: #f0fdf4; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #10b981; text-align: center;">
      <p style="font-size: 36px; margin: 0; font-weight: bold; color: #065f46; line-height: 1;">#1</p>
      <p style="font-size: 18px; margin: 10px 0 0 0; color: #047857; font-weight: 600;">Your First Release</p>
    </div>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">What This Milestone Represents</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">Your first release is significant because:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;">You''ve taken the leap from creating music to sharing it professionally</li>
        <li style="margin-bottom: 8px;">You''re now building your catalog and establishing your presence</li>
        <li style="margin-bottom: 8px;">This is the foundation upon which you''ll build your entire career</li>
        <li style="margin-bottom: 8px;">You''re opening yourself up to discovery, feedback, and opportunities</li>
        <li style="margin-bottom: 8px;">Every successful artist started with their first release – and this is yours</li>
      </ul>
    </div>
    
    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #92400e; line-height: 1.7;"><strong>🚀 Your Journey Begins:</strong> Your first release is a moment to celebrate, reflect on, and use as motivation. This is where your story as a professional artist truly begins. Share it with your network, engage with your listeners, and get ready for the incredible journey ahead!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{release_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">View Your Release</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>We''re thrilled for you:</strong> Releasing your first track takes courage, creativity, and commitment. You''ve done something many people dream about but never follow through on. We''re honored to be part of your first release and excited to support you as you continue to build your catalog and grow your career. Congratulations on this incredible milestone!</p>
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
  body_text_template = '🎉 Congratulations on Your First Release – {{release_title}}

Congratulations, {{user_name}}!

Amazing news! You''ve just released your first track: {{release_title}}! This is a huge milestone in your music journey – the moment you''ve taken that courageous step to share your art with the world. Your first release marks the beginning of something special, the start of your professional music career, and the foundation of everything you''ll build from here.

#1 Your First Release

What This Milestone Represents

Your first release is significant because:
- You''ve taken the leap from creating music to sharing it professionally
- You''re now building your catalog and establishing your presence
- This is the foundation upon which you''ll build your entire career
- You''re opening yourself up to discovery, feedback, and opportunities
- Every successful artist started with their first release – and this is yours

🚀 Your Journey Begins: Your first release is a moment to celebrate, reflect on, and use as motivation. This is where your story as a professional artist truly begins. Share it with your network, engage with your listeners, and get ready for the incredible journey ahead!

View Your Release: {{release_url}}

We''re thrilled for you: Releasing your first track takes courage, creativity, and commitment. You''ve done something many people dream about but never follow through on. We''re honored to be part of your first release and excited to support you as you continue to build your catalog and grow your career. Congratulations on this incredible milestone!

Best regards,
The MSC & Co Team'
WHERE name = 'Milestone - First Release';

-- 7. Milestone - 10 Releases
UPDATE marketing_email_templates
SET 
  subject_template = '🎊 Congratulations! You''ve Released 10 Tracks – Building an Impressive Catalog',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🎊 10 Releases Milestone</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Congratulations! You''ve now released <strong>10 tracks</strong>! This is a significant milestone that shows you''re building an impressive catalog of music. You''ve moved beyond your first few releases to establish a substantial body of work. This consistency and dedication demonstrate your commitment to your craft and your growth as an artist.</p>
    
    <div style="background: #fef2f2; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f5576c; text-align: center;">
      <p style="font-size: 48px; margin: 0; font-weight: bold; color: #991b1b; line-height: 1;">10</p>
      <p style="font-size: 18px; margin: 10px 0 0 0; color: #7f1d1d; font-weight: 600;">Releases and Growing</p>
    </div>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">What This Achievement Means</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">Reaching 10 releases shows:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;">You''re consistently creating and releasing music</li>
        <li style="margin-bottom: 8px;">You''ve built a catalog that showcases your artistic range</li>
        <li style="margin-bottom: 8px;">You''re establishing yourself as a serious, professional artist</li>
        <li style="margin-bottom: 8px;">Your catalog provides more opportunities for discovery and engagement</li>
        <li style="margin-bottom: 8px;">You''re laying the foundation for long-term career success</li>
      </ul>
    </div>
    
    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #92400e; line-height: 1.7;"><strong>🚀 Keep Building Your Catalog:</strong> 10 releases is a solid foundation, and each new release adds to your artistic legacy. Continue creating, continue releasing, and watch as your catalog grows into an impressive body of work that represents your journey as an artist!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{dashboard_url}}" style="background: #f5576c; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">View Your Releases</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f5576c;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>Congratulations on this achievement:</strong> Building a catalog of 10 releases takes dedication, creativity, and the discipline to see projects through from conception to release. We''re proud of your consistency and excited to see your catalog continue to grow. Keep up the amazing work!</p>
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
  body_text_template = '🎊 Congratulations! You''ve Released 10 Tracks – Building an Impressive Catalog

Hi {{user_name}},

Congratulations! You''ve now released 10 tracks! This is a significant milestone that shows you''re building an impressive catalog of music. You''ve moved beyond your first few releases to establish a substantial body of work. This consistency and dedication demonstrate your commitment to your craft and your growth as an artist.

10 Releases and Growing

What This Achievement Means

Reaching 10 releases shows:
- You''re consistently creating and releasing music
- You''ve built a catalog that showcases your artistic range
- You''re establishing yourself as a serious, professional artist
- Your catalog provides more opportunities for discovery and engagement
- You''re laying the foundation for long-term career success

🚀 Keep Building Your Catalog: 10 releases is a solid foundation, and each new release adds to your artistic legacy. Continue creating, continue releasing, and watch as your catalog grows into an impressive body of work that represents your journey as an artist!

View Your Releases: {{dashboard_url}}

Congratulations on this achievement: Building a catalog of 10 releases takes dedication, creativity, and the discipline to see projects through from conception to release. We''re proud of your consistency and excited to see your catalog continue to grow. Keep up the amazing work!

Best regards,
The MSC & Co Team'
WHERE name = 'Milestone - 10 Releases';

-- 8. Milestone - 25 Releases
UPDATE marketing_email_templates
SET 
  subject_template = '🌟 Incredible! 25 Releases – Your Consistency is Inspiring',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🌟 25 Releases Milestone</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Incredible achievement! You''ve now released <strong>25 tracks</strong>! This milestone demonstrates remarkable consistency and dedication to your craft. You''ve built a substantial catalog that showcases your evolution as an artist, your range, and your commitment to sharing your music with the world. This level of productivity and consistency is truly inspiring.</p>
    
    <div style="background: #fff7ed; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f59e0b; text-align: center;">
      <p style="font-size: 48px; margin: 0; font-weight: bold; color: #92400e; line-height: 1;">25</p>
      <p style="font-size: 18px; margin: 10px 0 0 0; color: #78350f; font-weight: 600;">Releases and Thriving</p>
    </div>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">What This Milestone Represents</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">Reaching 25 releases shows:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;">You''ve established a consistent creative output and release schedule</li>
        <li style="margin-bottom: 8px;">You''ve built an impressive catalog that represents significant creative work</li>
        <li style="margin-bottom: 8px;">Your dedication to your craft is evident and inspiring</li>
        <li style="margin-bottom: 8px;">You''ve created a substantial body of work that showcases your artistic journey</li>
        <li style="margin-bottom: 8px;">You''re positioned as a prolific, serious artist in your genre</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7;"><strong>🏆 Your Consistency is Your Superpower:</strong> 25 releases is an extraordinary achievement that speaks to your work ethic, creativity, and dedication. This level of consistent output is rare and sets you apart. Keep building on this incredible foundation!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{dashboard_url}}" style="background: #f5af19; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">View Catalog</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f5af19;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>We''re inspired by your achievement:</strong> Reaching 25 releases takes extraordinary dedication, creative energy, and the discipline to consistently deliver. You''ve built something remarkable, and we''re honored to be part of your journey. Congratulations on this incredible milestone!</p>
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
  body_text_template = '🌟 Incredible! 25 Releases – Your Consistency is Inspiring

Hi {{user_name}},

Incredible achievement! You''ve now released 25 tracks! This milestone demonstrates remarkable consistency and dedication to your craft. You''ve built a substantial catalog that showcases your evolution as an artist, your range, and your commitment to sharing your music with the world. This level of productivity and consistency is truly inspiring.

25 Releases and Thriving

What This Milestone Represents

Reaching 25 releases shows:
- You''ve established a consistent creative output and release schedule
- You''ve built an impressive catalog that represents significant creative work
- Your dedication to your craft is evident and inspiring
- You''ve created a substantial body of work that showcases your artistic journey
- You''re positioned as a prolific, serious artist in your genre

🏆 Your Consistency is Your Superpower: 25 releases is an extraordinary achievement that speaks to your work ethic, creativity, and dedication. This level of consistent output is rare and sets you apart. Keep building on this incredible foundation!

View Catalog: {{dashboard_url}}

We''re inspired by your achievement: Reaching 25 releases takes extraordinary dedication, creative energy, and the discipline to consistently deliver. You''ve built something remarkable, and we''re honored to be part of your journey. Congratulations on this incredible milestone!

Best regards,
The MSC & Co Team'
WHERE name = 'Milestone - 25 Releases';

-- 9. Milestone - 50 Releases
UPDATE marketing_email_templates
SET 
  subject_template = '🏆 Outstanding! 50 Releases – You''re a True Professional',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🏆 50 Releases Milestone</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Outstanding achievement! You''ve now released <strong>50 tracks</strong>! This is a truly remarkable milestone that places you in an elite group of prolific, professional artists. You''ve built an extensive catalog that represents years of creative work, artistic evolution, and unwavering dedication. This achievement demonstrates that you''re not just making music – you''re building a career, a legacy, and a substantial body of work.</p>
    
    <div style="background: #f0fdf4; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #10b981; text-align: center;">
      <p style="font-size: 48px; margin: 0; font-weight: bold; color: #065f46; line-height: 1;">50</p>
      <p style="font-size: 18px; margin: 10px 0 0 0; color: #047857; font-weight: 600;">Releases and Legendary</p>
    </div>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">What This Extraordinary Achievement Represents</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">Reaching 50 releases means:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;">You''ve established yourself as a prolific, professional artist</li>
        <li style="margin-bottom: 8px;">You''ve built an extensive catalog that represents significant artistic achievement</li>
        <li style="margin-bottom: 8px;">Your work ethic and consistency are at the highest professional level</li>
        <li style="margin-bottom: 8px;">You''ve created a substantial legacy and body of work</li>
        <li style="margin-bottom: 8px;">You''re positioned as a serious, committed artist in the industry</li>
      </ul>
    </div>
    
    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #92400e; line-height: 1.7;"><strong>🌟 You''ve Built Something Extraordinary:</strong> 50 releases is an incredible achievement that very few artists reach. This milestone represents years of dedication, countless hours of creative work, and an unwavering commitment to your craft. You''ve established yourself as a true professional, and we''re in awe of what you''ve accomplished!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{dashboard_url}}" style="background: #2ecc71; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">View Catalog</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #2ecc71;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>We''re honored to celebrate this with you:</strong> Reaching 50 releases is an extraordinary accomplishment that represents exceptional dedication, creative excellence, and professional commitment. You''ve built something truly remarkable, and we''re thrilled to be part of your journey. Congratulations on this incredible milestone – you''ve earned it!</p>
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
  body_text_template = '🏆 Outstanding! 50 Releases – You''re a True Professional

Hi {{user_name}},

Outstanding achievement! You''ve now released 50 tracks! This is a truly remarkable milestone that places you in an elite group of prolific, professional artists. You''ve built an extensive catalog that represents years of creative work, artistic evolution, and unwavering dedication. This achievement demonstrates that you''re not just making music – you''re building a career, a legacy, and a substantial body of work.

50 Releases and Legendary

What This Extraordinary Achievement Represents

Reaching 50 releases means:
- You''ve established yourself as a prolific, professional artist
- You''ve built an extensive catalog that represents significant artistic achievement
- Your work ethic and consistency are at the highest professional level
- You''ve created a substantial legacy and body of work
- You''re positioned as a serious, committed artist in the industry

🌟 You''ve Built Something Extraordinary: 50 releases is an incredible achievement that very few artists reach. This milestone represents years of dedication, countless hours of creative work, and an unwavering commitment to your craft. You''ve established yourself as a true professional, and we''re in awe of what you''ve accomplished!

View Catalog: {{dashboard_url}}

We''re honored to celebrate this with you: Reaching 50 releases is an extraordinary accomplishment that represents exceptional dedication, creative excellence, and professional commitment. You''ve built something truly remarkable, and we''re thrilled to be part of your journey. Congratulations on this incredible milestone – you''ve earned it!

Best regards,
The MSC & Co Team'
WHERE name = 'Milestone - 50 Releases';

-- 10. Milestone - Chart Achievement
UPDATE marketing_email_templates
SET 
  subject_template = '📈 Incredible! {{release_title}} Charted at #{{chart_position}} on {{chart_name}}',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">📈 Chart Achievement</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Incredible news! <strong>{{release_title}}</strong> has charted at <strong>#{{chart_position}}</strong> on <strong>{{chart_name}}</strong>! This is an extraordinary achievement that places your music among the most successful tracks in your category. Charting is one of the highest honors in the music industry, and this milestone demonstrates that your music is not only being heard but is resonating powerfully with listeners.</p>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9; text-align: center;">
      <p style="font-size: 36px; margin: 0; font-weight: bold; color: #0c4a6e; line-height: 1;">#{{chart_position}}</p>
      <p style="font-size: 18px; margin: 10px 0 0 0; color: #075985; font-weight: 600;">On {{chart_name}}</p>
    </div>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">What This Achievement Means</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">Charting at #{{chart_position}} represents:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Your music is performing among the top tracks in your category</li>
        <li style="margin-bottom: 8px;">You''ve achieved significant recognition and industry validation</li>
        <li style="margin-bottom: 8px;">This opens doors to greater visibility, opportunities, and industry attention</li>
        <li style="margin-bottom: 8px;">You''ve proven your music has mainstream appeal and commercial success</li>
        <li style="margin-bottom: 8px;">This achievement can compound into even more opportunities</li>
      </ul>
    </div>
    
    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #92400e; line-height: 1.7;"><strong>🏆 This is Huge:</strong> Charting is a major milestone that very few artists achieve. This achievement validates your talent, your hard work, and your music''s appeal. Share this accomplishment, celebrate this moment, and use it as momentum for even greater achievements ahead!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{chart_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">View Charts</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>We''re thrilled for you:</strong> Charting is an incredible achievement that represents exceptional music, strategic promotion, and genuine audience connection. You''ve earned this recognition, and we''re honored to celebrate this milestone with you. Congratulations on this extraordinary achievement!</p>
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
  body_text_template = '📈 Incredible! {{release_title}} Charted at #{{chart_position}} on {{chart_name}}

Hi {{user_name}},

Incredible news! {{release_title}} has charted at #{{chart_position}} on {{chart_name}}! This is an extraordinary achievement that places your music among the most successful tracks in your category. Charting is one of the highest honors in the music industry, and this milestone demonstrates that your music is not only being heard but is resonating powerfully with listeners.

#{{chart_position}} On {{chart_name}}

What This Achievement Means

Charting at #{{chart_position}} represents:
- Your music is performing among the top tracks in your category
- You''ve achieved significant recognition and industry validation
- This opens doors to greater visibility, opportunities, and industry attention
- You''ve proven your music has mainstream appeal and commercial success
- This achievement can compound into even more opportunities

🏆 This is Huge: Charting is a major milestone that very few artists achieve. This achievement validates your talent, your hard work, and your music''s appeal. Share this accomplishment, celebrate this moment, and use it as momentum for even greater achievements ahead!

View Charts: {{chart_url}}

We''re thrilled for you: Charting is an incredible achievement that represents exceptional music, strategic promotion, and genuine audience connection. You''ve earned this recognition, and we''re honored to celebrate this milestone with you. Congratulations on this extraordinary achievement!

Best regards,
The MSC & Co Team'
WHERE name = 'Milestone - Chart Achievement';

-- 11. Milestone - Playlist Feature
UPDATE marketing_email_templates
SET 
  subject_template = '📋 Amazing! {{release_title}} Featured on {{playlist_name}}',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">📋 Major Playlist Feature</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Amazing news! <strong>{{release_title}}</strong> has been featured on <strong>{{playlist_name}}</strong>! This is a huge opportunity that can significantly boost your visibility and streams. Being featured on a major playlist is one of the most effective ways to reach new listeners, grow your fanbase, and build momentum for your music career. This achievement represents recognition from curators and opens doors to discovery by thousands of new potential fans.</p>
    
    <div style="background: #fef2f2; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f5576c; text-align: center;">
      <p style="font-size: 36px; margin: 0; font-weight: bold; color: #991b1b; line-height: 1;">📋</p>
      <p style="font-size: 18px; margin: 10px 0 0 0; color: #7f1d1d; font-weight: 600;">Featured on {{playlist_name}}</p>
    </div>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">What This Feature Means</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">Being featured on {{playlist_name}} can lead to:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Significant exposure to new audiences and potential fans</li>
        <li style="margin-bottom: 8px;">Increased streams and engagement from playlist listeners</li>
        <li style="margin-bottom: 8px;">Potential for algorithmic playlist recommendations and boosts</li>
        <li style="margin-bottom: 8px;">Recognition from industry curators and playlist creators</li>
        <li style="margin-bottom: 8px;">Momentum that can compound into even more opportunities</li>
      </ul>
    </div>
    
    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #92400e; line-height: 1.7;"><strong>🎉 Share This Achievement:</strong> Don''t forget to share this playlist feature with your fans and network! Let your audience know where they can find your music, and encourage them to follow the playlist and stream your track. This helps boost engagement and can lead to even more visibility and opportunities.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{playlist_url}}" style="background: #f5576c; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">View Playlist</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f5576c;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>Congratulations on this achievement:</strong> Being featured on a major playlist is a significant milestone that can have a lasting impact on your career. This achievement represents your music''s quality, appeal, and the hard work you''ve put into your craft. We''re thrilled to celebrate this with you and excited to see where this momentum takes you!</p>
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
  body_text_template = '📋 Amazing! {{release_title}} Featured on {{playlist_name}}

Hi {{user_name}},

Amazing news! {{release_title}} has been featured on {{playlist_name}}! This is a huge opportunity that can significantly boost your visibility and streams. Being featured on a major playlist is one of the most effective ways to reach new listeners, grow your fanbase, and build momentum for your music career. This achievement represents recognition from curators and opens doors to discovery by thousands of new potential fans.

📋 Featured on {{playlist_name}}

What This Feature Means

Being featured on {{playlist_name}} can lead to:
- Significant exposure to new audiences and potential fans
- Increased streams and engagement from playlist listeners
- Potential for algorithmic playlist recommendations and boosts
- Recognition from industry curators and playlist creators
- Momentum that can compound into even more opportunities

🎉 Share This Achievement: Don''t forget to share this playlist feature with your fans and network! Let your audience know where they can find your music, and encourage them to follow the playlist and stream your track. This helps boost engagement and can lead to even more visibility and opportunities.

View Playlist: {{playlist_url}}

Congratulations on this achievement: Being featured on a major playlist is a significant milestone that can have a lasting impact on your career. This achievement represents your music''s quality, appeal, and the hard work you''ve put into your craft. We''re thrilled to celebrate this with you and excited to see where this momentum takes you!

Best regards,
The MSC & Co Team'
WHERE name = 'Milestone - Playlist Feature';

-- ===========================================
-- UPDATE COMPLETE
-- ===========================================
-- Updated 11 milestone templates with enhanced content:
-- 1. Milestone - 1000 Streams
-- 2. Milestone - 1K Streams
-- 3. Milestone - 10K Streams
-- 4. Milestone - 100K Streams
-- 5. Milestone - 1M Streams
-- 6. Milestone - First Release
-- 7. Milestone - 10 Releases
-- 8. Milestone - 25 Releases
-- 9. Milestone - 50 Releases
-- 10. Milestone - Chart Achievement
-- 11. Milestone - Playlist Feature
-- ===========================================




