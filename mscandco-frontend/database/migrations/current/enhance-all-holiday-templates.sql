-- ===========================================
-- ENHANCE ALL HOLIDAY TEMPLATES
-- More elaborate, relational, and professional content
-- ===========================================
-- Date: 2025-01-28
-- Purpose: Update all holiday templates with enhanced content and consistent styling
-- Total Templates Updated: 23
-- ===========================================
-- 
-- STYLING APPLIED:
-- - Header h1: 22px font-size, 24px padding, line-height: 1.3
-- - Body text: 14px font-size
-- - Signature: 14px font-size, #4a5568 color
-- - Buttons: 14px font-size
-- - Footer: 60px logo, "Empowering Artists. Protecting the Planet." slogan (standard for marketing)
-- - No logo in header
-- ===========================================

-- 1. Holiday - New Year
UPDATE marketing_email_templates
SET 
  subject_template = '🎉 Happy New Year from MSC & Co – Welcome to {{new_year}}',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🎉 Happy New Year!</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Welcome to {{new_year}}</p>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">As we welcome <strong>{{new_year}}</strong>, we want to take a moment to express our heartfelt gratitude for being part of the MSC & Co community. This new year is full of possibilities, opportunities, and fresh starts for your music career. We''re excited to continue supporting you on your journey and can''t wait to see what amazing things you''ll accomplish in the year ahead.</p>
    
    <div style="background: #fef3c7; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f59e0b;">
      <h2 style="color: #92400e; margin-top: 0; font-size: 20px; font-weight: 600;">🎯 Make {{new_year}} Your Year</h2>
      <p style="color: #78350f; margin-bottom: 16px; line-height: 1.7;">As you set your goals for the new year, consider:</p>
      <ul style="margin: 0; padding-left: 25px; color: #78350f; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Setting ambitious release goals that push your boundaries</li>
        <li style="margin-bottom: 8px;">Growing your audience with our comprehensive marketing tools</li>
        <li style="margin-bottom: 8px;">Maximizing your earnings potential through strategic releases</li>
        <li style="margin-bottom: 8px;">Connecting with industry professionals and building your network</li>
        <li style="margin-bottom: 8px;">Taking advantage of new features and platform improvements</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7;"><strong>🌟 A Fresh Start:</strong> The new year represents a blank canvas, an opportunity to build on what you''ve already accomplished and reach for new heights. Whether you''re planning major releases, growing your fanbase, or exploring new creative directions, we''re here to support you every step of the way.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{dashboard_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Start Your Year Strong</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>Here''s to an amazing {{new_year}}:</strong> We''re grateful for your trust, your creativity, and the opportunity to be part of your music journey. May this year bring you success, fulfillment, and countless opportunities to share your art with the world. Here''s to making {{new_year}} your best year yet!</p>
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
  body_text_template = '🎉 Happy New Year from MSC & Co – Welcome to {{new_year}}

Hi {{user_name}},

As we welcome {{new_year}}, we want to take a moment to express our heartfelt gratitude for being part of the MSC & Co community. This new year is full of possibilities, opportunities, and fresh starts for your music career. We''re excited to continue supporting you on your journey and can''t wait to see what amazing things you''ll accomplish in the year ahead.

🎯 Make {{new_year}} Your Year

As you set your goals for the new year, consider:
- Setting ambitious release goals that push your boundaries
- Growing your audience with our comprehensive marketing tools
- Maximizing your earnings potential through strategic releases
- Connecting with industry professionals and building your network
- Taking advantage of new features and platform improvements

🌟 A Fresh Start: The new year represents a blank canvas, an opportunity to build on what you''ve already accomplished and reach for new heights. Whether you''re planning major releases, growing your fanbase, or exploring new creative directions, we''re here to support you every step of the way.

Start Your Year Strong: {{dashboard_url}}

Here''s to an amazing {{new_year}}: We''re grateful for your trust, your creativity, and the opportunity to be part of your music journey. May this year bring you success, fulfillment, and countless opportunities to share your art with the world. Here''s to making {{new_year}} your best year yet!

Best regards,
The MSC & Co Team'
WHERE name = 'Holiday - New Year';

-- 2. Holiday - Valentine's Day
UPDATE marketing_email_templates
SET 
  subject_template = '💝 Share the Love – Valentine''s Day Special from MSC & Co',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">💝 Happy Valentine''s Day</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">This Valentine''s Day, we want to celebrate the love you have for your craft and the connection you share with your fans through music. Whether you have a romantic ballad that tells a love story, an upbeat track that spreads joy, or a heartfelt song that captures emotion, this is the perfect time to share your music and connect with listeners who are looking for the perfect soundtrack to their celebrations.</p>
    
    <div style="background: #fef2f2; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f5576c;">
      <h2 style="color: #991b1b; margin-top: 0; font-size: 20px; font-weight: 600;">💕 Why Valentine''s Day Matters for Your Music</h2>
      <p style="color: #7f1d1d; margin-bottom: 16px; line-height: 1.7;">This holiday is perfect for music releases because:</p>
      <ul style="margin: 0; padding-left: 25px; color: #7f1d1d; line-height: 1.8;">
        <li style="margin-bottom: 8px;">People are actively seeking music that captures love and emotion</li>
        <li style="margin-bottom: 8px;">Playlists and streaming platforms feature love-themed content</li>
        <li style="margin-bottom: 8px;">There''s increased engagement with romantic and feel-good music</li>
        <li style="margin-bottom: 8px;">It''s an opportunity to connect with listeners on an emotional level</li>
        <li style="margin-bottom: 8px;">Love songs have timeless appeal and long-term streaming potential</li>
      </ul>
    </div>
    
    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #92400e; line-height: 1.7;"><strong>🎵 Music is the Language of Love:</strong> Whether you''re releasing a new track or promoting existing love songs, Valentine''s Day is a moment when people are especially open to discovering music that speaks to their hearts. This is your opportunity to share your art and connect with listeners who are seeking the perfect soundtrack for their celebrations.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{releases_url}}" style="background: #f5576c; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Release Your Love Song</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f5576c;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>With love from our team:</strong> We''re grateful for the passion you bring to your music and the love you share with your audience. This Valentine''s Day, we hope you find new ways to connect with listeners and celebrate the art you create. Happy Valentine''s Day!</p>
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
  body_text_template = '💝 Share the Love – Valentine''s Day Special from MSC & Co

Hi {{user_name}},

This Valentine''s Day, we want to celebrate the love you have for your craft and the connection you share with your fans through music. Whether you have a romantic ballad that tells a love story, an upbeat track that spreads joy, or a heartfelt song that captures emotion, this is the perfect time to share your music and connect with listeners who are looking for the perfect soundtrack to their celebrations.

💕 Why Valentine''s Day Matters for Your Music

This holiday is perfect for music releases because:
- People are actively seeking music that captures love and emotion
- Playlists and streaming platforms feature love-themed content
- There''s increased engagement with romantic and feel-good music
- It''s an opportunity to connect with listeners on an emotional level
- Love songs have timeless appeal and long-term streaming potential

🎵 Music is the Language of Love: Whether you''re releasing a new track or promoting existing love songs, Valentine''s Day is a moment when people are especially open to discovering music that speaks to their hearts. This is your opportunity to share your art and connect with listeners who are seeking the perfect soundtrack for their celebrations.

Release Your Love Song: {{releases_url}}

With love from our team: We''re grateful for the passion you bring to your music and the love you share with your audience. This Valentine''s Day, we hope you find new ways to connect with listeners and celebrate the art you create. Happy Valentine''s Day!

Best regards,
The MSC & Co Team'
WHERE name = 'Holiday - Valentine''s Day';

-- 3. Holiday - Easter
UPDATE marketing_email_templates
SET 
  subject_template = '🐰 Happy Easter from MSC & Co – Spring into New Beginnings',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🐰 Happy Easter</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Wishing you a joyful Easter filled with creativity, inspiration, and new beginnings! Spring is here, and with it comes the perfect opportunity for fresh starts and renewed energy in your music career. Just as nature awakens and blossoms during this season, so too can your creative projects flourish with renewed passion and purpose.</p>
    
    <div style="background: #f0fdf4; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #10b981;">
      <h2 style="color: #065f46; margin-top: 0; font-size: 20px; font-weight: 600;">🌱 Spring: A Time for Growth</h2>
      <p style="color: #047857; margin-bottom: 16px; line-height: 1.7;">This season is ideal for:</p>
      <ul style="margin: 0; padding-left: 25px; color: #047857; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Launching new releases and creative projects</li>
        <li style="margin-bottom: 8px;">Exploring fresh sounds and musical directions</li>
        <li style="margin-bottom: 8px;">Reconnecting with your audience with renewed energy</li>
        <li style="margin-bottom: 8px;">Setting new goals and aspirations for the year ahead</li>
        <li style="margin-bottom: 8px;">Taking advantage of new platform features and tools</li>
      </ul>
    </div>
    
    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #92400e; line-height: 1.7;"><strong>🌸 Renewal and Possibility:</strong> Easter represents renewal, hope, and the promise of new life. In your music journey, this can be a time to refresh your approach, try new strategies, and embrace opportunities that come with the changing season. Whether you''re working on new material or promoting existing releases, spring brings with it a sense of optimism and possibility.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{dashboard_url}}" style="background: #fee140; color: #333; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Explore New Features</a>
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
  body_text_template = '🐰 Happy Easter from MSC & Co – Spring into New Beginnings

