-- ===========================================
-- Pre-built Marketing Email Templates
-- ===========================================
-- Date: 2025-01-26
-- Purpose: Insert comprehensive pre-built email templates for internal company use
-- ===========================================

-- ===========================================
-- 1. WELCOME & ONBOARDING TEMPLATES
-- ===========================================

-- Welcome Email - New User
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Welcome - New User',
  'Welcome email for newly registered users on the platform',
  'Welcome to MSC & Co! 🎵',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to MSC & Co!</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      We''re thrilled to have you join the MSC & Co family! You''re now part of a platform designed to empower artists, labels, and industry professionals.
    </p>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <h2 style="color: #2d3748; margin-top: 0; font-size: 20px;">🎯 Get Started:</h2>
      <ul style="margin: 15px 0; padding-left: 25px; color: #4a5568;">
        <li style="margin-bottom: 10px;">Complete your profile to unlock all features</li>
        <li style="margin-bottom: 10px;">Explore the dashboard and discover what''s possible</li>
        <li style="margin-bottom: 10px;">Check out our resources and tutorials</li>
        <li style="margin-bottom: 10px;">Connect with our community</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{dashboard_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Go to Dashboard</a>
    </div>
    
    <p style="font-size: 14px; color: #718096; margin-top: 40px;">
      Need help? Our support team is here for you. Just reply to this email or visit our help center.
    </p>
    
    <p style="font-size: 16px; margin-top: 30px;">
      Best regards,<br>
      <strong>The MSC & Co Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 30px; padding: 20px; color: #a0aec0; font-size: 12px;">
    <p>MSC & Co | Empowering the Music Industry</p>
    <p style="margin-top: 10px;">
      <a href="{{unsubscribe_url}}" style="color: #a0aec0;">Unsubscribe</a> | 
      <a href="{{preferences_url}}" style="color: #a0aec0;">Email Preferences</a>
    </p>
  </div>
</body>
</html>',
  'Welcome to MSC & Co!

Hi {{user_name}},

We''re thrilled to have you join the MSC & Co family! You''re now part of a platform designed to empower artists, labels, and industry professionals.

Get Started:
- Complete your profile to unlock all features
- Explore the dashboard and discover what''s possible
- Check out our resources and tutorials
- Connect with our community

Go to Dashboard: {{dashboard_url}}

Need help? Our support team is here for you. Just reply to this email or visit our help center.

Best regards,
The MSC & Co Team

---
MSC & Co | Empowering the Music Industry
Unsubscribe: {{unsubscribe_url}} | Email Preferences: {{preferences_url}}',
  'onboarding',
  '["user_name", "dashboard_url", "unsubscribe_url", "preferences_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;

-- Welcome Email - New Artist
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Welcome - New Artist',
  'Welcome email specifically for new artist accounts',
  'Welcome, {{artist_name}}! Let''s Launch Your Music Career 🎤',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Welcome, {{artist_name}}! 🎤</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Welcome to MSC & Co! Your musical journey starts here. We''re here to help you distribute, monetize, and grow your art.
    </p>
    
    <div style="background: #fef5e7; padding: 25px; border-left: 4px solid #f39c12; border-radius: 4px; margin: 30px 0;">
      <h2 style="color: #2d3748; margin-top: 0; font-size: 20px;">🚀 Your Artist Toolkit:</h2>
      <ul style="margin: 15px 0; padding-left: 25px; color: #4a5568;">
        <li style="margin-bottom: 12px;"><strong>Music Distribution:</strong> Release your tracks to major platforms</li>
        <li style="margin-bottom: 12px;"><strong>Analytics Dashboard:</strong> Track streams, earnings, and audience insights</li>
        <li style="margin-bottom: 12px;"><strong>Royalty Management:</strong> Get paid for your music automatically</li>
        <li style="margin-bottom: 12px;"><strong>Marketing Tools:</strong> Promote your releases effectively</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{artist_dashboard_url}}" style="background: #f5576c; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Access Artist Dashboard</a>
    </div>
    
    <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #2e7d32; font-weight: 600;">💡 Pro Tip:</p>
      <p style="margin: 10px 0 0 0; color: #4a5568;">Complete your artist profile and upload your first release to get started!</p>
    </div>
    
    <p style="font-size: 16px; margin-top: 30px;">
      Ready to share your music with the world?<br>
      <strong>The MSC & Co Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 30px; padding: 20px; color: #a0aec0; font-size: 12px;">
    <p>MSC & Co | Empowering Artists Worldwide</p>
  </div>
