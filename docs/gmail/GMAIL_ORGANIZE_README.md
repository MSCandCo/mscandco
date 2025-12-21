# Gmail Organization Tool

Organizes your Gmail inbox by categorizing emails into labels. Each email gets exactly **ONE label**, and only actionable emails remain in your inbox.

## How It Works

1. **Analyzes** all emails in your inbox
2. **Identifies actionable emails** (emails requiring your response/action)
3. **Categorizes non-actionable emails** into labels:
   - Newsletters
   - Social
   - Promotions
   - Receipts
   - Bills
   - Travel
   - Updates
   - Archive (default for uncategorized)
4. **Applies ONE label** to each non-actionable email
5. **Archives** labeled emails (removes from inbox, keeps in All Mail)
6. **Keeps actionable emails** in inbox

## Usage

### Preview organization (recommended first!)
```bash
node gmail-organize.js --dry-run
```

### Show statistics only
```bash
node gmail-organize.js --stats
```

### Actually organize emails
```bash
node gmail-organize.js
```

## Email Categories

### Actionable (Stays in Inbox)
Emails that require your action:
- Contains keywords: "action required", "reply", "urgent", "meeting", "deadline", etc.
- Direct personal emails (not automated)
- Questions or requests

### Newsletters
- Newsletter subscriptions
- Digest emails
- Weekly/monthly updates

### Social
- Social media notifications
- Facebook, Twitter, Instagram, LinkedIn updates

### Promotions
- Sales, discounts, offers
- Marketing emails
- Deal notifications

### Receipts
- Purchase confirmations
- Order receipts
- Transaction records

### Bills
- Bill statements
- Payment due notices
- Account statements

### Travel
- Flight confirmations
- Hotel bookings
- Travel itineraries

### Updates
- Account updates
- System notifications
- Status alerts

### Archive
- Default category for emails that don't match other categories
- Old/completed items

## Important Notes

### Gmail Labels vs Folders
- Gmail uses **labels**, not folders
- Via IMAP, labels appear as folders
- The script creates labels by copying emails to label "folders"
- Gmail will automatically create labels when emails are copied to them

### One Label Per Email
- **Strictly enforced**: Each email gets exactly ONE label
- First matching category wins
- Actionable emails get NO label (stay in inbox)

### No Deletions
- **Nothing is deleted** - emails are only archived
- All emails remain in "All Mail"
- You can always find them by searching or viewing the label

## Example Output

```
📧 Organizing Inbox...

Found 388 emails in inbox

Analyzed 388 emails

📊 Organization Plan:

  ⚠️  Actionable (staying in inbox): 175 emails
  Promotions: 209 emails
  Newsletters: 4 emails

🔄 Organizing emails...

  ✅ Labeled 209 emails as "Promotions" and archived
  ✅ Labeled 4 emails as "Newsletters" and archived

  ⚠️  Kept 175 actionable emails in inbox

✅ Organization complete!
   - Categorized: 213 emails
   - Remaining in inbox: 175 actionable emails
```

## Customization

You can customize categories by editing the `CATEGORIES` object in `gmail-organize.js`:

```javascript
const CATEGORIES = {
  'YourCategory': {
    keywords: ['keyword1', 'keyword2'],
    senders: ['sender-pattern']
  },
  // ... more categories
};
```

## Troubleshooting

### "Label creation failed"
- Gmail may restrict label creation via IMAP
- Emails will be archived without labels
- You can manually add labels in Gmail web interface
- Labels will be created automatically when you use them

### "Folder not found" errors
- Gmail creates labels automatically when copying emails
- If errors occur, emails will still be archived
- Check Gmail web interface to verify labels were created

### Too many actionable emails
- Adjust the `isActionable()` function to be more/less strict
- Modify keywords in the function to match your needs

## Safety

- ✅ **Dry-run mode** - preview before making changes
- ✅ **No deletions** - emails are only archived
- ✅ **Reversible** - you can always move emails back to inbox
- ✅ **One label only** - prevents duplicate categorization

## Current Account

- **Email**: sales4htay@gmail.com
- **Password**: Set via `GMAIL_APP_PASSWORD` environment variable or in script

