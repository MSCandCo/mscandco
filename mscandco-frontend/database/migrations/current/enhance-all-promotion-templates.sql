-- ===========================================
-- ENHANCE ALL PROMOTION TEMPLATES
-- More elaborate, relational, and professional content
-- ===========================================
-- Date: 2025-01-28
-- Purpose: Update all promotion templates with enhanced content and consistent styling
-- Total Templates Updated: 20
-- ===========================================
-- 
-- STYLING APPLIED:
-- - Header h1: 22px font-size (or appropriate for promotions), 24px padding, line-height: 1.3
-- - Body text: 14px font-size
-- - Signature: 14px font-size, #4a5568 color
-- - Buttons: 14px font-size
-- - Footer: 60px logo, "Empowering Artists. Protecting the Planet." slogan
-- - No logo in header
-- ===========================================

-- 1. Promotion - Black Friday
UPDATE marketing_email_templates
SET 
  subject_template = '🛍️ Black Friday Deal: {{discount_percent}}% Off – Limited Time Only!',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: #ff4444; margin: 0; font-size: 22px; font-weight: bold; line-height: 1.3;">BLACK FRIDAY</h1>
    <p style="color: white; margin: 10px 0 0 0; font-size: 18px; font-weight: 600;">{{discount_percent}}% OFF</p>
    <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0 0; font-size: 14px;">Limited Time Only</p>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">The biggest sale of the year is here! We''re thrilled to offer you an exclusive Black Friday deal that gives you incredible savings on everything MSC & Co has to offer. This is your opportunity to unlock premium features, maximize your music distribution potential, and take your career to the next level – all while saving significantly.</p>
    
    <div style="background: #ff4444; color: white; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center;">
      <p style="font-size: 48px; margin: 0; font-weight: bold; line-height: 1;">{{discount_percent}}%</p>
      <p style="font-size: 20px; margin: 10px 0 0 0; font-weight: 600;">OFF ALL SUBSCRIPTIONS</p>
      <p style="font-size: 14px; margin: 15px 0 0 0; opacity: 0.9;">Use code: <strong style="font-size: 16px;">{{promo_code}}</strong></p>
    </div>
    
    <div style="background: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; border-radius: 4px; margin: 30px 0;">
      <p style="margin: 0; color: #856404; font-weight: 600; font-size: 14px;">⏰ Offer Ends:</p>
      <p style="margin: 10px 0 0 0; color: #856404; font-size: 18px; font-weight: bold;">{{offer_end_date}}</p>
      <p style="margin: 10px 0 0 0; color: #856404; font-size: 14px; line-height: 1.7;">Don''t wait – this exclusive Black Friday deal is available for a limited time only. Once it''s gone, it''s gone!</p>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>🎯 What You Get:</strong> With this Black Friday deal, you''ll unlock access to premium features, priority support, advanced analytics, and all the tools you need to grow your music career. Whether you''re looking to distribute more releases, access better marketing tools, or unlock exclusive platform features, now is the perfect time to invest in your success.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{promo_url}}" style="background: #1a1a1a; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; letter-spacing: 0.5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">CLAIM YOUR DEAL NOW</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #ff4444;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Limited Availability:</strong> This offer is exclusive, time-sensitive, and won''t last long. We''ve extended this special pricing as our way of saying thank you for being part of the MSC & Co community. Take advantage of these savings today and invest in tools that will help you achieve your music goals.</p>
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
  body_text_template = '🛍️ Black Friday Deal: {{discount_percent}}% Off – Limited Time Only!

Hi {{user_name}},

The biggest sale of the year is here! We''re thrilled to offer you an exclusive Black Friday deal that gives you incredible savings on everything MSC & Co has to offer. This is your opportunity to unlock premium features, maximize your music distribution potential, and take your career to the next level – all while saving significantly.

{{discount_percent}}% OFF ALL SUBSCRIPTIONS
Use code: {{promo_code}}

⏰ Offer Ends: {{offer_end_date}}
Don''t wait – this exclusive Black Friday deal is available for a limited time only. Once it''s gone, it''s gone!

🎯 What You Get: With this Black Friday deal, you''ll unlock access to premium features, priority support, advanced analytics, and all the tools you need to grow your music career. Whether you''re looking to distribute more releases, access better marketing tools, or unlock exclusive platform features, now is the perfect time to invest in your success.

CLAIM YOUR DEAL NOW: {{promo_url}}

Limited Availability: This offer is exclusive, time-sensitive, and won''t last long. We''ve extended this special pricing as our way of saying thank you for being part of the MSC & Co community. Take advantage of these savings today and invest in tools that will help you achieve your music goals.

Best regards,
The MSC & Co Team'
WHERE name = 'Promotion - Black Friday';

-- 2. Promotion - Cyber Monday
UPDATE marketing_email_templates
SET 
  subject_template = '💻 Cyber Monday – Exclusive Digital Services Deal!',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">💻 CYBER MONDAY</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Cyber Monday is here, and we''re bringing you exclusive deals on premium digital services that can transform your music career! This is the perfect opportunity to unlock powerful features, expand your distribution capabilities, and access marketing tools that will help you reach new audiences. As a member of the MSC & Co community, you have access to special pricing that''s only available today – don''t miss out on these incredible savings that can help you achieve your music goals faster and more effectively.</p>
    
    <div style="background: #e3f2fd; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #2196f3;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">🎁 Cyber Monday Deals</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">Exclusive savings on everything you need:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;"><strong>Premium subscriptions:</strong> Save on powerful tools and features that accelerate your success</li>
        <li style="margin-bottom: 8px;"><strong>Distribution upgrades:</strong> Expand your reach with enhanced distribution options at special pricing</li>
        <li style="margin-bottom: 8px;"><strong>Marketing campaigns:</strong> Access professional marketing tools at discounted rates</li>
        <li style="margin-bottom: 8px;"><strong>Analytics features:</strong> Unlock advanced insights and reporting capabilities</li>
      </ul>
    </div>
    
    <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #92400e; line-height: 1.7; font-size: 14px;"><strong>⏰ Limited Time:</strong> Cyber Monday deals are available today only. This is your chance to invest in your music career with significant savings. Once today ends, these prices won''t be available again until next year!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{promo_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Shop Cyber Monday Deals</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Digital tools for digital success:</strong> Cyber Monday is all about investing in the digital tools and services that help you succeed in today''s music industry. Whether you''re looking to expand your distribution, enhance your marketing, or unlock advanced features, today''s deals make it more accessible than ever. Shop now and take your music career to the next level!</p>
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
  body_text_template = '💻 Cyber Monday – Exclusive Digital Services Deal!

Hi {{user_name}},

Cyber Monday is here, and we''re bringing you exclusive deals on premium digital services that can transform your music career! This is the perfect opportunity to unlock powerful features, expand your distribution capabilities, and access marketing tools that will help you reach new audiences. As a member of the MSC & Co community, you have access to special pricing that''s only available today – don''t miss out on these incredible savings that can help you achieve your music goals faster and more effectively.

🎁 Cyber Monday Deals

Exclusive savings on everything you need:
- Premium subscriptions: Save on powerful tools and features that accelerate your success
- Distribution upgrades: Expand your reach with enhanced distribution options at special pricing
- Marketing campaigns: Access professional marketing tools at discounted rates
- Analytics features: Unlock advanced insights and reporting capabilities

⏰ Limited Time: Cyber Monday deals are available today only. This is your chance to invest in your music career with significant savings. Once today ends, these prices won''t be available again until next year!

Shop Cyber Monday Deals: {{promo_url}}

Digital tools for digital success: Cyber Monday is all about investing in the digital tools and services that help you succeed in today''s music industry. Whether you''re looking to expand your distribution, enhance your marketing, or unlock advanced features, today''s deals make it more accessible than ever. Shop now and take your music career to the next level!

Best regards,
The MSC & Co Team'
WHERE name = 'Promotion - Cyber Monday';

