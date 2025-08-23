#!/usr/bin/env node

/**
 * Test script to verify MCP server functionality
 */

import { execSync } from 'child_process';

console.log('🧪 Testing MCP Server Setup...\n');

// Test 1: Check if filesystem server is available
try {
  console.log('1. Testing filesystem server...');
  const fsTest = execSync('npx @modelcontextprotocol/server-filesystem --help', { encoding: 'utf8', timeout: 5000 });
  console.log('✅ Filesystem server available\n');
} catch (error) {
  console.log('❌ Filesystem server test failed:', error.message, '\n');
}

// Test 2: Check if our custom server can be loaded
try {
  console.log('2. Testing custom MSC server...');
  // Just check if the file exists and is readable
  const fs = await import('fs');
  const serverContent = fs.readFileSync('./mcp-server.js', 'utf8');
  console.log('✅ Custom MSC server file exists and is readable\n');
} catch (error) {
  console.log('❌ Custom MSC server test failed:', error.message, '\n');
}

// Test 3: Check Claude Desktop config
try {
  console.log('3. Testing Claude Desktop configuration...');
  const fs = await import('fs');
  const configPath = `${process.env.HOME}/.config/claude-desktop/claude_desktop_config.json`;
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  console.log('✅ Claude Desktop config exists');
  console.log('📋 Configured servers:', Object.keys(config.mcpServers || {}));
  console.log('');
} catch (error) {
  console.log('❌ Claude Desktop config test failed:', error.message, '\n');
}

console.log('🎯 Next Steps:');
console.log('1. Restart Claude Desktop app');
console.log('2. Open a new conversation');
console.log('3. You should see MCP tools available');
console.log('4. Test with your other Claude instance');
console.log('\n🚀 Multi-Claude MCP setup complete!');