</body>
</html>',
  'Welcome, {{artist_name}}!

Hi {{user_name}},

Welcome to MSC & Co! Your musical journey starts here. We''re here to help you distribute, monetize, and grow your art.

Your Artist Toolkit:
- Music Distribution: Release your tracks to major platforms
- Analytics Dashboard: Track streams, earnings, and audience insights
- Royalty Management: Get paid for your music automatically
- Marketing Tools: Promote your releases effectively

Access Artist Dashboard: {{artist_dashboard_url}}

Pro Tip: Complete your artist profile and upload your first release to get started!

Ready to share your music with the world?
The MSC & Co Team',
  'onboarding',
  '["user_name", "artist_name", "artist_dashboard_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;

-- Welcome Email - New Label Admin
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Welcome - New Label Admin',
  'Welcome email for new label administrators',
  'Welcome to MSC & Co Label Management! 🎼',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Label Management! 🎼</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Welcome to MSC & Co! You''re now set up to manage {{label_name}} with powerful tools designed for label professionals.
    </p>
    
    <div style="background: #e3f2fd; padding: 25px; border-left: 4px solid #2196f3; border-radius: 4px; margin: 30px 0;">
      <h2 style="color: #2d3748; margin-top: 0; font-size: 20px;">📊 Label Management Features:</h2>
      <ul style="margin: 15px 0; padding-left: 25px; color: #4a5568;">
        <li style="margin-bottom: 12px;"><strong>Artist Roster:</strong> Manage all your artists in one place</li>
        <li style="margin-bottom: 12px;"><strong>Release Management:</strong> Distribute and track all label releases</li>
        <li style="margin-bottom: 12px;"><strong>Financial Dashboard:</strong> Monitor earnings, splits, and royalties</li>
        <li style="margin-bottom: 12px;"><strong>Analytics Suite:</strong> Deep insights into label performance</li>
        <li style="margin-bottom: 12px;"><strong>Team Collaboration:</strong> Invite team members and assign roles</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{label_dashboard_url}}" style="background: #2196f3; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Access Label Dashboard</a>
    </div>
    
    <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #e65100; font-weight: 600;">💼 Next Steps:</p>
      <p style="margin: 10px 0 0 0; color: #4a5568;">1. Add artists to your roster<br>2. Configure label settings and branding<br>3. Set up release workflows<br>4. Invite your team members</p>
    </div>
    
    <p style="font-size: 16px; margin-top: 30px;">
      Let''s build something amazing together!<br>
      <strong>The MSC & Co Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 30px; padding: 20px; color: #a0aec0; font-size: 12px;">
    <p>MSC & Co | Professional Label Management</p>
  </div>
</body>
</html>',
  'Welcome to Label Management!

Hi {{user_name}},

Welcome to MSC & Co! You''re now set up to manage {{label_name}} with powerful tools designed for label professionals.

Label Management Features:
- Artist Roster: Manage all your artists in one place
- Release Management: Distribute and track all label releases
- Financial Dashboard: Monitor earnings, splits, and royalties
- Analytics Suite: Deep insights into label performance
- Team Collaboration: Invite team members and assign roles

Access Label Dashboard: {{label_dashboard_url}}

Next Steps:
1. Add artists to your roster
2. Configure label settings and branding
3. Set up release workflows
4. Invite your team members

Let''s build something amazing together!
The MSC & Co Team',
  'onboarding',
  '["user_name", "label_name", "label_dashboard_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;

-- ===========================================
-- 2. PRODUCT & FEATURE ANNOUNCEMENTS
-- ===========================================