-- 3. Promotion - New Year Sale
UPDATE marketing_email_templates
SET 
  subject_template = '🎉 New Year Sale – Start {{new_year}} with {{discount_percent}}% Off!',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🎉 New Year Sale!</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Start {{new_year}} Right</p>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Kick off {{new_year}} with our exclusive New Year sale! This is the perfect time to set yourself up for success and take your music career to the next level. As you reflect on your goals and plan for the year ahead, we want to make it easier for you to access the premium tools and features that will help you achieve your aspirations. Whether you''re looking to expand your distribution, enhance your marketing capabilities, or unlock advanced analytics, our New Year sale gives you the opportunity to invest in your success at special pricing.</p>
    
    <div style="background: #fef3c7; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center;">
      <p style="font-size: 42px; margin: 0; font-weight: bold; color: #f59e0b;">{{discount_percent}}% OFF</p>
      <p style="font-size: 18px; margin: 10px 0 0 0; color: #4a5568;">All Premium Plans</p>
      <p style="font-size: 14px; margin: 15px 0 0 0; color: #718096;">Code: <strong>{{promo_code}}</strong></p>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>🌟 Fresh Start:</strong> The new year represents a fresh opportunity to invest in your music career. With this special pricing, you can unlock premium features, priority support, and advanced tools that will help you make {{new_year}} your most successful year yet. Don''t let this opportunity pass – take action now and set yourself up for success!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{promo_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Claim New Year Deal</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Make {{new_year}} your best year yet!</strong> We''re here to support your journey and provide you with the tools you need to succeed. This New Year sale is our way of helping you start the year strong. Take advantage of these savings and invest in the features that will help you achieve your music career goals throughout {{new_year}} and beyond!</p>
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
  body_text_template = '🎉 New Year Sale – Start {{new_year}} with {{discount_percent}}% Off!

Hi {{user_name}},

Kick off {{new_year}} with our exclusive New Year sale! This is the perfect time to set yourself up for success and take your music career to the next level. As you reflect on your goals and plan for the year ahead, we want to make it easier for you to access the premium tools and features that will help you achieve your aspirations. Whether you''re looking to expand your distribution, enhance your marketing capabilities, or unlock advanced analytics, our New Year sale gives you the opportunity to invest in your success at special pricing.

{{discount_percent}}% OFF All Premium Plans
Code: {{promo_code}}

🌟 Fresh Start: The new year represents a fresh opportunity to invest in your music career. With this special pricing, you can unlock premium features, priority support, and advanced tools that will help you make {{new_year}} your most successful year yet. Don''t let this opportunity pass – take action now and set yourself up for success!

Claim New Year Deal: {{promo_url}}

Make {{new_year}} your best year yet! We''re here to support your journey and provide you with the tools you need to succeed. This New Year sale is our way of helping you start the year strong. Take advantage of these savings and invest in the features that will help you achieve your music career goals throughout {{new_year}} and beyond!

Best regards,
The MSC & Co Team'
WHERE name = 'Promotion - New Year Sale';

-- 4. Promotion - Summer Sale
UPDATE marketing_email_templates
SET 
  subject_template = '☀️ Summer Sale – Hot Deals to Heat Up Your Music Career!',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">☀️ Summer Sale!</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Hot Deals Inside</p>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Summer is heating up, and so are our deals! This is the perfect time to take advantage of our exclusive summer sale and boost your music career while enjoying incredible savings. Whether you''re planning summer releases, preparing for festival season, or looking to expand your reach during this vibrant time of year, our summer sale gives you access to premium features at special pricing. This is your opportunity to invest in the tools and services that will help you make the most of the summer music scene and continue building your success.</p>
    
    <div style="background: #fff7ed; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f59e0b;">
      <h2 style="color: #92400e; margin-top: 0; font-size: 20px; font-weight: 600;">🌞 What''s Hot This Summer</h2>
      <p style="color: #78350f; margin-bottom: 16px; line-height: 1.7;">Take advantage of summer savings on:</p>
      <ul style="margin: 0; padding-left: 25px; color: #78350f; line-height: 1.8;">
        <li style="margin-bottom: 8px;"><strong>Premium subscriptions:</strong> Unlock advanced features at discounted summer pricing</li>
        <li style="margin-bottom: 8px;"><strong>Distribution services:</strong> Expand your reach to more platforms and markets</li>
        <li style="margin-bottom: 8px;"><strong>Marketing tools:</strong> Promote your summer releases with professional marketing solutions</li>
        <li style="margin-bottom: 8px;"><strong>Analytics packages:</strong> Get deeper insights into your audience and performance</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>🎵 Summer Success:</strong> Summer is one of the most exciting times for music – festivals, outdoor events, and increased listening activity. Make sure you''re prepared to capitalize on this vibrant season with the right tools and features. Our summer sale makes it more affordable than ever to access everything you need for a successful summer!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{promo_url}}" style="background: #f5576c; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Shop Summer Deals</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f5576c;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Have an amazing summer!</strong> We hope this summer brings you incredible opportunities, new connections, and significant growth in your music career. Our summer sale is our way of supporting you during this exciting season. Take advantage of these deals and make this summer your best one yet!</p>
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
  body_text_template = '☀️ Summer Sale – Hot Deals to Heat Up Your Music Career!

Hi {{user_name}},

Summer is heating up, and so are our deals! This is the perfect time to take advantage of our exclusive summer sale and boost your music career while enjoying incredible savings. Whether you''re planning summer releases, preparing for festival season, or looking to expand your reach during this vibrant time of year, our summer sale gives you access to premium features at special pricing. This is your opportunity to invest in the tools and services that will help you make the most of the summer music scene and continue building your success.

🌞 What''s Hot This Summer

Take advantage of summer savings on:
- Premium subscriptions: Unlock advanced features at discounted summer pricing
- Distribution services: Expand your reach to more platforms and markets
- Marketing tools: Promote your summer releases with professional marketing solutions
- Analytics packages: Get deeper insights into your audience and performance

🎵 Summer Success: Summer is one of the most exciting times for music – festivals, outdoor events, and increased listening activity. Make sure you''re prepared to capitalize on this vibrant season with the right tools and features. Our summer sale makes it more affordable than ever to access everything you need for a successful summer!

Shop Summer Deals: {{promo_url}}

Have an amazing summer! We hope this summer brings you incredible opportunities, new connections, and significant growth in your music career. Our summer sale is our way of supporting you during this exciting season. Take advantage of these deals and make this summer your best one yet!

Best regards,
The MSC & Co Team'
WHERE name = 'Promotion - Summer Sale';

-- 5. Promotion - Spring Sale
UPDATE marketing_email_templates
SET 
  subject_template = '🌸 Spring Sale – Fresh Start for Your Music Career!',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🌸 Spring Sale!</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Fresh Start for Your Music</p>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Spring is here, and so is our exclusive sale! It''s the perfect time to refresh your music career with our premium features at unbeatable prices. As nature blooms and new opportunities emerge, this spring sale gives you the chance to invest in the tools and services that will help you grow, expand, and achieve your goals. Whether you''re planning new releases, building your audience, or expanding your distribution, our spring sale makes premium features more accessible than ever.</p>
    
    <div style="background: #fef3c7; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center;">
      <p style="font-size: 42px; margin: 0; font-weight: bold; color: #f59e0b;">{{discount_percent}}% OFF</p>
      <p style="font-size: 18px; margin: 10px 0 0 0; color: #4a5568;">All Premium Plans</p>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>🌱 Spring Growth:</strong> Spring is a season of renewal and growth, making it the perfect time to invest in your music career. With fresh perspectives and new energy, this is your opportunity to upgrade your tools, expand your capabilities, and set yourself up for success throughout the rest of the year. Our spring sale gives you access to premium features at special pricing, making it easier than ever to take your career to the next level.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{promo_url}}" style="background: #f5576c; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Shop Spring Deals</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f5576c;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Enjoy the spring season!</strong> We hope this spring brings you fresh inspiration, new opportunities, and exciting growth in your music career. Our spring sale is our way of supporting you as you bloom and grow. Take advantage of these special prices and invest in the features that will help you flourish throughout the season and beyond!</p>
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
  body_text_template = '🌸 Spring Sale – Fresh Start for Your Music Career!

Hi {{user_name}},

Spring is here, and so is our exclusive sale! It''s the perfect time to refresh your music career with our premium features at unbeatable prices. As nature blooms and new opportunities emerge, this spring sale gives you the chance to invest in the tools and services that will help you grow, expand, and achieve your goals. Whether you''re planning new releases, building your audience, or expanding your distribution, our spring sale makes premium features more accessible than ever.

{{discount_percent}}% OFF All Premium Plans

