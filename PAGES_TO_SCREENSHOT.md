# MSC & Co Platform - Complete Page List for Screenshots

## Summary
**Total Pages: 83 pages across the platform**

---

## 📋 Public Pages (No Authentication Required) - 18 Pages

### Main Public Pages
1. **Homepage** - `/`
2. **About** - `/about`
3. **Pricing** - `/pricing`
4. **Support** - `/support`
5. **FAQ** - `/faq`
6. **Find My Song** - `/find-my-song`

### Developer Pages
7. **Developers** - `/developers`
8. **Developer API Keys** - `/developers/keys`

### Authentication Pages
9. **Login** - `/login`
10. **Register** - `/register`
11. **Reset Password** - `/reset-password`
12. **Force Logout** - `/force-logout`

### Legal & Policy Pages
13. **Terms of Use** - `/terms-of-use`
14. **Privacy Policy** - `/privacy-policy`
15. **Cookie Policy** - `/cookie-policy`
16. **DMCA Policy** - `/dmca-policy`
17. **Refund Policy** - `/refund-policy`
18. **License Terms** - `/license-terms`

### Special Pages
19. **DMCA Submission** - `/dmca`
20. **Unauthorized** - `/unauthorized`

---

## 🎨 Artist Pages (Requires Artist Login) - 10 Pages

1. **Artist Dashboard** - `/artist/dashboard`
2. **Artist Releases** - `/artist/releases`
3. **Artist Analytics** - `/artist/analytics`
4. **Artist Earnings** - `/artist/earnings`
5. **Artist Messages** - `/artist/messages`
6. **Artist Profile** - `/artist/profile`
7. **Artist Billing** - `/artist/billing`
8. **Artist Settings** - `/artist/settings`
9. **Artist Roster** - `/artist/roster`
10. **Artist Affiliate** - `/artist/affiliate`

---

## 🏢 Label Admin Pages (Requires Label Admin Login) - 10 Pages

1. **Label Dashboard** - `/labeladmin/dashboard`
2. **Label Artists** - `/labeladmin/artists`
3. **Label Releases** - `/labeladmin/releases`
4. **Label Analytics** - `/labeladmin/analytics`
5. **Label Earnings** - `/labeladmin/earnings`
6. **Label Messages** - `/labeladmin/messages`
7. **Label Roster** - `/labeladmin/roster`
8. **Label Billing** - `/labeladmin/billing`
9. **Label Settings** - `/labeladmin/settings`
10. **Label Profile** - `/labeladmin/profile`

---

## 📦 Distribution Partner Pages (Requires Distribution Login) - 6 Pages

1. **Distribution Dashboard** - `/distribution/dashboard`
2. **Distribution Hub** - `/distribution/hub`
3. **Distribution Catalog** - `/distribution/catalog`
4. **Distribution Platforms** - `/distribution/platforms`
5. **Distribution Revenue** - `/distribution/revenue`
6. **Distribution Analytics** - `/distribution/analytics`

---

## ⚙️ Admin Pages (Requires Admin Login) - 26 Pages

### Core Admin Pages
1. **Admin User Management** - `/admin/usermanagement`
2. **Admin Analytics Management** - `/admin/analyticsmanagement`
3. **Admin Earnings Management** - `/admin/earningsmanagement`
4. **Admin Wallet Management** - `/admin/walletmanagement`
5. **Admin Master Roster** - `/admin/masterroster`
6. **Admin Platform Analytics** - `/admin/platformanalytics`
7. **Admin Split Configuration** - `/admin/splitconfiguration`
8. **Admin Asset Library** - `/admin/assetlibrary`
9. **Admin Requests** - `/admin/requests`
10. **Admin Messages** - `/admin/messages`
11. **Admin Permissions** - `/admin/permissions`
12. **Admin Permission Performance** - `/admin/permission-performance`
13. **Admin Moderation** - `/admin/moderation`
14. **Admin Profile** - `/admin/profile`
15. **Admin Settings** - `/admin/settings`

### Admin Systems Pages
16. **Admin Systems Overview** - `/admin/systems`
17. **Admin Systems Analytics** - `/admin/systems/analytics`
18. **Admin Systems Backups** - `/admin/systems/backups`
19. **Admin Systems Docs** - `/admin/systems/docs`
20. **Admin Systems Email** - `/admin/systems/email`
21. **Admin Systems Errors** - `/admin/systems/errors`
22. **Admin Systems Logs** - `/admin/systems/logs`
23. **Admin Systems Performance** - `/admin/systems/performance`
24. **Admin Systems Rate Limit** - `/admin/systems/ratelimit`
25. **Admin Systems Security** - `/admin/systems/security`
26. **Admin Systems Uptime** - `/admin/systems/uptime`

---

## 🔑 SuperAdmin Pages (Requires SuperAdmin Login) - 4 Pages

1. **SuperAdmin Dashboard** - `/superadmin/dashboard`
2. **SuperAdmin Permissions & Roles** - `/superadmin/permissionsroles`
3. **SuperAdmin Ghost Login** - `/superadmin/ghostlogin`
4. **SuperAdmin Messages** - `/superadmin/messages`

---

## 🤖 AI & Other Authenticated Pages - 5 Pages

1. **AI Assistant** - `/ai`
2. **AI Chat** - `/ai/chat`
3. **Dashboard** - `/dashboard` (generic dashboard)
4. **Notifications** - `/notifications`
5. **Change Email** - `/change-email`

