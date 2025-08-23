-- MSC & Co - CORRECTED BUSINESS WORKFLOW SCHEMA (Fixed for existing database)
-- Handles existing types and tables gracefully

-- =============================================================================
-- CORE TYPES AND ENUMS (Updated for Business Flow) - Handle Existing Types
-- =============================================================================

-- Drop and recreate types only if they don't exist or need updates
DO $$ 
BEGIN
    -- Check if user_role type exists and has all needed values
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('artist', 'label_admin', 'company_admin', 'super_admin', 'distribution_partner');
    END IF;
    
    -- Create new types
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_plan') THEN
        CREATE TYPE subscription_plan AS ENUM ('Artist Starter', 'Artist Pro', 'Label Admin Starter', 'Label Admin Pro', 'Company Admin', 'Distribution Partner');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'release_status') THEN
        CREATE TYPE release_status AS ENUM ('draft', 'submitted', 'in_review', 'completed', 'live', 'change_requested');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_status') THEN
        CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'release_type') THEN
        CREATE TYPE release_type AS ENUM ('single', 'ep', 'album', 'mixtape', 'compilation', 'remix', 'live_album', 'soundtrack');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_type') THEN
        CREATE TYPE product_type AS ENUM ('audio', 'video', 'bundle');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'format_type') THEN
        CREATE TYPE format_type AS ENUM ('digital', 'vinyl', 'cd', 'cassette', 'streaming_only');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'publishing_type') THEN
        CREATE TYPE publishing_type AS ENUM ('exclusive', 'co_publishing', 'administration', 'sub_publishing');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'business_type') THEN
        CREATE TYPE business_type AS ENUM ('individual', 'company', 'label', 'partnership', 'corporation');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
        CREATE TYPE payment_method AS ENUM ('revolut', 'wallet', 'bank_transfer');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'change_request_type') THEN
        CREATE TYPE change_request_type AS ENUM ('metadata', 'artwork', 'audio', 'credits', 'urgent');
    END IF;
END $$;

-- =============================================================================
-- ADD MISSING COLUMNS TO EXISTING USER_PROFILES TABLE
-- =============================================================================

