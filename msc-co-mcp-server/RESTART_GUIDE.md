# 🚀 MCP Server Restart Guide

## Quick Restart Instructions

### If Running as Node Process
```bash
# Find process
ps aux | grep "mcp\|node.*index"

# Kill process (replace PID with actual process ID)
kill -9 <PID>

# Restart
cd msc-co-mcp-server
npm run build
node build/index.js
```

### If Running with PM2
```bash
pm2 restart msc-co-mcp-server
pm2 logs msc-co-mcp-server
```

### If Running as Systemd Service
```bash
sudo systemctl restart msc-co-mcp-server
sudo systemctl status msc-co-mcp-server
```

### If Running in Cursor/Claude Desktop
1. Close and reopen Cursor/Claude Desktop
2. MCP server will auto-restart with new SDK

## Verification

### Check SDK Version
```bash
cd msc-co-mcp-server
npm list @modelcontextprotocol/sdk
# Should show: @modelcontextprotocol/sdk@1.21.1
```

### Test Tools Available
Use MCP client to call:
- `get_advanced_intelligence`
- `predict_next_value`
- `get_optimal_recommendation`
- `detect_behavioral_patterns`
- `find_similar_users`
- `validate_prediction`

## Post-Restart Checklist

- [ ] MCP server process running
- [ ] SDK version 1.21.1 loaded
- [ ] All 6 advanced tools available
- [ ] Can call `get_advanced_intelligence`
- [ ] Database functions accessible
- [ ] API endpoints responding

## Troubleshooting

### If tools not showing:
1. Check MCP server logs
2. Verify database connection
3. Check API endpoints are accessible
4. Restart MCP client (Cursor/Claude Desktop)

### If SDK errors:
1. Verify `npm install` completed
2. Check `node_modules/@modelcontextprotocol/sdk` exists
3. Rebuild: `npm run build`

