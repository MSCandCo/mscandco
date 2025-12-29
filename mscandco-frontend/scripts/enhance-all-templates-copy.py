#!/usr/bin/env python3
"""
Enhance ALL 129 email templates with professional, detailed copy
Following the style of the Annual Renewal template example
"""

import re
from pathlib import Path

def escape_sql(text):
    """Escape single quotes for SQL"""
    return text.replace("'", "''")

def create_professional_html(template_name, category, description, greeting, introduction, 
                            main_sections, cta_text, cta_url, footer_note, gradient_colors):
    """Create professional HTML email template"""
    gradient_start, gradient_end = gradient_colors
    
    # Build main content HTML from sections
    main_content_html = ""
    for section in main_sections:
        section_type = section.get('type', 'info')
        title = section.get('title', '')
        content = section.get('content', '')
        items = section.get('items', [])
        
        if section_type == 'highlight':
            bg_color = section.get('bg_color', '#fff7ed')
            border_color = section.get('border_color', '#f59e0b')
            text_color = section.get('text_color', '#78350f')
            title_color = section.get('title_color', '#92400e')
        elif section_type == 'success':
            bg_color = '#f0fdf4'
            border_color = '#10b981'
            text_color = '#047857'
            title_color = '#065f46'
        else:
            bg_color = '#f0f9ff'
            border_color = '#0ea5e9'
            text_color = '#075985'
            title_color = '#0c4a6e'
        
        section_html = f'''    <div style="background: {bg_color}; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid {border_color};">
      <h2 style="color: {title_color}; margin-top: 0; font-size: 20px; font-weight: 600;">{title}</h2>'''
        
        if content:
            section_html += f'\n      <p style="color: {text_color}; margin-bottom: 16px; line-height: 1.7;">{content}</p>'
        
        if items:
            section_html += f'\n      <ul style="margin: 0; padding-left: 25px; color: {text_color}; line-height: 1.8;">'
            for item in items:
                section_html += f'\n        <li style="margin-bottom: 8px;">{item}</li>'
            section_html += '\n      </ul>'
        
        section_html += '\n    </div>\n    '
        main_content_html += section_html
    
    html = f'''<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
  <div style="background: linear-gradient(135deg, {gradient_start} 0%, {gradient_end} 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <img src="{{{{base_url}}}}/logos/MSCandCoLogoV2.png" alt="MSC & Co" style="max-width: 180px; height: auto; margin-bottom: 20px;" />
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">{template_name}</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px; color: #2d3748;">{greeting}</p>
    
    {f'<p style="font-size: 16px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">{introduction}</p>' if introduction else ''}
    
    {main_content_html}
    
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

def create_professional_text(template_name, greeting, introduction, main_sections, cta_text, cta_url, footer_note):
    """Create professional plain text email template"""
    text = f"{template_name}\n\n{greeting}\n\n"
    
    if introduction:
        text += f"{introduction}\n\n"
    
    for section in main_sections:
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

# Template enhancement mappings - comprehensive professional copy for each template type
TEMPLATE_ENHANCEMENTS = {
    # This will be used to enhance templates based on their names/categories
    # For now, we'll create a generic enhancement function that applies professional structure
}

print("Template enhancement script loaded.")
print("This script provides functions to create professional email templates.")
print("Templates will be enhanced directly in the SQL file using UPDATE statements.")

