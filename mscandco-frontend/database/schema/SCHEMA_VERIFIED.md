# Database Schema - Complete Structure

## Core Tables

### user_profiles
- **Purpose**: Core user information for all user types
- **Columns**:
  - `id` UUID PRIMARY KEY
  - `email` TEXT UNIQUE NOT NULL
  - `role` TEXT NOT NULL (artist, label_admin, company_admin, super_admin, distribution_partner)
  - `first_name` TEXT
  - `last_name` TEXT
  - `artist_name` TEXT (stage/professional name)
  - `display_name` TEXT
  - `custom_admin_title` TEXT
  - `company_name` TEXT
  - `phone` TEXT
  - `country_code` TEXT DEFAULT '+44'
  - `country` TEXT
  - `city` TEXT
  - `nationality` TEXT
  - `artist_type` TEXT
  - `primary_genre` TEXT
  - `secondary_genre` TEXT
  - `years_active` TEXT
  - `record_label` TEXT
  - `bio` TEXT
  - `subscription_tier` TEXT
  - `subscription_status` TEXT DEFAULT 'inactive'
  - `subscription_expires_at` TIMESTAMP
  - `analytics_data` JSONB (manual analytics from admin)
  - `earnings_data` JSONB (earnings summaries)
  - `label_admin_id` UUID (current managing label)
  - `company_admin_id` UUID
  - `default_label_admin_id` UUID
  - `created_at` TIMESTAMP DEFAULT NOW()
  - `updated_at` TIMESTAMP DEFAULT NOW()
  - `last_active_at` TIMESTAMP DEFAULT NOW()
- **RLS Policies**:
  - `allow_authenticated_read`: All authenticated users can read profiles
  - `users_update_own_profile`: Users can update their own profile
  - `service_role_all_access`: Service role has full access

### artist_invitations
- **Purpose**: Track label admin invitations to artists for partnership
- **Columns**:
  - `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
  - `label_admin_id` UUID REFERENCES user_profiles(id)
  - `artist_id` UUID REFERENCES user_profiles(id)
  - `artist_first_name` TEXT
  - `artist_last_name` TEXT
  - `artist_search_name` TEXT
  - `personal_message` TEXT
  - `label_split_percentage` NUMERIC(5,2)
  - `artist_split_percentage` NUMERIC(5,2)
  - `status` TEXT DEFAULT 'pending' (pending/accepted/declined/cancelled)
  - `created_at` TIMESTAMP DEFAULT NOW()
  - `responded_at` TIMESTAMP
  - `response_note` TEXT
- **RLS Policies**:
  - `invitations_read_involved_users`: Users can read invitations where they are label_admin OR artist
  - `invitations_service_role_access`: Service role full access

### artist_label_relationships
- **Purpose**: Active artist-label partnerships after invitation accepted
- **Columns**:
  - `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
  - `artist_id` UUID REFERENCES user_profiles(id)
  - `label_admin_id` UUID REFERENCES user_profiles(id)
  - `label_split_percentage` NUMERIC(5,2)
  - `artist_split_percentage` NUMERIC(5,2)
  - `status` TEXT DEFAULT 'active' (active/inactive)
  - `created_at` TIMESTAMP DEFAULT NOW()
- **RLS Policies**: TBD - service role access for now

### earnings_log
- **Purpose**: Individual earnings records for artists
- **Columns**:
  - `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
  - `artist_id` UUID REFERENCES user_profiles(id)
  - `amount` NUMERIC(10,2) NOT NULL
  - `currency` VARCHAR(3) DEFAULT 'GBP'
  - `earning_type` VARCHAR(50) NOT NULL (streaming, sync, performance, mechanical, download, other)
  - `platform` VARCHAR(50) (Spotify, Apple Music, Netflix, etc.)
  - `territory` VARCHAR(50)
  - `status` VARCHAR(20) DEFAULT 'pending' (pending, processing, paid, held, disputed)
  - `payment_date` DATE
  - `period_start` DATE
  - `period_end` DATE
  - `notes` TEXT
  - `created_at` TIMESTAMP DEFAULT NOW()
  - `created_by` UUID (admin who added the entry)
- **RLS Policies**:
  - Users can read their own earnings
  - Admins can read all earnings
  - Service role full access

### artist_wallet_summary (VIEW - READ ONLY)
- **Purpose**: Real-time calculated wallet balances from earnings_log
- **Columns** (all calculated):
  - `artist_id` UUID
  - `available_balance` NUMERIC (earnings with status='paid' and no payment_date)
  - `pending_balance` NUMERIC (earnings with status='pending')
  - `held_balance` NUMERIC (earnings with status='held')
  - `total_earned` NUMERIC (sum of all earnings)
  - `total_entries` BIGINT (count of earnings records)
  - `last_updated` TIMESTAMP (most recent earnings entry)
- **Important**: This is a DATABASE VIEW - cannot INSERT/UPDATE directly
- **Updates automatically** when earnings_log changes

### wallet_transactions
- **Purpose**: Ledger of all wallet activity (earnings, payouts, adjustments)
- **Columns**:
  - `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
  - `user_id` UUID NOT NULL REFERENCES user_profiles(id)
  - `type` TEXT NOT NULL (earning, payout, adjustment, refund)
  - `amount` NUMERIC NOT NULL
  - `currency` TEXT DEFAULT 'GBP'
  - `description` TEXT NOT NULL
  - `reference_id` UUID (links to earnings_log or other source)
  - `reference_type` TEXT (e.g., 'earning', 'payout_request')
  - `status` TEXT DEFAULT 'completed'
  - `created_at` TIMESTAMP DEFAULT NOW()
  - `processed_at` TIMESTAMP DEFAULT NOW()
