# Gmail Cleanup Tool

A Node.js script to help clean up your Gmail account by deleting old emails, spam, and trash.

## ⚠️ Important: App-Specific Password Required

Gmail requires an **App-Specific Password** for IMAP access. Your regular password won't work.

### How to Generate an App-Specific Password:

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already enabled
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Select "Mail" and "Other (Custom name)"
5. Enter "Gmail Cleanup Script" as the name
6. Click "Generate"
7. Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)
8. Update `GMAIL_APP_PASSWORD` in `gmail-cleanup.js` with this password

## Installation

```bash
# Install dependencies
npm install imap mailparser

# Or copy the package.json and install
cp gmail-cleanup-package.json package.json
npm install
```

## Usage

### Preview what will be deleted (Dry Run)
```bash
node gmail-cleanup.js --dry-run
```

### Show email statistics only
```bash
node gmail-cleanup.js --stats
```

### Delete spam emails
```bash
node gmail-cleanup.js --delete-spam
```

### Delete trash emails
```bash
node gmail-cleanup.js --delete-trash
```

### Delete emails older than 90 days (default)
```bash
node gmail-cleanup.js --older-than-days=90
```

### Delete emails older than 30 days
```bash
node gmail-cleanup.js --older-than-days=30
```

### Combine options
```bash
# Delete spam, trash, and emails older than 60 days
node gmail-cleanup.js --delete-spam --delete-trash --older-than-days=60

# Preview first (recommended!)
node gmail-cleanup.js --dry-run --delete-spam --delete-trash --older-than-days=60
```

## Options

- `--dry-run` - Preview changes without actually deleting anything (recommended first!)
- `--stats` - Show email statistics only
- `--delete-spam` - Delete all emails in Spam folder
- `--delete-trash` - Delete all emails in Trash folder
- `--older-than-days=X` - Delete emails older than X days from all folders (except Spam/Trash)

## Examples

### Safe cleanup workflow:
```bash
# 1. First, check statistics
node gmail-cleanup.js --stats

# 2. Preview what would be deleted
node gmail-cleanup.js --dry-run --delete-spam --delete-trash --older-than-days=90

# 3. If you're happy with the preview, run for real
node gmail-cleanup.js --delete-spam --delete-trash --older-than-days=90
```

### Quick cleanup:
```bash
# Delete spam and trash only
node gmail-cleanup.js --delete-spam --delete-trash
```

## Security Note

⚠️ **Never commit your app-specific password to version control!**

Consider using environment variables:
```javascript
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || 'your-password-here';
```

Then run:
```bash
GMAIL_APP_PASSWORD=your-app-password node gmail-cleanup.js --dry-run
```

## Troubleshooting

### "Invalid credentials" or "Authentication failed"
- Make sure you're using an App-Specific Password, not your regular Gmail password
- Verify 2-Step Verification is enabled
- Check that IMAP is enabled in Gmail settings

### "Module not found: imap"
- Run `npm install imap mailparser`

### Connection timeout
- Check your internet connection
- Gmail IMAP server might be temporarily unavailable
- Try again in a few minutes

## Current Configuration

- **Email**: sales4htay@gmail.com
- **Password**: Update `GMAIL_APP_PASSWORD` in the script with your app-specific password

## Features

- ✅ Delete old emails by age
- ✅ Delete all spam emails
- ✅ Delete all trash emails
- ✅ Show email statistics
- ✅ Dry-run mode for safe preview
- ✅ Processes all Gmail folders

## Limitations

- Requires App-Specific Password (can't use regular password)
- Deletes emails permanently (can't undo)
- Processes one folder at a time (may be slow for large accounts)

## Safety Tips

1. **Always run with `--dry-run` first** to preview changes
2. **Backup important emails** before running cleanup
3. **Start with small time ranges** (e.g., `--older-than-days=365` for emails older than 1 year)
4. **Test with spam/trash first** before deleting from inbox

