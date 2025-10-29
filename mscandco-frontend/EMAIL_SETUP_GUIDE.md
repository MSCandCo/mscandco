# 📧 Custom Email Template Setup Guide

## 🎨 Beautiful, Branded Registration Emails

This guide shows you how to replace the default Supabase email with a professional, branded email for MSC & Co.

---

## 📋 **What You'll Get:**

### **Before (Default Supabase Email):**
- ❌ Plain white background
- ❌ Generic "Confirm your signup" text
- ❌ Basic blue link
- ❌ No branding
- ❌ Boring!

### **After (Custom MSC & Co Email):**
- ✅ Gradient header with MSC & Co logo
- ✅ Professional greeting: "Welcome to MSC & Co! 🎵"
- ✅ Styled CTA button with hover effect
- ✅ "What's Next?" info box with feature list
- ✅ Security note with expiration warning
- ✅ Branded footer with links
- ✅ Mobile responsive
- ✅ Professional & modern!

---

## 🚀 **Setup Instructions:**

### **Step 1: Go to Supabase Email Templates**

1. Open **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your **MSC & Co** project
3. In the left sidebar, click **"Authentication"**
4. Click **"Email Templates"** tab at the top
5. Select **"Confirm signup"** template

---

### **Step 2: Replace Template Content**

1. **Delete** the existing template content
2. **Copy** the entire contents of: `email-templates/registration-confirmation.html`
3. **Paste** it into the template editor
4. Click **"Save"**

---

### **Step 3: Test the Email**

1. Go to `staging.mscandco.com/register`
2. Register with a **new email address**
3. Check your inbox
4. You should see the **beautiful branded email**! 🎉

---

## 🎨 **Email Features:**

### **Header**
- Gradient dark grey background (`#1f2937` to `#374151`)
- Large MSC & Co logo in white
- Professional and bold

### **Content**
- Warm greeting: "Welcome to MSC & Co! 🎵"
- Clear instructions
- Large, styled CTA button
- "What's Next?" info box listing features:
  - Upload and distribute music
  - Real-time analytics
  - Manage earnings
  - Apollo AI integration

### **Security Note**
- Yellow warning box
- 24-hour expiration notice
- Security best practices

### **Footer**
- Copyright notice
- Company tagline
- Links: About, Support, Privacy Policy
- Company location

### **Mobile Responsive**
- Adapts to small screens
- Button becomes full-width
- Text sizes adjust
- Maintains brand consistency

---

## 🔧 **Customization Options:**

### **Change Colors:**
Edit these CSS variables in the `<style>` section:

```css
/* Primary Brand Color */
background: linear-gradient(135deg, #1f2937 0%, #374151 100%);

/* Button Color */
.cta-button {
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
}

/* Security Note Color */
.security-note {
  background-color: #fef3c7; /* Light yellow */
  border-left: 4px solid #f59e0b; /* Orange */
}
```

### **Change Logo:**
Replace this line in the header:

```html
<div class="logo">MSC & Co</div>
```

With an image:

```html
<img src="https://yourdomain.com/logo.png" alt="MSC & Co" style="height: 40px;">
```

### **Add Social Media Icons:**
Add to the footer:

```html
<div style="margin-top: 20px;">
  <a href="https://twitter.com/mscandco" style="margin: 0 10px;">
    <img src="https://yourdomain.com/twitter-icon.png" alt="Twitter" style="height: 24px;">
  </a>
  <a href="https://instagram.com/mscandco" style="margin: 0 10px;">
    <img src="https://yourdomain.com/instagram-icon.png" alt="Instagram" style="height: 24px;">
  </a>
</div>
```

---

## 📝 **Other Email Templates to Customize:**

After setting up the registration email, you can also customize:

### **1. Magic Link Email**
- Path: Authentication → Email Templates → Magic Link
- Used for: Passwordless login

### **2. Password Reset Email**
- Path: Authentication → Email Templates → Reset Password
- Used for: Password recovery

### **3. Email Change Confirmation**
- Path: Authentication → Email Templates → Change Email Address
- Used for: Email update verification

### **4. Invite User Email**
- Path: Authentication → Email Templates → Invite User
- Used for: Admin invitations

**Template File Locations:**
- `email-templates/magic-link.html`
- `email-templates/password-reset.html`
- `email-templates/email-change.html`
- `email-templates/invite-user.html`

(Coming soon - let me know if you want me to create these!)

---

## 🔍 **Troubleshooting:**

### **Email not showing custom template:**
- Clear browser cache
- Try with a different email address
- Check Supabase logs for errors
- Verify template was saved correctly

### **Styling looks broken:**
- Ensure all `<style>` tags are inside `<head>`
- Check for missing closing tags
- Test in multiple email clients (Gmail, Outlook, Apple Mail)

### **Button not clickable:**
- Verify `{{ .ConfirmationURL }}` is in the `href` attribute
- Check for CSS that might be covering the button
- Test the link in the plain text version

### **Images not loading:**
- Use absolute URLs (https://...)
- Host images on a CDN or your domain
- Test image URLs in a browser first

---

## 📊 **Email Template Variables:**

Supabase provides these variables you can use:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{ .ConfirmationURL }}` | Email confirmation link | `https://yourproject.supabase.co/auth/v1/verify?token=...` |
| `{{ .Token }}` | Verification token | `abc123def456...` |
| `{{ .TokenHash }}` | Hashed token | `xyz789...` |
| `{{ .SiteURL }}` | Your site URL | `https://mscandco.com` |
| `{{ .RedirectTo }}` | Redirect URL | `https://mscandco.com/dashboard` |

**Usage Example:**
```html
<a href="{{ .ConfirmationURL }}">Confirm Email</a>
<p>Or visit: {{ .SiteURL }}</p>
```

---

## 🎯 **Best Practices:**

1. **Keep it Simple**: Don't overcomplicate the design
2. **Clear CTA**: Make the action button obvious
3. **Mobile First**: Test on mobile devices
4. **Security**: Always mention expiration times
5. **Brand Consistency**: Match your website colors
6. **Accessibility**: Use sufficient color contrast
7. **Plain Text Fallback**: Some clients block HTML
8. **Test Everything**: Send test emails before going live

---

## ✅ **Completion Checklist:**

- [ ] Copy custom template to Supabase
- [ ] Save template in Supabase dashboard
- [ ] Test registration with new email
- [ ] Verify email looks correct on desktop
- [ ] Verify email looks correct on mobile
- [ ] Test CTA button clicks through
- [ ] Check all links work
- [ ] Verify copy and paste URL works
- [ ] Test in Gmail
- [ ] Test in Outlook
- [ ] Test in Apple Mail
- [ ] Deploy to production

---

## 🚀 **Ready to Deploy!**

Once you've:
1. ✅ Set up the custom template in Supabase
2. ✅ Tested with a new registration
3. ✅ Verified it looks great

Your users will receive **beautiful, branded emails** that match the MSC & Co experience! 🎉

---

**Need help customizing? Just ask!** 💬

