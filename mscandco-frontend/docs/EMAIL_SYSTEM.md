# Email System Documentation

## Overview

MSC & Co uses a modern, production-ready email system built on:
- **Supabase Auth** - Native authentication emails
- **Supabase Edge Functions** - Custom email delivery
- **Resend API** - Enterprise email delivery service
- **Supabase Storage** - Template storage and hosting

## Architecture

```
Email Trigger
    ↓
Supabase Edge Function (send-email)
    ↓
Resend API
    ↓
Email Delivered to User
```

## Email Templates

### Available Templates

1. **welcome.html** - New user registration
2. **email-verification.html** - Email address confirmation
3. **password-reset.html** - Password reset request
4. **release-published.html** - Release successfully published
5. **payout-processed.html** - Payment processed notification
6. **contract-signature.html** - Contract signing request
7. **approval-required.html** - Admin approval needed
8. **profile-change-request.html** - Profile change submitted
9. **account-suspended.html** - Account suspension notice
10. **newsletter.html** - Marketing newsletter template

### Template Structure

All templates are responsive HTML with inline CSS for maximum email client compatibility.

**Template Variables:**
```javascript
{
  user_name: "John Doe",
  artist_name: "DJ John",
  brand_name: "MSC & Co MSC",
  brand_color: "#1e40af",
  base_url: "https://mscandco.com",
  // Template-specific variables
}
```

### Creating New Templates

1. **Create HTML file** in `email-templates/`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
  <style>
    /* Inline CSS for compatibility */
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .button {
      background-color: {{brand_color}};
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      display: inline-block;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Hello {{user_name}}!</h1>
    <p>Your custom email content here...</p>
    <a href="{{action_url}}" class="button">Take Action</a>
  </div>
</body>
</html>
```

2. **Upload to Supabase Storage**:

```bash
npx supabase storage cp email-templates/new-template.html \
  supabase://email-templates/new-template.html
```

3. **Use in code**:

```javascript
await sendEmail({
  to: user.email,
  subject: 'Your Subject',
  template: 'new-template',
  variables: {
    user_name: user.name,
    action_url: 'https://mscandco.com/action',
  },
});
```

## Supabase Edge Function

### Function Code

Located at: `supabase/functions/send-email/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

serve(async (req) => {
  try {
    const { to, subject, template, variables } = await req.json();

    // Fetch template from storage
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: templateData } = await supabase.storage
      .from('email-templates')
      .download(`${template}.html`);

    let html = await templateData.text();

    // Replace variables
    for (const [key, value] of Object.entries(variables)) {
      html = html.replaceAll(`{{${key}}}`, value);
    }

    // Send via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'MSC & Co <noreply@mscandco.com>',
        to: [to],
        subject,
        html,
      }),
    });

    const result = await response.json();

    return new Response(
      JSON.stringify(result),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
});
```

### Deploying Function

```bash
# Deploy to Supabase
npx supabase functions deploy send-email --project-ref your-project-ref

# Set environment variables
npx supabase secrets set RESEND_API_KEY=your-resend-api-key
```

### Testing Function

```bash
# Test locally
npx supabase functions serve send-email

# Invoke function
curl -X POST http://localhost:54321/functions/v1/send-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "template": "welcome",
    "variables": {
      "user_name": "John Doe",
      "brand_color": "#1e40af"
    }
  }'
```

## Using the Email System

### From API Routes

```javascript
// app/api/auth/register/route.js
import { sendEmail } from '@/lib/email';

export async function POST(request) {
  const { email, name } = await request.json();

  // Create user...

  // Send welcome email
  await sendEmail({
    to: email,
    subject: 'Welcome to MSC & Co',
    template: 'welcome',
    variables: {
      user_name: name,
      brand_name: 'MSC & Co',
      brand_color: '#1e40af',
      login_url: `${process.env.NEXT_PUBLIC_BASE_URL}/login`,
    },
  });

  return NextResponse.json({ success: true });
}
```

### From Server Components

```javascript
// app/admin/actions.js
'use server';