-- Feature Announcement
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Feature Announcement',
  'General template for announcing new features or updates',
  '✨ New Feature: {{feature_name}}',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">✨ {{feature_name}}</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">We''re excited to share something new!</p>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      We''re constantly working to improve MSC & Co, and we''re thrilled to introduce <strong>{{feature_name}}</strong>!
    </p>
    
    <div style="background: #f7fafc; padding: 25px; border-radius: 8px; margin: 30px 0;">
      <h2 style="color: #2d3748; margin-top: 0; font-size: 20px;">🎯 What''s New:</h2>
      <div style="color: #4a5568; font-size: 15px; line-height: 1.8;">
        {{feature_description}}
      </div>
    </div>
    
    <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #2e7d32; font-weight: 600;">💡 How It Works:</p>
      <p style="margin: 10px 0 0 0; color: #4a5568;">{{how_it_works}}</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{feature_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Try It Now</a>
    </div>
    
    <p style="font-size: 14px; color: #718096; margin-top: 40px;">
      Have questions? We''d love to hear from you! Reply to this email or visit our help center.
    </p>
    
    <p style="font-size: 16px; margin-top: 30px;">
      Happy creating!<br>
      <strong>The MSC & Co Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 30px; padding: 20px; color: #a0aec0; font-size: 12px;">
    <p>MSC & Co | Always Evolving</p>
  </div>
</body>
</html>',
  'New Feature: {{feature_name}}

Hi {{user_name}},

We''re constantly working to improve MSC & Co, and we''re thrilled to introduce {{feature_name}}!

What''s New:
{{feature_description}}

How It Works:
{{how_it_works}}

Try It Now: {{feature_url}}

Have questions? We''d love to hear from you!

Happy creating!
The MSC & Co Team',
  'announcements',
  '["user_name", "feature_name", "feature_description", "how_it_works", "feature_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;

-- Platform Update
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Platform Update',
  'Template for platform-wide updates and improvements',
  '🚀 MSC & Co Platform Update - {{update_title}}',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🚀 Platform Update</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">{{update_title}}</p>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      We''ve been working hard to improve MSC & Co, and we''re excited to share what''s new!
    </p>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0;">
      <h2 style="color: #2d3748; margin-top: 0; font-size: 20px;">📋 What''s Changed:</h2>
      <div style="color: #4a5568; font-size: 15px; line-height: 1.8; white-space: pre-line;">{{update_details}}</div>
    </div>
    
    <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #c2410c; font-weight: 600;">⚠️ Important:</p>
      <p style="margin: 10px 0 0 0; color: #4a5568;">{{important_notes}}</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{update_url}}" style="background: #11998e; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">View Full Update</a>
    </div>
    
    <p style="font-size: 16px; margin-top: 30px;">
      Thank you for being part of MSC & Co!<br>
      <strong>The MSC & Co Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 30px; padding: 20px; color: #a0aec0; font-size: 12px;">
    <p>MSC & Co | Building the Future of Music</p>
  </div>
</body>
</html>',
  'Platform Update - {{update_title}}

Hi {{user_name}},

We''ve been working hard to improve MSC & Co, and we''re excited to share what''s new!

What''s Changed:
{{update_details}}

Important:
{{important_notes}}

View Full Update: {{update_url}}

Thank you for being part of MSC & Co!
The MSC & Co Team',
  'announcements',
  '["user_name", "update_title", "update_details", "important_notes", "update_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;

-- ===========================================
-- 3. BILLING & SUBSCRIPTION TEMPLATES
-- ===========================================

