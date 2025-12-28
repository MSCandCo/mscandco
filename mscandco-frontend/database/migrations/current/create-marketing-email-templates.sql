-- ===========================================
-- ULTIMATE MARKETING EMAIL TEMPLATES LIBRARY
-- ===========================================
-- Date: 2025-01-26
-- Purpose: Comprehensive pre-built email templates for internal company use
-- Total Templates: 100+ professional templates
-- Platform: MSC & Co - Year 3000 Edition
-- ===========================================

-- ===========================================
-- CATEGORY 1: WELCOME & ONBOARDING (8 templates)
-- ===========================================

-- Welcome - New User
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

Need help? Our support team is here for you.

Best regards,
The MSC & Co Team',
  'onboarding',
  '["user_name", "dashboard_url", "unsubscribe_url", "preferences_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;

-- Welcome - New Artist
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

Welcome to MSC & Co! Your musical journey starts here.

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

-- Welcome - New Label Admin
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

Welcome to MSC & Co! You''re now set up to manage {{label_name}}.

Label Management Features:
- Artist Roster: Manage all your artists in one place
- Release Management: Distribute and track all label releases
- Financial Dashboard: Monitor earnings, splits, and royalties
- Analytics Suite: Deep insights into label performance
- Team Collaboration: Invite team members and assign roles

Access Label Dashboard: {{label_dashboard_url}}

Let''s build something amazing together!
The MSC & Co Team',
  'onboarding',
  '["user_name", "label_name", "label_dashboard_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;

-- Onboarding Step 2 - Profile Completion
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Onboarding - Profile Completion',
  'Reminder to complete profile during onboarding',
  'Complete Your Profile - Unlock All Features! ⚡',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Complete Your Profile! ⚡</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      You''re just one step away from unlocking the full power of MSC & Co! Complete your profile to access all premium features.
    </p>
    
    <div style="background: #fff3cd; padding: 25px; border-radius: 8px; margin: 30px 0;">
      <h2 style="color: #2d3748; margin-top: 0; font-size: 20px;">📝 What to Complete:</h2>
      <ul style="margin: 15px 0; padding-left: 25px; color: #4a5568;">
        <li style="margin-bottom: 10px;">Add your profile picture</li>
        <li style="margin-bottom: 10px;">Fill in your bio and description</li>
        <li style="margin-bottom: 10px;">Connect your social media accounts</li>
        <li style="margin-bottom: 10px;">Set up payment information</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{profile_url}}" style="background: #fa709a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Complete Profile Now</a>
    </div>
    
    <p style="font-size: 16px; margin-top: 30px;">
      Let''s get you set up!<br>
      <strong>The MSC & Co Team</strong>
    </p>
  </div>
</body>
</html>',
  'Complete Your Profile - Unlock All Features!

Hi {{user_name}},

You''re just one step away from unlocking the full power of MSC & Co!

What to Complete:
- Add your profile picture
- Fill in your bio and description
- Connect your social media accounts
- Set up payment information

Complete Profile Now: {{profile_url}}

Let''s get you set up!
The MSC & Co Team',
  'onboarding',
  '["user_name", "profile_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;

-- Onboarding Step 3 - First Release
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Onboarding - First Release Guide',
  'Guide for uploading first release',
  '🎵 Ready to Release Your First Track?',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎵 Ready to Release?</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Your profile is looking great! Now let''s get your music out into the world. Uploading your first release is easier than you think.
    </p>
    
    <div style="background: #e0f2fe; padding: 25px; border-radius: 8px; margin: 30px 0;">
      <h2 style="color: #2d3748; margin-top: 0; font-size: 20px;">🚀 Quick Start Guide:</h2>
      <ol style="margin: 15px 0; padding-left: 25px; color: #4a5568;">
        <li style="margin-bottom: 12px;">Upload your audio files (WAV or FLAC recommended)</li>
        <li style="margin-bottom: 12px;">Add artwork and metadata</li>
        <li style="margin-bottom: 12px;">Choose distribution platforms</li>
        <li style="margin-bottom: 12px;">Review and submit for distribution</li>
      </ol>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{releases_url}}" style="background: #30cfd0; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Upload Your First Release</a>
    </div>
    
    <p style="font-size: 16px; margin-top: 30px;">
      Need help? Check out our <a href="{{help_url}}" style="color: #667eea;">distribution guide</a>.<br>
      <strong>The MSC & Co Team</strong>
    </p>
  </div>
</body>
</html>',
  'Ready to Release Your First Track?

Hi {{user_name}},

Your profile is looking great! Now let''s get your music out into the world.

Quick Start Guide:
1. Upload your audio files (WAV or FLAC recommended)
2. Add artwork and metadata
3. Choose distribution platforms
4. Review and submit for distribution

Upload Your First Release: {{releases_url}}

Need help? Check out our distribution guide: {{help_url}}

The MSC & Co Team',
  'onboarding',
  '["user_name", "releases_url", "help_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;

-- ===========================================
-- CATEGORY 2: HOLIDAYS & SEASONAL (25 templates)
-- ===========================================

-- New Year
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Holiday - New Year',
  'New Year greeting and goal-setting email',
  '🎉 Happy New Year from MSC & Co!',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 32px;">🎉 Happy New Year!</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px;">Welcome to {{new_year}}</p>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 18px; margin-bottom: 20px; font-weight: 600;">Hi {{user_name}},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      As we welcome {{new_year}}, we want to thank you for being part of the MSC & Co community. This year is full of possibilities for your music career!
    </p>
    
    <div style="background: #fef3c7; padding: 25px; border-radius: 8px; margin: 30px 0;">
      <h2 style="color: #2d3748; margin-top: 0; font-size: 20px;">🎯 Make {{new_year}} Your Year:</h2>
      <ul style="margin: 15px 0; padding-left: 25px; color: #4a5568;">
        <li style="margin-bottom: 10px;">Set ambitious release goals</li>
        <li style="margin-bottom: 10px;">Grow your audience with our marketing tools</li>
        <li style="margin-bottom: 10px;">Maximize your earnings potential</li>
        <li style="margin-bottom: 10px;">Connect with industry professionals</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{dashboard_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Start Your Year Strong</a>
    </div>
    
    <p style="font-size: 16px; margin-top: 30px; text-align: center;">
      Here''s to an amazing {{new_year}}!<br>
      <strong>The MSC & Co Team</strong>
    </p>
  </div>
</body>
</html>',
  'Happy New Year from MSC & Co!

Hi {{user_name}},

As we welcome {{new_year}}, we want to thank you for being part of the MSC & Co community.

Make {{new_year}} Your Year:
- Set ambitious release goals
- Grow your audience with our marketing tools
- Maximize your earnings potential
- Connect with industry professionals

Start Your Year Strong: {{dashboard_url}}

Here''s to an amazing {{new_year}}!
The MSC & Co Team',
  'holidays',
  '["user_name", "new_year", "dashboard_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;

-- Valentine''s Day
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Holiday - Valentine''s Day',
  'Valentine''s Day special promotion email',
  '💝 Share the Love - Valentine''s Special',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">💝 Happy Valentine''s Day!</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      This Valentine''s Day, share the love with your fans! Whether it''s a romantic ballad or an upbeat love song, now is the perfect time to release.
    </p>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{releases_url}}" style="background: #f5576c; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Release Your Love Song</a>
    </div>
    
    <p style="font-size: 16px; margin-top: 30px; text-align: center;">
      With love,<br>
      <strong>The MSC & Co Team</strong>
    </p>
  </div>
</body>
</html>',
  'Share the Love - Valentine''s Special

Hi {{user_name}},

This Valentine''s Day, share the love with your fans! Whether it''s a romantic ballad or an upbeat love song, now is the perfect time to release.

Release Your Love Song: {{releases_url}}

With love,
The MSC & Co Team',
  'holidays',
  '["user_name", "releases_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;

-- Easter
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Holiday - Easter',
  'Easter holiday greeting email',
  '🐰 Happy Easter from MSC & Co!',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🐰 Happy Easter!</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Wishing you a joyful Easter filled with creativity and inspiration! Spring is the perfect time for new beginnings and fresh releases.
    </p>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{dashboard_url}}" style="background: #fee140; color: #333; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Explore New Features</a>
    </div>
    
    <p style="font-size: 16px; margin-top: 30px; text-align: center;">
      Happy Easter!<br>
      <strong>The MSC & Co Team</strong>
    </p>
  </div>
</body>
</html>',
  'Happy Easter from MSC & Co!

Hi {{user_name}},

Wishing you a joyful Easter filled with creativity and inspiration! Spring is the perfect time for new beginnings and fresh releases.

Explore New Features: {{dashboard_url}}

Happy Easter!
The MSC & Co Team',
  'holidays',
  '["user_name", "dashboard_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;

-- Independence Day (US) / 4th of July
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Holiday - Independence Day',
  '4th of July / Independence Day greeting',
  '🇺🇸 Happy Independence Day!',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #eb3349 0%, #1e3c72 50%, #ffffff 50%, #eb3349 100%); background-size: 100% 200%; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">🇺🇸 Happy Independence Day!</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Celebrate freedom and independence with your music! This Independence Day, let your creativity soar and share your sound with the world.
    </p>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{releases_url}}" style="background: #eb3349; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Release Your Music</a>
    </div>
    
    <p style="font-size: 16px; margin-top: 30px; text-align: center;">
      Celebrate your independence!<br>
      <strong>The MSC & Co Team</strong>
    </p>
  </div>
</body>
</html>',
  'Happy Independence Day!

Hi {{user_name}},

Celebrate freedom and independence with your music! This Independence Day, let your creativity soar and share your sound with the world.

Release Your Music: {{releases_url}}

Celebrate your independence!
The MSC & Co Team',
  'holidays',
  '["user_name", "releases_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;

-- Halloween
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Holiday - Halloween',
  'Halloween themed promotional email',
  '🎃 Spooky Season Special - Get Ready for Halloween!',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; position: relative;">
    <h1 style="color: #ff6b35; margin: 0; font-size: 32px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">🎃 Spooky Season!</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Time for Thrilling Releases</p>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      The spooky season is here! 🎃 Whether you have a haunting ballad or a chilling track, Halloween is the perfect time to release and engage with your fans.
    </p>
    
    <div style="background: #fff3e0; padding: 25px; border-left: 4px solid #ff6b35; border-radius: 4px; margin: 30px 0;">
      <h2 style="color: #2d3748; margin-top: 0; font-size: 20px;">👻 Halloween Release Ideas:</h2>
      <ul style="margin: 15px 0; padding-left: 25px; color: #4a5568;">
        <li style="margin-bottom: 10px;">Spooky-themed singles or EPs</li>
        <li style="margin-bottom: 10px;">Halloween playlist additions</li>
        <li style="margin-bottom: 10px;">Special edition artwork</li>
        <li style="margin-bottom: 10px;">Horror-inspired music videos</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{releases_url}}" style="background: #ff6b35; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Release Your Spooky Track</a>
    </div>
    
    <p style="font-size: 16px; margin-top: 30px; text-align: center;">
      Have a spooktacular Halloween!<br>
      <strong>The MSC & Co Team</strong>
    </p>
  </div>
</body>
</html>',
  'Spooky Season Special - Get Ready for Halloween!

Hi {{user_name}},

The spooky season is here! Whether you have a haunting ballad or a chilling track, Halloween is the perfect time to release.

Halloween Release Ideas:
- Spooky-themed singles or EPs
- Halloween playlist additions
- Special edition artwork
- Horror-inspired music videos

Release Your Spooky Track: {{releases_url}}

Have a spooktacular Halloween!
The MSC & Co Team',
  'holidays',
  '["user_name", "releases_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;

-- Thanksgiving
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Holiday - Thanksgiving',
  'Thanksgiving gratitude and appreciation email',
  '🦃 Thankful for You This Thanksgiving!',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f12711 0%, #f5af19 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🦃 Happy Thanksgiving!</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      This Thanksgiving, we''re grateful for you and the amazing music you create. Thank you for being part of the MSC & Co family!
    </p>
    
    <div style="background: #fff7ed; padding: 25px; border-left: 4px solid #f5af19; border-radius: 4px; margin: 30px 0;">
      <h2 style="color: #2d3748; margin-top: 0; font-size: 20px;">🙏 What We''re Grateful For:</h2>
      <ul style="margin: 15px 0; padding-left: 25px; color: #4a5568;">
        <li style="margin-bottom: 10px;">Your creativity and passion</li>
        <li style="margin-bottom: 10px;">The amazing community we''ve built together</li>
        <li style="margin-bottom: 10px;">Your trust in MSC & Co</li>
        <li style="margin-bottom: 10px;">The incredible music you share with the world</li>
      </ul>
    </div>
    
    <p style="font-size: 16px; margin-top: 30px; text-align: center;">
      Wishing you and your loved ones a wonderful Thanksgiving!<br>
      <strong>The MSC & Co Team</strong>
    </p>
  </div>
