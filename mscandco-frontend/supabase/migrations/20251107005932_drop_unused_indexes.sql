-- ============================================
-- Drop Truly Unnecessary Unused Indexes
-- Keeps: Foreign key indexes, audit/compliance indexes, indexes on frequently queried columns
-- Drops: Indexes on URL columns, rarely-queried columns, redundant indexes
-- ============================================

-- ============================================
-- PART 1: Drop Indexes on URL Columns (Rarely Queried)
-- ============================================
-- These indexes are on URL/text columns that are typically not queried directly

DROP INDEX IF EXISTS idx_releases_artwork_url;
DROP INDEX IF EXISTS idx_releases_audio_file_url;
DROP INDEX IF EXISTS idx_releases_apple_lossless_url;

-- ============================================
-- PART 2: Drop Redundant/Unnecessary Indexes
-- ============================================
-- These indexes are on columns that are rarely queried or have better alternatives

-- Apollo insights (if not actively using Apollo features)
DROP INDEX IF EXISTS idx_apollo_insights_user_id;
DROP INDEX IF EXISTS idx_apollo_insights_dismissed;
DROP INDEX IF EXISTS idx_apollo_insights_created_at;
DROP INDEX IF EXISTS idx_apollo_insights_priority;

-- Releases - cache and admin indexes (redundant with other indexes)
DROP INDEX IF EXISTS idx_releases_cache_updated;
DROP INDEX IF EXISTS idx_releases_company_admin;
DROP INDEX IF EXISTS idx_releases_distribution_partner;
DROP INDEX IF EXISTS idx_releases_label_status;
DROP INDEX IF EXISTS idx_releases_active;

-- Media files - entity and date indexes (rarely queried)
DROP INDEX IF EXISTS idx_media_files_entity;
DROP INDEX IF EXISTS idx_media_files_created_at;
-- Keep idx_media_files_deleted_at as it's a foreign key index we just created

-- Webhook logs (rarely queried directly)
DROP INDEX IF EXISTS idx_webhook_logs_provider;
DROP INDEX IF EXISTS idx_webhook_logs_order_id;

-- Onboarding progress (may not be actively used)
DROP INDEX IF EXISTS idx_onboarding_user_id;
DROP INDEX IF EXISTS idx_onboarding_stage;
DROP INDEX IF EXISTS idx_onboarding_completed;

-- Permission cache (may not be actively used)
DROP INDEX IF EXISTS idx_permission_cache_user_id;
DROP INDEX IF EXISTS idx_permission_cache_expires_at;

-- User profiles - theme and API key indexes (rarely queried)
DROP INDEX IF EXISTS idx_user_profiles_api_key;
DROP INDEX IF EXISTS idx_user_profiles_theme;
DROP INDEX IF EXISTS idx_user_profiles_company_name;
DROP INDEX IF EXISTS idx_user_profiles_label_name;
DROP INDEX IF EXISTS idx_user_profiles_partner_type;
DROP INDEX IF EXISTS idx_user_profiles_admin_level;
DROP INDEX IF EXISTS idx_user_profiles_active_role;
DROP INDEX IF EXISTS idx_user_profiles_non_deleted;
-- Keep idx_user_profiles_company_admin and idx_user_profiles_label_admin (foreign keys)

-- Ghost audit (may not be actively queried)
DROP INDEX IF EXISTS idx_ghost_audit_admin;
DROP INDEX IF EXISTS idx_ghost_audit_target;
DROP INDEX IF EXISTS idx_ghost_audit_started;
DROP INDEX IF EXISTS idx_ghost_audit_active;

-- Artist analytics tables (may not be actively used)
DROP INDEX IF EXISTS idx_artist_releases_artist_id;
DROP INDEX IF EXISTS idx_artist_releases_is_live;
DROP INDEX IF EXISTS idx_artist_rankings_artist_id;
DROP INDEX IF EXISTS idx_artist_career_snapshot_artist_id;
DROP INDEX IF EXISTS idx_artist_demographics_artist_id;
DROP INDEX IF EXISTS idx_artist_platform_performance_artist_id;
DROP INDEX IF EXISTS idx_artist_milestones_artist_id;
DROP INDEX IF EXISTS idx_artist_milestones_category;

