-- ===========================================
-- ENHANCE ALL ONBOARDING TEMPLATES
-- More elaborate, relational, and professional content
-- ===========================================
-- Date: 2025-01-28
-- Purpose: Update all onboarding templates with enhanced content and consistent styling
-- Total Templates Updated: 5
-- ===========================================
-- 
-- STYLING APPLIED:
-- - Header h1: 22px font-size, 24px padding, line-height: 1.3
-- - Body text: 14px font-size
-- - Signature: 14px font-size, #4a5568 color
-- - Buttons: 14px font-size
-- - Footer: 60px logo, "Empowering Every Artist. Protecting Our Planet." slogan (warmer for onboarding)
-- - No logo in header
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
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">We''re absolutely thrilled to have you join the MSC & Co family! You''ve taken an exciting step forward, and you''re now part of a cutting-edge platform designed to empower artists, labels, and music industry professionals like yourself. We built MSC & Co to give you the tools, resources, and support you need to succeed in today''s music industry, and we''re honored that you''ve chosen to be part of our community.</p>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">🎯 Get Started on Your Journey</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">Here''s what you can do right away to make the most of your MSC & Co experience:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;"><strong>Complete your profile:</strong> Unlock all features by adding your information and preferences. A complete profile helps us personalize your experience and recommend features that align with your goals.</li>
        <li style="margin-bottom: 8px;"><strong>Explore the dashboard:</strong> Discover powerful tools and insights tailored to your needs. Take some time to familiarize yourself with everything we have to offer.</li>
        <li style="margin-bottom: 8px;"><strong>Check out resources:</strong> Access tutorials, guides, and best practices from industry experts. We''ve curated valuable content to help you succeed from day one.</li>
        <li style="margin-bottom: 8px;"><strong>Connect with community:</strong> Join a network of talented artists and professionals who are building their careers alongside you.</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>💡 Pro Tip:</strong> Take a few minutes to complete your profile setup. This will personalize your experience and help you discover features most relevant to your goals. The more information you share, the better we can tailor your experience to support your unique journey in music.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{dashboard_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Go to Dashboard</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Need help getting started?</strong> Our support team is here for you every step of the way. Whether you have questions about features, need help with setup, or want guidance on how to make the most of the platform, we''re committed to making your experience with MSC & Co exceptional. Simply reply to this email or visit our help center for assistance.</p>
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
  body_text_template = 'Welcome to MSC & Co – Your Journey Starts Here! 🎵

Hi {{user_name}},

We''re absolutely thrilled to have you join the MSC & Co family! You''ve taken an exciting step forward, and you''re now part of a cutting-edge platform designed to empower artists, labels, and music industry professionals like yourself. We built MSC & Co to give you the tools, resources, and support you need to succeed in today''s music industry, and we''re honored that you''ve chosen to be part of our community.

🎯 Get Started on Your Journey

Here''s what you can do right away to make the most of your MSC & Co experience:
- Complete your profile: Unlock all features by adding your information and preferences. A complete profile helps us personalize your experience and recommend features that align with your goals.
- Explore the dashboard: Discover powerful tools and insights tailored to your needs. Take some time to familiarize yourself with everything we have to offer.
- Check out resources: Access tutorials, guides, and best practices from industry experts. We''ve curated valuable content to help you succeed from day one.
- Connect with community: Join a network of talented artists and professionals who are building their careers alongside you.

💡 Pro Tip: Take a few minutes to complete your profile setup. This will personalize your experience and help you discover features most relevant to your goals. The more information you share, the better we can tailor your experience to support your unique journey in music.

Go to Dashboard: {{dashboard_url}}

Need help getting started? Our support team is here for you every step of the way. Whether you have questions about features, need help with setup, or want guidance on how to make the most of the platform, we''re committed to making your experience with MSC & Co exceptional. Simply reply to this email or visit our help center for assistance.

Best regards,
The MSC & Co Team'
WHERE name = 'Welcome - New User';

-- 2. Welcome - New Artist
UPDATE marketing_email_templates
SET 
  subject_template = 'Welcome, {{artist_name}}! Let''s Launch Your Music Career 🎤',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">Welcome, {{artist_name}}! 🎤</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Welcome to MSC & Co! Your musical journey starts here, and we''re genuinely excited to be part of it. As an artist, you know that creating music is only part of the equation – you also need the right tools, distribution channels, and support to share your art with the world and build a sustainable career. That''s exactly what we''re here to provide. We''ve built MSC & Co specifically for artists like you who want to maintain creative control while accessing professional-grade tools and resources.</p>
    
    <div style="background: #fef5e7; padding: 25px; border-left: 4px solid #f39c12; border-radius: 4px; margin: 30px 0;">
      <h2 style="color: #92400e; margin-top: 0; font-size: 20px; font-weight: 600;">🚀 Your Artist Toolkit</h2>
      <p style="color: #78350f; margin-bottom: 16px; line-height: 1.7;">Everything you need to succeed as an independent artist:</p>
      <ul style="margin: 0; padding-left: 25px; color: #78350f; line-height: 1.8;">
        <li style="margin-bottom: 8px;"><strong>Music Distribution:</strong> Release your tracks to major streaming platforms worldwide, reaching millions of listeners across Spotify, Apple Music, Amazon Music, and more. Your music, your way.</li>
        <li style="margin-bottom: 8px;"><strong>Analytics Dashboard:</strong> Track streams, earnings, and audience insights in real-time. Understand your listeners, identify trends, and make data-driven decisions about your releases.</li>
        <li style="margin-bottom: 8px;"><strong>Royalty Management:</strong> Get paid for your music automatically. Our transparent royalty system ensures you receive every dollar you''ve earned, with detailed reporting and timely payments.</li>
        <li style="margin-bottom: 8px;"><strong>Marketing Tools:</strong> Promote your releases effectively with built-in marketing tools, playlist pitching, and promotional resources designed to help you build your audience.</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>💡 Pro Tip:</strong> Complete your artist profile and upload your first release to get started! The sooner you begin distributing your music, the sooner you can start building your audience and generating revenue. We''re here to guide you through every step of the process.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{artist_dashboard_url}}" style="background: #f5576c; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Access Artist Dashboard</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f5576c;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Your creative journey matters:</strong> We believe that every artist deserves access to the tools and opportunities that can transform their passion into a sustainable career. Whether you''re just starting out or looking to take your music career to the next level, MSC & Co is here to support you every step of the way. Ready to share your music with the world? Let''s make it happen together.</p>
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
  body_text_template = 'Welcome, {{artist_name}}! Let''s Launch Your Music Career 🎤