🌱 Spring Growth: Spring is a season of renewal and growth, making it the perfect time to invest in your music career. With fresh perspectives and new energy, this is your opportunity to upgrade your tools, expand your capabilities, and set yourself up for success throughout the rest of the year. Our spring sale gives you access to premium features at special pricing, making it easier than ever to take your career to the next level.

Shop Spring Deals: {{promo_url}}

Enjoy the spring season! We hope this spring brings you fresh inspiration, new opportunities, and exciting growth in your music career. Our spring sale is our way of supporting you as you bloom and grow. Take advantage of these special prices and invest in the features that will help you flourish throughout the season and beyond!

Best regards,
The MSC & Co Team'
WHERE name = 'Promotion - Spring Sale';

-- 6. Promotion - Flash Sale 48hr
UPDATE marketing_email_templates
SET 
  subject_template = '⚡ FLASH SALE: 48 Hours – Extended!',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: bold; line-height: 1.3;">⚡ FLASH SALE: 48 HOURS</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Extended flash sale – 48 hours only! We''ve extended this incredible deal just for you. This is your chance to unlock premium features, expand your distribution capabilities, and access powerful marketing tools at unbeatable pricing. Flash sales are rare, and this one won''t last long, so don''t miss out on the opportunity to upgrade your music career at these special prices.</p>
    
    <div style="background: #ff4444; color: white; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center;">
      <p style="font-size: 48px; margin: 0; font-weight: bold; line-height: 1;">{{discount_percent}}%</p>
      <p style="font-size: 20px; margin: 10px 0 0 0; font-weight: 600;">OFF ALL PREMIUM PLANS</p>
      <p style="font-size: 14px; margin: 15px 0 0 0; opacity: 0.9;">Use code: <strong style="font-size: 16px;">{{promo_code}}</strong></p>
    </div>
    
    <div style="background: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; border-radius: 4px; margin: 30px 0;">
      <p style="margin: 0; color: #856404; font-weight: 600; font-size: 14px;">⏰ Only 48 Hours Left!</p>
      <p style="margin: 10px 0 0 0; color: #856404; font-size: 14px; line-height: 1.7;">This flash sale is time-sensitive and won''t be extended again. Once the 48 hours are up, these prices will be gone. Act now to secure your savings and unlock premium features at this incredible discount!</p>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>🎯 Why Act Now:</strong> Flash sales like this don''t come around often. This is your opportunity to access premium features, advanced analytics, priority support, and all the tools you need to accelerate your music career – all at a significant discount. Don''t wait, because this deal truly won''t last!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{promo_url}}" style="background: #ff4444; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Claim Deal</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #ff4444;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Time is ticking:</strong> This flash sale is designed to reward quick action. We''ve extended it for 48 hours to give you time to take advantage, but once it''s over, these prices won''t be available again. Don''t miss out on this opportunity to upgrade your music career at incredible savings!</p>
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
  body_text_template = '⚡ FLASH SALE: 48 Hours – Extended!

Hi {{user_name}},

Extended flash sale – 48 hours only! We''ve extended this incredible deal just for you. This is your chance to unlock premium features, expand your distribution capabilities, and access powerful marketing tools at unbeatable pricing. Flash sales are rare, and this one won''t last long, so don''t miss out on the opportunity to upgrade your music career at these special prices.

{{discount_percent}}% OFF ALL PREMIUM PLANS
Use code: {{promo_code}}

⏰ Only 48 Hours Left! This flash sale is time-sensitive and won''t be extended again. Once the 48 hours are up, these prices will be gone. Act now to secure your savings and unlock premium features at this incredible discount!

🎯 Why Act Now: Flash sales like this don''t come around often. This is your opportunity to access premium features, advanced analytics, priority support, and all the tools you need to accelerate your music career – all at a significant discount. Don''t wait, because this deal truly won''t last!

Claim Deal: {{promo_url}}

Time is ticking: This flash sale is designed to reward quick action. We''ve extended it for 48 hours to give you time to take advantage, but once it''s over, these prices won''t be available again. Don''t miss out on this opportunity to upgrade your music career at incredible savings!

Best regards,
The MSC & Co Team'
WHERE name = 'Promotion - Flash Sale 48hr';

-- 7. Promotion - Flash Sale 72hr
UPDATE marketing_email_templates
SET 
  subject_template = '🔥 MEGA SALE: 72 Hours – Don''t Miss Out!',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: bold; line-height: 1.3;">🔥 MEGA SALE: 72 HOURS</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Our biggest sale ever! 72 hours of amazing deals! This mega sale is our most significant promotion of the year, giving you access to premium features, advanced tools, and exclusive services at unbeatable prices. This is an extraordinary opportunity to upgrade your music career, expand your distribution capabilities, and unlock powerful marketing tools – all at incredible savings that won''t be available again soon.</p>
    
    <div style="background: #ff4444; color: white; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center;">
      <p style="font-size: 48px; margin: 0; font-weight: bold; line-height: 1;">{{discount_percent}}%</p>
      <p style="font-size: 20px; margin: 10px 0 0 0; font-weight: 600;">OFF EVERYTHING</p>
      <p style="font-size: 14px; margin: 15px 0 0 0; opacity: 0.9;">Use code: <strong style="font-size: 16px;">{{promo_code}}</strong></p>
    </div>
    
    <div style="background: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; border-radius: 4px; margin: 30px 0;">
      <p style="margin: 0; color: #856404; font-weight: 600; font-size: 14px;">⏰ 72 Hours Only!</p>
      <p style="margin: 10px 0 0 0; color: #856404; font-size: 14px; line-height: 1.7;">This mega sale is our biggest promotion and won''t be extended. Once the 72 hours are up, these incredible prices will be gone. Don''t miss out on this rare opportunity to save significantly on everything you need for your music career!</p>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>🎯 What''s Included:</strong> This mega sale covers everything – premium subscriptions, distribution upgrades, marketing tools, analytics packages, and more. It''s your chance to access the full suite of MSC & Co services at our best pricing. Invest in your music career now and save big!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{promo_url}}" style="background: #ff4444; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Shop Now</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #ff4444;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Don''t wait:</strong> Mega sales like this don''t happen often. We''ve created this 72-hour window to give you time to take advantage, but once it''s over, these prices will be gone. Act now and secure your savings on everything you need to succeed in your music career!</p>
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
  body_text_template = '🔥 MEGA SALE: 72 Hours – Don''t Miss Out!

Hi {{user_name}},

Our biggest sale ever! 72 hours of amazing deals! This mega sale is our most significant promotion of the year, giving you access to premium features, advanced tools, and exclusive services at unbeatable prices. This is an extraordinary opportunity to upgrade your music career, expand your distribution capabilities, and unlock powerful marketing tools – all at incredible savings that won''t be available again soon.

{{discount_percent}}% OFF EVERYTHING
Use code: {{promo_code}}

⏰ 72 Hours Only! This mega sale is our biggest promotion and won''t be extended. Once the 72 hours are up, these incredible prices will be gone. Don''t miss out on this rare opportunity to save significantly on everything you need for your music career!

🎯 What''s Included: This mega sale covers everything – premium subscriptions, distribution upgrades, marketing tools, analytics packages, and more. It''s your chance to access the full suite of MSC & Co services at our best pricing. Invest in your music career now and save big!

Shop Now: {{promo_url}}

Don''t wait: Mega sales like this don''t happen often. We''ve created this 72-hour window to give you time to take advantage, but once it''s over, these prices will be gone. Act now and secure your savings on everything you need to succeed in your music career!

Best regards,
The MSC & Co Team'
WHERE name = 'Promotion - Flash Sale 72hr';

