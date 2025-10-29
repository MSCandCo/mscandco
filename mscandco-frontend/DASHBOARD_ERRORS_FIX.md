# 🔧 Dashboard Errors Fix Guide

## Critical Issues Found:

### 1. ✅ 403 Forbidden Errors (RLS Policies)
**Status**: SQL script created → `database/fix-dashboard-rls.sql`

**Action Required**:
1. Go to Supabase SQL Editor
2. Run the script: `database/fix-dashboard-rls.sql`
3. This will fix RLS policies for:
   - notifications
   - user_permissions
   - permissions
   - releases
   - earnings_log
   - revenue_reports
   - onboarding_progress

---

### 2. ⚠️ 404 Not Found Errors

#### A. Missing `/api/acceber/onboarding` endpoint
**Problem**: Dashboard is calling an API that doesn't exist
**Fix**: Remove or create the endpoint

**Quick Fix** (Remove the call):
- The onboarding check in DashboardClient.js should use direct Supabase query (already does)
- This 404 might be from ApolloOnboarding component
- **Safe to ignore** if onboarding works

#### B. Missing `/videos/yhwh-track.webm`
**Problem**: Video file doesn't exist
**Fix**: Either upload the video or remove the reference

**Quick Fix** (Remove reference):
- Find where this video is referenced
- Either upload the video to `/public/videos/` or remove the video element

---

### 3. ⚠️ Warnings (Non-Critical)

#### Multiple GoTrueClient instances
**Problem**: Multiple Supabase client instances
**Impact**: Minor - may cause undefined behavior
**Fix**: Consolidate to single client instance (low priority)

#### Preload warnings
**Problem**: Resources preloaded but not used immediately
**Impact**: Minor - affects initial load performance
**Fix**: Remove unused preloads or defer loading (low priority)

---

## 🚀 Priority Fix Order:

1. **CRITICAL** (Do Now): Run `fix-dashboard-rls.sql` in Supabase
2. **HIGH** (Optional): Remove video reference if not needed
3. **LOW** (Later): Fix preload warnings
4. **LOW** (Later): Consolidate Supabase clients

---

## 🧪 Testing After Fix:

1. Run the RLS SQL script
2. Hard refresh dashboard: `Cmd + Shift + R`
3. Check console - 403 errors should be gone
4. Dashboard should load instantly
5. Wallet balance should show £70.02

---

## 📊 Expected Result:

**Before**:
- ❌ 403 errors
- ❌ Infinite spinner
- ❌ Slow loading

**After**:
- ✅ No 403 errors
- ✅ Dashboard loads in <2 seconds
- ✅ All data displays correctly

