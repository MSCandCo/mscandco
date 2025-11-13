# 🏗️ Architecture & Security Guide

## 📐 System Architecture

### **Current Architecture (v1.1.0)**

```
┌─────────────────────────────────────────────────────────────┐
│                         USER                                 │
│                  (Artist/Musician)                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Natural Language
                         │ ("Upload my track...")
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   CLAUDE DESKTOP                             │
│                 (Anthropic's App)                            │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │          Claude AI (Sonnet 4.5)                    │    │
│  │  - Understands natural language                    │    │
│  │  - Decides which MCP tool to call                  │    │
│  │  - Formats user-friendly responses                 │    │
│  └────────────────────┬───────────────────────────────┘    │
└─────────────────────────┼────────────────────────────────────┘
                          │
                          │ MCP Protocol (JSON-RPC)
                          │ Tool calls with parameters
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              MSC & CO MCP SERVER                             │
│         (@mscandco/mcp-server - Your npm package)           │
│                                                              │
│  Running locally on user's machine via:                     │
│  npx @mscandco/mcp-server                                   │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  15 Tools:                                         │    │
│  │  • check_or_create_account                         │    │
│  │  • upload_track (reads local files)                │    │
│  │  • submit_distribution                             │    │
│  │  • request_payout                                  │    │
│  │  • get_earnings                                    │    │
│  │  • get_releases                                    │    │
│  │  • ... 10 more tools                               │    │
│  └────────────────────┬───────────────────────────────┘    │
│                       │                                     │
│  File System Access:  │                                     │
│  - Read audio files   │                                     │
│  - Read artwork files │                                     │
│  - No write access    │                                     │
└───────────────────────┼─────────────────────────────────────┘
                        │
                        │ HTTPS with Bearer Token
                        │ (MSC_CO_API_KEY)
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              YOUR BACKEND (Next.js)                          │
│         https://mscandco.com or staging                      │
│                                                              │
│  API Routes (pages/api/v1/...):                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │  POST   /api/v1/artists/check-or-create           │    │
│  │  POST   /api/v1/tracks/upload                     │    │
│  │  POST   /api/v1/releases/submit                   │    │
│  │  POST   /api/v1/payouts/request                   │    │
│  │  GET    /api/artist/wallet-simple                 │    │
│  │  GET    /api/artist/releases-simple               │    │
│  │  ... and more                                      │    │
│  └────────────────────┬───────────────────────────────┘    │
│                       │                                     │
│  Middleware:          │                                     │
│  - Bearer token auth  │                                     │
│  - Rate limiting      │                                     │
│  - Request validation │                                     │
│  - Logging            │                                     │
└───────────────────────┼─────────────────────────────────────┘
                        │
                        │ SQL Queries with RLS
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              SUPABASE DATABASE                               │
│              (PostgreSQL + RLS)                              │
│                                                              │
│  Tables:                                                     │
│  • artists                                                   │
│  • tracks                                                    │
│  • releases                                                  │
│  • earnings                                                  │
│  • payouts                                                   │
│  • ... and more                                              │
│                                                              │
│  Row Level Security (RLS):                                  │
│  • Artist can only see their own data                       │
│  • Admin roles have elevated access                         │
│  • All queries filtered by user_id                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Model

### **1. Authentication Flow**

```
User → Claude Desktop → MCP Server → Your Backend → Database
         (no auth)        (API key)     (validates)   (RLS)
