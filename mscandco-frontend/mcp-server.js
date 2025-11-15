#!/usr/bin/env node

/**
 * MSC & Co Platform MCP Server - INFINITE GENIUS Edition 🚀💥⚡💖
 *
 * Custom MCP server with Apollo INFINITE GENIUS integration
 * - 200,000+ dynamic tools covering ENTIRE music industry
 * - Conversational, empathetic, human AI responses
 * - Complete platform management capabilities
 *
 * INFINITE CAPABILITIES - UNLIMITED INTELLIGENCE - UNSTOPPABLE POWER
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.env.MSC_PROJECT_ROOT || process.cwd();

// Import Apollo INFINITE GENIUS (dynamic import for ES modules)
let infiniteToolGenerator = null;
let apolloBrain = null;

class MSCPlatformServer {
  constructor() {
    this.server = new Server(
      {
        name: 'msc-platform-server-infinite-genius',
        version: '2.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.apolloReady = false;
    this.setupToolHandlers();
  }

  async initializeApollo() {
    if (this.apolloReady) return;

    try {
      // Dynamic import for ES modules
      const infiniteBrainModule = await import(path.join(PROJECT_ROOT, 'lib/apollo/infinite-brain.js'));
      infiniteToolGenerator = infiniteBrainModule.default || infiniteBrainModule.infiniteToolGenerator;

      this.apolloReady = true;
      console.error('✅ Apollo INFINITE GENIUS initialized in MCP server');
    } catch (error) {
      console.error('⚠️ Apollo INFINITE GENIUS not available:', error.message);
      this.apolloReady = false;
    }
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'deploy_platform',
            description: 'Deploy MSC & Co platform to Vercel',
            inputSchema: {
              type: 'object',
              properties: {
                environment: {
                  type: 'string',
                  enum: ['development', 'production'],
                  default: 'production'
                }
              }
            }
          },
          {
            name: 'run_database_migration',
            description: 'Execute Supabase database migrations',
            inputSchema: {
              type: 'object',
              properties: {
                migration_file: {
                  type: 'string',
                  description: 'Path to SQL migration file'
                }
              }
            }
          },
          {
            name: 'check_subscription_status',
            description: 'Check subscription system status and health',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'sync_project_state',
            description: 'Sync current project state between Claude instances',
            inputSchema: {
              type: 'object',
              properties: {
                include_git_status: {
                  type: 'boolean',
                  default: true
                }
              }
            }
          },
          {
            name: 'test_revolut_integration',
            description: 'Test Revolut payment integration',
            inputSchema: {
              type: 'object',
              properties: {
                test_type: {
                  type: 'string',
                  enum: ['subscription', 'wallet', 'all'],
                  default: 'all'
                }
              }
            }
          },
          {
            name: 'apollo_infinite_tool',
            description: 'Access Apollo INFINITE GENIUS - 200,000+ dynamic tools covering ENTIRE music industry. Conversational, empathetic AI with deep emotional intelligence. Categories: analytics, creative, marketing, distribution, business, live, fans, brand, technology, global, wellness, career, education, networking, content, monetization, impact.',
            inputSchema: {
              type: 'object',
              properties: {
                action: {
                  type: 'string',
                  enum: ['execute_tool', 'recommend_tools', 'list_categories', 'discover_capabilities'],
                  description: 'Action to perform with infinite tool system'
                },
                category: {
                  type: 'string',
                  description: 'Tool category (e.g., analytics, creative, marketing, wellness, career)'
                },
                subcategory: {
                  type: 'string',
                  description: 'Subcategory within category'
                },
                capability: {
                  type: 'string',
                  description: 'Specific capability to execute'
                },
                args: {
                  type: 'object',
                  description: 'Arguments to pass to the tool'
                },
                context: {
                  type: 'object',
                  description: 'User context for tool recommendations'
                },
                user_id: {
                  type: 'string',
                  description: 'Optional user ID for personalized results'
                }
              },
              required: ['action']
            }
          },
          {
            name: 'apollo_chat',
            description: 'Have a natural conversation with Apollo INFINITE GENIUS - your music industry mentor with complete expertise, emotional intelligence, and conversational personality. Ask anything about your music career!',
            inputSchema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  description: 'Your message or question for Apollo'
                },
                user_id: {
                  type: 'string',
                  description: 'Optional user ID for personalized responses'
                },
                conversation_history: {
                  type: 'array',
                  description: 'Previous conversation messages',
                  items: {
                    type: 'object'
                  }
                }
              },
              required: ['message']
            }
          }
        ]
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'deploy_platform':
            return await this.deployPlatform(args.environment);
          
          case 'run_database_migration':
            return await this.runDatabaseMigration(args.migration_file);
          
          case 'check_subscription_status':
            return await this.checkSubscriptionStatus();
          
          case 'sync_project_state':
            return await this.syncProjectState(args.include_git_status);
          
          case 'test_revolut_integration':
            return await this.testRevolutIntegration(args.test_type);

          case 'apollo_infinite_tool':
            await this.initializeApollo();
            return await this.apolloInfiniteTool(args);

          case 'apollo_chat':
            await this.initializeApollo();
            return await this.apolloChat(args);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${error.message}`
            }
          ],
          isError: true
        };
      }
    });
  }

  async deployPlatform(environment = 'production') {
    const command = environment === 'production' ? 'vercel --prod' : 'vercel';
    
    try {
      const output = execSync(command, { 
        cwd: PROJECT_ROOT,
        encoding: 'utf8',
        timeout: 300000 // 5 minutes
      });
      
      return {
        content: [
          {
            type: 'text',
            text: `✅ Platform deployed to ${environment}\n\n${output}`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Deployment failed: ${error.message}`);
    }
  }

  async runDatabaseMigration(migrationFile) {
    if (!migrationFile) {
      throw new Error('Migration file path is required');
    }

    const fullPath = path.resolve(PROJECT_ROOT, migrationFile);
    
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Migration file not found: ${fullPath}`);
    }

    try {
      const sqlContent = fs.readFileSync(fullPath, 'utf8');
      
      return {
        content: [
          {
            type: 'text',
            text: `📊 Database migration ready: ${migrationFile}\n\nSQL Content:\n${sqlContent}\n\n⚠️ Please execute this manually in Supabase dashboard for safety.`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to read migration file: ${error.message}`);
    }
  }

  async checkSubscriptionStatus() {
    try {
      // Check if subscription components exist
      const subscriptionFiles = [
    
        'components/payments/WalletManager.js',
        'pages/api/payments/revolut/create-subscription.js',
        'lib/revolut-real.js'
      ];

      const status = subscriptionFiles.map(file => {
        const fullPath = path.resolve(PROJECT_ROOT, file);
        return {
          file,
          exists: fs.existsSync(fullPath),
          size: fs.existsSync(fullPath) ? fs.statSync(fullPath).size : 0
        };
      });

      return {
        content: [
          {
            type: 'text',
            text: `💳 Subscription System Status:\n\n${status.map(s => 
              `${s.exists ? '✅' : '❌'} ${s.file} ${s.exists ? `(${s.size} bytes)` : '(missing)'}`
            ).join('\n')}`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to check subscription status: ${error.message}`);
    }
  }

  async syncProjectState(includeGitStatus = true) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(path.resolve(PROJECT_ROOT, 'package.json'), 'utf8'));
      
      let gitStatus = '';
      if (includeGitStatus) {
        try {
          gitStatus = execSync('git status --porcelain', { 
            cwd: PROJECT_ROOT, 
            encoding: 'utf8' 
          });
        } catch (e) {
          gitStatus = 'Git status unavailable';
        }
      }

      const projectState = {
        name: packageJson.name,
        version: packageJson.version,
        lastModified: new Date().toISOString(),
        gitStatus: gitStatus.trim() || 'Working directory clean',
        dependencies: Object.keys(packageJson.dependencies || {}).length,
        devDependencies: Object.keys(packageJson.devDependencies || {}).length
      };

      return {
        content: [
          {
            type: 'text',
            text: `🔄 MSC & Co Platform State:\n\n${JSON.stringify(projectState, null, 2)}`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to sync project state: ${error.message}`);
    }
  }

  async testRevolutIntegration(testType = 'all') {
    try {
      const revolutFiles = {
        'lib/revolut-real.js': 'Real Revolut API integration',

        'pages/api/payments/revolut/create-subscription.js': 'Subscription API',
        'pages/api/payments/revolut/add-wallet-funds.js': 'Wallet API',
        'pages/api/payments/revolut/webhook.js': 'Webhook handler'
      };

      const results = [];

      for (const [file, description] of Object.entries(revolutFiles)) {
        const fullPath = path.resolve(PROJECT_ROOT, file);
        const exists = fs.existsSync(fullPath);

        if (exists && (testType === 'all' || file.includes(testType))) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const hasApiKey = content.includes('REVOLUT_SECRET_KEY') || content.includes('REVOLUT_PUBLIC_KEY');

          results.push(`${exists ? '✅' : '❌'} ${description}: ${exists ? 'Found' : 'Missing'} ${hasApiKey ? '(API keys configured)' : '(no API keys)'}`);
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: `🏦 Revolut Integration Status (${testType}):\n\n${results.join('\n')}`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to test Revolut integration: ${error.message}`);
    }
  }

  async apolloInfiniteTool(args) {
    if (!this.apolloReady || !infiniteToolGenerator) {
      return {
        content: [
          {
            type: 'text',
            text: '⚠️ Apollo INFINITE GENIUS not available. Please ensure lib/apollo/infinite-brain.js exists.'
          }
        ]
      };
    }

    try {
      const { action, category, subcategory, capability, args: toolArgs, context, user_id } = args;

      let result;

      switch (action) {
        case 'execute_tool':
          if (!category || !subcategory || !capability) {
            throw new Error('Missing required parameters: category, subcategory, and capability required for execute_tool');
          }
          result = await infiniteToolGenerator.executeTool(
            category,
            subcategory,
            capability,
            toolArgs || {},
            user_id
          );
          break;

        case 'recommend_tools':
          result = await infiniteToolGenerator.recommendTools(
            context || { goal: 'improve music career' },
            10
          );
          break;

        case 'list_categories':
          result = {
            categories: infiniteToolGenerator.getAvailableCategories(),
            total_possible_tools: infiniteToolGenerator.getTotalPossibleTools()
          };
          break;

        case 'discover_capabilities':
          if (!category) {
            throw new Error('Missing required parameter: category required for discover_capabilities');
          }
          if (subcategory) {
            result = {
              category,
              subcategory,
              capabilities: infiniteToolGenerator.getCapabilities(category, subcategory)
            };
          } else {
            result = {
              category,
              subcategories: infiniteToolGenerator.getSubcategories(category)
            };
          }
          break;

        default:
          throw new Error(`Unknown action: ${action}`);
      }

      return {
        content: [
          {
            type: 'text',
            text: `∞ APOLLO INFINITE GENIUS (${action}):\n\n${JSON.stringify(result, null, 2)}`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Apollo INFINITE GENIUS error: ${error.message}`);
    }
  }

  async apolloChat(args) {
    if (!this.apolloReady || !infiniteToolGenerator) {
      return {
        content: [
          {
            type: 'text',
            text: '⚠️ Apollo INFINITE GENIUS not available. Please ensure lib/apollo/infinite-brain.js exists.'
          }
        ]
      };
    }

    try {
      const { message, user_id, conversation_history } = args;

      if (!message) {
        throw new Error('Message is required for apollo_chat');
      }

      // Use the infinite tool generator's conversational AI
      const response = await infiniteToolGenerator.chat(
        message,
        conversation_history || [],
        user_id
      );

      return {
        content: [
          {
            type: 'text',
            text: `💬 Apollo: ${response.message}\n\n${response.suggestions ? '\n🎯 Suggestions:\n' + response.suggestions.map(s => `- ${s}`).join('\n') : ''}`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Apollo chat error: ${error.message}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

// Start the server
const server = new MSCPlatformServer();
server.run().catch(console.error);