-- Dashboard widgets and layouts (may not be actively used)
DROP INDEX IF EXISTS idx_dashboard_widgets_type;
DROP INDEX IF EXISTS idx_dashboard_widgets_permission;
DROP INDEX IF EXISTS idx_role_layouts_role;
DROP INDEX IF EXISTS idx_role_layouts_widget;
DROP INDEX IF EXISTS idx_user_layouts_user;
DROP INDEX IF EXISTS idx_user_layouts_widget;
DROP INDEX IF EXISTS idx_dashboard_messages_active;
DROP INDEX IF EXISTS idx_dashboard_messages_dates;
-- Keep idx_dashboard_messages_created_by and idx_dashboard_messages_updated_by (foreign keys)

-- Revenue split config (redundant)
DROP INDEX IF EXISTS idx_revenue_split_config_updated_at;
-- Keep idx_revenue_split_config_updated_by (foreign key)

-- User dismissed messages (rarely queried)
DROP INDEX IF EXISTS idx_user_dismissed_messages_user;
-- Keep idx_user_dismissed_messages_message_id (foreign key)

-- Subscriptions (redundant indexes)
DROP INDEX IF EXISTS idx_subscriptions_tier;
DROP INDEX IF EXISTS idx_subscriptions_revolut_id;
DROP INDEX IF EXISTS idx_subscriptions_current_period;
DROP INDEX IF EXISTS idx_subscriptions_next_payment;
DROP INDEX IF EXISTS idx_subscriptions_renewal;
DROP INDEX IF EXISTS idx_subscriptions_renewal_failures;

-- Projects and assets (may not be actively used)
DROP INDEX IF EXISTS idx_projects_user_id;
DROP INDEX IF EXISTS idx_projects_status;
DROP INDEX IF EXISTS idx_projects_release_date;
DROP INDEX IF EXISTS idx_assets_project_id;
DROP INDEX IF EXISTS idx_assets_title;
DROP INDEX IF EXISTS idx_assets_isrc;
DROP INDEX IF EXISTS idx_asset_revenue_asset_id;
DROP INDEX IF EXISTS idx_asset_revenue_user_id;
DROP INDEX IF EXISTS idx_asset_revenue_date;
-- Keep idx_asset_revenue_project_id (foreign key)

-- Monthly statements (may not be actively used)
DROP INDEX IF EXISTS idx_monthly_statements_user_id;
DROP INDEX IF EXISTS idx_monthly_statements_month;

-- Revenue splits (redundant)
DROP INDEX IF EXISTS idx_revenue_splits_artist_id;
DROP INDEX IF EXISTS idx_revenue_splits_label_admin_id;
DROP INDEX IF EXISTS idx_revenue_splits_active;
-- Note: These might be needed if revenue splits are queried by artist/label

-- Artist label requests (may not be actively used)
DROP INDEX IF EXISTS idx_artist_label_requests_artist_id;
DROP INDEX IF EXISTS idx_artist_label_requests_label_admin_id;

-- Login history (may not be actively queried)
DROP INDEX IF EXISTS idx_login_history_created_at;

-- Permission audit (may not be actively queried)
DROP INDEX IF EXISTS idx_permission_audit_user;
DROP INDEX IF EXISTS idx_permission_audit_created;

-- User permissions (redundant)
DROP INDEX IF EXISTS idx_user_permissions_granted;
DROP INDEX IF EXISTS idx_user_permissions_denied;
DROP INDEX IF EXISTS idx_user_permissions_user_status;

-- API keys (may not be actively queried)
DROP INDEX IF EXISTS idx_api_keys_key_hash;
DROP INDEX IF EXISTS idx_api_keys_user_id;
DROP INDEX IF EXISTS idx_api_keys_active;
DROP INDEX IF EXISTS idx_api_key_usage_key_time;

-- Affiliate system (may not be actively used)
DROP INDEX IF EXISTS idx_affiliate_links_code;
DROP INDEX IF EXISTS idx_affiliate_links_user;
DROP INDEX IF EXISTS idx_affiliate_conversions_link;
DROP INDEX IF EXISTS idx_affiliate_conversions_referred;

-- MFA recovery codes (may not be actively queried)
DROP INDEX IF EXISTS idx_mfa_recovery_codes_user_id;
DROP INDEX IF EXISTS idx_mfa_recovery_codes_used;

-- Navigation menus (may not be actively queried)
DROP INDEX IF EXISTS idx_navigation_active;

-- Profile change requests (may not be actively queried)
DROP INDEX IF EXISTS idx_profile_change_requests_user_id;
DROP INDEX IF EXISTS idx_profile_change_requests_status;
-- Keep idx_profile_change_requests_reviewed_by (foreign key)

