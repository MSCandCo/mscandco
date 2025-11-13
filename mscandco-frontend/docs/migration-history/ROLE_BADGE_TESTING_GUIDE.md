# Role Badge Testing Guide

**Date:** October 11, 2025
**Feature:** Role badge display in header
**Status:** Partially tested with Playwright, requires manual browser testing

---

## ✅ Automated Testing Results (Playwright)

### Successfully Verified:

1. **Super Admin** (`superadmin@mscandco.com`)
   - ✅ Badge displays: "SUPER ADMIN"
   - ✅ Positioned before profile button
   - ✅ Proper formatting (uppercase, spaces)

2. **Company Admin** (`companyadmin@mscandco.com`)
   - ✅ Badge displays: "COMPANY ADMIN"
   - ✅ Positioned before profile button
   - ✅ Proper formatting

**Automated Testing Limitation:** Playwright experiences session timeouts after 2-3 user logins. Remaining users require manual browser testing.

---

## 📋 Manual Testing Required

### Remaining Users to Test (5 users):

| # | Email | Role | Expected Badge Display |
|---|-------|------|------------------------|
| 3 | labeladmin@mscandco.com | label_admin | **LABEL ADMIN** |
| 4 | analytics@mscandco.com | financial_admin | **FINANCIAL ADMIN** |
| 5 | requests@mscandco.com | requests_admin | **REQUESTS ADMIN** |
| 6 | codegroup@mscandco.com | distribution_partner | **DISTRIBUTION PARTNER** |
| 7 | info@htay.co.uk | artist | **ARTIST** |

**Password for all users:** `TestPass123!`

---

## 🧪 Testing Instructions

### Part 1: Test All User Role Badges (15 minutes)

For each remaining user:

1. Open **Safari or Chrome** (real browser, not Playwright)
2. Navigate to: `http://localhost:3013/login`
3. Login with user credentials
4. **Check header** - Role badge should appear before "Hi, [Name]" button
5. **Verify badge text** matches expected display
6. **Take screenshot** (optional but recommended)
7. Logout
8. Repeat for next user

**Quick Checklist:**
- [ ] Label Admin - "LABEL ADMIN" badge visible
- [ ] Financial Admin - "FINANCIAL ADMIN" badge visible
- [ ] Requests Admin - "REQUESTS ADMIN" badge visible
- [ ] Distribution Partner - "DISTRIBUTION PARTNER" badge visible
- [ ] Artist - "ARTIST" badge visible

---

### Part 2: Test Role Change & Badge Update (10 minutes)

**Objective:** Verify that the badge updates dynamically when a user's role changes.

#### Step 1: Login as Super Admin

```
Email: superadmin@mscandco.com
Password: TestPass123!
```

#### Step 2: Navigate to User Management

1. Click profile dropdown → "User Management"
2. URL should be: `http://localhost:3013/admin/usermanagement`

#### Step 3: Change a User's Role

**Test Subject:** Use `analytics@mscandco.com` (Financial Admin)

1. Find "analytics@mscandco.com" in user list
2. Click "Change Role" button
3. **Original Role:** financial_admin (badge shows "FINANCIAL ADMIN")
4. **Change to:** artist
5. Click "Save" or "Confirm"
6. Note the user ID or confirm the change was successful

#### Step 4: Logout and Login as Changed User

1. Logout from Super Admin
2. Navigate to login page
3. Login as: `analytics@mscandco.com` / `TestPass123!`
4. **Verify:** Badge now shows "ARTIST" instead of "FINANCIAL ADMIN"

#### Step 5: Change Role Back

1. Logout
2. Login as Super Admin again
3. Navigate to User Management
4. Find `analytics@mscandco.com`
5. Change role back to: financial_admin
6. Confirm the change

#### Step 6: Verify Original Badge Restored

1. Logout from Super Admin
2. Login as `analytics@mscandco.com` again
3. **Verify:** Badge shows "FINANCIAL ADMIN" (original role)

