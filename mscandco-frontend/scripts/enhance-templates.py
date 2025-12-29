#!/usr/bin/env python3
"""
Enhance all 129 email templates with professional copy, logo, and better structure
"""

import re
import sys
from pathlib import Path

# Logo HTML - will use {{logo_url}} variable
LOGO_IMG = '<img src="{{logo_url}}" alt="MSC & Co" style="max-width: 180px; height: auto; margin-bottom: 20px;" />'

def escape_sql(text):
    """Escape single quotes for SQL"""
    return text.replace("'", "''")

def create_enhanced_html(title, greeting, introduction, main_content, cta_text, cta_url, 
                         additional_info, footer_note, gradient_start='#667eea', gradient_end='#764ba2'):
    """Create enhanced HTML email template"""
    html = f'''<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, {gradient_start} 0%, {gradient_end} 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    {LOGO_IMG}
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">{title}</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px; color: #2d3748;">{greeting}</p>
    
'''
    if introduction:
        html += f'    <p style="font-size: 16px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">{introduction}</p>\n    \n'
    
    if main_content:
        html += f'    {main_content}\n    \n'
    
    if cta_text and cta_url:
        html += f'''    <div style="text-align: center; margin: 40px 0;">
      <a href="{cta_url}" style="background: {gradient_start}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">{cta_text}</a>
    </div>
    
'''
    
    if additional_info:
        html += f'    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid {gradient_start};">{additional_info}</div>\n    \n'
    
    if footer_note:
        html += f'    <p style="font-size: 14px; color: #718096; margin-top: 40px; line-height: 1.6;">{footer_note}</p>\n    \n'
    
    html += '''    <p style="font-size: 16px; margin-top: 40px; color: #2d3748;">
      Best regards,<br>
      <strong style="color: #1a202c;">The MSC & Co Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 30px; padding: 20px; color: #a0aec0; font-size: 12px; background: #ffffff; border-radius: 8px;">
    <p style="margin: 0 0 10px 0; font-weight: 500; color: #718096;">MSC & Co | Empowering the Music Industry</p>
    <p style="margin: 0;">
      <a href="{{unsubscribe_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Unsubscribe</a> | 
      <a href="{{preferences_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Email Preferences</a> | 
      <a href="{{support_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Support</a>
    </p>
  </div>
</body>
</html>'''
    
    return html