Hi {{user_name}},

Welcome to MSC & Co! Your musical journey starts here, and we''re genuinely excited to be part of it. As an artist, you know that creating music is only part of the equation – you also need the right tools, distribution channels, and support to share your art with the world and build a sustainable career. That''s exactly what we''re here to provide. We''ve built MSC & Co specifically for artists like you who want to maintain creative control while accessing professional-grade tools and resources.

🚀 Your Artist Toolkit

Everything you need to succeed as an independent artist:
- Music Distribution: Release your tracks to major streaming platforms worldwide, reaching millions of listeners across Spotify, Apple Music, Amazon Music, and more. Your music, your way.
- Analytics Dashboard: Track streams, earnings, and audience insights in real-time. Understand your listeners, identify trends, and make data-driven decisions about your releases.
- Royalty Management: Get paid for your music automatically. Our transparent royalty system ensures you receive every dollar you''ve earned, with detailed reporting and timely payments.
- Marketing Tools: Promote your releases effectively with built-in marketing tools, playlist pitching, and promotional resources designed to help you build your audience.

💡 Pro Tip: Complete your artist profile and upload your first release to get started! The sooner you begin distributing your music, the sooner you can start building your audience and generating revenue. We''re here to guide you through every step of the process.

Access Artist Dashboard: {{artist_dashboard_url}}

Your creative journey matters: We believe that every artist deserves access to the tools and opportunities that can transform their passion into a sustainable career. Whether you''re just starting out or looking to take your music career to the next level, MSC & Co is here to support you every step of the way. Ready to share your music with the world? Let''s make it happen together.

Best regards,
The MSC & Co Team'
WHERE name = 'Welcome - New Artist';

