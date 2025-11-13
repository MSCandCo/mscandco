# Cleared API Integration - Setup Guide

## Overview

MSC & Co now includes **Cleared API** integration for pre-publication sample clearance detection. This protects artists from $150K-$1M+ copyright lawsuit settlements by detecting uncleared samples **before** distribution.

## What is Cleared?

Cleared™ is a SaaS API service that detects sample-based copyright infringement in audio tracks before publication:
- Detects samples from major/indie label catalogs
- Identifies royalty-free sources (Splice, Tracklib, YouTube Library)
- Flags Content ID conflicts (prevents YouTube demonetization)
- Provides actionable recommendations with confidence scoring

**Website**: https://clearedmusic.io
**Pricing**: First 50 tracks free, then $0.07 per track

---

## 1. Setup Instructions

### Step 1: Sign Up for Cleared API

1. Go to https://clearedmusic.io
2. Click "Get API Access" or "Sign Up"
3. Complete registration and verify email
4. Navigate to your dashboard to get your API key

### Step 2: Add Environment Variables

Add the following to your `.env.local` file:

```bash
# Cleared API Configuration
CLEARED_API_KEY=your_api_key_here
CLEARED_API_URL=https://api.clearedmusic.io/v1
```

**Production (Vercel):**
```bash
vercel env add CLEARED_API_KEY
# Paste your API key when prompted
# Select: Production, Preview, Development (all environments)

vercel env add CLEARED_API_URL
# Enter: https://api.clearedmusic.io/v1
# Select: Production, Preview, Development (all environments)
```

### Step 3: Apply Database Migration

Run the sample scan tracking migration:

```bash
# Using Supabase CLI
supabase db push

# Or apply the specific migration
psql $DATABASE_URL -f supabase/migrations/20250113_sample_scan_tracking.sql
```

This creates two tables:
- `sample_scan_usage` - Tracks API usage for billing
- `sample_detection_results` - Stores detailed detection results

---

## 2. How It Works

### Artist Upload Flow

```
1. Artist uploads track → /api/artist/releases/upload
2. Basic validation (file format, size, etc.)
3. **NEW: Cleared sample scan** (if user has access)
4. If samples detected → Show SampleClearanceReport component
5. Artist must resolve issues before distribution
6. Track approved → Proceed to distribution
```

### Tier Access

| Tier | Sample Clearance Access |
|------|------------------------|
| **MSC Free** | ❌ Not included |
| **MSC Pro** | ❌ Not included |
| **MPP Partner** | ✅ **UNLIMITED** |
| **MSC Business** | ✅ **UNLIMITED** (priority) |

---

## 3. Integration Points

### Release Upload API

The Cleared scan is integrated into the release upload workflow. Example usage:

```javascript
// pages/api/artist/releases/upload.js
import { scanForSamples, hasAccessToSampleScanning } from '@/lib/services/cleared'

export default async function handler(req, res) {
  // ... existing upload logic ...

  // Check if user has sample scanning access
  if (hasAccessToSampleScanning(user)) {
    // Scan track for samples
    const sampleResults = await scanForSamples({
      audioUrl: trackPublicUrl,
      releaseId: release.id,
      trackId: track.id,
      artistName: user.artist_name,
      trackTitle: track.title
    })

    // If critical/high risk samples detected, block distribution
    if (sampleResults.risk_level === 'critical' || sampleResults.risk_level === 'high') {
      // Store results in database
      await storeSampleDetectionResults(sampleResults)

      // Return warning to artist
      return res.status(400).json({
        success: false,
        error: 'sample_clearance_required',
        message: 'Uncleared samples detected. Please review and resolve before distribution.',
        sample_results: formatSampleResults(sampleResults)
      })
    }
  }

  // Continue with distribution...
}
```

### Frontend Component

Show the sample clearance report to artists:

```javascript
// In your release upload component
import SampleClearanceReport from '@/components/SampleClearanceReport'

function ReleaseUploadPage() {
  const [sampleResults, setSampleResults] = useState(null)

  const handleUpload = async () => {
    const response = await uploadRelease(formData)

    if (response.error === 'sample_clearance_required') {
      setSampleResults(response.sample_results)
    }
  }

  return (
    <div>
      {sampleResults && (
        <SampleClearanceReport
          results={sampleResults}
          onActionTaken={handleSampleAction}
        />
      )}
      {/* ... rest of upload form ... */}
    </div>
  )
}
```

---

## 4. Database Schema

### sample_scan_usage

Tracks each scan for billing and audit:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | User who initiated scan |
| `release_id` | UUID | Associated release |
| `track_id` | UUID | Associated track |
| `scan_id` | TEXT | Cleared's scan ID |
| `samples_detected` | INTEGER | Number of samples found |
| `risk_level` | TEXT | none/low/medium/high/critical |
| `cost_usd` | DECIMAL | Cost of this scan ($0.07) |
| `was_free` | BOOLEAN | If part of free tier |
| `api_response` | JSONB | Full Cleared API response |

### sample_detection_results

Detailed detection results for each sample:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `scan_usage_id` | UUID | Links to scan |
| `source_title` | TEXT | Original song title |
| `source_artist` | TEXT | Original artist |
| `rights_holder` | TEXT | Label/publisher |
| `confidence` | INTEGER | Match confidence (0-100) |
| `status` | TEXT | pending/cleared/removed/replaced |

---

## 5. Cost Management

### Free Tier (First 50 Tracks)

Cleared provides 50 free scans per account. We track this in the database:

```sql
SELECT get_user_free_scans_used('user_id');
-- Returns: number of free scans used (max 50)
```

