# 🚀 Quick Release Guide

## Problem Solved

When you say **"I want to release music"**, the AI now uses the streamlined `quick_start_release` tool instead of asking multiple questions or requesting permission for separate tools.

## What Changed

Added a new **`quick_start_release`** tool that:
- ✅ Automatically gets your profile (no separate permission needed)
- ✅ **NEW**: Profile matching - confirm your identity with email/artist name/full name to match your existing MSC profile
- ✅ Creates a draft release immediately with sensible defaults
- ✅ Requires **zero parameters** - works instantly
- ✅ Returns a direct link to complete your release

## Profile Matching Feature

**NEW**: If you provide your profile info, the system will:
1. Match you to your existing MSC profile by:
   - Email address (most reliable)
   - Artist name (fallback)
2. Link your release to your existing profile
3. Update missing profile fields automatically
4. Give you **direct database access** without full authentication setup

### How to Use Profile Matching

When the AI asks if you have an MSC profile, simply provide:
- **Email**: Your MSC account email
- **Artist Name**: Your artist/band name
- **Full Name**: Your first and last name (optional but helpful)

Example:
```
"I want to release music. My email is artist@example.com, 
artist name is 'My Band', and my name is John Smith"
```

The system will:
- ✅ Match your profile instantly
- ✅ Link the release to your account
- ✅ Fill metadata correctly
- ✅ Skip the long profile setup process

## How It Works

When you say:
- "I want to release music"
- "Start release process"
- "Release music"
- "Create a release"

The AI will:
1. **If profile info provided**: Match/link to your existing MSC profile
2. **If no profile info**: Use authenticated session or create defaults
3. Use `quick_start_release` tool (single permission request)
4. Create a draft release with defaults:
   - Title: "New Release" (you can change it)
   - Type: "single"
   - Genre: "Pop" (you can change it)
   - Status: "draft"
5. Give you a direct link to complete the release

## Next Steps After Quick Start

Once the draft is created, you'll get a link to:
1. Complete release details
2. Upload audio files and artwork
3. Add track information
4. Submit for distribution

## Auto-Approval Setup (Optional)

To avoid permission prompts entirely, you can configure Claude Desktop to auto-approve the `quick_start_release` tool:

**Claude Desktop Config** (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "msc-co": {
      "command": "node",
      "args": ["/path/to/msc-co-mcp-server/build/index.js"],
      "env": {
        "MSC_CO_API_KEY": "your-api-key"
      },
      "alwaysAllow": ["quick_start_release"]
    }
  }
}
```

This will auto-approve the quick start tool, making the release process instant!

## Benefits

- **Faster**: One tool call instead of multiple
- **Simpler**: No questions asked - just starts the process
- **Profile Matching**: Confirm identity quickly for direct database access
- **User-friendly**: Clear next steps provided
- **Flexible**: You can customize everything after creation
- **No Long Setup**: Skip profile setup if you already have an MSC account

