import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * Public API route to serve email templates
 * Used by Supabase Edge Function for email sending
 */
export async function GET(request, { params }) {
  try {
    const { template } = params;

    // Security: Only allow specific template names (no path traversal)
    const allowedTemplates = [
      'welcome',
      'password-reset',
      'password-changed',
      'registration-confirmation',
      'release-approved',
      'payment-received',
      'withdrawal-confirmation',
      'invoice',
      'inactive-account',
      'suspicious-login',
      'reauthentication',
      'change-email',
      'magic-link',
      'invite-user'
    ];

    if (!allowedTemplates.includes(template)) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Read template file
    const templatePath = path.join(process.cwd(), 'public', 'email-templates', `${template}.html`);

    if (!fs.existsSync(templatePath)) {
      return NextResponse.json(
        { error: 'Template file not found' },
        { status: 404 }
      );
    }

    const templateContent = fs.readFileSync(templatePath, 'utf-8');

    // Return HTML content
    return new NextResponse(templateContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error serving email template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