</body>
</html>',
  'Thankful for You This Thanksgiving!

Hi {{user_name}},

This Thanksgiving, we''re grateful for you and the amazing music you create.

What We''re Grateful For:
- Your creativity and passion
- The amazing community we''ve built together
- Your trust in MSC & Co
- The incredible music you share with the world

Wishing you and your loved ones a wonderful Thanksgiving!
The MSC & Co Team',
  'holidays',
  '["user_name"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;

-- Christmas
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Holiday - Christmas',
  'Christmas holiday greeting and year-end summary',
  '🎄 Merry Christmas & Happy Holidays from MSC & Co!',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; position: relative;">
    <h1 style="color: white; margin: 0; font-size: 32px;">🎄 Merry Christmas!</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Happy Holidays from All of Us</p>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      As we celebrate this wonderful season, we want to thank you for an incredible year. Your music has touched hearts, and we''re honored to be part of your journey.
    </p>
    
    <div style="background: #e8f5e9; padding: 25px; border-radius: 8px; margin: 30px 0;">
      <h2 style="color: #2d3748; margin-top: 0; font-size: 20px;">🎁 Your Year in Review:</h2>
      <ul style="margin: 15px 0; padding-left: 25px; color: #4a5568;">
        <li style="margin-bottom: 10px;">{{releases_count}} releases distributed</li>
        <li style="margin-bottom: 10px;">{{total_streams}} total streams</li>
        <li style="margin-bottom: 10px;">{{total_earnings}} in earnings</li>
        <li style="margin-bottom: 10px;">Growing your audience every day</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{year_in_review_url}}" style="background: #2ecc71; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">View Your Year in Review</a>
    </div>
    
    <p style="font-size: 16px; margin-top: 30px; text-align: center;">
      Wishing you joy, peace, and continued success in the new year!<br>
      <strong>Merry Christmas from The MSC & Co Team</strong>
    </p>
  </div>
</body>
</html>',
  'Merry Christmas & Happy Holidays from MSC & Co!

Hi {{user_name}},

As we celebrate this wonderful season, we want to thank you for an incredible year.

Your Year in Review:
- {{releases_count}} releases distributed
- {{total_streams}} total streams
- {{total_earnings}} in earnings
- Growing your audience every day

View Your Year in Review: {{year_in_review_url}}

Wishing you joy, peace, and continued success in the new year!
Merry Christmas from The MSC & Co Team',
  'holidays',
  '["user_name", "releases_count", "total_streams", "total_earnings", "year_in_review_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;

-- ===========================================
-- CATEGORY 3: SALES & PROMOTIONS (15 templates)
-- ===========================================

-- Black Friday
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Promotion - Black Friday',
  'Black Friday sale promotion email',
  '🛍️ Black Friday Deal: {{discount_percent}}% Off! Limited Time!',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: #ff4444; margin: 0; font-size: 36px; font-weight: bold;">BLACK FRIDAY</h1>
    <p style="color: white; margin: 10px 0 0 0; font-size: 24px; font-weight: 600;">{{discount_percent}}% OFF</p>
    <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0 0; font-size: 14px;">Limited Time Only</p>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 18px; margin-bottom: 20px; font-weight: 600;">Hi {{user_name}},</p>
    
    <p style="font-size: 18px; margin-bottom: 20px; text-align: center; color: #1a1a1a; font-weight: 600;">
      The biggest sale of the year is here! Don''t miss out on our Black Friday exclusive deal.
    </p>
    
    <div style="background: #ff4444; color: white; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center;">
      <p style="font-size: 48px; margin: 0; font-weight: bold;">{{discount_percent}}%</p>
      <p style="font-size: 24px; margin: 10px 0 0 0;">OFF ALL SUBSCRIPTIONS</p>
      <p style="font-size: 14px; margin: 10px 0 0 0; opacity: 0.9;">Use code: <strong style="font-size: 18px;">{{promo_code}}</strong></p>
    </div>
    
    <div style="background: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; border-radius: 4px; margin: 30px 0;">
      <p style="margin: 0; color: #856404; font-weight: 600;">⏰ Offer Ends:</p>
      <p style="margin: 10px 0 0 0; color: #856404; font-size: 18px; font-weight: bold;">{{offer_end_date}}</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{promo_url}}" style="background: #1a1a1a; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 700; font-size: 18px; letter-spacing: 1px;">CLAIM YOUR DEAL NOW</a>
    </div>
    
    <p style="font-size: 14px; color: #718096; margin-top: 40px; text-align: center;">
      This offer is limited and won''t last long. Upgrade or subscribe now and save big!<br>
      <strong>The MSC & Co Team</strong>
    </p>
  </div>
</body>
</html>',
  'Black Friday Deal: {{discount_percent}}% Off! Limited Time!

Hi {{user_name}},

The biggest sale of the year is here! Don''t miss out on our Black Friday exclusive deal.

{{discount_percent}}% OFF ALL SUBSCRIPTIONS
Use code: {{promo_code}}

Offer Ends: {{offer_end_date}}

CLAIM YOUR DEAL NOW: {{promo_url}}

This offer is limited and won''t last long. Upgrade or subscribe now and save big!
The MSC & Co Team',
  'promotions',
  '["user_name", "discount_percent", "promo_code", "offer_end_date", "promo_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;

