/**
 * Apollo Tools - Web Search and Enhanced Capabilities
 * Provides Apollo with access to real-time information and enhanced knowledge
 */

/**
 * Web search tool for Apollo
 * Uses Tavily AI for web search (or fallback to basic search)
 */
export async function webSearch(query) {
  try {
    console.log('🔍 Apollo searching web for:', query);

    // Check if Tavily API key is available
    if (process.env.TAVILY_API_KEY) {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: process.env.TAVILY_API_KEY,
          query,
          search_depth: 'basic',
          max_results: 5,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Tavily search successful');
        return {
          success: true,
          results: data.results.map(r => ({
            title: r.title,
            url: r.url,
            content: r.content,
          })),
        };
      }
    }

    // Fallback: Use Perplexity or return generic response
    console.log('⚠️ No Tavily API key, using fallback');
    return {
      success: false,
      message: 'Web search not available. Using existing knowledge.',
    };

  } catch (error) {
    console.error('❌ Web search error:', error);
    return {
      success: false,
      message: 'Search failed. Using existing knowledge.',
    };
  }
}

/**
 * Fetch and read content from a specific website URL
 */
export async function fetchWebsite(url) {
  try {
    console.log('🌐 Apollo fetching website:', url);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ApolloBot/1.0; +https://mscandco.com)',
      },
    });

    if (!response.ok) {
      return {
        success: false,
        message: `Failed to fetch website: ${response.status}`,
      };
    }

    const html = await response.text();

    // Basic HTML to text conversion - remove scripts, styles, and tags
    let text = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Limit to first 5000 characters to avoid token limits
    text = text.substring(0, 5000);

    console.log('✅ Website fetched successfully');
    return {
      success: true,
      url,
      content: text,
    };

  } catch (error) {
    console.error('❌ Website fetch error:', error);
    return {
      success: false,
      message: `Error fetching website: ${error.message}`,
    };
  }
}

/**
 * Get artist information from web
 */
export async function searchArtistInfo(artistName, genre, location, website = null) {
  // If website provided, fetch it directly
  if (website) {
    const websiteData = await fetchWebsite(website);
    if (websiteData.success) {
      return {
        found: true,
        info: websiteData.content,
        source: website,
      };
    }
  }

  // Otherwise try web search
  const query = `${artistName} ${genre} artist from ${location}`;
  const results = await webSearch(query);

  if (results.success && results.results.length > 0) {
    return {
      found: true,
      info: results.results[0].content,
      sources: results.results.map(r => r.url),
    };
  }

  return {
    found: false,
    info: null,
  };
}

/**
 * Tool definitions for OpenAI function calling
 */
/**
 * Create tour from ticket link
 * Apollo can create a tour by parsing a ticket URL and asking clarifying questions
 */
async function createTourFromTicketLink(ticketUrl, userId, additionalInfo = {}) {
  try {
    console.log('🎫 Apollo creating tour from ticket link:', ticketUrl);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3013'}/api/touring/apollo/create-from-ticket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ticketUrl,
        userId,
        tourData: additionalInfo
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // If we need to ask questions, return them
      if (data.needsQuestions) {
        return {
          success: false,
          needsQuestions: true,
          questions: data.questions,
          partialData: data.partialData || data.eventInfo,
          message: `I found some information about this event, but I need a few details to create your tour. Here's what I found: ${JSON.stringify(data.partialData || data.eventInfo)}. Can you help me with: ${data.questions.join(', ')}?`
        };
      }
      
      throw new Error(data.error || 'Failed to create tour');
    }
    
    return {
      success: true,
      tour: data.tour,
      tourDate: data.tourDate,
      message: data.message || `Successfully created tour "${data.tour.name}"!`
    };
    
  } catch (error) {
    console.error('❌ Create tour from ticket error:', error);
    return {
      success: false,
      error: error.message,
      message: `Failed to create tour: ${error.message}`
    };
  }
}

/**
 * Preview event info from ticket URL
 * Apollo can use this to see what information is available before asking questions
 */