Hi {{user_name}},

Wishing you a joyful Easter filled with creativity, inspiration, and new beginnings! Spring is here, and with it comes the perfect opportunity for fresh starts and renewed energy in your music career. Just as nature awakens and blossoms during this season, so too can your creative projects flourish with renewed passion and purpose.

🌱 Spring: A Time for Growth

This season is ideal for:
- Launching new releases and creative projects
- Exploring fresh sounds and musical directions
- Reconnecting with your audience with renewed energy
- Setting new goals and aspirations for the year ahead
- Taking advantage of new platform features and tools

🌸 Renewal and Possibility: Easter represents renewal, hope, and the promise of new life. In your music journey, this can be a time to refresh your approach, try new strategies, and embrace opportunities that come with the changing season. Whether you''re working on new material or promoting existing releases, spring brings with it a sense of optimism and possibility.

Explore New Features: {{dashboard_url}}

Best regards,
The MSC & Co Team'
WHERE name = 'Holiday - Easter';

-- 4. Holiday - Independence Day
UPDATE marketing_email_templates
SET 
  subject_template = '🇺🇸 Happy Independence Day – Celebrate Freedom with Your Music',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #eb3349 0%, #1e3c72 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🇺🇸 Happy Independence Day</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Celebrate freedom and independence with your music! This Independence Day, let your creativity soar and share your sound with the world. Independence isn''t just a political concept – it''s also about artistic freedom, the ability to create and share your music on your own terms, and the power to build your career the way you envision it.</p>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{releases_url}}" style="background: #eb3349; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Release Your Music</a>
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
  body_text_template = '🇺🇸 Happy Independence Day – Celebrate Freedom with Your Music

Hi {{user_name}},

Celebrate freedom and independence with your music! This Independence Day, let your creativity soar and share your sound with the world. Independence isn''t just a political concept – it''s also about artistic freedom, the ability to create and share your music on your own terms, and the power to build your career the way you envision it.

Release Your Music: {{releases_url}}

Best regards,
The MSC & Co Team'
WHERE name = 'Holiday - Independence Day';

-- 5. Holiday - Halloween
UPDATE marketing_email_templates
SET 
  subject_template = '🎃 Spooky Season Special – Get Ready for Halloween!',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: #ff6b35; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🎃 Spooky Season</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">The spooky season is here! Whether you have a haunting ballad, a chilling track, or an eerie soundscape, Halloween is the perfect time to release and engage with your fans. This holiday offers unique opportunities to explore darker themes, experimental sounds, and creative storytelling through music.</p>
    
    <div style="background: #fff3e0; padding: 25px; border-left: 4px solid #ff6b35; border-radius: 4px; margin: 30px 0;">
      <h2 style="color: #2d3748; margin-top: 0; font-size: 20px; font-weight: 600;">👻 Halloween Release Ideas</h2>
      <ul style="margin: 15px 0; padding-left: 25px; color: #4a5568; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Spooky-themed singles or EPs that capture the spirit of the season</li>
        <li style="margin-bottom: 8px;">Halloween playlist additions to capitalize on seasonal listening</li>
        <li style="margin-bottom: 8px;">Special edition artwork and visual storytelling</li>
        <li style="margin-bottom: 8px;">Horror-inspired music videos and creative content</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{releases_url}}" style="background: #ff6b35; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Release Your Spooky Track</a>
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
  body_text_template = '🎃 Spooky Season Special – Get Ready for Halloween!

Hi {{user_name}},

The spooky season is here! Whether you have a haunting ballad, a chilling track, or an eerie soundscape, Halloween is the perfect time to release and engage with your fans. This holiday offers unique opportunities to explore darker themes, experimental sounds, and creative storytelling through music.

👻 Halloween Release Ideas:
- Spooky-themed singles or EPs that capture the spirit of the season
- Halloween playlist additions to capitalize on seasonal listening
- Special edition artwork and visual storytelling
- Horror-inspired music videos and creative content

Release Your Spooky Track: {{releases_url}}

Best regards,
The MSC & Co Team'
WHERE name = 'Holiday - Halloween';

-- 6. Holiday - Thanksgiving
UPDATE marketing_email_templates
SET 
  subject_template = '🦃 Thankful for You This Thanksgiving!',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #f12711 0%, #f5af19 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🦃 Happy Thanksgiving</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">This Thanksgiving, we''re grateful for you and the amazing music you create. Thank you for being part of the MSC & Co family! This season of gratitude is the perfect time to reflect on your journey, celebrate your achievements, and appreciate the community that supports your art.</p>
    
    <div style="background: #fff7ed; padding: 25px; border-left: 4px solid #f5af19; border-radius: 4px; margin: 30px 0;">
      <h2 style="color: #2d3748; margin-top: 0; font-size: 20px; font-weight: 600;">🙏 What We''re Grateful For</h2>
      <ul style="margin: 15px 0; padding-left: 25px; color: #4a5568; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Your creativity and passion for music</li>
        <li style="margin-bottom: 8px;">The amazing community we''ve built together</li>
        <li style="margin-bottom: 8px;">Your trust in MSC & Co to support your journey</li>
        <li style="margin-bottom: 8px;">The incredible music you share with the world</li>
      </ul>
    </div>
    
    <p style="font-size: 14px; margin-top: 40px; color: #4a5568; line-height: 1.6;">
      Wishing you and your loved ones a wonderful Thanksgiving!<br>
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
  body_text_template = '🦃 Thankful for You This Thanksgiving!

Hi {{user_name}},

This Thanksgiving, we''re grateful for you and the amazing music you create. Thank you for being part of the MSC & Co family! This season of gratitude is the perfect time to reflect on your journey, celebrate your achievements, and appreciate the community that supports your art.

🙏 What We''re Grateful For:
- Your creativity and passion for music
- The amazing community we''ve built together
- Your trust in MSC & Co to support your journey
- The incredible music you share with the world

Wishing you and your loved ones a wonderful Thanksgiving!
The MSC & Co Team'
WHERE name = 'Holiday - Thanksgiving';

-- 7. Holiday - Christmas
UPDATE marketing_email_templates
SET 
  subject_template = '🎄 Merry Christmas & Happy Holidays from MSC & Co!',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🎄 Merry Christmas</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Happy Holidays from All of Us</p>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">As we celebrate this wonderful season, we want to thank you for an incredible year. Your music has touched hearts, and we''re honored to be part of your journey. The holiday season is a time of reflection, celebration, and connection – perfect for sharing your music with those you care about.</p>
    
    <div style="background: #e8f5e9; padding: 25px; border-radius: 8px; margin: 30px 0;">
      <h2 style="color: #2d3748; margin-top: 0; font-size: 20px; font-weight: 600;">🎁 Your Year in Review</h2>
      <ul style="margin: 15px 0; padding-left: 25px; color: #4a5568; line-height: 1.8;">
        <li style="margin-bottom: 8px;">{{releases_count}} releases distributed</li>
        <li style="margin-bottom: 8px;">{{total_streams}} total streams</li>
        <li style="margin-bottom: 8px;">{{total_earnings}} in earnings</li>
        <li style="margin-bottom: 8px;">Growing your audience every day</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{year_in_review_url}}" style="background: #2ecc71; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">View Your Year in Review</a>
    </div>
    
    <p style="font-size: 14px; margin-top: 40px; color: #4a5568; line-height: 1.6;">
      Wishing you joy, peace, and continued success in the new year!<br>
      <strong style="color: #2d3748;">Merry Christmas from The MSC & Co Team</strong>
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
  body_text_template = '🎄 Merry Christmas & Happy Holidays from MSC & Co!

Hi {{user_name}},

As we celebrate this wonderful season, we want to thank you for an incredible year. Your music has touched hearts, and we''re honored to be part of your journey. The holiday season is a time of reflection, celebration, and connection – perfect for sharing your music with those you care about.

🎁 Your Year in Review:
- {{releases_count}} releases distributed
- {{total_streams}} total streams
- {{total_earnings}} in earnings
- Growing your audience every day

View Your Year in Review: {{year_in_review_url}}

Wishing you joy, peace, and continued success in the new year!
Merry Christmas from The MSC & Co Team'
WHERE name = 'Holiday - Christmas';

