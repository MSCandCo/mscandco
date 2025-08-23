#!/usr/bin/env node

/**
 * MSC & Co Platform MCP Server
 * Custom MCP server for multi-Claude collaboration on the MSC & Co platform
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

class MSCPlatformServer {
  constructor() {
    this.server = new Server(
      {
        name: 'msc-platform-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
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

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

// Start the server
const server = new MSCPlatformServer();
server.run().catch(console.error);
