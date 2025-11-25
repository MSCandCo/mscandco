/**
 * Apollo Intelligence - Advanced Chat API
 * The world's most intelligent music industry AI assistant
 * Full database integration, proactive insights, autonomous actions
 */

import { NextResponse } from 'next/server';
import { apolloThink } from '@/lib/apollo/brain';
import { createClient } from '@supabase/supabase-js';
import { enforceApolloQueryLimit, trackApolloQuery } from '@/lib/middleware/tierEnforcement';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
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

    // Use Apollo Brain for ultra-intelligent response
    let result;
    try {
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
    } catch (apolloError) {
      console.error('❌ Apollo Brain error:', {
        message: apolloError.message,
        stack: apolloError.stack,
        name: apolloError.name
      });
      throw new Error(`Apollo Brain error: ${apolloError.message}`);
    }

    // Validate result
    if (!result || !result.response) {
      console.error('❌ Apollo Brain returned invalid result:', result);
      throw new Error('Apollo Brain returned an invalid response');
    }

    // TIER TRACKING: Increment Apollo query counter
    await trackApolloQuery(userId);

    return NextResponse.json({
      response: result.response,
      tool_calls: result.toolsUsed,
      usage: limitCheck.currentUsage,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Apollo Advanced Chat error:', error);

    return NextResponse.json(
      {
        error: 'Failed to process message',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Apollo Brain handles all context automatically

