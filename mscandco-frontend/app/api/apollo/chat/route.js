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

    // TIER ENFORCEMENT: Check Apollo query limit
    const limitCheck = await enforceApolloQueryLimit(userId);
    if (!limitCheck.allowed) {
      return NextResponse.json({
        error: 'Apollo Intelligence limit reached',
        message: limitCheck.error,
        upgradeMessage: limitCheck.upgradeMessage,
        upgradeUrl: limitCheck.upgradeUrl,
        addonUrl: limitCheck.addonUrl,
        currentUsage: limitCheck.currentUsage
      }, { status: 403 });
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

