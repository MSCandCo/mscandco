# Gmail Cleanup - Quick Start Guide

## ⚡ Quick Setup (5 minutes)

### Step 1: Get App-Specific Password

Gmail **requires** an App-Specific Password (your regular password won't work).

1. Visit: https://myaccount.google.com/apppasswords
2. If prompted, enable 2-Step Verification first
3. Select "Mail" → "Other (Custom name)"
4. Name it: "Gmail Cleanup"
5. Click "Generate"
6. Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`)

### Step 2: Update the Script

Edit `gmail-cleanup.js` and replace:
```javascript
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || 'sales4htay2025';
```

With your app-specific password (remove spaces):
```javascript
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || 'your16charapppassword';
```

**OR** use environment variable (more secure):
```bash
export GMAIL_APP_PASSWORD='your16charapppassword'
node gmail-cleanup.js --dry-run
```

### Step 3: Test It

```bash
# Preview what will be deleted (safe - no changes made)
node gmail-cleanup.js --dry-run --stats

# See what old emails would be deleted
node gmail-cleanup.js --dry-run --older-than-days=90
```

### Step 4: Run Cleanup

```bash
# Delete spam and trash
node gmail-cleanup.js --delete-spam --delete-trash

# Delete emails older than 90 days
node gmail-cleanup.js --older-than-days=90

# Do it all (spam, trash, and old emails)
node gmail-cleanup.js --delete-spam --delete-trash --older-than-days=90
```

## 🎯 Common Use Cases

### Clean up spam and trash only
```bash
node gmail-cleanup.js --delete-spam --delete-trash
```

### Delete very old emails (1+ years)
```bash
node gmail-cleanup.js --older-than-days=365
```

### Aggressive cleanup (30+ days old)
```bash
node gmail-cleanup.js --delete-spam --delete-trash --older-than-days=30
```

### Check your email stats first
```bash
node gmail-cleanup.js --stats
```

## ⚠️ Safety First!

1. **Always use `--dry-run` first** to preview
2. **Start with spam/trash** before deleting from inbox
3. **Use longer time ranges** initially (e.g., 365 days vs 30 days)

## 🔧 Troubleshooting

**"Invalid credentials" error?**
- You need an App-Specific Password, not your regular password
- Make sure 2-Step Verification is enabled
- Check that IMAP is enabled in Gmail settings

**"Module not found" error?**
```bash
npm install imap mailparser
```

## 📧 Your Account

- **Email**: sales4htay@gmail.com
- **Password**: Use App-Specific Password (see Step 1)

