-- ===========================================
-- ENHANCE ALL BILLING TEMPLATES
-- More elaborate, relational, and professional content
-- ===========================================
-- Date: 2025-01-28
-- Purpose: Update all billing templates with enhanced content and consistent styling
-- Total Templates Updated: 7 (3 already enhanced separately)
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

-- 1. Billing - Subscription Renewed
UPDATE marketing_email_templates
SET 
  subject_template = 'Subscription Renewed Successfully – Thank You!',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">✅ Subscription Renewed Successfully</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Great news! Your <strong>{{tier}}</strong> subscription has been successfully renewed. Your next renewal is scheduled for <strong>{{next_renewal_date}}</strong>, and you can continue enjoying uninterrupted access to all platform features and benefits.</p>
    
    <div style="background: #f0fdf4; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #10b981;">
      <h2 style="color: #065f46; margin-top: 0; font-size: 20px; font-weight: 600;">What This Means for You</h2>
      <p style="color: #047857; margin-bottom: 16px; line-height: 1.7;">Your renewal ensures continued access to:</p>
      <ul style="margin: 0; padding-left: 25px; color: #047857; line-height: 1.8;">
        <li style="margin-bottom: 8px;">All premium features and tools included in your {{tier}} plan</li>
        <li style="margin-bottom: 8px;">Priority customer support whenever you need assistance</li>
        <li style="margin-bottom: 8px;">Regular platform updates and new feature releases</li>
        <li style="margin-bottom: 8px;">Full access to your account and all subscription benefits</li>
      </ul>
    </div>
    
    <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #92400e; line-height: 1.7;"><strong>💡 Keep Your Billing Info Updated:</strong> To ensure smooth renewals in the future, we recommend reviewing your billing information periodically. This helps avoid any potential payment issues and ensures uninterrupted service.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{billing_url}}" style="background: #2ecc71; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">View Billing Details</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #2ecc71;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>We''re here to help:</strong> If you have any questions about your subscription, billing, or account features, our support team is always available. Simply reply to this email or visit our support center for assistance.</p>
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
  body_text_template = 'Subscription Renewed Successfully – Thank You!

Hi {{user_name}},

Great news! Your {{tier}} subscription has been successfully renewed. Your next renewal is scheduled for {{next_renewal_date}}, and you can continue enjoying uninterrupted access to all platform features and benefits.

What This Means for You

Your renewal ensures continued access to:
- All premium features and tools included in your {{tier}} plan
- Priority customer support whenever you need assistance
- Regular platform updates and new feature releases
- Full access to your account and all subscription benefits

💡 Keep Your Billing Info Updated: To ensure smooth renewals in the future, we recommend reviewing your billing information periodically. This helps avoid any potential payment issues and ensures uninterrupted service.

View Billing Details: {{billing_url}}

We''re here to help: If you have any questions about your subscription, billing, or account features, our support team is always available. Simply reply to this email or visit our support center for assistance.

Best regards,
The MSC & Co Team'
WHERE name = 'Billing - Subscription Renewed';