-- Add missing columns to existing user_profiles table
DO $$ 
BEGIN
    -- IMMUTABLE DATA (From Registration Step 4)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'immutable_data_locked') THEN
        ALTER TABLE public.user_profiles ADD COLUMN immutable_data_locked BOOLEAN DEFAULT false;
    END IF;
    
    -- Business Information
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'company_name') THEN
        ALTER TABLE public.user_profiles ADD COLUMN company_name VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'business_type') THEN
        ALTER TABLE public.user_profiles ADD COLUMN business_type business_type;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'position') THEN
        ALTER TABLE public.user_profiles ADD COLUMN position VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'department') THEN
        ALTER TABLE public.user_profiles ADD COLUMN department VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'office_address') THEN
        ALTER TABLE public.user_profiles ADD COLUMN office_address TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'tax_id') THEN
        ALTER TABLE public.user_profiles ADD COLUMN tax_id VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'vat_number') THEN
        ALTER TABLE public.user_profiles ADD COLUMN vat_number VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'registration_number') THEN
        ALTER TABLE public.user_profiles ADD COLUMN registration_number VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'founded_year') THEN
        ALTER TABLE public.user_profiles ADD COLUMN founded_year VARCHAR(4);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'timezone') THEN
        ALTER TABLE public.user_profiles ADD COLUMN timezone VARCHAR(50);
    END IF;
    
    -- Label-Specific Fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'label_name') THEN
        ALTER TABLE public.user_profiles ADD COLUMN label_name VARCHAR(255);
    END IF;
    
    -- Banking Information
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'revolut_account_id') THEN
        ALTER TABLE public.user_profiles ADD COLUMN revolut_account_id VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'bank_account_name') THEN
        ALTER TABLE public.user_profiles ADD COLUMN bank_account_name VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'bank_account_number') THEN
        ALTER TABLE public.user_profiles ADD COLUMN bank_account_number VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'bank_routing_number') THEN
        ALTER TABLE public.user_profiles ADD COLUMN bank_routing_number VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'bank_name') THEN
        ALTER TABLE public.user_profiles ADD COLUMN bank_name VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'bank_swift_code') THEN
        ALTER TABLE public.user_profiles ADD COLUMN bank_swift_code VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'bank_iban') THEN
        ALTER TABLE public.user_profiles ADD COLUMN bank_iban VARCHAR(50);
    END IF;
    
    -- Professional Network
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'manager_name') THEN
        ALTER TABLE public.user_profiles ADD COLUMN manager_name VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'manager_email') THEN
        ALTER TABLE public.user_profiles ADD COLUMN manager_email VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'manager_phone') THEN
        ALTER TABLE public.user_profiles ADD COLUMN manager_phone VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'booking_agent') THEN
        ALTER TABLE public.user_profiles ADD COLUMN booking_agent VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'publicist') THEN
        ALTER TABLE public.user_profiles ADD COLUMN publicist VARCHAR(255);
    END IF;
    
    -- Music Information
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'secondary_genres') THEN
        ALTER TABLE public.user_profiles ADD COLUMN secondary_genres JSONB DEFAULT '[]';
    END IF;
    
    -- Hierarchical Relationships (Corrected Business Flow)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'has_label_admin') THEN
        ALTER TABLE public.user_profiles ADD COLUMN has_label_admin BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'label_admin_id') THEN
        ALTER TABLE public.user_profiles ADD COLUMN label_admin_id UUID REFERENCES public.user_profiles(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'company_admin_id') THEN
        ALTER TABLE public.user_profiles ADD COLUMN company_admin_id UUID REFERENCES public.user_profiles(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'default_label_admin_id') THEN
        ALTER TABLE public.user_profiles ADD COLUMN default_label_admin_id UUID REFERENCES public.user_profiles(id);
    END IF;
    
    -- Avatar URL
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE public.user_profiles ADD COLUMN avatar_url TEXT;
    END IF;
    
    -- Profile Status Tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'profile_completed') THEN
        ALTER TABLE public.user_profiles ADD COLUMN profile_completed BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'registration_completed') THEN
        ALTER TABLE public.user_profiles ADD COLUMN registration_completed BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'email_verified') THEN
        ALTER TABLE public.user_profiles ADD COLUMN email_verified BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'phone_verified') THEN
        ALTER TABLE public.user_profiles ADD COLUMN phone_verified BOOLEAN DEFAULT false;
    END IF;
    
    -- Wallet System
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'wallet_balance') THEN
        ALTER TABLE public.user_profiles ADD COLUMN wallet_balance DECIMAL(12,4) DEFAULT 0.0000;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'wallet_enabled') THEN
        ALTER TABLE public.user_profiles ADD COLUMN wallet_enabled BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'negative_balance_allowed') THEN
        ALTER TABLE public.user_profiles ADD COLUMN negative_balance_allowed BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'wallet_credit_limit') THEN
        ALTER TABLE public.user_profiles ADD COLUMN wallet_credit_limit DECIMAL(12,4) DEFAULT 0.0000;
    END IF;
    
    -- Subscription & Payment
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'revolut_subscription_active') THEN
        ALTER TABLE public.user_profiles ADD COLUMN revolut_subscription_active BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'last_subscription_payment') THEN
        ALTER TABLE public.user_profiles ADD COLUMN last_subscription_payment DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'next_subscription_due') THEN
        ALTER TABLE public.user_profiles ADD COLUMN next_subscription_due DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'preferred_payment_method') THEN
        ALTER TABLE public.user_profiles ADD COLUMN preferred_payment_method payment_method DEFAULT 'revolut';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'auto_pay_from_wallet') THEN
        ALTER TABLE public.user_profiles ADD COLUMN auto_pay_from_wallet BOOLEAN DEFAULT false;
    END IF;
    
    -- System Fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'permissions') THEN
        ALTER TABLE public.user_profiles ADD COLUMN permissions JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'join_date') THEN
        ALTER TABLE public.user_profiles ADD COLUMN join_date DATE DEFAULT CURRENT_DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'last_login') THEN
        ALTER TABLE public.user_profiles ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- =============================================================================
-- UPDATE EXISTING ARTISTS TABLE
-- =============================================================================