-- Subscription Renewal Reminder
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Subscription Renewal Reminder',
  'Reminder email for upcoming subscription renewals',
  '🔔 Your {{subscription_tier}} subscription renews in {{days_until_renewal}} days',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🔔 Subscription Renewal Reminder</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Your <strong>{{subscription_tier}}</strong> subscription will automatically renew in <strong>{{days_until_renewal}} days</strong> on {{renewal_date}}.
    </p>
    
    <div style="background: #fef3c7; padding: 25px; border-left: 4px solid #f59e0b; border-radius: 4px; margin: 30px 0;">
      <h2 style="color: #2d3748; margin-top: 0; font-size: 20px;">💰 Renewal Details:</h2>
      <table style="width: 100%; color: #4a5568;">
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Plan:</td>
          <td style="padding: 8px 0; text-align: right;">{{subscription_tier}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Amount:</td>
          <td style="padding: 8px 0; text-align: right;">{{renewal_amount}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Renewal Date:</td>
          <td style="padding: 8px 0; text-align: right;">{{renewal_date}}</td>
        </tr>
      </table>
    </div>
    
    <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #0369a1; font-weight: 600;">💳 Payment Method:</p>
      <p style="margin: 10px 0 0 0; color: #4a5568;">We''ll charge your card ending in {{card_last_4}} on the renewal date.</p>
      <a href="{{update_payment_url}}" style="color: #0369a1; text-decoration: underline; display: inline-block; margin-top: 10px;">Update Payment Method</a>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{billing_url}}" style="background: #f59e0b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Manage Subscription</a>
    </div>
    
    <p style="font-size: 14px; color: #718096; margin-top: 40px;">
      Don''t want to renew? You can cancel anytime from your billing settings. Your subscription will remain active until {{renewal_date}}.
    </p>
    
    <p style="font-size: 16px; margin-top: 30px;">
      Best regards,<br>
      <strong>The MSC & Co Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 30px; padding: 20px; color: #a0aec0; font-size: 12px;">
    <p>MSC & Co | Billing & Subscriptions</p>
  </div>
</body>
</html>',
  'Subscription Renewal Reminder

Hi {{user_name}},

Your {{subscription_tier}} subscription will automatically renew in {{days_until_renewal}} days on {{renewal_date}}.

Renewal Details:
Plan: {{subscription_tier}}
Amount: {{renewal_amount}}
Renewal Date: {{renewal_date}}

Payment Method:
We''ll charge your card ending in {{card_last_4}} on the renewal date.
Update Payment Method: {{update_payment_url}}

Manage Subscription: {{billing_url}}

Don''t want to renew? You can cancel anytime from your billing settings. Your subscription will remain active until {{renewal_date}}.

Best regards,
The MSC & Co Team',
  'billing',
  '["user_name", "subscription_tier", "days_until_renewal", "renewal_date", "renewal_amount", "card_last_4", "update_payment_url", "billing_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;

-- Subscription Expiring Soon
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Subscription Expiring Soon',
  'Warning email when subscription is about to expire',
  '⚠️ Your {{subscription_tier}} subscription expires in {{days_until_expiry}} days',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">⚠️ Subscription Expiring Soon</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Your <strong>{{subscription_tier}}</strong> subscription will expire in <strong>{{days_until_expiry}} days</strong> on {{expiry_date}}.
    </p>
    
    <div style="background: #fee2e2; padding: 25px; border-left: 4px solid #dc2626; border-radius: 4px; margin: 30px 0;">
      <h2 style="color: #2d3748; margin-top: 0; font-size: 20px;">⏰ What Happens Next:</h2>
      <ul style="margin: 15px 0; padding-left: 25px; color: #4a5568;">
        <li style="margin-bottom: 10px;">Your subscription features will be limited after {{expiry_date}}</li>
        <li style="margin-bottom: 10px;">You''ll lose access to premium features and tools</li>
        <li style="margin-bottom: 10px;">Your releases and data will remain safe</li>
      </ul>
    </div>
    
    <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #1e40af; font-weight: 600;">💡 Don''t Lose Access:</p>
      <p style="margin: 10px 0 0 0; color: #4a5568;">Renew now to continue enjoying all {{subscription_tier}} features without interruption!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{renew_subscription_url}}" style="background: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Renew Subscription</a>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{billing_url}}" style="color: #4a5568; text-decoration: underline;">View Billing Settings</a>
    </div>
    
    <p style="font-size: 16px; margin-top: 30px;">
      Questions? We''re here to help!<br>
      <strong>The MSC & Co Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 30px; padding: 20px; color: #a0aec0; font-size: 12px;">
    <p>MSC & Co | Subscription Management</p>
  </div>
</body>
</html>',
  'Subscription Expiring Soon

Hi {{user_name}},

Your {{subscription_tier}} subscription will expire in {{days_until_expiry}} days on {{expiry_date}}.

What Happens Next:
- Your subscription features will be limited after {{expiry_date}}
- You''ll lose access to premium features and tools
- Your releases and data will remain safe

Don''t Lose Access:
Renew now to continue enjoying all {{subscription_tier}} features without interruption!

Renew Subscription: {{renew_subscription_url}}

View Billing Settings: {{billing_url}}

Questions? We''re here to help!
The MSC & Co Team',
  'billing',
  '["user_name", "subscription_tier", "days_until_expiry", "expiry_date", "renew_subscription_url", "billing_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;

