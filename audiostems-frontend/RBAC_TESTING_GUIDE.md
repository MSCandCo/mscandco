# RBAC System Testing Guide

**Date:** October 6, 2025
**Project:** MSC & Co Audiostems Platform

---

## 🎯 Overview

This guide provides step-by-step instructions for testing the new Role-Based Access Control (RBAC) system, including database functions, API endpoints, and the Super Admin UI.

---

## 🔐 Test Users

### Super Admin
- **Email:** `superadmin@mscandco.com`
- **Role:** `super_admin`
- **Access:** Full system access via `*:*:*` wildcard permission

### Company Admin
- **Email:** `companyadmin@mscandco.com`
- **Role:** `company_admin`
- **Access:** All "any" scope permissions

### Artist
- **Email:** `info@htay.co.uk`
- **Password:** `test2025`
- **Role:** `artist`
- **Access:** "own" scope only

---

## 🧪 Database Testing

### Test Database Functions via SQL

#### Test 1: Check Super Admin Permissions
```sql
-- Should return TRUE
SELECT user_has_permission(
  (SELECT id FROM user_profiles WHERE role = 'super_admin' LIMIT 1),
  'release:create:any'
) as has_permission;
```

#### Test 2: Check Wildcard Pattern Matching
```sql
-- Test various wildcard patterns
SELECT
  user_has_permission(user_id, 'release:read:any') as test_1,
  user_has_permission(user_id, 'user:create:label') as test_2,
  user_has_permission(user_id, 'analytics:export:own') as test_3
FROM (SELECT id as user_id FROM user_profiles WHERE role = 'company_admin' LIMIT 1) u;
```

#### Test 3: Get All User Permissions
```sql
-- Should return all permissions for a user
SELECT * FROM get_user_permissions(
  (SELECT id FROM user_profiles WHERE email = 'superadmin@mscandco.com')
);
```

#### Test 4: Verify Permission Counts
```sql
-- Count permissions by role
SELECT
  r.name as role,
  COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.name
ORDER BY permission_count DESC;
```

### Run Tests via Supabase MCP

Using the Supabase MCP tools:

```bash
# Get project ID
mcp supabase list_projects

# Execute test query
mcp supabase execute_sql --project_id <PROJECT_ID> --query "<SQL_QUERY>"
```

---

## 🌐 API Testing

### Prerequisites

1. **Start Development Server**
   ```bash
   npm run dev
   ```
   Server will run on: `http://localhost:3013`

2. **Get Authentication Token**
   - Login as super admin via UI
   - Open browser DevTools → Application → Cookies
   - Copy the Supabase session token

### Test API Endpoints with curl

#### Test 1: List All Permissions
```bash
curl -X GET \
  http://localhost:3013/api/superadmin/permissions/list \
  -H "Cookie: sb-access-token=YOUR_TOKEN_HERE" \
  | jq
```

**Expected Response:**
```json
{
  "success": true,
  "permissions": [...],
  "grouped": {...},
  "total": 130
}
```

---

#### Test 2: List All Roles
```bash
curl -X GET \
  http://localhost:3013/api/superadmin/roles/list \
  -H "Cookie: sb-access-token=YOUR_TOKEN_HERE" \
  | jq
```

**Expected Response:**
```json
{
  "success": true,
  "roles": [
    {
      "id": "...",
      "name": "super_admin",
      "description": "...",
      "permission_count": 1,
      "is_system_role": true
    },
    ...
  ]
}
```

---

#### Test 3: Get Role Permissions
```bash
# First, get a role ID from the roles list
ROLE_ID="<role_id_here>"

curl -X GET \
  "http://localhost:3013/api/superadmin/roles/${ROLE_ID}/permissions" \
  -H "Cookie: sb-access-token=YOUR_TOKEN_HERE" \
  | jq
```

**Expected Response:**
```json
{
  "success": true,
  "role": {...},
  "permissions": [
    {
      "id": "...",
      "name": "release:read:own",
      "granted": true
    },
    ...
  ]
}
```

---

#### Test 4: Toggle Permission
```bash
ROLE_ID="<role_id_here>"
PERMISSION_ID="<permission_id_here>"

# Grant permission
curl -X POST \
  "http://localhost:3013/api/superadmin/roles/${ROLE_ID}/permissions" \
  -H "Cookie: sb-access-token=YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "permission_id": "'${PERMISSION_ID}'",
    "grant": true
  }' \
  | jq

# Revoke permission
curl -X POST \
  "http://localhost:3013/api/superadmin/roles/${ROLE_ID}/permissions" \
  -H "Cookie: sb-access-token=YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "permission_id": "'${PERMISSION_ID}'",
    "grant": false
  }' \
  | jq
```

---

#### Test 5: Create New Role
```bash
curl -X POST \
  http://localhost:3013/api/superadmin/roles/create \
  -H "Cookie: sb-access-token=YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test_role",
    "description": "Test role for testing"
  }' \
  | jq
```

---

