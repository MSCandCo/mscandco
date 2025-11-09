# Publishing Guide - MSC & Co MCP Server v1.1.0

## 🎉 What's New in v1.1.0

This release adds **5 powerful new tools** for artist onboarding, music uploads, and distribution:

1. ✅ **check_or_create_account** - Artist registration and payment setup
2. ✅ **upload_track** - Direct audio file uploads (MP3, WAV, FLAC)
3. ✅ **submit_distribution** - Submit to streaming platforms with artwork
4. ✅ **request_payout** - Withdraw earnings (enhanced existing functionality)
5. ✅ Test scripts and comprehensive documentation

---

## 📋 Pre-Publishing Checklist

- [x] All 4 new tools implemented and tested
- [x] TypeScript builds successfully (no errors)
- [x] Package version bumped to 1.1.0
- [x] README.md updated with new features and examples
- [x] CHANGELOG.md created with version history
- [x] Test script created (test-tools.js)
- [x] File upload helper function added
- [x] Error handling for file operations
- [x] Code follows existing patterns
- [ ] npm account logged in
- [ ] Ready to publish!

---

## 🚀 Publishing Steps

### 1. Verify Build
```bash
cd ~/Documents/MSC\ \&\ Co/msc-co-mcp-server
npm run build
```

**Expected Output:**
```
> @mscandco/mcp-server@1.1.0 build
> tsc && chmod +x build/index.js
```

### 2. Test Locally (Optional)
```bash
node test-tools.js
```

Should display all 5 new tool definitions with test scenarios.

### 3. Login to npm (if needed)
```bash
npm login
```

Enter your npm credentials.

### 4. Publish to npm
```bash
npm publish --access public
```

**Expected Output:**
```
+ @mscandco/mcp-server@1.1.0
```

### 5. Verify Publication
```bash
npm view @mscandco/mcp-server
```

Should show version 1.1.0 and updated description.

---

## 🔄 Updating Claude Desktop Config

After publishing, users should update their Claude Desktop config to use the latest version:

**File Location:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

**Config:**
```json
{
  "mcpServers": {
    "msc-co": {
      "command": "npx",
      "args": ["-y", "@mscandco/mcp-server@latest"],
      "env": {
        "MSC_CO_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

**Restart Claude Desktop** to load the new version.

---

## 🧪 Testing After Publication

### Test in Claude Desktop

1. Restart Claude Desktop
2. Open a new conversation
3. Test with these prompts:

**Test 1: Artist Onboarding**
```
Check if test@example.com has an MSC & Co account. If not, create one with:
- Artist name: Test Artist
- Legal name: Test Legal Name
- Payment: PayPal to test@paypal.com
```

**Test 2: Upload Track**
```
Upload a track from ~/Music/test.mp3
Title: "Test Song"
Genre: "Hip Hop"
Not explicit
```

**Test 3: Submit Distribution**
```
Submit my track [track-id] for distribution to Spotify and Apple Music
Release date: 2025-12-01
Use artwork from ~/Pictures/cover.jpg
```

**Test 4: Check Earnings**
```
What are my earnings this month?
```

**Test 5: Request Payout**
```
Request a payout of £100
```

---

## 📊 New Tools Summary

| Tool | Purpose | API Endpoint |
|------|---------|--------------|
| check_or_create_account | Artist registration & payment setup | POST /api/v1/artists/check-or-create |
| upload_track | Audio file upload | POST /api/v1/tracks/upload |
| submit_distribution | Submit to streaming platforms | POST /api/v1/releases/submit |
| request_payout | Withdraw earnings | POST /api/v1/payouts/request |

---

## 🎯 Success Metrics

After publishing v1.1.0, track:
- npm downloads
- Claude Desktop installations
- User feedback on new tools
- Issues/bugs reported
- Feature requests

---

## 📝 Communication

### Announcement Template

**Twitter/X:**
```
🎉 MSC & Co MCP Server v1.1.0 is live!

New features:
🎤 Artist onboarding
🎵 Direct track uploads
🚀 Submit to Spotify, Apple Music, etc.
💸 Request payouts

Upload music & manage your career with @AnthropicAI Claude!

npm: @mscandco/mcp-server
```

**Discord/Community:**
```
📢 **MSC & Co MCP Server v1.1.0 Released!**

What's new:
✅ Artist account creation with payment setup
✅ Upload audio files (MP3, WAV, FLAC) directly through AI
✅ Submit tracks to streaming platforms with artwork
✅ Request payouts of accumulated earnings

Install: `npx -y @mscandco/mcp-server@latest`

Full changelog: [link to GitHub]
```

---

## 🐛 Known Limitations

- File uploads require local file access (files must exist on user's machine)
- Large audio files (>100MB) may take longer to upload
- Artwork must be 3000x3000px or similar high resolution
- Minimum payout: £50

---

## 🔜 Future Improvements (v1.2.0+)

Potential features for next release:
- [ ] Batch upload multiple tracks
- [ ] Edit track metadata after upload
- [ ] Cancel/delete pending releases
- [ ] View payout history
- [ ] Album/EP upload with multiple tracks
- [ ] Collaborative releases (multiple artists)
- [ ] Pre-save campaign creation

---

## 📚 Resources

- **npm Package**: https://www.npmjs.com/package/@mscandco/mcp-server
- **GitHub Repo**: https://github.com/MSCandCo/msc-co-mcp-server
- **MSC & Co Platform**: https://mscandco.com
- **Support**: support@mscandco.com

---

**Ready to publish!** 🚀

Run: `npm publish --access public`