-- Add missing columns to existing artists table
DO $$ 
BEGIN
    -- Revenue Split Configuration
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'artist_revenue_percentage') THEN
        ALTER TABLE public.artists ADD COLUMN artist_revenue_percentage DECIMAL(5,2) DEFAULT 70.00;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'label_revenue_percentage') THEN
        ALTER TABLE public.artists ADD COLUMN label_revenue_percentage DECIMAL(5,2) DEFAULT 20.00;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'company_revenue_percentage') THEN
        ALTER TABLE public.artists ADD COLUMN company_revenue_percentage DECIMAL(5,2) DEFAULT 10.00;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'custom_split_enabled') THEN
        ALTER TABLE public.artists ADD COLUMN custom_split_enabled BOOLEAN DEFAULT false;
    END IF;
    
    -- Relationships
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'label_admin_id') THEN
        ALTER TABLE public.artists ADD COLUMN label_admin_id UUID REFERENCES public.user_profiles(id);
    END IF;
END $$;

-- =============================================================================
-- UPDATE EXISTING RELEASES TABLE FOR BUSINESS WORKFLOW
-- =============================================================================

-- Add missing columns to existing releases table
DO $$ 
BEGIN
    -- Workflow Routing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'has_label_admin') THEN
        ALTER TABLE public.releases ADD COLUMN has_label_admin BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'label_admin_id') THEN
        ALTER TABLE public.releases ADD COLUMN label_admin_id UUID REFERENCES public.user_profiles(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'company_admin_id') THEN
        ALTER TABLE public.releases ADD COLUMN company_admin_id UUID REFERENCES public.user_profiles(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'distribution_partner_id') THEN
        ALTER TABLE public.releases ADD COLUMN distribution_partner_id UUID REFERENCES public.user_profiles(id);
    END IF;
    
    -- Workflow Status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'workflow_step') THEN
        ALTER TABLE public.releases ADD COLUMN workflow_step VARCHAR(50) DEFAULT 'artist_creation';
    END IF;
    
    -- Auto-save Tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'last_auto_save') THEN
        ALTER TABLE public.releases ADD COLUMN last_auto_save TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'auto_save_enabled') THEN
        ALTER TABLE public.releases ADD COLUMN auto_save_enabled BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'manual_save_count') THEN
        ALTER TABLE public.releases ADD COLUMN manual_save_count INTEGER DEFAULT 0;
    END IF;
    
    -- Change Request System
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'artist_can_edit') THEN
        ALTER TABLE public.releases ADD COLUMN artist_can_edit BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'pending_change_requests') THEN
        ALTER TABLE public.releases ADD COLUMN pending_change_requests INTEGER DEFAULT 0;
    END IF;
    
    -- DSP Information
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'dsp_sent_date') THEN
        ALTER TABLE public.releases ADD COLUMN dsp_sent_date TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- All Distribution Partner Fields (Add the comprehensive fields)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'catalogue_no') THEN
        ALTER TABLE public.releases ADD COLUMN catalogue_no VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'barcode') THEN
        ALTER TABLE public.releases ADD COLUMN barcode VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'tunecode') THEN
        ALTER TABLE public.releases ADD COLUMN tunecode VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'ice_work_key') THEN
        ALTER TABLE public.releases ADD COLUMN ice_work_key VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'iswc') THEN
        ALTER TABLE public.releases ADD COLUMN iswc VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'isrc') THEN
        ALTER TABLE public.releases ADD COLUMN isrc VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'upc') THEN
        ALTER TABLE public.releases ADD COLUMN upc VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'bowi') THEN
        ALTER TABLE public.releases ADD COLUMN bowi VARCHAR(50);
    END IF;
    
    -- Add remaining Distribution Partner fields (continuing from the comprehensive list)
    -- Publishing fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'composer_author') THEN
        ALTER TABLE public.releases ADD COLUMN composer_author VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'pro') THEN
        ALTER TABLE public.releases ADD COLUMN pro VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'cae_ipi') THEN
        ALTER TABLE public.releases ADD COLUMN cae_ipi VARCHAR(50);
    END IF;
    
    -- Audio Information
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'duration') THEN
        ALTER TABLE public.releases ADD COLUMN duration VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'bpm') THEN
        ALTER TABLE public.releases ADD COLUMN bpm INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'song_key') THEN
        ALTER TABLE public.releases ADD COLUMN song_key VARCHAR(10);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'explicit') THEN
        ALTER TABLE public.releases ADD COLUMN explicit BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'language') THEN
        ALTER TABLE public.releases ADD COLUMN language VARCHAR(50) DEFAULT 'English';
    END IF;
    
    -- Revenue Split (Per Release)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'artist_percentage') THEN
        ALTER TABLE public.releases ADD COLUMN artist_percentage DECIMAL(5,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'label_percentage') THEN
        ALTER TABLE public.releases ADD COLUMN label_percentage DECIMAL(5,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'company_percentage') THEN
        ALTER TABLE public.releases ADD COLUMN company_percentage DECIMAL(5,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'distribution_partner_percentage') THEN
        ALTER TABLE public.releases ADD COLUMN distribution_partner_percentage DECIMAL(5,2) DEFAULT 10.00;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'use_custom_split') THEN
        ALTER TABLE public.releases ADD COLUMN use_custom_split BOOLEAN DEFAULT false;
    END IF;
    
    -- Workflow Audit Trail
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'submitted_by') THEN
        ALTER TABLE public.releases ADD COLUMN submitted_by UUID REFERENCES public.user_profiles(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'submitted_at') THEN
        ALTER TABLE public.releases ADD COLUMN submitted_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'reviewed_by') THEN
        ALTER TABLE public.releases ADD COLUMN reviewed_by UUID REFERENCES public.user_profiles(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'reviewed_at') THEN
        ALTER TABLE public.releases ADD COLUMN reviewed_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'approved_by') THEN
        ALTER TABLE public.releases ADD COLUMN approved_by UUID REFERENCES public.user_profiles(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'approved_at') THEN
        ALTER TABLE public.releases ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'processed_by') THEN
        ALTER TABLE public.releases ADD COLUMN processed_by UUID REFERENCES public.user_profiles(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'processed_at') THEN
        ALTER TABLE public.releases ADD COLUMN processed_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'completed_by') THEN
        ALTER TABLE public.releases ADD COLUMN completed_by UUID REFERENCES public.user_profiles(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'completed_at') THEN
        ALTER TABLE public.releases ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'live_at') THEN
        ALTER TABLE public.releases ADD COLUMN live_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- System Fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'workflow_history') THEN
        ALTER TABLE public.releases ADD COLUMN workflow_history JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'file_urls') THEN
        ALTER TABLE public.releases ADD COLUMN file_urls JSONB DEFAULT '{}';
    END IF;