#### Test 6: Update Role
```bash
ROLE_ID="<role_id_here>"

curl -X PUT \
  "http://localhost:3013/api/superadmin/roles/${ROLE_ID}/update" \
  -H "Cookie: sb-access-token=YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "updated_test_role",
    "description": "Updated description"
  }' \
  | jq
```

---

#### Test 7: Delete Role
```bash
ROLE_ID="<role_id_here>"

curl -X DELETE \
  "http://localhost:3013/api/superadmin/roles/${ROLE_ID}/delete" \
  -H "Cookie: sb-access-token=YOUR_TOKEN_HERE" \
  | jq
```

---

## 🖥️ UI Testing (Manual)

### Prerequisites

1. **Ensure dev server is running**
   ```bash
   npm run dev
   ```

2. **Login as Super Admin**
   - Navigate to: `http://localhost:3013/login`
   - Email: `superadmin@mscandco.com`
   - Password: (get from Supabase dashboard or reset)

### Test Suite

#### Test 1: Dashboard Page
1. Navigate to `/superadmin/dashboard`
2. ✅ Verify page loads without errors
3. ✅ Verify 4 quick action cards display:
   - Permissions & Roles
   - User Management
   - System Settings
   - Analytics
4. ✅ Click "Permissions & Roles" card
5. ✅ Should navigate to `/superadmin/permissions`

---

#### Test 2: Permissions Page - Initial Load
1. Navigate to `/superadmin/permissions`
2. ✅ Verify page loads without errors
3. ✅ Verify left column shows:
   - "Roles" heading
   - List of 5 roles
   - "Create New Role" button
4. ✅ Verify right column shows:
   - "Select a role to manage permissions" message
5. ✅ Verify no console errors

---

#### Test 3: Select a Role
1. Click on "Artist" role in left column
2. ✅ Verify role card highlights
3. ✅ Verify right column updates to show:
   - Role name and description
   - Permission count
   - Search bar
   - Grouped permissions
4. ✅ Verify permissions are grouped by resource
5. ✅ Verify checkboxes show current grant status

---

#### Test 4: Expand/Collapse Permission Groups
1. With a role selected, find a permission group
2. ✅ Click group header to collapse
3. ✅ Verify permissions hide
4. ✅ Chevron icon changes to right-pointing
5. ✅ Click again to expand
6. ✅ Verify permissions show
7. ✅ Chevron icon changes to down-pointing

---

#### Test 5: Search Permissions
1. With a role selected, type "release" in search box
2. ✅ Verify only permission groups with "release" show
3. ✅ Verify other groups are hidden
4. ✅ Clear search
5. ✅ Verify all groups show again

---

#### Test 6: Toggle Permission (Grant)
1. Select "Artist" role
2. Find a permission that is NOT granted
3. ✅ Click the checkbox
4. ✅ Verify loading state appears briefly
5. ✅ Verify success toast notification appears
6. ✅ Verify checkbox becomes checked
7. ✅ Verify permission count increases by 1
8. ✅ Refresh page
9. ✅ Verify permission is still granted

---

#### Test 7: Toggle Permission (Revoke)
1. Select "Artist" role
2. Find a permission that IS granted
3. ✅ Click the checkbox to uncheck
4. ✅ Verify loading state appears briefly
5. ✅ Verify success toast notification appears
6. ✅ Verify checkbox becomes unchecked
7. ✅ Verify permission count decreases by 1
8. ✅ Refresh page
9. ✅ Verify permission is still revoked

---

#### Test 8: Create New Role
1. Click "Create New Role" button
2. ✅ Verify modal opens
3. ✅ Enter role name: "test_role"
4. ✅ Enter description: "Test role"
5. ✅ Click "Create"
6. ✅ Verify loading state
7. ✅ Verify success toast appears
8. ✅ Verify modal closes
9. ✅ Verify new role appears in list
10. ✅ Click new role
11. ✅ Verify it has 0 permissions

---

#### Test 9: Create Role - Validation
1. Click "Create New Role" button
2. ✅ Try to submit empty form
3. ✅ Verify validation errors
4. ✅ Enter invalid name with spaces: "test role"
5. ✅ Verify error message
6. ✅ Enter valid name: "test_role_2"
7. ✅ Should succeed

---

#### Test 10: Edit Role
1. Select a custom role (not system role)
2. ✅ Click "Edit Role" button
3. ✅ Verify modal opens with current data
4. ✅ Change description
5. ✅ Click "Update"
6. ✅ Verify success toast
7. ✅ Verify changes reflect in list

---

#### Test 11: Edit System Role (Should Fail)
1. Select "Super Admin" role
2. ✅ Verify "Edit Role" button is disabled or hidden
3. ✅ Select "Company Admin" role
4. ✅ Verify "Edit Role" button is disabled or hidden

---

#### Test 12: Delete Role
1. Create a new test role (if not exists)
2. Select the test role
3. ✅ Click "Delete Role" button
4. ✅ Verify confirmation modal opens
5. ✅ Click "Cancel"
6. ✅ Verify modal closes, role still exists
7. ✅ Click "Delete Role" again
8. ✅ Click "Delete" in modal
9. ✅ Verify success toast
10. ✅ Verify role removed from list

