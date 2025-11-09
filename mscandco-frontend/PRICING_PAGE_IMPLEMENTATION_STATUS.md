# PRICING PAGE IMPLEMENTATION - STATUS REPORT
## MSC & Co - Complete 4-Tier Pricing with Revenue Model

**Date:** November 9, 2025
**Status:** 60% Complete - Components Ready, Integration Needed

---

## ✅ COMPLETED WORK

### 1. Database Migration ✅
**File:** `supabase/migrations/20251109000001_add_pricing_tiers_and_limits.sql`

**What's Done:**
- All 4 pricing tiers added (free, pro, mpp_paid, mpp_earned, mpp_invited, investment)
- Commission rates (20%, 15%, 10%, 2.5%)
- Free tier limitations (3 releases/year, 15 tracks/year)
- Apollo Intelligence usage tracking
- MPP auto-qualification function
- Investment Partner equity tracking
- Revolut integration fields (NOT Stripe)
- Automatic commission rate updates on tier changes
- RLS policies for partner_applications table

**Next Step:** Apply migration to database

### 2. TierCard Component ✅
**File:** `components/pricing/TierCard.jsx`

**Features:**
- Displays tier name, badge, price, commission rate
- Shows "You keep X% of royalties" in green
- Free tier limitations display (yellow box with X icons)
- Feature list with checkmarks
- CTA button with custom action
- Highlighted/best value styling
- Tier-specific icons (Star, Zap, Crown)
- Mobile responsive

### 3. EarningsCalculator Component ✅
**File:** `components/pricing/EarningsCalculator.jsx`

**Features:**
- Interactive slider (£0-£100K)
- Real-time calculations for all 4 tiers
- Shows commission, subscription cost, total cost, you keep
- Calculates savings vs Free tier
- Highlights best tier based on earnings
- Detects MPP free qualification (£10K+ earnings)
- Beautiful gradient design
- Custom slider styling

### 4. QualificationChecker Component ✅
**File:** `components/pricing/QualificationChecker.jsx`

**Features:**
- Form inputs for earnings, streams, releases, commissions
- Real-time validation (shows checkmarks when criteria met)
- Calls API to check qualification
- Shows qualification result with reasons
- "Activate FREE Partner Status" button
- Shows next milestone if not qualified
- Loading states

### 5. FeatureComparisonTable Component ✅
**File:** `components/pricing/FeatureComparisonTable.jsx`

**Features:**
- 7 feature categories (expandable/collapsible)
- Releases, Analytics, Apollo AI, Marketing, Revenue, Support, Partner Benefits
- Boolean features (✓ or ✗)
- Text features (platform counts, response times, etc.)
- Expand All / Collapse All buttons
- Color-coded columns for each tier
- Mobile responsive table

---

## 🚧 REMAINING WORK (40%)

### 1. New Pricing Page (app/pricing/PricingClient.js)
**Status:** NEEDS COMPLETE REWRITE

**Required Changes:**
- Replace old 2-tier pricing with new 4-tier structure
- Add EarningsCalculator at top
- Display 4 TierCard components
- Add QualificationChecker below tiers
- Add FeatureComparisonTable (expandable)
- Monthly/Annual toggle
- FAQ section
- Update Revolut payment info footer

