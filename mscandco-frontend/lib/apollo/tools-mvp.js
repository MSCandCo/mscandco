/**
 * Apollo Intelligence - MVP Tool Definitions
 * 8 essential tools for investor demo
 */

export const MVP_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'get_earnings_summary',
      description: 'Get comprehensive earnings summary with platform breakdown for a specific timeframe',
      parameters: {
        type: 'object',
        properties: {
          timeframe: {
            type: 'string',
            enum: ['week', 'month', 'quarter', 'year', 'all'],
            description: 'Timeframe for earnings analysis'
          }
        },
        required: ['timeframe']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'compare_platforms',
      description: 'Compare earnings across different streaming platforms to see which pays the most',
      parameters: {
        type: 'object',
        properties: {
          timeframe: {
            type: 'string',
            enum: ['week', 'month', 'quarter', 'year'],
            description: 'Timeframe for platform comparison'
          }
        },
        required: ['timeframe']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_releases',
      description: 'Get list of user\'s music releases with optional status filter',
      parameters: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['all', 'draft', 'submitted', 'live', 'processing'],
            description: 'Filter releases by status'
          },
          limit: {
            type: 'number',
            description: 'Maximum number of releases to return (default: 10)'
          }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_wallet_balance',
      description: 'Get current wallet balance including available and pending amounts',
      parameters: {
        type: 'object',
        properties: {}
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_analytics',
      description: 'Get performance analytics and streaming statistics',
      parameters: {
        type: 'object',
        properties: {
          metric: {
            type: 'string',
            enum: ['overview', 'streams', 'revenue', 'growth'],
            description: 'Specific metric to analyze'
          }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'suggest_release_timing',
      description: 'Analyze and suggest optimal release date based on genre and release type',
      parameters: {
        type: 'object',
        properties: {
          genre: {
            type: 'string',
            description: 'Music genre (e.g., pop, hip-hop, rock, gospel)'
          },
          release_type: {
            type: 'string',
            enum: ['single', 'ep', 'album'],
            description: 'Type of release'
          }
        },
        required: ['genre', 'release_type']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_release_draft',
      description: 'Create a new release draft that can be completed later',
      parameters: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Release title'
          },
          release_type: {
            type: 'string',
            enum: ['single', 'ep', 'album'],
            description: 'Type of release'
          },
          genre: {
            type: 'string',
            description: 'Primary genre'
          }
        },
        required: ['title', 'release_type', 'genre']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'request_payout',
      description: 'Request a payout from available wallet balance',
      parameters: {
        type: 'object',
        properties: {
          amount: {
            type: 'number',
            description: 'Amount to withdraw (optional, defaults to full available balance)'
          }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_profile',
      description: 'Update user profile information on MSC & Co platform (artist name, bio, contact info, etc.)',
      parameters: {
        type: 'object',
        properties: {
          artist_name: {
            type: 'string',
            description: 'Artist/stage name for releases'
          },
          first_name: {
            type: 'string',
            description: 'User\'s first name'
          },
          last_name: {
            type: 'string',
            description: 'User\'s last name'
          },
          bio: {
            type: 'string',
            description: 'Artist biography'
          },
          phone: {
            type: 'string',
            description: 'Phone number'
          }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_profile',
      description: 'Get current user profile information from MSC & Co platform',
      parameters: {
        type: 'object',
        properties: {}
      }
    }
  }
];

