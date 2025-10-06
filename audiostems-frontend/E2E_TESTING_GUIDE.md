# 🧪 E2E Testing Guide - MSC & Co Music Platform

## Quick Start

### 1. Verify Setup
```bash
chmod +x verify-test-setup.sh
./verify-test-setup.sh
```

### 2. Run All Tests
```bash
npx playwright test tests/e2e/complete-release-workflow.spec.js
```

### 3. Run Tests with UI (Recommended for Debugging)
```bash
npx playwright test --ui
```

### 4. Run Single Test
```bash
npx playwright test tests/e2e/complete-release-workflow.spec.js -g "artist creates"
```

---

## 📋 Prerequisites

### Test Users Must Exist in Supabase

Create these users in your Supabase Auth dashboard:

| Email | Password | Role | Purpose |
|-------|----------|------|---------|
| `artist@test.com` | `test123` | `artist` | Test release creation |
| `codegroup@mscandco.com` | `C0d3gr0up` | `distribution_partner` | Test review workflow |
| `companyadmin@mscandco.com` | `ca@2025msC` | `company_admin` | Test admin features |

**Important:** Ensure each user:
- Has verified email (`email_confirmed_at` is set)
- Has correct role in `user_profiles` table
- Can log in successfully

### Test Fixtures

Create these test files:

```bash
mkdir -p tests/fixtures
# Add a small test image
tests/fixtures/test-artwork.jpg  # Any small JPEG (e.g., 300x300px)
# Add a small test audio
tests/fixtures/test-audio.mp3    # Any short MP3 (e.g., 5 seconds)
```

---

## 🎯 Test Coverage

### Current Tests (9 total)

#### ✅ Working (2 tests)
1. **Distribution Dashboard Access** - Verifies distribution partner can access dashboard
2. **Admin Dashboard Access** - Verifies admin can access dashboard

#### 🟢 Fixed (7 tests)
3. **Complete Release Workflow** - Artist creates + distribution partner reviews
4. **Artist Update Request** - Artist requests update, distribution partner handles
5. **Distribution Partner Denies** - Distribution partner denies revision
6. **Push to Draft** - Distribution partner pushes release back to draft
7. **Artist Uploads Artwork** - File upload test for artwork
8. **Artist Uploads Audio** - File upload test for audio
9. **Admin Content Library** - Admin manages uploaded assets

---

## 🔧 Test Structure

### Test Flow Overview

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Artist Login → Dashboard → Releases → Create Release     │
│    ↓                                                         │
│ 2. Fill Form → Save Draft → Submit for Review               │
│    ↓                                                         │
│ 3. Logout → Distribution Partner Login → Dashboard          │
│    ↓                                                         │
│ 4. Go to Queue → Move to Review → Approve → Mark Live       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🐛 Debugging Failed Tests

### Common Issues & Solutions

#### Issue 1: Navigation Timeout
```
Error: Navigation timeout exceeded: waiting for navigation to "/artist/releases"
```

**Check:**
1. Is the dev server running on port 3013?
2. Can you manually navigate to the page in a browser?
3. Does the page load without errors?

**Solution:**
```bash
# Start dev server manually first
npm run dev
# Then run tests in another terminal
npx playwright test --ui
```

#### Issue 2: Element Not Found
```
Error: Timeout exceeded while waiting for locator('div:has-text("Releases")')
```

**Check:**
1. Inspect the page with Playwright UI mode
2. Verify the element exists in the actual DOM

**Debug:**
```bash
npx playwright test --ui  # Visual debugger
npx playwright test --debug  # Step-by-step mode
```

#### Issue 3: Authentication Failed
```
Error: Expected to be redirected to "/dashboard" but got "/login"
```

**Check:**
1. Do test users exist in Supabase?
2. Are passwords correct?
3. Is email verified?

**Verify in Supabase:**
```sql
SELECT email, email_confirmed_at, role 
FROM auth.users 
LEFT JOIN public.user_profiles ON auth.users.id = user_profiles.id
WHERE email IN ('artist@test.com', 'codegroup@mscandco.com', 'companyadmin@mscandco.com');
```

#### Issue 4: File Upload Failed
```
Error: Cannot set files on input element
```

**Check:**
1. Do test fixtures exist?
2. Are file paths correct?
3. Are files readable?

**Fix:**
```bash
# Create test fixtures
mkdir -p tests/fixtures
# Add small test files
```

---

## 📊 Test Reports

### View Last Test Run
```bash
npx playwright show-report
```

### Generate New Report
```bash
npx playwright test --reporter=html
npx playwright show-report
```

---

## 🎬 Running Tests in Different Modes

### Watch Mode (Re-run on Changes)
```bash
npx playwright test --watch
```

### Headed Mode (See Browser)
```bash
npx playwright test --headed
```

### Debug Mode (Step Through)
```bash
npx playwright test --debug
```

### Specific Browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

---

## 📝 Writing New Tests

### Template for New Test
```javascript
test('description of what this tests', async ({ page }) => {
  // 1. Setup
  await page.goto('/login');
  await page.fill('#email', 'test@example.com');
  await page.fill('#password', 'password');
  await page.click('button[type="submit"]');
  
  // 2. Navigate
  await page.waitForURL('/dashboard');
  await page.click('div:has-text("Section Name")');
  
  // 3. Interact
  await page.fill('input[name="field"]', 'value');
  await page.click('button:has-text("Submit")');
  
  // 4. Assert
  await expect(page.locator('text=Success')).toBeVisible();
});
```

### Best Practices
1. **Use descriptive test names** - "artist can upload artwork" not "test 1"
2. **Add timeouts for async operations** - `{ timeout: 10000 }`
3. **Use page.waitForURL()** - Ensure navigation completed
4. **Isolate tests** - Each test should be independent
5. **Clean up** - Reset state if needed

---

## 🚨 Known Issues & Limitations

### Current Limitations
1. **File uploads** require actual files in `tests/fixtures/`
2. **Audio uploads** may be slow depending on file size
3. **Parallel execution** disabled for distribution partner tests (sequential workflow)

### Environment Requirements
- Node.js 18+
- Next.js dev server running
- Supabase project accessible
- Test users created and verified

---

## 🎯 Success Criteria

Tests are considered passing when:
- ✅ All 9 tests show "passed" status
- ✅ No timeout errors
- ✅ All assertions succeed
- ✅ No console errors in browser

---

## 📞 Troubleshooting Checklist

Before asking for help, verify:

- [ ] Dev server is running (`npm run dev`)
- [ ] Port 3013 is accessible
- [ ] Test users exist in Supabase
- [ ] Test users have correct roles
- [ ] Test fixtures exist
- [ ] `.env.local` has correct Supabase keys
- [ ] Playwright is installed (`npx playwright install`)

---

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

---

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev)
- [Next.js Testing Guide](https://nextjs.org/docs/testing)
- [Supabase Testing Guide](https://supabase.com/docs/guides/testing)

---

**Last Updated:** October 5, 2025  
**Test Suite Version:** 1.0  
**Status:** ✅ All tests fixed and ready for verification
