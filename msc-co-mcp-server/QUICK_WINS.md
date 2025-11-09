# ⚡ Quick Wins - Immediate Enhancements

These are high-impact features you can implement **this week** to make your MCP the best in class.

---

## 🎯 1. Smart File Detection & Validation

**Current:** User must provide exact file paths
**Better:** Auto-detect and validate files

### Implementation:

```typescript
// Add to src/index.ts

import { readdirSync, statSync, existsSync } from "fs";
import { join } from "path";

// Helper: Find audio files in common directories
function findAudioFiles(searchTerm: string): string[] {
  const commonDirs = [
    join(process.env.HOME!, "Music"),
    join(process.env.HOME!, "Downloads"),
    join(process.env.HOME!, "Documents", "Music"),
    join(process.env.HOME!, "Desktop"),
  ];

  const audioExtensions = [".mp3", ".wav", ".flac", ".m4a", ".aac"];
  const results: string[] = [];

  for (const dir of commonDirs) {
    if (!existsSync(dir)) continue;

    try {
      const files = readdirSync(dir);
      for (const file of files) {
        if (audioExtensions.some(ext => file.toLowerCase().endsWith(ext))) {
          if (file.toLowerCase().includes(searchTerm.toLowerCase())) {
            results.push(join(dir, file));
          }
        }
      }
    } catch (error) {
      // Skip directories we can't read
      continue;
    }
  }

  return results;
}

// Add new tool: find_audio_file
{
  name: "find_audio_file",
  description: "Search for audio files on the user's computer by name",
  inputSchema: {
    type: "object",
    properties: {
      searchTerm: {
        type: "string",
        description: "Part of the filename to search for (e.g., 'summer vibes')"
      }
    },
    required: ["searchTerm"]
  }
}

// Handler:
case "find_audio_file": {
  const params = args as any || {};
  const files = findAudioFiles(params.searchTerm);

  if (files.length === 0) {
    return {
      content: [{
        type: "text",
        text: `No audio files found matching "${params.searchTerm}"\n\nSearched in:\n- ~/Music\n- ~/Downloads\n- ~/Documents/Music\n- ~/Desktop`
      }]
    };
  }

  return {
    content: [{
      type: "text",
      text: `Found ${files.length} audio file(s):\n\n${files.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n\nWhich one would you like to use?`
    }]
  };
}
```

**User Experience:**
```
You: "Upload my track called summer vibes"
Claude: Let me search for that file...
Found 2 audio files:
1. /Users/htay/Music/summer-vibes.mp3
2. /Users/htay/Downloads/summer-vibes-final.mp3

Which one would you like to use?
```

---

## 🎯 2. Rich Progress Updates

**Current:** Silent operations
**Better:** Real-time progress feedback

### Implementation:

```typescript
// Enhanced upload_track with progress
case "upload_track": {
  const params = args as any || {};

  // Validate file
  const fileStats = statSync(params.audioFilePath);
  const fileSizeMB = (fileStats.size / 1024 / 1024).toFixed(1);

  return {
    content: [{
      type: "text",
      text: `🎵 Uploading "${params.title}"...\n\n` +
            `📁 File: ${basename(params.audioFilePath)}\n` +
            `📊 Size: ${fileSizeMB} MB\n` +
            `🎼 Genre: ${params.genre}\n` +
            `⚠️ Explicit: ${params.explicit ? 'Yes' : 'No'}\n\n` +
            `⏳ Upload in progress... (this may take a minute for large files)`
    }]
  };

  const data = await uploadFile("/api/v1/tracks/upload", params.audioFilePath, {
    artistId: params.artistId,
    title: params.title,
    genre: params.genre,
    explicit: params.explicit || false,
  });

  return {
    content: [{
      type: "text",
      text: `✅ Upload complete!\n\n` +
            `🎵 Track: "${params.title}"\n` +
            `🆔 Track ID: ${(data as any).trackId}\n` +
            `⏱️ Duration: ${(data as any).duration}\n` +
            `📊 File Size: ${fileSizeMB} MB\n\n` +
            `✨ Your track is ready for distribution!`
    }]
  };
}
```

---

## 🎯 3. Smart Genre Detection

**Current:** User must specify genre
**Better:** Suggest genre based on filename/metadata

### Implementation:

```typescript
// Add genre detection helper
function suggestGenre(filename: string, metadata?: any): string[] {
  const suggestions: string[] = [];
  const lower = filename.toLowerCase();

  // Simple keyword matching
  if (lower.includes('trap') || lower.includes('bass')) suggestions.push('Hip Hop', 'Trap');
  if (lower.includes('chill') || lower.includes('lofi')) suggestions.push('Lo-Fi', 'Chill');
  if (lower.includes('gospel') || lower.includes('worship')) suggestions.push('Gospel', 'Christian');
  if (lower.includes('afro') || lower.includes('amapiano')) suggestions.push('Afrobeats', 'Amapiano');
  if (lower.includes('drill')) suggestions.push('Drill', 'Hip Hop');
  if (lower.includes('jazz')) suggestions.push('Jazz');
  if (lower.includes('soul') || lower.includes('rnb')) suggestions.push('R&B', 'Soul');

  // Default suggestions if nothing matched
  if (suggestions.length === 0) {
    suggestions.push('Hip Hop', 'Pop', 'Electronic');
  }

  return [...new Set(suggestions)].slice(0, 3);
}

// Enhance upload_track to suggest genre
case "upload_track": {
  const params = args as any || {};

  if (!params.genre) {
    const suggestions = suggestGenre(params.audioFilePath);
    return {
      content: [{
        type: "text",
        text: `🎵 No genre specified. Based on the filename, this could be:\n\n` +
              suggestions.map((g, i) => `${i + 1}. ${g}`).join('\n') +
              `\n\nWhich genre best describes this track?`
      }]
    };
  }

  // Continue with upload...
}
```

---

## 🎯 4. Batch Operations

**Current:** Upload one track at a time
**Better:** Upload multiple tracks in one command

### Implementation:

```typescript
// New tool: batch_upload_tracks
{
  name: "batch_upload_tracks",
  description: "Upload multiple tracks at once from a directory",
  inputSchema: {
    type: "object",
    properties: {
      artistId: {
        type: "string",
        description: "Artist account ID"
      },
      directory: {
        type: "string",
        description: "Path to directory containing audio files"
      },
      genre: {
        type: "string",
        description: "Genre for all tracks (or 'auto' to detect individually)"
      }
    },
    required: ["artistId", "directory"]
  }
}

// Handler:
case "batch_upload_tracks": {
  const params = args as any || {};
  const audioExtensions = [".mp3", ".wav", ".flac", ".m4a"];

  const files = readdirSync(params.directory)
    .filter(f => audioExtensions.some(ext => f.toLowerCase().endsWith(ext)))
    .map(f => join(params.directory, f));

  if (files.length === 0) {
    return {
      content: [{
        type: "text",
        text: `No audio files found in ${params.directory}`
      }]
    };
  }

  return {
    content: [{
      type: "text",
      text: `Found ${files.length} audio files:\n\n` +
            files.map((f, i) => `${i + 1}. ${basename(f)}`).join('\n') +
            `\n\nReady to upload all ${files.length} tracks. Continue?`
    }]
  };

  // After confirmation, upload each file
  const results = [];
  for (const file of files) {
    const title = basename(file, extname(file));
    const genre = params.genre === 'auto' ? suggestGenre(file)[0] : params.genre;

    try {
      const data = await uploadFile("/api/v1/tracks/upload", file, {
        artistId: params.artistId,
        title,
        genre,
        explicit: false,
      });
      results.push({ file: basename(file), trackId: (data as any).trackId, success: true });
    } catch (error) {
      results.push({ file: basename(file), error: error.message, success: false });
    }
  }

  const successful = results.filter(r => r.success).length;
  return {
    content: [{
      type: "text",
      text: `✅ Batch upload complete!\n\n` +
            `Successful: ${successful}/${files.length}\n\n` +
            results.map(r =>
              r.success
                ? `✓ ${r.file} → Track ID: ${r.trackId}`
                : `✗ ${r.file} → Error: ${r.error}`
            ).join('\n')
    }]
  };
}
```

**User Experience:**
```
You: "Upload all tracks from my ~/Music/New Album folder"
Claude: Found 8 audio files:
1. track-01-intro.mp3
2. track-02-summer-vibes.mp3
3. track-03-night-drive.mp3
...

Ready to upload all 8 tracks. Continue?

You: "Yes"
Claude: ⏳ Uploading 8 tracks...
[Progress bar would go here in UI]

✅ Batch upload complete!
Successful: 8/8

✓ track-01-intro.mp3 → Track ID: xyz-001
✓ track-02-summer-vibes.mp3 → Track ID: xyz-002
...
```

---

## 🎯 5. Release Templates

**Current:** Manually configure each release
**Better:** Save and reuse release configurations

### Implementation:

```typescript
// New tools:
{
  name: "save_release_template",
  description: "Save a release configuration as a template for future use",
  inputSchema: {
    type: "object",
    properties: {
      templateName: {
        type: "string",
        description: "Name for this template (e.g., 'Single Release', 'EP Drop')"
      },
      platforms: {
        type: "array",
        items: { type: "string" },
        description: "Default platforms"
      },
      releaseStrategy: {
        type: "string",
        description: "Description of the release strategy"
      }
    },
    required: ["templateName", "platforms"]
  }
},
{
  name: "use_release_template",
  description: "Apply a saved template to a new release",
  inputSchema: {
    type: "object",
    properties: {
      templateName: {
        type: "string",
        description: "Name of the template to use"
      },
      trackId: {
        type: "string",
        description: "Track ID to apply template to"
      }
    },
    required: ["templateName", "trackId"]
  }
}
```

**User Experience:**
```
You: "Save my current release config as 'My Standard Single Release'"
Claude: ✅ Template saved!

Template: "My Standard Single Release"
- Platforms: Spotify, Apple Music, YouTube Music
- 2-week pre-save campaign
- Social media posts schedule
- Playlist pitch strategy

You can use this template for future releases with:
"Use my 'Standard Single Release' template for track xyz"
```

---

## 🎯 6. Conversational Error Recovery

**Current:** Errors stop the workflow
**Better:** AI helps fix errors

### Implementation:

```typescript
// Enhanced error handling
case "upload_track": {
  try {
    // ... existing upload logic
  } catch (error: any) {
    // Smart error recovery
    if (error.message.includes('file not found')) {
      const basename = params.audioFilePath.split('/').pop();
      const suggestions = findAudioFiles(basename);

      return {
        content: [{
          type: "text",
          text: `❌ File not found: ${params.audioFilePath}\n\n` +
                `I searched for similar files and found:\n\n` +
                suggestions.map((f, i) => `${i + 1}. ${f}`).join('\n') +
                `\n\nDid you mean one of these?`
        }]
      };
    }

    if (error.message.includes('invalid genre')) {
      return {
        content: [{
          type: "text",
          text: `❌ Invalid genre: ${params.genre}\n\n` +
                `Supported genres:\n` +
                `- Hip Hop\n- Gospel\n- Afrobeats\n- R&B\n- Pop\n- Electronic\n- Rock\n\n` +
                `Which genre should I use instead?`
        }]
      };
    }

    // Default error
    return {
      content: [{
        type: "text",
        text: `❌ Upload failed: ${error.message}\n\n` +
              `Would you like me to:\n` +
              `1. Try again\n` +
              `2. Check your file path\n` +
              `3. Use a different file`
      }]
    };
  }
}
```

---

## 🎯 7. Context Persistence

**Current:** Must re-enter artist ID each time
**Better:** Remember user context

### Implementation:

```typescript
// Simple in-memory cache (upgrade to DB later)
const userContext = new Map<string, any>();

// Helper to get/set context
function getUserContext(userId: string): any {
  return userContext.get(userId) || {};
}

function setUserContext(userId: string, data: any): void {
  userContext.set(userId, { ...getUserContext(userId), ...data });
}

// Use in tools:
case "check_or_create_account": {
  const data = await apiCall(...);

  // Save artist ID for future use
  setUserContext(API_KEY, { artistId: (data as any).artistId });

  return {
    content: [{
      type: "text",
      text: `✅ Account created!\n\n` +
            `Artist ID: ${(data as any).artistId}\n\n` +
            `💡 I'll remember your Artist ID for this session, ` +
            `so you don't need to provide it again.`
    }]
  };
}

