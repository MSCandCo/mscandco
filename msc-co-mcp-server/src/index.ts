#!/usr/bin/env node

/**
 * MSC & Co MCP Server
 * 
 * Enables AI assistants (Claude Desktop, Cursor, Cline) to interact with
 * the MSC & Co music distribution platform.
 * 
 * Features:
 * - Manage music releases
 * - Check earnings and analytics
 * - View wallet balance
 * - Get platform statistics
 * - And more!
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";

// Configuration
const API_BASE_URL = process.env.MSC_CO_API_URL || "https://mscandco.com";
const API_KEY = process.env.MSC_CO_API_KEY;

if (!API_KEY) {
  console.error("❌ Error: MSC_CO_API_KEY environment variable is required");
  console.error("Please set it in your Claude Desktop config:");
  console.error('  "env": { "MSC_CO_API_KEY": "your-api-key-here" }');
  process.exit(1);
}

// Helper function to make authenticated API calls
async function apiCall(endpoint: string, options: any = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    "Authorization": `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error (${response.status}): ${error}`);
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(`Failed to call ${endpoint}: ${error.message}`);
  }
}

// Create MCP server
const server = new Server(
  {
    name: "msc-co-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define all available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_releases",
        description: "Get all music releases for the authenticated artist. Shows title, status, release date, and streaming platforms.",
        inputSchema: {
          type: "object",
          properties: {
            status: {
              type: "string",
              enum: ["all", "draft", "submitted", "live", "archived"],
              description: "Filter releases by status. Defaults to 'all'",
              default: "all",
            },
            limit: {
              type: "number",
              description: "Maximum number of releases to return. Defaults to 50",
              default: 50,
            },
          },
        },
      },
      {
        name: "get_earnings",
        description: "Get earnings summary including total paid, pending, and breakdown by platform (Spotify, Apple Music, etc.)",
        inputSchema: {
          type: "object",
          properties: {
            timeframe: {
              type: "string",
              enum: ["week", "month", "quarter", "year", "all"],
              description: "Time period for earnings summary",
              default: "month",
            },
            currency: {
              type: "string",
              enum: ["GBP", "USD", "EUR"],
              description: "Currency for earnings display",
              default: "GBP",
            },
          },
        },
      },
      {
        name: "get_wallet_balance",
        description: "Check current wallet balance, available for withdrawal, and pending earnings",
        inputSchema: {
          type: "object",
          properties: {
            currency: {
              type: "string",
              enum: ["GBP", "USD", "EUR"],
              description: "Currency for balance display",
              default: "GBP",
            },
          },
        },
      },
      {
        name: "get_analytics",
        description: "Get streaming analytics including total streams, top platforms, top countries, and performance trends",
        inputSchema: {
          type: "object",
          properties: {
            timeframe: {
              type: "string",
              enum: ["week", "month", "quarter", "year", "all"],
              description: "Time period for analytics",
              default: "month",
            },
            metric: {
              type: "string",
              enum: ["streams", "earnings", "countries", "platforms"],
              description: "Specific metric to analyze",
            },
          },
        },
      },
      {
        name: "create_release",
        description: "Create a new music release. This starts a draft that can be completed later in the MSC & Co dashboard.",
        inputSchema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "Title of the release (song, EP, or album name)",
            },
            release_type: {
              type: "string",
              enum: ["single", "ep", "album"],
              description: "Type of release",
            },
            genre: {
              type: "string",
              description: "Primary genre (e.g., Hip-Hop, Gospel, Afrobeats, R&B)",
            },
            release_date: {
              type: "string",
              description: "Desired release date in YYYY-MM-DD format (optional)",
            },
          },
          required: ["title", "release_type", "genre"],
        },
      },
      {
        name: "get_profile",
        description: "Get artist profile information including name, bio, subscription tier, and account stats",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_platform_stats",
        description: "Get overall platform statistics like total releases, total streams, top earning platform, etc.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_release_details",
        description: "Get detailed information about a specific release including streams, earnings, and platform performance",
        inputSchema: {
          type: "object",
          properties: {
            release_id: {
              type: "string",
              description: "UUID of the release to get details for",
            },
          },
          required: ["release_id"],
        },
      },
      {
        name: "search_releases",
        description: "Search for releases by title, genre, or other criteria",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query (title, genre, etc.)",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "get_notifications",
        description: "Get recent notifications and updates for the artist account",
        inputSchema: {
          type: "object",
          properties: {
            unread_only: {
              type: "boolean",
              description: "Only return unread notifications",
              default: false,
            },
            limit: {
              type: "number",
              description: "Maximum number of notifications to return",
              default: 20,
            },
          },
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "get_releases": {
        const params = args as any || {};
        const data = await apiCall(
          `/api/artist/releases-simple?status=${params.status || "all"}&limit=${params.limit || 50}`
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case "get_earnings": {
        const params = args as any || {};
        const data = await apiCall(
          `/api/artist/wallet-simple?timeframe=${params.timeframe || "month"}&currency=${params.currency || "GBP"}`
        ) as any;
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case "get_wallet_balance": {
        const params = args as any || {};
        const data = await apiCall(
          `/api/artist/wallet-simple?currency=${params.currency || "GBP"}`
        ) as any;
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                available: data.wallet_balance,
                pending: data.total_pending,
                total_earned: data.total_paid,
                currency: params.currency || "GBP",
              }, null, 2),
            },
          ],
        };
      }

      case "get_analytics": {
        const params = args as any || {};
        const data = await apiCall(
          `/api/artist/analytics-data?timeframe=${params.timeframe || "month"}${params.metric ? `&metric=${params.metric}` : ""}`
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case "create_release": {
        const params = args as any || {};
        const data = await apiCall("/api/releases", {
          method: "POST",
          body: JSON.stringify({
            title: params.title,
            release_type: params.release_type,
            genre: params.genre,
            release_date: params.release_date,
            status: "draft",
          }),
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                message: `Draft release created for "${params.title}". You can complete it at ${API_BASE_URL}/artist/releases`,
                release: data,
              }, null, 2),
            },
          ],
        };
      }

      case "get_profile": {
        const data = await apiCall("/api/user/profile");
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case "get_platform_stats": {
        const [releases, earnings, analytics] = await Promise.all([
          apiCall("/api/artist/releases-simple?status=all"),
          apiCall("/api/artist/wallet-simple"),
          apiCall("/api/artist/analytics-data"),
        ]);

        const releasesData = releases as any;
        const earningsData = earnings as any;
        const analyticsData = analytics as any;

        const stats = {
          total_releases: releasesData.releases?.length || 0,
          live_releases: releasesData.releases?.filter((r: any) => r.status === "live").length || 0,
          total_earned: earningsData.total_paid,
          pending_earnings: earningsData.total_pending,
          wallet_balance: earningsData.wallet_balance,
          total_streams: analyticsData.total_streams || 0,
          top_platform: analyticsData.top_platform || "N/A",
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(stats, null, 2),
            },
          ],
        };
      }

      case "get_release_details": {
        const params = args as any || {};
        const data = await apiCall(`/api/releases/${params.release_id}`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case "search_releases": {
        const params = args as any || {};
        const data = await apiCall(`/api/artist/releases-simple?search=${encodeURIComponent(params.query || "")}`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case "get_notifications": {
        const params = args as any || {};
        const data = await apiCall(
          `/api/notifications?unread=${params.unread_only || false}&limit=${params.limit || 20}`
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  console.error("🎵 MSC & Co MCP Server starting...");
  console.error(`📡 API: ${API_BASE_URL}`);
  console.error(`🔑 API Key: ${API_KEY?.substring(0, 8)}...`);
  console.error("✅ Server ready!");

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});