-- Payment Failed
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Payment Failed',
  'Notification when a payment fails',
  '❌ Payment Failed - Action Required',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">❌ Payment Failed</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Action Required</p>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      We couldn''t process the payment for your <strong>{{subscription_tier}}</strong> subscription. Your card ending in <strong>{{card_last_4}}</strong> was declined.
    </p>
    
    <div style="background: #fee2e2; padding: 25px; border-left: 4px solid #dc2626; border-radius: 4px; margin: 30px 0;">
      <h2 style="color: #2d3748; margin-top: 0; font-size: 20px;">🔴 What You Need to Do:</h2>
      <ol style="margin: 15px 0; padding-left: 25px; color: #4a5568;">
        <li style="margin-bottom: 10px;">Update your payment method with a valid card</li>
        <li style="margin-bottom: 10px;">Ensure your card has sufficient funds</li>
        <li style="margin-bottom: 10px;">Check with your bank if there are any restrictions</li>
      </ol>
    </div>
    
    <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #c2410c; font-weight: 600;">⚠️ Important:</p>
      <p style="margin: 10px 0 0 0; color: #4a5568;">We''ll retry the payment automatically. If payment continues to fail, your subscription may be paused. Update your payment method now to avoid interruption.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{update_payment_url}}" style="background: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Update Payment Method</a>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{billing_url}}" style="color: #4a5568; text-decoration: underline;">View Billing Settings</a>
    </div>
    
    <p style="font-size: 14px; color: #718096; margin-top: 40px;">
      Need help? Contact our support team and we''ll assist you right away.
    </p>
    
    <p style="font-size: 16px; margin-top: 30px;">
      Best regards,<br>
      <strong>The MSC & Co Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 30px; padding: 20px; color: #a0aec0; font-size: 12px;">
    <p>MSC & Co | Billing Support</p>
  </div>
</body>
</html>',
  'Payment Failed - Action Required

Hi {{user_name}},

We couldn''t process the payment for your {{subscription_tier}} subscription. Your card ending in {{card_last_4}} was declined.

What You Need to Do:
1. Update your payment method with a valid card
2. Ensure your card has sufficient funds
3. Check with your bank if there are any restrictions

Important:
We''ll retry the payment automatically. If payment continues to fail, your subscription may be paused. Update your payment method now to avoid interruption.

Update Payment Method: {{update_payment_url}}

View Billing Settings: {{billing_url}}

Need help? Contact our support team and we''ll assist you right away.

Best regards,
The MSC & Co Team',
  'billing',
  '["user_name", "subscription_tier", "card_last_4", "update_payment_url", "billing_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;

-- ===========================================
-- 4. ENGAGEMENT & RE-ENGAGEMENT TEMPLATES
-- ===========================================