-- 8. Promotion - Student Discount
UPDATE marketing_email_templates
SET 
  subject_template = '🎓 Student Discount – Special Offer!',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🎓 Student Discount</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Exclusive student discount! Get {{discount_percent}}% off with code {{promo_code}}. Perfect for music students! We understand that being a student comes with financial challenges, and we want to make our premium music distribution and marketing services accessible to you. This student discount is our way of supporting your musical journey and helping you build your career while you''re still studying. Whether you''re in music school, studying music production, or pursuing any music-related education, this discount makes it easier to access the tools you need to succeed.</p>
    
    <div style="background: #e3f2fd; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #2196f3;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">📚 Student Benefits</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">With your student discount, you get:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;"><strong>Affordable access:</strong> Premium features at student-friendly pricing</li>
        <li style="margin-bottom: 8px;"><strong>Full platform access:</strong> All the tools and features you need to distribute and promote your music</li>
        <li style="margin-bottom: 8px;"><strong>Priority support:</strong> Get help when you need it as you build your career</li>
        <li style="margin-bottom: 8px;"><strong>Educational resources:</strong> Access to guides, tutorials, and best practices</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>💡 Start Building Now:</strong> Don''t wait until after graduation to start building your music career. This student discount makes it affordable to begin distributing your music, building your audience, and establishing your presence while you''re still in school. Start early and get ahead!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{promo_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Claim Student Discount</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>We believe in students:</strong> We''re committed to supporting the next generation of music creators. Your student discount is available as long as you''re enrolled, giving you access to professional tools at a price that works for your budget. Focus on your studies and your music, and let us handle the distribution and promotion!</p>
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
  body_text_template = '🎓 Student Discount – Special Offer!

Hi {{user_name}},

Exclusive student discount! Get {{discount_percent}}% off with code {{promo_code}}. Perfect for music students! We understand that being a student comes with financial challenges, and we want to make our premium music distribution and marketing services accessible to you. This student discount is our way of supporting your musical journey and helping you build your career while you''re still studying. Whether you''re in music school, studying music production, or pursuing any music-related education, this discount makes it easier to access the tools you need to succeed.

📚 Student Benefits

With your student discount, you get:
- Affordable access: Premium features at student-friendly pricing
- Full platform access: All the tools and features you need to distribute and promote your music
- Priority support: Get help when you need it as you build your career
- Educational resources: Access to guides, tutorials, and best practices

💡 Start Building Now: Don''t wait until after graduation to start building your music career. This student discount makes it affordable to begin distributing your music, building your audience, and establishing your presence while you''re still in school. Start early and get ahead!

Claim Student Discount: {{promo_url}}

We believe in students: We''re committed to supporting the next generation of music creators. Your student discount is available as long as you''re enrolled, giving you access to professional tools at a price that works for your budget. Focus on your studies and your music, and let us handle the distribution and promotion!

Best regards,
The MSC & Co Team'
WHERE name = 'Promotion - Student Discount';

-- 9. Promotion - Annual Plan Discount
UPDATE marketing_email_templates
SET 
  subject_template = '💎 Annual Plan – Save Big!',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">💎 Annual Plan</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Save {{savings_amount}} with our annual plan! Get {{discount_percent}}% off when you commit to a year! Choosing an annual plan is one of the smartest investments you can make for your music career. Not only do you save significantly compared to monthly payments, but you also get uninterrupted access to all premium features, priority support, and the peace of mind that comes with knowing your tools are secured for the entire year. This annual discount makes it easier than ever to commit to your success and save money in the process.</p>
    
    <div style="background: #fef3c7; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center;">
      <p style="font-size: 42px; margin: 0; font-weight: bold; color: #f59e0b;">SAVE {{savings_amount}}</p>
      <p style="font-size: 18px; margin: 10px 0 0 0; color: #4a5568;">With Annual Plan</p>
      <p style="font-size: 14px; margin: 15px 0 0 0; color: #718096;">{{discount_percent}}% off compared to monthly</p>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>💰 More Value:</strong> Annual plans give you the best value for your investment. You get all the premium features, tools, and support you need to grow your music career, plus you save money that you can reinvest in your music, marketing, or other career-building activities. It''s a win-win that sets you up for success!</p>
    </div>
    
    <div style="background: #e3f2fd; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #2196f3;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">✅ Annual Plan Benefits</h2>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;"><strong>Significant savings:</strong> Save hundreds compared to monthly payments</li>
        <li style="margin-bottom: 8px;"><strong>Uninterrupted access:</strong> No monthly renewals to worry about</li>
        <li style="margin-bottom: 8px;"><strong>Priority support:</strong> Get help when you need it throughout the year</li>
        <li style="margin-bottom: 8px;"><strong>Full feature access:</strong> All premium tools and capabilities included</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{annual_url}}" style="background: #f5af19; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">View Annual Plans</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f5af19;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Commit to your success:</strong> An annual plan is a commitment to your music career. By choosing annual billing, you''re investing in your future and making a statement that you''re serious about building your career. Plus, with the money you save, you have more resources to invest in other aspects of your music business. It''s a smart financial decision that pays off throughout the year!</p>
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
  body_text_template = '💎 Annual Plan – Save Big!

Hi {{user_name}},

Save {{savings_amount}} with our annual plan! Get {{discount_percent}}% off when you commit to a year! Choosing an annual plan is one of the smartest investments you can make for your music career. Not only do you save significantly compared to monthly payments, but you also get uninterrupted access to all premium features, priority support, and the peace of mind that comes with knowing your tools are secured for the entire year. This annual discount makes it easier than ever to commit to your success and save money in the process.

SAVE {{savings_amount}} With Annual Plan
{{discount_percent}}% off compared to monthly

💰 More Value: Annual plans give you the best value for your investment. You get all the premium features, tools, and support you need to grow your music career, plus you save money that you can reinvest in your music, marketing, or other career-building activities. It''s a win-win that sets you up for success!

✅ Annual Plan Benefits

- Significant savings: Save hundreds compared to monthly payments
- Uninterrupted access: No monthly renewals to worry about
- Priority support: Get help when you need it throughout the year
- Full feature access: All premium tools and capabilities included

View Annual Plans: {{annual_url}}

Commit to your success: An annual plan is a commitment to your music career. By choosing annual billing, you''re investing in your future and making a statement that you''re serious about building your career. Plus, with the money you save, you have more resources to invest in other aspects of your music business. It''s a smart financial decision that pays off throughout the year!

Best regards,
The MSC & Co Team'
WHERE name = 'Promotion - Annual Plan Discount';

-- 10. Promotion - Limited Time Offer
UPDATE marketing_email_templates
SET 
  subject_template = '⏰ Limited Time Offer – Act Fast!',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">⏰ Limited Time Offer</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Only {{hours_left}} hours left! Get {{discount_percent}}% off premium features. Don''t miss this opportunity! This limited-time offer is designed to reward quick action and give you access to premium tools at incredible savings. The clock is ticking, and once this offer expires, these prices won''t be available again. This is your chance to upgrade your music career at a significant discount, so don''t wait – act now and secure your savings before time runs out!</p>
    
    <div style="background: #ff4444; color: white; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center;">
      <p style="font-size: 48px; margin: 0; font-weight: bold; line-height: 1;">{{discount_percent}}%</p>
      <p style="font-size: 20px; margin: 10px 0 0 0; font-weight: 600;">OFF PREMIUM FEATURES</p>
      <p style="font-size: 14px; margin: 15px 0 0 0; opacity: 0.9;">Only {{hours_left}} hours remaining</p>
    </div>
    
    <div style="background: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; border-radius: 4px; margin: 30px 0;">
      <p style="margin: 0; color: #856404; font-weight: 600; font-size: 14px;">⏰ Time-Sensitive Offer</p>
      <p style="margin: 10px 0 0 0; color: #856404; font-size: 14px; line-height: 1.7;">This offer expires in {{hours_left}} hours. Once it''s gone, these prices won''t be available again. Don''t let this opportunity slip away – secure your discount now and unlock premium features at these incredible savings!</p>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>🚀 Why Act Now:</strong> Limited-time offers like this don''t come around often. This is your opportunity to access premium features, advanced analytics, priority support, and all the tools you need to accelerate your music career – all at a significant discount. The sooner you act, the sooner you can start benefiting from these powerful features!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{promo_url}}" style="background: #f5576c; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Claim Offer</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f5576c;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Don''t miss out:</strong> This limited-time offer is designed to reward those who act quickly. With only {{hours_left}} hours remaining, every minute counts. Don''t let this opportunity pass you by – take action now and secure your savings on premium features that will help you grow your music career!</p>
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
  body_text_template = '⏰ Limited Time Offer – Act Fast!

Hi {{user_name}},

Only {{hours_left}} hours left! Get {{discount_percent}}% off premium features. Don''t miss this opportunity! This limited-time offer is designed to reward quick action and give you access to premium tools at incredible savings. The clock is ticking, and once this offer expires, these prices won''t be available again. This is your chance to upgrade your music career at a significant discount, so don''t wait – act now and secure your savings before time runs out!

{{discount_percent}}% OFF PREMIUM FEATURES
Only {{hours_left}} hours remaining