---

#### Test 13: Delete System Role (Should Fail)
1. Select "Super Admin" role
2. ✅ Verify "Delete Role" button is disabled or hidden
3. ✅ Try to delete via API (should fail)

---

#### Test 14: Responsive Design
1. Resize browser to mobile width (< 768px)
2. ✅ Verify layout stacks vertically
3. ✅ Verify roles list shows above permissions
4. ✅ Verify all functionality still works

---

#### Test 15: Error Handling
1. Stop the dev server
2. Try to toggle a permission
3. ✅ Verify error toast appears
4. ✅ Restart server
5. ✅ Verify functionality returns

---

## 🤖 Automated Testing (Playwright)

### Setup

1. **Install Playwright**
   ```bash
   npx playwright install
   ```

2. **Run Tests**
   ```bash
   # Run all RBAC tests
   npx playwright test tests/e2e/rbac-system.spec.js

   # Run with UI
   npx playwright test --ui

   # Run specific test
   npx playwright test -g "should toggle permission"
   ```

### Example Test Structure

```javascript
import { test, expect } from '@playwright/test';

test.describe('RBAC System', () => {
  test.beforeEach(async ({ page }) => {
    // Login as super admin
    await page.goto('http://localhost:3013/login');
    await page.fill('input[type="email"]', 'superadmin@mscandco.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/superadmin/dashboard');
  });

  test('should load permissions page', async ({ page }) => {
    await page.goto('http://localhost:3013/superadmin/permissions');
    await expect(page.locator('h1')).toContainText('Permissions & Roles');
  });

  test('should toggle permission', async ({ page }) => {
    await page.goto('http://localhost:3013/superadmin/permissions');

    // Select artist role
    await page.click('text=Artist');

    // Wait for permissions to load
    await page.waitForSelector('[data-testid="permission-checkbox"]');

    // Toggle first permission
    const checkbox = page.locator('[data-testid="permission-checkbox"]').first();
    const wasChecked = await checkbox.isChecked();
    await checkbox.click();

    // Verify toast appears
    await expect(page.locator('.toast')).toBeVisible();

    // Verify checkbox state changed
    await expect(checkbox).toHaveAttribute('checked', wasChecked ? '' : 'checked');
  });
});
```

---

## 📊 Test Checklist

Use this checklist to track your testing progress:

### Database Tests
- [x] Super admin wildcard permission works
- [x] Company admin has any-scope permissions
- [x] Artist doesn't have label permissions
- [x] get_user_permissions function works
- [ ] Wildcard pattern matching covers all cases
- [ ] Permission audit log records changes

### API Tests
- [x] Authentication check works (401 for unauthenticated)
- [ ] List permissions returns all 130 permissions
- [ ] List roles returns all 5 roles
- [ ] Get role permissions works
- [ ] Toggle permission (grant) works
- [ ] Toggle permission (revoke) works
- [ ] Create role works
- [ ] Update role works
- [ ] Delete role works
- [ ] System role protection works

### UI Tests
- [ ] Dashboard page loads
- [ ] Permissions page loads
- [ ] Select role works
- [ ] Expand/collapse groups works
- [ ] Search permissions works
- [ ] Toggle permission works
- [ ] Create role works
- [ ] Edit role works
- [ ] Delete role works
- [ ] System role protection in UI
- [ ] Toast notifications work
- [ ] Loading states work
- [ ] Responsive design works
- [ ] Error handling works

---

## 🐛 Bug Report Template

If you find bugs during testing, use this template:

```markdown
## Bug Report

**Date:** YYYY-MM-DD
**Tester:** Your Name
**Severity:** Critical | High | Medium | Low

### Description
Brief description of the bug

### Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

### Expected Behavior
What should happen

### Actual Behavior
What actually happens

### Screenshots/Logs
Attach any relevant screenshots or error logs

### Environment
- Browser: Chrome 120.0
- OS: macOS Sonoma
- Server: localhost:3013
```

---

## ✅ Success Criteria

The RBAC system passes testing when:

1. ✅ All database functions return correct results
2. ✅ All API endpoints return expected responses
3. ✅ All UI interactions work without errors
4. ✅ Permission checks correctly restrict access
5. ✅ System roles cannot be modified
6. ✅ Wildcard patterns work correctly
7. ✅ Toast notifications provide clear feedback
8. ✅ Loading states prevent duplicate actions
9. ✅ Responsive design works on mobile
10. ✅ Error handling gracefully handles failures

---

## 📝 Notes

- Test on multiple browsers (Chrome, Firefox, Safari)
- Test with different roles (super admin, company admin, artist)
- Test edge cases (deleting non-existent roles, duplicate names, etc.)
- Monitor browser console for errors
- Check network tab for failed requests
- Verify database changes persist correctly

---

**Created:** October 6, 2025
**Project:** MSC & Co Audiostems RBAC System
**Version:** 1.0
