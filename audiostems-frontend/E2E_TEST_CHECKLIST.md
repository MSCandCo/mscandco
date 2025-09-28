# MSC & Co End-to-End Testing Checklist
**Platform**: Music Distribution System  
**Test Date**: September 27, 2025  
**Test Environment**: localhost:3013

## 🎯 **PRE-TEST SETUP**

### **Test Data Baseline**
- **Henry's Current Wallet**: Available £225.50, Pending £465.00, Total £690.50
- **Approved Payouts**: 1 request (£100 approved)
- **Pending Entries**: 4 entries (Netflix £200, YouTube £89.25, Tidal £125.75, Deezer £50)
- **Analytics Data**: Latest release "Love", 1 milestone
- **Test Amounts**: Use £50 for new payout, £25 for new earnings

---

## 🎭 **ARTIST FLOW TESTING**

### **Test 1: Artist Login & Dashboard**
```
□ 1.1 Navigate to http://localhost:3013/login
□ 1.2 Login as Henry Taylor (info@htay.co.uk)
□ 1.3 Verify redirect to /dashboard
□ 1.4 Check navigation shows: Releases, Analytics, Earnings, Roster
□ 1.5 Verify no console errors on dashboard load
```

### **Test 2: Artist Earnings/Wallet Page**
```
□ 2.1 Click "Earnings" in navigation
□ 2.2 Verify URL: /artist/earnings
□ 2.3 Verify page title: "Earnings & Wallet"
□ 2.4 Check wallet cards display:
     □ Available Balance: £225.50
     □ Pending Income: £465.00  
     □ Total Earned: £690.50
     □ Last Payout: Shows recent data
□ 2.5 Verify pending income breakdown shows 4 entries:
     □ Netflix: £200.00 (Sync)
     □ YouTube Music: £89.25 (Streaming)
     □ Tidal: £125.75 (Streaming)
     □ Deezer: £50.00 (Streaming)
□ 2.6 Verify recent history shows past transactions
□ 2.7 Check "Request Payout" button is visible and styled correctly
□ 2.8 Verify no placeholder/mock data anywhere
□ 2.9 Check mobile responsiveness (resize browser)
□ 2.10 Verify loading states work (refresh page)
```

### **Test 3: Payout Request Functionality**
```
□ 3.1 Click "Request Payout" button
□ 3.2 Verify modal opens with MSC brand styling
□ 3.3 Check modal shows available balance: £125.50
□ 3.4 Enter payout amount: £50
□ 3.5 Select payout method: Bank Transfer
□ 3.6 Fill bank details:
     □ Account Name: Henry Taylor
     □ Account Number: 87654321
     □ Sort Code: 20-00-00
     □ Bank Name: Test Bank
□ 3.7 Add notes: "E2E test payout request"
□ 3.8 Click "Request Payout"
□ 3.9 Verify success notification appears
□ 3.10 Check modal closes automatically
□ 3.11 Verify recent history updates with new request
□ 3.12 Check wallet balance remains same (request pending)
```

### **Test 4: Artist Analytics Page**
```
□ 4.1 Click "Analytics" in navigation
□ 4.2 Verify URL: /artist/analytics  
□ 4.3 Check page loads with MSC gradient header
□ 4.4 Verify analytics sections display:
     □ Latest Release: "Love" with platforms
     □ Career Snapshot: Shows "Mainstream" stage
     □ Milestones: Shows "+22% growth" milestone
□ 4.5 Check Pro upgrade section (glass morphism effect)
□ 4.6 Verify no console errors
□ 4.7 Check mobile responsiveness
□ 4.8 Verify empty sections show proper messaging
```

---

## 👨‍💼 **ADMIN FLOW TESTING**

### **Test 5: Admin Login & Dashboard**
```
□ 5.1 Logout from artist account
□ 5.2 Login as company admin (companyadmin@mscandco.com)
□ 5.3 Verify redirect to admin dashboard
□ 5.4 Check admin navigation shows all sections
□ 5.5 Verify dashboard cards include:
     □ "Manage Artist Earnings"
     □ "Payout Approvals" (NEW)
     □ "Manage Artist Analytics"
□ 5.6 Check no console errors on admin dashboard
```

### **Test 6: Admin Earnings Management**
```
□ 6.1 Click "Manage Artist Earnings" or navigate to /companyadmin/earnings-management
□ 6.2 Verify page loads with artist selection
□ 6.3 Select Henry Taylor from dropdown
□ 6.4 Check wallet history displays (should show 9 entries - earnings + payouts)
□ 6.5 Verify AddEarningsForm displays correctly
□ 6.6 Fill new earnings form:
     □ Amount: £25.00
     □ Type: Streaming
     □ Platform: Amazon Music
     □ Territory: Germany
     □ Notes: "E2E test earnings entry"
□ 6.7 Click "Add Earnings"
□ 6.8 Verify success notification
□ 6.9 Check earnings list refreshes with new entry
□ 6.10 Verify no errors or placeholder data
```

