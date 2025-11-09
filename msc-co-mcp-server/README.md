# 🎵 MSC & Co MCP Server v2.2.0

**The Most Comprehensive Music Distribution MCP Ever Built!**

**Copyright © 2025 AUDIOMSC LTD. All Rights Reserved.**
Company No. 13250829 (England & Wales)

---

## ⚠️ CONFIDENTIAL AND PROPRIETARY

This repository contains proprietary and confidential information belonging to AUDIOMSC LTD.
Unauthorized access, copying, distribution, or use is strictly prohibited.

**Patent Pending** | **Trademarks Pending**

For licensing inquiries: legal@audiomsc.com

---

Manage your music releases, check earnings, and analyze performance directly from Claude Desktop, Cursor, or any MCP-compatible AI assistant.

**NEW in v2.2.0**: 1,220+ comprehensive enums including 94 languages, 209 countries, 102 instruments, 57 mood tags, 26 musical keys, and complete workflow statuses!

---

## 🎯 What Makes This Special

- **134+ Tools** - Complete coverage of all music distribution operations
- **900+ Comprehensive Enums** - Industry-standard validation for all fields
- **212 Music Genres** - From Hip-Hop to Afrobeats to Classical
- **94 Languages (ISO 639-1)** - Global language support
- **209 Countries (ISO 3166-1)** - Worldwide distribution coverage
- **56 Contributor Roles** - Proper attribution for all collaborators
- **102 Instruments** - Detailed instrument tagging
- **57 Mood Tags** - Rich categorization for discovery
- **27 Track Versions** - All variations (remixes, acoustic, live, etc.)
- **30 Territories** - Granular distribution control
- **Production-Ready** - Professional-grade metadata validation

---

## ✨ Features

### Artist Management
- 🎤 **Artist Onboarding** - Check or create artist accounts with payment setup
- 👤 **Profile Management** - Update profile, bio, social links with country validation
- 🖼️ **Profile Pictures** - Upload and manage artist images

### Release & Track Management
- 📀 **Manage Releases** - View, create, and search music releases
- 🎵 **Track Uploads** - Upload audio files (WAV, FLAC, ALAC, MP3, AAC, etc.)
- 🎨 **Rich Metadata** - Languages, moods, instruments, time signatures, BPM, key
- 🚀 **Distribution** - Submit tracks to 18+ streaming platforms
- 🏷️ **Professional Attribution** - 56 contributor roles for proper credits
- ©️ **Copyright Management** - 8 copyright types, 13 license options

### Earnings & Payments
- 💰 **Check Earnings** - Real-time earnings from all streaming platforms
- 💸 **Request Payouts** - Withdraw accumulated earnings instantly
- 👛 **Wallet Management** - Check balance and pending payments
- 💱 **Multi-Currency** - Support for 9 currencies (GBP, USD, EUR, NGN, etc.)

### Analytics & Insights
- 📊 **Analytics** - Streaming stats, top platforms, and geographic data
- 🌍 **Geographic Analytics** - Where your fans are listening
- 📈 **Platform Stats** - Overview of your entire music career
- 🎯 **Track Performance** - Individual track analytics

### Notifications & Support
- 🔔 **Notifications** - 16 notification types including earnings, releases, analytics
- 📧 **Support** - Contact support with 16 specialized categories

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- An active MSC & Co account
- An API key from your MSC & Co dashboard

### Installation

```bash
npm install -g @msc-co/mcp-server
```

### Configuration

#### For Claude Desktop

Edit your Claude Desktop config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

Add this configuration:

```json
{
  "mcpServers": {
    "msc-co": {
      "command": "npx",
      "args": ["-y", "@msc-co/mcp-server"],
      "env": {
        "MSC_CO_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

#### For Cursor

Edit your Cursor MCP settings:

```json
{
  "mcpServers": {
    "msc-co": {
      "command": "npx",
      "args": ["-y", "@msc-co/mcp-server"],
      "env": {
        "MSC_CO_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### Get Your API Key

1. Log in to [MSC & Co](https://mscandco.com)
2. Go to **Settings** → **API Keys**
3. Click **Generate New API Key**
4. Copy the key and paste it in your config above

---

## 💡 Example Usage

Once configured, you can talk to Claude/Cursor naturally:

### 🎤 Create Artist Account
```
You: "I'm a new artist. Check if I have an account with email artist@example.com.
If not, create one with artist name 'John Doe', legal name 'Jonathan Doe',
and PayPal payment to john@example.com"

Claude: *uses check_or_create_account*
"I've created a new MSC & Co account for you! Your artist ID is abc123.
You're all set up with PayPal payments. Let's upload your first track!"
```

### 🎵 Upload a Track
```
You: "Upload my track from ~/Music/my-song.mp3.
Title is 'Summer Vibes', genre is Hip-Hop, not explicit"

Claude: *uses upload_track*
"Track uploaded successfully! 'Summer Vibes' (Hip-Hop) - Track ID: xyz789
Duration: 3:42. Ready to submit for distribution."
```

### 🚀 Submit for Distribution
```
You: "Submit my track xyz789 for distribution to Spotify, Apple Music,
and YouTube Music. Release date December 1st 2025.
Use artwork from ~/Pictures/cover.jpg"

Claude: *uses submit_distribution*
"Track submitted for distribution! Release ID: rel456
Status: Processing
Expected live date: December 1st, 2025
Platforms: Spotify, Apple Music, YouTube Music
Your track will be reviewed and go live on the scheduled date."
```

### 💰 Check Your Earnings
```
You: "What were my Spotify earnings last month?"

Claude: *uses get_earnings*
"You earned £847.32 from Spotify in the last month,
which is up 23% from the previous month. Your top
track was 'Summer Vibes' with 125,000 streams."
```

### 💸 Request Payout
```
You: "I want to withdraw £200 from my earnings"

Claude: *uses request_payout*
"Payout request submitted!
Amount: £200
Payout ID: pay789
ETA: 3-5 business days
Status: Pending
The funds will be sent to your PayPal account."
```

### 📀 Create a Release
```
You: "I want to release a new single called 'Summer Vibes',
it's a hip-hop track"

Claude: *uses create_release*
"I've created a draft release for 'Summer Vibes' (Hip-Hop single).
You can complete the release details at
https://mscandco.com/artist/releases"
```

### 📊 Check Analytics
```
You: "Which platform is performing best for me?"

Claude: *uses get_analytics*
"Spotify is your top platform with 847,000 total streams (62%
of all streams), followed by Apple Music with 312,000 streams (23%).
Your streams on Spotify increased 34% this month!"
```

### 📈 Get Platform Overview
```
You: "Give me an overview of my music career"

Claude: *uses get_platform_stats*
"Here's your MSC & Co summary:
- 12 total releases (8 live, 4 drafts)
- £2,847.32 total earned
- £432.12 pending earnings
- £1,247.89 available in wallet
- 1.2M total streams
- Spotify is your top platform"
```

---

## 🛠️ Available Tools

The MCP server provides these tools to AI assistants:

### 🎤 Artist Management
| Tool | Description |
|------|-------------|
| `check_or_create_account` | Check if artist has account, create if not (includes payment setup) |
| `get_profile` | Get artist profile information |

### 🎵 Music Distribution
| Tool | Description |
|------|-------------|
| `upload_track` | Upload audio files (MP3, WAV, FLAC) for distribution |
| `submit_distribution` | Submit track to streaming platforms with artwork |
| `create_release` | Create a new draft release |
| `get_releases` | Get all releases with optional status filter |
| `get_release_details` | Get detailed info about a specific release |
| `search_releases` | Search releases by title or genre |

### 💰 Earnings & Payments
| Tool | Description |
|------|-------------|
| `get_earnings` | Get earnings summary by timeframe and platform |
| `get_wallet_balance` | Check current wallet balance and pending funds |
| `request_payout` | Request payout of accumulated earnings (min £50) |

### 📊 Analytics & Platform
| Tool | Description |
|------|-------------|
| `get_analytics` | Get streaming analytics and performance metrics |
| `get_platform_stats` | Get overall platform statistics |
| `get_notifications` | Get recent platform notifications |

---

## 🔒 Security

- Your API key is stored locally and never shared
- All API calls are made over HTTPS
- API keys can be revoked anytime in your MSC & Co dashboard
- MCP servers run locally on your machine

---

## 🐛 Troubleshooting

### "MSC_CO_API_KEY environment variable is required"

Make sure you've added your API key to the config file as shown above.

### "API error (401): Unauthorized"

Your API key may be invalid or expired. Generate a new one at https://mscandco.com/artist/settings

### Server not showing up in Claude Desktop

1. Restart Claude Desktop completely
2. Check the config file path is correct
3. Ensure the JSON is valid (use a JSON validator)

---

## 📚 Documentation

Full API documentation: https://developers.mscandco.com

---

## 🤝 Support

- **Email**: support@mscandco.com
- **Discord**: https://discord.gg/mscandco
- **GitHub Issues**: https://github.com/MSCandCo/msc-co-mcp-server/issues

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🎉 About MSC & Co

MSC & Co is the most advanced music distribution platform in the world, powered by AI to help artists succeed.

- **Website**: https://mscandco.com
- **Twitter**: [@MSCandCo](https://twitter.com/MSCandCo)
- **Instagram**: [@MSCandCo](https://instagram.com/MSCandCo)

---

**Made with ❤️ by MSC & Co**

