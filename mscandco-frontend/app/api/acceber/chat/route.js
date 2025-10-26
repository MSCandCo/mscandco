/**
 * MSC AI Assistant - Chat API
 * Handles conversational AI with OpenAI function calling
 */

import { NextResponse } from 'next/server';
import { openai, ACCEBER_CONFIG } from '@/lib/acceber/client';
import { MVP_TOOLS } from '@/lib/acceber/tools-mvp';
import { getSystemPrompt } from '@/lib/acceber/prompts';
import { executeToolCall } from '@/lib/acceber/tool-executor';
import { createClient } from '@supabase/supabase-js';

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
    
    console.log('💬 Acceber chat request from user:', userId);
    
    // Get user context for personalization
    const userContext = await getUserContext(userId);
    
    // Create system message with user context
    const systemMessage = {
      role: 'system',
      content: getSystemPrompt(userContext),
    };
    
    // Call OpenAI with function calling
    const response = await openai.chat.completions.create({
      ...ACCEBER_CONFIG,
      messages: [systemMessage, ...messages],
      tools: MVP_TOOLS,
      tool_choice: 'auto', // Let AI decide when to use tools
    });
    
    const assistantMessage = response.choices[0].message;
    
    console.log('🤖 OpenAI response:', {
      hasContent: !!assistantMessage.content,
      hasToolCalls: !!assistantMessage.tool_calls,
      toolCount: assistantMessage.tool_calls?.length || 0,
    });
    
    // Handle tool calls if any
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolResults = [];
      
      for (const toolCall of assistantMessage.tool_calls) {
        console.log(`🔧 Executing tool: ${toolCall.function.name}`);
        
        try {
          const result = await executeToolCall(
            toolCall.function.name,
            JSON.parse(toolCall.function.arguments),
            userId
          );
          
          toolResults.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(result),
          });
          
          console.log(`✅ Tool ${toolCall.function.name} executed successfully`);
        } catch (error) {
          console.error(`❌ Tool ${toolCall.function.name} failed:`, error);
          
          toolResults.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify({
              success: false,
              error: error.message || 'Tool execution failed',
            }),
          });
        }
      }
      
      // Get final response with tool results
      const finalResponse = await openai.chat.completions.create({
        ...ACCEBER_CONFIG,
        messages: [
          systemMessage,
          ...messages,
          assistantMessage,
          ...toolResults,
        ],
      });
      
      console.log('✅ Final response generated with tool results');
      
      return NextResponse.json({
        response: finalResponse.choices[0].message.content,
        tool_calls: assistantMessage.tool_calls.map(tc => ({
          name: tc.function.name,
          args: JSON.parse(tc.function.arguments),
        })),
      });
    }
    
    // No tools needed - direct response
    console.log('✅ Direct response (no tools)');
    
    return NextResponse.json({
      response: assistantMessage.content,
    });
    
  } catch (error) {
    console.error('❌ Acceber chat error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to process message',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Get user context for personalization
 */
async function getUserContext(userId) {
  try {
    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    // Get earnings summary
    const { data: earnings } = await supabase
      .from('earnings_log')
      .select('amount, platform')
      .eq('artist_id', userId);
    
    const totalEarnings = earnings?.reduce(
      (sum, e) => sum + parseFloat(e.amount || 0),
      0
    ) || 0;
    
    // Get top platform
    const platformTotals = earnings?.reduce((acc, e) => {
      const platform = e.platform || 'Unknown';
      acc[platform] = (acc[platform] || 0) + parseFloat(e.amount || 0);
      return acc;
    }, {}) || {};
    
    const topPlatform = Object.entries(platformTotals)
      .sort(([, a], [, b]) => b - a)[0]?.[0];
    
    // Get releases count
    const { data: releases } = await supabase
      .from('releases')
      .select('id')
      .eq('artist_id', userId);
    
    // Get subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('tier')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();
    
    return {
      name: profile?.first_name || profile?.artist_name || 'there',
      artist_name: profile?.artist_name,
      role: profile?.role || 'artist',
      total_releases: releases?.length || 0,
      total_earnings: totalEarnings.toFixed(2),
      subscription_tier: subscription?.tier || 'Free',
      top_platform: topPlatform,
    };
  } catch (error) {
    console.error('Error getting user context:', error);
    return {
      name: 'there',
      role: 'artist',
      total_releases: 0,
      total_earnings: '0.00',
      subscription_tier: 'Free',
    };
  }
}