-- Inactive User Re-engagement
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Re-engagement - Inactive User',
  'Re-engagement email for users who haven''t logged in recently',
  'We miss you, {{user_name}}! 🎵',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">We Miss You! 🎵</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      It''s been a while since we''ve seen you on MSC & Co! We''ve been making improvements and have exciting new features waiting for you.
    </p>
    
    <div style="background: #f7fafc; padding: 25px; border-radius: 8px; margin: 30px 0;">
      <h2 style="color: #2d3748; margin-top: 0; font-size: 20px;">🎯 What You''ve Been Missing:</h2>
      <ul style="margin: 15px 0; padding-left: 25px; color: #4a5568;">
        <li style="margin-bottom: 10px;">{{feature_1}}</li>
        <li style="margin-bottom: 10px;">{{feature_2}}</li>
        <li style="margin-bottom: 10px;">{{feature_3}}</li>
      </ul>
    </div>
    
    <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #2e7d32; font-weight: 600;">💡 Quick Stats:</p>
      <p style="margin: 10px 0 0 0; color: #4a5568;">Since you last logged in, you have {{pending_items}} items waiting for your attention.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{dashboard_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Return to Dashboard</a>
    </div>
    
    <p style="font-size: 16px; margin-top: 30px;">
      We''d love to have you back!<br>
      <strong>The MSC & Co Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 30px; padding: 20px; color: #a0aec0; font-size: 12px;">
    <p>MSC & Co | Welcome Back!</p>
  </div>
</body>
</html>',
  'We miss you, {{user_name}}!

Hi {{user_name}},

It''s been a while since we''ve seen you on MSC & Co! We''ve been making improvements and have exciting new features waiting for you.

What You''ve Been Missing:
- {{feature_1}}
- {{feature_2}}
- {{feature_3}}

Quick Stats:
Since you last logged in, you have {{pending_items}} items waiting for your attention.

Return to Dashboard: {{dashboard_url}}

We''d love to have you back!
The MSC & Co Team',
  'engagement',
  '["user_name", "feature_1", "feature_2", "feature_3", "pending_items", "dashboard_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;

-- Release Milestone Celebration
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Milestone - Release Achievement',
  'Celebration email for release milestones',
  '🎉 Congratulations! Your release hit {{milestone}}!',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 32px;">🎉 Congratulations!</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 18px; margin-bottom: 20px; font-weight: 600;">Hi {{user_name}},</p>
    
    <p style="font-size: 18px; margin-bottom: 20px; text-align: center;">
      <strong>{{release_title}}</strong> just hit <strong>{{milestone}}</strong>! 🚀
    </p>
    
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center;">
      <p style="color: white; font-size: 48px; margin: 0; font-weight: bold;">{{milestone_number}}</p>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px;">{{milestone_type}}</p>
    </div>
    
    <div style="background: #fef3c7; padding: 25px; border-radius: 8px; margin: 30px 0;">
      <h2 style="color: #2d3748; margin-top: 0; font-size: 20px;">📊 Your Achievement:</h2>
      <ul style="margin: 15px 0; padding-left: 25px; color: #4a5568;">
        <li style="margin-bottom: 10px;">Release: <strong>{{release_title}}</strong></li>
        <li style="margin-bottom: 10px;">Total Streams: <strong>{{total_streams}}</strong></li>
        <li style="margin-bottom: 10px;">Total Earnings: <strong>{{total_earnings}}</strong></li>
        <li style="margin-bottom: 10px;">Platforms: <strong>{{platform_count}}</strong></li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{release_analytics_url}}" style="background: #f5576c; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">View Analytics</a>
    </div>
    
    <p style="font-size: 16px; margin-top: 30px; text-align: center;">
      Keep up the amazing work!<br>
      <strong>The MSC & Co Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 30px; padding: 20px; color: #a0aec0; font-size: 12px;">
    <p>MSC & Co | Celebrating Your Success</p>
  </div>
</body>
</html>',
  'Congratulations! Your release hit {{milestone}}!

Hi {{user_name}},

{{release_title}} just hit {{milestone}}! 🚀

{{milestone_number}} {{milestone_type}}

Your Achievement:
- Release: {{release_title}}
- Total Streams: {{total_streams}}
- Total Earnings: {{total_earnings}}
- Platforms: {{platform_count}}

View Analytics: {{release_analytics_url}}

Keep up the amazing work!
The MSC & Co Team',
  'engagement',
  '["user_name", "release_title", "milestone", "milestone_number", "milestone_type", "total_streams", "total_earnings", "platform_count", "release_analytics_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;

-- ===========================================
-- 5. SUPPORT & HELP TEMPLATES
-- ===========================================

-- Support Ticket Response
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Support - Ticket Response',
  'Template for responding to support tickets',
  'Re: {{ticket_subject}} - Support Response',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Support Response</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Thank you for contacting MSC & Co support regarding: <strong>{{ticket_subject}}</strong>
    </p>
    
    <div style="background: #e3f2fd; padding: 25px; border-left: 4px solid #2196f3; border-radius: 4px; margin: 30px 0;">
      <h2 style="color: #2d3748; margin-top: 0; font-size: 20px;">📋 Ticket Details:</h2>
      <table style="width: 100%; color: #4a5568;">
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Ticket ID:</td>
          <td style="padding: 8px 0; text-align: right;">{{ticket_id}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Status:</td>
          <td style="padding: 8px 0; text-align: right;">{{ticket_status}}</td>
        </tr>
      </table>
    </div>
    
    <div style="background: #f7fafc; padding: 25px; border-radius: 8px; margin: 30px 0;">
      <h2 style="color: #2d3748; margin-top: 0; font-size: 20px;">💬 Our Response:</h2>
      <div style="color: #4a5568; font-size: 15px; line-height: 1.8; white-space: pre-line;">{{support_message}}</div>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{ticket_url}}" style="background: #2196f3; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">View Ticket</a>
    </div>
    
    <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #c2410c; font-weight: 600;">💡 Need More Help?</p>
      <p style="margin: 10px 0 0 0; color: #4a5568;">If you have additional questions, simply reply to this email or visit our help center.</p>
    </div>
    
    <p style="font-size: 16px; margin-top: 30px;">
      Best regards,<br>
      <strong>{{support_agent_name}}</strong><br>
      <span style="color: #718096; font-size: 14px;">MSC & Co Support Team</span>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 30px; padding: 20px; color: #a0aec0; font-size: 12px;">
    <p>MSC & Co | Support & Help</p>
  </div>