-- 8. Holiday - St. Patrick's Day
UPDATE marketing_email_templates
SET 
  subject_template = '☘️ Happy St. Patrick''s Day!',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">☘️ Happy St. Patrick''s Day!</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Happy St. Patrick''s Day! May your day be filled with music, joy, and a bit of Irish luck! This special day celebrates Irish culture and heritage, and we''re honored to be part of your music journey. Whether you''re releasing new music, connecting with fans, or building your career, we hope this St. Patrick''s Day brings you good fortune and success in all your musical endeavors. Here''s to celebrating with great music and continued growth!</p>
    
    <div style="background: #f0fdf4; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #10b981;">
      <h2 style="color: #065f46; margin-top: 0; font-size: 20px; font-weight: 600;">🍀 Irish Blessings for Your Music</h2>
      <p style="color: #047857; margin-bottom: 16px; line-height: 1.7;">May your music bring you:</p>
      <ul style="margin: 0; padding-left: 25px; color: #047857; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Good fortune and success in your releases</li>
        <li style="margin-bottom: 8px;">Growing audiences who love your art</li>
        <li style="margin-bottom: 8px;">Opportunities to share your music with the world</li>
        <li style="margin-bottom: 8px;">Joy and fulfillment in your creative journey</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>🎵 Celebrate with Music:</strong> St. Patrick''s Day is a perfect time to celebrate the power of music to bring people together, tell stories, and create connections across cultures. Your music has that same power, and we''re grateful to be part of helping you share it with the world!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{dashboard_url}}" style="background: #2ecc71; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Explore Platform</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #2ecc71;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Sláinte!</strong> We wish you a wonderful St. Patrick''s Day filled with music, celebration, and the luck of the Irish. May your music career continue to flourish, and may you find joy in every note you create and share. Here''s to your success and to many more milestones ahead!</p>
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
  body_text_template = '☘️ Happy St. Patrick''s Day!

Hi {{user_name}},

Happy St. Patrick''s Day! May your day be filled with music, joy, and a bit of Irish luck! This special day celebrates Irish culture and heritage, and we''re honored to be part of your music journey. Whether you''re releasing new music, connecting with fans, or building your career, we hope this St. Patrick''s Day brings you good fortune and success in all your musical endeavors. Here''s to celebrating with great music and continued growth!

🍀 Irish Blessings for Your Music

May your music bring you:
- Good fortune and success in your releases
- Growing audiences who love your art
- Opportunities to share your music with the world
- Joy and fulfillment in your creative journey

🎵 Celebrate with Music: St. Patrick''s Day is a perfect time to celebrate the power of music to bring people together, tell stories, and create connections across cultures. Your music has that same power, and we''re grateful to be part of helping you share it with the world!

Explore Platform: {{dashboard_url}}

Sláinte! We wish you a wonderful St. Patrick''s Day filled with music, celebration, and the luck of the Irish. May your music career continue to flourish, and may you find joy in every note you create and share. Here''s to your success and to many more milestones ahead!

Best regards,
The MSC & Co Team'
WHERE name = 'Holiday - St. Patrick''s Day';

-- 9. Holiday - Mother's Day
UPDATE marketing_email_templates
SET 
  subject_template = '💐 Happy Mother''s Day – Celebrate with Music!',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">💐 Happy Mother''s Day</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">This Mother''s Day, honor the special mothers in your life with the gift of music! Whether it''s your own mother, a mother figure, or if you''re a mother yourself, we want to celebrate the incredible love, support, and strength that mothers bring to our lives. Music has the power to express gratitude, celebrate relationships, and create lasting memories, making it the perfect way to show appreciation on this special day. Take this opportunity to share the gift of music and celebrate the mothers who have shaped who you are today.</p>
    
    <div style="background: #fef3c7; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f59e0b;">
      <h2 style="color: #92400e; margin-top: 0; font-size: 20px; font-weight: 600;">💝 Celebrate with Music</h2>
      <p style="color: #78350f; margin-bottom: 16px; line-height: 1.7;">This Mother''s Day, consider:</p>
      <ul style="margin: 0; padding-left: 25px; color: #78350f; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Sharing your music as a gift of love and appreciation</li>
        <li style="margin-bottom: 8px;">Creating a special playlist to celebrate mothers in your life</li>
        <li style="margin-bottom: 8px;">Honoring the mothers who have supported your musical journey</li>
        <li style="margin-bottom: 8px;">Using music to express gratitude and celebrate relationships</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>💕 A Special Day:</strong> Mother''s Day is a time to celebrate the incredible women who have nurtured, supported, and loved us. Music has a unique way of capturing emotions and memories, making it a perfect way to honor the mothers in our lives. Whether you''re sharing your own music, creating a playlist, or simply taking time to appreciate the mothers who have influenced you, we hope this day brings joy and connection.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{share_url}}" style="background: #f093fb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Share Music</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f093fb;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Happy Mother''s Day!</strong> We hope this special day brings joy, love, and beautiful moments with the mothers in your life. Thank you for being part of our community, and here''s to celebrating the incredible mothers who support, inspire, and love us unconditionally. May your day be filled with music, gratitude, and appreciation!</p>
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
  body_text_template = '💐 Happy Mother''s Day – Celebrate with Music!

Hi {{user_name}},

This Mother''s Day, honor the special mothers in your life with the gift of music! Whether it''s your own mother, a mother figure, or if you''re a mother yourself, we want to celebrate the incredible love, support, and strength that mothers bring to our lives. Music has the power to express gratitude, celebrate relationships, and create lasting memories, making it the perfect way to show appreciation on this special day. Take this opportunity to share the gift of music and celebrate the mothers who have shaped who you are today.

💝 Celebrate with Music

This Mother''s Day, consider:
- Sharing your music as a gift of love and appreciation
- Creating a special playlist to celebrate mothers in your life
- Honoring the mothers who have supported your musical journey
- Using music to express gratitude and celebrate relationships

💕 A Special Day: Mother''s Day is a time to celebrate the incredible women who have nurtured, supported, and loved us. Music has a unique way of capturing emotions and memories, making it a perfect way to honor the mothers in our lives. Whether you''re sharing your own music, creating a playlist, or simply taking time to appreciate the mothers who have influenced you, we hope this day brings joy and connection.

Share Music: {{share_url}}

Happy Mother''s Day! We hope this special day brings joy, love, and beautiful moments with the mothers in your life. Thank you for being part of our community, and here''s to celebrating the incredible mothers who support, inspire, and love us unconditionally. May your day be filled with music, gratitude, and appreciation!

Best regards,
The MSC & Co Team'
WHERE name = 'Holiday - Mother''s Day';

-- 10. Holiday - Father's Day
UPDATE marketing_email_templates
SET 
  subject_template = '👔 Happy Father''s Day – Gift the Music Lover!',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">👔 Happy Father''s Day</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Celebrate Father''s Day with the perfect music gift! Whether it''s your father, a father figure, or if you''re a father yourself, we want to honor the incredible dads who have shaped our lives with their love, guidance, and support. Music has a special way of bringing people together and creating lasting memories, making it the perfect gift to show appreciation for the fathers who have been there for us. This Father''s Day, celebrate with music and honor the dads who have inspired and supported you on your journey!</p>
    
    <div style="background: #e3f2fd; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #2196f3;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">🎁 Music Gifts for Dad</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">This Father''s Day, consider:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Sharing your music as a meaningful gift of appreciation</li>
        <li style="margin-bottom: 8px;">Creating a special playlist to celebrate the dads in your life</li>
        <li style="margin-bottom: 8px;">Honoring fathers who have supported your musical dreams</li>
        <li style="margin-bottom: 8px;">Using music to express gratitude and create memories</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>👨‍👧‍👦 A Day to Celebrate:</strong> Father''s Day is a time to honor the incredible fathers who have guided, supported, and loved us. Music has a unique ability to capture emotions, celebrate relationships, and create connections that last a lifetime. Whether you''re sharing your own music, creating a playlist, or simply taking time to appreciate the fathers who have influenced you, we hope this day brings joy and connection.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{gifts_url}}" style="background: #4facfe; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Shop Music Gifts</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #4facfe;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Happy Father''s Day!</strong> We hope this special day brings joy, appreciation, and beautiful moments with the fathers in your life. Thank you for being part of our community, and here''s to celebrating the incredible dads who support, inspire, and love us unconditionally. May your day be filled with music, gratitude, and celebration!</p>
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
  body_text_template = '👔 Happy Father''s Day – Gift the Music Lover!

Hi {{user_name}},

Celebrate Father''s Day with the perfect music gift! Whether it''s your father, a father figure, or if you''re a father yourself, we want to honor the incredible dads who have shaped our lives with their love, guidance, and support. Music has a special way of bringing people together and creating lasting memories, making it the perfect gift to show appreciation for the fathers who have been there for us. This Father''s Day, celebrate with music and honor the dads who have inspired and supported you on your journey!

🎁 Music Gifts for Dad

This Father''s Day, consider:
- Sharing your music as a meaningful gift of appreciation
- Creating a special playlist to celebrate the dads in your life
- Honoring fathers who have supported your musical dreams
- Using music to express gratitude and create memories

👨‍👧‍👦 A Day to Celebrate: Father''s Day is a time to honor the incredible fathers who have guided, supported, and loved us. Music has a unique ability to capture emotions, celebrate relationships, and create connections that last a lifetime. Whether you''re sharing your own music, creating a playlist, or simply taking time to appreciate the fathers who have influenced you, we hope this day brings joy and connection.

Shop Music Gifts: {{gifts_url}}

Happy Father''s Day! We hope this special day brings joy, appreciation, and beautiful moments with the fathers in your life. Thank you for being part of our community, and here''s to celebrating the incredible dads who support, inspire, and love us unconditionally. May your day be filled with music, gratitude, and celebration!

Best regards,
The MSC & Co Team'
WHERE name = 'Holiday - Father''s Day';

