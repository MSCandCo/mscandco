# 🚀 Quick Release Guide

## Problem Solved

When you say **"I want to release music"**, the AI now uses the streamlined `quick_start_release` tool instead of asking multiple questions or requesting permission for separate tools.

## What Changed

Added a new **`quick_start_release`** tool that:
- ✅ Automatically gets your profile (no separate permission needed)
- ✅ Creates a draft release immediately with sensible defaults
- ✅ Requires **zero parameters** - works instantly
- ✅ Returns a direct link to complete your release

## How It Works

When you say:
- "I want to release music"
- "Start release process"
- "Release music"
- "Create a release"

The AI will:
1. Use `quick_start_release` tool (single permission request)
2. Automatically fetch your profile
3. Create a draft release with defaults:
   - Title: "New Release" (you can change it)
   - Type: "single"
   - Genre: "Pop" (you can change it)
   - Status: "draft"
4. Give you a direct link to complete the release

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
- **User-friendly**: Clear next steps provided
- **Flexible**: You can customize everything after creation