import { sendEmail } from '@/lib/email';

export async function approveRelease(releaseId) {
  // Approve release logic...

  const artist = await getArtist(release.artist_id);

  await sendEmail({
    to: artist.email,
    subject: 'Your release has been approved!',
    template: 'release-published',
    variables: {
      user_name: artist.name,
      release_title: release.title,
      release_url: `${process.env.NEXT_PUBLIC_BASE_URL}/artist/releases/${releaseId}`,
    },
  });
}
```

### With Inngest (Background Jobs)

```javascript
// lib/inngest/functions/send-email.js
import { inngest } from '../client';

export const sendEmail = inngest.createFunction(
  { id: 'send-email' },
  { event: 'email/send' },
  async ({ event, step }) => {
    const { to, subject, template, variables } = event.data;

    const result = await step.run('send-email', async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            to,
            subject,
            template,
            variables,
          }),
        }
      );

      return await response.json();
    });

    return result;
  }
);
```

Trigger from code:

```javascript
await inngest.send({
  name: 'email/send',
  data: {
    to: 'user@example.com',
    subject: 'Your subject',
    template: 'welcome',
    variables: { /* ... */ },
  },
});
```

## Supabase Auth Emails

### Configuration

Supabase Auth sends these emails automatically:
- Email confirmation
- Password reset
- Magic link
- Email change confirmation

### Customizing Auth Templates

1. Go to **Supabase Dashboard > Authentication > Email Templates**

2. **Confirm Signup Email**:
```html
<h2>Confirm your signup</h2>
<p>Follow this link to confirm your account:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>
```

3. **Reset Password Email**:
```html
<h2>Reset Password</h2>
<p>Follow this link to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset password</a></p>
```

4. Use custom templates from `email-templates/auth/`:
   - Copy HTML content
   - Replace Supabase variables with `{{ .VariableName }}`
   - Paste into Supabase dashboard

### Auth Email Variables

Available in Supabase Auth templates:
- `{{ .Email }}` - User's email
- `{{ .Token }}` - Auth token
- `{{ .TokenHash }}` - Hashed token
- `{{ .SiteURL }}` - Your site URL
- `{{ .ConfirmationURL }}` - Full confirmation link
- `{{ .Data.custom_field }}` - Custom user metadata

## Resend Configuration

### Domain Setup

1. **Add Domain** in [Resend Dashboard](https://resend.com/domains)

2. **Add DNS Records**:
```
Type: TXT
Name: @
Value: resend-verification=xxxxx

Type: MX
Name: @
Value: feedback-smtp.us-east-1.amazonses.com
Priority: 10

Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@mscandco.com

Type: TXT
Name: resend._domainkey
Value: [DKIM key from Resend]
```

3. **Verify Domain** - Usually takes 24-48 hours

### API Keys

Create separate keys for different environments:
- **Development**: `re_dev_xxx`
- **Staging**: `re_stag_xxx`
- **Production**: `re_prod_xxx`

### Rate Limits

Resend rate limits by plan:
- **Free**: 100 emails/day
- **Pro**: 50,000 emails/month
- **Enterprise**: Custom limits

Monitor usage in Resend Dashboard.

## Email Deliverability

### Best Practices

1. **SPF, DKIM, DMARC**
   - All configured via DNS records
   - Verify with [MXToolbox](https://mxtoolbox.com)

2. **Sender Reputation**
   - Use dedicated sending domain
   - Monitor bounce/complaint rates
   - Warm up new domains gradually

3. **Content Best Practices**
   - Clear subject lines
   - Personalized content
   - Unsubscribe link (required)
   - Plain text alternative

4. **List Hygiene**
   - Remove bounced emails
   - Honor unsubscribes immediately
   - Validate email addresses

### Testing Deliverability

```bash
# Send test email
curl -X POST https://your-project.supabase.co/functions/v1/send-email \
  -H "Authorization: Bearer your-service-role-key" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "youremail@gmail.com",
    "subject": "Test Email",
    "template": "welcome",
    "variables": {}
  }'