-- 11. Holiday - Labor Day
UPDATE marketing_email_templates
SET 
  subject_template = '👷 Labor Day – Celebrating Hard Work!',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">👷 Labor Day</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Happy Labor Day! Celebrating all the hard work and dedication you put into your music career. Labor Day is a time to recognize and honor the incredible effort, passion, and commitment that goes into building a successful music career. Every song you create, every release you put out, and every moment you spend honing your craft represents hard work that deserves to be celebrated. We want to take this opportunity to acknowledge the dedication and perseverance you show every day as you pursue your musical dreams.</p>
    
    <div style="background: #e3f2fd; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #2196f3;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">💪 Your Hard Work Matters</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">On Labor Day, we celebrate:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;">The countless hours you spend creating and perfecting your music</li>
        <li style="margin-bottom: 8px;">Your dedication to growing your audience and building your career</li>
        <li style="margin-bottom: 8px;">Your commitment to sharing your art with the world</li>
        <li style="margin-bottom: 8px;">The perseverance and resilience you show in pursuit of your dreams</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>🎵 Take Time to Rest:</strong> Labor Day is also a reminder that hard work deserves rest and celebration. Take this day to relax, recharge, and reflect on how far you''ve come. Your dedication to your craft is inspiring, and you deserve to celebrate your achievements. Rest well, and return to your music refreshed and ready for the next phase of your journey!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{dashboard_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Explore Platform</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Thank you for your hard work:</strong> We see the effort you put into your music career every single day, and we''re honored to be part of your journey. Your hard work, creativity, and dedication are what make the music industry so vibrant and inspiring. On this Labor Day, we celebrate you and all the incredible work you do. Enjoy your well-deserved rest, and here''s to continued success in your music career!</p>
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
  body_text_template = '👷 Labor Day – Celebrating Hard Work!

Hi {{user_name}},

Happy Labor Day! Celebrating all the hard work and dedication you put into your music career. Labor Day is a time to recognize and honor the incredible effort, passion, and commitment that goes into building a successful music career. Every song you create, every release you put out, and every moment you spend honing your craft represents hard work that deserves to be celebrated. We want to take this opportunity to acknowledge the dedication and perseverance you show every day as you pursue your musical dreams.

💪 Your Hard Work Matters

On Labor Day, we celebrate:
- The countless hours you spend creating and perfecting your music
- Your dedication to growing your audience and building your career
- Your commitment to sharing your art with the world
- The perseverance and resilience you show in pursuit of your dreams

🎵 Take Time to Rest: Labor Day is also a reminder that hard work deserves rest and celebration. Take this day to relax, recharge, and reflect on how far you''ve come. Your dedication to your craft is inspiring, and you deserve to celebrate your achievements. Rest well, and return to your music refreshed and ready for the next phase of your journey!

Explore Platform: {{dashboard_url}}

Thank you for your hard work: We see the effort you put into your music career every single day, and we''re honored to be part of your journey. Your hard work, creativity, and dedication are what make the music industry so vibrant and inspiring. On this Labor Day, we celebrate you and all the incredible work you do. Enjoy your well-deserved rest, and here''s to continued success in your music career!

Best regards,
The MSC & Co Team'
WHERE name = 'Holiday - Labor Day';

-- 12. Holiday - Memorial Day
UPDATE marketing_email_templates
SET 
  subject_template = '🇺🇸 Memorial Day – Honoring & Remembering',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #eb3349 0%, #1e3c72 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🇺🇸 Memorial Day</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">On this Memorial Day, we honor and remember those who served. Music brings us together in remembrance. This solemn day is an opportunity to reflect on the sacrifices made by brave men and women who have served our country, and to remember those who gave their lives for the freedoms we enjoy today. Music has always played an important role in honoring service members, bringing communities together, and providing comfort and inspiration during times of reflection. We join you in remembering and honoring those who have served.</p>
    
    <div style="background: #fff7ed; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f59e0b;">
      <h2 style="color: #92400e; margin-top: 0; font-size: 20px; font-weight: 600;">🎖️ Remembering Their Service</h2>
      <p style="color: #78350f; margin-bottom: 16px; line-height: 1.7;">On Memorial Day, we honor:</p>
      <ul style="margin: 0; padding-left: 25px; color: #78350f; line-height: 1.8;">
        <li style="margin-bottom: 8px;">The courage and sacrifice of those who served our country</li>
        <li style="margin-bottom: 8px;">The families who have lost loved ones in service</li>
        <li style="margin-bottom: 8px;">The values of freedom, honor, and service</li>
        <li style="margin-bottom: 8px;">The power of music to unite and inspire remembrance</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>🎵 Music of Remembrance:</strong> Throughout history, music has served as a powerful way to honor service members, express gratitude, and bring people together in remembrance. Whether through patriotic songs, tribute performances, or simply taking a moment of silence, music helps us connect with the significance of this day and honor those who have given so much.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{dashboard_url}}" style="background: #eb3349; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Explore Platform</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #eb3349;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>We remember and honor:</strong> On this Memorial Day, we join you in remembering and honoring those who have served our country. Their courage, sacrifice, and dedication will never be forgotten. May we all take a moment to reflect on their service and express our gratitude for the freedoms we enjoy today. We hope this day brings you peace, reflection, and a sense of connection to the greater community.</p>
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
  body_text_template = '🇺🇸 Memorial Day – Honoring & Remembering

Hi {{user_name}},

On this Memorial Day, we honor and remember those who served. Music brings us together in remembrance. This solemn day is an opportunity to reflect on the sacrifices made by brave men and women who have served our country, and to remember those who gave their lives for the freedoms we enjoy today. Music has always played an important role in honoring service members, bringing communities together, and providing comfort and inspiration during times of reflection. We join you in remembering and honoring those who have served.

🎖️ Remembering Their Service

On Memorial Day, we honor:
- The courage and sacrifice of those who served our country
- The families who have lost loved ones in service
- The values of freedom, honor, and service
- The power of music to unite and inspire remembrance

🎵 Music of Remembrance: Throughout history, music has served as a powerful way to honor service members, express gratitude, and bring people together in remembrance. Whether through patriotic songs, tribute performances, or simply taking a moment of silence, music helps us connect with the significance of this day and honor those who have given so much.

Explore Platform: {{dashboard_url}}

We remember and honor: On this Memorial Day, we join you in remembering and honoring those who have served our country. Their courage, sacrifice, and dedication will never be forgotten. May we all take a moment to reflect on their service and express our gratitude for the freedoms we enjoy today. We hope this day brings you peace, reflection, and a sense of connection to the greater community.

Best regards,
The MSC & Co Team'
WHERE name = 'Holiday - Memorial Day';

-- 13. Holiday - Diwali
UPDATE marketing_email_templates
SET 
  subject_template = '🪔 Happy Diwali – Festival of Lights!',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🪔 Happy Diwali</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Wishing you a joyous Diwali filled with light, music, and celebration! May this festival bring you prosperity. Diwali, the festival of lights, is a time of joy, hope, and renewal that celebrates the victory of light over darkness and good over evil. Just as the lights of Diwali illuminate homes and hearts, may your music continue to bring light, joy, and inspiration to all who hear it. We hope this Diwali brings you and your loved ones happiness, success, and countless blessings in your music career and beyond.</p>
    
    <div style="background: #fef3c7; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f59e0b;">
      <h2 style="color: #92400e; margin-top: 0; font-size: 20px; font-weight: 600;">✨ Festival of Lights</h2>
      <p style="color: #78350f; margin-bottom: 16px; line-height: 1.7;">This Diwali, may you be blessed with:</p>
      <ul style="margin: 0; padding-left: 25px; color: #78350f; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Prosperity and success in your music career</li>
        <li style="margin-bottom: 8px;">Joy and happiness in all your endeavors</li>
        <li style="margin-bottom: 8px;">Light and inspiration for your creative journey</li>
        <li style="margin-bottom: 8px;">Abundance and blessings in the year ahead</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>🎵 Music and Celebration:</strong> Diwali is a time of celebration, and music plays an integral role in this festival of lights. Just as the lights of Diwali brighten the darkness, may your music continue to bring light and joy to the world. We''re grateful to be part of your journey and wish you continued success and happiness!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{dashboard_url}}" style="background: #f5af19; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Explore Platform</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f5af19;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Happy Diwali!</strong> We hope this festival of lights brings you and your family immense joy, prosperity, and success. May the light of Diwali illuminate your path forward and bring you continued blessings in your music career. Thank you for being part of our community, and here''s to a bright and successful year ahead!</p>
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
  body_text_template = '🪔 Happy Diwali – Festival of Lights!

Hi {{user_name}},

Wishing you a joyous Diwali filled with light, music, and celebration! May this festival bring you prosperity. Diwali, the festival of lights, is a time of joy, hope, and renewal that celebrates the victory of light over darkness and good over evil. Just as the lights of Diwali illuminate homes and hearts, may your music continue to bring light, joy, and inspiration to all who hear it. We hope this Diwali brings you and your loved ones happiness, success, and countless blessings in your music career and beyond.

✨ Festival of Lights

This Diwali, may you be blessed with:
- Prosperity and success in your music career
- Joy and happiness in all your endeavors
- Light and inspiration for your creative journey
- Abundance and blessings in the year ahead

