#!/usr/bin/env python3
"""
Comprehensive script to enhance ALL 129 email templates with professional, detailed copy
Following the Annual Renewal template style
"""

import re
import sys
from pathlib import Path

def escape_sql(text):
    """Escape single quotes for SQL"""
    return text.replace("'", "''")

def create_professional_section(title, content, items=None, section_type='info'):
    """Create a professional content section"""
    if section_type == 'highlight':
        bg_color = '#fff7ed'
        border_color = '#f59e0b'
        text_color = '#78350f'
        title_color = '#92400e'
    elif section_type == 'success':
        bg_color = '#f0fdf4'
        border_color = '#10b981'
        text_color = '#047857'
        title_color = '#065f46'
    elif section_type == 'info':
        bg_color = '#f0f9ff'
        border_color = '#0ea5e9'
        text_color = '#075985'
        title_color = '#0c4a6e'
    else:
        bg_color = '#f7fafc'
        border_color = '#667eea'
        text_color = '#4a5568'
        title_color = '#2d3748'
    
    html = f'''    <div style="background: {bg_color}; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid {border_color};">
      <h2 style="color: {title_color}; margin-top: 0; font-size: 20px; font-weight: 600;">{title}</h2>'''
    
    if content:
        html += f'\n      <p style="color: {text_color}; margin-bottom: 16px; line-height: 1.7;">{content}</p>'
    
    if items:
        html += f'\n      <ul style="margin: 0; padding-left: 25px; color: {text_color}; line-height: 1.8;">'
        for item in items:
            html += f'\n        <li style="margin-bottom: 8px;">{item}</li>'
        html += '\n      </ul>'
    
    html += '\n    </div>'
    return html

def get_enhanced_content_for_template(template_name, category, description, original_subject):
    """Get enhanced professional content for a specific template"""
    name_lower = template_name.lower()
    
    # WELCOME & ONBOARDING templates
    if 'welcome' in name_lower and 'artist' in name_lower:
        return {
            'subject': 'Welcome, {{artist_name}}! Let\'s Launch Your Music Career 🎤',
            'greeting': 'Hi {{user_name}},',
            'introduction': 'Welcome to MSC & Co! Your musical journey starts here, and we couldn\'t be more excited to be part of it. We\'re here to help you distribute your music, monetize your art, and grow your audience with professional-grade tools designed specifically for artists.',
            'sections': [
                {
                    'title': '🚀 Your Comprehensive Artist Toolkit',
                    'content': 'As a member of MSC & Co, you now have access to powerful tools designed to elevate your music career:',
                    'items': [
                        'Global Music Distribution: Release your tracks to major streaming platforms worldwide, reaching millions of potential listeners',
                        'Advanced Analytics Dashboard: Track streams, earnings, and audience insights with real-time data and detailed reports',
                        'Automated Royalty Management: Get paid for your music automatically with transparent, timely payments',
                        'Marketing & Promotion Tools: Promote your releases effectively with integrated social media and playlist pitching',
                        'AI-Powered Insights: Leverage artificial intelligence to understand trends and optimize your strategy'
                    ],
                    'type': 'highlight'
                },
                {
                    'title': '💡 Pro Tip',
                    'content': 'Complete your artist profile and upload your first release to get started. The sooner you begin, the sooner you\'ll start building your audience and earning from your music.',
                    'type': 'success'
                }
            ],
            'cta_text': 'Access Artist Dashboard',
            'cta_url': '{{artist_dashboard_url}}',
            'footer_note': 'Ready to share your music with the world? We\'re here to support you every step of the way. If you have any questions, our artist support team is just an email away.',
            'gradient': ['#f093fb', '#f5576c']
        }
    
    # BILLING templates
    if 'grace period' in name_lower:
        return {
            'subject': '⏰ Grace Period Ending – Action Required',
            'greeting': 'Hi {{user_name}},',
            'introduction': 'Your MSC & Co subscription is currently in a grace period with {{days_left}} days remaining. We wanted to reach out to ensure you don\'t experience any interruption to your service.',
            'sections': [
                {
                    'title': 'What This Means',
                    'content': 'During the grace period, you still have access to your account, but your subscription benefits may be limited. To restore full access and continue enjoying all features:',
                    'items': [
                        'Renew your subscription before the grace period ends',
                        'Ensure your payment method is up to date',
                        'Contact support if you need assistance with payment options'
                    ],
                    'type': 'highlight'
                },
                {
                    'title': 'Action Required',
                    'content': 'Renew now to restore full access to all platform features and avoid any service interruption.',
                    'type': 'success'
                }
            ],
            'cta_text': 'Renew Now',
            'cta_url': '{{renew_url}}',
            'footer_note': 'If you have any questions about your subscription or need help with the renewal process, our support team is available to assist you.',
            'gradient': ['#f5576c', '#f093fb']
        }
    
    if 'subscription cancelled' in name_lower or 'cancelled' in name_lower:
        return {
            'subject': '📋 Subscription Cancelled – We\'ll Miss You',
            'greeting': 'Hi {{user_name}},',
            'introduction': 'We\'re sorry to see you go! Your subscription has been cancelled and will remain active until {{cancellation_date}}. We wanted to let you know what happens next and how you can return anytime.',
            'sections': [
                {
                    'title': 'What Happens Next',
                    'content': 'Here\'s what to expect:',
                    'items': [
                        'Your subscription will remain active until {{cancellation_date}}',
                        'You\'ll continue to have access to all features until that date',
                        'After {{cancellation_date}}, your account will be moved to a free tier',
                        'You can reactivate your subscription anytime before or after the cancellation date'
                    ],
                    'type': 'info'
                },
                {
                    'title': 'We\'d Love to Have You Back',
                    'content': 'If you change your mind, you can reactivate your subscription at any time with just one click. All your data, settings, and preferences will be preserved.',
                    'type': 'success'
                }
            ],
            'cta_text': 'Reactivate Subscription',
            'cta_url': '{{reactivate_url}}',
            'footer_note': 'We\'d appreciate any feedback you can share about your experience. Your input helps us improve our platform for everyone.',
            'gradient': ['#f5af19', '#f12711']
        }
    
    # Default professional enhancement for templates without specific rules
    return None

