# Supabase SMS Configuration Guide

This guide explains how to configure SMS authentication in Supabase for the multi-step registration process.

## Prerequisites

- Supabase project with authentication enabled
- Admin access to Supabase dashboard
- SMS provider account (Twilio recommended)

## Step 1: Configure SMS Provider in Supabase

### Option A: Using Twilio (Recommended)

1. **Get Twilio Credentials:**
   - Sign up at [Twilio Console](https://console.twilio.com/)
   - Get your Account SID and Auth Token
   - Purchase a phone number for sending SMS

2. **Configure in Supabase:**
   - Go to your Supabase project dashboard
   - Navigate to `Authentication` → `Settings`
   - Scroll to `SMS Auth Settings`
   - Enable SMS authentication
   - Select "Twilio" as provider
   - Enter your Twilio credentials:
     ```
     Account SID: Your Twilio Account SID
     Auth Token: Your Twilio Auth Token
     Phone Number: Your Twilio phone number (with country code)
     ```

### Option B: Using Custom SMS Provider

1. **Configure Custom Provider:**
   - In Supabase dashboard, select "Custom" as SMS provider
   - Set up webhook URL for your SMS service
   - Configure authentication headers

## Step 2: Configure SMS Templates

1. **Default SMS Template:**
   ```
   Your verification code is: {{ .Code }}
   ```

2. **Custom Template (Optional):**
   ```
   Welcome to MSC & Co! Your verification code is: {{ .Code }}
   Valid for 10 minutes.
   ```

## Step 3: Set Rate Limits

Configure rate limiting to prevent abuse:

- **Per IP:** 5 requests per hour
- **Per Phone:** 3 requests per hour
- **Global:** 1000 requests per hour

## Step 4: Test SMS Configuration

1. **Test in Supabase Dashboard:**
   - Go to `Authentication` → `Users`
   - Click "Invite user"
   - Select "SMS" method
   - Enter a test phone number
   - Verify SMS is received

2. **Test via API:**
   ```javascript
   const { data, error } = await supabase.auth.signInWithOtp({
     phone: '+1234567890'
   });
   ```

## Step 5: Environment Variables

Add these to your environment configuration:

```env
# Supabase SMS Configuration
NEXT_PUBLIC_SUPABASE_SMS_ENABLED=true
SUPABASE_SMS_PROVIDER=twilio
SUPABASE_SMS_RATE_LIMIT=5
```

## Step 6: Database Schema Update

Run the registration schema update:

```sql
-- Execute the registration-schema-update.sql file
\i database/registration-schema-update.sql
```

## Step 7: Security Considerations

### Phone Number Validation
- Always validate phone number format
- Include country code validation
- Implement rate limiting per phone number

### Code Security
- SMS codes expire after 10 minutes
- Codes are single-use only
- Maximum 3 attempts per code

### Privacy
- Store phone numbers securely
- Comply with local privacy laws
- Allow users to delete their phone numbers

## Troubleshooting

### Common Issues

1. **SMS Not Sending:**
   - Check Twilio credentials
   - Verify phone number format
   - Check Twilio account balance
   - Review Supabase logs

2. **Invalid Phone Number:**
   - Ensure country code is included
   - Use E.164 format (+1234567890)
   - Validate against international standards

3. **Rate Limiting:**
   - Check rate limit settings
   - Implement exponential backoff
   - Show clear error messages to users

### Error Codes

- `SMS_NOT_CONFIGURED`: SMS provider not set up
- `INVALID_PHONE`: Phone number format invalid
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `SMS_SEND_FAILED`: Provider error

## Testing Checklist

- [ ] SMS codes are received within 30 seconds
- [ ] Codes expire after 10 minutes
- [ ] Rate limiting works correctly
- [ ] Invalid phone numbers are rejected
- [ ] Error messages are user-friendly
- [ ] International numbers work
- [ ] Registration flow completes successfully

## Production Deployment

### Before Going Live:

1. **Test with Real Phone Numbers:**
   - Test with various country codes
   - Verify delivery times
   - Check message formatting

2. **Monitor SMS Costs:**
   - Set up billing alerts
   - Monitor usage patterns
   - Optimize for cost efficiency

3. **Backup Authentication:**
   - Ensure email verification still works
   - Implement backup code system
   - Provide alternative verification methods

### Monitoring:

- SMS delivery rates
- Verification success rates
- Error rates by country
- Cost per verification

## Support

For issues with SMS configuration:

1. Check Supabase documentation
2. Review Twilio logs
3. Contact Supabase support
4. Check community forums

## Security Best Practices

1. **Never log SMS codes**
2. **Implement proper rate limiting**
3. **Use HTTPS for all API calls**
4. **Validate all phone numbers**
5. **Monitor for suspicious activity**
6. **Implement account lockout after failed attempts**

---

## Implementation Status

✅ **Completed:**
- Multi-step registration component
- SMS API endpoints
- Database schema updates
- Email verification integration
- Backup codes generation
- Profile completion flow

⏳ **Pending:**
- Supabase SMS provider configuration
- Production testing
- Rate limiting fine-tuning

---

*Last updated: [Current Date]*
*Version: 1.0*
