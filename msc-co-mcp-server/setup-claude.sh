#!/bin/bash

# MSC & Co MCP Server - Claude Desktop Setup Script
# This script helps you configure Claude Desktop to use the MSC & Co MCP server

echo "🎵 MSC & Co MCP Server - Claude Desktop Setup"
echo "=============================================="
echo ""

# Determine OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    CONFIG_PATH="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
    OS="macOS"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    CONFIG_PATH="$APPDATA/Claude/claude_desktop_config.json"
    OS="Windows"
else
    echo "❌ Unsupported operating system: $OSTYPE"
    exit 1
fi

echo "📍 Detected OS: $OS"
echo "📁 Config file: $CONFIG_PATH"
echo ""

# Check if config file exists
if [ ! -f "$CONFIG_PATH" ]; then
    echo "❌ Claude Desktop config file not found!"
    echo "   Expected at: $CONFIG_PATH"
    echo ""
    echo "   Please ensure Claude Desktop is installed first:"
    echo "   👉 https://claude.ai/download"
    exit 1
fi

echo "✅ Claude Desktop config file found"
echo ""

# Ask for API key
echo "🔑 Please enter your MSC & Co API key:"
echo "   (Get one at: https://mscandco.com/artist/settings)"
read -p "API Key: " API_KEY

if [ -z "$API_KEY" ]; then
    echo "❌ API key cannot be empty"
    exit 1
fi

echo ""
echo "🌐 Choose API environment:"
echo "   1) Production (https://mscandco.com)"
echo "   2) Staging (https://staging.mscandco.com)"
read -p "Choice [1-2]: " ENV_CHOICE

if [ "$ENV_CHOICE" == "2" ]; then
    API_URL="https://staging.mscandco.com"
    echo "   Using: Staging"
else
    API_URL="https://mscandco.com"
    echo "   Using: Production"
fi

echo ""
echo "📦 Choose installation method:"
echo "   1) Published package (npx @mscandco/mcp-server)"
echo "   2) Local development (current directory)"
read -p "Choice [1-2]: " INSTALL_CHOICE

if [ "$INSTALL_CHOICE" == "2" ]; then
    # Local installation
    CURRENT_DIR=$(pwd)
    BUILD_PATH="$CURRENT_DIR/build/index.js"

    if [ ! -f "$BUILD_PATH" ]; then
        echo "❌ Build file not found at: $BUILD_PATH"
        echo "   Please run: npm run build"
        exit 1
    fi

    CONFIG_JSON=$(cat <<EOF
{
  "mcpServers": {
    "msc-co-local": {
      "command": "node",
      "args": ["$BUILD_PATH"],
      "env": {
        "MSC_CO_API_KEY": "$API_KEY",
        "MSC_CO_API_URL": "$API_URL"
      }
    }
  }
}
EOF
)
    SERVER_NAME="msc-co-local"
else
    # Published package
    CONFIG_JSON=$(cat <<EOF
{
  "mcpServers": {
    "msc-co": {
      "command": "npx",
      "args": ["-y", "@mscandco/mcp-server@latest"],
      "env": {
        "MSC_CO_API_KEY": "$API_KEY",
        "MSC_CO_API_URL": "$API_URL"
      }
    }
  }
}
EOF
)
    SERVER_NAME="msc-co"
fi

echo ""
echo "💾 Backing up existing config..."
if [ -f "$CONFIG_PATH" ]; then
    cp "$CONFIG_PATH" "$CONFIG_PATH.backup.$(date +%Y%m%d_%H%M%S)"
    echo "   ✅ Backup created"
fi

echo ""
echo "📝 Writing new config..."
echo "$CONFIG_JSON" > "$CONFIG_PATH"
echo "   ✅ Config written"

echo ""
echo "=============================================="
echo "✅ Setup Complete!"
echo "=============================================="
echo ""
echo "Next steps:"
echo "1. Restart Claude Desktop completely (Quit → Reopen)"
echo "2. Open a new conversation"
echo "3. Test with: 'What MCP tools do you have?'"
echo ""
echo "You should see 15 MSC & Co tools including:"
echo "  - check_or_create_account"
echo "  - upload_track"
echo "  - submit_distribution"
echo "  - request_payout"
echo "  - (and 11 more tools)"
echo ""
echo "📚 For usage examples, see: CLAUDE_USAGE_GUIDE.md"
echo ""
echo "🎉 Happy music distribution!"