-- 2. Billing - Payment Failed
UPDATE marketing_email_templates
SET 
  subject_template = 'Payment Failed – Action Required to Continue Service',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">⚠️ Payment Failed – Action Required</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">We attempted to process your payment of <strong>{{amount}}</strong>, but unfortunately, the transaction was declined. To ensure your subscription continues without interruption, we need you to update your payment method.</p>
    
    <div style="background: #fff7ed; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f59e0b;">
      <h2 style="color: #92400e; margin-top: 0; font-size: 20px; font-weight: 600;">Why This Happened</h2>
      <p style="color: #78350f; margin-bottom: 16px; line-height: 1.7;">Payment failures can occur for several common reasons:</p>
      <ul style="margin: 0; padding-left: 25px; color: #78350f; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Your card may have expired or been cancelled</li>
        <li style="margin-bottom: 8px;">Insufficient funds in your account</li>
        <li style="margin-bottom: 8px;">Your bank may have declined the transaction for security reasons</li>
        <li style="margin-bottom: 8px;">The billing address on file may need to be updated</li>
      </ul>
    </div>
    
    <div style="background: #fef2f2; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f5576c;">
      <h2 style="color: #991b1b; margin-top: 0; font-size: 20px; font-weight: 600;">What You Need to Do</h2>
      <p style="color: #7f1d1d; margin-bottom: 0; line-height: 1.7;">Please update your payment method as soon as possible to avoid any service interruption. Once updated, we''ll automatically retry the payment, and your subscription will continue seamlessly.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{retry_url}}" style="background: #f5576c; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Update Payment Method</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f5576c;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>Need help?</strong> If you''re experiencing issues updating your payment method or have questions about this transaction, our support team is here to assist you. We understand that payment issues can be frustrating, and we''re committed to helping you resolve this quickly. Simply reply to this email or contact our support center.</p>
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
  body_text_template = 'Payment Failed – Action Required to Continue Service

Hi {{user_name}},

We attempted to process your payment of {{amount}}, but unfortunately, the transaction was declined. To ensure your subscription continues without interruption, we need you to update your payment method.

Why This Happened

Payment failures can occur for several common reasons:
- Your card may have expired or been cancelled
- Insufficient funds in your account
- Your bank may have declined the transaction for security reasons
- The billing address on file may need to be updated

What You Need to Do

Please update your payment method as soon as possible to avoid any service interruption. Once updated, we''ll automatically retry the payment, and your subscription will continue seamlessly.

Update Payment Method: {{retry_url}}

Need help? If you''re experiencing issues updating your payment method or have questions about this transaction, our support team is here to assist you. We understand that payment issues can be frustrating, and we''re committed to helping you resolve this quickly. Simply reply to this email or contact our support center.

Best regards,
The MSC & Co Team'
WHERE name = 'Billing - Payment Failed';

-- 3. Billing - Payment Retry Successful
UPDATE marketing_email_templates
SET 
  subject_template = 'Payment Processed Successfully – Your Subscription is Active!',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">✅ Payment Processed Successfully</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Excellent news! Your payment of <strong>{{amount}}</strong> has been successfully processed. Your subscription is now fully active, and you can continue enjoying all your platform features without any interruption.</p>
    
    <div style="background: #f0fdf4; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #10b981;">
      <h2 style="color: #065f46; margin-top: 0; font-size: 20px; font-weight: 600;">All Set!</h2>
      <p style="color: #047857; margin-bottom: 16px; line-height: 1.7;">Your account is in good standing, and you have full access to:</p>
      <ul style="margin: 0; padding-left: 25px; color: #047857; line-height: 1.8;">
        <li style="margin-bottom: 8px;">All subscription features and premium tools</li>
        <li style="margin-bottom: 8px;">Uninterrupted service and platform access</li>
        <li style="margin-bottom: 8px;">Priority customer support</li>
        <li style="margin-bottom: 8px;">All benefits included in your plan</li>
      </ul>
    </div>
    
    <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #0c4a6e; line-height: 1.7;"><strong>📄 Your Invoice:</strong> A detailed invoice for this payment has been generated and is available in your account. You can download it at any time for your records.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{invoice_url}}" style="background: #2ecc71; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">View Invoice</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #2ecc71;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>Thank you for your prompt action!</strong> We appreciate you taking the time to update your payment method. If you have any questions about this transaction or your subscription, feel free to reach out to our support team. We''re here to help.</p>
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
  body_text_template = 'Payment Processed Successfully – Your Subscription is Active!

Hi {{user_name}},

Excellent news! Your payment of {{amount}} has been successfully processed. Your subscription is now fully active, and you can continue enjoying all your platform features without any interruption.

All Set!