def enhance_template_html(template_name, category, description, subject, greeting, introduction, 
                          sections, cta_text, cta_url, footer_note, gradient_colors):
    """Create enhanced HTML template"""
    gradient_start, gradient_end = gradient_colors
    
    # Build sections HTML
    sections_html = ""
    for section in sections:
        sections_html += create_professional_section(
            section.get('title', ''),
            section.get('content', ''),
            section.get('items', []),
            section.get('type', 'info')
        ) + "\n    "
    
    html = f'''<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, {gradient_start} 0%, {gradient_end} 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <img src="{{{{base_url}}}}/logos/MSCandCoLogoV2.png" alt="MSC & Co" style="max-width: 180px; height: auto; margin-bottom: 20px;" />
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">{subject}</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px; color: #2d3748;">{greeting}</p>
    
    {f'<p style="font-size: 16px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">{introduction}</p>' if introduction else ''}
    
    {sections_html}
    
    {f'''    <div style="text-align: center; margin: 40px 0;">
      <a href="{cta_url}" style="background: {gradient_start}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">{cta_text}</a>
    </div>
    ''' if cta_text and cta_url else ''}
    
    {f'''    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid {gradient_start};">
      <p style="margin: 0; color: #4a5568; line-height: 1.7;"><strong>Need assistance?</strong> {footer_note}</p>
    </div>
    ''' if footer_note else ''}
    
    <p style="font-size: 16px; margin-top: 40px; color: #2d3748;">
      Best regards,<br>
      <strong style="color: #1a202c;">The MSC & Co Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 30px; padding: 20px; color: #a0aec0; font-size: 12px; background: #ffffff; border-radius: 8px;">
    <p style="margin: 0 0 10px 0; font-weight: 500; color: #718096;">MSC & Co | Empowering the Music Industry</p>
    <p style="margin: 0;">
      <a href="{{{{unsubscribe_url}}}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Unsubscribe</a> | 
      <a href="{{{{preferences_url}}}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Email Preferences</a> | 
      <a href="{{{{support_url}}}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Support</a>
    </p>
  </div>
</body>
</html>'''
    
    return html

def enhance_template_text(subject, greeting, introduction, sections, cta_text, cta_url, footer_note):
    """Create enhanced plain text template"""
    text = f"{subject}\n\n{greeting}\n\n"
    
    if introduction:
        text += f"{introduction}\n\n"
    
    for section in sections:
        title = section.get('title', '')
        content = section.get('content', '')
        items = section.get('items', [])
        
        if title:
            text += f"{title}\n\n"
        
        if content:
            text += f"{content}\n\n"
        
        if items:
            for item in items:
                text += f"- {item}\n"
            text += "\n"
    
    if cta_text and cta_url:
        text += f"{cta_text}: {cta_url}\n\n"
    
    if footer_note:
        text += f"{footer_note}\n\n"
    
    text += "Best regards,\nThe MSC & Co Team"
    
    return text

if __name__ == '__main__':
    print("Template enhancement functions loaded.")
    print("This script provides functions to enhance templates with professional copy.")
    print("Run the main enhancement script to process all templates.")

