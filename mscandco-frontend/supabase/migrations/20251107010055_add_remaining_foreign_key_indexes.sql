-- ============================================
-- Add Missing Foreign Key Indexes (Part 2)
-- Addresses remaining 23 unindexed foreign keys
-- ============================================

-- admin_notifications
CREATE INDEX IF NOT EXISTS idx_admin_notifications_user_id 
  ON admin_notifications(user_id);

-- affiliate_conversions
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_affiliate_link_id 
  ON affiliate_conversions(affiliate_link_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_referred_user_id 
  ON affiliate_conversions(referred_user_id);

-- api_key_usage
CREATE INDEX IF NOT EXISTS idx_api_key_usage_api_key_id 
  ON api_key_usage(api_key_id);

-- api_keys
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id 
  ON api_keys(user_id);

-- apollo_insights
CREATE INDEX IF NOT EXISTS idx_apollo_insights_user_id 
  ON apollo_insights(user_id);

-- artist_label_relationships
CREATE INDEX IF NOT EXISTS idx_artist_label_relationships_artist_id 
  ON artist_label_relationships(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_label_relationships_label_admin_id 
  ON artist_label_relationships(label_admin_id);

-- assets
CREATE INDEX IF NOT EXISTS idx_assets_project_id 
  ON assets(project_id);

-- dashboard_widgets
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_widget_type_id 
  ON dashboard_widgets(widget_type_id);

-- earnings_log
CREATE INDEX IF NOT EXISTS idx_earnings_log_artist_id 
  ON earnings_log(artist_id);

-- email_preferences_history
CREATE INDEX IF NOT EXISTS idx_email_preferences_history_user_id 
  ON email_preferences_history(user_id);

-- ghost_sessions
CREATE INDEX IF NOT EXISTS idx_ghost_sessions_admin_user_id 
  ON ghost_sessions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_ghost_sessions_target_user_id 
  ON ghost_sessions(target_user_id);

-- payout_requests
CREATE INDEX IF NOT EXISTS idx_payout_requests_user_id 
  ON payout_requests(user_id);

-- profile_change_requests
CREATE INDEX IF NOT EXISTS idx_profile_change_requests_user_id 
  ON profile_change_requests(user_id);

-- releases
CREATE INDEX IF NOT EXISTS idx_releases_company_admin_id 
  ON releases(company_admin_id);
CREATE INDEX IF NOT EXISTS idx_releases_distribution_partner_id 
  ON releases(distribution_partner_id);

-- role_dashboard_layouts
CREATE INDEX IF NOT EXISTS idx_role_dashboard_layouts_widget_id 
  ON role_dashboard_layouts(widget_id);

-- shared_earnings
CREATE INDEX IF NOT EXISTS idx_shared_earnings_affiliation_id 
  ON shared_earnings(affiliation_id);
CREATE INDEX IF NOT EXISTS idx_shared_earnings_original_earning_id 
  ON shared_earnings(original_earning_id);

-- user_dashboard_layouts
CREATE INDEX IF NOT EXISTS idx_user_dashboard_layouts_widget_id 
  ON user_dashboard_layouts(widget_id);