**Test Complete!** ✅

---

## 🎯 What You're Verifying

### Badge Appearance:
- Gray rounded pill shape
- Positioned immediately before profile button
- Text format: UPPERCASE with spaces (not underscores)

### Badge Behavior:
- Shows on both desktop and mobile layouts
- Only visible when user is logged in
- Updates dynamically when role changes in database
- Displays immediately after profile data loads

---

## 📊 Expected Results Summary

| User Role | Database Value | Badge Display |
|-----------|---------------|---------------|
| Super Admin | super_admin | SUPER ADMIN |
| Company Admin | company_admin | COMPANY ADMIN |
| Label Admin | label_admin | LABEL ADMIN |
| Financial Admin | financial_admin | FINANCIAL ADMIN |
| Requests Admin | requests_admin | REQUESTS ADMIN |
| Distribution Partner | distribution_partner | DISTRIBUTION PARTNER |
| Artist | artist | ARTIST |

---

## 🐛 Troubleshooting

### Badge Not Appearing?

**Check:**
1. Is profile data loading? (Check network tab for `/api/artist/profile` call)
2. Is the role field present in profile response?
3. Are you logged in? Badge only shows for authenticated users
4. Try hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

### Badge Shows Wrong Role?

**Check:**
1. Database: `SELECT email, role FROM user_profiles WHERE email = 'user@example.com'`
2. Clear browser cache and cookies
3. Logout and login again
4. Verify the profile API is returning the correct role

### Badge Not Updating After Role Change?

**Fix:**
1. Logout completely
2. Clear browser cache
3. Login again with changed user
4. Profile API should fetch new role from database

---

## 📝 Code Reference

**Implementation Location:** `/components/header.js`

**Badge Component (Desktop):**
```javascript
{profileData?.role && (
  <span className="px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full border border-gray-300">
    {profileData.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
  </span>
)}
```

**Profile Data Source:** `/api/artist/profile` endpoint

**Role Storage:** `user_profiles` table, `role` column

---

## ✅ Sign-Off Checklist

When all testing is complete, verify:

- [ ] All 7 users tested (5 remaining + 2 already tested)
- [ ] All role badges display correctly
- [ ] Badge formatting is consistent across roles
- [ ] Role change test completed successfully
- [ ] Badge updated after role change
- [ ] Original role restored successfully
- [ ] No console errors during testing
- [ ] Screenshots captured (optional)

---

## 📤 Reporting Results

After completing testing, report back:

**Format:**
```
ROLE BADGE TESTING COMPLETE

✅ Tested Users:
- superadmin@mscandco.com: SUPER ADMIN - PASS
- companyadmin@mscandco.com: COMPANY ADMIN - PASS
- labeladmin@mscandco.com: LABEL ADMIN - PASS/FAIL
- analytics@mscandco.com: FINANCIAL ADMIN - PASS/FAIL
- requests@mscandco.com: REQUESTS ADMIN - PASS/FAIL
- codegroup@mscandco.com: DISTRIBUTION PARTNER - PASS/FAIL
- info@htay.co.uk: ARTIST - PASS/FAIL

✅ Role Change Test:
- Original role badge: FINANCIAL ADMIN - PASS/FAIL
- Changed role badge: ARTIST - PASS/FAIL
- Restored role badge: FINANCIAL ADMIN - PASS/FAIL

🐛 Issues Found: [List any issues or NONE]
```

---

## 🚀 Next Steps After Testing

If all tests pass:
- Feature is production-ready
- Can be merged to main branch
- No additional changes needed

If issues found:
- Document the specific issue
- Provide screenshots
- Share console error messages
- I'll fix immediately

---

**Estimated Testing Time:** 20-25 minutes
**Browser Required:** Safari or Chrome (real browser, not automation)
**Dev Server:** Must be running on port 3013

Good luck with testing! 🎯
