# 🎵 Using MSC & Co MCP Server in Claude Desktop

This guide shows you exactly how to set up and use the MSC & Co MCP tools in Claude Desktop.

---

## 📋 Prerequisites

Before you start, you need:
1. ✅ Claude Desktop app installed ([download here](https://claude.ai/download))
2. ✅ An MSC & Co account with API key
3. ✅ Node.js 18+ installed

---

## 🚀 Installation

### **Option A: Use Published Package (Recommended)**

If you've published to npm:

1. **Open Claude Desktop config file:**

   **macOS:**
   ```bash
   open ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

   **Windows:**
   ```bash
   notepad %APPDATA%\Claude\claude_desktop_config.json
   ```

2. **Add this configuration:**

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

   Replace `your-api-key-here` with your actual MSC & Co API key.

3. **Restart Claude Desktop completely**

### **Option B: Test Locally (Before Publishing)**

To test before publishing to npm:

1. **Open Claude Desktop config:**
   ```bash
   open ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

2. **Add this configuration:**
   ```json
   {
     "mcpServers": {
       "msc-co-local": {
         "command": "node",
         "args": ["/Users/htay/Documents/MSC & Co/msc-co-mcp-server/build/index.js"],
         "env": {
           "MSC_CO_API_KEY": "your-api-key-here",
           "MSC_CO_API_URL": "https://staging.mscandco.com"
         }
       }
     }
   }
   ```

3. **Restart Claude Desktop**

---

## ✅ Verify Installation

After restarting Claude Desktop:

1. Open a new conversation in Claude Desktop
2. Type: **"What MCP tools do you have access to?"**
3. Claude should list the MSC & Co tools including:
   - check_or_create_account
   - upload_track
   - submit_distribution
   - request_payout
   - (plus 10 other existing tools)

---

## 💡 How to Use the New Tools

### **1️⃣ Check or Create Artist Account**

**What you say to Claude:**
```
I'm a new artist. Check if I have an account with email john.doe@example.com.

If I don't have an account, create one with:
- Artist name: John Doe Music
- Legal name: John Michael Doe
- Payment method: PayPal
- PayPal email: john.doe@paypal.com
```

**What Claude will do:**
- Uses `check_or_create_account` tool
- Calls the MSC & Co API
- Returns your artist ID (save this!)
- Confirms payment setup

**Example Response:**
```
✅ Account created successfully!

Artist ID: abc123-def456-ghi789
Artist Name: John Doe Music
Payment: PayPal (john.doe@paypal.com)

You're all set! You can now upload tracks and start distributing your music.
```

---

### **2️⃣ Upload a Track**

**What you say to Claude:**
```
Upload my track from /Users/htay/Music/my-song.mp3

Track details:
- Title: Summer Vibes
- Genre: Hip Hop
- Not explicit content
- My artist ID is abc123-def456-ghi789
```

**Alternative (Claude figures out the path):**
```
I have a track called "Summer Vibes.mp3" in my Music folder.
Upload it as a Hip-Hop track. It's not explicit.
My artist ID is abc123-def456-ghi789
```

**What Claude will do:**
- Uses `upload_track` tool
- Reads the file from your filesystem
- Uploads to MSC & Co with metadata
- Returns track ID and duration

**Example Response:**
```
✅ Track uploaded successfully!

Track ID: track-xyz789
Title: Summer Vibes
Genre: Hip Hop
Duration: 3:42
File: my-song.mp3 (8.5 MB)

Your track is ready for distribution!
```

---

### **3️⃣ Submit for Distribution**

**What you say to Claude:**
```
Submit my track track-xyz789 for distribution.

Details:
- Release date: December 1st, 2025
- Platforms: Spotify, Apple Music, YouTube Music
- Cover artwork: /Users/htay/Pictures/album-cover.jpg
- Artist ID: abc123-def456-ghi789
```

**What Claude will do:**
- Uses `submit_distribution` tool
- Uploads your cover artwork
- Submits track to selected platforms
- Returns release ID and expected live date

**Example Response:**
```
✅ Track submitted for distribution!

Release ID: rel-456def
Status: Processing
Platforms: Spotify, Apple Music, YouTube Music
Expected Live Date: December 1, 2025

Your track will be reviewed by our team within 24-48 hours.
You'll receive an email when it goes live on the platforms.
```

---

### **4️⃣ Check Your Earnings**

**What you say to Claude:**
```
What are my earnings this month?
```

**Alternative:**
```
Show me my Spotify earnings for the last 3 months
```

**What Claude will do:**
- Uses `get_earnings` tool (already existed, enhanced)
- Fetches your earnings data
- Shows breakdown by platform

**Example Response:**
```
💰 Your Earnings - November 2025

Total Earned: £847.32
Breakdown:
- Spotify: £523.45 (62%)
- Apple Music: £198.23 (23%)
- YouTube Music: £87.45 (10%)
- Amazon Music: £38.19 (5%)

Top Track: "Summer Vibes" - 125,000 streams
Growth: +23% vs last month
```

---

### **5️⃣ Request Payout**

**What you say to Claude:**
```
I want to withdraw £200 from my earnings.
My artist ID is abc123-def456-ghi789
```

**Alternative:**
```
Request a payout of all my available balance
```

**What Claude will do:**
- Uses `request_payout` tool
- Submits payout request
- Returns payout details and ETA

**Example Response:**
```
✅ Payout request submitted!

Payout ID: pay-789ghi
Amount: £200.00
Method: PayPal (john.doe@paypal.com)
ETA: 3-5 business days
Status: Pending

You'll receive an email confirmation shortly.
The funds will be sent to your registered PayPal account.
```

---

## 🎯 Pro Tips

### **Conversational Workflow**

You can chain commands naturally:

```
You: "Check if test@example.com has an account, create if not"
Claude: ✅ Account created! Artist ID: abc123

You: "Great! Upload my track from ~/Music/song.mp3, title is 'Midnight Dreams', Hip-Hop genre"
Claude: ✅ Uploaded! Track ID: track-xyz

You: "Perfect. Submit it to all platforms for release on Christmas Day 2025. Use ~/Pictures/cover.jpg as artwork"
Claude: ✅ Submitted! Expected live: December 25, 2025

You: "What are my current earnings?"
Claude: 💰 You've earned £1,247.89 total...

You: "Request a payout of £500"
Claude: ✅ Payout requested! ETA: 3-5 days
```

### **Claude Understands Context**

Once you provide your Artist ID, Claude remembers it in the conversation:

```
You: "My artist ID is abc123-def456"
Claude: Got it! I'll use that for future operations.

You: "Upload track from ~/Music/song.mp3"
Claude: [Uses abc123-def456 automatically]

You: "Submit for distribution"
Claude: [Uses abc123-def456 automatically]
```

### **File Path Helpers**

Claude can help find files:

```
You: "I have a track called 'Summer Vibes.mp3' somewhere in my Documents folder"
Claude: Let me search for it... [searches]
Found: /Users/htay/Documents/Music/Summer Vibes.mp3
Should I upload it?
```

---

## 🐛 Troubleshooting

### **"MSC_CO_API_KEY environment variable is required"**

**Fix:** Add your API key to the Claude config:
```json
"env": {
  "MSC_CO_API_KEY": "your-actual-api-key-here"
}
```

### **"Audio file not found"**

**Fix:** Use absolute file paths:
- ✅ `/Users/htay/Music/song.mp3`
- ❌ `~/Music/song.mp3` (might not work)
- ❌ `song.mp3` (relative path)

### **"API error (401): Unauthorized"**

**Fix:**
1. Generate a new API key at https://mscandco.com/artist/settings
2. Update the key in Claude config
3. Restart Claude Desktop

### **Tools not showing up**

**Fix:**
1. Verify config JSON is valid (use [jsonlint.com](https://jsonlint.com))
2. Restart Claude Desktop **completely** (Quit → Reopen)
3. Check Claude Desktop logs:
   - macOS: `~/Library/Logs/Claude/`
   - Windows: `%APPDATA%\Claude\logs\`

### **Server not starting**

**Fix (for local testing):**
1. Verify build succeeded: `npm run build`
2. Check path in config matches your actual path
3. Ensure Node.js 18+ is installed: `node --version`

---

## 📝 Example Complete Session

Here's a full example from account creation to payout:

```
You: "Hi Claude, I want to start distributing my music on MSC & Co"

Claude: Great! Let me help you get started. Do you already have an
MSC & Co account, or should I create one for you?

You: "I need to create one. Email is artist@example.com,
artist name is 'DJ Thunder', legal name is 'Thomas Anderson',
and I want PayPal payments to thunder@paypal.com"

Claude: [Uses check_or_create_account]
✅ Account created! Your artist ID is abc123-def456-ghi789
You're all set up with PayPal payments.

You: "Awesome! I have a track at /Users/htay/Music/BassDropper.mp3.
It's a Hip-Hop track called 'Bass Dropper', and it has explicit content"

Claude: [Uses upload_track]
✅ Track uploaded! Track ID: track-xyz789
Duration: 4:15. Ready for distribution!

You: "Submit it to Spotify, Apple Music, and YouTube Music.
Release date is December 15th 2025.
Cover art is at /Users/htay/Pictures/bass-dropper-cover.jpg"

Claude: [Uses submit_distribution]
✅ Submitted! Release ID: rel-456def
Expected live: December 15, 2025
Platforms: Spotify, Apple Music, YouTube Music
Status: Processing (review within 24-48 hours)

[Two weeks later...]

You: "What are my earnings so far?"

Claude: [Uses get_earnings]
💰 Your first earnings are in!
Total: £47.32
Spotify: £32.15 (1,254 streams)
Apple Music: £12.08 (478 streams)
YouTube Music: £3.09 (127 streams)
You need £2.68 more to reach the minimum payout of £50.

You: "Once I hit £50, remind me to request a payout"

Claude: Will do! I'll let you know when you're eligible.

[One week later...]

You: "Check my earnings again"

Claude: [Uses get_earnings]
💰 Great news! You now have £53.21
You can request a payout!

You: "Request a payout of all available balance"

Claude: [Uses request_payout]
✅ Payout requested!
Amount: £53.21
ETA: 3-5 business days
Payout ID: pay-789ghi
The funds will be sent to your PayPal account.
```

---

## 🎉 You're Ready!

You can now:
- ✅ Create artist accounts through Claude
- ✅ Upload tracks via natural conversation
- ✅ Submit music to streaming platforms
- ✅ Check earnings and request payouts
- ✅ Manage your entire music career through AI!

**Have questions?** Just ask Claude! The AI understands context and can guide you through the entire process.

---

## 📚 Additional Resources

- **Full Tool List:** See README.md for all 15 available tools
- **API Reference:** https://developers.mscandco.com
- **Support:** support@mscandco.com
- **Discord:** https://discord.gg/mscandco

**Happy music distribution! 🎵**
