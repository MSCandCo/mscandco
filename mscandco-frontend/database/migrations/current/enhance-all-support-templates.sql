-- ===========================================
-- ENHANCE ALL SUPPORT TEMPLATES
-- More elaborate, relational, and professional content
-- ===========================================
-- Date: 2025-01-28
-- Purpose: Update all support templates with enhanced content and consistent styling
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

-- 1. Support - Ticket Created
UPDATE marketing_email_templates
SET 
  subject_template = '🎫 Support Ticket Created – We''re On It',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">🎫 Support Ticket Created</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Thank you for contacting us! Your support ticket <strong>#{{ticket_number}}</strong> has been successfully created, and our team has received your request. We understand that when you need help, you need it promptly, and we''re committed to addressing your inquiry as quickly as possible. Your ticket has been assigned to one of our support specialists who will review your message and get back to you soon with a helpful response.</p>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">What Happens Next</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">Here''s what to expect:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;"><strong>Priority review:</strong> Your ticket is in our system and will be reviewed by our support team</li>
        <li style="margin-bottom: 8px;"><strong>Quick response:</strong> We aim to respond to all tickets within 24 hours during business days</li>
        <li style="margin-bottom: 8px;"><strong>Updates:</strong> You''ll receive email notifications whenever there''s an update to your ticket</li>
        <li style="margin-bottom: 8px;"><strong>Resolution:</strong> Our team will work with you until your issue is fully resolved</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>💡 Tip:</strong> You can check the status of your ticket at any time by clicking the link below. If you have additional information or questions, simply reply directly to any email updates about this ticket, and your response will be automatically added to the conversation.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{ticket_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">View Ticket</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>We''re here to help:</strong> Your satisfaction and success are our top priorities. Our support team is experienced, knowledgeable, and genuinely committed to resolving your issue and ensuring you have a positive experience with MSC & Co. Thank you for your patience, and we''ll be in touch soon!</p>
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
  body_text_template = '🎫 Support Ticket Created – We''re On It

Hi {{user_name}},

Thank you for contacting us! Your support ticket #{{ticket_number}} has been successfully created, and our team has received your request. We understand that when you need help, you need it promptly, and we''re committed to addressing your inquiry as quickly as possible. Your ticket has been assigned to one of our support specialists who will review your message and get back to you soon with a helpful response.

What Happens Next

Here''s what to expect:
- Priority review: Your ticket is in our system and will be reviewed by our support team
- Quick response: We aim to respond to all tickets within 24 hours during business days
- Updates: You''ll receive email notifications whenever there''s an update to your ticket
- Resolution: Our team will work with you until your issue is fully resolved

💡 Tip: You can check the status of your ticket at any time by clicking the link below. If you have additional information or questions, simply reply directly to any email updates about this ticket, and your response will be automatically added to the conversation.

View Ticket: {{ticket_url}}

We''re here to help: Your satisfaction and success are our top priorities. Our support team is experienced, knowledgeable, and genuinely committed to resolving your issue and ensuring you have a positive experience with MSC & Co. Thank you for your patience, and we''ll be in touch soon!

Best regards,
The MSC & Co Team'
WHERE name = 'Support - Ticket Created';

-- 2. Support - Ticket Updated
UPDATE marketing_email_templates
SET 
  subject_template = '📝 Ticket Update – New Response',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">📝 Ticket Update</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Your support ticket <strong>#{{ticket_number}}</strong> has been updated with a new response from our team. We''ve been working on your request and have additional information, updates, or questions that will help us move forward with resolving your issue. Please review the latest update when you have a moment, and let us know if you need any clarification or have additional details to share.</p>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">Staying Connected</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">We want to keep you informed:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;"><strong>Direct communication:</strong> You can reply directly to this email to continue the conversation</li>
        <li style="margin-bottom: 8px;"><strong>Full history:</strong> View the complete ticket conversation and all updates in one place</li>
        <li style="margin-bottom: 8px;"><strong>Quick access:</strong> All ticket information and responses are easily accessible through the ticket link</li>
        <li style="margin-bottom: 8px;"><strong>Ongoing support:</strong> We''ll continue working with you until your issue is fully resolved</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>💬 Easy Reply:</strong> If you have any questions about the update or need to provide additional information, just reply to this email. Your response will automatically be added to the ticket, keeping all communication in one place for easy reference.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{ticket_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">View Update</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Your feedback matters:</strong> We''re committed to providing you with the best possible support experience. If at any point you feel we could improve our response or approach, please don''t hesitate to let us know. Your satisfaction is our priority, and we''re here to help in any way we can.</p>
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
  body_text_template = '📝 Ticket Update – New Response

Hi {{user_name}},

Your support ticket #{{ticket_number}} has been updated with a new response from our team. We''ve been working on your request and have additional information, updates, or questions that will help us move forward with resolving your issue. Please review the latest update when you have a moment, and let us know if you need any clarification or have additional details to share.

Staying Connected

We want to keep you informed:
- Direct communication: You can reply directly to this email to continue the conversation
- Full history: View the complete ticket conversation and all updates in one place
- Quick access: All ticket information and responses are easily accessible through the ticket link
- Ongoing support: We''ll continue working with you until your issue is fully resolved

💬 Easy Reply: If you have any questions about the update or need to provide additional information, just reply to this email. Your response will automatically be added to the ticket, keeping all communication in one place for easy reference.

View Update: {{ticket_url}}

Your feedback matters: We''re committed to providing you with the best possible support experience. If at any point you feel we could improve our response or approach, please don''t hesitate to let us know. Your satisfaction is our priority, and we''re here to help in any way we can.

Best regards,
The MSC & Co Team'
WHERE name = 'Support - Ticket Updated';

-- 3. Support - Ticket Resolved
UPDATE marketing_email_templates
SET 
  subject_template = '✅ Ticket Resolved – Problem Solved!',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">✅ Ticket Resolved</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Great news! Your support ticket <strong>#{{ticket_number}}</strong> has been marked as resolved. We''ve addressed your inquiry and implemented a solution to the issue you reported. We hope everything is now working as expected and that you''re satisfied with the resolution. Is everything working correctly on your end? We want to make sure you''re fully satisfied before we close this ticket.</p>
    
    <div style="background: #f0fdf4; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #10b981;">
      <h2 style="color: #065f46; margin-top: 0; font-size: 20px; font-weight: 600;">What''s Next</h2>
      <p style="color: #047857; margin-bottom: 16px; line-height: 1.7;">Here''s what you can do:</p>
      <ul style="margin: 0; padding-left: 25px; color: #047857; line-height: 1.8;">
        <li style="margin-bottom: 8px;"><strong>Review the resolution:</strong> Check the details of how we addressed your issue</li>
        <li style="margin-bottom: 8px;"><strong>Test the solution:</strong> Verify that everything is working correctly on your end</li>
        <li style="margin-bottom: 8px;"><strong>Reopen if needed:</strong> If you encounter any issues or have questions, you can reopen the ticket</li>
        <li style="margin-bottom: 8px;"><strong>Provide feedback:</strong> Let us know how we did – your input helps us improve</li>
      </ul>
    </div>
    
    <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #92400e; line-height: 1.7; font-size: 14px;"><strong>🔄 Need to Reopen?</strong> If you find that the issue isn''t fully resolved or you have additional questions, don''t worry – you can easily reopen this ticket by replying to this email or clicking the link below. We''re here to ensure your issue is completely resolved.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{ticket_url}}" style="background: #2ecc71; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Review Resolution</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #2ecc71;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Thank you for your patience:</strong> We appreciate you taking the time to work with us to resolve this issue. Your feedback and cooperation throughout the process were invaluable, and we''re grateful for the opportunity to help. If you need any further assistance in the future, please don''t hesitate to reach out – we''re always here to help!</p>
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
  body_text_template = '✅ Ticket Resolved – Problem Solved!

Hi {{user_name}},

Great news! Your support ticket #{{ticket_number}} has been marked as resolved. We''ve addressed your inquiry and implemented a solution to the issue you reported. We hope everything is now working as expected and that you''re satisfied with the resolution. Is everything working correctly on your end? We want to make sure you''re fully satisfied before we close this ticket.

What''s Next

Here''s what you can do:
- Review the resolution: Check the details of how we addressed your issue
- Test the solution: Verify that everything is working correctly on your end
- Reopen if needed: If you encounter any issues or have questions, you can reopen the ticket
- Provide feedback: Let us know how we did – your input helps us improve

🔄 Need to Reopen? If you find that the issue isn''t fully resolved or you have additional questions, don''t worry – you can easily reopen this ticket by replying to this email or clicking the link below. We''re here to ensure your issue is completely resolved.

Review Resolution: {{ticket_url}}

Thank you for your patience: We appreciate you taking the time to work with us to resolve this issue. Your feedback and cooperation throughout the process were invaluable, and we''re grateful for the opportunity to help. If you need any further assistance in the future, please don''t hesitate to reach out – we''re always here to help!

Best regards,
The MSC & Co Team'
WHERE name = 'Support - Ticket Resolved';

-- 4. Support - Help Article Recommendation
UPDATE marketing_email_templates
SET 
  subject_template = '📚 Help Article – This Might Help',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">📚 Help Article</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">We found a help article that might solve your question! <strong>{{article_title}}</strong> contains information, step-by-step guides, and solutions that directly address what you''re looking for. Our help center is full of comprehensive resources designed to answer common questions and help you get the most out of MSC & Co. This article has been specifically selected based on your inquiry, and we believe it will provide the guidance you need.</p>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">What You''ll Find</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">This article includes:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;"><strong>Clear explanations:</strong> Detailed information that answers your question thoroughly</li>
        <li style="margin-bottom: 8px;"><strong>Step-by-step guides:</strong> Easy-to-follow instructions to help you accomplish your goal</li>
        <li style="margin-bottom: 8px;"><strong>Visual aids:</strong> Screenshots and examples that make the process clear</li>
        <li style="margin-bottom: 8px;"><strong>Related resources:</strong> Links to additional articles that might be helpful</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>💡 Explore Our Help Center:</strong> While you''re there, take a moment to browse our complete help library. We''ve created comprehensive guides covering everything from getting started to advanced features, and you might find answers to questions you didn''t even know you had!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{article_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Read Article</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Still have questions?</strong> If this article doesn''t fully answer your question or if you need additional assistance, don''t hesitate to reach out to our support team. We''re here to help, and we''re always happy to provide personalized assistance when you need it.</p>
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
  body_text_template = '📚 Help Article – This Might Help

Hi {{user_name}},

We found a help article that might solve your question! {{article_title}} contains information, step-by-step guides, and solutions that directly address what you''re looking for. Our help center is full of comprehensive resources designed to answer common questions and help you get the most out of MSC & Co. This article has been specifically selected based on your inquiry, and we believe it will provide the guidance you need.

What You''ll Find

This article includes:
- Clear explanations: Detailed information that answers your question thoroughly
- Step-by-step guides: Easy-to-follow instructions to help you accomplish your goal
- Visual aids: Screenshots and examples that make the process clear
- Related resources: Links to additional articles that might be helpful

💡 Explore Our Help Center: While you''re there, take a moment to browse our complete help library. We''ve created comprehensive guides covering everything from getting started to advanced features, and you might find answers to questions you didn''t even know you had!

Read Article: {{article_url}}

Still have questions? If this article doesn''t fully answer your question or if you need additional assistance, don''t hesitate to reach out to our support team. We''re here to help, and we''re always happy to provide personalized assistance when you need it.

Best regards,
The MSC & Co Team'
WHERE name = 'Support - Help Article Recommendation';

-- 5. Support - FAQ Suggestion
UPDATE marketing_email_templates
SET 
  subject_template = '❓ FAQ – Common Question Answered',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">❓ FAQ</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Based on your question, here''s a helpful FAQ about <strong>{{faq_topic}}</strong> that might answer what you''re looking for. This is a common question we receive, and we''ve created a detailed answer that covers the key points, important considerations, and practical solutions. We think this FAQ will provide the clarity you need, and it''s been specifically selected because it directly relates to your inquiry.</p>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">Why This FAQ Helps</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">This FAQ provides:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;"><strong>Quick answers:</strong> Concise, clear responses to common questions</li>
        <li style="margin-bottom: 8px;"><strong>Important context:</strong> Background information that helps you understand the topic fully</li>
        <li style="margin-bottom: 8px;"><strong>Practical guidance:</strong> Actionable advice you can apply immediately</li>
        <li style="margin-bottom: 8px;"><strong>Related topics:</strong> Connections to other FAQs and resources that might be relevant</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>📚 Browse Our FAQ Library:</strong> We''ve compiled answers to hundreds of frequently asked questions. Whether you''re looking for information about features, billing, account management, or technical questions, our FAQ library is a great resource. Feel free to explore – you might find answers to questions you didn''t even know you had!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{faq_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">View FAQ</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Need more help?</strong> If this FAQ doesn''t fully address your question or if you''d like to discuss your specific situation in more detail, our support team is ready to assist. Don''t hesitate to reach out – we''re here to ensure you have all the information and support you need.</p>
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
  body_text_template = '❓ FAQ – Common Question Answered

Hi {{user_name}},

Based on your question, here''s a helpful FAQ about {{faq_topic}} that might answer what you''re looking for. This is a common question we receive, and we''ve created a detailed answer that covers the key points, important considerations, and practical solutions. We think this FAQ will provide the clarity you need, and it''s been specifically selected because it directly relates to your inquiry.

Why This FAQ Helps

This FAQ provides:
- Quick answers: Concise, clear responses to common questions
- Important context: Background information that helps you understand the topic fully
- Practical guidance: Actionable advice you can apply immediately
- Related topics: Connections to other FAQs and resources that might be relevant

📚 Browse Our FAQ Library: We''ve compiled answers to hundreds of frequently asked questions. Whether you''re looking for information about features, billing, account management, or technical questions, our FAQ library is a great resource. Feel free to explore – you might find answers to questions you didn''t even know you had!

View FAQ: {{faq_url}}

Need more help? If this FAQ doesn''t fully address your question or if you''d like to discuss your specific situation in more detail, our support team is ready to assist. Don''t hesitate to reach out – we''re here to ensure you have all the information and support you need.

Best regards,
The MSC & Co Team'
WHERE name = 'Support - FAQ Suggestion';

-- 6. Support - Community Invite
UPDATE marketing_email_templates
SET 
  subject_template = '👥 Join Our Community – Get Help!',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">👥 Join Our Community</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Join our community forum! Connect with other artists, share tips, and get help from peers who understand your journey. Our community is a vibrant space where music creators come together to share experiences, learn from each other, and support one another''s growth. Whether you''re looking for technical advice, creative inspiration, or just want to connect with like-minded people, our community is the perfect place to engage, learn, and grow alongside fellow artists.</p>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">What You Can Do</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">In our community, you can:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;"><strong>Get help from peers:</strong> Ask questions and get answers from artists who''ve been there</li>
        <li style="margin-bottom: 8px;"><strong>Share your knowledge:</strong> Help others by sharing your own experiences and tips</li>
        <li style="margin-bottom: 8px;"><strong>Network and connect:</strong> Build relationships with other music creators and industry professionals</li>
        <li style="margin-bottom: 8px;"><strong>Stay informed:</strong> Get the latest updates, tips, and insights from the community</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>🤝 A Supportive Environment:</strong> Our community is built on respect, collaboration, and mutual support. We''ve created a welcoming space where everyone can learn, share, and grow together. Join us and become part of a community that truly cares about each member''s success.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{community_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Join Community</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Your voice matters:</strong> Every member of our community brings unique perspectives and experiences. Your contributions help make our community stronger and more valuable for everyone. We''re excited to have you join us and look forward to seeing how you contribute to the conversation!</p>
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
  body_text_template = '👥 Join Our Community – Get Help!

Hi {{user_name}},

Join our community forum! Connect with other artists, share tips, and get help from peers who understand your journey. Our community is a vibrant space where music creators come together to share experiences, learn from each other, and support one another''s growth. Whether you''re looking for technical advice, creative inspiration, or just want to connect with like-minded people, our community is the perfect place to engage, learn, and grow alongside fellow artists.

What You Can Do

In our community, you can:
- Get help from peers: Ask questions and get answers from artists who''ve been there
- Share your knowledge: Help others by sharing your own experiences and tips
- Network and connect: Build relationships with other music creators and industry professionals
- Stay informed: Get the latest updates, tips, and insights from the community

🤝 A Supportive Environment: Our community is built on respect, collaboration, and mutual support. We''ve created a welcoming space where everyone can learn, share, and grow together. Join us and become part of a community that truly cares about each member''s success.

Join Community: {{community_url}}

Your voice matters: Every member of our community brings unique perspectives and experiences. Your contributions help make our community stronger and more valuable for everyone. We''re excited to have you join us and look forward to seeing how you contribute to the conversation!

Best regards,
The MSC & Co Team'
WHERE name = 'Support - Community Invite';

-- 7. Support - Feedback Request
UPDATE marketing_email_templates
SET 
  subject_template = '💬 We''d Love Your Feedback',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">💬 We''d Love Your Feedback</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Your opinion matters! We''d love to hear your feedback to help us improve. It only takes a minute, but your insights have a huge impact on how we evolve and enhance MSC & Co. Your experiences, suggestions, and perspectives are invaluable to us because they help us understand what''s working well, what could be better, and how we can continue to serve you and the entire community more effectively. Every piece of feedback we receive is carefully considered and directly informs our decisions.</p>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">Why Your Feedback Matters</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">Your feedback helps us:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;"><strong>Improve features:</strong> Understand how features are working in real-world scenarios</li>
        <li style="margin-bottom: 8px;"><strong>Fix issues:</strong> Identify problems and prioritize what needs attention</li>
        <li style="margin-bottom: 8px;"><strong>Build better tools:</strong> Create solutions that truly address your needs</li>
        <li style="margin-bottom: 8px;"><strong>Enhance your experience:</strong> Make MSC & Co more useful, intuitive, and valuable for you</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>⏱️ Quick and Easy:</strong> Sharing your feedback takes just a minute, but it makes a lasting impact. Whether you want to highlight something you love, suggest an improvement, or share a concern, we genuinely want to hear from you. Your voice directly shapes the future of MSC & Co.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{feedback_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Share Feedback</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Thank you in advance:</strong> We truly appreciate you taking the time to share your thoughts with us. Your feedback is a gift that helps us serve you better, and we''re grateful for your willingness to help us improve. Every comment, suggestion, and piece of feedback makes MSC & Co better for everyone.</p>
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
  body_text_template = '💬 We''d Love Your Feedback

Hi {{user_name}},

Your opinion matters! We''d love to hear your feedback to help us improve. It only takes a minute, but your insights have a huge impact on how we evolve and enhance MSC & Co. Your experiences, suggestions, and perspectives are invaluable to us because they help us understand what''s working well, what could be better, and how we can continue to serve you and the entire community more effectively. Every piece of feedback we receive is carefully considered and directly informs our decisions.

Why Your Feedback Matters

Your feedback helps us:
- Improve features: Understand how features are working in real-world scenarios
- Fix issues: Identify problems and prioritize what needs attention
- Build better tools: Create solutions that truly address your needs
- Enhance your experience: Make MSC & Co more useful, intuitive, and valuable for you

⏱️ Quick and Easy: Sharing your feedback takes just a minute, but it makes a lasting impact. Whether you want to highlight something you love, suggest an improvement, or share a concern, we genuinely want to hear from you. Your voice directly shapes the future of MSC & Co.

Share Feedback: {{feedback_url}}

Thank you in advance: We truly appreciate you taking the time to share your thoughts with us. Your feedback is a gift that helps us serve you better, and we''re grateful for your willingness to help us improve. Every comment, suggestion, and piece of feedback makes MSC & Co better for everyone.

Best regards,
The MSC & Co Team'
WHERE name = 'Support - Feedback Request';

-- 8. Support - Survey Invitation
UPDATE marketing_email_templates
SET 
  subject_template = '📋 Quick Survey – Help Us Improve',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">📋 Quick Survey</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Help us improve by taking a quick 2-minute survey! Your responses help shape our platform and directly influence how we build, improve, and evolve MSC & Co. This survey gives you the opportunity to share your experiences, provide insights about what matters most to you, and help us prioritize features and improvements that will make the biggest difference in your music career. Your voice matters, and we''re genuinely interested in hearing what you have to say.</p>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">What We''re Learning</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">This survey helps us understand:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;"><strong>Your experience:</strong> How you''re using the platform and what works well for you</li>
        <li style="margin-bottom: 8px;"><strong>Areas for improvement:</strong> What could be better and where we should focus our efforts</li>
        <li style="margin-bottom: 8px;"><strong>Feature priorities:</strong> What new capabilities would be most valuable to you</li>
        <li style="margin-bottom: 8px;"><strong>Your needs:</strong> How we can better support your goals and aspirations</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>⏱️ Just 2 Minutes:</strong> We know your time is valuable, so we''ve designed this survey to be quick and focused. It should take just a couple of minutes to complete, but your responses will have a meaningful impact on how we continue to improve MSC & Co. Every answer helps!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{survey_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Take Survey</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Thank you for your time:</strong> We truly appreciate you taking a few minutes to share your thoughts with us. Your feedback is invaluable, and it helps us create a platform that better serves you and the entire MSC & Co community. Your participation makes a real difference!</p>
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
  body_text_template = '📋 Quick Survey – Help Us Improve

Hi {{user_name}},

Help us improve by taking a quick 2-minute survey! Your responses help shape our platform and directly influence how we build, improve, and evolve MSC & Co. This survey gives you the opportunity to share your experiences, provide insights about what matters most to you, and help us prioritize features and improvements that will make the biggest difference in your music career. Your voice matters, and we''re genuinely interested in hearing what you have to say.

What We''re Learning

This survey helps us understand:
- Your experience: How you''re using the platform and what works well for you
- Areas for improvement: What could be better and where we should focus our efforts
- Feature priorities: What new capabilities would be most valuable to you
- Your needs: How we can better support your goals and aspirations

⏱️ Just 2 Minutes: We know your time is valuable, so we''ve designed this survey to be quick and focused. It should take just a couple of minutes to complete, but your responses will have a meaningful impact on how we continue to improve MSC & Co. Every answer helps!

Take Survey: {{survey_url}}

Thank you for your time: We truly appreciate you taking a few minutes to share your thoughts with us. Your feedback is invaluable, and it helps us create a platform that better serves you and the entire MSC & Co community. Your participation makes a real difference!

Best regards,
The MSC & Co Team'
WHERE name = 'Support - Survey Invitation';

-- 9. Support - Feature Request Update
UPDATE marketing_email_templates
SET 
  subject_template = '💡 Feature Request Update',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">💡 Feature Request Update</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Update on your feature request <strong>"{{feature_name}}"</strong>: <strong>{{status}}</strong>. We wanted to keep you informed about the progress on this feature request because your input matters to us. Every feature request we receive is carefully reviewed, evaluated, and considered as we plan our product roadmap. We understand that you took the time to share this idea with us, and we want to make sure you know we''re paying attention and taking your suggestions seriously.</p>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">What This Means</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">We''re keeping you in the loop:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;"><strong>Transparency:</strong> We believe in keeping you informed about the status of your requests</li>
        <li style="margin-bottom: 8px;"><strong>Your voice matters:</strong> Your feature requests directly influence our product development</li>
        <li style="margin-bottom: 8px;"><strong>Ongoing review:</strong> We continuously evaluate feature requests as priorities and resources evolve</li>
        <li style="margin-bottom: 8px;"><strong>Continued engagement:</strong> We''ll keep you updated as the status of this feature request changes</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7; font-size: 14px;"><strong>🔄 Status Changes:</strong> Feature request statuses can change as we learn more, priorities shift, or development resources become available. We''ll continue to keep you informed as this feature request progresses through our evaluation and development process.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{update_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">View Update</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>Thank you for your suggestion:</strong> We genuinely appreciate you taking the time to share your feature request with us. Your ideas help us understand what matters most to our community and guide us in building features that truly serve your needs. Keep the suggestions coming – we''re listening!</p>
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
  body_text_template = '💡 Feature Request Update

Hi {{user_name}},

Update on your feature request "{{feature_name}}": {{status}}. We wanted to keep you informed about the progress on this feature request because your input matters to us. Every feature request we receive is carefully reviewed, evaluated, and considered as we plan our product roadmap. We understand that you took the time to share this idea with us, and we want to make sure you know we''re paying attention and taking your suggestions seriously.

What This Means

We''re keeping you in the loop:
- Transparency: We believe in keeping you informed about the status of your requests
- Your voice matters: Your feature requests directly influence our product development
- Ongoing review: We continuously evaluate feature requests as priorities and resources evolve
- Continued engagement: We''ll keep you updated as the status of this feature request changes

🔄 Status Changes: Feature request statuses can change as we learn more, priorities shift, or development resources become available. We''ll continue to keep you informed as this feature request progresses through our evaluation and development process.

View Update: {{update_url}}

Thank you for your suggestion: We genuinely appreciate you taking the time to share your feature request with us. Your ideas help us understand what matters most to our community and guide us in building features that truly serve your needs. Keep the suggestions coming – we''re listening!

Best regards,
The MSC & Co Team'
WHERE name = 'Support - Feature Request Update';

-- 10. Support - Live Chat Available
UPDATE marketing_email_templates
SET 
  subject_template = '💬 Live Chat Available – Get Instant Help',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">💬 Live Chat Available</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Need immediate help? Our live chat is available now! Get instant answers to your questions through real-time conversation with our support team. Sometimes you need quick answers, immediate guidance, or just want to have a conversation about something that''s on your mind. That''s exactly what our live chat is designed for – instant, personal, and helpful support when you need it most. Our support team is standing by, ready to assist you right away.</p>
    
    <div style="background: #f0fdf4; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #10b981;">
      <h2 style="color: #065f46; margin-top: 0; font-size: 20px; font-weight: 600;">Why Live Chat Works</h2>
      <p style="color: #047857; margin-bottom: 16px; line-height: 1.7;">Live chat provides:</p>
      <ul style="margin: 0; padding-left: 25px; color: #047857; line-height: 1.8;">
        <li style="margin-bottom: 8px;"><strong>Instant connection:</strong> Connect with a support agent immediately, no waiting</li>
        <li style="margin-bottom: 8px;"><strong>Real-time help:</strong> Get answers to your questions right away in a conversation</li>
        <li style="margin-bottom: 8px;"><strong>Convenient:</strong> Chat while you work, no need to switch contexts or wait for emails</li>
        <li style="margin-bottom: 8px;"><strong>Personal assistance:</strong> One-on-one support tailored to your specific needs and situation</li>
      </ul>
    </div>
    
    <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #92400e; line-height: 1.7; font-size: 14px;"><strong>💬 Ready When You Are:</strong> Our live chat is available during business hours, and we''re here to help with whatever you need. Whether you have a quick question, need technical assistance, or want guidance on how to make the most of MSC & Co, we''re just a chat away!</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{chat_url}}" style="background: #2ecc71; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Start Chat</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #2ecc71;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7; font-size: 14px;"><strong>We''re here for you:</strong> Our support team is knowledgeable, friendly, and genuinely committed to helping you succeed. No matter what you need help with, we''re ready to assist. Don''t hesitate to reach out – that''s what we''re here for, and we''re looking forward to chatting with you!</p>
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
  body_text_template = '💬 Live Chat Available – Get Instant Help

Hi {{user_name}},

Need immediate help? Our live chat is available now! Get instant answers to your questions through real-time conversation with our support team. Sometimes you need quick answers, immediate guidance, or just want to have a conversation about something that''s on your mind. That''s exactly what our live chat is designed for – instant, personal, and helpful support when you need it most. Our support team is standing by, ready to assist you right away.

Why Live Chat Works

Live chat provides:
- Instant connection: Connect with a support agent immediately, no waiting
- Real-time help: Get answers to your questions right away in a conversation
- Convenient: Chat while you work, no need to switch contexts or wait for emails
- Personal assistance: One-on-one support tailored to your specific needs and situation

💬 Ready When You Are: Our live chat is available during business hours, and we''re here to help with whatever you need. Whether you have a quick question, need technical assistance, or want guidance on how to make the most of MSC & Co, we''re just a chat away!

Start Chat: {{chat_url}}

We''re here for you: Our support team is knowledgeable, friendly, and genuinely committed to helping you succeed. No matter what you need help with, we''re ready to assist. Don''t hesitate to reach out – that''s what we''re here for, and we''re looking forward to chatting with you!

Best regards,
The MSC & Co Team'
WHERE name = 'Support - Live Chat Available';

-- ===========================================
-- UPDATE COMPLETE
-- ===========================================
-- Updated 10 support templates with enhanced content:
-- 1. Support - Ticket Created
-- 2. Support - Ticket Updated
-- 3. Support - Ticket Resolved
-- 4. Support - Help Article Recommendation
-- 5. Support - FAQ Suggestion
-- 6. Support - Community Invite
-- 7. Support - Feedback Request
-- 8. Support - Survey Invitation
-- 9. Support - Feature Request Update
-- 10. Support - Live Chat Available
-- ===========================================