**New Structure:**
```jsx
'use client'

import { useState } from 'react'
import TierCard from '@/components/pricing/TierCard'
import EarningsCalculator from '@/components/pricing/EarningsCalculator'
import QualificationChecker from '@/components/pricing/QualificationChecker'
import FeatureComparisonTable from '@/components/pricing/FeatureComparisonTable'

const TIERS = [
  {
    tier: 'free',
    name: 'MSC Free',
    price: 0,
    commission: 20,
    bestFor: 'New & emerging artists',
    features: [...],
    limitations: [
      'Maximum 3 releases per year',
      'Maximum 15 tracks per year',
      '12 platforms (excludes TikTok, Boomplay, etc.)',
      // ...
    ]
  },
  {
    tier: 'pro',
    name: 'MSC Pro',
    price: { monthly: 19.99, annual: 199 },
    commission: 15,
    bestFor: 'Artists releasing regularly',
    badge: { text: 'Best Value', color: 'bg-green-100 text-green-800' },
    features: [...],
    highlighted: true
  },
  {
    tier: 'mpp',
    name: 'MPP Partner',
    price: { monthly: 99, annual: 999 },
    commission: 10,
    bestFor: 'Elite artists & strategic partners',
    features: [...]
  },
  {
    tier: 'investment',
    name: 'Investment Partner',
    price: { investment: [10000, 25000, 50000] },
    commission: 2.5,
    bestFor: 'Artists who want ownership',
    features: [...]
  }
]

export default function PricingClient({ user }) {
  const [billingPeriod, setBillingPeriod] = useState('annual')

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">Simple, Fair Pricing</h1>
        <p className="text-xl text-gray-600">
          Start free. Scale as you grow. Lower rates for success. Own equity when you're ready.
        </p>
        <p className="text-2xl font-bold text-indigo-600 mt-4">
          20% → 15% → 10% → 2.5%
        </p>
        <p className="text-gray-600">The more you grow, the less you pay.</p>
      </div>

      {/* Earnings Calculator */}
      <div className="max-w-4xl mx-auto mb-16">
        <EarningsCalculator />
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center mb-12">
        {/* Monthly/Annual toggle */}
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto mb-16">
        {TIERS.map((tierData) => (
          <TierCard
            key={tierData.tier}
            {...tierData}
            billingPeriod={billingPeriod}
            price={getPrice(tierData, billingPeriod)}
            ctaAction={() => handleUpgrade(tierData.tier)}
            user={user}
          />
        ))}
      </div>

      {/* Qualification Checker */}
      <div className="max-w-2xl mx-auto mb-16">
        <QualificationChecker
          userId={user?.id}
          onQualified={(result) => {
            // Show modal, redirect, etc.
          }}
        />
      </div>

      {/* Feature Comparison */}
      <div className="max-w-7xl mx-auto mb-16">
        <FeatureComparisonTable />
      </div>

      {/* FAQ Section */}
      {/* ... */}

      {/* Revolut Payment Info */}
      {/* ... */}
    </div>
  )
}
```

### 2. API Endpoint for Qualification Check
**File:** `app/api/pricing/check-mpp-qualification/route.js`

**Status:** NEEDS TO BE CREATED

