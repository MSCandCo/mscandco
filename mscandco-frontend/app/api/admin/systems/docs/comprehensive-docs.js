/**
 * Comprehensive Documentation Entries for MSC & Co Platform
 * This file contains all documentation entries organized by category
 */

export const comprehensiveDocs = [
  // ==================== API REFERENCE ====================
  
  {
    id: 'api-001',
    title: 'API Authentication & Authorization',
    description: 'Complete guide to authenticating API requests, using API keys, tokens, and understanding permissions',
    category: 'API',
    updated_at: new Date().toISOString(),
    content: `# API Authentication & Authorization

## Overview
All API endpoints require authentication using Bearer tokens or API keys. The platform uses Supabase Auth for user authentication and a custom RBAC (Role-Based Access Control) system for permissions.

## Authentication Methods

### 1. Session-Based Authentication (Browser)
For browser-based requests, use the session cookie:
\`\`\`javascript
fetch('/api/endpoint', {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  }
})
\`\`\`

### 2. Bearer Token Authentication (API)
For API requests, include the access token:
\`\`\`javascript
fetch('/api/endpoint', {
  headers: {
    'Authorization': \`Bearer \${accessToken}\`,
    'Content-Type': 'application/json'
  }
})
\`\`\`

### 3. API Key Authentication
For programmatic access, use API keys:
\`\`\`javascript
fetch('/api/endpoint', {
  headers: {
    'X-API-Key': 'your-api-key',
    'Content-Type': 'application/json'
  }
})
\`\`\`

## Getting Your API Key
1. Navigate to Settings → API Keys
2. Click "Generate New API Key"
3. Copy and store securely (shown only once)
4. Set permissions and rate limits

## Permissions System
The platform uses granular permissions:
- Format: \`resource:action:scope\`
- Example: \`release:create:own\`, \`user:view:any\`
- Wildcard: \`*:*:*\` (SuperAdmin only)

## Rate Limits
- Default: 100 requests/minute per API key
- Authenticated users: 200 requests/minute
- SuperAdmin: Unlimited

## Error Responses
\`\`\`json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token",
  "code": "AUTH_ERROR"
}
\`\`\`
`
  },

  {
    id: 'api-002',
    title: 'Releases API',
    description: 'Complete API reference for managing music releases: create, update, delete, submit, and query releases',
    category: 'API',
    updated_at: new Date().toISOString(),
    content: `# Releases API

## Endpoints

### Create Release
\`POST /api/releases/create\`
\`\`\`json
{
  "title": "Album Title",
  "artist_name": "Artist Name",
  "release_date": "2025-12-01",
  "genre": "Electronic",
  "audio_file_url": "https://...",
  "artwork_url": "https://...",
  "tracks": [...]
}
\`\`\`

### Get Release
\`GET /api/releases/[id]\`
Returns release details with tracks, metadata, and status.

### Update Release
\`PUT /api/releases/[id]\`
Update release metadata, tracks, or files.

### Delete Release
\`DELETE /api/releases/delete?id=[id]\`
Only allowed for drafts and submitted releases.

### Submit Release
\`POST /api/releases/submit\`
Submit release for distribution. Requires all required fields.

### List Releases
\`GET /api/artist/releases-simple\`
Get all releases for authenticated artist.

## Release Statuses
- \`draft\` - Work in progress
- \`submitted\` - Submitted for review
- \`approved\` - Approved and distributed
- \`rejected\` - Rejected by admin
- \`distributed\` - Live on platforms

## Required Fields
- Title
- Artist Name
- Release Date
- Genre
- Audio File
- Artwork
- At least one track

## Permissions
- \`release:create:own\` - Create own releases
- \`release:edit:own\` - Edit own releases
- \`release:edit:label\` - Edit label releases
- \`release:edit:any\` - Edit any release (Admin)
- \`release:delete:own\` - Delete own releases
`
  },

  {
    id: 'api-003',
    title: 'User Management API',
    description: 'API endpoints for managing users, roles, permissions, and user status',
    category: 'API',
    updated_at: new Date().toISOString(),
    content: `# User Management API

## Admin Endpoints

### List Users
\`GET /api/admin/users/list\`
\`\`\`json
{
  "users": [...],
  "pagination": {
    "page": 1,
    "per_page": 50,
    "total": 100
  }
}
\`\`\`

### Get User
\`GET /api/admin/users/[userId]\`
Get detailed user information including profile and metadata.

### Update User Role
\`POST /api/admin/users/[userId]/update-role\`
\`\`\`json
{
  "role": "artist" | "label_admin" | "admin" | "super_admin"
}
\`\`\`

### Update User Status
\`POST /api/admin/users/[userId]/update-status\`
\`\`\`json
{
  "status": "active" | "inactive" | "pending" | "suspended"
}
\`\`\`

### Search Users
\`GET /api/admin/users/search?q=searchterm\`
Search users by email, name, or artist name.

## User Roles
- \`artist\` - Music creators
- \`label_admin\` - Label administrators
- \`admin\` - Platform administrators
- \`super_admin\` - Super administrators

## User Statuses
- \`active\` - Can log in and use platform
- \`inactive\` - Temporarily disabled
- \`pending\` - Awaiting approval
- \`suspended\` - Banned for violations

## Permissions Required
- \`users_access:user_management:read\` - View users
- \`users_access:user_management:write\` - Modify users
- \`users_access:permissions_roles:read\` - View roles/permissions
- \`users_access:permissions_roles:write\` - Modify roles/permissions
`
  },

  {
    id: 'api-004',
    title: 'Earnings & Financial API',
    description: 'API endpoints for earnings calculations, wallet management, payouts, and financial reporting',
    category: 'API',
    updated_at: new Date().toISOString(),
    content: `# Earnings & Financial API

## Earnings Endpoints

### List Earnings
\`GET /api/admin/earnings/list\`
Get earnings for all users or filter by artist/label.

### Add Earnings Entry
\`POST /api/admin/earnings/add-simple\`
\`\`\`json
{
  "artist_id": "uuid",
  "amount": 100.50,
  "currency": "GBP",
  "source": "spotify",
  "period": "2025-01"
}
\`\`\`

### Update Earnings Status
\`POST /api/admin/earnings/update-status\`
Mark earnings as paid, pending, or disputed.

## Wallet Endpoints

### Get Wallet Balance
\`GET /api/artist/wallet-simple\`
Get current wallet balance and transaction history.

### Request Payout
\`POST /api/wallet/request-payout\`
\`\`\`json
{
  "amount": 100.00,
  "currency": "GBP",
  "payment_method": "revolut" | "bank_transfer"
}
\`\`\`

### Wallet Transactions
\`GET /api/wallet/transactions\`
Get transaction history with pagination.

### Export Wallet Data
\`GET /api/admin/walletmanagement/export\`
Export wallet data as CSV for accounting.

## Financial Reporting

### Revenue Reporting
\`GET /api/distribution/revenue\`
Aggregated revenue reports by platform, period, artist.

### Monthly Statements
\`GET /api/monthly-statement\`
Generate monthly earnings statements.

## Permissions
- \`finance:earnings_management:read\` - View earnings
- \`finance:earnings_management:write\` - Modify earnings
- \`finance:wallet_management:read\` - View wallets
- \`finance:wallet_management:write\` - Manage wallets
- \`revenue:read\` - View revenue reports
`
  },

  {
    id: 'api-005',
    title: 'Analytics API',
    description: 'API endpoints for analytics data, insights, and reporting',
    category: 'API',
    updated_at: new Date().toISOString(),
    content: `# Analytics API

## Analytics Endpoints

### Get Artist Analytics
\`GET /api/artist/analytics-data\`
Get comprehensive analytics for authenticated artist.

### Platform Analytics
\`GET /api/admin/platform-analytics\`
Platform-wide analytics dashboard data.

### Analytics Management
\`GET /api/admin/analyticsmanagement\`
Manage analytics configurations and settings.

## Analytics Data Structure
\`\`\`json
{
  "streams": {
    "total": 1000000,
    "by_platform": {...},
    "by_track": [...],
    "trends": {...}
  },
  "revenue": {
    "total": 5000.00,
    "by_platform": {...},
    "by_track": [...]
  },
  "audience": {
    "demographics": {...},
    "geography": {...},
    "growth": {...}
  }
}
\`\`\`

## Apollo Intelligence API

### Get Insights
\`GET /api/apollo/insights\`
AI-powered insights and recommendations.

### Chat with Apollo
\`POST /api/apollo/chat\`
\`\`\`json
{
  "message": "What are my top performing tracks?",
  "context": "analytics"
}
\`\`\`

## Permissions
- \`analytics:platform_analytics:read\` - View platform analytics
- \`analytics:analytics_management:read\` - View analytics config
- \`analytics:requests:read\` - View analytics requests
`
  },

  {
    id: 'api-006',
    title: 'AI & Machine Learning API',
    description: 'API endpoints for AI features: learning, predictions, recommendations, and intelligence',
    category: 'API',
    updated_at: new Date().toISOString(),
    content: `# AI & Machine Learning API

## AI Learning Endpoints

### Track User Interaction
\`POST /api/ai/learn\`
Track user interactions for ML training.
\`\`\`json
{
  "userId": "uuid",
  "interactionType": "release_create",
  "interactionCategory": "content",
  "metadata": {...}
}
\`\`\`

### Get Intelligence Score
\`GET /api/ai/intelligence/[userId]\`
Get comprehensive AI intelligence insights.

### Predict Next Value
\`POST /api/ai/predict\`
Time-series predictions for streams, revenue, etc.

### Get Recommendations
\`POST /api/ai/recommendation\`
Multi-armed bandit recommendations.

### Detect Behavioral Patterns
\`POST /api/ai/patterns\`
Detect user behavioral patterns and clusters.

### Find Similar Users
\`POST /api/ai/similar-users\`
Collaborative filtering to find similar users.

### Validate Prediction
\`POST /api/ai/validate-prediction\`
Provide feedback for reinforcement learning.

## AI Features

### Apollo Intelligence
- Natural language queries
- Predictive analytics
- Personalized recommendations
- Behavioral analysis

### Hit Prediction
- Track performance prediction
- Release timing optimization
- Genre trend analysis

### Content Generation
- AI artwork generation
- Lyric suggestions
- Playlist matching

## Permissions
- \`features:artwork:manage\` - AI artwork
- \`features:playlists:manage\` - Playlist AI
- \`features:lyrics:manage\` - Lyric AI
`
  },

  {
    id: 'api-007',
    title: 'Label Admin API',
    description: 'API endpoints for label administrators: roster management, artist invitations, releases',
    category: 'API',
    updated_at: new Date().toISOString(),
    content: `# Label Admin API

## Roster Management

### Get Roster
\`GET /api/labeladmin/roster\`
Get all artists and contributors in your label.

### Get Releases
\`GET /api/labeladmin/releases\`
Get all releases from affiliated artists.

### Accepted Artists
\`GET /api/labeladmin/accepted-artists\`
Get list of artists who accepted your invitation.

## Artist Management

### Invite Artist
\`POST /api/labeladmin/invite-artist\`
\`\`\`json
{
  "artist_email": "artist@example.com",
  "message": "Join our label!"
}
\`\`\`

### Affiliation Requests
\`GET /api/labeladmin/affiliation-requests\`
View pending affiliation requests.

## Earnings & Wallet

### Label Earnings
\`GET /api/labeladmin/earnings\`
Get earnings for all affiliated artists.

### Label Wallet
\`GET /api/labeladmin/wallet-simple\`
Get label wallet balance and transactions.

## Permissions
- \`label:roster:read\` - View roster
- \`label:roster:write\` - Manage roster
- \`label:invite:send\` - Send invitations
- \`label:releases:read\` - View label releases
`
  },

  {
    id: 'api-008',
    title: 'Asset Library API',
    description: 'API endpoints for managing storage assets: upload, delete, list files',
    category: 'API',
    updated_at: new Date().toISOString(),
    content: `# Asset Library API

## File Management

### List Files
\`GET /api/admin/assetlibrary\`
\`\`\`json
{
  "page": 1,
  "per_page": 50,
  "search": "filename",
  "sort_by": "created_at",
  "sort_order": "desc"
}
\`\`\`

### Delete File
\`DELETE /api/admin/assetlibrary/delete\`
\`\`\`json
{
  "bucket_id": "release-audio",
  "full_path": "path/to/file.wav"
}
\`\`\`

### Bulk Delete
\`DELETE /api/admin/assetlibrary/delete\`
\`\`\`json
{
  "bucket_id": "release-audio",
  "file_ids": [
    {"bucket_id": "release-audio", "full_path": "file1.wav"},
    {"bucket_id": "release-audio", "full_path": "file2.wav"}
  ]
}
\`\`\`

### Get Stats
\`GET /api/admin/assetlibrary/stats\`
Get storage statistics: total files, size, by type.

## Storage Buckets
- \`release-audio\` - Audio files
- \`release-artwork\` - Artwork images
- \`profile-pictures\` - User profile pictures
- \`email-templates\` - Email templates
- \`asset-library\` - General assets

## Permissions
- \`content:asset_library:read\` - View assets
- \`content:asset_library:write\` - Manage assets
`
  },

  {
    id: 'api-009',
    title: 'Permissions & Roles API',
    description: 'API endpoints for managing RBAC permissions and roles',
    category: 'API',
    updated_at: new Date().toISOString(),
    content: `# Permissions & Roles API

## Permissions

### List Permissions
\`GET /api/admin/permissions/list\`
Get all available permissions.

### Get User Permissions
\`GET /api/user/permissions\`
Get permissions for authenticated user.

## Roles

### List Roles
\`GET /api/admin/roles/list\`
Get all roles and their permissions.

### Get Role Details
\`GET /api/admin/roles/[roleId]\`
Get role details with assigned permissions.

### Update Role
\`PUT /api/admin/roles/[roleId]\`
\`\`\`json
{
  "name": "Custom Role",
  "permissions": ["permission1", "permission2"]
}
\`\`\`

### Create Role
\`POST /api/admin/roles/list\`
Create new custom role.

### Delete Role
\`DELETE /api/admin/roles/[roleId]\`
Delete custom role (cannot delete system roles).

## Permission Format
\`resource:action:scope\`
- \`release:create:own\`
- \`user:view:any\`
- \`analytics:read:label\`

## System Roles
- \`super_admin\` - Full access (\`*:*:*\`)
- \`admin\` - Platform administration
- \`label_admin\` - Label management
- \`artist\` - Content creator

## Permissions Required
- \`users_access:permissions_roles:read\` - View roles/permissions
- \`users_access:permissions_roles:write\` - Modify roles/permissions
`
  },

  {
    id: 'api-010',
    title: 'Webhooks & Events API',
    description: 'API endpoints for webhooks, real-time events, and notifications',
    category: 'API',
    updated_at: new Date().toISOString(),
    content: `# Webhooks & Events API

## Webhook Events

### Available Events
- \`release.approved\` - Release approved for distribution
- \`release.rejected\` - Release rejected
- \`release.distributed\` - Release live on platforms
- \`earnings.updated\` - New earnings recorded
- \`payout.processed\` - Payout completed
- \`user.created\` - New user registered
- \`subscription.activated\` - Subscription activated

## Webhook Configuration

### Register Webhook
\`POST /api/webhooks/register\`
\`\`\`json
{
  "url": "https://your-app.com/webhook",
  "events": ["release.approved", "earnings.updated"],
  "secret": "your-webhook-secret"
}
\`\`\`

### Webhook Payload
\`\`\`json
{
  "event": "release.approved",
  "timestamp": "2025-01-13T12:00:00Z",
  "data": {
    "release_id": "uuid",
    "title": "Album Title",
    "artist_id": "uuid"
  },
  "signature": "hmac-sha256-signature"
}
\`\`\`

## Verification
Verify webhook signature:
\`\`\`javascript
const crypto = require('crypto');
const signature = crypto
  .createHmac('sha256', secret)
  .update(JSON.stringify(payload))
  .digest('hex');
\`\`\`

## Rate Limits
- 1000 webhooks/hour per endpoint
- Retry: 3 attempts with exponential backoff
`
  },

  // ==================== USER GUIDES ====================

  {
    id: 'guide-001',
    title: 'Getting Started Guide',
    description: 'Complete onboarding guide for new users: account setup, profile creation, first release',
    category: 'Guides',
    updated_at: new Date().toISOString(),
    content: `# Getting Started Guide

## Welcome to MSC & Co!

This guide will help you get started with the platform.

## Step 1: Create Your Account
1. Visit the registration page
2. Enter your email and password
3. Verify your email address
4. Complete your profile

## Step 2: Complete Your Profile
- Add your artist name
- Upload profile picture
- Add bio and social links
- Set your payment preferences

## Step 3: Create Your First Release
1. Navigate to Releases → Create New
2. Upload your audio file
3. Add artwork
4. Fill in release details
5. Add track information
6. Submit for distribution

## Step 4: Understanding Your Dashboard
- **Analytics** - Track streams and revenue
- **Releases** - Manage your music
- **Wallet** - View earnings and request payouts
- **Settings** - Configure your account

## Step 5: Distribution
Once approved, your release will be distributed to:
- Spotify
- Apple Music
- Amazon Music
- YouTube Music
- And 8+ more platforms

## Need Help?
- Check our FAQ
- Contact support
- Read user guides
`
  },

  {
    id: 'guide-002',
    title: 'Artist User Guide',
    description: 'Complete guide for artists: releases, analytics, earnings, profile management',
    category: 'Guides',
    updated_at: new Date().toISOString(),
    content: `# Artist User Guide

## Managing Releases

### Creating a Release
1. Go to Releases → Create New
2. Upload audio file (WAV, FLAC, MP3)
3. Upload artwork (JPG, PNG, 3000x3000px)
4. Enter release information:
   - Title
   - Release date
   - Genre
   - Label (if applicable)
5. Add tracks with ISRC codes
6. Review and submit

### Release Statuses
- **Draft** - Work in progress, not submitted
- **Submitted** - Awaiting admin approval
- **Approved** - Approved, preparing for distribution
- **Distributed** - Live on streaming platforms
- **Rejected** - Needs corrections

### Editing Releases
- Drafts can be edited freely
- Submitted releases require admin approval for changes
- Distributed releases cannot be edited

## Analytics Dashboard

### Viewing Analytics
- **Overview** - Total streams, revenue, growth
- **By Platform** - Performance per streaming service
- **By Track** - Individual track performance
- **Audience** - Demographics and geography
- **Trends** - Growth over time

### Apollo Intelligence
Ask Apollo questions:
- "What are my top tracks?"
- "When should I release my next single?"
- "Which genre performs best?"

## Earnings & Wallet

### Viewing Earnings
- Go to Wallet → Earnings
- See earnings by platform, track, period
- Filter by date range
- Export CSV for accounting

### Requesting Payouts
1. Go to Wallet → Request Payout
2. Enter amount (minimum £10)
3. Select payment method
4. Submit request
5. Payouts processed within 5-7 business days

## Profile Management

### Updating Profile
- Edit artist name, bio, social links
- Upload new profile picture
- Update contact information
- Change password and security settings

### API Keys
- Generate API keys for programmatic access
- Set permissions and rate limits
- Revoke keys when needed
`
  },

  {
    id: 'guide-003',
    title: 'Label Admin Guide',
    description: 'Complete guide for label administrators: roster management, artist invitations, label releases',
    category: 'Guides',
    updated_at: new Date().toISOString(),
    content: `# Label Admin Guide

## Managing Your Roster

### Inviting Artists
1. Go to Roster → Invite Artist
2. Enter artist email
3. Add personal message
4. Send invitation
5. Artist receives email and can accept/decline

### Viewing Roster
- See all affiliated artists
- View artist profiles and releases
- Track artist performance
- Manage artist relationships

### Artist Requests
- Artists can request to join your label
- Review requests in Requests section
- Approve or decline with message

## Managing Label Releases

### Viewing All Releases
- See releases from all affiliated artists
- Filter by artist, status, date
- Track release performance
- Manage distribution

### Release Approval
- Artists submit releases for your approval
- Review release details and audio
- Approve or request changes
- Once approved, release goes to admin for distribution

## Label Earnings

### Viewing Earnings
- Aggregate earnings from all artists
- Filter by artist, platform, period
- Export reports for accounting
- Track label revenue trends

### Split Configuration
- Set default revenue splits
- Configure per-release splits
- Manage contributor percentages
- Handle label share vs artist share

## Label Settings

### Profile Settings
- Update label name and branding
- Upload label logo
- Set contact information
- Configure notification preferences

### Label Policies
- Set release approval requirements
- Configure default splits
- Define label guidelines
- Manage label terms
`
  },

  {
    id: 'guide-004',
    title: 'Admin User Guide',
    description: 'Complete guide for platform administrators: user management, content moderation, system administration',
    category: 'Guides',
    updated_at: new Date().toISOString(),
    content: `# Admin User Guide

## User Management

### Managing Users
- View all platform users
- Filter by role, status, date
- Edit user profiles
- Change user roles
- Activate/deactivate users
- Suspend users for violations

### User Roles
- **Artist** - Content creators
- **Label Admin** - Label administrators
- **Admin** - Platform administrators
- **Super Admin** - Full system access

### User Statuses
- **Active** - Can use platform
- **Inactive** - Temporarily disabled
- **Pending** - Awaiting approval
- **Suspended** - Banned

## Content Moderation

### Moderation Queue
- Review submitted releases
- Check audio quality
- Verify metadata accuracy
- Approve or reject releases
- Request changes from artists

### Moderation Guidelines
- Audio quality standards
- Metadata requirements
- Artwork specifications
- Copyright compliance
- Content policy enforcement

## Earnings Management

### Managing Earnings
- Add earnings entries
- Update earnings status
- Process payouts
- Handle disputes
- Generate reports

### Wallet Management
- View all user wallets
- Process payout requests
- Handle refunds
- Export financial data
- Monitor transactions

## Platform Analytics

### Dashboard Analytics
- Platform-wide metrics
- User growth trends
- Revenue analytics
- Content statistics
- Performance monitoring

### Analytics Management
- Configure analytics settings
- Set up custom reports
- Manage data retention
- Export analytics data
`
  },

  {
    id: 'guide-005',
    title: 'SuperAdmin Guide',
    description: 'Complete guide for super administrators: system administration, permissions, ghost login, platform configuration',
    category: 'Guides',
    updated_at: new Date().toISOString(),
    content: `# SuperAdmin Guide

## System Administration

### Systems Overview
- Monitor platform health
- View system metrics
- Check error logs
- Review performance data
- Manage backups

### Permissions & Roles
- Create custom roles
- Assign permissions
- Manage role hierarchies
- Configure access controls
- Audit permission usage

## Ghost Login

### Using Ghost Login
1. Go to SuperAdmin → Ghost Login
2. Search for user by email
3. Click "Start Ghost Login"
4. Confirm action
5. Login as that user for support/debugging

### Use Cases
- Debugging user issues
- Providing support
- Testing user experience
- Investigating problems

## Platform Configuration

### System Settings
- Configure platform-wide settings
- Manage feature flags
- Set up integrations
- Configure email templates
- Manage system notifications

### Security Dashboard
- Monitor security events
- Review access logs
- Check for suspicious activity
- Manage security policies
- Configure rate limits

## Error Tracking

### Viewing Errors
- See all platform errors
- Filter by severity, type, date
- View error details and stack traces
- Track error trends
- Resolve errors

### Performance Monitoring
- Monitor API response times
- Track database performance
- View cache hit rates
- Monitor queue processing
- Optimize slow queries
`
  },

  {
    id: 'guide-006',
    title: 'Release Submission Guide',
    description: 'Step-by-step guide for submitting releases: requirements, best practices, common mistakes',
    category: 'Guides',
    updated_at: new Date().toISOString(),
    content: `# Release Submission Guide

## Before You Submit

### Audio Requirements
- **Format**: WAV, FLAC, or high-quality MP3 (320kbps)
- **Sample Rate**: 44.1kHz or 48kHz
- **Bit Depth**: 16-bit or 24-bit
- **Mastering**: Professionally mastered audio
- **Loudness**: -14 LUFS (industry standard)

### Artwork Requirements
- **Format**: JPG or PNG
- **Dimensions**: 3000x3000px (square)
- **Resolution**: 300 DPI minimum
- **File Size**: Under 5MB
- **Content**: No copyrighted material, explicit content warnings if needed

### Metadata Requirements
- **Title**: Release title
- **Artist Name**: Your artist name
- **Release Date**: Future date (at least 7 days ahead)
- **Genre**: Select from list
- **Label**: Optional
- **Copyright**: Your copyright information
- **ISRC Codes**: Required for each track

## Submission Process

### Step 1: Upload Files
1. Upload audio file (master or individual tracks)
2. Upload artwork
3. Verify file quality

### Step 2: Enter Metadata
1. Release information
2. Track details
3. Contributor information
4. Rights and ownership

### Step 3: Review
1. Preview release
2. Check all information
3. Verify audio quality
4. Confirm artwork

### Step 4: Submit
1. Click "Submit for Distribution"
2. Confirmation email sent
3. Admin review (24-48 hours)
4. Approval and distribution

## Common Mistakes

### Audio Issues
- Low quality files
- Incorrect sample rate
- Over-compressed audio
- Missing tracks

### Artwork Issues
- Wrong dimensions
- Low resolution
- Copyright violations
- Inappropriate content

### Metadata Issues
- Missing required fields
- Incorrect ISRC codes
- Wrong release date
- Typos in artist name

## Best Practices
- Submit 2-3 weeks before release date
- Use professional mastering
- Double-check all metadata
- Preview before submitting
- Keep backup files
`
  },

  {
    id: 'guide-007',
    title: 'Analytics & Reporting Guide',
    description: 'Guide to understanding analytics, generating reports, and using data insights',
    category: 'Guides',
    updated_at: new Date().toISOString(),
    content: `# Analytics & Reporting Guide

## Understanding Your Analytics

### Key Metrics

#### Streams
- **Total Streams** - All-time play count
- **Streams by Platform** - Performance per service
- **Streams by Track** - Individual track performance
- **Stream Trends** - Growth over time

#### Revenue
- **Total Revenue** - All-time earnings
- **Revenue by Platform** - Earnings per service
- **Revenue by Track** - Track earnings
- **Revenue Trends** - Earnings growth

#### Audience
- **Demographics** - Age, gender breakdown
- **Geography** - Top countries/cities
- **Growth** - Follower/subscriber growth
- **Engagement** - Save, share, playlist adds

## Generating Reports

### Standard Reports
- **Daily Report** - Today's performance
- **Weekly Report** - Last 7 days
- **Monthly Report** - Last 30 days
- **Yearly Report** - Annual summary

### Custom Reports
1. Select date range
2. Choose metrics
3. Filter by platform/track
4. Generate report
5. Export as CSV/PDF

## Apollo Intelligence

### Asking Questions
- "What are my top 10 tracks?"
- "Which platform generates most revenue?"
- "When should I release my next single?"
- "What genre performs best for me?"

### Insights
- Performance predictions
- Release timing recommendations
- Genre trend analysis
- Audience growth forecasts

## Exporting Data

### CSV Export
- Download raw data
- Import to Excel/Google Sheets
- Create custom visualizations
- Share with team/accountant

### PDF Reports
- Professional formatted reports
- Include charts and graphs
- Perfect for presentations
- Share with stakeholders
`
  },

  {
    id: 'guide-008',
    title: 'Earnings & Payouts Guide',
    description: 'Complete guide to understanding earnings, requesting payouts, and managing finances',
    category: 'Guides',
    updated_at: new Date().toISOString(),
    content: `# Earnings & Payouts Guide

## Understanding Earnings

### Earnings Sources
- **Streaming Revenue** - Spotify, Apple Music, etc.
- **Download Sales** - iTunes, Amazon, etc.
- **YouTube Revenue** - YouTube Music, Content ID
- **Sync Licensing** - TV, film, commercials
- **Performance Royalties** - Radio, live performances

### Earnings Calculation
- Platform-specific rates
- Your royalty percentage
- Label/contributor splits
- Currency conversion
- Payment processing fees

## Viewing Earnings

### Dashboard View
- Total earnings
- Earnings by platform
- Earnings by track
- Earnings by period
- Growth trends

### Detailed View
- Individual transactions
- Payment dates
- Currency breakdown
- Tax information
- Export options

## Requesting Payouts

### Payout Requirements
- Minimum balance: £10 GBP
- Verified payment method
- Completed tax forms (if applicable)
- No pending disputes

### Payout Process
1. Go to Wallet → Request Payout
2. Enter amount (minimum £10)
3. Select payment method:
   - Revolut (instant, recommended)
   - Bank Transfer (5-7 business days)
4. Confirm request
5. Receive payment

### Payout Timeline
- **Revolut**: Instant (within 24 hours)
- **Bank Transfer**: 5-7 business days
- Processing: 1-2 business days
- Total: 1-9 business days

## Tax & Accounting

### Tax Information
- Earnings are reported to HMRC
- You're responsible for tax payments
- Export data for accountant
- Keep records for 7 years

### Accounting Export
- CSV export available
- Includes all transactions
- Formatted for accounting software
- Monthly/yearly summaries
`
  },

  // ==================== TECHNICAL REFERENCE ====================

  {
    id: 'ref-001',
    title: 'Platform Architecture',
    description: 'Technical architecture overview: system design, infrastructure, technology stack',
    category: 'Reference',
    updated_at: new Date().toISOString(),
    content: `# Platform Architecture

## System Overview

MSC & Co is built as a modern, scalable, AI-native music distribution platform.

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: JavaScript/TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks, Context API
- **Authentication**: Supabase Auth

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Database**: PostgreSQL (Supabase)
- **Storage**: Supabase Storage (S3-compatible)
- **Cache**: Redis
- **Queue**: Inngest

### Infrastructure
- **Hosting**: Vercel (Frontend/API)
- **Database**: Supabase (PostgreSQL)
- **CDN**: Vercel Edge Network
- **Monitoring**: Sentry, PostHog
- **Analytics**: PostHog, Custom Analytics

## Architecture Patterns

### API Design
- RESTful API endpoints
- JSON request/response
- Bearer token authentication
- Role-based access control (RBAC)

### Database Design
- PostgreSQL relational database
- Row-level security (RLS)
- Foreign key relationships
- Indexed queries for performance

### Storage Architecture
- Supabase Storage buckets
- Signed URLs for file access
- CDN distribution
- Automatic backups

## Scalability

### Horizontal Scaling
- Stateless API design
- Serverless functions
- Auto-scaling on Vercel
- Database connection pooling

### Performance Optimization
- Redis caching
- Database query optimization
- CDN for static assets
- Lazy loading and code splitting

## Security

### Authentication
- Supabase Auth (JWT tokens)
- Session management
- API key authentication
- OAuth integrations

### Authorization
- RBAC permission system
- Row-level security
- API rate limiting
- Input validation
`
  },

  {
    id: 'ref-002',
    title: 'Database Schema Reference',
    description: 'Complete database schema documentation: tables, relationships, indexes, constraints',
    category: 'Reference',
    updated_at: new Date().toISOString(),
    content: `# Database Schema Reference

## Core Tables

### user_profiles
User profile information
\`\`\`sql
- id (uuid, PK)
- email (text)
- first_name (text)
- last_name (text)
- artist_name (text)
- role (text)
- created_at (timestamp)
- updated_at (timestamp)
\`\`\`

### releases
Music releases
\`\`\`sql
- id (uuid, PK)
- artist_id (uuid, FK → user_profiles)
- title (text)
- release_date (date)
- status (text)
- genre (text)
- audio_file_url (text)
- artwork_url (text)
- created_at (timestamp)
- updated_at (timestamp)
\`\`\`

### tracks
Individual tracks
\`\`\`sql
- id (uuid, PK)
- release_id (uuid, FK → releases)
- title (text)
- isrc_code (text)
- track_number (integer)
- duration (integer)
- created_at (timestamp)
\`\`\`

### earnings
Earnings records
\`\`\`sql
- id (uuid, PK)
- artist_id (uuid, FK → user_profiles)
- amount (decimal)
- currency (text)
- source (text)
- period (text)
- status (text)
- created_at (timestamp)
\`\`\`

### wallets
User wallets
\`\`\`sql
- id (uuid, PK)
- user_id (uuid, FK → user_profiles)
- balance (decimal)
- currency (text)
- updated_at (timestamp)
\`\`\`

### permissions
RBAC permissions
\`\`\`sql
- id (uuid, PK)
- name (text, unique)
- description (text)
- resource (text)
- action (text)
- scope (text)
\`\`\`

### roles
User roles
\`\`\`sql
- id (uuid, PK)
- name (text, unique)
- description (text)
- is_system_role (boolean)
\`\`\`

### role_permissions
Role-permission mapping
\`\`\`sql
- role_id (uuid, FK → roles)
- permission_id (uuid, FK → permissions)
\`\`\`

## Relationships

### User → Releases
One-to-many: One user can have many releases

### Release → Tracks
One-to-many: One release can have many tracks

### User → Earnings
One-to-many: One user can have many earnings records

### User → Wallet
One-to-one: One user has one wallet

### Role → Permissions
Many-to-many: Roles have multiple permissions

## Indexes

### Performance Indexes
- \`user_profiles.email\` - Unique index
- \`releases.artist_id\` - Index for user queries
- \`releases.status\` - Index for filtering
- \`earnings.artist_id\` - Index for earnings queries
- \`earnings.period\` - Index for date range queries

## Row-Level Security (RLS)

### Policies
- Users can only view/edit their own data
- Admins can view/edit all data
- Label admins can view/edit label data
- Public data (releases) visible to all
`
  },

  {
    id: 'ref-003',
    title: 'Security Best Practices',
    description: 'Security guidelines: authentication, authorization, data protection, API security',
    category: 'Reference',
    updated_at: new Date().toISOString(),
    content: `# Security Best Practices

## Authentication Security

### Password Requirements
- Minimum 8 characters
- Mix of uppercase, lowercase, numbers
- Special characters recommended
- No common passwords
- Regular password updates

### Session Management
- Secure HTTP-only cookies
- CSRF protection
- Session timeout (24 hours)
- Token rotation
- Secure token storage

### API Key Security
- Store keys securely (never in code)
- Rotate keys regularly
- Use environment variables
- Set appropriate permissions
- Monitor key usage

## Authorization

### Role-Based Access Control
- Principle of least privilege
- Granular permissions
- Regular permission audits
- Role separation
- SuperAdmin protection

### Data Access
- Row-level security (RLS)
- User data isolation
- Admin audit logs
- Access monitoring
- Unauthorized access alerts

## Data Protection

### Encryption
- Data at rest: Database encryption
- Data in transit: TLS/SSL
- Sensitive data: Additional encryption
- API keys: Encrypted storage
- Passwords: Hashed (bcrypt)

### Privacy
- GDPR compliance
- Data minimization
- User data export
- Right to deletion
- Privacy by design

## API Security

### Rate Limiting
- Per-user limits
- Per-IP limits
- Per-endpoint limits
- Burst protection
- DDoS mitigation

### Input Validation
- Sanitize all inputs
- Validate data types
- Check data ranges
- Prevent SQL injection
- Prevent XSS attacks

### Error Handling
- Don't expose sensitive info
- Generic error messages
- Log errors securely
- Monitor error patterns
- Alert on anomalies

## Monitoring & Auditing

### Security Monitoring
- Failed login attempts
- Unusual access patterns
- Permission changes
- Data exports
- Admin actions

### Audit Logs
- User actions logged
- Admin actions logged
- Permission changes logged
- Data access logged
- Retention: 1 year minimum
`
  },

  {
    id: 'ref-004',
    title: 'Deployment & Infrastructure',
    description: 'Deployment guide: environment setup, CI/CD, monitoring, scaling',
    category: 'Reference',
    updated_at: new Date().toISOString(),
    content: `# Deployment & Infrastructure

## Environment Setup

### Required Environment Variables
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_VERCEL_URL=
DATABASE_URL=
REDIS_URL=
SENTRY_DSN=
POSTHOG_KEY=
\`\`\`

### Development Setup
1. Clone repository
2. Install dependencies: \`npm install\`
3. Copy \`.env.local.example\` to \`.env.local\`
4. Fill in environment variables
5. Run migrations: \`npm run migrate\`
6. Start dev server: \`npm run dev\`

## Deployment

### Vercel Deployment
1. Connect GitHub repository
2. Configure build settings
3. Set environment variables
4. Deploy automatically on push
5. Monitor deployment status

### Database Migrations
- Run migrations before deployment
- Test migrations in staging
- Backup database before migration
- Rollback plan ready
- Monitor migration status

## CI/CD Pipeline

### Automated Testing
- Unit tests
- Integration tests
- E2E tests
- Linting
- Type checking

### Deployment Stages
1. **Development** - Auto-deploy on push
2. **Staging** - Deploy on merge to staging
3. **Production** - Deploy on merge to main

## Monitoring

### Application Monitoring
- Error tracking (Sentry)
- Performance monitoring
- User analytics (PostHog)
- API monitoring
- Database monitoring

### Alerts
- Error rate thresholds
- Performance degradation
- Database issues
- API failures
- Security events

## Scaling

### Horizontal Scaling
- Stateless application design
- Load balancing
- Auto-scaling on demand
- Database read replicas
- CDN for static assets

### Performance Optimization
- Database query optimization
- Redis caching
- CDN caching
- Code splitting
- Image optimization
`
  },

  {
    id: 'ref-005',
    title: 'API Rate Limits & Quotas',
    description: 'Complete reference for API rate limits, quotas, and usage guidelines',
    category: 'Reference',
    updated_at: new Date().toISOString(),
    content: `# API Rate Limits & Quotas

## Rate Limits

### Default Limits
- **Unauthenticated**: 10 requests/minute
- **Authenticated User**: 200 requests/minute
- **API Key**: 100 requests/minute (configurable)
- **SuperAdmin**: Unlimited

### Per-Endpoint Limits
- **Analytics API**: 50 requests/minute
- **Earnings API**: 30 requests/minute
- **Release API**: 20 requests/minute
- **User API**: 100 requests/minute

## Quotas

### Free Tier
- 3 releases/year
- 15 tracks/year
- 3 Apollo queries/month
- Basic analytics
- Standard support

### Paid Tiers
- Unlimited releases
- Unlimited tracks
- More Apollo queries
- Advanced analytics
- Priority support

## Rate Limit Headers

### Response Headers
\`\`\`
X-RateLimit-Limit: 200
X-RateLimit-Remaining: 150
X-RateLimit-Reset: 1640995200
\`\`\`

### Rate Limit Exceeded
\`\`\`json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests",
  "retry_after": 60
}
\`\`\`
Status: 429 Too Many Requests

## Best Practices

### Handling Rate Limits
- Implement exponential backoff
- Cache responses when possible
- Batch requests when available
- Monitor rate limit headers
- Use webhooks instead of polling

### Optimizing Usage
- Use pagination for large datasets
- Request only needed fields
- Use filters to reduce data
- Cache frequently accessed data
- Use webhooks for real-time updates
`
  },

  {
    id: 'ref-006',
    title: 'Error Codes Reference',
    description: 'Complete reference for all API error codes, meanings, and resolution',
    category: 'Reference',
    updated_at: new Date().toISOString(),
    content: `# Error Codes Reference

## Authentication Errors

### AUTH_ERROR (401)
\`\`\`json
{
  "error": "Unauthorized",
  "code": "AUTH_ERROR",
  "message": "Invalid or expired token"
}
\`\`\`
**Resolution**: Refresh token or re-authenticate

### AUTH_REQUIRED (401)
\`\`\`json
{
  "error": "Authentication required",
  "code": "AUTH_REQUIRED"
}
\`\`\`
**Resolution**: Include authentication token

## Authorization Errors

### FORBIDDEN (403)
\`\`\`json
{
  "error": "Forbidden",
  "code": "FORBIDDEN",
  "message": "Insufficient permissions"
}
\`\`\`
**Resolution**: Check user permissions

### PERMISSION_DENIED (403)
\`\`\`json
{
  "error": "Permission denied",
  "code": "PERMISSION_DENIED",
  "required_permission": "release:edit:any"
}
\`\`\`
**Resolution**: Request permission from admin

## Validation Errors

### VALIDATION_ERROR (400)
\`\`\`json
{
  "error": "Validation error",
  "code": "VALIDATION_ERROR",
  "fields": {
    "title": "Title is required",
    "release_date": "Invalid date format"
  }
}
\`\`\`
**Resolution**: Fix validation errors

### INVALID_INPUT (400)
\`\`\`json
{
  "error": "Invalid input",
  "code": "INVALID_INPUT",
  "message": "File size exceeds limit"
}
\`\`\`
**Resolution**: Check input requirements

## Resource Errors

### NOT_FOUND (404)
\`\`\`json
{
  "error": "Not found",
  "code": "NOT_FOUND",
  "message": "Release not found"
}
\`\`\`
**Resolution**: Check resource ID

### CONFLICT (409)
\`\`\`json
{
  "error": "Conflict",
  "code": "CONFLICT",
  "message": "Resource already exists"
}
\`\`\`
**Resolution**: Use existing resource or update

## Server Errors

### INTERNAL_ERROR (500)
\`\`\`json
{
  "error": "Internal server error",
  "code": "INTERNAL_ERROR",
  "message": "An unexpected error occurred"
}
\`\`\`
**Resolution**: Retry request or contact support

### SERVICE_UNAVAILABLE (503)
\`\`\`json
{
  "error": "Service unavailable",
  "code": "SERVICE_UNAVAILABLE",
  "retry_after": 60
}
\`\`\`
**Resolution**: Wait and retry

## Rate Limit Errors

### RATE_LIMIT_EXCEEDED (429)
\`\`\`json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "retry_after": 60
}
\`\`\`
**Resolution**: Wait before retrying
`
  }
]

// Also export as default for compatibility
export default comprehensiveDocs

