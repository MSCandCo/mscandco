/**
 * Apollo Intelligence - Insights API
 * Generates and retrieves proactive insights for users
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateInsights } from '@/lib/apollo/insights-engine';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * GET - Retrieve insights for a user
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }
    
    console.log('📊 Fetching insights for user:', userId);
    
    // Get stored insights from database
    const { data: insights, error } = await supabase
      .from('apollo_insights')
      .select('*')
      .eq('user_id', userId)
      .eq('dismissed', false)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      insights: insights || [],
      count: insights?.length || 0,
    });
    
  } catch (error) {
    console.error('❌ Error fetching insights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insights', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST - Generate new insights for a user
 */
export async function POST(request) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }
    
    console.log('🔍 Generating insights for user:', userId);
    
    // Generate insights using the engine
    const insights = await generateInsights(userId);
    
    console.log(`✅ Generated ${insights.length} insights`);
    
    // Store insights in database
    if (insights.length > 0) {
      const insightsToStore = insights.map(insight => ({
        user_id: userId,
        type: insight.type,
        priority: insight.priority,
        icon: insight.icon,
        title: insight.title,
        message: insight.message,
        action: insight.action,
        data: insight.data,
        dismissed: false,
        created_at: new Date().toISOString(),
      }));
      
      const { error } = await supabase
        .from('apollo_insights')
        .insert(insightsToStore);
      
      if (error) {
        console.error('Error storing insights:', error);
        // Don't fail the request, just log the error
      }
    }
    
    return NextResponse.json({
      success: true,
      insights: insights,
      count: insights.length,
    });
    
  } catch (error) {
    console.error('❌ Error generating insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Dismiss an insight
 */
export async function PATCH(request) {
  try {
    const { insightId, userId } = await request.json();
    
    if (!insightId || !userId) {
      return NextResponse.json(
        { error: 'Insight ID and User ID required' },
        { status: 400 }
      );
    }
    
    const { error } = await supabase
      .from('apollo_insights')
      .update({ dismissed: true, dismissed_at: new Date().toISOString() })
      .eq('id', insightId)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      message: 'Insight dismissed',
    });
    
  } catch (error) {
    console.error('❌ Error dismissing insight:', error);
    return NextResponse.json(
      { error: 'Failed to dismiss insight', details: error.message },
      { status: 500 }
    );
  }
}

