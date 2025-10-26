/**
 * Apollo Intelligence - Greeting API
 * Generates personalized welcome messages
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }
    
    console.log('👋 Generating greeting for user:', userId);
    
    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('first_name, artist_name, role')
      .eq('id', userId)
      .single();
    
    const name = profile?.first_name || profile?.artist_name || 'there';
    const role = profile?.role || 'artist';
    
    // Get some quick stats for personalization
    const { data: releases } = await supabase
      .from('releases')
      .select('id, status')
      .eq('artist_id', userId);
    
    const { data: earnings } = await supabase
      .from('earnings_log')
      .select('amount')
      .eq('artist_id', userId)
      .limit(1);
    
    const hasReleases = releases && releases.length > 0;
    const hasEarnings = earnings && earnings.length > 0;
    
    // Generate contextual greeting
    let greeting;
    
    if (hasReleases && hasEarnings) {
      const greetings = [
        `Hey ${name}! 👋 I'm Apollo, your AI music assistant. Ready to check on your releases and earnings?`,
        `Hi ${name}! 🎵 Great to see you! Want to see how your music is performing?`,
        `Welcome back, ${name}! I'm Apollo, here to help with releases, earnings, analytics, or anything else. What's on your mind?`,
        `Hey ${name}! 💰 Your music is out there making moves! How can I help you today?`,
      ];
      greeting = greetings[Math.floor(Math.random() * greetings.length)];
    } else if (hasReleases) {
      greeting = `Hey ${name}! 👋 I'm Apollo, your AI music assistant. I see you have some releases. Want to check their performance or create something new?`;
    } else {
      const greetings = [
        `Hey ${name}! 👋 I'm Apollo, your AI music assistant. Ready to release your first track? I can guide you through the entire process!`,
        `Hi ${name}! 🎵 Welcome to MSC & Co! I'm Apollo, and I'm here to help you distribute your music. Want to get started with your first release?`,
        `Hey ${name}! Excited to have you here! I'm Apollo, your AI assistant. I can help you release music, analyze earnings, and much more. What would you like to do?`,
      ];
      greeting = greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    console.log('✅ Greeting generated successfully');
    
    return NextResponse.json({
      greeting,
      user_name: name,
      role,
    });
    
  } catch (error) {
    console.error('❌ Greeting generation error:', error);
    
    // Fallback greeting
    return NextResponse.json({
      greeting: "Hi! 👋 I'm Apollo, your AI music assistant. How can I help you today?",
    });
  }
}