Your account is in good standing, and you have full access to:
- All subscription features and premium tools
- Uninterrupted service and platform access
- Priority customer support
- All benefits included in your plan

📄 Your Invoice: A detailed invoice for this payment has been generated and is available in your account. You can download it at any time for your records.

View Invoice: {{invoice_url}}

Thank you for your prompt action! We appreciate you taking the time to update your payment method. If you have any questions about this transaction or your subscription, feel free to reach out to our support team. We''re here to help.

Best regards,
The MSC & Co Team'
WHERE name = 'Billing - Payment Retry Successful';

-- 4. Billing - Expiring Soon 7 Days
UPDATE marketing_email_templates
SET 
  subject_template = 'Your Subscription Expires in 7 Days – Renew Now to Continue',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">⏰ Your Subscription Expires in 7 Days</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">This is a friendly reminder that your MSC & Co subscription is set to expire on <strong>{{renewal_date}}</strong> – that''s just 7 days away. We wanted to make sure you have plenty of time to renew and avoid any interruption to your service.</p>
    
    <div style="background: #fff7ed; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f59e0b;">
      <h2 style="color: #92400e; margin-top: 0; font-size: 20px; font-weight: 600;">Why Renew Now?</h2>
      <p style="color: #78350f; margin-bottom: 16px; line-height: 1.7;">Renewing your subscription ensures you continue to enjoy:</p>
      <ul style="margin: 0; padding-left: 25px; color: #78350f; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Uninterrupted access to all platform features and tools</li>
        <li style="margin-bottom: 8px;">All your data, settings, and preferences remain intact</li>
        <li style="margin-bottom: 8px;">No service disruption or loss of account functionality</li>
        <li style="margin-bottom: 8px;">Continued priority support and regular platform updates</li>
      </ul>
    </div>
    
    <div style="background: #fef2f2; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f5576c;">
      <h2 style="color: #991b1b; margin-top: 0; font-size: 20px; font-weight: 600;">Take Action Today</h2>
      <p style="color: #7f1d1d; margin-bottom: 0; line-height: 1.7;">Renewing is quick and easy – it takes just a moment, and you''ll continue enjoying all your current benefits without any gap in service.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{renew_url}}" style="background: #f5576c; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Renew Subscription Now</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f5576c;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>Questions about renewal?</strong> If you have any concerns or would like to discuss your subscription options, our support team is here to help. We want to make sure you''re getting the most value from your MSC & Co membership. Simply reply to this email or contact our support center.</p>
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
  body_text_template = 'Your Subscription Expires in 7 Days – Renew Now to Continue

Hi {{user_name}},

This is a friendly reminder that your MSC & Co subscription is set to expire on {{renewal_date}} – that''s just 7 days away. We wanted to make sure you have plenty of time to renew and avoid any interruption to your service.

Why Renew Now?

Renewing your subscription ensures you continue to enjoy:
- Uninterrupted access to all platform features and tools
- All your data, settings, and preferences remain intact
- No service disruption or loss of account functionality
- Continued priority support and regular platform updates

Take Action Today

Renewing is quick and easy – it takes just a moment, and you''ll continue enjoying all your current benefits without any gap in service.

Renew Subscription Now: {{renew_url}}

Questions about renewal? If you have any concerns or would like to discuss your subscription options, our support team is here to help. We want to make sure you''re getting the most value from your MSC & Co membership. Simply reply to this email or contact our support center.

Best regards,
The MSC & Co Team'
WHERE name = 'Billing - Expiring Soon 7 Days';

