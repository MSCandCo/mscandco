# Gmail API Cleanup - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Set Up Gmail API Credentials

1. **Create Google Cloud Project** (if you haven't already):
   - Go to: https://console.cloud.google.com/
   - Create a new project or select existing one
   - Enable **Gmail API**:
     - Go to "APIs & Services" → "Library"
     - Search for "Gmail API" → Click "Enable"

2. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - If prompted, configure OAuth consent screen:
     - User Type: **External**
     - App name: Gmail Cleanup
     - User support email: your email
     - Developer contact: your email
     - **Scopes**: Add `https://www.googleapis.com/auth/gmail.modify`
     - **Test users**: Add your Gmail address
   - Application type: **Desktop app**
   - Name: Gmail Cleanup
   - Click "Create" → **Download JSON**
   - Save as: `gmail-credentials.json` in this directory

### Step 3: Authenticate

```bash
node gmail-api-setup.js
```

This will:
- Open a browser for authentication
- Save your token to `gmail-token.json`
- You only need to do this once!

### Step 4: Clean Your Inbox! 🎉

## 📋 Usage Examples

### Preview what will be deleted (SAFE - Recommended First!)
```bash
node gmail-api-cleanup.js --dry-run --clean-inbox
```

### Show email statistics
```bash
node gmail-api-cleanup.js --stats
```

### Clean inbox (archive non-actionable emails)
```bash
node gmail-api-cleanup.js --clean-inbox
```

### Delete spam emails
```bash
node gmail-api-cleanup.js --delete-spam
```

### Delete trash emails
```bash
node gmail-api-cleanup.js --delete-trash
```

### Delete emails older than 90 days
```bash
node gmail-api-cleanup.js --older-than-days=90
```

### Archive old emails instead of deleting
```bash
node gmail-api-cleanup.js --clean-inbox --archive-old
```

### Combine multiple options
```bash
# Preview: Delete spam, trash, and clean inbox
node gmail-api-cleanup.js --dry-run --delete-spam --delete-trash --clean-inbox

# Actually do it (after preview looks good)
node gmail-api-cleanup.js --delete-spam --delete-trash --clean-inbox
```

## 🎯 Recommended Workflow

### First Time Setup:
```bash
# 1. Check your email stats
node gmail-api-cleanup.js --stats

# 2. Preview what would be cleaned
node gmail-api-cleanup.js --dry-run --clean-inbox --delete-spam --delete-trash

# 3. If preview looks good, run for real
node gmail-api-cleanup.js --clean-inbox --delete-spam --delete-trash
```

### Regular Cleanup:
```bash
# Quick inbox cleanup (archives old non-actionable emails)
node gmail-api-cleanup.js --clean-inbox --archive-old

# Deep cleanup (delete old emails)
node gmail-api-cleanup.js --older-than-days=90 --delete-spam --delete-trash
```

## ⚙️ Options

| Option | Description |
|--------|-------------|
| `--dry-run` | Preview changes without making them (SAFE!) |
| `--stats` | Show email statistics only |
| `--clean-inbox` | Clean inbox (archive/delete non-actionable emails) |
| `--archive-old` | Archive old emails instead of deleting (use with --clean-inbox) |
| `--delete-spam` | Delete all spam emails |
| `--delete-trash` | Delete all trash emails |
| `--older-than-days=X` | Delete emails older than X days (default: 90) |

## 🔒 Security Notes

- ✅ `gmail-credentials.json` - Contains OAuth credentials (keep secure!)
- ✅ `gmail-token.json` - Contains your access token (auto-generated, keep secure!)
- ⚠️ **Never commit these files to version control!**
- ✅ Add to `.gitignore`:
  ```
  gmail-credentials.json
  gmail-token.json
  ```

## 🐛 Troubleshooting

### "Credentials file not found"
- Make sure `gmail-credentials.json` exists in this directory
- Check the filename is exactly `gmail-credentials.json`

### "Token expired" or "Invalid credentials"
- Delete `gmail-token.json` and run `node gmail-api-setup.js` again
- The token will be refreshed automatically

### "Access denied"
- Make sure you added your email as a test user in OAuth consent screen
- Check that Gmail API is enabled in Google Cloud Console

### "Rate limit exceeded"
- Gmail API has rate limits (250 quota units per user per second)
- The script processes emails in batches to avoid this
- If you hit limits, wait a few minutes and try again

## 📊 What Gets Cleaned?

### `--clean-inbox`:
- **Keeps**: Emails with actionable keywords (interested, interview, schedule, etc.)
- **Archives/Deletes**: Automated emails, newsletters, old non-actionable emails

### `--delete-spam`:
- Permanently deletes all emails in Spam folder

### `--delete-trash`:
- Permanently deletes all emails in Trash folder

### `--older-than-days=X`:
- Deletes emails older than X days from all folders (except Spam/Trash)

## 💡 Tips

1. **Always use `--dry-run` first** to preview changes
2. **Start with small operations** (e.g., just spam/trash) before cleaning inbox
3. **Use `--archive-old`** if you want to keep emails but remove from inbox
4. **Check stats regularly** with `--stats` to monitor your inbox

## 🆘 Need Help?

- Check `GMAIL_API_SETUP.md` for detailed setup instructions
- Check `GMAIL_CLEANUP_README.md` for IMAP-based cleanup (alternative method)