### Paid Scans ($0.07 per track)

After 50 free scans, each scan costs $0.07. We record this in `sample_scan_usage.cost_usd`.

**Monthly Cost Estimate:**
- 1,000 MPP Partner users
- Avg 10 tracks/month each = 10,000 tracks
- First 50 free per user = 50,000 free scans
- Paid scans: 100,000 - 50,000 = 50,000 scans
- Cost: 50,000 × $0.07 = **$3,500/month**

**Revenue from Feature:**
- MPP Partner tier: £99/month
- If 10% of users upgrade for this feature alone: 100 new MPP signups
- Revenue: 100 × £99 = **£9,900/month**
- **Net profit: £9,900 - $3,500 = ~£6,400/month**

---

## 6. Testing

### Test with Sample-Heavy Tracks

Test the integration with tracks known to contain samples:

1. **Hip-Hop Beats**: Often contain drum breaks, vocal samples
2. **Electronic Music**: Frequently samples synth patches, vocals
3. **Remixes**: By definition, contain samples of original tracks

### Expected Response Format

```json
{
  "success": true,
  "scan_id": "scan_1234567890",
  "samples_detected": [
    {
      "title": "Hotline Bling",
      "artist": "Drake",
      "label": "Republic Records",
      "timestamp": "0:32 - 0:45",
      "confidence": 95
    }
  ],
  "risk_level": "critical"
}
```

### Manual Test Commands

```bash
# Test API connection
curl -X POST https://api.clearedmusic.io/v1/scan \
  -H "Authorization: Bearer $CLEARED_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "audio_url": "https://example.com/track.mp3",
    "metadata": {
      "artist_name": "Test Artist",
      "track_title": "Test Track"
    }
  }'
```

---

## 7. Monitoring & Analytics

### Track Usage

Monitor Cleared API usage in your database:

```sql
-- Monthly scan volume
SELECT
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as total_scans,
  SUM(samples_detected) as total_samples_found,
  AVG(samples_detected) as avg_samples_per_track
FROM sample_scan_usage
GROUP BY month
ORDER BY month DESC;

-- Risk level breakdown
SELECT
  risk_level,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM sample_scan_usage
GROUP BY risk_level
ORDER BY count DESC;

-- Cost tracking
SELECT
  SUM(cost_usd) as total_cost,
  COUNT(*) FILTER (WHERE was_free = true) as free_scans,
  COUNT(*) FILTER (WHERE was_free = false) as paid_scans
FROM sample_scan_usage;
```

### Alert Thresholds

Set up alerts for:
- High volume of critical detections (might indicate issue with API)
- Unusual cost spikes (unexpected usage)
- API errors or timeouts

---

## 8. Marketing & Launch

### Announcement Strategy

**Phase 1: Soft Launch (MPP Partner only)**
- Email all MPP Partners about new feature
- Add badge to their dashboard: "Sample Protection Active"
- Track engagement and feedback

**Phase 2: Public Announcement**
- Press release: "MSC & Co Becomes First Distributor with Sample Clearance"
- Blog post: "Why We Integrated Cleared (And Why It Matters)"
- Social media campaign: Real examples of lawsuit prevention

**Phase 3: Competitive Positioning**
- Update website: "The Only Distributor That Protects You From Sample Lawsuits"
- Create case studies
- Partner with Cleared for co-marketing

### Key Messaging

1. **Protection**: "Prevents $150K-$1M+ lawsuit settlements"
2. **Peace of Mind**: "Know your track is clear before distribution"
3. **Industry First**: "No other distributor offers this"
4. **Exclusive Benefit**: "Only available to MPP Partner tier and above"

---

## 9. Support Resources

### For Artists

**Knowledge Base Articles:**
- "What is Sample Clearance?"
- "How to Clear a Sample Legally"
- "Royalty-Free Sample Alternatives"
- "Understanding Cleared Results"

**FAQ:**
- Q: What happens if samples are detected?
- A: Distribution is blocked until you clear, remove, or replace the samples.

- Q: Can I dispute a detection?
- A: Yes, for low-confidence matches (<70%), you can dispute.

- Q: How accurate is the detection?
- A: Cleared uses industry-leading fingerprinting. 90%+ confidence matches are highly reliable.

### For Support Team

**Common Issues:**
- False positives (low confidence matches)
- Artists don't understand what samples are
- Artists want help clearing samples
- API errors or timeouts

**Escalation Path:**
- Level 1: Support explains results, provides resources
- Level 2: Account manager helps with clearance process
- Level 3: Legal team (for complex cases)

---

## 10. Roadmap

### Q1 2025
- ✅ Integrate Cleared API
- ✅ Build UI components
- ✅ MPP Partner exclusive launch
- ⏳ Track usage and feedback

### Q2 2025
- ⏳ Sample clearance assistance service (help artists clear samples)
- ⏳ Cleared Credits marketplace (buy additional scans)
- ⏳ Integration with Splice/Tracklib for instant replacements

### Q3 2025
- ⏳ Expand to MSC Pro tier (pay-per-scan model)
- ⏳ Cleared sample clearance concierge service
- ⏳ Bulk scan tool for back-catalog

---

## 11. Contact & Support

**Cleared Support:**
- Website: https://clearedmusic.io
- Email: support@clearedmusic.io
- Documentation: https://docs.clearedmusic.io

**MSC & Co Internal:**
- Slack: #cleared-integration
- Technical Issues: dev@mscandco.com
- Feature Requests: product@mscandco.com

---

**Integration Status:** ✅ READY FOR PRODUCTION
**Last Updated:** January 13, 2025