</body>
</html>',
  'Re: {{ticket_subject}} - Support Response

Hi {{user_name}},

Thank you for contacting MSC & Co support regarding: {{ticket_subject}}

Ticket Details:
Ticket ID: {{ticket_id}}
Status: {{ticket_status}}

Our Response:
{{support_message}}

View Ticket: {{ticket_url}}

Need More Help?
If you have additional questions, simply reply to this email or visit our help center.

Best regards,
{{support_agent_name}}
MSC & Co Support Team',
  'support',
  '["user_name", "ticket_subject", "ticket_id", "ticket_status", "support_message", "ticket_url", "support_agent_name"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;

-- ===========================================
-- 6. EDUCATIONAL & RESOURCE TEMPLATES
-- ===========================================

-- Educational Newsletter
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Newsletter - Educational Content',
  'Newsletter template for educational content and tips',
  '🎓 {{newsletter_title}} - MSC & Co Newsletter',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">{{newsletter_title}}</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">MSC & Co Newsletter</p>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
    
    <p style="font-size: 16px; margin-bottom: 30px;">
      Welcome to this month''s MSC & Co newsletter! We''ve curated the best tips, insights, and resources to help you succeed in the music industry.
    </p>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0;">
      <h2 style="color: #2d3748; margin-top: 0; font-size: 20px;">📚 Featured Content:</h2>
      <div style="color: #4a5568; font-size: 15px; line-height: 1.8; white-space: pre-line;">{{featured_content}}</div>
    </div>
    
    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #c2410c; font-weight: 600;">💡 Pro Tip of the Month:</p>
      <p style="margin: 10px 0 0 0; color: #4a5568;">{{pro_tip}}</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{newsletter_url}}" style="background: #11998e; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Read Full Newsletter</a>
    </div>
    
    <p style="font-size: 16px; margin-top: 30px;">
      Keep creating!<br>
      <strong>The MSC & Co Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 30px; padding: 20px; color: #a0aec0; font-size: 12px;">
    <p>MSC & Co | Education & Resources</p>
    <p style="margin-top: 10px;"><a href="{{unsubscribe_url}}" style="color: #a0aec0;">Unsubscribe from Newsletter</a></p>
  </div>
</body>
</html>',
  '{{newsletter_title}} - MSC & Co Newsletter

Hi {{user_name}},

Welcome to this month''s MSC & Co newsletter! We''ve curated the best tips, insights, and resources to help you succeed in the music industry.

Featured Content:
{{featured_content}}

Pro Tip of the Month:
{{pro_tip}}

Read Full Newsletter: {{newsletter_url}}

Keep creating!
The MSC & Co Team

---
Unsubscribe from Newsletter: {{unsubscribe_url}}',
  'newsletter',
  '["user_name", "newsletter_title", "featured_content", "pro_tip", "newsletter_url", "unsubscribe_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;

-- ===========================================
-- 7. SECURITY & ACCOUNT TEMPLATES
-- ===========================================

