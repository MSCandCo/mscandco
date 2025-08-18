-- Check what already exists in the database to avoid conflicts

-- Check existing types
SELECT typname, typtype 
FROM pg_type 
WHERE typname IN ('user_role', 'platform_user_role', 'subscription_tier', 'registration_stage', 'artist_type', 'contract_status', 'release_status', 'release_type', 'transaction_type', 'change_request_status', 'relationship_status')
ORDER BY typname;

-- Check existing tables
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_profiles', 'projects', 'assets', 'wallet_transactions', 'asset_revenue', 'monthly_statements', 'subscriptions', 'email_verification_codes', 'user_backup_codes', 'profile_change_requests', 'artist_label_requests', 'revenue_splits')
ORDER BY tablename;

-- Check existing functions
SELECT proname 
FROM pg_proc 
WHERE proname IN ('check_release_limit', 'check_artist_limit', 'generate_backup_codes', 'update_updated_at', 'update_auto_save')
ORDER BY proname;