-- 3. Welcome - New Label Admin
UPDATE marketing_email_templates
SET 
  subject_template = 'Welcome to MSC & Co Label Management! 🎼',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">Welcome to Label Management! 🎼</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Welcome to MSC & Co! You''re now set up to manage <strong>{{label_name}}</strong> with powerful tools designed specifically for label professionals. Running a successful label requires coordination, insight, and efficiency – and that''s exactly what our platform provides. Whether you''re managing a roster of artists, coordinating releases, or tracking financial performance, MSC & Co gives you the comprehensive tools you need to grow your label and support your artists'' success.</p>
    
    <div style="background: #e3f2fd; padding: 25px; border-left: 4px solid #2196f3; border-radius: 4px; margin: 30px 0;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">📊 Label Management Features</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">Everything you need to run your label efficiently:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;"><strong>Artist Roster:</strong> Manage all your artists in one centralized location. Track their progress, monitor releases, and stay organized across your entire roster.</li>
        <li style="margin-bottom: 8px;"><strong>Release Management:</strong> Distribute and track all label releases from a single dashboard. Coordinate release schedules, manage distribution, and monitor performance across all platforms.</li>
        <li style="margin-bottom: 8px;"><strong>Financial Dashboard:</strong> Monitor earnings, splits, and royalties in real-time. Get detailed financial insights, manage revenue sharing, and ensure transparency with your artists.</li>
        <li style="margin-bottom: 8px;"><strong>Analytics Suite:</strong> Deep insights into label performance, artist growth, and market trends. Make data-driven decisions that help your label and artists succeed.</li>
        <li style="margin-bottom: 8px;"><strong>Team Collaboration:</strong> Invite team members, assign roles, and work together seamlessly. Build a collaborative environment that supports your label''s growth.</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>💡 Getting Started:</strong> Take some time to explore your label dashboard and familiarize yourself with the tools available to you. Set up your artist roster, invite team members, and configure your label settings to match your workflow. We''re here to help you make the most of every feature.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{label_dashboard_url}}" style="background: #2196f3; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Access Label Dashboard</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #2196f3;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Your label''s success is our priority:</strong> We understand that running a label comes with unique challenges and opportunities. That''s why we''ve built tools specifically designed to help you manage artists, coordinate releases, and grow your label effectively. Whether you''re an established label or building something new, MSC & Co provides the infrastructure and support you need to succeed. Let''s build something amazing together!</p>
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
  body_text_template = 'Welcome to MSC & Co Label Management! 🎼

Hi {{user_name}},

Welcome to MSC & Co! You''re now set up to manage {{label_name}} with powerful tools designed specifically for label professionals. Running a successful label requires coordination, insight, and efficiency – and that''s exactly what our platform provides. Whether you''re managing a roster of artists, coordinating releases, or tracking financial performance, MSC & Co gives you the comprehensive tools you need to grow your label and support your artists'' success.

📊 Label Management Features

Everything you need to run your label efficiently:
- Artist Roster: Manage all your artists in one centralized location. Track their progress, monitor releases, and stay organized across your entire roster.
- Release Management: Distribute and track all label releases from a single dashboard. Coordinate release schedules, manage distribution, and monitor performance across all platforms.
- Financial Dashboard: Monitor earnings, splits, and royalties in real-time. Get detailed financial insights, manage revenue sharing, and ensure transparency with your artists.
- Analytics Suite: Deep insights into label performance, artist growth, and market trends. Make data-driven decisions that help your label and artists succeed.
- Team Collaboration: Invite team members, assign roles, and work together seamlessly. Build a collaborative environment that supports your label''s growth.

💡 Getting Started: Take some time to explore your label dashboard and familiarize yourself with the tools available to you. Set up your artist roster, invite team members, and configure your label settings to match your workflow. We''re here to help you make the most of every feature.

Access Label Dashboard: {{label_dashboard_url}}

Your label''s success is our priority: We understand that running a label comes with unique challenges and opportunities. That''s why we''ve built tools specifically designed to help you manage artists, coordinate releases, and grow your label effectively. Whether you''re an established label or building something new, MSC & Co provides the infrastructure and support you need to succeed. Let''s build something amazing together!

