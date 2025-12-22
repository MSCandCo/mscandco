/**
 * Touring Platform - Apollo AI Integration
 * Conversational tour management via Apollo
 */

import { NextResponse } from 'next/server';
import { apolloThink } from '@/lib/apollo/brain';

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'


/**
 * POST - Chat with Apollo about touring
 */
export async function POST(request) {
  try {
    // Lazy load Supabase client
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceRoleClient();

    const { message, userId, conversationHistory = [] } = await request.json();
    
    if (!message || !userId) {
      return NextResponse.json(
        { error: 'Message and userId required' },
        { status: 400 }
      );
    }
    
    // Get user's tours for context
    const { data: tours } = await supabaseAdmin
      .from('tours')
      .select('id, name, status, start_date, end_date')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    // Enhanced system prompt for touring
    const systemContext = `You are Apollo, an AI assistant specialized in touring management for MSC & Co.

You can help users with:
- Creating and managing tours
- Finding and matching venues
- Managing crew and personnel
- Guest list management
- Itinerary planning
- Travel and hotel booking
- Set list management
- Financial tracking and analytics
- Route optimization

User's current tours: ${JSON.stringify(tours || [])}

When users ask about tours, venues, crew, or guest lists, provide helpful, actionable advice.
You can suggest creating tours, finding venues, adding crew members, managing guest lists, etc.`;
    
    // Use Apollo Brain for intelligent response
    const result = await apolloThink(
      message,
      userId,
      conversationHistory,
      systemContext
    );
    
    return NextResponse.json({
      success: true,
      response: result.response || result.message || 'I\'m here to help with your touring needs!',
      tool_calls: result.tool_calls || [],
      suggestions: result.suggestions || []
    });
    
  } catch (error) {
    console.error('❌ Apollo touring chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error.message },
      { status: 500 }
    );
  }
}

