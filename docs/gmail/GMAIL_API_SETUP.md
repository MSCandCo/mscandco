# Gmail API Setup Guide

## Quick Setup Steps

### 1. Create Google Cloud Project

1. Go to: https://console.cloud.google.com/
2. Click "Select a project" → "New Project"
3. Name it: "Gmail Organizer" (or any name)
4. Click "Create"

### 2. Enable Gmail API

1. In the project, go to "APIs & Services" → "Library"
2. Search for "Gmail API"
3. Click "Gmail API" → "Enable"

### 3. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure OAuth consent screen:
   - User Type: External
   - App name: Gmail Organizer
   - User support email: your email
   - Developer contact: your email
   - Click "Save and Continue"
   - Scopes: Add "https://www.googleapis.com/auth/gmail.modify"
   - Click "Save and Continue"
   - Test users: Add your Gmail address
   - Click "Save and Continue"
4. Application type: "Desktop app"
5. Name: "Gmail Organizer"
6. Click "Create"
7. Click "Download JSON"
8. Save the file as: `gmail-credentials.json` in this directory

### 4. Run Setup

```bash
node gmail-api-setup.js
```

This will:
- Open a browser for authentication
- Save your token for future use

### 5. Organize Emails

```bash
node gmail-api-organize.js
```

This will:
- Create all labels automatically
- Organize emails into labels
- Keep actionable emails in inbox

## Files Created

- `gmail-credentials.json` - Your OAuth credentials (keep secure!)
- `gmail-token.json` - Your access token (auto-generated)

## Troubleshooting

### "Credentials file not found"
- Make sure `gmail-credentials.json` is in the same directory
- Check the filename is exactly `gmail-credentials.json`

### "Access denied"
- Make sure you added your email as a test user in OAuth consent screen
- Check that Gmail API is enabled

### "Token expired"
- Delete `gmail-token.json` and run setup again
- The token will be refreshed automatically