-- 5. Billing - Expiring Soon 14 Days
UPDATE marketing_email_templates
SET 
  subject_template = 'Your Subscription Expires in 14 Days – Early Renewal Reminder',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">📅 Your Subscription Expires in 14 Days</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">We wanted to give you a heads up that your MSC & Co subscription will expire on <strong>{{renewal_date}}</strong> – that''s 14 days from now. Renewing early ensures you maintain your current rate and avoid any last-minute rush.</p>
    
    <div style="background: #fff7ed; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f59e0b;">
      <h2 style="color: #92400e; margin-top: 0; font-size: 20px; font-weight: 600;">Benefits of Early Renewal</h2>
      <p style="color: #78350f; margin-bottom: 16px; line-height: 1.7;">Renewing now offers several advantages:</p>
      <ul style="margin: 0; padding-left: 25px; color: #78350f; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Secure your current subscription rate and plan benefits</li>
        <li style="margin-bottom: 8px;">Peace of mind knowing your service continues seamlessly</li>
        <li style="margin-bottom: 8px;">No need to worry about expiration dates or service gaps</li>
        <li style="margin-bottom: 8px;">More time to focus on what matters – your music and career</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7;"><strong>💡 Pro Tip:</strong> Renewing early is quick and straightforward. You can complete the process in just a few clicks, and your subscription will seamlessly continue without any interruption to your account or access.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{renew_url}}" style="background: #f5af19; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Renew Subscription</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f5af19;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>We''re here if you need us:</strong> If you have questions about your subscription, want to explore plan options, or need assistance with renewal, our support team is available to help. Don''t hesitate to reach out – we''re committed to making your experience as smooth as possible.</p>
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
  body_text_template = 'Your Subscription Expires in 14 Days – Early Renewal Reminder

Hi {{user_name}},

We wanted to give you a heads up that your MSC & Co subscription will expire on {{renewal_date}} – that''s 14 days from now. Renewing early ensures you maintain your current rate and avoid any last-minute rush.

Benefits of Early Renewal

Renewing now offers several advantages:
- Secure your current subscription rate and plan benefits
- Peace of mind knowing your service continues seamlessly
- No need to worry about expiration dates or service gaps
- More time to focus on what matters – your music and career

💡 Pro Tip: Renewing early is quick and straightforward. You can complete the process in just a few clicks, and your subscription will seamlessly continue without any interruption to your account or access.

Renew Subscription: {{renew_url}}

We''re here if you need us: If you have questions about your subscription, want to explore plan options, or need assistance with renewal, our support team is available to help. Don''t hesitate to reach out – we''re committed to making your experience as smooth as possible.

Best regards,
The MSC & Co Team'
WHERE name = 'Billing - Expiring Soon 14 Days';

-- 6. Billing - Expiring Soon 30 Days
UPDATE marketing_email_templates
SET 
  subject_template = 'Subscription Expiration Notice – 30 Days Remaining',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">📆 Your Subscription Expires in 30 Days</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">This is an early notice that your MSC & Co subscription is scheduled to expire on <strong>{{renewal_date}}</strong> – 30 days from today. We''re reaching out now to give you plenty of time to plan ahead and ensure a smooth renewal process.</p>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">Plan Ahead for Seamless Continuity</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">With 30 days remaining, you have time to:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Review your current plan and ensure it still meets your needs</li>
        <li style="margin-bottom: 8px;">Update your payment method if needed</li>
        <li style="margin-bottom: 8px;">Explore any plan upgrades or changes that might benefit you</li>
        <li style="margin-bottom: 8px;">Renew at your convenience without any last-minute pressure</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7;"><strong>📅 Important:</strong> Your subscription will remain fully active until {{renewal_date}}, so there''s no immediate action required. However, renewing early ensures you lock in your current rate and avoid any potential service interruption.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{renew_url}}" style="background: #f5af19; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Renew Subscription</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f5af19;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>Questions or need assistance?</strong> Our support team is here to help you with any questions about renewal, plan options, or your subscription. We want to make sure you have all the information you need to make the best decision for your needs. Feel free to reply to this email or reach out to our support center.</p>
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
  body_text_template = 'Subscription Expiration Notice – 30 Days Remaining

Hi {{user_name}},