Best regards,
The MSC & Co Team'
WHERE name = 'Welcome - New Label Admin';

-- 4. Onboarding - Profile Completion
UPDATE marketing_email_templates
SET 
  subject_template = 'Complete Your Profile – Unlock All Features! ⚡',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">Complete Your Profile! ⚡</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">You''re just one step away from unlocking the full power of MSC & Co! Completing your profile is the key to accessing all premium features and getting the most personalized experience possible. When you take a few minutes to add your information, preferences, and details, we can tailor the platform to your specific needs, recommend relevant features, and help you discover tools that will accelerate your success. It''s a small investment of time that will pay dividends in how effectively you can use the platform.</p>
    
    <div style="background: #fff3cd; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f59e0b;">
      <h2 style="color: #92400e; margin-top: 0; font-size: 20px; font-weight: 600;">📝 What to Complete</h2>
      <p style="color: #78350f; margin-bottom: 16px; line-height: 1.7;">Here''s what we recommend adding to your profile:</p>
      <ul style="margin: 0; padding-left: 25px; color: #78350f; line-height: 1.8;">
        <li style="margin-bottom: 8px;"><strong>Add your profile picture:</strong> Help others recognize you and build your professional presence on the platform</li>
        <li style="margin-bottom: 8px;"><strong>Fill in your bio and description:</strong> Share your story, your goals, and what makes your music unique</li>
        <li style="margin-bottom: 8px;"><strong>Connect your social media accounts:</strong> Link your profiles to expand your reach and simplify sharing</li>
        <li style="margin-bottom: 8px;"><strong>Set up payment information:</strong> Ensure you can receive royalties and payments seamlessly when the time comes</li>
        <li style="margin-bottom: 8px;"><strong>Add contact preferences:</strong> Let us know how you''d like to stay informed about platform updates and opportunities</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>🎯 Why This Matters:</strong> A complete profile doesn''t just unlock features – it helps us understand who you are, what you''re trying to achieve, and how we can best support you. The more information you share, the better we can personalize your experience, recommend relevant resources, and connect you with opportunities that align with your goals.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{profile_url}}" style="background: #fa709a; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Complete Profile Now</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #fa709a;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Don''t worry, you can always update:</strong> Your profile isn''t set in stone – you can update and refine it anytime as your career evolves. But getting the basics in place now will help you get started on the right foot and ensure you have access to everything MSC & Co has to offer. Let''s get you set up!</p>
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
  body_text_template = 'Complete Your Profile – Unlock All Features! ⚡

Hi {{user_name}},

You''re just one step away from unlocking the full power of MSC & Co! Completing your profile is the key to accessing all premium features and getting the most personalized experience possible. When you take a few minutes to add your information, preferences, and details, we can tailor the platform to your specific needs, recommend relevant features, and help you discover tools that will accelerate your success. It''s a small investment of time that will pay dividends in how effectively you can use the platform.

📝 What to Complete

Here''s what we recommend adding to your profile:
- Add your profile picture: Help others recognize you and build your professional presence on the platform
- Fill in your bio and description: Share your story, your goals, and what makes your music unique
- Connect your social media accounts: Link your profiles to expand your reach and simplify sharing
- Set up payment information: Ensure you can receive royalties and payments seamlessly when the time comes
- Add contact preferences: Let us know how you''d like to stay informed about platform updates and opportunities

🎯 Why This Matters: A complete profile doesn''t just unlock features – it helps us understand who you are, what you''re trying to achieve, and how we can best support you. The more information you share, the better we can personalize your experience, recommend relevant resources, and connect you with opportunities that align with your goals.

Complete Profile Now: {{profile_url}}

Don''t worry, you can always update: Your profile isn''t set in stone – you can update and refine it anytime as your career evolves. But getting the basics in place now will help you get started on the right foot and ensure you have access to everything MSC & Co has to offer. Let''s get you set up!

Best regards,
The MSC & Co Team'
WHERE name = 'Onboarding - Profile Completion';