⏰ Time-Sensitive Offer: This offer expires in {{hours_left}} hours. Once it''s gone, these prices won''t be available again. Don''t let this opportunity slip away – secure your discount now and unlock premium features at these incredible savings!

🚀 Why Act Now: Limited-time offers like this don''t come around often. This is your opportunity to access premium features, advanced analytics, priority support, and all the tools you need to accelerate your music career – all at a significant discount. The sooner you act, the sooner you can start benefiting from these powerful features!

Claim Offer: {{promo_url}}

Don''t miss out: This limited-time offer is designed to reward those who act quickly. With only {{hours_left}} hours remaining, every minute counts. Don''t let this opportunity pass you by – take action now and secure your savings on premium features that will help you grow your music career!

Best regards,
The MSC & Co Team'
WHERE name = 'Promotion - Limited Time Offer';

-- 11. Promotion - Early Bird Special
UPDATE marketing_email_templates
SET 
  subject_template = '🐦 Early Bird Special – Be First!',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🐦 Early Bird Special</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Early bird gets the worm! Get {{discount_percent}}% off with code {{promo_code}}. Limited spots available! This early bird special is our way of rewarding those who act quickly and get ahead of the crowd. By being one of the first to take advantage of this offer, you''re securing premium features at special pricing that''s only available for a limited number of spots. Don''t wait – limited availability means this offer will sell out, and you want to make sure you''re among the early birds who secure these savings!</p>
    
    <div style="background: #e3f2fd; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #2196f3;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">🌅 Early Bird Benefits</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">Be among the first and get:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;"><strong>Exclusive pricing:</strong> Special discount only for early birds</li>
        <li style="margin-bottom: 8px;"><strong>Guaranteed access:</strong> Secure your spot before it sells out</li>
        <li style="margin-bottom: 8px;"><strong>Priority features:</strong> Get access to premium tools right away</li>
        <li style="margin-bottom: 8px;"><strong>Limited availability:</strong> Only a certain number of spots available</li>
      </ul>
    </div>
    
    <div style="background: #fef3c7; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center;">
      <p style="font-size: 42px; margin: 0; font-weight: bold; color: #f59e0b;">{{discount_percent}}% OFF</p>
      <p style="font-size: 18px; margin: 10px 0 0 0; color: #4a5568;">Use code: <strong>{{promo_code}}</strong></p>
      <p style="font-size: 14px; margin: 15px 0 0 0; color: #718096;">Limited spots available</p>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>⚡ Act Fast:</strong> Early bird specials are designed to reward quick action. With limited spots available, this offer will sell out quickly. Don''t miss your chance to be among the first to secure these savings and unlock premium features at special pricing. The early bird truly gets the worm – and in this case, significant savings!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{promo_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Claim Early Bird</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Get ahead of the crowd:</strong> Being an early bird means you''re proactive about your success. By securing your spot now, you''re ensuring you get the best pricing and access to premium features before they''re available to everyone else. Don''t wait until it''s too late – claim your early bird discount now!</p>
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
  body_text_template = '🐦 Early Bird Special – Be First!

Hi {{user_name}},

Early bird gets the worm! Get {{discount_percent}}% off with code {{promo_code}}. Limited spots available! This early bird special is our way of rewarding those who act quickly and get ahead of the crowd. By being one of the first to take advantage of this offer, you''re securing premium features at special pricing that''s only available for a limited number of spots. Don''t wait – limited availability means this offer will sell out, and you want to make sure you''re among the early birds who secure these savings!

🌅 Early Bird Benefits

Be among the first and get:
- Exclusive pricing: Special discount only for early birds
- Guaranteed access: Secure your spot before it sells out
- Priority features: Get access to premium tools right away
- Limited availability: Only a certain number of spots available

{{discount_percent}}% OFF
Use code: {{promo_code}}
Limited spots available

⚡ Act Fast: Early bird specials are designed to reward quick action. With limited spots available, this offer will sell out quickly. Don''t miss your chance to be among the first to secure these savings and unlock premium features at special pricing. The early bird truly gets the worm – and in this case, significant savings!

Claim Early Bird: {{promo_url}}

Get ahead of the crowd: Being an early bird means you''re proactive about your success. By securing your spot now, you''re ensuring you get the best pricing and access to premium features before they''re available to everyone else. Don''t wait until it''s too late – claim your early bird discount now!

Best regards,
The MSC & Co Team'
WHERE name = 'Promotion - Early Bird Special';

-- 12. Promotion - Weekend Special
UPDATE marketing_email_templates
SET 
  subject_template = '🎉 Weekend Special – Fun Deals!',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🎉 Weekend Special</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Weekend vibes! Get {{discount_percent}}% off all weekend long. Perfect time to upgrade! This weekend special is designed to make your weekend even better by giving you access to premium features at special pricing. Whether you''re planning new releases, working on your music projects, or just looking to enhance your distribution capabilities, this weekend is the perfect time to invest in your music career at incredible savings. Don''t let the weekend pass without taking advantage of these deals!</p>
    
    <div style="background: #fef3c7; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center;">
      <p style="font-size: 42px; margin: 0; font-weight: bold; color: #f59e0b;">{{discount_percent}}% OFF</p>
      <p style="font-size: 18px; margin: 10px 0 0 0; color: #4a5568;">All Weekend Long</p>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>🎊 Weekend Fun:</strong> Weekends are for focusing on what you love – your music! This weekend special makes it easier than ever to access premium features, upgrade your plan, or try new tools that will help you grow your career. Take advantage of these savings while you have time to explore and set up everything you need!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{promo_url}}" style="background: #f5576c; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Shop Weekend Deals</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f5576c;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Make the most of your weekend:</strong> This weekend special is available for a limited time, so don''t miss out. Use your weekend to invest in your music career, explore new features, and set yourself up for success. These deals won''t last forever, so take action now and make this weekend count!</p>
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
  body_text_template = '🎉 Weekend Special – Fun Deals!

Hi {{user_name}},

Weekend vibes! Get {{discount_percent}}% off all weekend long. Perfect time to upgrade! This weekend special is designed to make your weekend even better by giving you access to premium features at special pricing. Whether you''re planning new releases, working on your music projects, or just looking to enhance your distribution capabilities, this weekend is the perfect time to invest in your music career at incredible savings. Don''t let the weekend pass without taking advantage of these deals!

{{discount_percent}}% OFF All Weekend Long

🎊 Weekend Fun: Weekends are for focusing on what you love – your music! This weekend special makes it easier than ever to access premium features, upgrade your plan, or try new tools that will help you grow your career. Take advantage of these savings while you have time to explore and set up everything you need!

Shop Weekend Deals: {{promo_url}}

Make the most of your weekend: This weekend special is available for a limited time, so don''t miss out. Use your weekend to invest in your music career, explore new features, and set yourself up for success. These deals won''t last forever, so take action now and make this weekend count!

Best regards,
The MSC & Co Team'
WHERE name = 'Promotion - Weekend Special';