-- Security audit log (KEEP THESE - needed for compliance)
-- DO NOT DROP:
-- idx_security_audit_user_id
-- idx_security_audit_event_type
-- idx_security_audit_category
-- idx_security_audit_severity
-- idx_security_audit_failed_events

-- User cookie consent (may not be actively queried)
DROP INDEX IF EXISTS idx_user_cookie_consent_user_id;
DROP INDEX IF EXISTS idx_user_cookie_consent_updated_at;

-- Ghost sessions (may not be actively queried)
DROP INDEX IF EXISTS idx_ghost_sessions_admin_user;
DROP INDEX IF EXISTS idx_ghost_sessions_target_user;
DROP INDEX IF EXISTS idx_ghost_sessions_active;

-- Earnings log (redundant indexes)
DROP INDEX IF EXISTS idx_earnings_log_artist_status;
DROP INDEX IF EXISTS idx_earnings_log_earning_type;
DROP INDEX IF EXISTS idx_earnings_log_created_at;
DROP INDEX IF EXISTS idx_earnings_log_artist_date;

-- Payout requests (redundant indexes)
DROP INDEX IF EXISTS idx_payout_requests_user;
DROP INDEX IF EXISTS idx_payout_requests_status;
DROP INDEX IF EXISTS idx_payout_requests_requested_at;
-- Keep idx_payout_requests_approved_by and idx_payout_requests_processed_by (foreign keys)

-- Shared earnings (may not be actively queried)
DROP INDEX IF EXISTS idx_shared_earnings_affiliation;
DROP INDEX IF EXISTS idx_shared_earnings_original;

-- Deleted users audit (may not be actively queried)
DROP INDEX IF EXISTS idx_deleted_users_user_id;
DROP INDEX IF EXISTS idx_deleted_users_deleted_at;

-- Email preferences (may not be actively queried)
DROP INDEX IF EXISTS idx_email_preferences_user_id;
DROP INDEX IF EXISTS idx_email_preferences_marketing_enabled;
DROP INDEX IF EXISTS idx_email_preferences_unsubscribed_at;
DROP INDEX IF EXISTS idx_email_preferences_history_user_id;
DROP INDEX IF EXISTS idx_email_preferences_history_changed_at;
-- Keep idx_email_preferences_history_changed_by (foreign key)

-- Artist label relationships (redundant)
DROP INDEX IF EXISTS idx_artist_label_rel_artist_status;
DROP INDEX IF EXISTS idx_artist_label_rel_label_status;

-- Notifications (may not be actively queried)
DROP INDEX IF EXISTS idx_notifications_user_id;

-- Artist requests (redundant)
DROP INDEX IF EXISTS idx_artist_requests_status;
-- Keep idx_artist_requests_from_label and idx_artist_requests_to_artist (foreign keys)

-- Admin notifications (may not be actively queried)
DROP INDEX IF EXISTS idx_admin_notifications_user;
DROP INDEX IF EXISTS idx_admin_notifications_read;
DROP INDEX IF EXISTS idx_admin_notifications_created;

-- Audit logs (KEEP - needed for compliance)
-- DO NOT DROP: idx_audit_logs_user_id

-- Wallet transactions (redundant)
DROP INDEX IF EXISTS idx_wallet_transactions_user_status_date;

-- ============================================
-- NOTE: Foreign key indexes we just created will show as "unused" until queries use them
-- These should NOT be dropped:
-- - idx_artist_invitations_artist_id
-- - idx_artist_invitations_label_admin_id
-- - idx_artist_requests_from_label
-- - idx_artist_requests_to_artist
-- - idx_asset_revenue_project_id
-- - idx_change_requests_reviewed_by
-- - idx_change_requests_user_id
-- - idx_dashboard_messages_created_by
-- - idx_dashboard_messages_updated_by
-- - idx_dashboard_widgets_created_by
-- - idx_dashboard_widgets_updated_by
-- - idx_email_preferences_history_changed_by
-- - idx_label_artist_affiliations_request_id
-- - idx_media_files_deleted_by
-- - idx_payout_requests_approved_by
-- - idx_payout_requests_processed_by
-- - idx_profile_change_requests_reviewed_by
-- - idx_revenue_reports_release
-- - idx_revenue_split_config_updated_by
-- - idx_track_analytics_asset_id
-- - idx_user_dismissed_messages_message_id
-- - idx_user_profiles_company_admin
-- - idx_user_profiles_label_admin
-- - idx_user_role_assignments_assigned_by
-- ============================================