async function previewTicketEvent(ticketUrl) {
  try {
    console.log('🔍 Apollo previewing ticket event:', ticketUrl);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3013'}/api/touring/apollo/create-from-ticket?ticketUrl=${encodeURIComponent(ticketUrl)}`, {
      method: 'GET'
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error,
        needsQuestions: true,
        questions: data.questions || []
      };
    }
    
    return {
      success: true,
      eventInfo: data.eventInfo,
      needsQuestions: data.needsQuestions,
      questions: data.questions || [],
      message: data.needsQuestions 
        ? `I found some information about this event. I'll need to ask you: ${data.questions.join(', ')}`
        : `I found complete information about this event: ${data.eventInfo.name} on ${data.eventInfo.date} at ${data.eventInfo.venue?.name} in ${data.eventInfo.venue?.city}.`
    };
    
  } catch (error) {
    console.error('❌ Preview ticket error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export const APOLLO_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'search_web',
      description: 'Search the web for current information about artists, music trends, or any topic. Use this when you need to find real information about a specific artist or topic.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The search query to look up on the web',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_artist_info',
      description: 'Search for information about a specific artist to write their bio. Use this when a user asks you to write their bio. If they provide a website URL, include it to fetch content directly.',
      parameters: {
        type: 'object',
        properties: {
          artist_name: {
            type: 'string',
            description: 'The artist name to search for',
          },
          genre: {
            type: 'string',
            description: 'The music genre',
          },
          location: {
            type: 'string',
            description: 'City or country where the artist is from',
          },
          website: {
            type: 'string',
            description: 'Optional: Artist website URL if provided by the user (e.g., www.artistname.com or https://artistname.com)',
          },
        },
        required: ['artist_name', 'genre', 'location'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'fetch_website',
      description: 'Fetch and read content from a specific website URL. Use this when the user provides a website and you need to read its content (like for writing a bio).',
      parameters: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'The website URL to fetch (e.g., https://www.example.com or www.example.com)',
          },
        },
        required: ['url'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'preview_ticket_event',
      description: 'Preview event information from a ticket link (Eventbrite, Ticketmaster, etc.). Use this first when a user provides a ticket URL to see what information is available before creating a tour.',
      parameters: {
        type: 'object',
        properties: {
          ticketUrl: {
            type: 'string',
            description: 'The ticket/event URL (e.g., https://www.eventbrite.com/e/event-name-123456789 or https://www.ticketmaster.com/event/...).',
          },
        },
        required: ['ticketUrl'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_tour_from_ticket',
      description: 'Create a tour from a ticket link. Use this after previewing the ticket event and gathering any missing information from the user. Ask clarifying questions if needed before calling this function.',
      parameters: {
        type: 'object',
        properties: {
          ticketUrl: {
            type: 'string',
            description: 'The ticket/event URL',
          },
          userId: {
            type: 'string',
            description: 'The user ID creating the tour',
          },
          tourName: {
            type: 'string',
            description: 'Optional: Custom tour name. If not provided, will be generated from event info.',
          },
          description: {
            type: 'string',
            description: 'Optional: Tour description',
          },
          budget: {
            type: 'number',
            description: 'Optional: Tour budget amount',
          },
        },
        required: ['ticketUrl', 'userId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_tour_from_multiple_tickets',
      description: '🎫 Create a tour from multiple ticket links. Use this when the user provides multiple event URLs. Apollo should preview all events first, ask for any missing information, then create a single tour with multiple dates.',
      parameters: {
        type: 'object',
        properties: {
          ticketUrls: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of ticket/event URLs',
          },
          userId: {
            type: 'string',
            description: 'The user ID creating the tour',
          },
          tourName: {
            type: 'string',
            description: 'Optional: Custom tour name',
          },
          description: {
            type: 'string',
            description: 'Optional: Tour description',
          },
          budget: {
            type: 'number',
            description: 'Optional: Tour budget amount',
          },
        },
        required: ['ticketUrls', 'userId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_tour_suggestions',
      description: '💡 Get AI-powered suggestions for tour naming, crew recommendations, budget estimates, or venue matching. Use this to help users make decisions about their tours.',
      parameters: {
        type: 'object',
        properties: {
          suggestionType: {
            type: 'string',
            enum: ['tour_name', 'crew', 'budget', 'venue'],
            description: 'Type of suggestion needed',
          },
          data: {
            type: 'object',
            description: 'Context data for suggestions (artist name, cities, capacity, etc.)',
          },
        },
        required: ['suggestionType'],
      },
    },
  },
];

/**
 * Execute tool calls from OpenAI
 */
export async function executeTool(toolName, args) {
  console.log('🔧 Executing tool:', toolName, 'with args:', args);

  switch (toolName) {
    case 'search_web':
      return await webSearch(args.query);

    case 'search_artist_info':
      // Normalize website URL if provided
      let website = args.website;
      if (website && !website.startsWith('http')) {
        website = 'https://' + website;
      }

      return await searchArtistInfo(
        args.artist_name,
        args.genre,
        args.location,
        website
      );

    case 'fetch_website':
      // Normalize URL
      let url = args.url;
      if (!url.startsWith('http')) {
        url = 'https://' + url;
      }
      return await fetchWebsite(url);

    case 'preview_ticket_event':
      return await previewTicketEvent(args.ticketUrl);

    case 'create_tour_from_ticket':
      return await createTourFromTicketLink(
        args.ticketUrl,
        args.userId,
        {
          tourName: args.tourName,
          description: args.description,
          budget: args.budget
        }
      );

    case 'create_tour_from_multiple_tickets':
      return await createTourFromMultipleTickets(
        args.ticketUrls,
        args.userId,
        {
          tourName: args.tourName,
          description: args.description,
          budget: args.budget
        }
      );

    case 'get_tour_suggestions':
      return await getTourSuggestions(args.suggestionType, args.data || {});

    default:
      return {
        success: false,
        message: `Unknown tool: ${toolName}`,
      };
  }
}

/**
 * Create tour from multiple ticket links
 */
async function createTourFromMultipleTickets(ticketUrls, userId, additionalInfo = {}) {
  try {
    console.log('🎫 Apollo creating tour from multiple ticket links:', ticketUrls.length);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3013'}/api/touring/apollo/create-from-ticket-multi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticketUrls,
        userId,
        tourData: additionalInfo
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      if (data.needsQuestions) {
        return {
          success: false,
          needsQuestions: true,
          questions: data.questions,
          events: data.events,
          message: data.message || `I found ${data.events.length} complete events, but need more information for ${data.missingData.length} events.`
        };
      }
      throw new Error(data.error || 'Failed to create tour');
    }
    
    return {
      success: true,
      tour: data.tour,
      tourDates: data.tourDates,
      eventCount: data.eventCount,
      message: data.message || `Successfully created tour "${data.tour.name}" with ${data.tourDates.length} dates!`
    };
    
  } catch (error) {
    console.error('❌ Create multi-tour error:', error);
    return {
      success: false,
      error: error.message,
      message: `Failed to create tour: ${error.message}`
    };
  }
}

/**
 * Get tour suggestions
 */
async function getTourSuggestions(suggestionType, data) {
  try {
    console.log('💡 Apollo getting suggestions:', suggestionType);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3013'}/api/touring/suggestions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: suggestionType,
        data
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to get suggestions');
    }
    
    return {
      success: true,
      suggestions: result.suggestions || result.estimate,
      type: suggestionType,
      message: formatSuggestionMessage(suggestionType, result)
    };
    
  } catch (error) {
    console.error('❌ Get suggestions error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

function formatSuggestionMessage(type, result) {
  switch (type) {
    case 'tour_name':
      return `Here are some tour name suggestions: ${result.suggestions.join(', ')}`;
    case 'crew':
      return `Based on your venue size, I recommend ${result.totalSuggested} crew members: ${result.suggestions.essential.length} essential, ${result.suggestions.recommended.length} recommended, ${result.suggestions.optional.length} optional.`;
    case 'budget':
      return `Estimated budget: ${result.estimate.currency} ${result.estimate.total.toLocaleString()} (${result.estimate.currency} ${result.estimate.perShow.toLocaleString()} per show)`;
    default:
      return 'Suggestions generated';
  }
}
