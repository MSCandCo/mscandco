/**
 * Apollo Intelligence - Daily Insights Cron Job
 * Generates proactive insights for all active users
 * 
 * Schedule: Daily at 6:00 AM UTC
 * Vercel Cron: 0 6 * * *
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateInsights } from '@/lib/apollo/insights-engine';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log('🔄 Starting daily insights generation...');
    
    // Get all active users (artists with releases or earnings)
    const { data: activeUsers, error } = await supabase
      .from('user_profiles')
      .select('id, email, artist_name')
      .in('role', ['artist', 'label_admin']);
    
    if (error) throw error;
    
    console.log(`📊 Processing ${activeUsers.length} users...`);
    
    let totalInsights = 0;
    let processedUsers = 0;
    const errors = [];
    
    // Generate insights for each user
    for (const user of activeUsers) {
      try {
        console.log(`🔍 Generating insights for ${user.artist_name || user.email}...`);
        
        const insights = await generateInsights(user.id);
        
        if (insights.length > 0) {
          // Store insights in database
          const insightsToStore = insights.map(insight => ({
            user_id: user.id,
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
          
          const { error: insertError } = await supabase
            .from('apollo_insights')
            .insert(insightsToStore);
          
          if (insertError) {
            console.error(`Error storing insights for ${user.email}:`, insertError);
            errors.push({ user: user.email, error: insertError.message });
          } else {
            totalInsights += insights.length;
            console.log(`✅ Generated ${insights.length} insights for ${user.artist_name || user.email}`);
          }
        }
        
        processedUsers++;
      } catch (userError) {
        console.error(`Error processing user ${user.email}:`, userError);
        errors.push({ user: user.email, error: userError.message });
      }
    }
    
    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      processed_users: processedUsers,
      total_users: activeUsers.length,
      total_insights: totalInsights,
      errors: errors.length,
      error_details: errors.length > 0 ? errors : undefined,
    };
    
    console.log('✅ Daily insights generation complete:', summary);
    
    return NextResponse.json(summary);
    
  } catch (error) {
    console.error('❌ Cron job error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate insights',
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST(request) {
  return GET(request);
}