```javascript
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request) {
  try {
    const supabase = await createServerClient()
    const { userId, annualEarnings, totalStreams, totalReleases, totalCommissions } = await request.json()

    // Check if user exists
    const { data: user } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Check qualification criteria
    const qualified =
      parseFloat(annualEarnings) >= 10000 ||
      parseInt(totalStreams) >= 100000 ||
      parseInt(totalReleases) >= 50 ||
      parseFloat(totalCommissions) >= 5000

    const qualificationReasons = []
    if (annualEarnings >= 10000) qualificationReasons.push(`£${Number(annualEarnings).toLocaleString()} in annual earnings`)
    if (totalStreams >= 100000) qualificationReasons.push(`${Number(totalStreams).toLocaleString()} total streams`)
    if (totalReleases >= 50) qualificationReasons.push(`${totalReleases} total releases`)
    if (totalCommissions >= 5000) qualificationReasons.push(`£${Number(totalCommissions).toLocaleString()} in commissions paid`)

    // Calculate next milestone
    let nextMilestone = null
    if (!qualified) {
      const earningsGap = 10000 - parseFloat(annualEarnings || 0)
      const streamsGap = 100000 - parseInt(totalStreams || 0)
      const releasesGap = 50 - parseInt(totalReleases || 0)
      const commissionsGap = 5000 - parseFloat(totalCommissions || 0)

      const gaps = [
        { type: 'earnings', gap: earningsGap, text: `£${earningsGap.toLocaleString()} more in annual earnings` },
        { type: 'streams', gap: streamsGap, text: `${streamsGap.toLocaleString()} more streams` },
        { type: 'releases', gap: releasesGap, text: `${releasesGap} more releases` },
        { type: 'commissions', gap: commissionsGap, text: `£${commissionsGap.toLocaleString()} more in commissions` }
      ].filter(g => g.gap > 0)

      if (gaps.length > 0) {
        const closest = gaps.reduce((min, current) => current.gap < min.gap ? current : min)
        nextMilestone = closest.text
      }
    }

    return Response.json({
      qualified,
      message: qualified
        ? 'You qualify for FREE MSC Partners Program!'
        : 'You do not qualify yet. Keep growing!',
      qualificationReasons: qualified ? qualificationReasons : null,
      nextMilestone
    })
  } catch (error) {
    console.error('Qualification check error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### 3. Free Tier Enforcement Logic
**Files Needed:**
- `app/api/releases/create/route.js` (add tier checks)
- `lib/pricing/tierLimits.js` (helper functions)

```javascript
// lib/pricing/tierLimits.js
export async function checkTierLimits(userId, operation) {
  const supabase = await createServerClient()

  const { data: user } = await supabase
    .from('user_profiles')
    .select('tier, releases_this_year, tracks_this_year, total_earnings_this_year')
    .eq('id', userId)
    .single()

  if (!user) throw new Error('User not found')

  if (user.tier === 'free') {
    if (operation === 'create_release') {
      if (user.releases_this_year >= 3) {
        return {
          allowed: false,
          reason: 'Free tier limit: 3 releases per year. Upgrade to MSC Pro for unlimited releases.',
          upgradeRequired: 'pro'
        }
      }
    }

    if (operation === 'add_tracks' && operation.trackCount) {
      if (user.tracks_this_year + operation.trackCount > 15) {
        return {
          allowed: false,
          reason: `Free tier limit: 15 tracks per year. You have ${user.tracks_this_year}, trying to add ${operation.trackCount}. Upgrade to MSC Pro.`,
          upgradeRequired: 'pro'
        }
      }
    }

    if (user.total_earnings_this_year >= 5000) {
      return {
        allowed: true, // Still allowed, but show prompt
        promptUpgrade: true,
        reason: 'You\'ve earned £5,000+ this year! Upgrade to MSC Pro to keep more of your earnings.'
      }
    }
  }

  return { allowed: true }
}
```

### 4. Revolut Integration Updates
**Files to modify:**
- `app/api/wallet/pay-subscription/route.js`
- Add new tiers to Revolut subscription logic
- Handle free MPP upgrades (no payment required)
- Handle investment tier (one-time payment + equity agreement)

### 5. Upgrade/Downgrade Flows
**Files to create:**
- `app/billing/upgrade/page.js`
- `app/billing/downgrade/page.js`
- `components/billing/UpgradeModal.jsx`
- `components/billing/DowngradeWarning.jsx`

---

## 📋 COMPLETE FEATURES LIST (FOR PRICING PAGE)

### MSC FREE
**Price:** £0/year
**Commission:** 20%

**Limitations:**
- Maximum 3 releases per year
- Maximum 15 tracks per year
- 12 streaming platforms (excludes TikTok, Boomplay, Anghami, Napster, KKBOX, JOOX)
- Standard delivery: 7-10 days
- Basic analytics only (no demographics)
- Apollo Intelligence: 3 queries/month
- Email support (48-hour response)
- No pre-save campaigns
- No smart links
- No white-label distribution
- No royalty splits
- Upgrade required at £5,000/year earnings

**Included:**
- Unlimited track length
- Keep 80% of royalties
- ISRC & UPC codes
- Spotify, Apple Music, YouTube Music, Amazon Music, Tidal, Deezer, Pandora, SoundCloud, Audiomack, Yandex Music, QQ Music, NetEase Cloud Music
- Basic release scheduling
- CSV sales reports
- Copyright protection

### MSC PRO
**Price:** £19.99/month or £199/year (save £40)
**Commission:** 15%

**Everything in Free, PLUS:**
- UNLIMITED releases
- UNLIMITED tracks
- ALL 18 streaming platforms (adds TikTok, Boomplay, Anghami, Napster, KKBOX, JOOX)
- Priority delivery: 1-3 days
- Advanced analytics (demographics, retention, playlist performance)
- Apollo Intelligence: 100 queries/month
- Priority support (email + chat, 12-hour response)
- Pre-save campaigns
- Smart links & landing pages
- Royalty splits management
- Early access to new features
- Custom release dates
- Pre-order functionality
- Detailed streaming insights

### MPP PARTNER
**Price:** £99/month or £999/year (save £189) OR FREE if qualified
**Commission:** 10%

**4 Ways to Join:**
1. **Pay:** £999/year or £99/month
2. **Earn:** FREE with £10K+ earnings, 100K+ streams, 50+ releases, or £5K+ commissions
3. **Invited:** Hand-picked by MSC & Co team
4. **Invest:** See Investment Partner tier

**Everything in Pro, PLUS:**
- Keep 90% of royalties (10% commission only)
- 24-hour express delivery
- Dedicated account manager
- Apollo Intelligence Pro: 500 queries/month
- White-label distribution (earn 3-5% on artists you sign)
- Referral revenue (earn 10% of subscription revenue)
- Co-marketing opportunities
- Featured on MSC & Co homepage
- Private Partner community
- Networking events (virtual & in-person)
- VIP support (24/7 priority, 6-hour response)
- Custom integrations available
- Quarterly strategy calls

### INVESTMENT PARTNER
**Price:** £10K, £25K, or £50K investment
**Commission:** 2.5% (LOWEST POSSIBLE)

**Investment Tiers:**
- £10,000 → 0.5% equity + 2.5% commission
- £25,000 → 1.0% equity + 2.5% commission (RECOMMENDED)
- £50,000 → 2.0% equity + 2.5% commission

**Everything in Partners, PLUS:**
- Keep 97.5% of royalties (2.5% commission - absolute minimum)
- Equity ownership in AUDIOMSC LTD
- Board advisory seat
- Quarterly board meetings
- Vote on major platform decisions
- Shape product roadmap
- Revenue share: 5% of ALL platform revenue
- Dividend payments (when profitable)
- Exit proceeds (acquisition/IPO)
- Apollo Intelligence: UNLIMITED queries
- Personal concierge support
- Custom feature development
- White-label distribution (earn 5% override)

---

## 🎯 IMMEDIATE NEXT STEPS

1. **Apply database migration:**
   ```bash
   cd /Users/htay/Documents/MSC\ &\ Co/mscandco-frontend
   npx supabase db push
   ```

2. **Create new PricingClient.js** with all components integrated

3. **Create API endpoint** for MPP qualification checking

4. **Add tier enforcement** to release creation endpoints

5. **Update Revolut integration** for new tiers

6. **Test complete flow:**
   - Free tier → Create 3 releases → Hit limit → Upgrade prompt
   - Check MPP qualification → Qualify → Activate free Partner
   - Investment Partner → Application form → Equity agreement

---

## 💡 KEY BUSINESS LOGIC

### Commission Calculation
```javascript
// Calculate commission based on tier
function calculateCommission(earnings, tier) {
  const rates = {
    free: 0.20,
    pro: 0.15,
    mpp_paid: 0.10,
    mpp_earned: 0.10,
    mpp_invited: 0.10,
    investment: 0.025
  }

  return earnings * rates[tier]
}
```

### Tier Upgrade Eligibility
```javascript
// Check if user should be auto-upgraded to MPP
function checkAutoMPPUpgrade(user) {
  return user.total_earnings_this_year >= 10000 ||
         user.total_streams_all_time >= 100000 ||
         user.total_releases_all_time >= 50 ||
         user.total_commissions_paid >= 5000
}
```

### Free Tier Annual Reset
```sql
-- Run this on January 1st every year
UPDATE user_profiles
SET
  releases_this_year = 0,
  tracks_this_year = 0,
  total_earnings_this_year = 0.00,
  upgrade_prompted = FALSE;
```

---

## ✅ COMPLETION CHECKLIST

**Completed:**
- [x] Database migration created
- [x] TierCard component
- [x] EarningsCalculator component
- [x] QualificationChecker component
- [x] FeatureComparisonTable component

**Remaining:**
- [ ] Rewrite PricingClient.js with new 4-tier structure
- [ ] Create MPP qualification API endpoint
- [ ] Add Free tier enforcement to release creation
- [ ] Update Revolut integration for new tiers
- [ ] Create upgrade/downgrade flows
- [ ] Add FAQ section
- [ ] Test complete user journey
- [ ] Update admin dashboard to manage partner applications
- [ ] Create Investment Partner application form
- [ ] Add analytics tracking

---

**DOCUMENT STATUS:** Ready for Implementation
**NEXT ACTION:** Apply database migration and integrate components into new PricingClient.js
**ESTIMATED TIME TO COMPLETE:** 4-6 hours

**Questions? Refer to this document for all implementation details.**
