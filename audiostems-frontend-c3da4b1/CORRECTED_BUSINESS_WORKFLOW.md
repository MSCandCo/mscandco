# MSC & Co - CORRECTED BUSINESS WORKFLOW

## ✅ REGISTRATION INTEGRATION (Step 4)

**Registration Step 4 → Database Integration:**
- ✅ **Immutable Data**: First name, last name, DOB, nationality, country, city
- ✅ **Auto-Population**: `user_profiles` → `artists` → `releases` (artist name)
- ✅ **One Edit = Everywhere**: When immutable data edited, syncs across ALL tables
- ✅ **Locked After Setup**: `immutable_data_locked = true` prevents changes

## 📋 RELEASE CREATION WORKFLOW

### Artist Release Process:
1. **Create Release** → Status: `DRAFT`
2. **Auto-save** → Every few seconds automatically
3. **Fill Forms** → Can be completed now or before first release
4. **Submit** → Routes based on label admin status

### Routing Logic:
```
Artist Submit → Has Label Admin?
├── YES → Label Admin → Company Admin → Distribution Partner
└── NO → Default Label Admin → Company Admin → Distribution Partner
```

## 🏷️ LABEL ADMIN CAPABILITIES

**Label Admin Powers:**
- ✅ **Create releases as any approved artist** under their label
- ✅ **See all label artist releases**
- ✅ **Approval system**: Company Admin/Super Admin approves artists under label
- ✅ **Same workflow**: Label Admin submissions follow same approval chain

## 📡 DISTRIBUTION PARTNER WORKFLOW

### Status Progression:
1. **DRAFT** → Artist/Label Admin can edit freely
2. **SUBMITTED** → Sent to Distribution Partner  
3. **IN_REVIEW** → DP fills missing fields, artist can only request changes
4. **COMPLETED** → DP marks ready, sent to DSP
5. **LIVE** → On streaming platforms, artist can only request changes

### Change Request System:
- ✅ **Request Table**: `change_requests` for when artist can't edit
- ✅ **Types**: metadata, artwork, audio, credits, urgent
- ✅ **Approval**: Distribution Partner reviews and approves/rejects

## 💰 REVENUE DISTRIBUTION (Corrected)

### Distribution Partner Cut:
- ✅ **10% Off The Top**: Distribution Partner takes 10% immediately
- ✅ **Remaining = 100%**: The net revenue becomes the "100%" for splits

### Flexible Revenue Splits (Per Artist):
```sql
-- Default splits (after DP 10% removed):
artist_percentage: 70%    -- Of the net 100%
label_percentage: 20%     -- Of the net 100%  
company_percentage: 10%   -- Of the net 100%

-- Example: $1000 gross revenue
-- DP takes: $100 (10%)
-- Net revenue: $900 (this becomes 100% for splits)
-- Artist gets: $630 (70% of $900)
-- Label gets: $180 (20% of $900)
-- Company gets: $90 (10% of $900)
```

### Revenue Table Features:
- ✅ **Per-artist customization**: Each artist can have different splits
- ✅ **Per-release override**: Can customize splits per release
- ✅ **Default label handling**: Artists without dedicated label use default label admin

## 💳 WALLET & SUBSCRIPTION SYSTEM

### Wallet Integration:
- ✅ **Revenue Deposits**: Streaming money goes to wallet
- ✅ **Subscription Payments**: Can pay from wallet or Revolut
- ✅ **Negative Balance**: Some artists can go negative (special permission)
- ✅ **Auto-pay**: Wallet can auto-pay subscriptions

### Payment Methods:
- ✅ **Revolut**: Primary subscription payment method
- ✅ **Wallet**: Secondary option using accumulated revenue
- ✅ **Credit System**: Negative balance for selected artists

## 🔄 DATABASE SYNCHRONIZATION

### Master Database Principle:
- ✅ **Single Source of Truth**: `user_profiles` feeds everything
- ✅ **Auto-sync**: Edit name once → updates in all releases
- ✅ **Trigger System**: Database automatically syncs changes
- ✅ **Immutable Protection**: Core identity data locked after registration

### Cross-Role Visibility:
```
Artist → Can see own releases
Label Admin → Can see all label artist releases  
Company Admin → Can see all company releases
Distribution Partner → Can see ALL releases
Super Admin → Can see everything
```

## 🎯 KEY BUSINESS RULES IMPLEMENTED

1. **Registration Step 4** → Immutable data locked, auto-populates everything
2. **Auto-save drafts** → No data loss during creation
3. **Routing logic** → Dedicated label admin or default label admin
4. **Edit permissions** → Status-based (draft = edit, in_review+ = request only)
5. **Revenue cascade** → DP 10% → flexible artist/label/company splits
6. **Wallet integration** → Revenue → wallet → subscription payments
7. **Change requests** → When direct editing not allowed
8. **Hierarchical visibility** → Role-based access to releases
9. **One edit everywhere** → Master database syncs all tables
10. **Negative balance** → Special artist credit system

## 📁 FILES TO RUN:

**Main Schema:** `database/supabase-corrected-business-schema.sql`

This schema implements the EXACT business workflow you described with proper registration integration, revenue distribution, wallet system, and change request handling!
