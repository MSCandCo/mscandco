# 🚀 Publishing MCP Server to npm

## Prerequisites
- [ ] npm account (create at https://www.npmjs.com/signup)
- [ ] npm logged in locally (`npm login`)

## Steps to Publish

### 1. Install Dependencies
```bash
cd /Users/htay/Documents/MSC\ \&\ Co/msc-co-mcp-server
npm install
```

### 2. Build the Project
```bash
npm run build
```

This will:
- Compile TypeScript to JavaScript
- Create `build/` directory
- Make the binary executable

### 3. Test Locally (Optional)
```bash
npm link
# Test in another terminal:
msc-co-mcp
```

### 4. Publish to npm
```bash
npm publish --access public
```

## After Publishing

### Update Package Name (if needed)
If `@msc-co/mcp-server` is taken, change in `package.json`:
```json
{
  "name": "@mscandco/mcp-server"
}
```

### Submit to Anthropic Directory

1. Fork: https://github.com/modelcontextprotocol/servers
2. Add to `src/servers/` directory:

```json
{
  "name": "msc-co",
  "description": "MSC & Co music distribution platform integration - manage releases, earnings, and analytics via AI",
  "repository": "https://github.com/MSCandCo/msc-co-mcp-server",
  "npm": "@msc-co/mcp-server",
  "categories": ["music", "api", "productivity"],
  "authors": ["MSC & Co"],
  "license": "MIT"
}
```

3. Submit pull request

### Announce on Social Media

Twitter/X:
```
🎉 Introducing @msc-co/mcp-server - the world's first MCP server for music distribution!

Manage your music career directly from Claude Desktop or Cursor.

✅ Check earnings
✅ View releases
✅ Get analytics
✅ Create new releases

All via natural language! 🎵

npm install -g @msc-co/mcp-server

#MusicTech #AI #MCP
```

## Troubleshooting

**Error: "Package name already exists"**
- Change package name in `package.json`
- Try `@mscandco/mcp-server` or `@msc-and-co/mcp-server`

**Error: "403 Forbidden"**
- Run `npm login` first
- Ensure you have publish rights

**Build errors:**
- Run `npm install` first
- Check Node.js version (need 18+)

## Success! 🎉

Once published, users can install with:
```bash
npm install -g @msc-co/mcp-server
```

And configure in Claude Desktop:
```json
{
  "mcpServers": {
    "msc-co": {
      "command": "npx",
      "args": ["-y", "@msc-co/mcp-server"],
      "env": {
        "MSC_CO_API_KEY": "your-api-key"
      }
    }
  }
}
```

