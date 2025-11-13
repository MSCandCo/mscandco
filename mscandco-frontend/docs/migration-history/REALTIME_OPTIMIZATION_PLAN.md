-- ============================================
-- Optimize Realtime Subscriptions
-- This document outlines the fixes needed in code
-- ============================================

-- ISSUES FOUND:
-- 1. Multiple subscriptions to 'notifications' table (4 different places)
-- 2. Using 'event: *' (all events) instead of specific events
-- 3. Subscriptions triggering full data reloads
-- 4. No debouncing/throttling

-- FIXES NEEDED:
-- 1. Consolidate notification subscriptions to single global provider
-- 2. Change 'event: *' to 'event: INSERT' where possible
-- 3. Remove subscriptions that trigger full reloads
-- 4. Add debouncing for frequent updates

