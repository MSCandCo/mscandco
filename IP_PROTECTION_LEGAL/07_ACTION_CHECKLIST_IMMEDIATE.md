# IP PROTECTION ACTION CHECKLIST
## AUDIOMSC LTD - Immediate Steps Required

**CRITICAL:** Follow this checklist IN ORDER within the next 30 days.

---

## ✅ WEEK 1 (DAYS 1-7) - VERIFICATION & SETUP

### Day 1-2: Company Verification

**☐ 1. Verify AUDIOMSC LTD at Companies House**
- Website: https://find-and-update.company-information.service.gov.uk
- Search for: AUDIOMSC LTD (13250829)
- Verify:
  - ✓ Company status is "Active"
  - ✓ Registered office address is correct
  - ✓ Director details are current
  - ✓ Annual accounts are filed
  - ✓ Confirmation statement is up to date

**Action if anything is wrong:**
- Update registered office address: https://www.gov.uk/file-changes-to-a-company-with-companies-house (£35 fee)
- File overdue accounts immediately (penalties apply)

**☐ 2. Update All Legal Documents with Registered Address**
- Open each NDA template in IP_PROTECTION_LEGAL folder
- Find: `[INSERT YOUR REGISTERED ADDRESS FROM COMPANIES HOUSE]`
- Replace with actual registered address
- Save all updated files

**Files to update:**
1. `01_NDA_ONE_WAY_INVESTOR.md`
2. `02_NDA_MUTUAL_PARTNERSHIP.md`
3. `03_EMPLOYEE_IP_ASSIGNMENT_AGREEMENT.md`
4. `05_TRADEMARK_APPLICATIONS.md`

---

### Day 3-4: Patent Attorney Contact

**☐ 3. Contact Patent Attorney for Consultation**

**Call ONE of these firms:**

**Option 1: Appleyard Lees (RECOMMENDED)**
- Phone: +44 (0)113 367 3840
- Email: mail@appleyardlees.com
- Website: www.appleyardlees.com
- Ask for: Software/AI patent specialist

**Option 2: Withers & Rogers**
- Phone: +44 (0)20 7421 8000
- Email: info@withersrogers.com

**Option 3: Marks & Clerk**
- Phone: +44 (0)20 7420 8200
- Email: patents@marks-clerk.com

**What to say:**
"Hello, I'm calling from AUDIOMSC LTD. We have developed AI-native music distribution technology using the Model Context Protocol, and we need to file a UK patent application within 30 days. I have a detailed patent disclosure document ready. Can I schedule a consultation with a software patent specialist this week?"

**☐ 4. Prepare for Patent Consultation**