-- Security Alert - Login from New Device
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Security - New Device Login',
  'Security alert for logins from new devices',
  '🔒 Security Alert: New Login Detected',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🔒 Security Alert</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      We detected a login to your MSC & Co account from a new device or location.
    </p>
    
    <div style="background: #fee2e2; padding: 25px; border-left: 4px solid #dc2626; border-radius: 4px; margin: 30px 0;">
      <h2 style="color: #2d3748; margin-top: 0; font-size: 20px;">🔐 Login Details:</h2>
      <table style="width: 100%; color: #4a5568;">
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Date & Time:</td>
          <td style="padding: 8px 0; text-align: right;">{{login_date_time}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Location:</td>
          <td style="padding: 8px 0; text-align: right;">{{login_location}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Device:</td>
          <td style="padding: 8px 0; text-align: right;">{{device_info}}</td>
        </tr>
      </table>
    </div>
    
    <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #1e40af; font-weight: 600;">✅ Was this you?</p>
      <p style="margin: 10px 0 0 0; color: #4a5568;">If this was you, no action is needed. If you don''t recognize this activity, please secure your account immediately.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{security_settings_url}}" style="background: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Review Security Settings</a>
    </div>
    
    <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #c2410c; font-weight: 600;">⚠️ Not You?</p>
      <p style="margin: 10px 0 0 0; color: #4a5568;">If this wasn''t you, change your password immediately and contact our security team.</p>
    </div>
    
    <p style="font-size: 14px; color: #718096; margin-top: 40px;">
      Stay secure!<br>
      <strong>The MSC & Co Security Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 30px; padding: 20px; color: #a0aec0; font-size: 12px;">
    <p>MSC & Co | Account Security</p>
  </div>
</body>
</html>',
  'Security Alert: New Login Detected

Hi {{user_name}},

We detected a login to your MSC & Co account from a new device or location.

Login Details:
Date & Time: {{login_date_time}}
Location: {{login_location}}
Device: {{device_info}}

Was this you?
If this was you, no action is needed. If you don''t recognize this activity, please secure your account immediately.

Review Security Settings: {{security_settings_url}}

Not You?
If this wasn''t you, change your password immediately and contact our security team.

Stay secure!
The MSC & Co Security Team',
  'security',
  '["user_name", "login_date_time", "login_location", "device_info", "security_settings_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;

-- ===========================================
-- 8. ADMIN & INTERNAL COMMUNICATION TEMPLATES
-- ===========================================

-- Admin Announcement
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Admin - Internal Announcement',
  'Template for internal announcements to admins and staff',
  '📢 {{announcement_title}}',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #434343 0%, #000000 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">📢 {{announcement_title}}</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
    
    <div style="background: #f7fafc; padding: 25px; border-radius: 8px; margin: 30px 0;">
      <div style="color: #4a5568; font-size: 15px; line-height: 1.8; white-space: pre-line;">{{announcement_content}}</div>
    </div>
    
    {{#if action_required}}
    <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #c2410c; font-weight: 600;">⚡ Action Required:</p>
      <p style="margin: 10px 0 0 0; color: #4a5568;">{{action_required}}</p>
    </div>
    {{/if}}
    
    {{#if action_url}}
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{action_url}}" style="background: #434343; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">{{action_button_text}}</a>
    </div>
    {{/if}}
    
    <p style="font-size: 16px; margin-top: 30px;">
      Best regards,<br>
      <strong>{{sender_name}}</strong><br>
      <span style="color: #718096; font-size: 14px;">MSC & Co Administration</span>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 30px; padding: 20px; color: #a0aec0; font-size: 12px;">
    <p>MSC & Co | Internal Communication</p>
  </div>
</body>
</html>',
  '{{announcement_title}}

Hi {{user_name}},

{{announcement_content}}

{{#if action_required}}
Action Required: {{action_required}}
{{/if}}

{{#if action_url}}
{{action_button_text}}: {{action_url}}
{{/if}}

Best regards,
{{sender_name}}
MSC & Co Administration',
  'admin',
  '["user_name", "announcement_title", "announcement_content", "action_required", "action_url", "action_button_text", "sender_name"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;

-- ===========================================
-- MIGRATION COMPLETE
-- ===========================================

-- This migration creates comprehensive pre-built email templates:
-- ✅ Welcome & Onboarding (3 templates)
-- ✅ Product & Feature Announcements (2 templates)
-- ✅ Billing & Subscription (3 templates)
-- ✅ Engagement & Re-engagement (2 templates)
-- ✅ Support & Help (1 template)
-- ✅ Educational & Resources (1 template)
-- ✅ Security & Account (1 template)
-- ✅ Admin & Internal Communication (1 template)
-- Total: 14 professional templates ready to use

