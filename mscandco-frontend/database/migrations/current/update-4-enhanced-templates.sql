-- ===========================================
-- UPDATE 4 ENHANCED TEMPLATES
-- ===========================================
-- Date: 2025-01-28
-- Purpose: Update the 4 templates that have been enhanced with professional copy
-- These templates use ON CONFLICT DO NOTHING, so we need UPDATE statements
-- ===========================================

-- 1. Welcome - New User
UPDATE marketing_email_templates
SET 
  subject_template = 'Welcome to MSC & Co – Your Journey Starts Here! 🎵',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">Welcome to MSC & Co!</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">We''re absolutely thrilled to have you join the MSC & Co family! You''ve taken an exciting step forward, and you''re now part of a cutting-edge platform designed to empower artists, labels, and music industry professionals like yourself.</p>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">🎯 Get Started on Your Journey</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">Here''s what you can do right away to make the most of your MSC & Co experience:</p>
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
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{dashboard_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Go to Dashboard</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>Need help getting started?</strong> Our support team is here for you. Simply reply to this email or visit our help center for assistance. We''re committed to making your experience with MSC & Co exceptional.</p>
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
  body_text_template = 'Welcome to MSC & Co – Your Journey Starts Here!

Hi {{user_name}},

We''re absolutely thrilled to have you join the MSC & Co family! You''ve taken an exciting step forward, and you''re now part of a cutting-edge platform designed to empower artists, labels, and music industry professionals like yourself.

Get Started on Your Journey

Here''s what you can do right away to make the most of your MSC & Co experience:
- Complete your profile: Unlock all features by adding your information and preferences
- Explore the dashboard: Discover powerful tools and insights tailored to your needs
- Check out resources: Access tutorials, guides, and best practices from industry experts
- Connect with community: Join a network of talented artists and professionals

💡 Pro Tip: Take a few minutes to complete your profile setup. This will personalize your experience and help you discover features most relevant to your goals.

Go to Dashboard: {{dashboard_url}}

Need help getting started? Our support team is here for you. Simply reply to this email or visit our help center for assistance. We''re committed to making your experience with MSC & Co exceptional.

Best regards,
The MSC & Co Team'
WHERE name = 'Welcome - New User';

-- 2. Billing - Annual Renewal Reminder  
UPDATE marketing_email_templates
SET 
  subject_template = 'Your Annual Subscription Renewal – Action Required',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">Your Annual Subscription Renewal – Action Required</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Your annual MSC & Co subscription is set to automatically renew on <strong>{{renewal_date}}</strong> for <strong>{{amount}}</strong>.</p>
    
    <div style="background: #fff7ed; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f59e0b;">
      <h2 style="color: #92400e; margin-top: 0; font-size: 20px; font-weight: 600;">What this means for you</h2>
      <p style="color: #78350f; margin-bottom: 16px; line-height: 1.7;">This renewal ensures uninterrupted access to:</p>
      <ul style="margin: 0; padding-left: 25px; color: #78350f; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Platform features and tools</li>
        <li style="margin-bottom: 8px;">Priority support</li>
        <li style="margin-bottom: 8px;">Regular updates and new features</li>
        <li style="margin-bottom: 8px;">All benefits of your current plan</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #10b981;">
      <h2 style="color: #065f46; margin-top: 0; font-size: 20px; font-weight: 600;">Action required</h2>
      <p style="color: #047857; margin-bottom: 0; line-height: 1.7;">To avoid service interruption, please confirm your payment method is up to date. You can review and update your billing information at any time before the renewal date.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{renew_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Review & Update Billing Information</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>Need assistance?</strong> If you have questions about your subscription, billing, or plan options, our team is available to help. Reply to this email or visit our support center.</p>
    </div>
    
    <p style="font-size: 14px; color: #718096; margin-top: 40px; line-height: 1.6;">We appreciate your continued partnership and look forward to supporting you in the year ahead.</p>
    
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
  body_text_template = 'Your Annual Subscription Renewal – Action Required

Hi {{user_name}},

Your annual MSC & Co subscription is set to automatically renew on {{renewal_date}} for {{amount}}.

What this means for you

This renewal ensures uninterrupted access to:
- Platform features and tools
- Priority support
- Regular updates and new features
- All benefits of your current plan

Action required

To avoid service interruption, please confirm your payment method is up to date. You can review and update your billing information at any time before the renewal date.

Review & Update Billing Information: {{renew_url}}

Need assistance?

If you have questions about your subscription, billing, or plan options, our team is available to help. Reply to this email or visit our support center.

We appreciate your continued partnership and look forward to supporting you in the year ahead.

Best regards,
The MSC & Co Team'
WHERE name = 'Billing - Annual Renewal Reminder';

-- 3. Billing - Grace Period Ending
UPDATE marketing_email_templates
SET 
  subject_template = '⏰ Grace Period Ending – Action Required',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">⏰ Grace Period Ending – Action Required</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Your MSC & Co subscription is currently in a grace period with <strong>{{days_left}} days remaining</strong>. We wanted to reach out to ensure you don''t experience any interruption to your service.</p>
    
    <div style="background: #fff7ed; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f59e0b;">
      <h2 style="color: #92400e; margin-top: 0; font-size: 20px; font-weight: 600;">What This Means</h2>
      <p style="color: #78350f; margin-bottom: 16px; line-height: 1.7;">During the grace period, you still have access to your account, but your subscription benefits may be limited. To restore full access and continue enjoying all features:</p>
      <ul style="margin: 0; padding-left: 25px; color: #78350f; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Renew your subscription before the grace period ends</li>
        <li style="margin-bottom: 8px;">Ensure your payment method is up to date</li>
        <li style="margin-bottom: 8px;">Contact support if you need assistance with payment options</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #10b981;">
      <h2 style="color: #065f46; margin-top: 0; font-size: 20px; font-weight: 600;">Action Required</h2>
      <p style="color: #047857; margin-bottom: 0; line-height: 1.7;">Renew now to restore full access to all platform features and avoid any service interruption.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{renew_url}}" style="background: #f5576c; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Renew Now</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f5576c;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>Need assistance?</strong> If you have any questions about your subscription or need help with the renewal process, our support team is available to assist you. Simply reply to this email or visit our support center.</p>
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
  body_text_template = '⏰ Grace Period Ending – Action Required

Hi {{user_name}},

Your MSC & Co subscription is currently in a grace period with {{days_left}} days remaining. We wanted to reach out to ensure you don''t experience any interruption to your service.

What This Means

During the grace period, you still have access to your account, but your subscription benefits may be limited. To restore full access and continue enjoying all features:
- Renew your subscription before the grace period ends
- Ensure your payment method is up to date
- Contact support if you need assistance with payment options

Action Required

Renew now to restore full access to all platform features and avoid any service interruption.

Renew Now: {{renew_url}}

Need assistance? If you have any questions about your subscription or need help with the renewal process, our support team is available to assist you. Simply reply to this email or visit our support center.

Best regards,
The MSC & Co Team'
WHERE name = 'Billing - Grace Period Ending';

-- 4. Billing - Subscription Cancelled
UPDATE marketing_email_templates
SET 
  subject_template = '📋 Subscription Cancelled – We''ll Miss You',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">📋 Subscription Cancelled – We''ll Miss You</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">We''re sorry to see you go! Your subscription has been cancelled and will remain active until <strong>{{cancellation_date}}</strong>. We wanted to let you know what happens next and how you can return anytime.</p>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">What Happens Next</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">Here''s what to expect:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Your subscription will remain active until {{cancellation_date}}</li>
        <li style="margin-bottom: 8px;">You''ll continue to have access to all features until that date</li>
        <li style="margin-bottom: 8px;">After {{cancellation_date}}, your account will be moved to a free tier</li>
        <li style="margin-bottom: 8px;">You can reactivate your subscription anytime before or after the cancellation date</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #10b981;">
      <h2 style="color: #065f46; margin-top: 0; font-size: 20px; font-weight: 600;">We''d Love to Have You Back</h2>
      <p style="color: #047857; margin-bottom: 0; line-height: 1.7;">If you change your mind, you can reactivate your subscription at any time with just one click. All your data, settings, and preferences will be preserved.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{reactivate_url}}" style="background: #f5af19; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Reactivate Subscription</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f5af19;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>We''d appreciate your feedback:</strong> If you have a moment, we''d love to hear about your experience. Your input helps us improve our platform for everyone. Simply reply to this email to share your thoughts.</p>
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
  body_text_template = '📋 Subscription Cancelled – We''ll Miss You

Hi {{user_name}},

We''re sorry to see you go! Your subscription has been cancelled and will remain active until {{cancellation_date}}. We wanted to let you know what happens next and how you can return anytime.

What Happens Next

Here''s what to expect:
- Your subscription will remain active until {{cancellation_date}}
- You''ll continue to have access to all features until that date
- After {{cancellation_date}}, your account will be moved to a free tier
- You can reactivate your subscription anytime before or after the cancellation date

We''d Love to Have You Back

If you change your mind, you can reactivate your subscription at any time with just one click. All your data, settings, and preferences will be preserved.

Reactivate Subscription: {{reactivate_url}}

We''d appreciate your feedback: If you have a moment, we''d love to hear about your experience. Your input helps us improve our platform for everyone. Simply reply to this email to share your thoughts.

Best regards,
The MSC & Co Team'
WHERE name = 'Billing - Subscription Cancelled';

-- ===========================================
-- UPDATE COMPLETE
-- ===========================================
-- The 4 enhanced templates have been updated:
-- 1. Welcome - New User
-- 2. Billing - Annual Renewal Reminder
-- 3. Billing - Grace Period Ending
-- 4. Billing - Subscription Cancelled
-- ===========================================