def get_enhanced_content(template_name, category, original_subject, description):
    """Get enhanced content for a template based on its name and category"""
    name_lower = template_name.lower()
    
    # WELCOME TEMPLATES
    if 'welcome' in name_lower and 'new user' in name_lower:
        return {
            'subject': 'Welcome to MSC & Co – Your Journey Starts Here! 🎵',
            'html': create_enhanced_html(
                title='Welcome to MSC & Co!',
                greeting='Hi {{user_name}},',
                introduction="We're absolutely thrilled to have you join the MSC & Co family! You've taken an exciting step forward, and you're now part of a cutting-edge platform designed to empower artists, labels, and music industry professionals like yourself.",
                main_content='''<div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
      <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px; font-weight: 600;">🎯 Get Started on Your Journey</h2>
      <p style="color: #075985; margin-bottom: 16px; line-height: 1.7;">Here's what you can do right away to make the most of your MSC & Co experience:</p>
      <ul style="margin: 0; padding-left: 25px; color: #075985; line-height: 1.8;">
        <li style="margin-bottom: 10px;"><strong>Complete your profile:</strong> Unlock all features by adding your information and preferences</li>
        <li style="margin-bottom: 10px;"><strong>Explore the dashboard:</strong> Discover powerful tools and insights tailored to your needs</li>
        <li style="margin-bottom: 10px;"><strong>Check out resources:</strong> Access tutorials, guides, and best practices from industry experts</li>
        <li style="margin-bottom: 10px;"><strong>Connect with community:</strong> Join a network of talented artists and professionals</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; line-height: 1.7;"><strong>💡 Pro Tip:</strong> Take a few minutes to complete your profile setup. This will personalize your experience and help you discover features most relevant to your goals.</p>
    </div>''',
                cta_text='Go to Dashboard',
                cta_url='{{dashboard_url}}',
                footer_note="Need help getting started? Our support team is here for you. Simply reply to this email or visit our help center for assistance. We're committed to making your experience with MSC & Co exceptional.",
                gradient_start='#667eea',
                gradient_end='#764ba2'
            ),
            'text': f'''Welcome to MSC & Co!

Hi {{user_name}},

We're absolutely thrilled to have you join the MSC & Co family! You've taken an exciting step forward, and you're now part of a cutting-edge platform designed to empower artists, labels, and music industry professionals like yourself.

Get Started on Your Journey:

Here's what you can do right away to make the most of your MSC & Co experience:
- Complete your profile: Unlock all features by adding your information and preferences
- Explore the dashboard: Discover powerful tools and insights tailored to your needs
- Check out resources: Access tutorials, guides, and best practices from industry experts
- Connect with community: Join a network of talented artists and professionals

💡 Pro Tip: Take a few minutes to complete your profile setup. This will personalize your experience and help you discover features most relevant to your goals.

Go to Dashboard: {{dashboard_url}}

Need help getting started? Our support team is here for you. Simply reply to this email or visit our help center for assistance. We're committed to making your experience with MSC & Co exceptional.

Best regards,
The MSC & Co Team'''
        }
    
    # Annual Renewal - the example we showed the user
    if 'annual renewal' in name_lower:
        return {
            'subject': 'Your Annual Subscription Renewal – Action Required',
            'html': create_enhanced_html(
                title='Your Annual Subscription Renewal – Action Required',
                greeting='Hi {{user_name}},',
                introduction='Your annual MSC & Co subscription is set to automatically renew on <strong>{{renewal_date}}</strong> for <strong>{{amount}}</strong>. We wanted to give you advance notice so you can prepare accordingly.',
                main_content='''<div style="background: #fff7ed; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f59e0b;">
      <h2 style="color: #92400e; margin-top: 0; font-size: 20px; font-weight: 600;">📅 What This Means for You</h2>
      <p style="color: #78350f; margin-bottom: 16px; line-height: 1.7;">This renewal ensures you maintain uninterrupted access to all the features and benefits of your current plan, including:</p>
      <ul style="margin: 0; padding-left: 25px; color: #78350f; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Full platform access and all premium features</li>
        <li style="margin-bottom: 8px;">Priority customer support and assistance</li>
        <li style="margin-bottom: 8px;">Regular updates and new feature releases</li>
        <li style="margin-bottom: 8px;">All benefits included in your current subscription tier</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #10b981;">
      <h2 style="color: #065f46; margin-top: 0; font-size: 20px; font-weight: 600;">✅ Action Required</h2>
      <p style="color: #047857; margin-bottom: 0; line-height: 1.7;">To ensure there are no interruptions to your service, please take a moment to verify that your payment method is up to date. You can review and update your billing information at any time before the renewal date.</p>
    </div>''',
                cta_text='Review & Update Billing Information',
                cta_url='{{renew_url}}',
                additional_info='<p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>Need assistance?</strong> If you have any questions about your subscription, billing details, or would like to explore different plan options, our support team is available to help. Simply reply to this email or visit our support center.</p>',
                footer_note="We truly appreciate your continued partnership with MSC & Co. Your trust in our platform means everything to us, and we're committed to delivering exceptional value as we move forward together.",
                gradient_start='#667eea',
                gradient_end='#764ba2'
            ),
            'text': f'''Your Annual Subscription Renewal – Action Required

Hi {{user_name}},

Your annual MSC & Co subscription is set to automatically renew on {{renewal_date}} for {{amount}}. We wanted to give you advance notice so you can prepare accordingly.

What This Means for You

This renewal ensures you maintain uninterrupted access to all the features and benefits of your current plan, including:
- Full platform access and all premium features
- Priority customer support and assistance
- Regular updates and new feature releases
- All benefits included in your current subscription tier

Action Required

To ensure there are no interruptions to your service, please take a moment to verify that your payment method is up to date. You can review and update your billing information at any time before the renewal date.

Review & Update Billing Information: {{renew_url}}

Need assistance? If you have any questions about your subscription, billing details, or would like to explore different plan options, our support team is available to help. Simply reply to this email or visit our support center.

We truly appreciate your continued partnership with MSC & Co. Your trust in our platform means everything to us, and we're committed to delivering exceptional value as we move forward together.

Best regards,
The MSC & Co Team'''
        }
    
    # Generic enhanced template for others - we'll enhance all, but use a professional default
    return None  # Will be handled by generic enhancement

if __name__ == '__main__':
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    sql_file = project_root / 'database' / 'migrations' / 'current' / 'create-marketing-email-templates.sql'
    
    print(f'Reading {sql_file}...')
    with open(sql_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Count templates
    template_count = len(re.findall(r"INSERT INTO marketing_email_templates", content))
    print(f'Found {template_count} templates')
    
    print('Note: This script provides helper functions. Full enhancement will be done via SQL UPDATE statements.')

