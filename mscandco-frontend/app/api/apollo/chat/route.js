/**
 * Apollo Intelligence - Advanced Chat API
 * The world's most intelligent music industry AI assistant
 * Full database integration, proactive insights, autonomous actions
 */

import { NextResponse } from 'next/server';
import { apolloThink } from '@/lib/apollo/brain';
import { enforceApolloQueryLimit, trackApolloQuery } from '@/lib/middleware/tierEnforcement';

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request) {
  try {
    // Lazy load Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const { messages, userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    console.log('🧠 Apollo Advanced Chat - User:', userId);
    
    // Get request URL for staging detection
    const requestUrl = request.headers.get('referer') || request.headers.get('host') || '';
    console.log('🌐 Request URL:', requestUrl);

    // TEMPORARY: Force bypass for all users until we fix the issue
    const FORCE_BYPASS_ALL = true;
    
    let limitCheck = { allowed: true, currentUsage: null };
    
    if (FORCE_BYPASS_ALL) {
      console.log(`⚠️ FORCE BYPASS: Skipping Apollo limit check for user ${userId}`);
      limitCheck = {
        allowed: true,
        bypassReason: 'force_bypass_all_enabled',
        currentUsage: { used: 0, limit: 'unlimited', remaining: 'unlimited' }
      };
    } else {
      // TIER ENFORCEMENT: Check Apollo query limit
      limitCheck = await enforceApolloQueryLimit(userId);
      
      // Log the limit check result for debugging
      console.log('🔍 Apollo limit check result:', {
        userId,
        allowed: limitCheck.allowed,
        bypassReason: limitCheck.bypassReason,
        isAdmin: limitCheck.isAdmin,
        currentUsage: limitCheck.currentUsage,
        warning: limitCheck.warning
      });
      
      if (!limitCheck.allowed) {
        console.log(`⚠️ Apollo limit blocked for user ${userId}:`, limitCheck.error);
        console.log(`📊 Limit details:`, limitCheck.currentUsage);
        
        // TEMPORARY DEBUGGING: Log full user profile to understand the issue
        try {
          const { data: debugUser } = await supabase
            .from('user_profiles')
            .select('id, role, tier, apollo_queries_used_this_month, apollo_query_limit, apollo_unlimited_addon')
            .eq('id', userId)
            .single();
          console.log(`🔍 DEBUG - User profile data:`, debugUser);
        } catch (debugError) {
          console.error('Error fetching debug user data:', debugError);
        }
        
        return NextResponse.json({
          error: 'Apollo Intelligence limit reached',
          message: limitCheck.error,
          upgradeMessage: limitCheck.upgradeMessage,
          upgradeUrl: limitCheck.upgradeUrl,
          addonUrl: limitCheck.addonUrl,
          currentUsage: limitCheck.currentUsage
        }, { status: 403 });
      }
      
      // Log successful access
      if (limitCheck.bypassReason) {
        console.log(`✅ Apollo access granted (bypass: ${limitCheck.bypassReason}) for user ${userId}`);
        if (limitCheck.warning) {
          console.log(`⚠️ Warning: ${limitCheck.warning}`);
        }
      }
    }

    // Extract the latest user message
    const latestMessage = messages[messages.length - 1];
    if (!latestMessage || latestMessage.role !== 'user') {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      );
    }

    // Convert messages to conversation history format
    const conversationHistory = messages.slice(0, -1).map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp || new Date().toISOString()
    }));

    // DEMO MODE: Return demo response
    const DEMO_MODE = false; // Set to true for demo
    
    let result;
    try {
      if (DEMO_MODE) {
        // Demo response - line by line format
        result = {
          response: `Release live on 15+ Platforms

Metadata optimized.

Copyright registered.

ISRC generated.

Carbon calculated.

Playlist pitched.

Blockchain verified.

Music distribution only took 4minutes and 16 seconds

Now lets move on to a release strategy, I can help you position your release for maximum impact`,
          toolsUsed: []
        };
      } else {
        console.log('🧠 Calling apolloThink with:', {
          messageLength: latestMessage.content.length,
          userId,
          conversationHistoryLength: conversationHistory.length
        });
        
        result = await apolloThink(latestMessage.content, userId, conversationHistory);

        console.log('✅ Apollo Brain response:', {
          hasResponse: !!result?.response,
          responseLength: result?.response?.length || 0,
          toolsUsed: result?.toolsUsed?.length || 0,
          tools: result?.toolsUsed || []
        });
      }
    } catch (apolloError) {
      console.error('❌ Apollo processing error:', {
        message: apolloError.message,
        stack: apolloError.stack,
        name: apolloError.name
      });
      
      // Provide user-friendly error messages
      let userMessage = 'I encountered an issue processing your request.';
      
      if (apolloError.message.includes('429') || apolloError.message.includes('rate limit') || apolloError.message.includes('TPM')) {
        userMessage = 'I\'m currently handling a lot of requests. Please wait a moment and try again.';
      } else if (apolloError.message.includes('timeout')) {
        userMessage = 'Your request took too long to process. Please try again with a simpler question.';
      } else if (apolloError.message.includes('invalid') || apolloError.message.includes('format')) {
        userMessage = 'There was an issue with the request format. Please try rephrasing your question.';
      }
      
      throw new Error(userMessage);
    }

    // Validate result
    if (!result || !result.response) {
      console.error('❌ Apollo returned invalid result:', result);
      throw new Error('I couldn\'t generate a proper response. Please try again.');
    }

    // TIER TRACKING: Increment Apollo query counter (skip if bypassing)
    if (!FORCE_BYPASS_ALL && limitCheck.bypassReason !== 'force_bypass_all_enabled') {
      await trackApolloQuery(userId);
    } else {
      console.log(`⏭️ Skipping Apollo query tracking (bypass mode)`);
    }

    return NextResponse.json({
      response: result.response,
      tool_calls: result.toolsUsed,
      usage: limitCheck.currentUsage,
      timestamp: new Date().toISOString(),
      demo: DEMO_MODE // Flag to indicate demo mode
    });

  } catch (error) {
    console.error('❌ Apollo Chat error:', error);

    // Return user-friendly error message
    const userMessage = error.message || 'I encountered an issue. Please try again or contact support if the problem persists.';

    return NextResponse.json(
      {
        error: userMessage,
      },
      { status: 500 }
    );
  }
}

// Apollo Brain handles all context automatically