🎵 Music and Celebration: Diwali is a time of celebration, and music plays an integral role in this festival of lights. Just as the lights of Diwali brighten the darkness, may your music continue to bring light and joy to the world. We''re grateful to be part of your journey and wish you continued success and happiness!

Explore Platform: {{dashboard_url}}

Happy Diwali! We hope this festival of lights brings you and your family immense joy, prosperity, and success. May the light of Diwali illuminate your path forward and bring you continued blessings in your music career. Thank you for being part of our community, and here''s to a bright and successful year ahead!

Best regards,
The MSC & Co Team'
WHERE name = 'Holiday - Diwali';

-- 14. Holiday - Hanukkah
UPDATE marketing_email_templates
SET 
  subject_template = '🕎 Happy Hanukkah – Eight Nights of Music!',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🕎 Happy Hanukkah</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Wishing you a wonderful Hanukkah filled with light, joy, and beautiful music! Celebrate each night with melody. Hanukkah, the Festival of Lights, is a time of celebration, reflection, and gratitude that spans eight beautiful nights. Just as each candle on the menorah brings increasing light, may your music career continue to grow brighter with each new release, each new fan, and each new milestone you achieve. We hope this Hanukkah brings you and your family joy, success, and countless blessings in your musical journey.</p>
    
    <div style="background: #fef3c7; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f59e0b;">
      <h2 style="color: #92400e; margin-top: 0; font-size: 20px; font-weight: 600;">🕯️ Eight Nights of Celebration</h2>
      <p style="color: #78350f; margin-bottom: 16px; line-height: 1.7;">This Hanukkah, may you be blessed with:</p>
      <ul style="margin: 0; padding-left: 25px; color: #78350f; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Increasing light and success in your music career</li>
        <li style="margin-bottom: 8px;">Joy and celebration with family and loved ones</li>
        <li style="margin-bottom: 8px;">Miracles and blessings in your creative journey</li>
        <li style="margin-bottom: 8px;">Hope and inspiration for the year ahead</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>🎵 Music and Miracles:</strong> Music has always been an integral part of Hanukkah celebrations, from traditional songs to modern expressions of joy and gratitude. Just as the menorah''s light grows stronger each night, may your music continue to shine brighter and reach more hearts with each passing day. We''re grateful to be part of your journey!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{dashboard_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Explore Platform</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Chag Hanukkah Sameach!</strong> We hope this Festival of Lights brings you and your family immense joy, happiness, and success. May the light of the menorah illuminate your path forward and bring you continued blessings in your music career. Thank you for being part of our community, and here''s to a bright and successful year ahead!</p>
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
  body_text_template = '🕎 Happy Hanukkah – Eight Nights of Music!

Hi {{user_name}},

Wishing you a wonderful Hanukkah filled with light, joy, and beautiful music! Celebrate each night with melody. Hanukkah, the Festival of Lights, is a time of celebration, reflection, and gratitude that spans eight beautiful nights. Just as each candle on the menorah brings increasing light, may your music career continue to grow brighter with each new release, each new fan, and each new milestone you achieve. We hope this Hanukkah brings you and your family joy, success, and countless blessings in your musical journey.

🕯️ Eight Nights of Celebration

This Hanukkah, may you be blessed with:
- Increasing light and success in your music career
- Joy and celebration with family and loved ones
- Miracles and blessings in your creative journey
- Hope and inspiration for the year ahead

🎵 Music and Miracles: Music has always been an integral part of Hanukkah celebrations, from traditional songs to modern expressions of joy and gratitude. Just as the menorah''s light grows stronger each night, may your music continue to shine brighter and reach more hearts with each passing day. We''re grateful to be part of your journey!

Explore Platform: {{dashboard_url}}

Chag Hanukkah Sameach! We hope this Festival of Lights brings you and your family immense joy, happiness, and success. May the light of the menorah illuminate your path forward and bring you continued blessings in your music career. Thank you for being part of our community, and here''s to a bright and successful year ahead!

Best regards,
The MSC & Co Team'
WHERE name = 'Holiday - Hanukkah';

-- 15. Holiday - Chinese New Year
UPDATE marketing_email_templates
SET 
  subject_template = '🧧 Happy Chinese New Year!',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #eb3349 0%, #f5af19 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🧧 Happy Chinese New Year!</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Wishing you prosperity, happiness, and success in the Year of {{year_animal}}! May your music career flourish! Chinese New Year is a time of renewal, celebration, and hope that marks the beginning of a new lunar year. This vibrant festival celebrates tradition, family, and the promise of new beginnings. Just as the new year brings fresh opportunities and possibilities, may this Year of {{year_animal}} bring you success, growth, and fulfillment in your music career. We hope this celebration brings you joy, prosperity, and countless blessings in the year ahead.</p>
    
    <div style="background: #fff7ed; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f59e0b;">
      <h2 style="color: #92400e; margin-top: 0; font-size: 20px; font-weight: 600;">🐉 Year of {{year_animal}} Blessings</h2>
      <p style="color: #78350f; margin-bottom: 16px; line-height: 1.7;">In this new year, may you receive:</p>
      <ul style="margin: 0; padding-left: 25px; color: #78350f; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Prosperity and success in all your musical endeavors</li>
        <li style="margin-bottom: 8px;">Happiness and joy in your creative journey</li>
        <li style="margin-bottom: 8px;">Growth and opportunities to share your music</li>
        <li style="margin-bottom: 8px;">Good fortune and blessings throughout the year</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>🎵 Music and Celebration:</strong> Chinese New Year is celebrated with music, dance, and vibrant festivities that bring communities together. Just as this festival marks a new beginning, may your music continue to bring joy, connection, and celebration to all who hear it. We''re grateful to be part of your journey in this new year!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{dashboard_url}}" style="background: #eb3349; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Start the New Year</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #eb3349;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>恭喜发财! (Gōngxǐ fācái!)</strong> We hope this Chinese New Year brings you and your family immense joy, prosperity, and success. May the Year of {{year_animal}} be filled with opportunities, achievements, and countless blessings in your music career. Thank you for being part of our community, and here''s to a prosperous and successful new year!</p>
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
  body_text_template = '🧧 Happy Chinese New Year!

Hi {{user_name}},

Wishing you prosperity, happiness, and success in the Year of {{year_animal}}! May your music career flourish! Chinese New Year is a time of renewal, celebration, and hope that marks the beginning of a new lunar year. This vibrant festival celebrates tradition, family, and the promise of new beginnings. Just as the new year brings fresh opportunities and possibilities, may this Year of {{year_animal}} bring you success, growth, and fulfillment in your music career. We hope this celebration brings you joy, prosperity, and countless blessings in the year ahead.

🐉 Year of {{year_animal}} Blessings

In this new year, may you receive:
- Prosperity and success in all your musical endeavors
- Happiness and joy in your creative journey
- Growth and opportunities to share your music
- Good fortune and blessings throughout the year

🎵 Music and Celebration: Chinese New Year is celebrated with music, dance, and vibrant festivities that bring communities together. Just as this festival marks a new beginning, may your music continue to bring joy, connection, and celebration to all who hear it. We''re grateful to be part of your journey in this new year!

Start the New Year: {{dashboard_url}}

恭喜发财! (Gōngxǐ fācái!) We hope this Chinese New Year brings you and your family immense joy, prosperity, and success. May the Year of {{year_animal}} be filled with opportunities, achievements, and countless blessings in your music career. Thank you for being part of our community, and here''s to a prosperous and successful new year!

Best regards,
The MSC & Co Team'
WHERE name = 'Holiday - Chinese New Year';

