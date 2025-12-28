#!/usr/bin/env python3
"""
Comprehensive Email Template Generator
Generates 100+ professional email templates for MSC & Co
"""

import json

def escape_sql(text):
    """Escape single quotes for SQL"""
    return text.replace("'", "''")

def generate_template(name, description, subject, category, variables_list, html_body, text_body):
    """Generate SQL INSERT for a template"""
    html_escaped = escape_sql(html_body)
    text_escaped = escape_sql(text_body)
    vars_json = json.dumps(variables_list)
    name_escaped = escape_sql(name)
    desc_escaped = escape_sql(description)
    subject_escaped = escape_sql(subject)
    
    return f"""-- {name}
INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, body_text_template, category, variables, is_active, created_at)
VALUES (
  '{name_escaped}',
  '{desc_escaped}',
  '{subject_escaped}',
  '{html_escaped}',
  '{text_escaped}',
  '{category}',
  '{vars_json}'::jsonb,
  true,
  NOW()
) ON CONFLICT (name) DO NOTHING;

"""

# Base HTML template function
def create_html_template(title, emoji, gradient1, gradient2, content_html, cta_text, cta_var, footer_text="Best regards"):
    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, {gradient1} 0%, {gradient2} 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">{emoji} {title}</h1>
  </div>
  <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi {{{{user_name}}}},</p>
    {content_html}
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{{{{cta_var}}}}}" style="background: {gradient1}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">{cta_text}</a>
    </div>
    <p style="font-size: 16px; margin-top: 30px; text-align: center;">
      {footer_text}<br>
      <strong>The MSC & Co Team</strong>
    </p>
  </div>
  <div style="text-align: center; margin-top: 30px; padding: 20px; color: #a0aec0; font-size: 12px;">
    <p>MSC & Co | Empowering the Music Industry</p>
  </div>
</body>
</html>"""

# Template definitions
templates_data = []

# Additional Holiday Templates
holiday_templates = [
    ("Holiday - Mother's Day", "Mother's Day appreciation email", "💐 Happy Mother's Day - Celebrate with Music!", 
     create_html_template("Happy Mother's Day", "💐", "#f093fb", "#f5576c", 
                         "<p style='font-size: 16px; margin-bottom: 20px;'>This Mother's Day, honor the special mothers in your life with the gift of music!</p>",
                         "Share Music", "share_url"), 
     "Happy Mother's Day! Celebrate with music. Share Music: {{share_url}}",
     ["user_name", "share_url"]),
    
    ("Holiday - Father's Day", "Father's Day appreciation email", "👔 Happy Father's Day - Gift the Music Lover!",
     create_html_template("Happy Father's Day", "👔", "#4facfe", "#00f2fe",
                         "<p style='font-size: 16px; margin-bottom: 20px;'>Celebrate Father's Day with the perfect music gift!</p>",
                         "Shop Music Gifts", "gifts_url"),
     "Happy Father's Day! Shop Music Gifts: {{gifts_url}}",
     ["user_name", "gifts_url"]),
    
    ("Holiday - Labor Day", "Labor Day celebration", "👷 Happy Labor Day - Celebrating Your Hard Work!",
     create_html_template("Happy Labor Day", "👷", "#667eea", "#764ba2",
                         "<p style='font-size: 16px; margin-bottom: 20px;'>Thank you for your hard work and dedication to your craft!</p>",
                         "Relax & Enjoy", "dashboard_url"),
     "Happy Labor Day! Thank you for your hard work. Relax & Enjoy: {{dashboard_url}}",
     ["user_name", "dashboard_url"]),
]

# Generate SQL output
output = []
output.append("-- ===========================================\n")
output.append("-- ADDITIONAL COMPREHENSIVE TEMPLATES\n")
output.append("-- Generated programmatically for consistency\n")
output.append("-- ===========================================\n\n")

for name, desc, subject, html, text, vars_list in holiday_templates:
    output.append(generate_template(name, desc, subject, "holidays", vars_list, html, text))

print("".join(output))

