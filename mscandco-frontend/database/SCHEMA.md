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
  - `id` UUID PRIMARY KEY
  - `label_admin_id` UUID REFERENCES user_profiles(id)
  - `artist_id` UUID REFERENCES user_profiles(id)
  - `artist_first_name` TEXT
  - `artist_last_name` TEXT
  - `artist_search_name` TEXT
  - `personal_message` TEXT
  - `label_split_percentage` DECIMAL(5,2) (e.g., 30.00 for 30%)
  - `artist_split_percentage` DECIMAL(5,2) (e.g., 70.00 for 70%)
  - `status` TEXT DEFAULT 'pending' (pending/accepted/declined/cancelled)
  - `created_at` TIMESTAMP DEFAULT NOW()
  - `responded_at` TIMESTAMP
  - `response_note` TEXT
- **RLS Policies**:
  - `label_admins_read_own_invitations`: Label admins can read their sent invitations
  - `artists_read_own_invitations`: Artists can read invitations sent to them
  - Service role access for APIs

### artist_label_relationships
- **Purpose**: Active artist-label partnerships after invitation accepted
- **Columns**:
  - `id` UUID PRIMARY KEY
  - `artist_id` UUID REFERENCES user_profiles(id)
  - `label_admin_id` UUID REFERENCES user_profiles(id)
  - `label_split_percentage` DECIMAL(5,2)
  - `artist_split_percentage` DECIMAL(5,2)
  - `status` TEXT DEFAULT 'active' (active/inactive)
  - `created_at` TIMESTAMP DEFAULT NOW()
- **RLS Policies**:
  - Policies to be created for relationship access
  - Service role access for APIs

### earnings_log
- **Purpose**: Individual earnings records for artists
- **Columns**:
  - `id` UUID PRIMARY KEY
  - `artist_id` UUID REFERENCES user_profiles(id)
  - `amount` DECIMAL(10,2)
  - `currency` VARCHAR(3) DEFAULT 'GBP'
  - `platform` VARCHAR(50) (Spotify, Apple Music, etc.)
  - `territory` VARCHAR(50)
  - `earning_type` VARCHAR(50) (streaming, download, etc.)
  - `date_earned` DATE
  - `status` VARCHAR(20) (pending, paid, available)
  - `payment_date` DATE
  - `created_at` TIMESTAMP DEFAULT NOW()
- **RLS Policies**:
  - `earnings_read_own`: Artists can read their own earnings
  - `earnings_admin_access`: Admins can read all earnings
  - Service role full access

### artist_wallet_summary (VIEW)
- **Purpose**: Calculated view of artist wallet balances
- **Calculation**:
  - `available_balance`: SUM of 'paid' status earnings
  - `pending_balance`: SUM of 'pending' status positive earnings
  - `total_earned`: SUM of all positive earnings
- **Based on**: earnings_log table

### releases
- **Purpose**: Music release information
- **Columns**:
  - `id` UUID PRIMARY KEY
  - `artist_id` UUID REFERENCES user_profiles(id)
  - `artist_name` TEXT
  - `title` TEXT
  - `release_type` VARCHAR(20) (single, ep, album)
  - `genre` TEXT
  - `subgenre` TEXT
  - `release_date` DATE
  - `status` VARCHAR(20) (draft, submitted, approved, live)
  - `upc` TEXT
  - `isrc` TEXT
  - `territories` JSONB (territory restrictions)
  - `publishing_info` JSONB (complete form data storage)
  - `created_at` TIMESTAMP
  - `updated_at` TIMESTAMP
- **RLS Policies**:
  - Artists can manage their own releases
  - Label admins can view affiliated artist releases
  - Service role full access

### subscriptions
- **Purpose**: User subscription tracking (Artist Pro, etc.)
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
- **RLS Policies**:
  - Users can read their own subscriptions
  - Service role full access

## API Patterns

### Authentication
- **Frontend**: Uses Supabase auth with JWT tokens
- **Backend APIs**: Use service_role key to bypass RLS
- **Pattern**: Frontend calls APIs, APIs use service role for database access

### Service Role Usage
- **Purpose**: Bypass RLS policies for complex queries
- **Used in**: All /api/ endpoints
- **Key**: `SUPABASE_SERVICE_ROLE_KEY`
- **Benefits**: No permission errors, full database access

### RLS Policy Structure
- **User Access**: `auth.uid() = user_id` for own data
- **Role-based Access**: Check role in user_profiles table
- **Admin Access**: super_admin and company_admin get full access
- **Service Role**: Bypasses all policies

## Development Notes

### Current User IDs
- **Henry Taylor (Artist)**: `0a060de5-1c94-4060-a1c2-860224fc348d`
- **Label Admin**: `12345678-1234-5678-9012-123456789012`
- **Frontend User ID**: `c47cc6e8-8e4a-4b8a-9f1e-2c7d8b9e0f3a`

### Working APIs
- `/api/artist/releases` - Artist releases list
- `/api/artist/wallet-simple` - Artist wallet data
- `/api/labeladmin/invitations` - Label admin invitations
- `/api/labeladmin/send-invitation` - Create new invitations
- `/api/artists/search` - Search artist profiles

### RLS Bypass Strategy
- Frontend components call APIs instead of direct Supabase
- APIs use service_role key for database operations
- Eliminates permission errors and auth complexity

### wallet_transactions
- **Purpose**: Ledger of all wallet activity (earnings added, payouts sent, adjustments)
- **Columns**:
  - `id` UUID PRIMARY KEY
  - `user_id` UUID NOT NULL (artist receiving/sending)
  - `type` TEXT NOT NULL (earning, payout, adjustment, refund)
  - `amount` NUMERIC NOT NULL
  - `currency` TEXT DEFAULT 'GBP'
  - `description` TEXT NOT NULL
  - `reference_id` UUID (links to earnings_log or other source)
  - `reference_type` TEXT (e.g., 'earning', 'payout_request')
  - `status` TEXT DEFAULT 'completed'
  - `created_at` TIMESTAMP
  - `processed_at` TIMESTAMP
- **RLS Policies**: Users can read their own transactions, service role full access

## Additional Table Details

### releases (ADDITIONAL DETAILS)
- **Key columns for label integration**:
  - `label_admin_id` UUID - Links release to managing label admin
  - `revenue_split` JSONB - Stores split percentages
  - `platform_stats` JSONB - Manual analytics data storage
  - `status` TEXT - draft, submitted, approved, live

### user_profiles (ADDITIONAL DETAILS)
- **Analytics/Earnings columns**:
  - `analytics_data` JSONB - Manual analytics from admin
  - `earnings_data` JSONB - Earnings summaries
  - `label_admin_id` UUID - Current managing label admin
  - `default_label_admin_id` UUID - Default label relationship

## Future Considerations
- Implement proper JWT verification in production
- Add more granular RLS policies as needed
- Consider caching for frequently accessed data
- Add audit logging for sensitive operations