-- Cyber Monday
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Promotion - Cyber Monday',
  'Cyber Monday digital services promotion',
  '💻 Cyber Monday: Exclusive Digital Services Deal!',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">💻 CYBER MONDAY</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 20px;">Digital Services Special</p>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Cyber Monday is here! Get exclusive deals on premium features, distribution services, and marketing tools.
    </p>
    
    <div style="background: #e3f2fd; padding: 25px; border-radius: 8px; margin: 30px 0;">
      <h2 style="color: #2d3748; margin-top: 0; font-size: 20px;">🎁 Cyber Monday Deals:</h2>
      <ul style="margin: 15px 0; padding-left: 25px; color: #4a5568;">
        <li style="margin-bottom: 10px;">{{discount_percent}}% off premium subscriptions</li>
        <li style="margin-bottom: 10px;">Free distribution upgrades</li>
        <li style="margin-bottom: 10px;">Discount on marketing campaigns</li>
        <li style="margin-bottom: 10px;">Bonus analytics features</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{promo_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Shop Cyber Monday Deals</a>
    </div>
    
    <p style="font-size: 14px; color: #718096; margin-top: 40px; text-align: center;">
      Offer valid until {{offer_end_date}}<br>
      <strong>The MSC & Co Team</strong>
    </p>
  </div>
</body>
</html>',
  'Cyber Monday: Exclusive Digital Services Deal!

Hi {{user_name}},

Cyber Monday is here! Get exclusive deals on premium features, distribution services, and marketing tools.

Cyber Monday Deals:
- {{discount_percent}}% off premium subscriptions
- Free distribution upgrades
- Discount on marketing campaigns
- Bonus analytics features

Shop Cyber Monday Deals: {{promo_url}}

Offer valid until {{offer_end_date}}
The MSC & Co Team',
  'promotions',
  '["user_name", "discount_percent", "promo_url", "offer_end_date"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;

-- New Year Sale
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Promotion - New Year Sale',
  'New Year promotion and fresh start offer',
  '🎉 New Year, New You: Start {{new_year}} with {{discount_percent}}% Off!',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 New Year Sale!</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px;">Start {{new_year}} Right</p>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Kick off {{new_year}} with our exclusive New Year sale! Upgrade your plan and take your music career to the next level.
    </p>
    
    <div style="background: #fef3c7; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center;">
      <p style="font-size: 42px; margin: 0; font-weight: bold; color: #f59e0b;">{{discount_percent}}% OFF</p>
      <p style="font-size: 18px; margin: 10px 0 0 0; color: #4a5568;">All Premium Plans</p>
      <p style="font-size: 14px; margin: 10px 0 0 0; color: #718096;">Code: <strong>{{promo_code}}</strong></p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{promo_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Claim New Year Deal</a>
    </div>
    
    <p style="font-size: 16px; margin-top: 30px; text-align: center;">
      Make {{new_year}} your best year yet!<br>
      <strong>The MSC & Co Team</strong>
    </p>
  </div>
</body>
</html>',
  'New Year, New You: Start {{new_year}} with {{discount_percent}}% Off!

Hi {{user_name}},

Kick off {{new_year}} with our exclusive New Year sale! Upgrade your plan and take your music career to the next level.

{{discount_percent}}% OFF All Premium Plans
Code: {{promo_code}}

Claim New Year Deal: {{promo_url}}

Make {{new_year}} your best year yet!
The MSC & Co Team',
  'promotions',
  '["user_name", "new_year", "discount_percent", "promo_code", "promo_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;

-- Summer Sale
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Promotion - Summer Sale',
  'Summer season promotion email',
  '☀️ Summer Sale: Hot Deals to Heat Up Your Music Career!',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">☀️ Summer Sale!</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Hot Deals Inside</p>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Summer is heating up, and so are our deals! Take advantage of our exclusive summer sale to boost your music career.
    </p>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{promo_url}}" style="background: #f5576c; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Shop Summer Deals</a>
    </div>
    
    <p style="font-size: 16px; margin-top: 30px; text-align: center;">
      Have an amazing summer!<br>
      <strong>The MSC & Co Team</strong>
    </p>
  </div>
</body>
</html>',
  'Summer Sale: Hot Deals to Heat Up Your Music Career!

Hi {{user_name}},

Summer is heating up, and so are our deals! Take advantage of our exclusive summer sale.

Shop Summer Deals: {{promo_url}}

Have an amazing summer!
The MSC & Co Team',
  'promotions',
  '["user_name", "promo_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;

-- ===========================================
-- CATEGORY 4: ENGAGEMENT & RETENTION (20 templates)
-- ===========================================

-- Milestone - 1000 Streams
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Milestone - 1000 Streams',
  'Celebration email for reaching 1000 streams',
  '🎉 Congratulations! You''ve Hit 1,000 Streams!',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 32px;">🎉 1,000 Streams!</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 18px; margin-bottom: 20px; font-weight: 600;">Congratulations, {{user_name}}!</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      You''ve just hit an amazing milestone - <strong>1,000 streams</strong> on {{release_title}}! This is just the beginning.
    </p>
    
    <div style="background: #e8f5e9; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center;">
      <p style="font-size: 48px; margin: 0; font-weight: bold; color: #2e7d32;">1,000</p>
      <p style="font-size: 18px; margin: 10px 0 0 0; color: #4a5568;">Streams and Counting!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{analytics_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">View Your Analytics</a>
    </div>
    
    <p style="font-size: 16px; margin-top: 30px; text-align: center;">
      Keep up the amazing work!<br>
      <strong>The MSC & Co Team</strong>
    </p>
  </div>
</body>
</html>',
  'Congratulations! You''ve Hit 1,000 Streams!

Congratulations, {{user_name}}!

You''ve just hit an amazing milestone - 1,000 streams on {{release_title}}! This is just the beginning.

1,000 Streams and Counting!

View Your Analytics: {{analytics_url}}

Keep up the amazing work!
The MSC & Co Team',
  'engagement',
  '["user_name", "release_title", "analytics_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;

-- Win-Back - Inactive User
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Win-Back - Inactive User',
  'Re-engagement email for users who haven''t been active',
  'We Miss You, {{user_name}}! 🎵',
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
        <li style="margin-bottom: 10px;">{{new_feature_1}}</li>
        <li style="margin-bottom: 10px;">{{new_feature_2}}</li>
        <li style="margin-bottom: 10px;">{{new_feature_3}}</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{dashboard_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Return to Dashboard</a>
    </div>
    
    <p style="font-size: 16px; margin-top: 30px; text-align: center;">
      We''d love to have you back!<br>
      <strong>The MSC & Co Team</strong>
    </p>
  </div>
</body>
</html>',
  'We Miss You, {{user_name}}!

Hi {{user_name}},

It''s been a while since we''ve seen you on MSC & Co! We''ve been making improvements and have exciting new features waiting for you.

What You''ve Been Missing:
- {{new_feature_1}}
- {{new_feature_2}}
- {{new_feature_3}}

Return to Dashboard: {{dashboard_url}}

We''d love to have you back!
The MSC & Co Team',
  'engagement',
  '["user_name", "new_feature_1", "new_feature_2", "new_feature_3", "dashboard_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- ===========================================
-- CONTINUING COMPREHENSIVE TEMPLATE LIBRARY
-- ===========================================

-- Holiday - St. Patrick's Day
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Holiday - St. Patrick''s Day',
  'St. Patrick''s Day greeting email',
  '☘️ Happy St. Patrick''s Day from MSC & Co!',
  '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;"><div style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;"><h1 style="color: white; margin: 0; font-size: 28px;">☘️ Happy St. Patrick''s Day!</h1></div><div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"><p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p><p style="font-size: 16px; margin-bottom: 20px;">Wishing you luck and success this St. Patrick''s Day! May your music reach new heights!</p><div style="text-align: center; margin: 40px 0;"><a href="{{dashboard_url}}" style="background: #2ecc71; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Explore Platform</a></div><p style="font-size: 16px; margin-top: 30px; text-align: center;">Sláinte!<br><strong>The MSC & Co Team</strong></p></div></body></html>',
  'Happy St. Patrick''s Day! Hi {{user_name}}, Wishing you luck and success this St. Patrick''s Day! Explore Platform: {{dashboard_url}} Sláinte! The MSC & Co Team',
  'holidays',
  '["user_name", "dashboard_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;

-- ===========================================
-- ADDITIONAL COMPREHENSIVE TEMPLATES
-- Generated programmatically for consistency
-- ===========================================

-- Holiday - Mother's Day
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Holiday - Mother''s Day',
  'Mother''s Day appreciation email',
  '💐 Happy Mother''s Day - Celebrate with Music!',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">💐 Happy Mother''s Day</h1>
  </div>
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
    <p style=''font-size: 16px; margin-bottom: 20px;''>This Mother''s Day, honor the special mothers in your life with the gift of music!</p>
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{share_url}}" style="background: #f093fb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Share Music</a>
    </div>
    <p style="font-size: 16px; margin-top: 30px; text-align: center;">
      Best regards<br>
      <strong>The MSC & Co Team</strong>
    </p>
  </div>
  <div style="text-align: center; margin-top: 30px; padding: 20px; color: #a0aec0; font-size: 12px;">
    <p>MSC & Co | Empowering the Music Industry</p>
  </div>
</body>
</html>',
  'Happy Mother''s Day! Celebrate with music. Share Music: {{share_url}}',
  'holidays',
  '["user_name", "share_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;

-- Holiday - Father's Day
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Holiday - Father''s Day',
  'Father''s Day appreciation email',
  '👔 Happy Father''s Day - Gift the Music Lover!',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">👔 Happy Father''s Day</h1>
  </div>
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
    <p style=''font-size: 16px; margin-bottom: 20px;''>Celebrate Father''s Day with the perfect music gift!</p>
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{gifts_url}}" style="background: #4facfe; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Shop Music Gifts</a>
    </div>
    <p style="font-size: 16px; margin-top: 30px; text-align: center;">
      Best regards<br>
      <strong>The MSC & Co Team</strong>
    </p>
  </div>
  <div style="text-align: center; margin-top: 30px; padding: 20px; color: #a0aec0; font-size: 12px;">
    <p>MSC & Co | Empowering the Music Industry</p>
  </div>
</body>
</html>',
  'Happy Father''s Day! Shop Music Gifts: {{gifts_url}}',
  'holidays',
  '["user_name", "gifts_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;

-- Holiday - Labor Day
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Holiday - Labor Day',
  'Labor Day celebration',
  '👷 Happy Labor Day - Celebrating Your Hard Work!',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">👷 Happy Labor Day</h1>
  </div>
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
    <p style=''font-size: 16px; margin-bottom: 20px;''>Thank you for your hard work and dedication to your craft!</p>
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{dashboard_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Relax & Enjoy</a>
    </div>
    <p style="font-size: 16px; margin-top: 30px; text-align: center;">
      Best regards<br>
      <strong>The MSC & Co Team</strong>
    </p>
  </div>
  <div style="text-align: center; margin-top: 30px; padding: 20px; color: #a0aec0; font-size: 12px;">
    <p>MSC & Co | Empowering the Music Industry</p>
  </div>
</body>
</html>',
  'Happy Labor Day! Thank you for your hard work. Relax & Enjoy: {{dashboard_url}}',
  'holidays',
  '["user_name", "dashboard_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;



-- ===========================================
-- CONTINUING COMPREHENSIVE TEMPLATE LIBRARY
-- Adding remaining templates to reach 100+
-- ===========================================

-- CATEGORY: PROMOTIONS - Spring Sale
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Promotion - Spring Sale',
  'Spring season promotion email',
  '🌸 Spring Sale - Fresh Start for Your Music Career!',
  '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;"><div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;"><h1 style="color: white; margin: 0; font-size: 28px;">🌸 Spring Sale!</h1><p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Fresh Start for Your Music</p></div><div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"><p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p><p style="font-size: 16px; margin-bottom: 20px;">Spring is here, and so is our exclusive sale! It''s the perfect time to refresh your music career with our premium features at unbeatable prices.</p><div style="background: #fef3c7; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center;"><p style="font-size: 42px; margin: 0; font-weight: bold; color: #f59e0b;">{{discount_percent}}% OFF</p><p style="font-size: 18px; margin: 10px 0 0 0; color: #4a5568;">All Premium Plans</p></div><div style="text-align: center; margin: 40px 0;"><a href="{{promo_url}}" style="background: #f5576c; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Shop Spring Deals</a></div><p style="font-size: 16px; margin-top: 30px; text-align: center;">Enjoy the spring season!<br><strong>The MSC & Co Team</strong></p></div></body></html>',
  'Spring Sale - Fresh Start! Hi {{user_name}}, Spring is here, and so is our exclusive sale! {{discount_percent}}% OFF All Premium Plans. Shop Spring Deals: {{promo_url}} Enjoy the spring season! The MSC & Co Team',
  'promotions',
  '["user_name", "discount_percent", "promo_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- ===========================================
-- COMPREHENSIVE TEMPLATE LIBRARY EXPANSION
-- Adding 80+ additional templates to reach 100+
-- ===========================================

-- Additional Holiday Templates
-- Holiday - Mother's Day
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Holiday - Mother''s Day',
  'Mother''s Day appreciation email',
  '💐 Happy Mother''s Day - Celebrate with Music!',
  '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;"><div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;"><h1 style="color: white; margin: 0; font-size: 28px;">💐 Happy Mother''s Day!</h1></div><div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"><p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p><p style="font-size: 16px; margin-bottom: 20px;">This Mother''s Day, honor the special mothers in your life with the gift of music. Share the love through melodies!</p><div style="text-align: center; margin: 40px 0;"><a href="{{share_url}}" style="background: #f5576c; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Share Music</a></div><p style="font-size: 16px; margin-top: 30px; text-align: center;">Happy Mother''s Day!<br><strong>The MSC & Co Team</strong></p></div></body></html>',
  'Happy Mother''s Day! Hi {{user_name}}, This Mother''s Day, honor the special mothers in your life with the gift of music. Share Music: {{share_url}} Happy Mother''s Day! The MSC & Co Team',
  'holidays',
  '["user_name", "share_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;

-- Holiday - Father's Day
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Holiday - Father''s Day',
  'Father''s Day celebration',
  '👔 Happy Father''s Day!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">👔 👔 Happy Father''s Day!</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Celebrate Father''s Day with the perfect music gift! Show dad you care with a special musical experience.</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{gifts_url}}" style="background: #4facfe; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Shop Music Gifts</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '👔 Happy Father''s Day!

Hi {{user_name}},

Celebrate Father''s Day with the perfect music gift! Show dad you care with a special musical experience.

Shop Music Gifts: {{cta_var}}

Best regards,
The MSC & Co Team',
  'holidays',
  '["user_name", "gifts_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Holiday - Memorial Day
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Holiday - Memorial Day',
  'Memorial Day remembrance',
  '🇺🇸 Memorial Day - Honoring & Remembering',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #eb3349 0%, #1e3c72 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🇺🇸 🇺🇸 Memorial Day</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">On this Memorial Day, we honor and remember those who served. Music brings us together in remembrance.</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{dashboard_url}}" style="background: #eb3349; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Explore Platform</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🇺🇸 Memorial Day - Honoring & Remembering

Hi {{user_name}},

On this Memorial Day, we honor and remember those who served. Music brings us together in remembrance.

Explore Platform: {{cta_var}}

Best regards,
The MSC & Co Team',
  'holidays',
  '["user_name", "dashboard_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Holiday - Diwali
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Holiday - Diwali',
  'Diwali festival greeting',
  '🪔 Happy Diwali - Festival of Lights!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🪔 🪔 Happy Diwali</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Wishing you a joyous Diwali filled with light, music, and celebration! May this festival bring you prosperity.</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{dashboard_url}}" style="background: #f5af19; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Celebrate with Music</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🪔 Happy Diwali - Festival of Lights!

Hi {{user_name}},

Wishing you a joyous Diwali filled with light, music, and celebration! May this festival bring you prosperity.

Celebrate with Music: {{cta_var}}

Best regards,
The MSC & Co Team',
  'holidays',
  '["user_name", "dashboard_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Holiday - Hanukkah
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Holiday - Hanukkah',
  'Hanukkah greeting',
  '🕎 Happy Hanukkah - Eight Nights of Music!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🕎 🕎 Happy Hanukkah</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Wishing you a wonderful Hanukkah filled with light, joy, and beautiful music! Celebrate each night with melody.</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{dashboard_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Explore Platform</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🕎 Happy Hanukkah - Eight Nights of Music!

Hi {{user_name}},

Wishing you a wonderful Hanukkah filled with light, joy, and beautiful music! Celebrate each night with melody.

Explore Platform: {{cta_var}}

Best regards,
The MSC & Co Team',
  'holidays',
  '["user_name", "dashboard_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Holiday - Chinese New Year
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Holiday - Chinese New Year',
  'Chinese New Year greeting',
  '🧧 Happy Chinese New Year!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #eb3349 0%, #f5af19 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🧧 🧧 Happy Chinese New Year!</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Wishing you prosperity, happiness, and success in the Year of {{year_animal}}! May your music career flourish!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{dashboard_url}}" style="background: #eb3349; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Start the New Year</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🧧 Happy Chinese New Year!

Hi {{user_name}},

Wishing you prosperity, happiness, and success in the Year of {{year_animal}}! May your music career flourish!

Start the New Year: {{cta_var}}

Best regards,
The MSC & Co Team',
  'holidays',
  '["user_name", "year_animal", "dashboard_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Holiday - Ramadan
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Holiday - Ramadan',
  'Ramadan greeting',
  '🌙 Ramadan Mubarak - Wishing You Peace',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🌙 🌙 Ramadan Mubarak</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Ramadan Mubarak! Wishing you peace, blessings, and spiritual growth during this holy month.</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{dashboard_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Explore Platform</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🌙 Ramadan Mubarak - Wishing You Peace

Hi {{user_name}},

Ramadan Mubarak! Wishing you peace, blessings, and spiritual growth during this holy month.

Explore Platform: {{cta_var}}

Best regards,
The MSC & Co Team',
  'holidays',
  '["user_name", "dashboard_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Holiday - International Women's Day
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Holiday - International Women''s Day',
  'Women''s Day celebration',
  '👩 International Women''s Day - Celebrating Women!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">👩 👩 International Women''s Day</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Today we celebrate the incredible women shaping the music industry. Your voice matters!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{dashboard_url}}" style="background: #f093fb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Celebrate Women</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '👩 International Women''s Day - Celebrating Women!

Hi {{user_name}},

Today we celebrate the incredible women shaping the music industry. Your voice matters!

Celebrate Women: {{cta_var}}

Best regards,
The MSC & Co Team',
  'holidays',
  '["user_name", "dashboard_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Holiday - Pride Month
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Holiday - Pride Month',
  'Pride Month celebration',
  '🌈 Happy Pride Month - Love is Love!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🌈 🌈 Happy Pride Month</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Celebrating love, diversity, and inclusion this Pride Month. Music brings us all together!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{dashboard_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Celebrate Pride</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🌈 Happy Pride Month - Love is Love!

Hi {{user_name}},

Celebrating love, diversity, and inclusion this Pride Month. Music brings us all together!

Celebrate Pride: {{cta_var}}

Best regards,
The MSC & Co Team',
  'holidays',
  '["user_name", "dashboard_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Holiday - Earth Day
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Holiday - Earth Day',
  'Earth Day environmental message',
  '🌍 Happy Earth Day - Music for Our Planet!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🌍 🌍 Happy Earth Day</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">On Earth Day, we celebrate our planet and the music that connects us all to nature.</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{dashboard_url}}" style="background: #2ecc71; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Explore Green Initiatives</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🌍 Happy Earth Day - Music for Our Planet!

Hi {{user_name}},

On Earth Day, we celebrate our planet and the music that connects us all to nature.

Explore Green Initiatives: {{cta_var}}

Best regards,
The MSC & Co Team',
  'holidays',
  '["user_name", "dashboard_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Holiday - Black History Month
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Holiday - Black History Month',
  'Black History Month celebration',
  '✊ Black History Month - Celebrating Excellence!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">✊ ✊ Black History Month</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Honoring the incredible contributions of Black artists to music history. Your legacy inspires us all!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{dashboard_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Explore History</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '✊ Black History Month - Celebrating Excellence!

Hi {{user_name}},

Honoring the incredible contributions of Black artists to music history. Your legacy inspires us all!

Explore History: {{cta_var}}

Best regards,
The MSC & Co Team',
  'holidays',
  '["user_name", "dashboard_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Holiday - Hispanic Heritage Month
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Holiday - Hispanic Heritage Month',
  'Hispanic Heritage Month',
  '🎸 Hispanic Heritage Month - ¡Celebramos!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🎸 🎸 Hispanic Heritage Month</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Celebrating Hispanic Heritage Month! Honoring the rich musical traditions and contributions of Hispanic artists.</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{dashboard_url}}" style="background: #f5af19; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Explore Heritage</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🎸 Hispanic Heritage Month - ¡Celebramos!

Hi {{user_name}},

Celebrating Hispanic Heritage Month! Honoring the rich musical traditions and contributions of Hispanic artists.

Explore Heritage: {{cta_var}}

Best regards,
The MSC & Co Team',
  'holidays',
  '["user_name", "dashboard_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Holiday - St. Patrick's Day
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Holiday - St. Patrick''s Day',
  'St. Patrick''s Day greeting',
  '☘️ Happy St. Patrick''s Day!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">☘️ ☘️ Happy St. Patrick''s Day!</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Happy St. Patrick''s Day! May your day be filled with music, joy, and a bit of Irish luck!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{dashboard_url}}" style="background: #2ecc71; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Explore Platform</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '☘️ Happy St. Patrick''s Day!

Hi {{user_name}},

Happy St. Patrick''s Day! May your day be filled with music, joy, and a bit of Irish luck!

Explore Platform: {{cta_var}}

Best regards,
The MSC & Co Team',
  'holidays',
  '["user_name", "dashboard_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Holiday - Labor Day
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Holiday - Labor Day',
  'Labor Day celebration',
  '👷 Labor Day - Celebrating Hard Work!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">👷 👷 Labor Day</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Happy Labor Day! Celebrating all the hard work and dedication you put into your music career.</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{dashboard_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Explore Platform</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '👷 Labor Day - Celebrating Hard Work!

Hi {{user_name}},

Happy Labor Day! Celebrating all the hard work and dedication you put into your music career.

Explore Platform: {{cta_var}}

Best regards,
The MSC & Co Team',
  'holidays',
  '["user_name", "dashboard_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Holiday - New Year's Eve
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Holiday - New Year''s Eve',
  'New Year''s Eve celebration',
  '🎊 New Year''s Eve - Ring in the New Year!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🎊 🎊 New Year''s Eve</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">As the year comes to a close, we''re excited for what''s ahead! Here''s to new beginnings and great music!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{dashboard_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Plan for Next Year</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🎊 New Year''s Eve - Ring in the New Year!

Hi {{user_name}},

As the year comes to a close, we''re excited for what''s ahead! Here''s to new beginnings and great music!

Plan for Next Year: {{cta_var}}

Best regards,
The MSC & Co Team',
  'holidays',
  '["user_name", "dashboard_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Holiday - Summer Solstice
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Holiday - Summer Solstice',
  'Summer Solstice celebration',
  '☀️ Summer Solstice - Longest Day, Best Music!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">☀️ ☀️ Summer Solstice</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Happy Summer Solstice! Celebrate the longest day of the year with amazing music!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{dashboard_url}}" style="background: #f5af19; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Explore Summer Releases</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '☀️ Summer Solstice - Longest Day, Best Music!

Hi {{user_name}},

Happy Summer Solstice! Celebrate the longest day of the year with amazing music!

Explore Summer Releases: {{cta_var}}

Best regards,
The MSC & Co Team',
  'holidays',
  '["user_name", "dashboard_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Total additional templates: 15
-- ===========================================
-- COMPREHENSIVE TEMPLATE EXPANSION
-- Adding 90 additional templates
-- ===========================================

-- Holiday - Father's Day
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Holiday - Father''s Day',
  'Father''s Day celebration',
  '👔 Happy Father''s Day!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">👔 👔 Happy Father''s Day!</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Celebrate Father''s Day with the perfect music gift! Show dad you care with a special musical experience.</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{gifts_url}}" style="background: #4facfe; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Shop Music Gifts</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '👔 Happy Father''s Day!

Hi {{user_name}},

Celebrate Father''s Day with the perfect music gift! Show dad you care with a special musical experience.

Shop Music Gifts: {{cta_var}}

Best regards,
The MSC & Co Team',
  'holidays',
  '["user_name", "gifts_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Holiday - Memorial Day
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Holiday - Memorial Day',
  'Memorial Day remembrance',
  '🇺🇸 Memorial Day - Honoring & Remembering',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #eb3349 0%, #1e3c72 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🇺🇸 🇺🇸 Memorial Day</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">On this Memorial Day, we honor and remember those who served. Music brings us together in remembrance.</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{dashboard_url}}" style="background: #eb3349; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Explore Platform</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🇺🇸 Memorial Day - Honoring & Remembering

Hi {{user_name}},

On this Memorial Day, we honor and remember those who served. Music brings us together in remembrance.

Explore Platform: {{cta_var}}

Best regards,
The MSC & Co Team',
  'holidays',
  '["user_name", "dashboard_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Holiday - Diwali
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Holiday - Diwali',
  'Diwali festival greeting',
  '🪔 Happy Diwali - Festival of Lights!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🪔 🪔 Happy Diwali</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Wishing you a joyous Diwali filled with light, music, and celebration! May this festival bring you prosperity.</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{dashboard_url}}" style="background: #f5af19; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Celebrate with Music</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🪔 Happy Diwali - Festival of Lights!

Hi {{user_name}},

Wishing you a joyous Diwali filled with light, music, and celebration! May this festival bring you prosperity.

Celebrate with Music: {{cta_var}}

Best regards,
The MSC & Co Team',
  'holidays',
  '["user_name", "dashboard_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Holiday - Hanukkah
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Holiday - Hanukkah',
  'Hanukkah greeting',
  '🕎 Happy Hanukkah - Eight Nights of Music!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🕎 🕎 Happy Hanukkah</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Wishing you a wonderful Hanukkah filled with light, joy, and beautiful music! Celebrate each night with melody.</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{dashboard_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Explore Platform</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🕎 Happy Hanukkah - Eight Nights of Music!

Hi {{user_name}},

Wishing you a wonderful Hanukkah filled with light, joy, and beautiful music! Celebrate each night with melody.

Explore Platform: {{cta_var}}

Best regards,
The MSC & Co Team',
  'holidays',
  '["user_name", "dashboard_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Holiday - Chinese New Year
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Holiday - Chinese New Year',
  'Chinese New Year greeting',
  '🧧 Happy Chinese New Year!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #eb3349 0%, #f5af19 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🧧 🧧 Happy Chinese New Year!</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Wishing you prosperity, happiness, and success in the Year of {{year_animal}}! May your music career flourish!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{dashboard_url}}" style="background: #eb3349; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Start the New Year</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🧧 Happy Chinese New Year!

Hi {{user_name}},

Wishing you prosperity, happiness, and success in the Year of {{year_animal}}! May your music career flourish!

Start the New Year: {{cta_var}}

Best regards,
The MSC & Co Team',
  'holidays',
  '["user_name", "year_animal", "dashboard_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Holiday - Ramadan
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Holiday - Ramadan',
  'Ramadan greeting',
  '🌙 Ramadan Mubarak - Wishing You Peace',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🌙 🌙 Ramadan Mubarak</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Ramadan Mubarak! Wishing you peace, blessings, and spiritual growth during this holy month.</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{dashboard_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Explore Platform</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🌙 Ramadan Mubarak - Wishing You Peace

Hi {{user_name}},

Ramadan Mubarak! Wishing you peace, blessings, and spiritual growth during this holy month.

Explore Platform: {{cta_var}}

Best regards,
The MSC & Co Team',
  'holidays',
  '["user_name", "dashboard_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Holiday - International Women's Day
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Holiday - International Women''s Day',
  'Women''s Day celebration',
  '👩 International Women''s Day - Celebrating Women!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">👩 👩 International Women''s Day</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Today we celebrate the incredible women shaping the music industry. Your voice matters!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{dashboard_url}}" style="background: #f093fb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Celebrate Women</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '👩 International Women''s Day - Celebrating Women!

Hi {{user_name}},

Today we celebrate the incredible women shaping the music industry. Your voice matters!

Celebrate Women: {{cta_var}}

Best regards,
The MSC & Co Team',
  'holidays',
  '["user_name", "dashboard_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Holiday - Pride Month
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Holiday - Pride Month',
  'Pride Month celebration',
  '🌈 Happy Pride Month - Love is Love!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🌈 🌈 Happy Pride Month</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Celebrating love, diversity, and inclusion this Pride Month. Music brings us all together!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{dashboard_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Celebrate Pride</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🌈 Happy Pride Month - Love is Love!

Hi {{user_name}},

Celebrating love, diversity, and inclusion this Pride Month. Music brings us all together!

Celebrate Pride: {{cta_var}}

Best regards,
The MSC & Co Team',
  'holidays',
  '["user_name", "dashboard_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Holiday - Earth Day
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Holiday - Earth Day',
  'Earth Day environmental message',
  '🌍 Happy Earth Day - Music for Our Planet!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🌍 🌍 Happy Earth Day</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">On Earth Day, we celebrate our planet and the music that connects us all to nature.</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{dashboard_url}}" style="background: #2ecc71; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Explore Green Initiatives</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🌍 Happy Earth Day - Music for Our Planet!

Hi {{user_name}},

On Earth Day, we celebrate our planet and the music that connects us all to nature.

Explore Green Initiatives: {{cta_var}}

Best regards,
The MSC & Co Team',
  'holidays',
  '["user_name", "dashboard_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Holiday - Black History Month
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Holiday - Black History Month',
  'Black History Month celebration',
  '✊ Black History Month - Celebrating Excellence!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">✊ ✊ Black History Month</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Honoring the incredible contributions of Black artists to music history. Your legacy inspires us all!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{dashboard_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Explore History</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '✊ Black History Month - Celebrating Excellence!

Hi {{user_name}},

Honoring the incredible contributions of Black artists to music history. Your legacy inspires us all!

Explore History: {{cta_var}}

Best regards,
The MSC & Co Team',
  'holidays',
  '["user_name", "dashboard_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Holiday - Hispanic Heritage Month
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Holiday - Hispanic Heritage Month',
  'Hispanic Heritage Month',
  '🎸 Hispanic Heritage Month - ¡Celebramos!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🎸 🎸 Hispanic Heritage Month</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Celebrating Hispanic Heritage Month! Honoring the rich musical traditions and contributions of Hispanic artists.</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{dashboard_url}}" style="background: #f5af19; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Explore Heritage</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🎸 Hispanic Heritage Month - ¡Celebramos!

Hi {{user_name}},

Celebrating Hispanic Heritage Month! Honoring the rich musical traditions and contributions of Hispanic artists.

Explore Heritage: {{cta_var}}

Best regards,
The MSC & Co Team',
  'holidays',
  '["user_name", "dashboard_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Holiday - St. Patrick's Day
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Holiday - St. Patrick''s Day',
  'St. Patrick''s Day greeting',
  '☘️ Happy St. Patrick''s Day!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">☘️ ☘️ Happy St. Patrick''s Day!</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Happy St. Patrick''s Day! May your day be filled with music, joy, and a bit of Irish luck!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{dashboard_url}}" style="background: #2ecc71; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Explore Platform</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '☘️ Happy St. Patrick''s Day!

Hi {{user_name}},

Happy St. Patrick''s Day! May your day be filled with music, joy, and a bit of Irish luck!

Explore Platform: {{cta_var}}

Best regards,
The MSC & Co Team',
  'holidays',
  '["user_name", "dashboard_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Holiday - Labor Day
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Holiday - Labor Day',
  'Labor Day celebration',
  '👷 Labor Day - Celebrating Hard Work!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">👷 👷 Labor Day</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Happy Labor Day! Celebrating all the hard work and dedication you put into your music career.</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{dashboard_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Explore Platform</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '👷 Labor Day - Celebrating Hard Work!

Hi {{user_name}},

Happy Labor Day! Celebrating all the hard work and dedication you put into your music career.

Explore Platform: {{cta_var}}

Best regards,
The MSC & Co Team',
  'holidays',
  '["user_name", "dashboard_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Holiday - New Year's Eve
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Holiday - New Year''s Eve',
  'New Year''s Eve celebration',
  '🎊 New Year''s Eve - Ring in the New Year!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🎊 🎊 New Year''s Eve</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">As the year comes to a close, we''re excited for what''s ahead! Here''s to new beginnings and great music!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{dashboard_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Plan for Next Year</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🎊 New Year''s Eve - Ring in the New Year!

Hi {{user_name}},

As the year comes to a close, we''re excited for what''s ahead! Here''s to new beginnings and great music!

Plan for Next Year: {{cta_var}}

Best regards,
The MSC & Co Team',
  'holidays',
  '["user_name", "dashboard_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Holiday - Summer Solstice
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Holiday - Summer Solstice',
  'Summer Solstice celebration',
  '☀️ Summer Solstice - Longest Day, Best Music!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">☀️ ☀️ Summer Solstice</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Happy Summer Solstice! Celebrate the longest day of the year with amazing music!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{dashboard_url}}" style="background: #f5af19; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Explore Summer Releases</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '☀️ Summer Solstice - Longest Day, Best Music!

Hi {{user_name}},

Happy Summer Solstice! Celebrate the longest day of the year with amazing music!

Explore Summer Releases: {{cta_var}}

Best regards,
The MSC & Co Team',
  'holidays',
  '["user_name", "dashboard_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Milestone - 1K Streams
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Milestone - 1K Streams',
  '1,000 streams celebration',
  '🎯 Amazing! 1,000 Streams!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🎯 🎯 Amazing! 1,000 Streams!</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Congratulations! Your release {{release_title}} just reached 1,000 streams! This is just the beginning!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{analytics_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">View Analytics</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🎯 Amazing! 1,000 Streams!

Hi {{user_name}},

Congratulations! Your release {{release_title}} just reached 1,000 streams! This is just the beginning!

View Analytics: {{cta_var}}

Best regards,
The MSC & Co Team',
  'engagement',
  '["user_name", "release_title", "analytics_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Milestone - 10K Streams
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Milestone - 10K Streams',
  '10,000 streams celebration',
  '🎊 Congratulations! 10,000 Streams!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🎊 🎊 Congratulations! 10,000 Streams!</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Incredible! {{release_title}} has hit 10,000 streams! Your music is finding its audience!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{analytics_url}}" style="background: #f5576c; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">View Analytics</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🎊 Congratulations! 10,000 Streams!

Hi {{user_name}},

Incredible! {{release_title}} has hit 10,000 streams! Your music is finding its audience!

View Analytics: {{cta_var}}

Best regards,
The MSC & Co Team',
  'engagement',
  '["user_name", "release_title", "analytics_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Milestone - 100K Streams
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Milestone - 100K Streams',
  '100,000 streams celebration',
  '🌟 Fantastic! 100,000 Streams!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🌟 🌟 Fantastic! 100,000 Streams!</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Outstanding achievement! {{release_title}} has reached 100,000 streams! You''re building a real following!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{analytics_url}}" style="background: #f5af19; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">View Analytics</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🌟 Fantastic! 100,000 Streams!

Hi {{user_name}},

Outstanding achievement! {{release_title}} has reached 100,000 streams! You''re building a real following!

View Analytics: {{cta_var}}

Best regards,
The MSC & Co Team',
  'engagement',
  '["user_name", "release_title", "analytics_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Milestone - 1M Streams
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Milestone - 1M Streams',
  '1,000,000 streams celebration',
  '🏆 Phenomenal! 1 Million Streams!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🏆 🏆 Phenomenal! 1 Million Streams!</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">PHENOMENAL! {{release_title}} has hit ONE MILLION streams! You''re a true success story!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{analytics_url}}" style="background: #2ecc71; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">View Analytics</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🏆 Phenomenal! 1 Million Streams!

Hi {{user_name}},

PHENOMENAL! {{release_title}} has hit ONE MILLION streams! You''re a true success story!

View Analytics: {{cta_var}}

Best regards,
The MSC & Co Team',
  'engagement',
  '["user_name", "release_title", "analytics_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Milestone - First Release
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Milestone - First Release',
  'First release celebration',
  '🎉 Congratulations on Your First Release!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🎉 🎉 Congratulations on Your First Release!</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Amazing! You''ve just released your first track {{release_title}}! This is a huge milestone in your music journey!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{release_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">View Release</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🎉 Congratulations on Your First Release!

Hi {{user_name}},

Amazing! You''ve just released your first track {{release_title}}! This is a huge milestone in your music journey!

View Release: {{cta_var}}

Best regards,
The MSC & Co Team',
  'engagement',
  '["user_name", "release_title", "release_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Milestone - 10 Releases
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Milestone - 10 Releases',
  '10 releases milestone',
  '🎊 10 Releases! You''re Building a Catalog!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🎊 🎊 10 Releases! You''re Building a Catalog!</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Congratulations! You''ve now released 10 tracks! You''re building an impressive catalog of music!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{dashboard_url}}" style="background: #f5576c; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">View Your Releases</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🎊 10 Releases! You''re Building a Catalog!

Hi {{user_name}},

Congratulations! You''ve now released 10 tracks! You''re building an impressive catalog of music!

View Your Releases: {{cta_var}}

Best regards,
The MSC & Co Team',
  'engagement',
  '["user_name", "dashboard_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Milestone - 25 Releases
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Milestone - 25 Releases',
  '25 releases milestone',
  '🌟 25 Releases - Amazing Consistency!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🌟 🌟 25 Releases</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Incredible! 25 releases and counting! Your consistency and dedication are truly inspiring!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{dashboard_url}}" style="background: #f5af19; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">View Catalog</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🌟 25 Releases - Amazing Consistency!

Hi {{user_name}},

Incredible! 25 releases and counting! Your consistency and dedication are truly inspiring!

View Catalog: {{cta_var}}

Best regards,
The MSC & Co Team',
  'engagement',
  '["user_name", "dashboard_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Milestone - 50 Releases
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Milestone - 50 Releases',
  '50 releases milestone',
  '🏆 50 Releases - You''re a Pro!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🏆 🏆 50 Releases</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Outstanding achievement! 50 releases! You''ve established yourself as a prolific artist!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{dashboard_url}}" style="background: #2ecc71; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">View Catalog</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🏆 50 Releases - You''re a Pro!

Hi {{user_name}},

Outstanding achievement! 50 releases! You''ve established yourself as a prolific artist!

View Catalog: {{cta_var}}

Best regards,
The MSC & Co Team',
  'engagement',
  '["user_name", "dashboard_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Milestone - Chart Achievement
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Milestone - Chart Achievement',
  'Chart placement celebration',
  '📈 You''re on the Charts!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">📈 📈 You''re on the Charts!</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Incredible news! {{release_title}} has charted at #{{chart_position}} on {{chart_name}}! Your music is making waves!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{chart_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">View Charts</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '📈 You''re on the Charts!

Hi {{user_name}},

Incredible news! {{release_title}} has charted at #{{chart_position}} on {{chart_name}}! Your music is making waves!

View Charts: {{cta_var}}

Best regards,
The MSC & Co Team',
  'engagement',
  '["user_name", "chart_name", "chart_position", "release_title", "chart_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Milestone - Playlist Feature
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Milestone - Playlist Feature',
  'Playlist feature celebration',
  '📋 You''re on a Major Playlist!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">📋 📋 You''re on a Major Playlist!</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Amazing! {{release_title}} has been featured on {{playlist_name}}! This is a huge opportunity!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{playlist_url}}" style="background: #f5576c; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">View Playlist</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '📋 You''re on a Major Playlist!

Hi {{user_name}},

Amazing! {{release_title}} has been featured on {{playlist_name}}! This is a huge opportunity!

View Playlist: {{cta_var}}

Best regards,
The MSC & Co Team',
  'engagement',
  '["user_name", "playlist_name", "release_title", "playlist_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Promotion - Flash Sale 48hr
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Promotion - Flash Sale 48hr',
  '48-hour flash sale',
  '⚡ FLASH SALE: 48 Hours - Extended!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">⚡ ⚡ FLASH SALE: 48 Hours</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Extended flash sale! 48 hours only! Use code {{promo_code}} for {{discount_percent}}% off all premium plans!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{promo_url}}" style="background: #ff4444; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Claim Deal</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '⚡ FLASH SALE: 48 Hours - Extended!

Hi {{user_name}},

Extended flash sale! 48 hours only! Use code {{promo_code}} for {{discount_percent}}% off all premium plans!

Claim Deal: {{cta_var}}

Best regards,
The MSC & Co Team',
  'promotions',
  '["user_name", "discount_percent", "promo_code", "promo_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Promotion - Flash Sale 72hr
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Promotion - Flash Sale 72hr',
  '72-hour flash sale',
  '🔥 MEGA SALE: 72 Hours - Don''t Miss Out!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🔥 🔥 MEGA SALE: 72 Hours</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Our biggest sale ever! 72 hours of amazing deals! Use code {{promo_code}} for {{discount_percent}}% off!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{promo_url}}" style="background: #ff4444; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Shop Now</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🔥 MEGA SALE: 72 Hours - Don''t Miss Out!

Hi {{user_name}},

Our biggest sale ever! 72 hours of amazing deals! Use code {{promo_code}} for {{discount_percent}}% off!

Shop Now: {{cta_var}}

Best regards,
The MSC & Co Team',
  'promotions',
  '["user_name", "discount_percent", "promo_code", "promo_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Promotion - Student Discount
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Promotion - Student Discount',
  'Student discount offer',
  '🎓 Student Discount - Special Offer!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🎓 🎓 Student Discount</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Exclusive student discount! Get {{discount_percent}}% off with code {{promo_code}}. Perfect for music students!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{promo_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Claim Student Discount</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🎓 Student Discount - Special Offer!

Hi {{user_name}},

Exclusive student discount! Get {{discount_percent}}% off with code {{promo_code}}. Perfect for music students!

Claim Student Discount: {{cta_var}}

Best regards,
The MSC & Co Team',
  'promotions',
  '["user_name", "discount_percent", "promo_code", "promo_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Promotion - Annual Plan Discount
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Promotion - Annual Plan Discount',
  'Annual subscription discount',
  '💎 Annual Plan - Save Big!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">💎 💎 Annual Plan</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Save {{savings_amount}} with our annual plan! Get {{discount_percent}}% off when you commit to a year!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{annual_url}}" style="background: #f5af19; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">View Annual Plans</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '💎 Annual Plan - Save Big!

Hi {{user_name}},

Save {{savings_amount}} with our annual plan! Get {{discount_percent}}% off when you commit to a year!

View Annual Plans: {{cta_var}}

Best regards,
The MSC & Co Team',
  'promotions',
  '["user_name", "discount_percent", "savings_amount", "annual_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Promotion - Limited Time Offer
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Promotion - Limited Time Offer',
  'Limited time promotion',
  '⏰ Limited Time Offer - Act Fast!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">⏰ ⏰ Limited Time Offer</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Only {{hours_left}} hours left! Get {{discount_percent}}% off premium features. Don''t miss this opportunity!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{promo_url}}" style="background: #f5576c; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Claim Offer</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '⏰ Limited Time Offer - Act Fast!

Hi {{user_name}},

Only {{hours_left}} hours left! Get {{discount_percent}}% off premium features. Don''t miss this opportunity!

Claim Offer: {{cta_var}}

Best regards,
The MSC & Co Team',
  'promotions',
  '["user_name", "discount_percent", "hours_left", "promo_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Promotion - Early Bird Special
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Promotion - Early Bird Special',
  'Early bird promotion',
  '🐦 Early Bird Special - Be First!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🐦 🐦 Early Bird Special</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Early bird gets the worm! Get {{discount_percent}}% off with code {{promo_code}}. Limited spots available!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{promo_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Claim Early Bird</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🐦 Early Bird Special - Be First!

Hi {{user_name}},

Early bird gets the worm! Get {{discount_percent}}% off with code {{promo_code}}. Limited spots available!

Claim Early Bird: {{cta_var}}

Best regards,
The MSC & Co Team',
  'promotions',
  '["user_name", "discount_percent", "promo_code", "promo_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Promotion - Weekend Special
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Promotion - Weekend Special',
  'Weekend promotion',
  '🎉 Weekend Special - Fun Deals!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🎉 🎉 Weekend Special</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Weekend vibes! Get {{discount_percent}}% off all weekend long. Perfect time to upgrade!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{promo_url}}" style="background: #f5576c; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Shop Weekend Deals</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🎉 Weekend Special - Fun Deals!

Hi {{user_name}},

Weekend vibes! Get {{discount_percent}}% off all weekend long. Perfect time to upgrade!

Shop Weekend Deals: {{cta_var}}

Best regards,
The MSC & Co Team',
  'promotions',
  '["user_name", "discount_percent", "promo_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Promotion - New Year Special
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Promotion - New Year Special',
  'New Year promotion',
  '🎊 New Year Special - Fresh Start!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🎊 🎊 New Year Special</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Start the new year right! Get {{discount_percent}}% off with code {{promo_code}}. New year, new opportunities!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{promo_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Start Fresh</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🎊 New Year Special - Fresh Start!

Hi {{user_name}},

Start the new year right! Get {{discount_percent}}% off with code {{promo_code}}. New year, new opportunities!

Start Fresh: {{cta_var}}

Best regards,
The MSC & Co Team',
  'promotions',
  '["user_name", "discount_percent", "promo_code", "promo_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Promotion - Birthday Special
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Promotion - Birthday Special',
  'Birthday promotion',
  '🎂 Birthday Special - Celebrate with Us!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🎂 🎂 Birthday Special</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Happy Birthday! We''re giving you {{discount_percent}}% off! Use code {{promo_code}} to claim your birthday gift!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{promo_url}}" style="background: #f093fb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Claim Birthday Gift</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🎂 Birthday Special - Celebrate with Us!

Hi {{user_name}},

Happy Birthday! We''re giving you {{discount_percent}}% off! Use code {{promo_code}} to claim your birthday gift!

Claim Birthday Gift: {{cta_var}}

Best regards,
The MSC & Co Team',
  'promotions',
  '["user_name", "discount_percent", "promo_code", "promo_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Promotion - Loyalty Reward
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Promotion - Loyalty Reward',
  'Loyalty program reward',
  '💎 Loyalty Reward - Thank You!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">💎 💎 Loyalty Reward</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">As a valued member, here''s your special reward: {{reward_description}}. Use code {{promo_code}}!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{promo_url}}" style="background: #f5af19; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Claim Reward</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '💎 Loyalty Reward - Thank You!

Hi {{user_name}},

As a valued member, here''s your special reward: {{reward_description}}. Use code {{promo_code}}!

Claim Reward: {{cta_var}}

Best regards,
The MSC & Co Team',
  'promotions',
  '["user_name", "reward_description", "promo_code", "promo_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Promotion - Comeback Offer
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Promotion - Comeback Offer',
  'Comeback promotion',
  '🎵 Comeback Offer - We Missed You!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🎵 🎵 Comeback Offer</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Welcome back! We missed you. Here''s {{discount_percent}}% off to get you back on track. Use code {{promo_code}}!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{promo_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Welcome Back</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🎵 Comeback Offer - We Missed You!

Hi {{user_name}},

Welcome back! We missed you. Here''s {{discount_percent}}% off to get you back on track. Use code {{promo_code}}!

Welcome Back: {{cta_var}}

Best regards,
The MSC & Co Team',
  'promotions',
  '["user_name", "discount_percent", "promo_code", "promo_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Promotion - Upgrade Bonus
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Promotion - Upgrade Bonus',
  'Upgrade incentive bonus',
  '⭐ Upgrade Bonus - Extra Value!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">⭐ ⭐ Upgrade Bonus</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Upgrade now and get {{bonus_description}}! Double the value when you move to premium!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{upgrade_url}}" style="background: #f5af19; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Upgrade Now</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '⭐ Upgrade Bonus - Extra Value!

Hi {{user_name}},

Upgrade now and get {{bonus_description}}! Double the value when you move to premium!

Upgrade Now: {{cta_var}}

Best regards,
The MSC & Co Team',
  'promotions',
  '["user_name", "bonus_description", "upgrade_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Promotion - Feature Highlight
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Promotion - Feature Highlight',
  'Feature promotion',
  '✨ New Feature - Check It Out!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">✨ ✨ New Feature</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Exciting news! We''ve launched {{feature_name}}: {{feature_description}}. See what''s new!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{feature_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Explore Feature</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '✨ New Feature - Check It Out!

Hi {{user_name}},

Exciting news! We''ve launched {{feature_name}}: {{feature_description}}. See what''s new!

Explore Feature: {{cta_var}}

Best regards,
The MSC & Co Team',
  'promotions',
  '["user_name", "feature_name", "feature_description", "feature_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Promotion - Partnership Deal
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Promotion - Partnership Deal',
  'Partnership promotion',
  '🤝 Partnership Exclusive - Special Deal!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🤝 🤝 Partnership Exclusive</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Exclusive offer through our partnership with {{partner_name}}! Get {{discount_percent}}% off!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{promo_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Claim Partnership Deal</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🤝 Partnership Exclusive - Special Deal!

Hi {{user_name}},

Exclusive offer through our partnership with {{partner_name}}! Get {{discount_percent}}% off!

Claim Partnership Deal: {{cta_var}}

Best regards,
The MSC & Co Team',
  'promotions',
  '["user_name", "partner_name", "discount_percent", "promo_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Promotion - Anniversary Sale
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Promotion - Anniversary Sale',
  'Platform anniversary sale',
  '🎉 Anniversary Sale - Celebrate With Us!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🎉 🎉 Anniversary Sale</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Celebrating {{years}} years! Join the celebration with {{discount_percent}}% off everything!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{promo_url}}" style="background: #f5576c; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Join Celebration</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🎉 Anniversary Sale - Celebrate With Us!

Hi {{user_name}},

Celebrating {{years}} years! Join the celebration with {{discount_percent}}% off everything!

Join Celebration: {{cta_var}}

Best regards,
The MSC & Co Team',
  'promotions',
  '["user_name", "years", "discount_percent", "promo_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Billing - Subscription Renewed
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Billing - Subscription Renewed',
  'Renewal confirmation',
  '✅ Subscription Renewed - Thank You!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">✅ ✅ Subscription Renewed</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Your {{tier}} subscription has been renewed successfully! Next renewal: {{next_renewal_date}}. Thank you for continuing with us!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{billing_url}}" style="background: #2ecc71; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">View Billing</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '✅ Subscription Renewed - Thank You!

Hi {{user_name}},

Your {{tier}} subscription has been renewed successfully! Next renewal: {{next_renewal_date}}. Thank you for continuing with us!

View Billing: {{cta_var}}

Best regards,
The MSC & Co Team',
  'billing',
  '["user_name", "tier", "next_renewal_date", "billing_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Billing - Payment Failed
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Billing - Payment Failed',
  'Payment failure notification',
  '⚠️ Payment Failed - Action Required',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">⚠️ ⚠️ Payment Failed</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">We couldn''t process your payment of {{amount}}. Please update your payment method to continue your subscription.</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{retry_url}}" style="background: #f5576c; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Update Payment</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '⚠️ Payment Failed - Action Required

Hi {{user_name}},

We couldn''t process your payment of {{amount}}. Please update your payment method to continue your subscription.

Update Payment: {{cta_var}}

Best regards,
The MSC & Co Team',
  'billing',
  '["user_name", "amount", "retry_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Billing - Payment Retry Successful
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Billing - Payment Retry Successful',
  'Payment retry success',
  '✅ Payment Successful - All Set!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">✅ ✅ Payment Successful</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Great news! Your payment of {{amount}} has been processed successfully. Your subscription is active!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{invoice_url}}" style="background: #2ecc71; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">View Invoice</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '✅ Payment Successful - All Set!

Hi {{user_name}},

Great news! Your payment of {{amount}} has been processed successfully. Your subscription is active!

View Invoice: {{cta_var}}

Best regards,
The MSC & Co Team',
  'billing',
  '["user_name", "amount", "invoice_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Billing - Expiring Soon 7 Days
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Billing - Expiring Soon 7 Days',
  '7-day expiration warning',
  '⏰ Your Subscription Expires in 7 Days',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">⏰ ⏰ Your Subscription Expires in 7 Days</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Your subscription expires on {{renewal_date}} (7 days). Renew now to avoid interruption!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{renew_url}}" style="background: #f5576c; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Renew Now</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '⏰ Your Subscription Expires in 7 Days

Hi {{user_name}},

Your subscription expires on {{renewal_date}} (7 days). Renew now to avoid interruption!

Renew Now: {{cta_var}}

Best regards,
The MSC & Co Team',
  'billing',
  '["user_name", "renewal_date", "renew_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Billing - Expiring Soon 14 Days
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Billing - Expiring Soon 14 Days',
  '14-day expiration warning',
  '📅 Your Subscription Expires in 14 Days',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">📅 📅 Your Subscription Expires in 14 Days</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Reminder: Your subscription expires on {{renewal_date}} (14 days). Renew early to secure your current rate!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{renew_url}}" style="background: #f5af19; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Renew Now</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '📅 Your Subscription Expires in 14 Days

Hi {{user_name}},

Reminder: Your subscription expires on {{renewal_date}} (14 days). Renew early to secure your current rate!

Renew Now: {{cta_var}}

Best regards,
The MSC & Co Team',
  'billing',
  '["user_name", "renewal_date", "renew_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Billing - Expiring Soon 30 Days
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Billing - Expiring Soon 30 Days',
  '30-day expiration warning',
  '📆 Your Subscription Expires in 30 Days',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">📆 📆 Your Subscription Expires in 30 Days</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Heads up! Your subscription expires on {{renewal_date}} (30 days). Plan ahead and renew to continue!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{renew_url}}" style="background: #f5af19; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Renew Now</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '📆 Your Subscription Expires in 30 Days

Hi {{user_name}},

Heads up! Your subscription expires on {{renewal_date}} (30 days). Plan ahead and renew to continue!

Renew Now: {{cta_var}}

Best regards,
The MSC & Co Team',
  'billing',
  '["user_name", "renewal_date", "renew_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Billing - Invoice Available
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Billing - Invoice Available',
  'Invoice notification',
  '📄 Your Invoice is Ready',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">📄 📄 Your Invoice is Ready</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Your invoice #{{invoice_number}} for {{amount}} is now available. Download it anytime from your account.</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{invoice_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">View Invoice</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '📄 Your Invoice is Ready

Hi {{user_name}},

Your invoice #{{invoice_number}} for {{amount}} is now available. Download it anytime from your account.

View Invoice: {{cta_var}}

Best regards,
The MSC & Co Team',
  'billing',
  '["user_name", "invoice_number", "amount", "invoice_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Billing - Annual Renewal Reminder
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Billing - Annual Renewal Reminder',
  'Annual renewal reminder',
  '📅 Annual Renewal Coming Up',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">📅 📅 Annual Renewal Coming Up</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Your annual subscription renews on {{renewal_date}} for {{amount}}. Ensure your payment method is up to date!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{renew_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Review Billing</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '📅 Annual Renewal Coming Up

Hi {{user_name}},

Your annual subscription renews on {{renewal_date}} for {{amount}}. Ensure your payment method is up to date!

Review Billing: {{cta_var}}

Best regards,
The MSC & Co Team',
  'billing',
  '["user_name", "renewal_date", "amount", "renew_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Billing - Grace Period Ending
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Billing - Grace Period Ending',
  'Grace period warning',
  '⏰ Grace Period Ending - Renew Soon',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">⏰ ⏰ Grace Period Ending</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Your subscription is in a grace period with {{days_left}} days remaining. Renew now to restore full access!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{renew_url}}" style="background: #f5576c; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Renew Now</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '⏰ Grace Period Ending - Renew Soon

Hi {{user_name}},

Your subscription is in a grace period with {{days_left}} days remaining. Renew now to restore full access!

Renew Now: {{cta_var}}

Best regards,
The MSC & Co Team',
  'billing',
  '["user_name", "days_left", "renew_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Billing - Subscription Cancelled
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Billing - Subscription Cancelled',
  'Cancellation confirmation',
  '📋 Subscription Cancelled - We''ll Miss You',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">📋 📋 Subscription Cancelled</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">We''re sorry to see you go! Your subscription will remain active until {{cancellation_date}}. You can reactivate anytime!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{reactivate_url}}" style="background: #f5af19; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Reactivate</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '📋 Subscription Cancelled - We''ll Miss You

Hi {{user_name}},

We''re sorry to see you go! Your subscription will remain active until {{cancellation_date}}. You can reactivate anytime!

Reactivate: {{cta_var}}

Best regards,
The MSC & Co Team',
  'billing',
  '["user_name", "cancellation_date", "reactivate_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Engagement - Quarterly Report
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Engagement - Quarterly Report',
  'Quarterly performance report',
  '📊 Your Q{{quarter}} Performance Report',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">📊 📊 Your Q{{quarter}} Performance Report</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Here''s your Q{{quarter}} {{year}} performance summary: {{quarter_stats}}. Great progress this quarter!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{dashboard_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">View Full Report</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '📊 Your Q{{quarter}} Performance Report

Hi {{user_name}},

Here''s your Q{{quarter}} {{year}} performance summary: {{quarter_stats}}. Great progress this quarter!

View Full Report: {{cta_var}}

Best regards,
The MSC & Co Team',
  'engagement',
  '["user_name", "quarter", "year", "quarter_stats", "dashboard_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Engagement - Anniversary
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Engagement - Anniversary',
  'Account anniversary',
  '🎉 Happy {{years}}-Year Anniversary!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🎉 🎉 Happy {{years}}-Year Anniversary!</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Congratulations on {{years}} years with MSC & Co! As a thank you: {{anniversary_gift}}!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{dashboard_url}}" style="background: #f093fb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Claim Gift</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🎉 Happy {{years}}-Year Anniversary!

Hi {{user_name}},

Congratulations on {{years}} years with MSC & Co! As a thank you: {{anniversary_gift}}!

Claim Gift: {{cta_var}}

Best regards,
The MSC & Co Team',
  'engagement',
  '["user_name", "years", "anniversary_gift", "dashboard_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Win-Back - 90 Day Inactive
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Win-Back - 90 Day Inactive',
  '90-day inactive re-engagement',
  'We Really Miss You - 90 Days',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🎵 We Really Miss You</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">It''s been 90 days! We''ve transformed the platform. {{new_features}}. Your account is waiting!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{dashboard_url}}" style="background: #f5576c; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Come Back Now</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  'We Really Miss You - 90 Days

Hi {{user_name}},

It''s been 90 days! We''ve transformed the platform. {{new_features}}. Your account is waiting!

Come Back Now: {{cta_var}}

Best regards,
The MSC & Co Team',
  'engagement',
  '["user_name", "new_features", "dashboard_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Engagement - Feature Recommendation
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Engagement - Feature Recommendation',
  'Personalized feature recommendation',
  '💡 We Think You''ll Love This Feature',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">💡 💡 We Think You''ll Love This Feature</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Based on your activity, we think you''ll love {{feature_name}}: {{feature_description}}. Check it out!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{feature_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Explore Feature</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '💡 We Think You''ll Love This Feature

Hi {{user_name}},

Based on your activity, we think you''ll love {{feature_name}}: {{feature_description}}. Check it out!

Explore Feature: {{cta_var}}

Best regards,
The MSC & Co Team',
  'engagement',
  '["user_name", "feature_name", "feature_description", "feature_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Engagement - Success Story
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Engagement - Success Story',
  'Success story sharing',
  '🌟 Success Story - You''re Featured!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🌟 🌟 Success Story</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Amazing news! Your success story has been featured! Check it out: {{story_title}}!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{story_url}}" style="background: #f5af19; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Read Story</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🌟 Success Story - You''re Featured!

Hi {{user_name}},

Amazing news! Your success story has been featured! Check it out: {{story_title}}!

Read Story: {{cta_var}}

Best regards,
The MSC & Co Team',
  'engagement',
  '["user_name", "story_title", "story_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Engagement - Community Spotlight
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Engagement - Community Spotlight',
  'Community feature',
  '👥 Community Spotlight - You''re Featured!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">👥 👥 Community Spotlight</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Congratulations! You''ve been featured in our community spotlight! See yourself shine!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{spotlight_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">View Spotlight</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '👥 Community Spotlight - You''re Featured!

Hi {{user_name}},

Congratulations! You''ve been featured in our community spotlight! See yourself shine!

View Spotlight: {{cta_var}}

Best regards,
The MSC & Co Team',
  'engagement',
  '["user_name", "spotlight_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Engagement - Release Reminder
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Engagement - Release Reminder',
  'Upcoming release reminder',
  '🎵 Don''t Forget - New Release Coming!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🎵 🎵 Don''t Forget</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Reminder: Your new release {{release_title}} is coming out on {{release_date}}! Get ready!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{release_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">View Release</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🎵 Don''t Forget - New Release Coming!

Hi {{user_name}},

Reminder: Your new release {{release_title}} is coming out on {{release_date}}! Get ready!

View Release: {{cta_var}}

Best regards,
The MSC & Co Team',
  'engagement',
  '["user_name", "release_title", "release_date", "release_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Engagement - Collaboration Invite
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Engagement - Collaboration Invite',
  'Collaboration opportunity',
  '🤝 Collaboration Opportunity',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🤝 🤝 Collaboration Opportunity</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Exciting opportunity! {{artist_name}} wants to collaborate: {{collab_details}}. Interested?</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{collab_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">View Details</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🤝 Collaboration Opportunity

Hi {{user_name}},

Exciting opportunity! {{artist_name}} wants to collaborate: {{collab_details}}. Interested?

View Details: {{cta_var}}

Best regards,
The MSC & Co Team',
  'engagement',
  '["user_name", "artist_name", "collab_details", "collab_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Engagement - Playlist Submission Success
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Engagement - Playlist Submission Success',
  'Playlist acceptance',
  '✅ Your Track Was Added to a Playlist!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">✅ ✅ Your Track Was Added to a Playlist!</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Great news! {{release_title}} has been added to {{playlist_name}}! This could boost your streams!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{playlist_url}}" style="background: #2ecc71; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">View Playlist</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '✅ Your Track Was Added to a Playlist!

Hi {{user_name}},

Great news! {{release_title}} has been added to {{playlist_name}}! This could boost your streams!

View Playlist: {{cta_var}}

Best regards,
The MSC & Co Team',
  'engagement',
  '["user_name", "playlist_name", "release_title", "playlist_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Engagement - Trend Alert
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Engagement - Trend Alert',
  'Trending opportunity',
  '📈 Trending Alert - Get In On This!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">📈 📈 Trending Alert</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Hot trend alert! {{trend_description}}. Jump on this opportunity now!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{trend_url}}" style="background: #f5576c; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Explore Trend</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '📈 Trending Alert - Get In On This!

Hi {{user_name}},

Hot trend alert! {{trend_description}}. Jump on this opportunity now!

Explore Trend: {{cta_var}}

Best regards,
The MSC & Co Team',
  'engagement',
  '["user_name", "trend_description", "trend_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Support - Ticket Created
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Support - Ticket Created',
  'Support ticket confirmation',
  '🎫 Support Ticket Created - We''re On It',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🎫 🎫 Support Ticket Created</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Thank you for contacting us! Your support ticket #{{ticket_number}} has been created. We''ll get back to you soon!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{ticket_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">View Ticket</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🎫 Support Ticket Created - We''re On It

Hi {{user_name}},

Thank you for contacting us! Your support ticket #{{ticket_number}} has been created. We''ll get back to you soon!

View Ticket: {{cta_var}}

Best regards,
The MSC & Co Team',
  'support',
  '["user_name", "ticket_number", "ticket_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Support - Ticket Updated
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Support - Ticket Updated',
  'Support ticket update',
  '📝 Ticket Update - New Response',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">📝 📝 Ticket Update</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Your support ticket #{{ticket_number}} has been updated with a new response. Check it out!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{ticket_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">View Update</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '📝 Ticket Update - New Response

Hi {{user_name}},

Your support ticket #{{ticket_number}} has been updated with a new response. Check it out!

View Update: {{cta_var}}

Best regards,
The MSC & Co Team',
  'support',
  '["user_name", "ticket_number", "ticket_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Support - Ticket Resolved
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Support - Ticket Resolved',
  'Support ticket resolution',
  '✅ Ticket Resolved - Problem Solved!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">✅ ✅ Ticket Resolved</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Great news! Your support ticket #{{ticket_number}} has been resolved. Is everything working now?</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{ticket_url}}" style="background: #2ecc71; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Review Resolution</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '✅ Ticket Resolved - Problem Solved!

Hi {{user_name}},

Great news! Your support ticket #{{ticket_number}} has been resolved. Is everything working now?

Review Resolution: {{cta_var}}

Best regards,
The MSC & Co Team',
  'support',
  '["user_name", "ticket_number", "ticket_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Support - Help Article Recommendation
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Support - Help Article Recommendation',
  'Help article suggestion',
  '📚 Help Article - This Might Help',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">📚 📚 Help Article</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">We found a help article that might solve your question: {{article_title}}. Check it out!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{article_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Read Article</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '📚 Help Article - This Might Help

Hi {{user_name}},

We found a help article that might solve your question: {{article_title}}. Check it out!

Read Article: {{cta_var}}

Best regards,
The MSC & Co Team',
  'support',
  '["user_name", "article_title", "article_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Support - FAQ Suggestion
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Support - FAQ Suggestion',
  'FAQ recommendation',
  '❓ FAQ - Common Question Answered',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">❓ ❓ FAQ</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Based on your question, here''s a helpful FAQ about {{faq_topic}}. This might answer what you''re looking for!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{faq_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">View FAQ</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '❓ FAQ - Common Question Answered

Hi {{user_name}},

Based on your question, here''s a helpful FAQ about {{faq_topic}}. This might answer what you''re looking for!

View FAQ: {{cta_var}}

Best regards,
The MSC & Co Team',
  'support',
  '["user_name", "faq_topic", "faq_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Support - Community Invite
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Support - Community Invite',
  'Community forum invite',
  '👥 Join Our Community - Get Help!',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">👥 👥 Join Our Community</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Join our community forum! Connect with other artists, share tips, and get help from peers!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{community_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Join Community</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '👥 Join Our Community - Get Help!

Hi {{user_name}},

Join our community forum! Connect with other artists, share tips, and get help from peers!

Join Community: {{cta_var}}

Best regards,
The MSC & Co Team',
  'support',
  '["user_name", "community_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Support - Feedback Request
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Support - Feedback Request',
  'Feedback collection',
  '💬 We''d Love Your Feedback',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">💬 💬 We''d Love Your Feedback</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Your opinion matters! We''d love to hear your feedback to help us improve. It only takes a minute!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{feedback_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Share Feedback</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '💬 We''d Love Your Feedback

Hi {{user_name}},

Your opinion matters! We''d love to hear your feedback to help us improve. It only takes a minute!

Share Feedback: {{cta_var}}

Best regards,
The MSC & Co Team',
  'support',
  '["user_name", "feedback_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Support - Survey Invitation
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Support - Survey Invitation',
  'Survey request',
  '📋 Quick Survey - Help Us Improve',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">📋 📋 Quick Survey</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Help us improve by taking a quick 2-minute survey! Your responses help shape our platform!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{survey_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Take Survey</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '📋 Quick Survey - Help Us Improve

Hi {{user_name}},

Help us improve by taking a quick 2-minute survey! Your responses help shape our platform!

Take Survey: {{cta_var}}

Best regards,
The MSC & Co Team',
  'support',
  '["user_name", "survey_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Support - Feature Request Update
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Support - Feature Request Update',
  'Feature request status',
  '💡 Feature Request Update',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">💡 💡 Feature Request Update</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Update on your feature request ''{{feature_name}}'': {{status}}. Check the latest news!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{update_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">View Update</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '💡 Feature Request Update

Hi {{user_name}},

Update on your feature request ''{{feature_name}}'': {{status}}. Check the latest news!

View Update: {{cta_var}}

Best regards,
The MSC & Co Team',
  'support',
  '["user_name", "feature_name", "status", "update_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Support - Live Chat Available
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Support - Live Chat Available',
  'Live chat invitation',
  '💬 Live Chat Available - Get Instant Help',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">💬 💬 Live Chat Available</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Need immediate help? Our live chat is available now! Get instant answers to your questions!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{chat_url}}" style="background: #2ecc71; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Start Chat</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '💬 Live Chat Available - Get Instant Help

Hi {{user_name}},

Need immediate help? Our live chat is available now! Get instant answers to your questions!

Start Chat: {{cta_var}}

Best regards,
The MSC & Co Team',
  'support',
  '["user_name", "chat_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Educational - Weekly Newsletter
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Educational - Weekly Newsletter',
  'Weekly newsletter',
  '📰 Weekly Newsletter - {{week_date}}',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">📰 📰 Weekly Newsletter</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Your weekly music industry newsletter is here! Get the latest news, tips, and insights!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{newsletter_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Read Newsletter</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '📰 Weekly Newsletter - {{week_date}}

Hi {{user_name}},

Your weekly music industry newsletter is here! Get the latest news, tips, and insights!

Read Newsletter: {{cta_var}}

Best regards,
The MSC & Co Team',
  'educational',
  '["user_name", "week_date", "newsletter_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Educational - Monthly Newsletter
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Educational - Monthly Newsletter',
  'Monthly newsletter',
  '📅 Monthly Newsletter - {{month_name}}',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">📅 📅 Monthly Newsletter</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Your monthly roundup is here! Industry news, platform updates, and success stories from {{month_name}}!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{newsletter_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Read Newsletter</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '📅 Monthly Newsletter - {{month_name}}

Hi {{user_name}},

Your monthly roundup is here! Industry news, platform updates, and success stories from {{month_name}}!

Read Newsletter: {{cta_var}}

Best regards,
The MSC & Co Team',
  'educational',
  '["user_name", "month_name", "newsletter_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Educational - Industry News
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Educational - Industry News',
  'Industry news update',
  '📰 Music Industry News - Stay Informed',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">📰 📰 Music Industry News</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Latest music industry news: {{news_items}}. Stay ahead of the curve!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{news_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Read News</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '📰 Music Industry News - Stay Informed

Hi {{user_name}},

Latest music industry news: {{news_items}}. Stay ahead of the curve!

Read News: {{cta_var}}

Best regards,
The MSC & Co Team',
  'educational',
  '["user_name", "news_items", "news_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Educational - Tips & Tricks
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Educational - Tips & Tricks',
  'Tips newsletter',
  '💡 Pro Tips - Level Up Your Music',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">💡 💡 Pro Tips</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">This week''s pro tip: {{tip_title}}. Learn strategies that successful artists use!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{tips_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Read Tips</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '💡 Pro Tips - Level Up Your Music

Hi {{user_name}},

This week''s pro tip: {{tip_title}}. Learn strategies that successful artists use!

Read Tips: {{cta_var}}

Best regards,
The MSC & Co Team',
  'educational',
  '["user_name", "tip_title", "tips_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Educational - Tutorial Series
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Educational - Tutorial Series',
  'Tutorial invitation',
  '🎓 New Tutorial Series - Master Your Craft',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🎓 🎓 New Tutorial Series</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">New tutorial series: {{tutorial_title}}. Step-by-step guides to help you succeed!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{tutorial_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Start Learning</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🎓 New Tutorial Series - Master Your Craft

Hi {{user_name}},

New tutorial series: {{tutorial_title}}. Step-by-step guides to help you succeed!

Start Learning: {{cta_var}}

Best regards,
The MSC & Co Team',
  'educational',
  '["user_name", "tutorial_title", "tutorial_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Educational - Best Practices
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Educational - Best Practices',
  'Best practices guide',
  '⭐ Best Practices Guide - Industry Standards',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">⭐ ⭐ Best Practices Guide</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Best practices guide: {{topic}}. Learn what works in today''s music industry!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{guide_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Read Guide</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '⭐ Best Practices Guide - Industry Standards

Hi {{user_name}},

Best practices guide: {{topic}}. Learn what works in today''s music industry!

Read Guide: {{cta_var}}

Best regards,
The MSC & Co Team',
  'educational',
  '["user_name", "topic", "guide_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Educational - Case Study
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Educational - Case Study',
  'Success case study',
  '📚 Case Study - Learn from Success',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">📚 📚 Case Study</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Real success story: {{case_study_title}}. Learn what strategies led to breakthrough results!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{case_study_url}}" style="background: #f5af19; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Read Case Study</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '📚 Case Study - Learn from Success

Hi {{user_name}},

Real success story: {{case_study_title}}. Learn what strategies led to breakthrough results!

Read Case Study: {{cta_var}}

Best regards,
The MSC & Co Team',
  'educational',
  '["user_name", "case_study_title", "case_study_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Educational - Webinar Invitation
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Educational - Webinar Invitation',
  'Webinar invite',
  '🎤 Webinar - {{webinar_title}}',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🎤 🎤 Webinar</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Join us for a live webinar: {{webinar_title}} on {{webinar_date}}. Register now for free!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{webinar_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Register Now</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🎤 Webinar - {{webinar_title}}

Hi {{user_name}},

Join us for a live webinar: {{webinar_title}} on {{webinar_date}}. Register now for free!

Register Now: {{cta_var}}

Best regards,
The MSC & Co Team',
  'educational',
  '["user_name", "webinar_title", "webinar_date", "webinar_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Educational - Resource Library
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Educational - Resource Library',
  'Resource library update',
  '📖 Resource Library - New Content Added',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">📖 📖 Resource Library</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Our resource library has been updated! New content: {{new_resources}}. Expand your knowledge!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{library_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Browse Library</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '📖 Resource Library - New Content Added

Hi {{user_name}},

Our resource library has been updated! New content: {{new_resources}}. Expand your knowledge!

Browse Library: {{cta_var}}

Best regards,
The MSC & Co Team',
  'educational',
  '["user_name", "new_resources", "library_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Educational - Expert Interview
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Educational - Expert Interview',
  'Expert interview',
  '🎙️ Expert Interview - Industry Insights',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🎙️ 🎙️ Expert Interview</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Exclusive interview with {{expert_name}} about {{interview_topic}}. Get insider insights!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{interview_url}}" style="background: #f5af19; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Watch Interview</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🎙️ Expert Interview - Industry Insights

Hi {{user_name}},

Exclusive interview with {{expert_name}} about {{interview_topic}}. Get insider insights!

Watch Interview: {{cta_var}}

Best regards,
The MSC & Co Team',
  'educational',
  '["user_name", "expert_name", "interview_topic", "interview_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Product - Major Update
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Product - Major Update',
  'Major platform update',
  '🚀 Major Update - {{update_name}}',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🚀 🚀 Major Update</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Big news! We''ve launched {{update_name}}: {{update_details}}. This changes everything!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{update_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Explore Update</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🚀 Major Update - {{update_name}}

Hi {{user_name}},

Big news! We''ve launched {{update_name}}: {{update_details}}. This changes everything!

Explore Update: {{cta_var}}

Best regards,
The MSC & Co Team',
  'admin',
  '["user_name", "update_name", "update_details", "update_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Product - New Feature Launch
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Product - New Feature Launch',
  'Feature launch announcement',
  '✨ New Feature - {{feature_name}}',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">✨ ✨ New Feature</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Exciting launch! Introducing {{feature_name}}: {{feature_description}}. Try it now!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{feature_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Try Feature</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '✨ New Feature - {{feature_name}}

Hi {{user_name}},

Exciting launch! Introducing {{feature_name}}: {{feature_description}}. Try it now!

Try Feature: {{cta_var}}

Best regards,
The MSC & Co Team',
  'admin',
  '["user_name", "feature_name", "feature_description", "feature_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Product - Partnership Announcement
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Product - Partnership Announcement',
  'Partnership news',
  '🤝 Partnership Announcement - {{partner_name}}',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🤝 🤝 Partnership Announcement</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Exciting news! We''ve partnered with {{partner_name}}: {{partnership_details}}. Great things ahead!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{partnership_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Learn More</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🤝 Partnership Announcement - {{partner_name}}

Hi {{user_name}},

Exciting news! We''ve partnered with {{partner_name}}: {{partnership_details}}. Great things ahead!

Learn More: {{cta_var}}

Best regards,
The MSC & Co Team',
  'admin',
  '["user_name", "partner_name", "partnership_details", "partnership_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Product - Service Update
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Product - Service Update',
  'Service improvement',
  '⚡ Service Update - Enhanced Experience',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">⚡ ⚡ Service Update</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">We''ve made improvements: {{improvements}}. Your experience just got better!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{update_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">See Improvements</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '⚡ Service Update - Enhanced Experience

Hi {{user_name}},

We''ve made improvements: {{improvements}}. Your experience just got better!

See Improvements: {{cta_var}}

Best regards,
The MSC & Co Team',
  'admin',
  '["user_name", "improvements", "update_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Product - Maintenance Notification
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Product - Maintenance Notification',
  'Scheduled maintenance',
  '🔧 Scheduled Maintenance - {{maintenance_date}}',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🔧 🔧 Scheduled Maintenance</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Scheduled maintenance on {{maintenance_date}} at {{maintenance_time}}. Brief downtime expected. We''ll be back soon!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{status_url}}" style="background: #f5af19; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Check Status</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🔧 Scheduled Maintenance - {{maintenance_date}}

Hi {{user_name}},

Scheduled maintenance on {{maintenance_date}} at {{maintenance_time}}. Brief downtime expected. We''ll be back soon!

Check Status: {{cta_var}}

Best regards,
The MSC & Co Team',
  'admin',
  '["user_name", "maintenance_date", "maintenance_time", "status_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Product - Platform Milestone
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Product - Platform Milestone',
  'Platform achievement',
  '🏆 Platform Milestone - {{milestone_description}}',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🏆 🏆 Platform Milestone</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">We''re celebrating! {{milestone_description}}. Thank you for being part of our journey!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{celebration_url}}" style="background: #2ecc71; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Join Celebration</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🏆 Platform Milestone - {{milestone_description}}

Hi {{user_name}},

We''re celebrating! {{milestone_description}}. Thank you for being part of our journey!

Join Celebration: {{cta_var}}

Best regards,
The MSC & Co Team',
  'admin',
  '["user_name", "milestone_description", "celebration_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Product - API Update
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Product - API Update',
  'API change notification',
  '🔌 API Update - New Capabilities',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🔌 🔌 API Update</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">API update: {{api_changes}}. Check the docs for new endpoints and improvements!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{api_docs_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">View API Docs</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🔌 API Update - New Capabilities

Hi {{user_name}},

API update: {{api_changes}}. Check the docs for new endpoints and improvements!

View API Docs: {{cta_var}}

Best regards,
The MSC & Co Team',
  'admin',
  '["user_name", "api_changes", "api_docs_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Product - Integration Launch
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Product - Integration Launch',
  'New integration',
  '🔗 New Integration - {{integration_name}}',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🔗 🔗 New Integration</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">New integration available! {{integration_name}}: {{integration_details}}. Connect your tools!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{integration_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Set Up Integration</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🔗 New Integration - {{integration_name}}

Hi {{user_name}},

New integration available! {{integration_name}}: {{integration_details}}. Connect your tools!

Set Up Integration: {{cta_var}}

Best regards,
The MSC & Co Team',
  'admin',
  '["user_name", "integration_name", "integration_details", "integration_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Product - Mobile App Launch
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Product - Mobile App Launch',
  'Mobile app announcement',
  '📱 Mobile App Launch - Take Music On The Go',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">📱 📱 Mobile App Launch</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Our mobile app is here! {{app_features}}. Manage your music career from anywhere!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{app_download_url}}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Download App</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '📱 Mobile App Launch - Take Music On The Go

Hi {{user_name}},

Our mobile app is here! {{app_features}}. Manage your music career from anywhere!

Download App: {{cta_var}}

Best regards,
The MSC & Co Team',
  'admin',
  '["user_name", "app_features", "app_download_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Product - Beta Feature Invite
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  'Product - Beta Feature Invite',
  'Beta feature invitation',
  '🧪 Beta Feature - Be The First To Try',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">🧪 🧪 Beta Feature</h1>
</div>
<div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
<p style="font-size: 16px; margin-bottom: 20px;">Exclusive beta access! Try {{beta_feature_name}} before everyone else: {{beta_details}}!</p>
<div style="text-align: center; margin: 40px 0;">
<a href="{{beta_url}}" style="background: #f5af19; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Join Beta</a>
</div>
<p style="font-size: 16px; margin-top: 30px; text-align: center;">Best regards,<br><strong>The MSC & Co Team</strong></p>
</div>
</body>
</html>',
  '🧪 Beta Feature - Be The First To Try

Hi {{user_name}},

Exclusive beta access! Try {{beta_feature_name}} before everyone else: {{beta_details}}!

Join Beta: {{cta_var}}

Best regards,
The MSC & Co Team',
  'admin',
  '["user_name", "beta_feature_name", "beta_details", "beta_url"]'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;


-- Total additional templates: 90
-- Run this script and append output to create-marketing-email-templates.sql