-- 13. Promotion - New Year Special
UPDATE marketing_email_templates
SET 
  subject_template = '🎊 New Year Special – Fresh Start!',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🎊 New Year Special</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Start the new year right! Get {{discount_percent}}% off with code {{promo_code}}. New year, new opportunities! As we welcome a fresh start, this is the perfect time to invest in your music career and set yourself up for success throughout the year. Our New Year special gives you access to premium features at special pricing, making it easier than ever to achieve your goals. Whether you''re planning new releases, expanding your distribution, or enhancing your marketing, this New Year special helps you start strong!</p>
    
    <div style="background: #fef3c7; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center;">
      <p style="font-size: 42px; margin: 0; font-weight: bold; color: #f59e0b;">{{discount_percent}}% OFF</p>
      <p style="font-size: 18px; margin: 10px 0 0 0; color: #4a5568;">Code: <strong>{{promo_code}}</strong></p>
      <p style="font-size: 14px; margin: 15px 0 0 0; color: #718096;">New year, new opportunities</p>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>🌟 Fresh Start:</strong> The new year represents a fresh opportunity to invest in your music career. With this special pricing, you can unlock premium features, priority support, and advanced tools that will help you achieve your goals. Don''t let this opportunity pass – take action now and set yourself up for a successful year!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{promo_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Start Fresh</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>New year, new you:</strong> This New Year special is our way of helping you start the year strong. With special pricing on premium features, you can invest in the tools you need to succeed without breaking the bank. Take advantage of these savings and make this year your best one yet!</p>
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
  body_text_template = '🎊 New Year Special – Fresh Start!

Hi {{user_name}},

Start the new year right! Get {{discount_percent}}% off with code {{promo_code}}. New year, new opportunities! As we welcome a fresh start, this is the perfect time to invest in your music career and set yourself up for success throughout the year. Our New Year special gives you access to premium features at special pricing, making it easier than ever to achieve your goals. Whether you''re planning new releases, expanding your distribution, or enhancing your marketing, this New Year special helps you start strong!

{{discount_percent}}% OFF
Code: {{promo_code}}
New year, new opportunities

🌟 Fresh Start: The new year represents a fresh opportunity to invest in your music career. With this special pricing, you can unlock premium features, priority support, and advanced tools that will help you achieve your goals. Don''t let this opportunity pass – take action now and set yourself up for a successful year!

Start Fresh: {{promo_url}}

New year, new you: This New Year special is our way of helping you start the year strong. With special pricing on premium features, you can invest in the tools you need to succeed without breaking the bank. Take advantage of these savings and make this year your best one yet!

Best regards,
The MSC & Co Team'
WHERE name = 'Promotion - New Year Special';

-- 14. Promotion - Birthday Special
UPDATE marketing_email_templates
SET 
  subject_template = '🎂 Birthday Special – Celebrate with Us!',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🎂 Birthday Special</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Happy Birthday! We''re giving you {{discount_percent}}% off! Use code {{promo_code}} to claim your birthday gift! Your birthday is a special day, and we want to celebrate with you by offering you an exclusive birthday discount. This is our way of showing appreciation for you being part of the MSC & Co community and giving you the gift of savings on premium features that will help you grow your music career. It''s the perfect time to treat yourself to the tools and services you need to succeed!</p>
    
    <div style="background: #fef3c7; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center;">
      <p style="font-size: 42px; margin: 0; font-weight: bold; color: #f59e0b;">{{discount_percent}}% OFF</p>
      <p style="font-size: 18px; margin: 10px 0 0 0; color: #4a5568;">Your Birthday Gift</p>
      <p style="font-size: 14px; margin: 15px 0 0 0; color: #718096;">Code: <strong>{{promo_code}}</strong></p>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>🎉 Celebrate Your Day:</strong> Birthdays are for celebrating and treating yourself! This birthday special is our gift to you – a chance to access premium features, upgrade your plan, or try new tools at special pricing. Make your birthday even more special by investing in your music career at incredible savings!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{promo_url}}" style="background: #f093fb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Claim Birthday Gift</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f093fb;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Happy Birthday from all of us!</strong> We hope your special day is filled with joy, music, and celebration. This birthday discount is our way of wishing you a wonderful year ahead and supporting your music career journey. Enjoy your birthday, and don''t forget to claim your gift before it expires!</p>
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
  body_text_template = '🎂 Birthday Special – Celebrate with Us!

Hi {{user_name}},

Happy Birthday! We''re giving you {{discount_percent}}% off! Use code {{promo_code}} to claim your birthday gift! Your birthday is a special day, and we want to celebrate with you by offering you an exclusive birthday discount. This is our way of showing appreciation for you being part of the MSC & Co community and giving you the gift of savings on premium features that will help you grow your music career. It''s the perfect time to treat yourself to the tools and services you need to succeed!

{{discount_percent}}% OFF Your Birthday Gift
Code: {{promo_code}}

🎉 Celebrate Your Day: Birthdays are for celebrating and treating yourself! This birthday special is our gift to you – a chance to access premium features, upgrade your plan, or try new tools at special pricing. Make your birthday even more special by investing in your music career at incredible savings!

Claim Birthday Gift: {{promo_url}}

Happy Birthday from all of us! We hope your special day is filled with joy, music, and celebration. This birthday discount is our way of wishing you a wonderful year ahead and supporting your music career journey. Enjoy your birthday, and don''t forget to claim your gift before it expires!

Best regards,
The MSC & Co Team'
WHERE name = 'Promotion - Birthday Special';

-- 15. Promotion - Loyalty Reward
UPDATE marketing_email_templates
SET 
  subject_template = '💎 Loyalty Reward – Thank You!',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">💎 Loyalty Reward</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">As a valued member, here''s your special reward: {{reward_description}}. Use code {{promo_code}}! We truly appreciate your loyalty and continued partnership with MSC & Co. Your commitment to our platform and your music career doesn''t go unnoticed, and we want to show our gratitude with this exclusive loyalty reward. This is our way of saying thank you for being such an important part of our community and for trusting us with your music distribution and career growth.</p>
    
    <div style="background: #fef3c7; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center;">
      <p style="font-size: 32px; margin: 0; font-weight: bold; color: #f59e0b;">{{reward_description}}</p>
      <p style="font-size: 18px; margin: 15px 0 0 0; color: #4a5568;">Your Exclusive Reward</p>
      <p style="font-size: 14px; margin: 15px 0 0 0; color: #718096;">Code: <strong>{{promo_code}}</strong></p>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>🙏 Thank You:</strong> Your loyalty means everything to us. We''re grateful for your continued trust in MSC & Co and your dedication to building your music career with us. This reward is just a small token of our appreciation for everything you do. Thank you for being part of our community!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{promo_url}}" style="background: #f5af19; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Claim Reward</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f5af19;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Your partnership matters:</strong> Loyal members like you are the foundation of our community. Your continued support, feedback, and engagement help us build a better platform for everyone. This loyalty reward is our way of recognizing your value and showing our appreciation. Thank you for being such an important part of MSC & Co!</p>
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
  body_text_template = '💎 Loyalty Reward – Thank You!

Hi {{user_name}},

As a valued member, here''s your special reward: {{reward_description}}. Use code {{promo_code}}! We truly appreciate your loyalty and continued partnership with MSC & Co. Your commitment to our platform and your music career doesn''t go unnoticed, and we want to show our gratitude with this exclusive loyalty reward. This is our way of saying thank you for being such an important part of our community and for trusting us with your music distribution and career growth.

{{reward_description}}
Your Exclusive Reward
Code: {{promo_code}}

🙏 Thank You: Your loyalty means everything to us. We''re grateful for your continued trust in MSC & Co and your dedication to building your music career with us. This reward is just a small token of our appreciation for everything you do. Thank you for being part of our community!

Claim Reward: {{promo_url}}

Your partnership matters: Loyal members like you are the foundation of our community. Your continued support, feedback, and engagement help us build a better platform for everyone. This loyalty reward is our way of recognizing your value and showing our appreciation. Thank you for being such an important part of MSC & Co!

Best regards,
The MSC & Co Team'
WHERE name = 'Promotion - Loyalty Reward';