END $$;

-- =============================================================================
-- CREATE NEW TABLES (Only if they don't exist)
-- =============================================================================

-- Change Requests Table
CREATE TABLE IF NOT EXISTS public.change_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  release_id UUID REFERENCES public.releases(id) ON DELETE CASCADE,
  
  -- Request Details
  requested_by UUID REFERENCES public.user_profiles(id),
  request_type change_request_type,
  field_name VARCHAR(255),
  current_value TEXT,
  requested_value TEXT,
  reason TEXT,
  urgency_level INTEGER DEFAULT 1,
  
  -- Approval Chain
  status VARCHAR(50) DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.user_profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wallet Transactions Table
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id),
  
  -- Transaction Details
  transaction_type VARCHAR(50),
  amount DECIMAL(12,4),
  balance_before DECIMAL(12,4),
  balance_after DECIMAL(12,4),
  
  -- Source Information
  source_type VARCHAR(50),
  source_reference_id VARCHAR(255),
  
  -- Revenue Source
  release_id UUID REFERENCES public.releases(id),
  revenue_period_start DATE,
  revenue_period_end DATE,
  platform VARCHAR(100),
  
  -- Payment Processing
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  external_transaction_id VARCHAR(255),
  
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription Payments Table
CREATE TABLE IF NOT EXISTS public.subscription_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id),
  
  -- Payment Details
  amount DECIMAL(8,2),
  payment_method payment_method,
  payment_source VARCHAR(50),
  
  -- Payment Status
  status VARCHAR(50) DEFAULT 'pending',
  revolut_transaction_id VARCHAR(255),
  wallet_transaction_id UUID REFERENCES public.wallet_transactions(id),
  
  -- Subscription Details
  plan subscription_plan,
  billing_period_start DATE,
  billing_period_end DATE,
  
  -- Failure Handling
  failure_reason TEXT,
  retry_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Revenue Distribution Table
