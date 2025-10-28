# 🎵 MSC & Co MCP Server

**The world's first MCP server for music distribution!**

Manage your music releases, check earnings, and analyze performance directly from Claude Desktop, Cursor, or any MCP-compatible AI assistant.

---

## ✨ Features

- 📀 **Manage Releases** - View, create, and search music releases
- 💰 **Check Earnings** - Real-time earnings from Spotify, Apple Music, and more
- 📊 **Analytics** - Streaming stats, top platforms, and geographic data
- 👛 **Wallet Management** - Check balance and pending payments
- 🔔 **Notifications** - Get platform updates
- 📈 **Platform Stats** - Overview of your entire music career

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

### Check Your Earnings
```
You: "What were my Spotify earnings last month?"

Claude: *uses MSC & Co MCP*
"You earned £847.32 from Spotify in the last month, 
which is up 23% from the previous month. Your top 
track was 'Summer Vibes' with 125,000 streams."
```

### Create a Release
```
You: "I want to release a new single called 'Summer Vibes', 
it's a hip-hop track"

Claude: *uses MSC & Co MCP*
"I've created a draft release for 'Summer Vibes' (Hip-Hop single). 
You can complete the release details at 
https://mscandco.com/artist/releases"
```

### Check Analytics
```
You: "Which platform is performing best for me?"

Claude: *uses MSC & Co MCP*
"Spotify is your top platform with 847,000 total streams (62% 
of all streams), followed by Apple Music with 312,000 streams (23%). 
Your streams on Spotify increased 34% this month!"
```

### Get Platform Overview
```
You: "Give me an overview of my music career"

Claude: *uses MSC & Co MCP*
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

| Tool | Description |
|------|-------------|
| `get_releases` | Get all releases with optional status filter |
| `get_earnings` | Get earnings summary by timeframe and platform |
| `get_wallet_balance` | Check current wallet balance and pending funds |
| `get_analytics` | Get streaming analytics and performance metrics |
| `create_release` | Create a new draft release |
| `get_profile` | Get artist profile information |
| `get_platform_stats` | Get overall platform statistics |
| `get_release_details` | Get detailed info about a specific release |
| `search_releases` | Search releases by title or genre |
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