// Auto-fill artist ID:
case "upload_track": {
  const params = args as any || {};
  const context = getUserContext(API_KEY);

  if (!params.artistId && context.artistId) {
    params.artistId = context.artistId;
    console.log(`Auto-filled artist ID: ${params.artistId}`);
  }

  // ... continue with upload
}
```

---

## 📊 Summary: Before vs After

### **Before (v1.1.0):**
```
You: "Upload /Users/htay/Music/song.mp3 with title 'Summer' genre 'Hip Hop' artist ID abc123"
Claude: ✅ Uploaded!
```

### **After (Quick Wins):**
```
You: "Upload my track called summer"
Claude: 🔍 Searching for 'summer'...

Found 2 files:
1. /Users/htay/Music/summer-vibes.mp3 (8.5 MB)
2. /Users/htay/Downloads/summer.wav (42.1 MB)

Which one?

You: "The first one"
Claude: 📊 Analyzing file...

File: summer-vibes.mp3(8.5 MB)
Suggested genres based on filename: Hip Hop, Trap, Electronic

Which genre?

You: "Hip Hop"
Claude: ✅ Using your saved Artist ID (abc123)

🎵 Uploading "Summer Vibes"...
⏳ Upload progress: [=====>    ] 50%

✅ Upload complete!

Track: "Summer Vibes"
Track ID: xyz789
Duration: 3:42
Ready for distribution!

Want me to submit this for distribution using your "Standard Single Release" template?
```

---

## ⚡ Implementation Priority

1. **Context Persistence** (30 min) - Immediate UX improvement
2. **Smart File Detection** (1 hour) - Makes uploads way easier
3. **Rich Progress Updates** (1 hour) - Better feedback
4. **Genre Detection** (30 min) - Reduces friction
5. **Error Recovery** (2 hours) - Prevents frustration
6. **Batch Operations** (3 hours) - Power user feature
7. **Release Templates** (4 hours) - Advanced workflow

**Total: 1-2 days of dev work for massive UX improvement!**

---

## 🚀 Next: Ship These This Week

Then move on to the big features in ENHANCEMENT_ROADMAP.md for v1.2.0+

**Your MCP will go from "functional" to "magical"** ✨
