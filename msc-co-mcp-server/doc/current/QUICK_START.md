# 🚀 Quick Start - MSC & Co MCP Server

## ⚡ 3-Minute Setup

### **1. Configure Claude Desktop**

**Run the setup script:**
```bash
cd ~/Documents/MSC\ \&\ Co/msc-co-mcp-server
./setup-claude.sh
```

**OR manually edit config:**

```bash
# macOS
open ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Windows
notepad %APPDATA%\Claude\claude_desktop_config.json
```

**Add this:**
```json
{
  "mcpServers": {
    "msc-co": {
      "command": "npx",
      "args": ["-y", "@mscandco/mcp-server@latest"],
      "env": {
        "MSC_CO_API_KEY": "your-api-key-here",
        "MSC_CO_API_URL": "https://staging.mscandco.com"
      }
    }
  }
}
```

### **2. Restart Claude Desktop**

Completely quit and reopen Claude Desktop.

### **3. Test It**

Open a new conversation and say:

```
"What MCP tools do you have access to?"
```

You should see 15 MSC & Co tools listed! ✅

---

## 🎯 Common Tasks

### **Create Account**
```
Check if john@example.com has an MSC account.
If not, create one with artist name "John Doe",
legal name "John Michael Doe", and PayPal payments to john@paypal.com
```

### **Upload Track**
```
Upload ~/Music/my-song.mp3
Title: "Summer Vibes"
Genre: Hip Hop
Artist ID: [your-artist-id]
```

### **Submit for Distribution**
```
Submit track [track-id] to Spotify and Apple Music
Release date: 2025-12-01
Cover art: ~/Pictures/cover.jpg
```

### **Check Earnings**
```
What are my earnings this month?
```

### **Request Payout**
```
Request a payout of £100
Artist ID: [your-artist-id]
```

---

## 📚 Full Documentation

- **Detailed Guide:** [CLAUDE_USAGE_GUIDE.md](./CLAUDE_USAGE_GUIDE.md)
- **All Tools:** [README.md](./README.md)
- **Publishing:** [PUBLISH_v1.1.md](./PUBLISH_v1.1.md)
- **Changelog:** [CHANGELOG.md](./CHANGELOG.md)

---

## 🐛 Troubleshooting

**Tools not showing up?**
- Verify JSON syntax (use jsonlint.com)
- Restart Claude Desktop completely
- Check logs: `~/Library/Logs/Claude/`

**"API key required" error?**
- Add API key to config
- Get key at: https://mscandco.com/artist/settings
- Restart Claude Desktop

**"File not found" error?**
- Use absolute paths: `/Users/you/Music/song.mp3`
- Not relative: `~/Music/song.mp3`

---

## ✨ That's It!

You can now manage your entire music career through Claude! 🎵

**Need help?** Just ask Claude - it understands natural language!