-- 5. Onboarding - First Release Guide
UPDATE marketing_email_templates
SET 
  subject_template = '🎵 Ready to Release Your First Track?',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🎵 Ready to Release?</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Your profile is looking great! Now let''s get your music out into the world. Uploading your first release is easier than you think, and we''re here to guide you through every step of the process. This is an exciting moment – you''re about to share your art with listeners around the globe, and we''re honored to be part of that journey. Whether you''re releasing a single, an EP, or a full album, our platform makes it simple to distribute your music to all major streaming platforms and digital stores.</p>
    
    <div style="background: #e0f2fe; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">🚀 Quick Start Guide</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">Follow these simple steps to release your music:</p>
      <ol style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;"><strong>Upload your audio files:</strong> We recommend using WAV or FLAC format for the best quality. These lossless formats ensure your music sounds perfect across all platforms.</li>
        <li style="margin-bottom: 8px;"><strong>Add artwork and metadata:</strong> Create compelling cover art (minimum 3000x3000 pixels) and fill in all the important details – title, artist name, genre, release date, and more. Good metadata helps listeners discover your music.</li>
        <li style="margin-bottom: 8px;"><strong>Choose distribution platforms:</strong> Select which streaming services and digital stores you want your music on – Spotify, Apple Music, Amazon Music, and many more. We''ll handle the rest.</li>
        <li style="margin-bottom: 8px;"><strong>Review and submit:</strong> Double-check everything looks perfect, then submit for distribution. We''ll process your release and get it live on your selected platforms typically within 1-2 weeks.</li>
      </ol>
    </div>
    
    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #92400e; line-height: 1.7; font-size: 14px;"><strong>💡 Pro Tips for Your First Release:</strong> Plan your release date strategically – give yourself enough time to promote it. Consider creating promotional materials, reaching out to playlists, and building anticipation on social media. Your first release is special, so make sure you''re set up for success from day one!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{releases_url}}" style="background: #30cfd0; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Upload Your First Release</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #30cfd0;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Need help along the way?</strong> We''ve got you covered! Check out our comprehensive distribution guide for detailed instructions, best practices, and tips from successful artists. If you have questions or run into any issues, our support team is ready to help. This is just the beginning of your music distribution journey, and we''re here to support you every step of the way.</p>
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
  body_text_template = '🎵 Ready to Release Your First Track?

Hi {{user_name}},

Your profile is looking great! Now let''s get your music out into the world. Uploading your first release is easier than you think, and we''re here to guide you through every step of the process. This is an exciting moment – you''re about to share your art with listeners around the globe, and we''re honored to be part of that journey. Whether you''re releasing a single, an EP, or a full album, our platform makes it simple to distribute your music to all major streaming platforms and digital stores.

🚀 Quick Start Guide

Follow these simple steps to release your music:
1. Upload your audio files: We recommend using WAV or FLAC format for the best quality. These lossless formats ensure your music sounds perfect across all platforms.
2. Add artwork and metadata: Create compelling cover art (minimum 3000x3000 pixels) and fill in all the important details – title, artist name, genre, release date, and more. Good metadata helps listeners discover your music.
3. Choose distribution platforms: Select which streaming services and digital stores you want your music on – Spotify, Apple Music, Amazon Music, and many more. We''ll handle the rest.
4. Review and submit: Double-check everything looks perfect, then submit for distribution. We''ll process your release and get it live on your selected platforms typically within 1-2 weeks.

💡 Pro Tips for Your First Release: Plan your release date strategically – give yourself enough time to promote it. Consider creating promotional materials, reaching out to playlists, and building anticipation on social media. Your first release is special, so make sure you''re set up for success from day one!

Upload Your First Release: {{releases_url}}

Need help along the way? We''ve got you covered! Check out our comprehensive distribution guide for detailed instructions, best practices, and tips from successful artists. If you have questions or run into any issues, our support team is ready to help. This is just the beginning of your music distribution journey, and we''re here to support you every step of the way.

Best regards,
The MSC & Co Team'
WHERE name = 'Onboarding - First Release Guide';

-- ===========================================
-- UPDATE COMPLETE
-- ===========================================
-- Updated 5 onboarding templates with enhanced content:
-- 1. Welcome - New User
-- 2. Welcome - New Artist
-- 3. Welcome - New Label Admin
-- 4. Onboarding - Profile Completion
-- 5. Onboarding - First Release Guide
-- ===========================================