-- 16. Holiday - Ramadan
UPDATE marketing_email_templates
SET 
  subject_template = '🌙 Ramadan Mubarak – Wishing You Peace',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🌙 Ramadan Mubarak</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Ramadan Mubarak! Wishing you peace, blessings, and spiritual growth during this holy month. Ramadan is a sacred time of reflection, prayer, and community that brings Muslims around the world together. It''s a period of spiritual renewal, self-discipline, and gratitude. During this holy month, may you find peace, clarity, and inspiration for your music, and may your creative journey be blessed with success and fulfillment. We hope this Ramadan brings you and your loved ones peace, blessings, and countless opportunities to share your art with the world.</p>
    
    <div style="background: #e3f2fd; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #2196f3;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">🕌 Holy Month Blessings</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">This Ramadan, may you receive:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Peace and spiritual growth in your journey</li>
        <li style="margin-bottom: 8px;">Blessings and success in your music career</li>
        <li style="margin-bottom: 8px;">Clarity and inspiration for your creative work</li>
        <li style="margin-bottom: 8px;">Gratitude and reflection on your achievements</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>🎵 Music and Reflection:</strong> During Ramadan, music often serves as a source of peace, inspiration, and connection. Whether through spiritual songs, contemplative melodies, or expressions of gratitude, music has the power to enhance the reflective nature of this holy month. May your music continue to bring peace and inspiration to all who hear it!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{dashboard_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Explore Platform</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Ramadan Mubarak!</strong> We hope this holy month brings you and your family peace, blessings, and spiritual fulfillment. May this time of reflection and gratitude bring you clarity, inspiration, and success in your music career. Thank you for being part of our community, and here''s to a blessed and prosperous Ramadan!</p>
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
  body_text_template = '🌙 Ramadan Mubarak – Wishing You Peace

Hi {{user_name}},

Ramadan Mubarak! Wishing you peace, blessings, and spiritual growth during this holy month. Ramadan is a sacred time of reflection, prayer, and community that brings Muslims around the world together. It''s a period of spiritual renewal, self-discipline, and gratitude. During this holy month, may you find peace, clarity, and inspiration for your music, and may your creative journey be blessed with success and fulfillment. We hope this Ramadan brings you and your loved ones peace, blessings, and countless opportunities to share your art with the world.

🕌 Holy Month Blessings

This Ramadan, may you receive:
- Peace and spiritual growth in your journey
- Blessings and success in your music career
- Clarity and inspiration for your creative work
- Gratitude and reflection on your achievements

🎵 Music and Reflection: During Ramadan, music often serves as a source of peace, inspiration, and connection. Whether through spiritual songs, contemplative melodies, or expressions of gratitude, music has the power to enhance the reflective nature of this holy month. May your music continue to bring peace and inspiration to all who hear it!

Explore Platform: {{dashboard_url}}

Ramadan Mubarak! We hope this holy month brings you and your family peace, blessings, and spiritual fulfillment. May this time of reflection and gratitude bring you clarity, inspiration, and success in your music career. Thank you for being part of our community, and here''s to a blessed and prosperous Ramadan!

Best regards,
The MSC & Co Team'
WHERE name = 'Holiday - Ramadan';

-- 17. Holiday - International Women's Day
UPDATE marketing_email_templates
SET 
  subject_template = '👩‍🎤 International Women''s Day – Celebrating You!',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">👩‍🎤 International Women''s Day</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Happy International Women''s Day! Today we celebrate the incredible women in music and honor your achievements. International Women''s Day is a global celebration of the social, economic, cultural, and political achievements of women, and a call to action for accelerating gender equality. In the music industry, women have always been at the forefront of creativity, innovation, and change, breaking barriers and shaping the sound of generations. We want to take this moment to celebrate you, honor your contributions, and recognize the incredible impact women make in music every single day.</p>
    
    <div style="background: #fef3c7; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f59e0b;">
      <h2 style="color: #92400e; margin-top: 0; font-size: 20px; font-weight: 600;">💪 Celebrating Women in Music</h2>
      <p style="color: #78350f; margin-bottom: 16px; line-height: 1.7;">Today we honor:</p>
      <ul style="margin: 0; padding-left: 25px; color: #78350f; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Your creativity, talent, and artistic vision</li>
        <li style="margin-bottom: 8px;">Your courage in breaking barriers and forging new paths</li>
        <li style="margin-bottom: 8px;">Your contributions to shaping the music industry</li>
        <li style="margin-bottom: 8px;">Your strength, resilience, and determination to succeed</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>🎵 Your Voice Matters:</strong> Women in music have always used their voices to inspire, challenge, and transform. Your music has the power to break barriers, challenge stereotypes, and create change. On this International Women''s Day, we celebrate your voice, your art, and your journey. Keep making your mark on the world!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{dashboard_url}}" style="background: #f093fb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Explore Platform</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f093fb;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Here''s to you:</strong> International Women''s Day is a reminder of how far we''ve come and how much further we can go together. We''re honored to support women in music and celebrate the incredible achievements, talent, and impact that women bring to the industry every day. Thank you for being part of our community, and here''s to continuing to break barriers and create change!</p>
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
  body_text_template = '👩‍🎤 International Women''s Day – Celebrating You!

Hi {{user_name}},

Happy International Women''s Day! Today we celebrate the incredible women in music and honor your achievements. International Women''s Day is a global celebration of the social, economic, cultural, and political achievements of women, and a call to action for accelerating gender equality. In the music industry, women have always been at the forefront of creativity, innovation, and change, breaking barriers and shaping the sound of generations. We want to take this moment to celebrate you, honor your contributions, and recognize the incredible impact women make in music every single day.

💪 Celebrating Women in Music

Today we honor:
- Your creativity, talent, and artistic vision
- Your courage in breaking barriers and forging new paths
- Your contributions to shaping the music industry
- Your strength, resilience, and determination to succeed

🎵 Your Voice Matters: Women in music have always used their voices to inspire, challenge, and transform. Your music has the power to break barriers, challenge stereotypes, and create change. On this International Women''s Day, we celebrate your voice, your art, and your journey. Keep making your mark on the world!

Explore Platform: {{dashboard_url}}

Here''s to you: International Women''s Day is a reminder of how far we''ve come and how much further we can go together. We''re honored to support women in music and celebrate the incredible achievements, talent, and impact that women bring to the industry every day. Thank you for being part of our community, and here''s to continuing to break barriers and create change!

Best regards,
The MSC & Co Team'
WHERE name = 'Holiday - International Women''s Day';

-- 18. Holiday - Pride Month
UPDATE marketing_email_templates
SET 
  subject_template = '🌈 Pride Month – Celebrate Love & Diversity!',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🌈 Pride Month</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Happy Pride Month! Celebrating love, diversity, and the LGBTQ+ community in music. Pride Month is a time to celebrate the incredible contributions, achievements, and voices of the LGBTQ+ community in music and beyond. It''s a celebration of authenticity, courage, and the power of being true to who you are. Music has always been a powerful tool for expression, acceptance, and change, and we''re honored to support LGBTQ+ artists who use their voices to inspire, educate, and bring people together. This Pride Month, we celebrate you, your authentic voice, and the beautiful diversity that makes music so powerful.</p>
    
    <div style="background: #fef3c7; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f59e0b;">
      <h2 style="color: #92400e; margin-top: 0; font-size: 20px; font-weight: 600;">🎵 Celebrating Authenticity</h2>
      <p style="color: #78350f; margin-bottom: 16px; line-height: 1.7;">This Pride Month, we celebrate:</p>
      <ul style="margin: 0; padding-left: 25px; color: #78350f; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Your authentic voice and artistic expression</li>
        <li style="margin-bottom: 8px;">The courage to be true to who you are</li>
        <li style="margin-bottom: 8px;">Your contributions to music and culture</li>
        <li style="margin-bottom: 8px;">The power of diversity and inclusion in music</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>🌟 Your Voice Matters:</strong> Music has always been a powerful force for change, acceptance, and celebration. Your authentic voice, your story, and your art matter. During Pride Month and every month, we''re here to support you, celebrate you, and amplify your voice. Keep being true to yourself and sharing your music with the world!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{dashboard_url}}" style="background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Explore Platform</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #ff6b6b;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Happy Pride!</strong> We''re proud to support and celebrate the LGBTQ+ community in music. Your authenticity, creativity, and courage inspire us all. This Pride Month, we honor you, your voice, and the incredible contributions LGBTQ+ artists make to music every single day. Thank you for being part of our community, and here''s to continuing to celebrate love, diversity, and authenticity!</p>
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
  body_text_template = '🌈 Pride Month – Celebrate Love & Diversity!

Hi {{user_name}},

Happy Pride Month! Celebrating love, diversity, and the LGBTQ+ community in music. Pride Month is a time to celebrate the incredible contributions, achievements, and voices of the LGBTQ+ community in music and beyond. It''s a celebration of authenticity, courage, and the power of being true to who you are. Music has always been a powerful tool for expression, acceptance, and change, and we''re honored to support LGBTQ+ artists who use their voices to inspire, educate, and bring people together. This Pride Month, we celebrate you, your authentic voice, and the beautiful diversity that makes music so powerful.

🎵 Celebrating Authenticity

This Pride Month, we celebrate:
- Your authentic voice and artistic expression
- The courage to be true to who you are
- Your contributions to music and culture
- The power of diversity and inclusion in music

🌟 Your Voice Matters: Music has always been a powerful force for change, acceptance, and celebration. Your authentic voice, your story, and your art matter. During Pride Month and every month, we''re here to support you, celebrate you, and amplify your voice. Keep being true to yourself and sharing your music with the world!

Explore Platform: {{dashboard_url}}

Happy Pride! We''re proud to support and celebrate the LGBTQ+ community in music. Your authenticity, creativity, and courage inspire us all. This Pride Month, we honor you, your voice, and the incredible contributions LGBTQ+ artists make to music every single day. Thank you for being part of our community, and here''s to continuing to celebrate love, diversity, and authenticity!

Best regards,
The MSC & Co Team'
WHERE name = 'Holiday - Pride Month';