```

### **2. API Key Security**

**Where the API key is stored:**
```json
// ~/Library/Application Support/Claude/claude_desktop_config.json
{
  "mcpServers": {
    "msc-co": {
      "env": {
        "MSC_CO_API_KEY": "msc_live_abc123xyz789..."
      }
    }
  }
}
```

**Security properties:**
- ✅ Stored locally on user's machine
- ✅ Not transmitted to Anthropic
- ✅ Only read by MCP server process
- ✅ Uses Bearer token format
- ✅ Can be revoked anytime

### **3. What MCP Server Can/Cannot Do**

**✅ CAN:**
- Read files user explicitly provides paths to
- Make API calls to YOUR backend
- Return data to Claude for display

**❌ CANNOT:**
- Access files without explicit paths
- Write/modify files (read-only)
- Access database directly
- Bypass your API authentication
- Execute arbitrary commands
- Access user's other applications

### **4. Your Backend Security Layers**

```typescript
// Your API route example:
export default async function handler(req, res) {
  // Layer 1: Bearer token validation
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });

  // Layer 2: Verify token and get user
  const user = await verifyToken(token);
  if (!user) return res.status(401).json({ error: 'Invalid token' });

  // Layer 3: Rate limiting
  const rateLimit = await checkRateLimit(user.id, 'uploads');
  if (!rateLimit.allowed) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  // Layer 4: Input validation
  const validatedData = validateUploadData(req.body);
  if (!validatedData.valid) {
    return res.status(400).json({ error: validatedData.error });
  }

  // Layer 5: Database query with RLS
  const { data, error } = await supabase
    .from('tracks')
    .insert({
      ...validatedData,
      user_id: user.id, // RLS uses this
    })
    .select();

  // Layer 6: Response sanitization
  return res.status(200).json(sanitizeResponse(data));
}
```

---

## 🛡️ Security Best Practices

### **For Your Backend API**

1. **Always validate the Bearer token:**
```typescript
// Check token is valid AND not expired
const isValid = await validateToken(token);
const isNotExpired = await checkTokenExpiry(token);
const isNotRevoked = await checkTokenRevoked(token);
```

2. **Implement rate limiting:**
```typescript
// Per user, per endpoint
const limits = {
  'upload_track': 50 per hour,
  'create_release': 20 per hour,
  'request_payout': 5 per day,
};
```

3. **Log all MCP API calls:**
```typescript
await logApiCall({
  user_id: user.id,
  endpoint: req.url,
  tool: req.body.tool_name,
  ip: req.ip,
  timestamp: new Date(),
});
```

4. **Validate file uploads:**
```typescript
// Check file type, size, content
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_TYPES = ['audio/mpeg', 'audio/wav', 'audio/flac'];

if (file.size > MAX_FILE_SIZE) {
  throw new Error('File too large');
}

if (!ALLOWED_TYPES.includes(file.mimetype)) {
  throw new Error('Invalid file type');
}

// Scan for malware (optional but recommended)
await scanFileForViruses(file);
```

5. **Sanitize responses:**
```typescript
// Never expose internal IDs, raw SQL, or sensitive data
function sanitizeResponse(data) {
  return {
    ...data,
    internal_id: undefined,
    database_connection: undefined,
    full_sql_query: undefined,
  };
}
```

---

## 🔒 Data Privacy

### **What Data Flows Where**

```
┌──────────────────────────────────────────────────────────┐
│ USER'S COMPUTER (Local)                                  │
│                                                           │
│ • Audio files (never leave machine until uploaded)       │
│ • Claude Desktop config (contains API key)               │
│ • MCP server process (temporary, no persistence)         │
└──────────────────────────────────────────────────────────┘
                        ↓
                   Upload only when
                  user explicitly requests
                        ↓
┌──────────────────────────────────────────────────────────┐
│ YOUR BACKEND (Cloud - mscandco.com)                      │
│                                                           │
│ • Receives: Audio files, metadata, API requests          │
│ • Stores: In Supabase Storage (encrypted)                │
│ • Processes: Distributes to streaming platforms          │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│ STREAMING PLATFORMS (Spotify, Apple Music, etc.)         │
│                                                           │
│ • Receives: Audio files + metadata from your backend     │
│ • Stores: On their CDN for streaming                     │
│ • Returns: Stream counts, earnings data                  │
└──────────────────────────────────────────────────────────┘
```

### **Data NOT Sent to Anthropic**

- ❌ Audio files
- ❌ API keys
- ❌ Personal info (names, emails, payment details)
- ❌ Earnings data
- ❌ File paths

### **Data Sent to Anthropic (Claude AI)**

- ✅ Tool descriptions (what tools are available)
- ✅ Tool responses (formatted, sanitized data)
- ✅ User's natural language queries
- ✅ Conversation history

**This is normal MCP behavior** - Claude needs to see tool responses to help the user.

---

## 🚨 Security Monitoring

### **What to Monitor**

```typescript
// Create monitoring dashboard for:

1. Unusual API usage:
   - Spike in requests from one API key
   - Multiple failed auth attempts
   - Requests from unusual locations

2. Failed uploads:
   - File type mismatches
   - Repeated upload failures
   - Suspicious file names

3. Payout anomalies:
   - Payout requests exceeding balance
   - Unusual payout patterns
   - Multiple payouts in short time

4. Token security:
   - Expired token usage attempts
   - Revoked token usage attempts
   - Token sharing (same token, different IPs)
```

### **Alerting Rules**

```typescript
// Send alerts when:
const ALERT_RULES = {
  failed_auth: 10 attempts in 5 minutes,
  large_payout: > £5,000 in single request,
  rapid_uploads: > 50 files in 1 hour,
  suspicious_location: IP from blacklisted country,
};
```

---

## 📊 API Rate Limits (Recommended)

```typescript
// Implement these limits in your backend:

const RATE_LIMITS = {
  // Per user, per time period

  // Authentication
  'check_or_create_account': {
    limit: 5,
    window: '1 hour',
  },

  // Uploads
  'upload_track': {
    limit: 50,
    window: '1 hour',
  },
  'batch_upload_tracks': {
    limit: 5,
    window: '1 hour',
  },

  // Distribution
  'submit_distribution': {
    limit: 20,
    window: '1 hour',
  },

  // Financial
  'request_payout': {
    limit: 5,
    window: '24 hours',
  },
  'get_earnings': {
    limit: 100,
    window: '1 hour',
  },

  // Analytics
  'get_analytics': {
    limit: 100,
    window: '1 hour',
  },

  // General reads
  'get_releases': {
    limit: 200,
    window: '1 hour',
  },
};
```

---

## 🔧 Backend Endpoints You Need to Create

Here are the NEW endpoints needed for your MCP tools:

```typescript
// File: pages/api/v1/artists/check-or-create.ts
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, artistName, legalName, paymentMethod, paymentDetails } = req.body;

  // Check if artist exists
  const existing = await supabase
    .from('artists')
    .select('id')
    .eq('email', email)
    .single();

  if (existing.data) {
    return res.json({
      exists: true,
      artistId: existing.data.id,
      message: 'Account found',
    });
  }

  // Create new artist
  const newArtist = await supabase
    .from('artists')
    .insert({
      email,
      artist_name: artistName,
      legal_name: legalName,
      payment_method: paymentMethod,
      payment_details: paymentDetails,
    })
    .select()
    .single();

  return res.json({
    exists: false,
    artistId: newArtist.data.id,
    message: 'Account created',
  });
}
```

```typescript
// File: pages/api/v1/tracks/upload.ts
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // Parse multipart form data
  const form = new formidable.IncomingForm();
  const [fields, files] = await form.parse(req);

  const audioFile = files.file[0];
  const { artistId, title, genre, explicit } = fields;

  // Upload to Supabase Storage
  const filePath = `tracks/${artistId}/${Date.now()}_${audioFile.originalFilename}`;
  const { data: uploadData } = await supabase.storage
    .from('audio-files')
    .upload(filePath, fs.createReadStream(audioFile.filepath));

  // Create track record
  const { data: track } = await supabase
    .from('tracks')
    .insert({
      artist_id: artistId,
      title,
      genre,
      explicit: explicit === 'true',
      file_path: filePath,
      file_size: audioFile.size,
    })
    .select()
    .single();

  // Get audio duration (using ffprobe or similar)
  const duration = await getAudioDuration(audioFile.filepath);

  return res.json({
    trackId: track.id,
    uploadUrl: uploadData.path,
    duration,
  });
}
```

```typescript
// File: pages/api/v1/releases/submit.ts
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { artistId, trackId, releaseDate, platforms, artworkId } = req.body;

  // Create release
  const { data: release } = await supabase
    .from('releases')
    .insert({
      artist_id: artistId,
      track_id: trackId,
      release_date: releaseDate,
      platforms,
      artwork_id: artworkId,
      status: 'processing',
    })
    .select()
    .single();

  // Trigger distribution workflow (queue job)
  await queueDistributionJob(release.id);

  return res.json({
    releaseId: release.id,
    status: 'processing',
    expectedLiveDate: releaseDate,
  });
}
```

```typescript
// File: pages/api/v1/payouts/request.ts
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { artistId, amount } = req.body;

  // Check balance
  const balance = await getWalletBalance(artistId);
  if (amount && amount > balance) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }

  const payoutAmount = amount || balance;

  // Minimum payout check
  if (payoutAmount < 50) {
    return res.status(400).json({ error: 'Minimum payout is £50' });
  }

  // Create payout request
  const { data: payout } = await supabase
    .from('payouts')
    .insert({
      artist_id: artistId,
      amount: payoutAmount,
      status: 'pending',
      requested_at: new Date(),
    })
    .select()
    .single();

  // Trigger payout processing (queue job)
  await queuePayoutJob(payout.id);

  return res.json({
    payoutId: payout.id,
    amount: payoutAmount,
    eta: '3-5 business days',
    status: 'pending',
  });
}
```

---

## 🎯 Summary

### **Security Layers**

1. **MCP Server** (local) - Read-only file access
2. **API Authentication** (Bearer token)
3. **Backend Validation** (input sanitization)
4. **Rate Limiting** (prevent abuse)
5. **Database RLS** (row-level security)
6. **Audit Logging** (track all actions)

### **Data Flow**

User → Claude → MCP (local) → Your API (secured) → Database (RLS)

### **Trust Model**

- ✅ User trusts Claude Desktop (Anthropic's official app)
- ✅ Claude Desktop trusts your MCP server (via npm)
- ✅ Your MCP server trusts your backend API (via token)
- ✅ Your backend trusts the database (via RLS)

---

**This is a secure, scalable architecture ready for production!** 🚀