---

## 📊 Pages by Authentication Level

### Public (20 pages) ✅ No login required
- Homepage, About, Pricing, Support, FAQ
- Find My Song, Developers, Developer Keys
- Login, Register, Reset Password, Force Logout
- Terms, Privacy, Cookie Policy, DMCA Policy, Refund, License
- DMCA Submission, Unauthorized, Auth Callback

### Artist Only (10 pages) 🎨 Requires Artist account
- Dashboard, Releases, Analytics, Earnings
- Messages, Profile, Billing, Settings
- Roster, Affiliate

### Label Admin Only (10 pages) 🏢 Requires Label account
- Dashboard, Artists, Releases, Analytics
- Earnings, Messages, Roster, Billing
- Settings, Profile

### Distribution Only (6 pages) 📦 Requires Distribution account
- Dashboard, Hub, Catalog, Platforms
- Revenue, Analytics

### Admin Only (26 pages) ⚙️ Requires Admin account
- User Management, Analytics Management, Earnings Management
- Wallet Management, Master Roster, Platform Analytics
- Split Configuration, Asset Library, Requests
- Messages, Permissions, Permission Performance
- Moderation, Profile, Settings
- 11 Systems pages (Analytics, Backups, Docs, Email, Errors, Logs, Performance, Rate Limit, Security, Uptime, Overview)

### SuperAdmin Only (4 pages) 🔑 Requires SuperAdmin account
- Dashboard, Permissions & Roles, Ghost Login, Messages

### Authenticated Generic (5 pages) 🔐 Any logged-in user
- AI, AI Chat, Dashboard, Notifications, Change Email

---

## 🎯 Recommended Screenshot Capture Strategy

### Option 1: Manual Browser Screenshots (Simplest)
1. Open browser with responsive design mode (1920x1080)
2. Go through each section systematically
3. Use browser's built-in screenshot tool (Cmd+Shift+4 on Mac)
4. Name files according to numbering above

### Option 2: Browser Extension
Use a Chrome extension like:
- **GoFullPage** - Full page screenshots
- **Awesome Screenshot** - Annotate and capture
- **Fireshot** - Professional screenshots

### Option 3: Automated with Playwright (When Server is Stable)
```bash
cd "/Users/htay/Documents/MSC & Co"
python3 capture-screenshots.py --output screenshots
```

### Option 4: Use Existing MCP Playwright Tools
Navigate to each URL manually and capture with:
- `mcp__playwright__playwright_navigate`
- `mcp__playwright__playwright_screenshot`

---

## 📁 Suggested Screenshot Organization

```
screenshots/
├── 01-public/
│   ├── 01-homepage.png
│   ├── 02-about.png
│   ├── 03-pricing.png
│   └── ...
├── 02-artist/
│   ├── 01-artist-dashboard.png
│   ├── 02-artist-releases.png
│   └── ...
├── 03-labeladmin/
│   ├── 01-labeladmin-dashboard.png
│   └── ...
├── 04-distribution/
│   └── ...
├── 05-admin/
│   ├── core/
│   └── systems/
├── 06-superadmin/
│   └── ...
└── 07-other/
    └── ...
```

---

## ⚡ Quick URLs for Testing

### Public Pages (Copy-paste ready)
```
http://localhost:3013/
http://localhost:3013/about
http://localhost:3013/pricing
http://localhost:3013/support
http://localhost:3013/faq
http://localhost:3013/find-my-song
http://localhost:3013/developers
http://localhost:3013/developers/keys
http://localhost:3013/login
http://localhost:3013/register
```

### Artist Pages
```
http://localhost:3013/artist/dashboard
http://localhost:3013/artist/releases
http://localhost:3013/artist/analytics
http://localhost:3013/artist/earnings
http://localhost:3013/artist/messages
http://localhost:3013/artist/profile
http://localhost:3013/artist/billing
http://localhost:3013/artist/settings
```

### Admin Pages
```
http://localhost:3013/admin/usermanagement
http://localhost:3013/admin/analyticsmanagement
http://localhost:3013/admin/earningsmanagement
http://localhost:3013/admin/walletmanagement
http://localhost:3013/admin/platformanalytics
http://localhost:3013/admin/moderation
http://localhost:3013/admin/systems
```

---

## 🎬 For Pitch Deck - Priority Pages (Top 15)

If you need just key pages for your pitch deck, prioritize these:

1. **Homepage** - Shows main value proposition
2. **Pricing** - Shows business model
3. **Artist Dashboard** - Main artist experience
4. **Artist Releases** - Content management
5. **Artist Analytics** - Data visualization
6. **Artist Earnings** - Transparent financials
7. **Label Dashboard** - B2B offering
8. **Admin User Management** - Enterprise features
9. **Admin Moderation** - Compliance system
10. **Admin Platform Analytics** - System oversight
11. **AI Chat** - Apollo assistant (unique feature!)
12. **Artist Profile** - User experience
13. **Admin Systems Overview** - Technical infrastructure
14. **SuperAdmin Dashboard** - Complete control
15. **Distribution Hub** - Partner features

---

**Note:** For best results, ensure the dev server is running properly before capturing screenshots. You may need to restart it if experiencing timeout issues.

```bash
cd "/Users/htay/Documents/MSC & Co/mscandco-frontend"
npm run dev
```
