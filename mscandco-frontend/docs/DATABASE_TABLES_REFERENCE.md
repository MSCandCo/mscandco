# Database Tables Reference Guide

**Last Updated:** November 2, 2025
**Total Tables:** 50+
**Database:** PostgreSQL 17 on Supabase

---

## 📊 Core Database Tables

### 👥 User Management (5 tables)

| Table | Purpose | Key Columns | Security |
|-------|---------|-------------|----------|
| **user_profiles** | Extended user info (locked fields after onboarding) | `id`, `email`, `role`, `first_name`, `last_name`, `immutableDataLocked` | RLS enabled, locked fields |
| **roles** | Role definitions | `id`, `name`, `description` | 5 roles: Artist, LabelAdmin, Admin, SuperAdmin, DistributionPartner |
| **permissions** | Granular permission definitions | `id`, `name`, `resource`, `action` | 200+ permissions |
| **role_permissions** | Role-to-permission mapping | `role_id`, `permission_id` | RBAC foundation |
| **user_permissions** | User-specific permission overrides | `user_id`, `permission_id`, `granted` | Individual grants/revokes |

**Purpose:** Complete RBAC (Role-Based Access Control) system with granular permissions

---

### 🎵 Content Management (5 tables)

| Table | Purpose | Key Columns | Features |
|-------|---------|-------------|----------|
| **releases** | Music releases/albums | `id`, `title`, `upc`, `status`, `release_date` | Status workflow, RLS policies |
| **tracks** | Individual songs | `id`, `release_id`, `isrc`, `duration`, `lyrics` | ISRC codes, audio files |
| **artists** | Artist roster | `id`, `name`, `bio`, `genre` | Profiles, social links |
| **labels** | Record label information | `id`, `name`, `country` | Label-artist relationships |
| **playlists** | Curated playlists | `id`, `name`, `user_id`, `tracks` | User collections |

**Purpose:** Complete music catalog management with metadata

---

### 💰 Financial (5 tables)

| Table | Purpose | Key Columns | Precision |
|-------|---------|-------------|-----------|
| **wallet_transactions** | All financial transactions | `id`, `user_id`, `amount`, `type`, `status` | DECIMAL(10,2) precision |
| **earnings** | Royalty earnings records | `id`, `user_id`, `platform`, `amount`, `period` | Platform breakdown |
| **revenue_reports** | Aggregated revenue data | `id`, `period`, `total_revenue`, `platform_breakdown` | Monthly/quarterly |
| **subscriptions** | User subscription plans | `id`, `user_id`, `tier`, `status`, `expires_at` | 4 tiers available |
| **split_configurations** | Revenue split rules | `id`, `release_id`, `label_split`, `artist_split` | Label partnerships |

**Purpose:** Single source of truth for all financial data with audit trail

---

### 📈 Analytics (3 tables)

| Table | Purpose | Key Columns | Integration |
|-------|---------|-------------|-------------|
| **analytics_events** | User activity tracking | `id`, `user_id`, `event`, `properties`, `timestamp` | PostHog integration |
| **stream_stats** | Streaming platform statistics | `id`, `track_id`, `platform`, `streams`, `date` | Real-time data |
| **dashboard_widgets** | Custom dashboard configurations | `id`, `user_id`, `widget_type`, `config` | User-configurable |

**Purpose:** Real-time analytics and user behavior tracking

---

### ⚙️ System & Administration (8 tables)

| Table | Purpose | Key Columns | Features |
|-------|---------|-------------|----------|
| **notifications** | In-app notifications | `id`, `user_id`, `type`, `message`, `read` | Real-time via Supabase Realtime |
| **audit_logs** | System activity audit trail | `id`, `user_id`, `action`, `resource`, `timestamp` | Security & compliance |
| **ghost_sessions** | Admin impersonation sessions | `id`, `admin_id`, `target_user_id`, `reason` | Support mode tracking |
| **profile_change_requests** | Profile change approval workflow | `id`, `user_id`, `field`, `old_value`, `new_value`, `status` | Admin review required |
| **onboarding_progress** | Apollo AI onboarding tracking | `id`, `user_id`, `step`, `completed`, `data` | Step-by-step progress |
| **webhook_logs** | External webhook event logs | `id`, `source`, `event`, `payload`, `status` | Integration monitoring |
| **label_artist_affiliations** | Label-Artist relationships | `id`, `label_id`, `artist_id`, `revenue_split` | Revenue sharing |
| **api_keys** | Developer API access | `id`, `user_id`, `key_hash`, `scopes`, `last_used` | API ecosystem |

**Purpose:** Platform administration, security, and integrations

---

## 🔐 Security Features

### Row-Level Security (RLS)

All tables implement PostgreSQL Row-Level Security policies:

```sql
-- Example: Artists can only view their own releases
CREATE POLICY "artists_own_releases" ON releases
  FOR SELECT USING (auth.uid() = user_id);

-- Label admins can view affiliated artist releases
CREATE POLICY "label_view_releases" ON releases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM label_artist_affiliations
      WHERE label_id = auth.uid()
        AND artist_id = releases.user_id
    )
  );
```

### Locked Fields

Critical personal information fields are **permanently locked** after Apollo AI onboarding:
- `first_name`, `last_name`
- `date_of_birth`
- `nationality`
- `city`, `postal_code`

**Changes require:** Profile Change Request → Admin Review → Approval

---

## 📋 Table Statistics

| Category | Tables | Total Rows (est.) | Growth Rate |
|----------|--------|-------------------|-------------|
| User Management | 5 | 100K+ | Medium |
| Content | 5 | 500K+ | High |
| Financial | 5 | 1M+ | Very High |
| Analytics | 3 | 10M+ | Extreme |
| System | 8 | 5M+ | High |
| **Total** | **26 core + 24 support** | **16M+** | **Variable** |

---

## 🔄 Table Relationships

```
┌─────────────────┐
│  user_profiles  │ (Central user data)
└────────┬────────┘
         │
    ┌────┴─────┬─────────┬──────────┬────────────┐
    │          │         │          │            │
    ▼          ▼         ▼          ▼            ▼
releases   earnings   wallet   subscriptions   notifications
    │
    └──► tracks ──► stream_stats

┌──────┐     ┌──────────────┐     ┌─────────────┐
│ roles│────►│role_permissions│────►│ permissions │
└──────┘     └──────────────┘     └─────────────┘
    │
    └──► user_profiles ──► user_permissions
```

---

## 🎯 Best Practices

### For Developers

1. **Always use RLS policies** - Never bypass with service role in client code
2. **Use prepared statements** - Prevent SQL injection
3. **Validate input** - Check data types and constraints
4. **Use transactions** - For multi-table operations
5. **Index frequently queried columns** - Improve performance

### For Administrators

1. **Monitor table growth** - Analytics tables grow fastest
2. **Regular backups** - Automated daily, verify weekly
3. **Review audit logs** - Check for suspicious activity
4. **Optimize queries** - Use EXPLAIN ANALYZE for slow queries
5. **Partition large tables** - Consider for analytics/logs

---

## 📚 Related Documentation

- **Full Schema:** `database/schema.sql`
- **RLS Policies:** `database/rls-policies.sql`
- **Migrations:** `database/migrations/`
- **Technical Docs:** `ULTIMATE_TECHNICAL_DOCUMENTATION.md`

---

**Note:** This is a living document. Table structures may evolve as the platform grows.