### **Test 7: Admin Payout Approval System**
```
□ 7.1 Click "Payout Approvals" or navigate to /companyadmin/payout-requests
□ 7.2 Verify page loads with statistics dashboard
□ 7.3 Check statistics show:
     □ Total Pending: £50.00 (Henry's new request)
     □ Approved This Month: £100.00 (previous approval)
     □ Requests Count: 1 pending
□ 7.4 Verify pending request card shows:
     □ Artist Name: Moses Bliss (Henry)
     □ Amount: £50.00
     □ Request Date: Today's date
     □ Method: Bank Transfer
     □ Bank details from request
□ 7.5 Click "Approve" button
□ 7.6 Verify approval processes successfully
□ 7.7 Check success notification appears
□ 7.8 Verify statistics update:
     □ Total Pending: £0.00
     □ Approved This Month: £150.00
□ 7.9 Check request moves to "Recent Activity" section
□ 7.10 Verify status badge shows "Approved" in green
```

### **Test 8: Admin Analytics Management**
```
□ 8.1 Navigate to /companyadmin/analytics-management
□ 8.2 Select Henry Taylor from dropdown
□ 8.3 Verify current analytics data loads
□ 8.4 Check latest release shows "Love"
□ 8.5 Verify milestones shows growth data
□ 8.6 Test save functionality (change a value)
□ 8.7 Verify save success notification
□ 8.8 Check changes persist after refresh
```

---

## 🔄 **CROSS-VERIFICATION TESTING**

### **Test 9: Real-time Wallet Updates**
```
□ 9.1 Return to Henry's account (/artist/earnings)
□ 9.2 Verify wallet balances updated:
     □ Available Balance: £75.50 (was £125.50 - £50 payout)
     □ Pending Balance: £490.00 (was £465.00 + £25 new earnings)
     □ Total Earned: £615.50 (was £590.50 + £25)
□ 9.3 Check recent history shows:
     □ Approved £50 payout with admin timestamp
     □ New £25 Amazon Music earnings
□ 9.4 Verify pending breakdown shows new Amazon Music entry
```

### **Test 10: Analytics Display Updates**
```
□ 10.1 Navigate to /artist/analytics as Henry
□ 10.2 Verify analytics data still displays correctly
□ 10.3 Check latest release information intact
□ 10.4 Verify milestones display properly
□ 10.5 Test any changes made in admin interface appear
```

---

## 📱 **MOBILE & RESPONSIVE TESTING**

### **Test 11: Mobile Interface**
```
□ 11.1 Resize browser to mobile width (375px)
□ 11.2 Test artist earnings page mobile layout
□ 11.3 Verify payout request modal mobile-friendly
□ 11.4 Test admin payout requests mobile view
□ 11.5 Check navigation menu works on mobile
□ 11.6 Verify all buttons/forms usable on mobile
```

### **Test 12: Loading States & Errors**
```
□ 12.1 Test page loading with slow connection simulation
□ 12.2 Verify loading spinners display with MSC branding
□ 12.3 Test error handling (disconnect network briefly)
□ 12.4 Check error messages use MSC error styling
□ 12.5 Verify graceful fallbacks for missing data
□ 12.6 Test form validation errors display properly
```

---

## 🐛 **ERROR & EDGE CASE TESTING**

### **Test 13: Validation & Error Handling**
```
□ 13.1 Try payout request with amount > available balance
□ 13.2 Verify error message shows available amount
□ 13.3 Try payout request with amount < minimum (£50)
□ 13.4 Check minimum amount validation works
□ 13.5 Try adding earnings with invalid data
□ 13.6 Verify server-side validation catches errors
□ 13.7 Test network errors show proper messages
```

### **Test 14: Console & Performance**
```
□ 14.1 Open browser console on all pages
□ 14.2 Verify no JavaScript errors
□ 14.3 Check no 404 errors for assets/APIs
□ 14.4 Verify API response times < 1 second
□ 14.5 Check page load times reasonable
□ 14.6 Test with browser caching disabled
□ 14.7 Verify no memory leaks (check dev tools)
```

---

## 📊 **EXPECTED FINAL STATE**

### **After All Tests Complete:**
```
Henry's Wallet Should Show:
✅ Available Balance: £175.50 (£225.50 - £50 payout)
✅ Pending Balance: £490.00 (£465.00 + £25 new earnings)
✅ Total Earned: £715.50 (£690.50 + £25 new earnings)
✅ Recent History: 2 new entries (payout + earnings)

Admin Dashboard Should Show:
✅ Total Pending Payouts: £0
✅ Approved This Month: £150
✅ Total Earnings Entries: 8
✅ All requests processed successfully
```

---

## 📋 **TEST RESULTS TEMPLATE**

### **✅ PASS CRITERIA**
- All checkboxes completed successfully
- No console errors or warnings
- All API calls return proper data
- Real-time updates working
- Mobile interface functional
- MSC brand styling consistent
- No placeholder or mock data

### **❌ FAIL CRITERIA**  
- Any page fails to load (non-200 response)
- Console errors present
- Data not updating in real-time
- Mobile interface broken
- Non-MSC styling found
- Mock data detected

---

## 🎯 **TESTING COMPLETION**

**When all tests pass:**
1. **Document any issues found**
2. **Verify fixes implemented**
3. **Confirm production readiness**
4. **Proceed with deployment**

**Expected Result**: 100% test completion confirms production-ready platform

---

**Test Checklist Created**: September 27, 2025  
**Platform Status**: Ready for comprehensive E2E testing  
**Estimated Test Time**: 45-60 minutes for complete verification