CREATE TABLE IF NOT EXISTS public.revenue_distributions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  release_id UUID REFERENCES public.releases(id),
  
  -- Revenue Recipients
  artist_id UUID REFERENCES public.artists(id),
  label_admin_id UUID REFERENCES public.user_profiles(id),
  company_admin_id UUID REFERENCES public.user_profiles(id),
  
  -- Gross Revenue (Before Distribution Partner Cut)
  gross_revenue DECIMAL(12,4),
  distribution_partner_amount DECIMAL(12,4),
  
  -- Net Revenue (After Distribution Partner Cut = 100% for splits)
  net_revenue DECIMAL(12,4),
  
  -- Revenue Breakdown (From the net_revenue)
  artist_amount DECIMAL(12,4),
  label_amount DECIMAL(12,4),
  company_amount DECIMAL(12,4),
  
  -- Split Percentages Used
  artist_percentage DECIMAL(5,2),
  label_percentage DECIMAL(5,2),
  company_percentage DECIMAL(5,2),
  
  -- Reporting Period
  period_start DATE,
  period_end DATE,
  platform VARCHAR(100),
  
  -- Processing Status
  processed BOOLEAN DEFAULT false,
  processed_by UUID REFERENCES public.user_profiles(id),
  processed_at TIMESTAMP WITH TIME ZONE,
  
  -- Wallet Integration
  artist_wallet_credited BOOLEAN DEFAULT false,
  label_wallet_credited BOOLEAN DEFAULT false,
  company_wallet_credited BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- CREATE MISSING INDEXES
-- =============================================================================

-- Create indexes only if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_profiles_label_admin_id') THEN
        CREATE INDEX idx_user_profiles_label_admin_id ON public.user_profiles(label_admin_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_profiles_company_admin_id') THEN
        CREATE INDEX idx_user_profiles_company_admin_id ON public.user_profiles(company_admin_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_profiles_immutable_locked') THEN
        CREATE INDEX idx_user_profiles_immutable_locked ON public.user_profiles(immutable_data_locked);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_releases_workflow_step') THEN
        CREATE INDEX idx_releases_workflow_step ON public.releases(workflow_step);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_releases_artist_can_edit') THEN
        CREATE INDEX idx_releases_artist_can_edit ON public.releases(artist_can_edit);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_releases_auto_save') THEN
        CREATE INDEX idx_releases_auto_save ON public.releases(last_auto_save);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_change_requests_release_id') THEN
        CREATE INDEX idx_change_requests_release_id ON public.change_requests(release_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_wallet_transactions_user_id') THEN
        CREATE INDEX idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);
    END IF;
END $$;

-- =============================================================================
-- ENABLE RLS ON NEW TABLES
-- =============================================================================

ALTER TABLE public.change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_distributions ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- CREATE BUSINESS WORKFLOW FUNCTIONS
-- =============================================================================

-- Auto-save function for releases
CREATE OR REPLACE FUNCTION public.auto_save_release()
RETURNS TRIGGER AS $$
BEGIN
  -- Only auto-save if status is draft and auto_save is enabled
  IF NEW.status = 'draft' AND NEW.auto_save_enabled = true THEN
    NEW.last_auto_save = NOW();
  END IF;
  
  -- Update artist_can_edit based on status
  IF NEW.status IN ('in_review', 'completed', 'live') THEN
    NEW.artist_can_edit = false;
  ELSIF NEW.status = 'draft' THEN
    NEW.artist_can_edit = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Profile sync function
CREATE OR REPLACE FUNCTION public.sync_profile_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Update artists table when user_profiles changes
  UPDATE public.artists 
  SET updated_at = NOW()
  WHERE user_id = NEW.id;
  
  -- Update any releases with updated artist name
  UPDATE public.releases 
  SET artist_name = CONCAT(NEW.first_name, ' ', NEW.last_name)
  WHERE artist_id IN (
    SELECT id FROM public.artists WHERE user_id = NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- CREATE TRIGGERS
-- =============================================================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_auto_save_release ON public.releases;
DROP TRIGGER IF EXISTS trigger_sync_profile_data ON public.user_profiles;

-- Create triggers
CREATE TRIGGER trigger_auto_save_release
  BEFORE UPDATE ON public.releases
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_save_release();

CREATE TRIGGER trigger_sync_profile_data
  AFTER UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_data();

-- =============================================================================
-- INSERT DEFAULT LABEL ADMIN
-- =============================================================================

-- Insert default label admin for artists without dedicated labels
INSERT INTO public.user_profiles (
  role, 
  first_name, 
  last_name, 
  label_name, 
  company_name,
  display_name,
  email,
  registration_completed
) 
VALUES (
  'label_admin', 
  'Default', 
  'Label Admin', 
  'MSC & Co Default Label', 
  'MSC & Co Ltd',
  'MSC & Co Default Label',
  'default-label@mscandco.com',
  true
)
ON CONFLICT DO NOTHING;
