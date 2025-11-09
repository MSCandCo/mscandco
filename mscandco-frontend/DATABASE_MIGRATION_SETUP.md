# Database Migration Setup Guide

## ✅ **Environment Variables Status**

**Already Configured in Vercel:**
- ✅ `CRON_SECRET` - Set 15 days ago (Development, Preview, Production)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Set 79 days ago (Development, Preview, Production)

**No action needed for environment variables!**

---

## 🔧 **Database Migration Required**

You need to run the migration to create the `increment_release_counters()` RPC function.

### **Migration File:**
`supabase/migrations/20251109000002_add_increment_counters_rpc.sql`

### **What This Migration Does:**
Creates a PostgreSQL function that atomically increments:
- `releases_this_year` by 1
- `tracks_this_year` by track count
- `updated_at` timestamp

This function is used by the tier enforcement middleware when releases are created.

---

## 📋 **Step-by-Step Instructions**

### **Option 1: Supabase Dashboard (Recommended)**

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `mscandco` (or your project name)

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and Paste the Migration**
   - Open the file: `supabase/migrations/20251109000002_add_increment_counters_rpc.sql`
   - Copy the entire contents
   - Paste into the SQL Editor

4. **Run the Migration**
   - Click "Run" or press `Cmd+Enter` (Mac) / `Ctrl+Enter` (Windows)
   - You should see: "Success. No rows returned"

5. **Verify the Function Was Created**
   - Run this query to verify:
   ```sql
   SELECT proname, prosrc 
   FROM pg_proc 
   WHERE proname = 'increment_release_counters';
   ```
   - You should see the function listed

---

### **Option 2: Supabase CLI (If you have it installed)**

```bash
cd "/Users/htay/Documents/MSC & Co/mscandco-frontend"
supabase db push
```

---

## ✅ **Verification**

After running the migration, test it:

```sql
-- Test the function (replace with a real user_id UUID)
SELECT increment_release_counters('your-user-id-here'::UUID, 2);

-- Check if counters were incremented
SELECT releases_this_year, tracks_this_year 
FROM user_profiles 
WHERE id = 'your-user-id-here'::UUID;
```

---

## 🚨 **If Migration Fails**

**Error: "function already exists"**
- This is OK! The function already exists, you can skip this step.

**Error: "permission denied"**
- Make sure you're using the SQL Editor with proper permissions
- Or use the Supabase CLI with service role key

**Error: "relation user_profiles does not exist"**
- The main migration (`20251109000001_add_pricing_tiers_and_limits.sql`) hasn't been run yet
- Run that migration first!

---

## 📝 **Migration Content**

Here's what will be created:

```sql
CREATE OR REPLACE FUNCTION increment_release_counters(
    p_user_id UUID,
    p_track_count INT DEFAULT 0
)
RETURNS void AS $$
BEGIN
    UPDATE user_profiles
    SET
        releases_this_year = releases_this_year + 1,
        tracks_this_year = tracks_this_year + p_track_count,
        updated_at = NOW()
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_release_counters(UUID, INT) TO authenticated;
```

---

## ✅ **After Migration**

Once the migration is complete:
1. ✅ Tier enforcement will work properly
2. ✅ Release creation will increment counters
3. ✅ Free tier limits will be enforced
4. ✅ Everything will be production-ready!

---

**Status**: Environment variables ✅ | Database migration ⚠️ **NEEDS TO BE RUN**