-- 16. Promotion - Comeback Offer
UPDATE marketing_email_templates
SET 
  subject_template = '🎵 Comeback Offer – We Missed You!',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🎵 Comeback Offer</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Welcome back! We missed you. Here''s {{discount_percent}}% off to get you back on track. Use code {{promo_code}}! It''s been a while since we''ve seen you, and we want to make it easy for you to come back and continue building your music career with us. This comeback offer is our way of welcoming you back and giving you a fresh start at special pricing. We''ve missed having you as part of our community, and we''re excited to help you get back on track with your music goals!</p>
    
    <div style="background: #e3f2fd; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #2196f3;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">🔄 What''s Changed</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">Since you''ve been away:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;"><strong>New features:</strong> We''ve added exciting new tools and capabilities</li>
        <li style="margin-bottom: 8px;"><strong>Enhanced platform:</strong> Improved performance and user experience</li>
        <li style="margin-bottom: 8px;"><strong>Better support:</strong> Expanded help resources and support team</li>
        <li style="margin-bottom: 8px;"><strong>More opportunities:</strong> New distribution channels and marketing options</li>
      </ul>
    </div>
    
    <div style="background: #fef3c7; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center;">
      <p style="font-size: 42px; margin: 0; font-weight: bold; color: #f59e0b;">{{discount_percent}}% OFF</p>
      <p style="font-size: 18px; margin: 10px 0 0 0; color: #4a5568;">Welcome Back Offer</p>
      <p style="font-size: 14px; margin: 15px 0 0 0; color: #718096;">Code: <strong>{{promo_code}}</strong></p>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>🌟 Fresh Start:</strong> Coming back to MSC & Co is easier than ever with this comeback offer. Whether you''re ready to release new music, expand your distribution, or take advantage of new features, this discount makes it the perfect time to return. We''re here to help you pick up where you left off and continue your music career journey!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{promo_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Welcome Back</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>We''re glad you''re back:</strong> We''ve missed having you as part of our community, and we''re excited to welcome you back. This comeback offer is our way of making it easy for you to return and continue building your music career. Take advantage of this special pricing and get back on track with your goals. Welcome back – we''re here to support your success!</p>
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
  body_text_template = '🎵 Comeback Offer – We Missed You!

Hi {{user_name}},

Welcome back! We missed you. Here''s {{discount_percent}}% off to get you back on track. Use code {{promo_code}}! It''s been a while since we''ve seen you, and we want to make it easy for you to come back and continue building your music career with us. This comeback offer is our way of welcoming you back and giving you a fresh start at special pricing. We''ve missed having you as part of our community, and we''re excited to help you get back on track with your music goals!

🔄 What''s Changed

Since you''ve been away:
- New features: We''ve added exciting new tools and capabilities
- Enhanced platform: Improved performance and user experience
- Better support: Expanded help resources and support team
- More opportunities: New distribution channels and marketing options

{{discount_percent}}% OFF Welcome Back Offer
Code: {{promo_code}}

🌟 Fresh Start: Coming back to MSC & Co is easier than ever with this comeback offer. Whether you''re ready to release new music, expand your distribution, or take advantage of new features, this discount makes it the perfect time to return. We''re here to help you pick up where you left off and continue your music career journey!

Welcome Back: {{promo_url}}

We''re glad you''re back: We''ve missed having you as part of our community, and we''re excited to welcome you back. This comeback offer is our way of making it easy for you to return and continue building your music career. Take advantage of this special pricing and get back on track with your goals. Welcome back – we''re here to support your success!

Best regards,
The MSC & Co Team'
WHERE name = 'Promotion - Comeback Offer';

-- 17. Promotion - Upgrade Bonus
UPDATE marketing_email_templates
SET 
  subject_template = '⭐ Upgrade Bonus – Extra Value!',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">⭐ Upgrade Bonus</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Upgrade now and get {{bonus_description}}! Double the value when you move to premium! This upgrade bonus is designed to reward you for taking your music career to the next level. When you upgrade to a premium plan, you not only get access to all the advanced features and tools, but you also receive this exclusive bonus that adds even more value to your upgrade. It''s the perfect time to make the move and unlock the full potential of MSC & Co while getting extra benefits!</p>
    
    <div style="background: #fef3c7; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center;">
      <p style="font-size: 32px; margin: 0; font-weight: bold; color: #f59e0b;">{{bonus_description}}</p>
      <p style="font-size: 18px; margin: 15px 0 0 0; color: #4a5568;">Your Upgrade Bonus</p>
    </div>
    
    <div style="background: #e3f2fd; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #2196f3;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">🚀 Upgrade Benefits</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">When you upgrade, you get:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;"><strong>Premium features:</strong> Access to all advanced tools and capabilities</li>
        <li style="margin-bottom: 8px;"><strong>Priority support:</strong> Get help when you need it, faster</li>
        <li style="margin-bottom: 8px;"><strong>Enhanced distribution:</strong> Reach more platforms and markets</li>
        <li style="margin-bottom: 8px;"><strong>Bonus value:</strong> Plus your exclusive upgrade bonus!</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>💎 Double the Value:</strong> This upgrade bonus makes moving to premium even more valuable. You''re not just upgrading your plan – you''re getting extra benefits that help you maximize your investment. It''s the perfect time to unlock the full power of MSC & Co and take your music career to the next level!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{upgrade_url}}" style="background: #f5af19; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Upgrade Now</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f5af19;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Take your career to the next level:</strong> Upgrading to premium unlocks powerful features and tools that will help you grow your music career faster and more effectively. With this upgrade bonus, you''re getting even more value for your investment. Don''t miss out on this opportunity to maximize your success!</p>
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
  body_text_template = '⭐ Upgrade Bonus – Extra Value!

Hi {{user_name}},

Upgrade now and get {{bonus_description}}! Double the value when you move to premium! This upgrade bonus is designed to reward you for taking your music career to the next level. When you upgrade to a premium plan, you not only get access to all the advanced features and tools, but you also receive this exclusive bonus that adds even more value to your upgrade. It''s the perfect time to make the move and unlock the full potential of MSC & Co while getting extra benefits!

{{bonus_description}}
Your Upgrade Bonus

🚀 Upgrade Benefits

When you upgrade, you get:
- Premium features: Access to all advanced tools and capabilities
- Priority support: Get help when you need it, faster
- Enhanced distribution: Reach more platforms and markets
- Bonus value: Plus your exclusive upgrade bonus!

💎 Double the Value: This upgrade bonus makes moving to premium even more valuable. You''re not just upgrading your plan – you''re getting extra benefits that help you maximize your investment. It''s the perfect time to unlock the full power of MSC & Co and take your music career to the next level!

Upgrade Now: {{upgrade_url}}

Take your career to the next level: Upgrading to premium unlocks powerful features and tools that will help you grow your music career faster and more effectively. With this upgrade bonus, you''re getting even more value for your investment. Don''t miss out on this opportunity to maximize your success!

Best regards,
The MSC & Co Team'
WHERE name = 'Promotion - Upgrade Bonus';