- **RLS Policies**: Users read own transactions, service role full access

### releases
- **Purpose**: Music release information and distribution management
- **Columns**:
  - `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
  - `artist_id` UUID NOT NULL REFERENCES user_profiles(id)
  - `label_admin_id` UUID REFERENCES user_profiles(id)
  - `title` TEXT NOT NULL
  - `artist_name` TEXT NOT NULL
  - `release_type` TEXT NOT NULL (single, ep, album)
  - `genre` TEXT
  - `subgenre` TEXT
  - `release_date` DATE
  - `artwork_url` TEXT
  - `audio_file_url` TEXT
  - `audio_file_name` TEXT
  - `duration_seconds` INTEGER
  - `explicit_content` BOOLEAN DEFAULT false
  - `isrc` TEXT
  - `upc` TEXT
  - `catalog_number` TEXT
  - `copyright_holder` TEXT
  - `publishing_info` TEXT
  - `territories` ARRAY (deprecated - use distribution_territories)
  - `distribution_territories` JSONB
  - `status` TEXT DEFAULT 'draft' (draft, submitted, approved, live)
  - `submission_date` TIMESTAMP
  - `approval_date` TIMESTAMP
  - `go_live_date` TIMESTAMP
  - `revenue_split` JSONB (split percentages if label managed)
  - `platform_stats` JSONB (manual analytics data)
  - `created_at` TIMESTAMP DEFAULT NOW()
  - `updated_at` TIMESTAMP DEFAULT NOW()
- **RLS Policies**:
  - Artists manage their own releases
  - Label admins view affiliated artist releases
  - Service role full access

### subscriptions
- **Purpose**: User subscription tracking (Artist Starter/Pro tiers)
- **Columns**:
  - `id` UUID PRIMARY KEY
  - `user_id` UUID REFERENCES user_profiles(id)
  - `tier` VARCHAR(20) (artist_starter, artist_pro)
  - `status` VARCHAR(20) (active, cancelled, expired)
  - `amount` DECIMAL(10,2)
  - `currency` VARCHAR(3)
  - `billing_cycle` VARCHAR(20) (monthly, yearly)
  - `current_period_end` TIMESTAMP
  - `created_at` TIMESTAMP
- **RLS Policies**: Users read own subscriptions, service role full access

## Additional Tables (Exist but Not Actively Used)

The following tables exist in the database but may not be actively used in current features:
- `artist_career_snapshot`
- `artist_demographics`
- `artist_label_requests`
- `artist_milestones`
- `artist_platform_performance`
- `artist_rankings`
- `artist_releases` (different from `releases`)
- `artist_requests`
- `asset_revenue`
- `assets`
- `change_requests`
- `email_verification_codes`
- `monthly_statements`
- `permission_definitions`
- `profile_change_requests`
- `projects`
- `revenue_reports`
- `revenue_split_config`
- `revenue_splits`
- `track_analytics`
- `user_backup_codes`
- `user_permissions`
- `user_role_assignments`
- `user_roles`
- `webhook_logs`

## API Patterns

### Authentication Strategy
- **Frontend**: Supabase auth with JWT tokens
- **Backend APIs**: Use `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS
- **Pattern**: Frontend → API endpoint → Service role database access
- **Benefit**: Eliminates permission errors, simplifies auth logic

### Service Role Usage
- **All `/api/` endpoints** use service_role key
- **Bypasses RLS policies** completely
- **Critical**: Never expose service_role key to frontend
- **Import pattern**:
```javascript
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Backend only
);
```
