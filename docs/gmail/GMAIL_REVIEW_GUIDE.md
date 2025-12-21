# Gmail Review & Organize Guide

## Overview

This script uses the **same cleanup logic** from `sales4htay@gmail.com` but adapted for Gmail API. It will:

1. ✅ Analyze all emails in your inbox
2. ✅ Show you a detailed review BEFORE applying any labels
3. ✅ Ask for your confirmation
4. ✅ Only then apply labels and organize

## Features

- **Review First**: See exactly what will happen before any changes
- **Sample Emails**: See examples from each category
- **Actionable Detection**: Keeps important emails in inbox
- **Smart Categorization**: Uses sender domains + content topics
- **Safe**: No changes until you confirm

## Usage

```bash
node gmail-api-review-organize.js
```

## What It Does

### Step 1: Analysis
- Scans all emails in your inbox
- Categorizes each email
- Identifies actionable emails

### Step 2: Review Display
Shows you:
- Total emails analyzed
- Actionable emails (staying in inbox) with samples
- Categories to be created
- Sample emails from each category

### Step 3: Confirmation
- Asks: "Do you want to proceed with applying these labels? (yes/no)"
- Only proceeds if you type "yes" or "y"

### Step 4: Organization
- Creates labels
- Moves emails to appropriate labels
- Removes from inbox (keeps in All Mail)
- Keeps actionable emails in inbox

## Categories

The script creates labels based on:

### Sender Domains
- Amazon, LinkedIn, Google, GitHub, Microsoft, Apple, etc.
- JobServe, ComputerFutures, Hays, Lafosse (recruiters)

### Content Topics
- DevOps Jobs, Software Engineering Jobs, Data Science Jobs
- Orders & Receipts, Bills & Statements
- Account Security, Account Updates

### Combined Labels
- Format: "Sender - Topic" (e.g., "Amazon - Orders & Receipts")
- Or just "Sender" if no specific topic

## Actionable Emails

These stay in your inbox:
- Contains keywords: "interested", "next steps", "schedule a call", "interview", etc.
- Personal emails from recruiters
- Questions or requests
- Urgent/important emails

## Example Output

```
📧 Analyzing emails with Gmail API...

Found 1000+ emails in inbox

🔄 Analyzing emails (this may take a while)...
   Processed 1000/1000 emails...

✅ Analysis complete!

📊 ORGANIZATION REVIEW
============================================================

📧 Total emails analyzed: 1000

⚠️  Actionable emails (will stay in inbox): 45

   Sample actionable emails:

   1. From: recruiter@hays.com
      Subject: Software Engineer Role - Next Steps
      Preview: Hi, I saw your profile and think you'd be a great fit...

   ...

📁 Categories to be created: 25
📦 Emails to be labeled: 955

   📂 JobServe - DevOps Jobs: 120 emails
      Sample emails:
      1. From: noreply@jobserve.com
         Subject: DevOps Engineer - London
         Preview: New job alert for DevOps Engineer position...

   📂 Amazon - Orders & Receipts: 85 emails
   📂 LinkedIn: 45 emails
   ...

============================================================

❓ Do you want to proceed with applying these labels? (yes/no):
```

## Safety Features

- ✅ **Review before action** - See everything first
- ✅ **Confirmation required** - Won't proceed without your approval
- ✅ **No deletions** - Emails are archived, not deleted
- ✅ **Reversible** - You can always move emails back to inbox

## Tips

1. **Review carefully** - Check the samples to ensure categorization looks correct
2. **Check actionable emails** - Make sure important emails aren't being moved
3. **You can cancel** - Type "no" if something doesn't look right
4. **Run again later** - You can run it multiple times as new emails arrive

## Troubleshooting

### "Too many emails"
- The script processes in batches
- Large inboxes may take 10-30 minutes to analyze
- Be patient - it shows progress

### "Rate limit exceeded"
- Gmail API has rate limits
- Script handles this automatically
- If it happens, wait a few minutes and try again

### "Label creation failed"
- Some labels may already exist
- Script will use existing labels
- Check Gmail web interface to verify

## Current Account

- **Email**: info@yhwhmsc.com
- **Uses**: Gmail API (OAuth2)

---

**Ready to review and organize?** Run: `node gmail-api-review-organize.js`