-- 19. Holiday - Earth Day
UPDATE marketing_email_templates
SET 
  subject_template = '🌍 Happy Earth Day – Music for Our Planet!',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🌍 Happy Earth Day</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">On Earth Day, we celebrate our planet and the music that connects us all to nature. Earth Day is a global celebration that raises awareness about environmental protection and sustainability. It''s a day to reflect on our connection to the planet and take action to protect it for future generations. Music has the power to inspire environmental consciousness, unite people around common causes, and create positive change. At MSC & Co, we''re committed to protecting our planet while empowering artists, and we''re grateful to have you as part of our eco-conscious community. Together, we can make a difference!</p>
    
    <div style="background: #f0fdf4; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #10b981;">
      <h2 style="color: #065f46; margin-top: 0; font-size: 20px; font-weight: 600;">🌱 Our Planet, Our Responsibility</h2>
      <p style="color: #047857; margin-bottom: 16px; line-height: 1.7;">This Earth Day, let''s commit to:</p>
      <ul style="margin: 0; padding-left: 25px; color: #047857; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Protecting our planet for future generations</li>
        <li style="margin-bottom: 8px;">Supporting sustainable practices in music</li>
        <li style="margin-bottom: 8px;">Using music to raise environmental awareness</li>
        <li style="margin-bottom: 8px;">Making conscious choices that benefit the Earth</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>🎵 Music for Change:</strong> Music has always been a powerful force for raising awareness and inspiring action. Your music can help educate, inspire, and motivate people to care for our planet. Together, through music and conscious action, we can create a more sustainable future for everyone!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{dashboard_url}}" style="background: #2ecc71; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Explore Green Initiatives</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #2ecc71;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Together for our planet:</strong> Earth Day reminds us that we all share this beautiful planet and have a responsibility to protect it. At MSC & Co, we''re committed to sustainability and environmental responsibility, and we''re grateful to have you as part of our mission. Together, through music and conscious action, we can create a better, more sustainable world. Happy Earth Day, and thank you for being part of our eco-conscious community!</p>
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
  body_text_template = '🌍 Happy Earth Day – Music for Our Planet!

Hi {{user_name}},

On Earth Day, we celebrate our planet and the music that connects us all to nature. Earth Day is a global celebration that raises awareness about environmental protection and sustainability. It''s a day to reflect on our connection to the planet and take action to protect it for future generations. Music has the power to inspire environmental consciousness, unite people around common causes, and create positive change. At MSC & Co, we''re committed to protecting our planet while empowering artists, and we''re grateful to have you as part of our eco-conscious community. Together, we can make a difference!

🌱 Our Planet, Our Responsibility

This Earth Day, let''s commit to:
- Protecting our planet for future generations
- Supporting sustainable practices in music
- Using music to raise environmental awareness
- Making conscious choices that benefit the Earth

🎵 Music for Change: Music has always been a powerful force for raising awareness and inspiring action. Your music can help educate, inspire, and motivate people to care for our planet. Together, through music and conscious action, we can create a more sustainable future for everyone!

Explore Green Initiatives: {{dashboard_url}}

Together for our planet: Earth Day reminds us that we all share this beautiful planet and have a responsibility to protect it. At MSC & Co, we''re committed to sustainability and environmental responsibility, and we''re grateful to have you as part of our mission. Together, through music and conscious action, we can create a better, more sustainable world. Happy Earth Day, and thank you for being part of our eco-conscious community!

Best regards,
The MSC & Co Team'
WHERE name = 'Holiday - Earth Day';

-- 20. Holiday - Black History Month
UPDATE marketing_email_templates
SET 
  subject_template = '✊ Black History Month – Celebrating Excellence!',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">✊ Black History Month</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Honoring the incredible contributions of Black artists to music history. Your legacy inspires us all! Black History Month is a time to celebrate, honor, and recognize the profound contributions, achievements, and cultural impact of Black people throughout history and today. In music, Black artists have been pioneers, innovators, and visionaries who have shaped every genre and transformed the industry. From jazz and blues to hip-hop, R&B, rock, and beyond, Black musicians have created the soundtrack of our lives and continue to push boundaries, break barriers, and inspire generations. We honor and celebrate you!</p>
    
    <div style="background: #e3f2fd; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #2196f3;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">🎵 Celebrating Black Excellence</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">This month, we honor:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;">The trailblazing artists who shaped music history</li>
        <li style="margin-bottom: 8px;">Your creativity, innovation, and artistic excellence</li>
        <li style="margin-bottom: 8px;">The cultural impact and legacy of Black music</li>
        <li style="margin-bottom: 8px;">The continued contributions to music and culture</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>🌟 Your Legacy Matters:</strong> Black History Month is a reminder of the incredible contributions Black artists have made to music and culture. Your voice, your art, and your story are part of this rich legacy. We celebrate you, honor your contributions, and recognize the powerful impact you continue to make in music every single day!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{dashboard_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Explore History</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Celebrating Black excellence:</strong> Black History Month is a time to reflect on the past, celebrate the present, and look forward to the future. We''re honored to support Black artists and celebrate the incredible contributions, talent, and impact you bring to music and culture. Your legacy inspires us all, and we''re grateful to be part of your journey. Thank you for being part of our community!</p>
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
  body_text_template = '✊ Black History Month – Celebrating Excellence!

Hi {{user_name}},

Honoring the incredible contributions of Black artists to music history. Your legacy inspires us all! Black History Month is a time to celebrate, honor, and recognize the profound contributions, achievements, and cultural impact of Black people throughout history and today. In music, Black artists have been pioneers, innovators, and visionaries who have shaped every genre and transformed the industry. From jazz and blues to hip-hop, R&B, rock, and beyond, Black musicians have created the soundtrack of our lives and continue to push boundaries, break barriers, and inspire generations. We honor and celebrate you!

🎵 Celebrating Black Excellence

This month, we honor:
- The trailblazing artists who shaped music history
- Your creativity, innovation, and artistic excellence
- The cultural impact and legacy of Black music
- The continued contributions to music and culture

🌟 Your Legacy Matters: Black History Month is a reminder of the incredible contributions Black artists have made to music and culture. Your voice, your art, and your story are part of this rich legacy. We celebrate you, honor your contributions, and recognize the powerful impact you continue to make in music every single day!

Explore History: {{dashboard_url}}

Celebrating Black excellence: Black History Month is a time to reflect on the past, celebrate the present, and look forward to the future. We''re honored to support Black artists and celebrate the incredible contributions, talent, and impact you bring to music and culture. Your legacy inspires us all, and we''re grateful to be part of your journey. Thank you for being part of our community!

Best regards,
The MSC & Co Team'
WHERE name = 'Holiday - Black History Month';

-- 21. Holiday - Hispanic Heritage Month
UPDATE marketing_email_templates
SET 
  subject_template = '🎸 Hispanic Heritage Month – ¡Celebramos!',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🎸 Hispanic Heritage Month</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Celebrating Hispanic Heritage Month! Honoring the rich musical traditions and contributions of Hispanic artists. Hispanic Heritage Month is a time to celebrate the histories, cultures, and contributions of Hispanic and Latino Americans to the United States and beyond. In music, Hispanic and Latino artists have created some of the most vibrant, influential, and beloved genres and sounds in the world. From Latin music to reggaeton, salsa, bachata, mariachi, and countless other styles, Hispanic musicians have shaped the global music landscape and continue to innovate, inspire, and bring communities together through the power of music. ¡Celebramos tu talento!</p>
    
    <div style="background: #fff7ed; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f59e0b;">
      <h2 style="color: #92400e; margin-top: 0; font-size: 20px; font-weight: 600;">🎵 Celebrating Hispanic Heritage</h2>
      <p style="color: #78350f; margin-bottom: 16px; line-height: 1.7;">This month, we honor:</p>
      <ul style="margin: 0; padding-left: 25px; color: #78350f; line-height: 1.8;">
        <li style="margin-bottom: 8px;">The rich musical traditions and cultural heritage</li>
        <li style="margin-bottom: 8px;">Your creativity, passion, and artistic excellence</li>
        <li style="margin-bottom: 8px;">The impact and influence of Hispanic music globally</li>
        <li style="margin-bottom: 8px;">The continued contributions to music and culture</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>🌟 Tu Música Importa:</strong> Hispanic Heritage Month is a celebration of the incredible contributions Hispanic and Latino artists make to music and culture. Your voice, your heritage, and your art are part of this beautiful tapestry. We celebrate you, honor your contributions, and recognize the powerful impact you continue to make in music every single day!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{dashboard_url}}" style="background: #f5af19; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Explore Heritage</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f5af19;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>¡Celebramos tu talento!</strong> Hispanic Heritage Month is a time to honor the past, celebrate the present, and look forward to the future. We''re honored to support Hispanic and Latino artists and celebrate the incredible contributions, talent, and impact you bring to music and culture. Your heritage, your voice, and your art inspire us all, and we''re grateful to be part of your journey. Thank you for being part of our community!</p>
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
  body_text_template = '🎸 Hispanic Heritage Month – ¡Celebramos!

Hi {{user_name}},

Celebrating Hispanic Heritage Month! Honoring the rich musical traditions and contributions of Hispanic artists. Hispanic Heritage Month is a time to celebrate the histories, cultures, and contributions of Hispanic and Latino Americans to the United States and beyond. In music, Hispanic and Latino artists have created some of the most vibrant, influential, and beloved genres and sounds in the world. From Latin music to reggaeton, salsa, bachata, mariachi, and countless other styles, Hispanic musicians have shaped the global music landscape and continue to innovate, inspire, and bring communities together through the power of music. ¡Celebramos tu talento!

🎵 Celebrating Hispanic Heritage

This month, we honor:
- The rich musical traditions and cultural heritage
- Your creativity, passion, and artistic excellence
- The impact and influence of Hispanic music globally
- The continued contributions to music and culture