# Check spam score
# Send to: check@mail-tester.com
# Visit: https://www.mail-tester.com
```

### Monitoring

Track email metrics:
- **Delivery Rate**: Should be >95%
- **Open Rate**: Industry avg 20-30%
- **Click Rate**: Industry avg 2-5%
- **Bounce Rate**: Should be <5%
- **Complaint Rate**: Should be <0.1%

Access via Resend Dashboard > Analytics

## Unsubscribe Management

### Implementation

```javascript
// app/api/email/unsubscribe/route.js
export async function POST(request) {
  const { email, token } = await request.json();

  // Verify token
  const valid = await verifyUnsubscribeToken(token);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }

  // Update user preferences
  await supabase
    .from('user_profiles')
    .update({ email_notifications: false })
    .eq('email', email);

  return NextResponse.json({ success: true });
}
```

### Adding to Templates

```html
<footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
  <p style="font-size: 12px; color: #666;">
    <a href="{{unsubscribe_url}}">Unsubscribe</a> from these emails
  </p>
</footer>
```

## Troubleshooting

### Emails Not Sending

1. **Check Edge Function logs**:
```bash
npx supabase functions logs send-email --project-ref your-project-ref
```

2. **Verify Resend API key**:
```bash
curl https://api.resend.com/emails \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":"test@resend.dev","to":"delivered@resend.dev","subject":"Test","html":"Test"}'
```

3. **Check DNS records**:
```bash
dig TXT mscandco.com
dig MX mscandco.com
```

### Emails Going to Spam

1. **Check spam score**: https://www.mail-tester.com
2. **Verify authentication**: SPF, DKIM, DMARC
3. **Review content**: Avoid spam trigger words
4. **Warm up domain**: Start with small volumes

### Template Not Loading

1. **Check storage bucket**:
```bash
npx supabase storage ls email-templates
```

2. **Verify bucket policy**:
```sql
SELECT * FROM storage.objects
WHERE bucket_id = 'email-templates';
```

3. **Test template URL**:
```
https://your-project.supabase.co/storage/v1/object/public/email-templates/welcome.html
```

## Security

### Token-Based Unsubscribe

Generate secure tokens:

```javascript
import { createHash } from 'crypto';

export function generateUnsubscribeToken(email, secret) {
  return createHash('sha256')
    .update(`${email}:${secret}`)
    .digest('hex');
}
```

### Rate Limiting

Prevent email abuse:

```javascript
import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '@/lib/redis';

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 emails per hour
});

export async function sendEmail({ to, ...params }) {
  const { success } = await ratelimit.limit(to);

  if (!success) {
    throw new Error('Rate limit exceeded');
  }

  // Send email...
}
```

## Email Types

### Transactional Emails
- Welcome email
- Password reset
- Email verification
- Order confirmations
- Account notifications

**Characteristics**:
- Sent immediately
- One-to-one
- High priority
- No unsubscribe required (system emails)

### Marketing Emails
- Newsletters
- Product announcements
- Promotional offers
- Feature updates

**Characteristics**:
- Scheduled sending
- One-to-many
- Requires unsubscribe link
- Subject to consent laws (GDPR, CAN-SPAM)

## Compliance

### GDPR
- Obtain consent for marketing emails
- Provide easy unsubscribe
- Delete data upon request
- Document email preferences

### CAN-SPAM Act
- Include physical address
- Clear subject lines
- Honor opt-outs within 10 days
- Don't use deceptive headers

## Support

For email system questions:
- **Resend Support**: https://resend.com/support
- **Supabase Support**: https://supabase.com/support
- **Internal**: tech@mscandco.com
