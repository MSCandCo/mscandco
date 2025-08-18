-- =====================================================
-- ADD MISSING TYPES AND POLICIES
-- Based on investigation of what's actually missing
-- =====================================================

-- =============================================================================
-- CREATE MISSING ENUM TYPES
-- =============================================================================

DO $$ 
BEGIN
    -- Create all enum types that might be missing
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('artist', 'label_admin', 'company_admin', 'super_admin', 'distribution_partner');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_plan') THEN
        CREATE TYPE subscription_plan AS ENUM ('Artist Starter', 'Artist Pro', 'Label Admin Starter', 'Label Admin Pro', 'Company Admin', 'Distribution Partner');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'release_status') THEN
        CREATE TYPE release_status AS ENUM ('draft', 'submitted', 'in_review', 'approved', 'rejected', 'published', 'live');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_status') THEN
        CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'format_type') THEN
        CREATE TYPE format_type AS ENUM ('wav', 'mp3', 'flac', 'aiff');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_type') THEN
        CREATE TYPE product_type AS ENUM ('single', 'ep', 'album', 'compilation');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'publishing_type') THEN
        CREATE TYPE publishing_type AS ENUM ('original', 'cover', 'remix', 'live');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'release_workflow_status') THEN
        CREATE TYPE release_workflow_status AS ENUM ('artist_draft', 'submitted_to_label', 'label_review', 'submitted_to_distribution', 'distribution_review', 'completed', 'live');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'business_type') THEN
        CREATE TYPE business_type AS ENUM ('sole_proprietorship', 'partnership', 'llc', 'corporation', 'non_profit');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
        CREATE TYPE payment_method AS ENUM ('revolut', 'wallet', 'bank_transfer');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'change_request_type') THEN
        CREATE TYPE change_request_type AS ENUM ('metadata', 'artwork', 'audio', 'credits', 'urgent');
    END IF;
END $$;

-- =============================================================================
-- ENABLE RLS ON ALL TABLES
-- =============================================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- CREATE MISSING RLS POLICIES
-- =============================================================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own artist profile" ON public.artists;
DROP POLICY IF EXISTS "Users can read their own artist profile" ON public.artists;
DROP POLICY IF EXISTS "Users can update their own artist profile" ON public.artists;
DROP POLICY IF EXISTS "Users can manage their own releases" ON public.releases;
DROP POLICY IF EXISTS "Users can manage their own change requests" ON public.change_requests;
DROP POLICY IF EXISTS "Users can read their own revenue" ON public.revenue_distributions;
DROP POLICY IF EXISTS "Users can read their own wallet transactions" ON public.wallet_transactions;
DROP POLICY IF EXISTS "Users can insert their own wallet transactions" ON public.wallet_transactions;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can insert their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for artists
CREATE POLICY "Users can insert their own artist profile" ON public.artists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own artist profile" ON public.artists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own artist profile" ON public.artists
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for releases
CREATE POLICY "Users can manage their own releases" ON public.releases
  FOR ALL USING (auth.uid() = artist_id);

-- Create RLS policies for change_requests (using correct column name 'requested_by')
CREATE POLICY "Users can manage their own change requests" ON public.change_requests
  FOR ALL USING (auth.uid() = requested_by);

-- Create RLS policies for revenue_distributions
CREATE POLICY "Users can read their own revenue" ON public.revenue_distributions
  FOR SELECT USING (auth.uid() = artist_id OR auth.uid() = label_admin_id OR auth.uid() = company_admin_id);

-- Create RLS policies for wallet_transactions
CREATE POLICY "Users can read their own wallet transactions" ON public.wallet_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wallet transactions" ON public.wallet_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

SELECT 'All missing types and policies added successfully!' as status;