🌟 Tu Música Importa: Hispanic Heritage Month is a celebration of the incredible contributions Hispanic and Latino artists make to music and culture. Your voice, your heritage, and your art are part of this beautiful tapestry. We celebrate you, honor your contributions, and recognize the powerful impact you continue to make in music every single day!

Explore Heritage: {{dashboard_url}}

¡Celebramos tu talento! Hispanic Heritage Month is a time to honor the past, celebrate the present, and look forward to the future. We''re honored to support Hispanic and Latino artists and celebrate the incredible contributions, talent, and impact you bring to music and culture. Your heritage, your voice, and your art inspire us all, and we''re grateful to be part of your journey. Thank you for being part of our community!

Best regards,
The MSC & Co Team'
WHERE name = 'Holiday - Hispanic Heritage Month';

-- 22. Holiday - New Year's Eve
UPDATE marketing_email_templates
SET 
  subject_template = '🎊 New Year''s Eve – Ring in the New Year!',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🎊 New Year''s Eve</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">As the year comes to a close, we''re excited for what''s ahead! Here''s to new beginnings and great music! New Year''s Eve is a magical moment that marks the end of one chapter and the beginning of another. It''s a time to reflect on the year that''s passed, celebrate your achievements, and look forward with hope and excitement to all the possibilities the new year holds. As we countdown to midnight, we want to take a moment to thank you for being part of our community and to celebrate all that you''ve accomplished. The new year is full of opportunities for growth, creativity, and success, and we can''t wait to see what amazing things you''ll achieve!</p>
    
    <div style="background: #fef3c7; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f59e0b;">
      <h2 style="color: #92400e; margin-top: 0; font-size: 20px; font-weight: 600;">⏰ Countdown to Greatness</h2>
      <p style="color: #78350f; margin-bottom: 16px; line-height: 1.7;">As you prepare for the new year:</p>
      <ul style="margin: 0; padding-left: 25px; color: #78350f; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Reflect on your achievements and growth this year</li>
        <li style="margin-bottom: 8px;">Set ambitious goals for the year ahead</li>
        <li style="margin-bottom: 8px;">Plan new releases and creative projects</li>
        <li style="margin-bottom: 8px;">Embrace new opportunities and possibilities</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>🎵 Music for the Moment:</strong> New Year''s Eve is often celebrated with music, bringing people together to countdown and ring in the new year. Whether you''re performing, releasing music, or simply celebrating, music is the soundtrack to this special moment. May your music continue to bring joy, connection, and celebration to all who hear it!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{dashboard_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Plan for Next Year</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Here''s to the new year:</strong> As we say goodbye to this year and welcome the next, we want to thank you for being part of our community. Your creativity, dedication, and passion inspire us all. The new year is full of possibilities, opportunities, and fresh starts. We''re excited to continue supporting you on your journey and can''t wait to see what amazing things you''ll accomplish. Happy New Year''s Eve, and here''s to an incredible year ahead!</p>
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
  body_text_template = '🎊 New Year''s Eve – Ring in the New Year!

Hi {{user_name}},

As the year comes to a close, we''re excited for what''s ahead! Here''s to new beginnings and great music! New Year''s Eve is a magical moment that marks the end of one chapter and the beginning of another. It''s a time to reflect on the year that''s passed, celebrate your achievements, and look forward with hope and excitement to all the possibilities the new year holds. As we countdown to midnight, we want to take a moment to thank you for being part of our community and to celebrate all that you''ve accomplished. The new year is full of opportunities for growth, creativity, and success, and we can''t wait to see what amazing things you''ll achieve!

⏰ Countdown to Greatness

As you prepare for the new year:
- Reflect on your achievements and growth this year
- Set ambitious goals for the year ahead
- Plan new releases and creative projects
- Embrace new opportunities and possibilities

🎵 Music for the Moment: New Year''s Eve is often celebrated with music, bringing people together to countdown and ring in the new year. Whether you''re performing, releasing music, or simply celebrating, music is the soundtrack to this special moment. May your music continue to bring joy, connection, and celebration to all who hear it!

Plan for Next Year: {{dashboard_url}}

Here''s to the new year: As we say goodbye to this year and welcome the next, we want to thank you for being part of our community. Your creativity, dedication, and passion inspire us all. The new year is full of possibilities, opportunities, and fresh starts. We''re excited to continue supporting you on your journey and can''t wait to see what amazing things you''ll accomplish. Happy New Year''s Eve, and here''s to an incredible year ahead!

Best regards,
The MSC & Co Team'
WHERE name = 'Holiday - New Year''s Eve';

-- 23. Holiday - Summer Solstice
UPDATE marketing_email_templates
SET 
  subject_template = '☀️ Summer Solstice – Longest Day, Best Music!',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">☀️ Summer Solstice</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Happy Summer Solstice! Celebrate the longest day of the year with amazing music! The summer solstice marks the longest day of the year, a time when the sun reaches its highest point in the sky and daylight stretches to its maximum. It''s a moment of peak light, energy, and possibility. Just as the sun reaches its zenith, may your music career continue to reach new heights and shine brighter than ever. Summer is a time of vibrancy, growth, and celebration, making it the perfect season to release new music, connect with fans, and make the most of the longer days. We hope this summer solstice brings you energy, inspiration, and endless possibilities!</p>
    
    <div style="background: #fff7ed; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f59e0b;">
      <h2 style="color: #92400e; margin-top: 0; font-size: 20px; font-weight: 600;">🌞 Summer Energy</h2>
      <p style="color: #78350f; margin-bottom: 16px; line-height: 1.7;">This summer solstice, embrace:</p>
      <ul style="margin: 0; padding-left: 25px; color: #78350f; line-height: 1.8;">
        <li style="margin-bottom: 8px;">The longest day to work on your music projects</li>
        <li style="margin-bottom: 8px;">Summer vibes perfect for releasing new music</li>
        <li style="margin-bottom: 8px;">Festival season and live performance opportunities</li>
        <li style="margin-bottom: 8px;">The energy and growth that summer brings</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>🎵 Music for Summer:</strong> Summer and music go hand in hand! From festival season to beach playlists, summer is when music truly comes alive. The summer solstice is the perfect time to release new music, plan summer tours, or create songs that capture the energy and joy of the season. Make the most of this longest day and the summer ahead!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{dashboard_url}}" style="background: #f5af19; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Explore Summer Releases</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f5af19;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Happy Summer Solstice!</strong> We hope this longest day of the year brings you energy, inspiration, and endless possibilities. Summer is a vibrant, exciting time for music, and we''re excited to see what amazing things you''ll create and share during this season. Thank you for being part of our community, and here''s to a bright, successful summer filled with music, growth, and celebration!</p>
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
  body_text_template = '☀️ Summer Solstice – Longest Day, Best Music!

Hi {{user_name}},

Happy Summer Solstice! Celebrate the longest day of the year with amazing music! The summer solstice marks the longest day of the year, a time when the sun reaches its highest point in the sky and daylight stretches to its maximum. It''s a moment of peak light, energy, and possibility. Just as the sun reaches its zenith, may your music career continue to reach new heights and shine brighter than ever. Summer is a time of vibrancy, growth, and celebration, making it the perfect season to release new music, connect with fans, and make the most of the longer days. We hope this summer solstice brings you energy, inspiration, and endless possibilities!

🌞 Summer Energy

This summer solstice, embrace:
- The longest day to work on your music projects
- Summer vibes perfect for releasing new music
- Festival season and live performance opportunities
- The energy and growth that summer brings

🎵 Music for Summer: Summer and music go hand in hand! From festival season to beach playlists, summer is when music truly comes alive. The summer solstice is the perfect time to release new music, plan summer tours, or create songs that capture the energy and joy of the season. Make the most of this longest day and the summer ahead!

Explore Summer Releases: {{dashboard_url}}

Happy Summer Solstice! We hope this longest day of the year brings you energy, inspiration, and endless possibilities. Summer is a vibrant, exciting time for music, and we''re excited to see what amazing things you''ll create and share during this season. Thank you for being part of our community, and here''s to a bright, successful summer filled with music, growth, and celebration!

Best regards,
The MSC & Co Team'
WHERE name = 'Holiday - Summer Solstice';

-- ===========================================
-- UPDATE COMPLETE
-- ===========================================
-- Updated all 23 holiday templates with enhanced content:
-- 1. Holiday - New Year
-- 2. Holiday - Valentine's Day
-- 3. Holiday - Easter
-- 4. Holiday - Independence Day
-- 5. Holiday - Halloween
-- 6. Holiday - Thanksgiving
-- 7. Holiday - Christmas
-- 8. Holiday - St. Patrick's Day
-- 9. Holiday - Mother's Day
-- 10. Holiday - Father's Day
-- 11. Holiday - Labor Day
-- 12. Holiday - Memorial Day
-- 13. Holiday - Diwali
-- 14. Holiday - Hanukkah
-- 15. Holiday - Chinese New Year
-- 16. Holiday - Ramadan
-- 17. Holiday - International Women's Day
-- 18. Holiday - Pride Month
-- 19. Holiday - Earth Day
-- 20. Holiday - Black History Month
-- 21. Holiday - Hispanic Heritage Month
-- 22. Holiday - New Year's Eve
-- 23. Holiday - Summer Solstice
-- ===========================================