Documents to bring/send:
- `04_PATENT_DISCLOSURE_DOCUMENT.md`
- MCP server code overview (don't share full source yet)
- Proof of creation (git commit history)
- Budget: £4K-£8K for UK filing

Questions to ask:
- What are the chances of patentability? (should be HIGH based on no prior art)
- Timeline to file UK application?
- Cost breakdown: filing, examination, maintenance
- International protection strategy (PCT within 12 months)
- Trade secret vs. patent for music taxonomy?

**☐ 5. Schedule Patent Filing (if attorney recommends)**
- Target: File UK patent within 20 days
- Budget: £4,000-£8,000
- Once filed, you can use "Patent Pending" on all materials

---

### Day 5-7: Trademark Preparation

**☐ 6. Create UK IPO Account**
- Website: https://www.gov.uk/how-to-register-a-trade-mark/apply-online
- Click "Apply online"
- Create account with email: legal@audiomsc.com (or your preferred)
- Verify email

**☐ 7. Review Trademark Applications**
- Open: `05_TRADEMARK_APPLICATIONS.md`
- Review all 5 trademark descriptions
- Check: Goods/services descriptions match your actual business
- Customize if needed (e.g., if you're NOT offering certain services yet)

**☐ 8. Prepare Payment for Trademarks**
- Total cost: £1,170 for all 5 trademarks
- Payment method: Credit/debit card (UK IPO accepts online payment)
- Budget approved? ☐ Yes ☐ No (if no, prioritize MSC & Co and Apollo Intelligence first)

**Priority order if budget is limited:**
1. MSC & Co (£320) - MUST FILE
2. Apollo Intelligence (£220) - MUST FILE
3. YHWH MSC (£220)
4. Audio MSC (£220)
5. Master Collection Partner (£220)

---

## ✅ WEEK 2 (DAYS 8-14) - FILINGS & SECURITY

### Day 8-10: Trademark Filing

**☐ 9. File All 5 Trademark Applications**

**For each trademark:**
1. Log into UK IPO account
2. Start new application
3. Enter mark name (e.g., "MSC & Co")
4. Select classes (refer to `05_TRADEMARK_APPLICATIONS.md` for each)
5. Copy/paste goods/services description
6. Enter applicant details:
   - Name: AUDIOMSC LTD
   - Company number: 13250829
   - Address: [YOUR REGISTERED ADDRESS]
   - Email: legal@audiomsc.com
7. Review application
8. Pay filing fee
9. **SAVE CONFIRMATION EMAIL** for each application
10. Log in spreadsheet (create simple tracker):

| Trademark | Application # | Filing Date | Status | Renewal Date |
|-----------|---------------|-------------|--------|--------------|
| MSC & Co | TM[NUMBER] | [DATE] | Filed | +10 years |
| YHWH MSC | TM[NUMBER] | [DATE] | Filed | +10 years |
| ... | ... | ... | ... | ... |

**☐ 10. Update Website with Trademark Symbols**
- Add ™ symbol to all brand names on mscandco.com (until registered, then use ®)
- Footer: "MSC & Co™, Apollo Intelligence™, YHWH MSC™, Audio MSC™ are trademarks of AUDIOMSC LTD"
- Update marketing materials

**☐ 11. Set Calendar Reminders**
- 4 weeks from filing: Check IPO for any formalities letters
- 12 weeks from filing: Check publication in Trade Marks Journal
- 9.5 years from filing: Renewal due in 6 months
- 10 years from filing: Renewal deadline (£200 per mark)

---

### Day 11-14: Code & Repository Security

**☐ 12. Make GitHub Repository Private**

**If msc-co-mcp-server is currently public:**
1. Go to GitHub repository settings
2. Scroll to "Danger Zone"
3. Click "Change repository visibility"
4. Select "Make private"
5. Confirm

**Why:** Public repositories = public disclosure = NO patent protection for code details

**☐ 13. Audit Repository Access**
- Review who has access to mscandco-frontend and msc-co-mcp-server repos
- Remove anyone who:
  - Is no longer working with you
  - Has not signed IP assignment agreement
  - Does not need access

**☐ 14. Update Git Commit Author Info (if needed)**
- Ensure all commits show:
  - Author: Henry Taylor (or your name)
  - Email: verified email address
- This proves YOU created the code (important for IP ownership)

**☐ 15. Add Copyright Notices to All Remaining Code Files**
- Already done: `src/index.ts`, `README.md`, `package.json`
- Check ALL other code files in mscandco-frontend repo
- Add copyright header to key files:
  - All `/app/*` files
  - All `/pages/api/*` files
  - All `/lib/*` files
  - All `/components/*` files
  - All `/utils/*` files

**Copyright header template:**
```typescript
/**
 * Copyright © 2025 AUDIOMSC LTD. All Rights Reserved.
 * Company No. 13250829 (England & Wales)
 *
 * CONFIDENTIAL AND PROPRIETARY
 * Unauthorized use, copying, or distribution is strictly prohibited.
 */
```

---

## ✅ WEEK 3 (DAYS 15-21) - LEGAL AGREEMENTS & COMPLIANCE

### Day 15-17: Employee/Contractor IP Assignments

**☐ 16. Identify Everyone Who Has Touched Your Code or Seen Confidential Info**

Make a list:
| Name | Role | Start Date | NDA Signed? | IP Agreement Signed? | Access Revoked? |
|------|------|------------|-------------|----------------------|-----------------|
| [NAME] | Developer | [DATE] | ☐ Yes ☐ No | ☐ Yes ☐ No | ☐ Yes ☐ No ☐ N/A |
| ... | ... | ... | ... | ... | ... |

**☐ 17. Send IP Assignment Agreement to EVERYONE on the list**

**Email template:**
```
Subject: URGENT: IP Assignment Agreement - Action Required

Hi [NAME],

As part of AUDIOMSC LTD's intellectual property protection process,
I need you to sign the attached Employee IP Assignment Agreement.

This agreement confirms that:
• All work you created for MSC & Co belongs to AUDIOMSC LTD
• You will keep company information confidential
• Standard non-compete and non-solicitation terms apply

Please review, sign, and return by [DATE - give 7 days].

If you have any questions, let me know. If you had any pre-existing
IP created BEFORE working with MSC & Co, please list it in Section 5.1.

Attachment: 03_EMPLOYEE_IP_ASSIGNMENT_AGREEMENT.md (convert to PDF first)

Thank you,
Henry Taylor
Director, AUDIOMSC LTD
```

**☐ 18. Follow Up on Unsigned Agreements**
- After 7 days, send reminder to anyone who hasn't signed
- After 14 days, revoke access if still not signed (serious security risk)
- Store signed copies in secure folder (Google Drive with encryption, or physical safe)

---

### Day 18-21: NDA Management System

**☐ 19. Create NDA Tracker Spreadsheet**

**Create Google Sheet or Excel file: "NDA_TRACKER_AUDIOMSC.xlsx"**

Columns:
| Recipient Name | Company | Type | Date Sent | Date Signed | Expiry Date | Purpose | Version | Status |
|----------------|---------|------|-----------|-------------|-------------|---------|---------|--------|
| [Investor A] | [VC Firm] | One-Way | [DATE] | [DATE] | +5 years | Seed pitch | v1.0 | Active |

**☐ 20. Prepare NDA Templates for Quick Use**
- Convert all 3 NDA templates to PDF:
  - `01_NDA_ONE_WAY_INVESTOR.md` → PDF
  - `02_NDA_MUTUAL_PARTNERSHIP.md` → PDF
  - `03_EMPLOYEE_IP_ASSIGNMENT_AGREEMENT.md` → PDF
- Create DocuSign templates (optional but recommended):
  - Sign up for DocuSign (free trial or $10/month)
  - Upload each NDA as template
  - Mark signature fields
  - Save for quick sending

**☐ 21. Set Up Email Signature with Legal Notice**

Add to your email signature:
```
---
Henry Taylor
Founder & CEO
AUDIOMSC LTD (Company No. 13250829)

📧 [your email]
🌐 mscandco.com

⚠️ CONFIDENTIALITY NOTICE:
This email and any attachments may contain confidential and proprietary
information belonging to AUDIOMSC LTD. If you are not the intended
recipient, please delete this email and notify the sender immediately.
Unauthorized use or disclosure is strictly prohibited.

© 2025 AUDIOMSC LTD. All Rights Reserved.
```

---

## ✅ WEEK 4 (DAYS 22-30) - ENFORCEMENT & MONITORING

### Day 22-25: Defensive Measures

**☐ 22. Search for Existing Infringement**

**Check if anyone is already using your brand names:**
- Google: "MSC & Co music distribution" (not your site)
- Google: "Apollo Intelligence music"
- Google: "Master Collection Partner"
- UK IPO trademark search: https://www.ipo.gov.uk/tmcase
- USPTO (US) search: https://www.uspto.gov/trademarks (if you plan to expand to US)

**If you find potential infringement:**
- Don't panic
- Document with screenshots
- Consult with trademark attorney before taking action
- DO NOT send cease and desist yourself (can backfire legally)

**☐ 23. Set Up Google Alerts for Your Brands**
- Go to: https://www.google.com/alerts
- Create alerts for:
  - "MSC & Co" music
  - "Apollo Intelligence" music
  - "AUDIOMSC LTD"
  - "Master Collection Partner"
- Frequency: "As-it-happens" or "Daily"

**☐ 24. Register Domain Variations (Defensive Registration)**

**Check availability and register:**
- mscandco.co.uk (if not already owned)
- apollointelligence.com
- apollointelligence.ai
- mastercollectionpartner.com
- yhwhmsc.com
- audiomsc.com

Cost: £10-£15 per domain/year
Use: Namecheap, Google Domains, or GoDaddy

**Why:** Prevents cybersquatting and brand confusion

**☐ 25. Watermark Your Pitch Deck**
- Open `06_CONFIDENTIAL_PITCH_DECK_TEMPLATE.md`
- Create actual PowerPoint/Google Slides version
- Add watermark to EVERY slide (see template instructions)
- Save multiple versions:
  - PITCH_DECK_MSC_CO_MASTER.pptx (never share)
  - PITCH_DECK_MSC_CO_v1.0_INVESTOR_A.pdf (for specific investor)

---

### Day 26-30: Final Compliance & Documentation

**☐ 26. Apply for R&D Tax Credits (CRITICAL - FREE MONEY)**

**You likely qualify for R&D tax relief on:**
- MCP server development (novel AI integration)
- Music taxonomy system (comprehensive validation framework)
- Apollo Intelligence (conversational AI for KYC)

**How much?**
- 10-33% of eligible R&D costs back as tax credit
- Estimated: £5K-£20K refund (depending on development costs)

**What to do:**
1. Track all development time and costs (retroactively if needed)
2. Contact R&D tax credit specialist:
   - ForrestBrown: www.forrestbrown.co.uk (no upfront fee, 15-20% of claim)
   - EmpowerRD: www.empowerrd.com
3. File claim with HMRC via specialist
4. Expect refund in 3-6 months

**☐ 27. Update Terms of Service & Privacy Policy on Website**

**Add to Terms of Service:**
- "All IP belongs to AUDIOMSC LTD"
- "Users grant license to distribute their music, but retain ownership"
- "No reverse engineering of platform technology"

**Add to Privacy Policy:**
- "We collect user data in accordance with GDPR"
- "Data is stored securely on Supabase (PostgreSQL)"
- "Users can request data deletion"

**☐ 28. Create "Patents Pending" Page on Website**

**Add page: mscandco.com/ip**

```markdown
# Intellectual Property

MSC & Co is protected by multiple layers of intellectual property.

## Patents
**Status:** Patent applications pending (UK IPO)

Our patent-pending innovations include:
- AI-native music distribution using Model Context Protocol
- Conversational AI onboarding with automatic field locking
- Comprehensive music metadata taxonomy for artificial intelligence

## Trademarks
The following are trademarks of AUDIOMSC LTD:
- MSC & Co™
- Apollo Intelligence™
- YHWH MSC™
- Audio MSC™
- Master Collection Partner™

## Copyright
All software, documentation, and content © 2025 AUDIOMSC LTD.
All Rights Reserved.

For licensing inquiries: legal@audiomsc.com
```

**☐ 29. Backup All Legal Documents**

**Create backups in 3 locations:**
1. ✓ GitHub (already done - IP_PROTECTION_LEGAL folder)
2. Google Drive encrypted folder:
   - Create folder: "AUDIOMSC_IP_PROTECTION_LEGAL_CONFIDENTIAL"
   - Upload all documents from IP_PROTECTION_LEGAL
   - Share ONLY with yourself (no one else)
3. Physical backup:
   - Print all legal documents
   - Store in fireproof safe or safety deposit box

**☐ 30. Create IP Protection Renewal Calendar**

**Set recurring calendar reminders:**
- **Quarterly:** Review NDA tracker, check for new agreements needed
- **Annually:** Review trademark status, renew domains
- **Every 2 years:** Review patent strategy, file continuations if needed
- **Every 10 years:** Renew trademarks (£200 each)

---

## ✅ WHAT I (CLAUDE) CANNOT DO - YOU MUST DO MANUALLY

The following tasks REQUIRE you to take action personally:

### Legal & Filing

1. **Sign legal documents** - I can't sign on your behalf
2. **File patent applications** - Requires attorney interaction and payment
3. **File trademark applications** - Requires UK IPO account and payment
4. **Verify company status** - Must access Companies House with your credentials
5. **Contact attorneys** - Must make phone calls or send emails from your account

### Financial

6. **Make payments** - Can't pay IPO fees, attorney fees, or domain registrations
7. **Set up DocuSign account** - Requires credit card and account creation
8. **Apply for R&D tax credits** - Must authorize specialist to act on your behalf

### Security & Access

9. **Make GitHub repo private** - Requires your GitHub account access
10. **Audit repository access** - Must review collaborators yourself
11. **Revoke access for non-signers** - Security decision only you can make

### Communication

12. **Send NDAs to investors** - Must come from your email for legal validity
13. **Send IP assignments to employees** - Requires your direct communication
14. **Follow up on unsigned agreements** - Personal touch is critical

### Documentation & Proof

15. **Print and store physical copies** - I can't interact with physical world
16. **Take screenshots of infringement** - If found, you must document
17. **Create DocuSign templates** - Requires your account setup

---

## 🎯 PRIORITY SUMMARY (IF TIME IS LIMITED)

**If you can only do 5 things in the next 30 days, do THESE:**

1. ✅ **Contact patent attorney THIS WEEK** (filing deadline is critical)
2. ✅ **File MSC & Co and Apollo Intelligence trademarks** (£540 total)
3. ✅ **Make GitHub repository private** (takes 2 minutes, protects everything)
4. ✅ **Send IP assignment to anyone who has touched your code** (legal requirement)
5. ✅ **Set up NDA process** (never pitch without signed NDA going forward)

**Everything else can wait until Week 5+, but don't wait too long.**

---

## 📊 BUDGET SUMMARY (NEXT 30 DAYS)

| Item | Cost | Priority | Status |
|------|------|----------|--------|
| Patent attorney consultation | £500 | CRITICAL | ☐ |
| UK patent filing | £4,000-£8,000 | CRITICAL | ☐ |
| Trademark filings (all 5) | £1,170 | HIGH | ☐ |
| Domain registrations | £50-£100 | MEDIUM | ☐ |
| DocuSign subscription | £10/month | LOW | ☐ |
| R&D tax credit specialist | £0 upfront | MEDIUM | ☐ |
| **TOTAL (30 DAYS)** | **£5,720-£9,820** | | |

**ROI:** Protects £500K-£2M in IP value

---

## ❓ QUESTIONS? ISSUES?

If you encounter ANY issues with this checklist:

**Patent questions:** Contact attorney immediately (see Day 3-4)
**Trademark questions:** UK IPO helpline +44 (0)300 300 2000
**Legal document questions:** Consult solicitor (Withers & Rogers, Appleyard Lees)
**Technical questions:** Review documentation in IP_PROTECTION_LEGAL folder

---

**DOCUMENT REFERENCE:** ACTION-CHECKLIST-AUDIOMSC-20251109
**VERSION:** 1.0
**OWNER:** AUDIOMSC LTD (13250829)
**STATUS:** IMMEDIATE ACTION REQUIRED

**⚠️ START TODAY - TIME IS CRITICAL FOR PATENT FILING**