This is an early notice that your MSC & Co subscription is scheduled to expire on {{renewal_date}} – 30 days from today. We''re reaching out now to give you plenty of time to plan ahead and ensure a smooth renewal process.

Plan Ahead for Seamless Continuity

With 30 days remaining, you have time to:
- Review your current plan and ensure it still meets your needs
- Update your payment method if needed
- Explore any plan upgrades or changes that might benefit you
- Renew at your convenience without any last-minute pressure

📅 Important: Your subscription will remain fully active until {{renewal_date}}, so there''s no immediate action required. However, renewing early ensures you lock in your current rate and avoid any potential service interruption.

Renew Subscription: {{renew_url}}

Questions or need assistance? Our support team is here to help you with any questions about renewal, plan options, or your subscription. We want to make sure you have all the information you need to make the best decision for your needs. Feel free to reply to this email or reach out to our support center.

Best regards,
The MSC & Co Team'
WHERE name = 'Billing - Expiring Soon 30 Days';

-- 7. Billing - Invoice Available
UPDATE marketing_email_templates
SET 
  subject_template = 'Your Invoice is Ready for Download',
  body_html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">📄 Your Invoice is Ready</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 14px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>
    
    <p style="font-size: 14px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">Your invoice <strong>#{{invoice_number}}</strong> for <strong>{{amount}}</strong> has been generated and is now available for download. This invoice contains all the details of your recent transaction and can be saved for your records or used for accounting purposes.</p>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">Invoice Details</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">Your invoice includes:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Complete transaction details and itemized charges</li>
        <li style="margin-bottom: 8px;">Payment method and billing information</li>
        <li style="margin-bottom: 8px;">Transaction date and invoice number for your records</li>
        <li style="margin-bottom: 8px;">Professional format suitable for tax or accounting purposes</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7;"><strong>💾 Save for Your Records:</strong> We recommend downloading and saving this invoice for your records. You can access all your invoices anytime from your billing dashboard, but having a local copy ensures you always have it when you need it.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{invoice_url}}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">View & Download Invoice</a>
    </div>
    
    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>Questions about your invoice?</strong> If you notice any discrepancies or have questions about the charges, please don''t hesitate to contact our billing support team. We''re here to help clarify any details and ensure everything is accurate. Simply reply to this email or reach out through our support center.</p>
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
  body_text_template = 'Your Invoice is Ready for Download

Hi {{user_name}},

Your invoice #{{invoice_number}} for {{amount}} has been generated and is now available for download. This invoice contains all the details of your recent transaction and can be saved for your records or used for accounting purposes.

Invoice Details

Your invoice includes:
- Complete transaction details and itemized charges
- Payment method and billing information
- Transaction date and invoice number for your records
- Professional format suitable for tax or accounting purposes

💾 Save for Your Records: We recommend downloading and saving this invoice for your records. You can access all your invoices anytime from your billing dashboard, but having a local copy ensures you always have it when you need it.

View & Download Invoice: {{invoice_url}}

Questions about your invoice? If you notice any discrepancies or have questions about the charges, please don''t hesitate to contact our billing support team. We''re here to help clarify any details and ensure everything is accurate. Simply reply to this email or reach out through our support center.

Best regards,
The MSC & Co Team'
WHERE name = 'Billing - Invoice Available';

-- ===========================================
-- UPDATE COMPLETE
-- ===========================================
-- Updated 7 billing templates with enhanced content:
-- 1. Billing - Subscription Renewed
-- 2. Billing - Payment Failed
-- 3. Billing - Payment Retry Successful
-- 4. Billing - Expiring Soon 7 Days
-- 5. Billing - Expiring Soon 14 Days
-- 6. Billing - Expiring Soon 30 Days
-- 7. Billing - Invoice Available
--
-- Note: The following 3 templates were already enhanced separately:
-- - Billing - Annual Renewal Reminder
-- - Billing - Grace Period Ending
-- - Billing - Subscription Cancelled
-- ===========================================

