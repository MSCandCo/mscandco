# Company Admin Pages Archive

**Date Archived:** October 6, 2025
**Reason:** Systematic rebuild - establishing proper permission/approval architecture
**Archived By:** Claude Code

---

## 📦 Archived Pages (13 files)

### Main Pages (`pages/companyadmin/_archived/`)

1. **dashboard.js** (20KB)
   - Main Company Admin dashboard
   - Features: Overview stats, quick actions, user activity
   - Dependencies: /api/companyadmin/dashboard-stats

2. **dashboard-new.js** (20KB)
   - Alternative dashboard implementation
   - Duplicate of dashboard.js (same size/content)
   - **Note:** Consider removing duplicate during rebuild

3. **users.js** (14KB)
   - User management interface
   - Features: User list, filtering, permissions
   - Dependencies: /api/companyadmin/user-management

4. **users-old.js** (43KB)
   - Legacy user management (largest archived file)
   - **Note:** Likely contains useful patterns/logic to extract

5. **artist-requests.js** (20KB)
   - Artist affiliation request management
   - Features: Approve/reject artist requests, onboarding
   - Dependencies: /api/companyadmin/artist-requests

6. **profile-requests.js** (18KB)
   - Profile change request management
   - Features: Review and approve profile field changes
   - **Important:** Relates to profile change request system

7. **requests.js** (28KB)
   - General request management dashboard
   - Features: All request types, unified interface
   - May consolidate artist-requests and profile-requests

8. **content.js** (15KB)
   - Content management and moderation
   - Features: Content approval, moderation queue
   - Dependencies: Content tables

9. **analytics-management.js** (18KB)
   - Analytics and reporting dashboard
   - Features: Revenue reports, user metrics, trends
   - Dependencies: Analytics data

10. **payout-requests.js** (20KB)
    - Payout request management
    - Features: Review and approve payout requests
    - Dependencies: /api/companyadmin/finance, payment tables

11. **earnings-management.js** (30KB)
    - Earnings tracking and management
    - Features: Earnings breakdown, distributions
    - Dependencies: Financial data, earnings tables

12. **distribution.js** (18KB)
    - Distribution workflow management
    - Features: Queue management, status tracking
    - Dependencies: Distribution partner systems

13. **approvals.js** (15KB)
    - General approval workflow system
    - Features: Multi-type approval interface
    - May consolidate various approval types

### Subdirectories

