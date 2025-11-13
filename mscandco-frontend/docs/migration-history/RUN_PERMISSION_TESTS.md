# Permission Toggle Testing - Instructions

## Overview
This automated test suite will test ALL permissions in your system by:
1. Logging in as super admin
2. Disabling a permission for a test user
3. Logging in as that user to verify they can't access the feature
4. Re-enabling the permission
5. Verifying the user CAN now access the feature

## Prerequisites

### 1. Install Playwright (if not already installed)
```bash
npm install playwright
```

### 2. Make sure dev server is running
```bash
cd mscandco-frontend
PORT=3013 npm run dev
```

## Running the Tests

### Step 1: Setup Test Users
First, create the test user accounts:

```bash
cd "/Users/htay/Documents/MSC & Co/mscandco-frontend"
node setup-test-users.js
```

This creates:
- `artist1@test.com` (password: `Test1234!`) - Artist role
- `labeladmin1@test.com` (password: `Test1234!`) - Label Admin role

### Step 2: Run Permission Tests
```bash
node test-all-permissions-playwright.js
```

### Test Configuration
- **Headless Mode**: Set to `false` by default (you can watch the tests run)
- **Test Limit**: Currently tests first 10 permissions (modify line 323 to test more)
- **Users**: Tests with both artist and label admin accounts

### What Gets Tested
The script tests all permissions with `action === 'read'` or `action === 'access'`, including:

**User Management:**
- `users_access:user_management:read`
- `users_access:permissions_roles:read`
- `users_access:master_roster:read`

**Analytics:**
- `analytics:requests:read`
- `analytics:platform_analytics:read`
- `analytics:analytics_management:read`

**Finance:**
- `finance:earnings_management:read`
- `finance:wallet_management:read`
- `finance:split_configuration:read`

**Content:**
- `content:asset_library:read`

**User Features:**
- `releases:access`
- `analytics:access`
- `earnings:access`
- `roster:access`

## Test Flow for Each Permission

For each permission, the script:

1. ✅ Login as super admin
2. ✅ Navigate to User Management
3. ✅ Find the test user
4. ✅ Disable the permission
5. ✅ Logout
6. ✅ Login as test user
7. ✅ Try to access the protected feature → Should be DENIED (redirected to dashboard)
8. ✅ Logout
9. ✅ Login as super admin again
10. ✅ Enable the permission
11. ✅ Logout
12. ✅ Login as test user again
13. ✅ Try to access the protected feature → Should be GRANTED (page loads successfully)
14. ✅ Logout

## Output

### Console Output
Real-time progress with emojis:
- 📝 Info messages
- ✅ Success
- ❌ Errors
- ⚠️ Warnings
- 🧪 Test start

### Test Report
After completion, a detailed markdown report is generated:
```
PERMISSION_TOGGLE_TEST_REPORT.md
```

The report includes:
- Summary statistics (total, passed, failed, skipped)
- Success rate percentage
- Detailed results for each permission test
- Step-by-step breakdown
- Recommendations for failed tests

## Modifying the Tests

### Test More Permissions
Edit line 323 in `test-all-permissions-playwright.js`:
```javascript
// Change from:
for (const permission of testablPermissions.slice(0, 10)) {

// To test all:
for (const permission of testablPermissions) {
```

### Run in Headless Mode (Faster)
Edit line 315:
```javascript
const browser = await chromium.launch({
  headless: true, // Change to true
  slowMo: 0       // Remove slowMo for speed
});
```

### Add More Test Users
Edit `setup-test-users.js` and add to the `TEST_USERS` array.

## Troubleshooting

### Test Users Don't Exist
```bash
node setup-test-users.js
```

### Login Failures
- Check that super admin credentials are correct in the script
- Verify dev server is running on port 3013
- Check that test user passwords are correct

### Permission Toggle Not Working
- Verify the User Management page selector paths
- Check browser console for errors during test run
- Try running in non-headless mode to watch what's happening

### Tests Timing Out
- Increase timeout values in the script
- Add more `sleep()` calls between actions
- Check network speed and server response times

## Expected Results

With a properly configured system:
- **Success Rate**: Should be 80%+
- **Failed Tests**: Usually due to:
  - Missing route mappings
  - Incorrect permission checks on pages
  - UI elements not loading in time

## After Testing

1. Review the `PERMISSION_TOGGLE_TEST_REPORT.md`
2. Fix any failed permissions
3. Re-run tests to verify fixes
4. Keep test users for future regression testing

## Notes

- Tests run sequentially to avoid conflicts
- Each test is independent
- Browser is reused across tests for efficiency
- Test data is not cleaned up automatically (manual cleanup needed)

---

**Good night! The tests will run automatically once you execute the command. Check the report in the morning!** 🌙