-- 18. Promotion - Feature Highlight
UPDATE marketing_email_templates
SET 
  subject_template = '✨ New Feature – Check It Out!',
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
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Exciting news! We''ve launched {{feature_name}}: {{feature_description}}. See what''s new! We''re constantly working to improve MSC & Co and add features that help you succeed, and we''re thrilled to share this latest addition with you. This new feature is designed to make your music career journey easier, more efficient, and more successful. We believe it will be a game-changer for how you manage and grow your music career, and we can''t wait for you to try it out!</p>
    
    <div style="background: #e3f2fd; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #2196f3;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">🎯 Why This Feature Matters</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">This new feature helps you:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;"><strong>Work more efficiently:</strong> Save time with streamlined workflows</li>
        <li style="margin-bottom: 8px;"><strong>Achieve better results:</strong> Get more effective outcomes for your music</li>
        <li style="margin-bottom: 8px;"><strong>Grow faster:</strong> Accelerate your career growth with powerful tools</li>
        <li style="margin-bottom: 8px;"><strong>Stay ahead:</strong> Access the latest innovations in music distribution</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>🚀 Try It Now:</strong> This new feature is ready for you to explore. We''ve built it based on feedback from artists like you, and we''re excited to see how it helps you achieve your goals. Check it out and discover how it can transform your workflow and help you succeed!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{feature_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Explore Feature</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Built for you:</strong> We''re committed to continuously improving MSC & Co based on your needs and feedback. This new feature is just one example of how we''re working to make your music career journey better. We hope you love it, and we''d love to hear what you think!</p>
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
  body_text_template = '✨ New Feature – Check It Out!

Hi {{user_name}},

Exciting news! We''ve launched {{feature_name}}: {{feature_description}}. See what''s new! We''re constantly working to improve MSC & Co and add features that help you succeed, and we''re thrilled to share this latest addition with you. This new feature is designed to make your music career journey easier, more efficient, and more successful. We believe it will be a game-changer for how you manage and grow your music career, and we can''t wait for you to try it out!

🎯 Why This Feature Matters

This new feature helps you:
- Work more efficiently: Save time with streamlined workflows
- Achieve better results: Get more effective outcomes for your music
- Grow faster: Accelerate your career growth with powerful tools
- Stay ahead: Access the latest innovations in music distribution

🚀 Try It Now: This new feature is ready for you to explore. We''ve built it based on feedback from artists like you, and we''re excited to see how it helps you achieve your goals. Check it out and discover how it can transform your workflow and help you succeed!

Explore Feature: {{feature_url}}

Built for you: We''re committed to continuously improving MSC & Co based on your needs and feedback. This new feature is just one example of how we''re working to make your music career journey better. We hope you love it, and we''d love to hear what you think!

Best regards,
The MSC & Co Team'
WHERE name = 'Promotion - Feature Highlight';

-- 19. Promotion - Partnership Deal
UPDATE marketing_email_templates
SET 
  subject_template = '🤝 Partnership Exclusive – Special Deal!',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🤝 Partnership Exclusive</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Exclusive offer through our partnership with {{partner_name}}! Get {{discount_percent}}% off! We''re excited to share this exclusive partnership deal with you. Through our collaboration with {{partner_name}}, we''re able to offer you special pricing that''s only available through this partnership. This is a unique opportunity to access premium MSC & Co features at incredible savings, made possible by our partnership. Don''t miss out on this exclusive deal that combines the best of both worlds!</p>
    
    <div style="background: #e3f2fd; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #2196f3;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">🤝 Partnership Benefits</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">Through this partnership, you get:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;"><strong>Exclusive pricing:</strong> Special discount only available through this partnership</li>
        <li style="margin-bottom: 8px;"><strong>Full platform access:</strong> All premium features and tools included</li>
        <li style="margin-bottom: 8px;"><strong>Priority support:</strong> Get help when you need it</li>
        <li style="margin-bottom: 8px;"><strong>Partnership value:</strong> Benefit from the combined strengths of both organizations</li>
      </ul>
    </div>
    
    <div style="background: #fef3c7; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center;">
      <p style="font-size: 42px; margin: 0; font-weight: bold; color: #f59e0b;">{{discount_percent}}% OFF</p>
      <p style="font-size: 18px; margin: 10px 0 0 0; color: #4a5568;">Partnership Exclusive</p>
      <p style="font-size: 14px; margin: 15px 0 0 0; color: #718096;">In partnership with {{partner_name}}</p>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>🌟 Exclusive Opportunity:</strong> This partnership deal is only available to you through our collaboration with {{partner_name}}. It''s a unique opportunity to access premium features at special pricing that combines the value of both partnerships. Take advantage of this exclusive offer while it''s available!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{promo_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Claim Partnership Deal</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Partnership value:</strong> We''re proud to partner with {{partner_name}} to bring you this exclusive deal. This partnership represents our shared commitment to supporting music creators and making professional tools more accessible. Take advantage of this special pricing and benefit from the combined value of both partnerships!</p>
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
  body_text_template = '🤝 Partnership Exclusive – Special Deal!

Hi {{user_name}},

Exclusive offer through our partnership with {{partner_name}}! Get {{discount_percent}}% off! We''re excited to share this exclusive partnership deal with you. Through our collaboration with {{partner_name}}, we''re able to offer you special pricing that''s only available through this partnership. This is a unique opportunity to access premium MSC & Co features at incredible savings, made possible by our partnership. Don''t miss out on this exclusive deal that combines the best of both worlds!

🤝 Partnership Benefits

Through this partnership, you get:
- Exclusive pricing: Special discount only available through this partnership
- Full platform access: All premium features and tools included
- Priority support: Get help when you need it
- Partnership value: Benefit from the combined strengths of both organizations

{{discount_percent}}% OFF Partnership Exclusive
In partnership with {{partner_name}}

🌟 Exclusive Opportunity: This partnership deal is only available to you through our collaboration with {{partner_name}}. It''s a unique opportunity to access premium features at special pricing that combines the value of both partnerships. Take advantage of this exclusive offer while it''s available!

Claim Partnership Deal: {{promo_url}}

Partnership value: We''re proud to partner with {{partner_name}} to bring you this exclusive deal. This partnership represents our shared commitment to supporting music creators and making professional tools more accessible. Take advantage of this special pricing and benefit from the combined value of both partnerships!

Best regards,
The MSC & Co Team'
WHERE name = 'Promotion - Partnership Deal';

-- 20. Promotion - Anniversary Sale
UPDATE marketing_email_templates
SET 
  subject_template = '🎉 Anniversary Sale – Celebrate With Us!',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🎉 Anniversary Sale</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Celebrating {{years}} years! Join the celebration with {{discount_percent}}% off everything! We''re thrilled to be celebrating {{years}} years of MSC & Co, and we want you to be part of the celebration! This milestone represents years of supporting music creators, building innovative tools, and helping artists achieve their dreams. To mark this special occasion, we''re offering incredible savings on everything – premium features, distribution services, marketing tools, and more. Join us in celebrating this anniversary and take advantage of these special prices!</p>
    
    <div style="background: #fef3c7; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center;">
      <p style="font-size: 48px; margin: 0; font-weight: bold; color: #f59e0b;">{{years}} YEARS</p>
      <p style="font-size: 32px; margin: 15px 0 0 0; font-weight: bold; color: #f59e0b;">{{discount_percent}}% OFF</p>
      <p style="font-size: 18px; margin: 15px 0 0 0; color: #4a5568;">Everything Included</p>
    </div>
    
    <div style="background: #e3f2fd; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #2196f3;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">🎊 Celebration Special</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">This anniversary sale includes:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;"><strong>All premium features:</strong> Complete access to everything we offer</li>
        <li style="margin-bottom: 8px;"><strong>Distribution services:</strong> Expand your reach to all platforms</li>
        <li style="margin-bottom: 8px;"><strong>Marketing tools:</strong> Promote your music effectively</li>
        <li style="margin-bottom: 8px;"><strong>Priority support:</strong> Get help whenever you need it</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>🎉 Join the Celebration:</strong> This {{years}}-year milestone is a celebration of our community, our platform, and the incredible music creators we''ve had the privilege to support. We''re grateful for every artist who has been part of our journey, and this anniversary sale is our way of saying thank you. Join us in celebrating and take advantage of these incredible savings!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{promo_url}}" style="background: #f5576c; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Join Celebration</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f5576c;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Thank you for being part of our journey:</strong> Reaching {{years}} years wouldn''t have been possible without amazing creators like you. This anniversary sale is our way of celebrating this milestone with you and giving back to the community that has made it all possible. Thank you for being part of our story, and here''s to many more years of supporting music creators!</p>
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
  body_text_template = '🎉 Anniversary Sale – Celebrate With Us!

Hi {{user_name}},

Celebrating {{years}} years! Join the celebration with {{discount_percent}}% off everything! We''re thrilled to be celebrating {{years}} years of MSC & Co, and we want you to be part of the celebration! This milestone represents years of supporting music creators, building innovative tools, and helping artists achieve their dreams. To mark this special occasion, we''re offering incredible savings on everything – premium features, distribution services, marketing tools, and more. Join us in celebrating this anniversary and take advantage of these special prices!

{{years}} YEARS
{{discount_percent}}% OFF
Everything Included

🎊 Celebration Special

This anniversary sale includes:
- All premium features: Complete access to everything we offer
- Distribution services: Expand your reach to all platforms
- Marketing tools: Promote your music effectively
- Priority support: Get help whenever you need it

🎉 Join the Celebration: This {{years}}-year milestone is a celebration of our community, our platform, and the incredible music creators we''ve had the privilege to support. We''re grateful for every artist who has been part of our journey, and this anniversary sale is our way of saying thank you. Join us in celebrating and take advantage of these incredible savings!

Join Celebration: {{promo_url}}

Thank you for being part of our journey: Reaching {{years}} years wouldn''t have been possible without amazing creators like you. This anniversary sale is our way of celebrating this milestone with you and giving back to the community that has made it all possible. Thank you for being part of our story, and here''s to many more years of supporting music creators!

Best regards,
The MSC & Co Team'
WHERE name = 'Promotion - Anniversary Sale';

-- ===========================================
-- UPDATE COMPLETE
-- ===========================================
-- Updated 20 promotion templates with enhanced content:
-- 1. Promotion - Black Friday
-- 2. Promotion - Cyber Monday
-- 3. Promotion - New Year Sale
-- 4. Promotion - Summer Sale
-- 5. Promotion - Spring Sale
-- 6. Promotion - Flash Sale 48hr
-- 7. Promotion - Flash Sale 72hr
-- 8. Promotion - Student Discount
-- 9. Promotion - Annual Plan Discount
-- 10. Promotion - Limited Time Offer
-- 11. Promotion - Early Bird Special
-- 12. Promotion - Weekend Special
-- 13. Promotion - New Year Special
-- 14. Promotion - Birthday Special
-- 15. Promotion - Loyalty Reward
-- 16. Promotion - Comeback Offer
-- 17. Promotion - Upgrade Bonus
-- 18. Promotion - Feature Highlight
-- 19. Promotion - Partnership Deal
-- 20. Promotion - Anniversary Sale
-- ===========================================