- **profile/** - Profile management directory (preserved structure)

---

## 🔌 Archived API Routes (6 files)

### API Routes (`pages/api/companyadmin/_archived/`)

1. **dashboard-stats.js** (12KB)
   - Dashboard statistics endpoint
   - GET endpoint returning metrics, user counts, recent activity
   - **Features:** Real-time stats, caching

2. **artist-requests.js** (11KB)
   - Artist request management API
   - GET (list), PUT (approve/reject)
   - **Features:** Status updates, notifications

3. **user-management.js** (12KB)
   - User CRUD operations
   - GET (list/search), POST (create), PUT (update), DELETE (remove)
   - **Features:** Filtering, pagination, role assignment

4. **finance.js** (15KB - largest API)
   - Financial operations endpoint
   - GET (reports), POST (transactions), PUT (approve payments)
   - **Features:** Payment processing, revenue tracking

5. **revenue-splits.js** (4KB)
   - Revenue split calculations
   - GET (calculate splits), POST (apply splits)
   - **Features:** Percentage calculations, distribution

6. **profile.js** (2KB)
   - Company Admin profile management
   - GET (fetch profile), PUT (update profile)
   - **Features:** Personal settings, preferences

---

## 🚫 Navigation Changes

### Updated Files:
- `components/auth/RoleBasedNavigation.js`
  - Desktop navigation: Commented out 7 main routes
  - Mobile navigation: Commented out 7 main routes
  - Added "Company Admin Dashboard Under Rebuild" placeholder

### Removed Navigation Links:
- ❌ `/companyadmin/users`
- ❌ `/companyadmin/artist-requests`
- ❌ `/companyadmin/content`
- ❌ `/companyadmin/analytics-management`
- ❌ `/companyadmin/payout-requests`
- ❌ `/companyadmin/earnings-management`
- ❌ `/companyadmin/distribution`

### Preserved Navigation Links:
- ✅ `/dashboard` (main dashboard - role-agnostic)
- ✅ `/companyadmin/profile` (user dropdown)
- ✅ `/companyadmin/messages` (user dropdown)

---

## 🔄 Restoration Instructions

### To Restore All Pages:
```bash
mv pages/companyadmin/_archived/*.js pages/companyadmin/
mv pages/api/companyadmin/_archived/*.js pages/api/companyadmin/
```

### To Restore a Single Page:
```bash
# Example: Restore users.js
mv pages/companyadmin/_archived/users.js pages/companyadmin/

# Then uncomment navigation link in RoleBasedNavigation.js (lines ~607-650)
```

### After Restoration:
1. Uncomment relevant navigation links in `components/auth/RoleBasedNavigation.js`
2. Test the restored page
3. Verify API dependencies are working
4. Update this manifest to reflect restoration

---

## 📊 Archive Statistics

| Metric | Count |
|--------|-------|
| Pages Archived | 13 |
| API Routes Archived | 6 |
| Total Files | 19 |
| Combined Page Size | ~300KB |
| Combined API Size | ~57KB |
| Navigation Links Removed | 7 |

---

## 🎯 Rebuild Strategy

### Phase 1: Core Foundation ✅
- ✅ Archive existing pages (COMPLETE)
- ✅ Preserve navigation structure (COMPLETE)
- ✅ Document what was archived (COMPLETE)

### Phase 2: Permission Architecture (Next)

**Key Question:** What can Company Admin approve/manage?

Company Admin should have permission to:
1. ✅ **Profile Change Requests** - Approve/reject locked field changes
2. ✅ **Artist Affiliation Requests** - Approve artists joining labels
3. ✅ **Payout Requests** - Approve/reject payout requests
4. ✅ **Content Moderation** - Approve/flag content
5. ✅ **User Management** - Create/edit/disable users
6. ✅ **Analytics Access** - View revenue and user metrics
7. ✅ **Distribution Workflow** - Manage distribution queue

### Phase 3: Unified Request Dashboard

**Design Goal:** Single dashboard for all approval types

```
┌─────────────────────────────────────┐
│  Company Admin Dashboard            │
├─────────────────────────────────────┤
│                                     │
│  📋 Pending Requests (15)           │
│  ├─ Profile Changes (5)             │
│  ├─ Artist Affiliations (3)         │
│  ├─ Payout Requests (7)             │
│  └─ Content Flags (0)               │
│                                     │
│  👥 User Management                 │
│  📊 Analytics & Reports             │
│  💰 Financial Overview              │
│  🔄 Distribution Status             │
│                                     │
└─────────────────────────────────────┘
```

### Phase 4: Implementation

1. **Create unified requests dashboard** - `/companyadmin/dashboard`
2. **Build request detail pages** - `/companyadmin/requests/[type]/[id]`
3. **Implement approval workflows** - Consistent approve/reject pattern
4. **Add user management** - `/companyadmin/users`
5. **Build analytics page** - `/companyadmin/analytics`
6. **Add financial dashboard** - `/companyadmin/finance`

---

## 🔍 Code to Extract from Archived Files

### Useful Patterns in Archived Code:

1. **users-old.js** (43KB)
   - User search/filter logic
   - Permission assignment patterns
   - RBAC integration examples

2. **requests.js** (28KB)
   - Unified request interface
   - Tabbed navigation for request types
   - Approval workflow patterns

3. **earnings-management.js** (30KB)
   - Financial calculations
   - Revenue breakdown displays
   - Chart/graph components

4. **finance.js API** (15KB)
   - Payment processing logic
   - Transaction handling
   - Security patterns

---

## 📝 Notes & Observations

### Duplicates Found:
- `dashboard.js` and `dashboard-new.js` are identical (20KB each)
- **Recommendation:** Use only one during rebuild

### Profile Change Requests:
- `profile-requests.js` exists but may be redundant
- Already have `/admin/change-requests` page (working)
- **Decision:** Consider consolidating to single admin-level page

### Request Types:
Multiple request management pages suggest need for:
- Unified request management system
- Consistent approval patterns
- Centralized notification system

### API Organization:
API routes are well-organized by function:
- Dashboard stats separate from business logic
- Finance operations isolated
- User management standalone
- **Benefit:** Easy to restore individual features

---

## 🔗 Related Documentation

- Super Admin Archive: `/pages/superadmin/_archived/MANIFEST.md`
- Profile Change Requests: `/PROFILE_CHANGE_REQUEST_AUDIT.md`
- Admin Change Requests: `/pages/admin/change-requests.js` (active)
- RBAC System: `/lib/rbac/`

---

## 🎨 Design Principles for Rebuild

### 1. Permission-First Architecture
- Define clear RBAC permissions for each action
- Use middleware consistently
- Document permission requirements

### 2. Unified Request Management
- Single dashboard for all request types
- Consistent approval workflow
- Real-time updates

### 3. Mobile-Responsive
- All pages must work on mobile
- Touch-friendly interfaces
- Responsive tables/charts

### 4. Performance Optimized
- Lazy load data
- Efficient queries
- Caching where appropriate

### 5. Well-Documented
- Clear API documentation
- Inline code comments
- User guides

---

## ✅ Quality Checklist for Rebuild

Before restoring/rebuilding any page:
- [ ] Define required RBAC permissions
- [ ] Create API endpoint documentation
- [ ] Build mobile-responsive UI
- [ ] Implement error handling
- [ ] Add loading states
- [ ] Write E2E tests
- [ ] Document user workflows
- [ ] Review security implications
- [ ] Test with real data
- [ ] Get user feedback

---

## 🚀 Next Steps

1. **Design Permission Matrix**
   - Map all Company Admin actions to permissions
   - Define approval workflows
   - Document requirements

2. **Build Unified Dashboard**
   - Start with `/companyadmin/dashboard`
   - Integrate request counts
   - Add quick actions

3. **Implement Request Management**
   - Create `/companyadmin/requests` page
   - Support all request types
   - Consistent approve/reject flow

4. **Add User Management**
   - Create `/companyadmin/users` page
   - User search and filtering
   - Role assignment

5. **Deploy Systematically**
   - One feature at a time
   - Test thoroughly
   - Document as you go

---

**Archive Status:** ✅ COMPLETE
**Next Action:** Design Company Admin permission matrix
**Last Updated:** October 6, 2025

---

## 📞 Support & Restoration

For questions about archived code or restoration:
1. Review this manifest
2. Check individual file comments
3. Reference related documentation
4. Test in development first

**Remember:** All code is preserved and can be restored anytime!
