/**
 * Apollo Intelligence - Context-Aware Greeting API
 * Generates personalized welcome messages based on user role, recent activity, and page visits
 */

import { NextResponse } from 'next/server';

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request) {
  try {
    // Lazy load Supabase client
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceRoleClient();

    const { userId, recentPage } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }
    
    console.log('👋 Generating context-aware greeting for user:', userId, 'recentPage:', recentPage);
    
    // Get user profile with role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('first_name, artist_name, role, email')
      .eq('id', userId)
      .single();
    
    // Prioritize artist name over first name
    const name = profile?.artist_name || profile?.first_name || 'there';
    const role = profile?.role || 'artist';
    const email = profile?.email || '';
    
    // Check if super admin
    const isSuperAdmin = role === 'super_admin' || email?.includes('superadmin') || email?.includes('admin@mscandco');
    
    // Context-aware greeting based on role
    let greeting;
    
    if (isSuperAdmin) {
      // Super Admin greetings - platform management focused
      const superAdminGreetings = [
        `Hey ${name}! 👋 I'm Apollo, your platform intelligence assistant. I can help you manage users, monitor system health, review analytics, or handle any platform operations. What would you like to tackle today?`,
        `Hi ${name}! 🚀 As platform administrator, I'm here to help with user management, system monitoring, analytics, permissions, or any administrative tasks. What's on your agenda?`,
        `Welcome back, ${name}! 💼 I'm Apollo, ready to assist with platform administration. Need help with user roles, system metrics, content moderation, or something else?`,
        `Hey ${name}! 🎯 I'm Apollo, your administrative assistant. I can help you manage the platform, review user activity, check system status, or handle any admin tasks. What do you need?`,
      ];
      greeting = superAdminGreetings[Math.floor(Math.random() * superAdminGreetings.length)];
    } else if (role === 'admin' || role === 'company_admin') {
      // Admin greetings - company/team management focused
      const adminGreetings = [
        `Hey ${name}! 👋 I'm Apollo, your administrative assistant. I can help you manage your team, review releases, check analytics, or handle administrative tasks. What can I help with?`,
        `Hi ${name}! 🎵 I'm Apollo, here to help with team management, content review, analytics, or any admin needs. What's on your mind?`,
        `Welcome back, ${name}! 💼 I'm Apollo, ready to assist with administrative tasks. Need help with team members, releases, or analytics?`,
      ];
      greeting = adminGreetings[Math.floor(Math.random() * adminGreetings.length)];
    } else if (role === 'label_admin') {
      // Label Admin greetings - label/roster focused
      const labelAdminGreetings = [
        `Hey ${name}! 👋 I'm Apollo, your label intelligence assistant. I can help you manage your roster, review releases, track earnings, or handle label operations. What would you like to do?`,
        `Hi ${name}! 🎵 I'm Apollo, here to help with your label. Need assistance with artists, releases, analytics, or label management?`,
        `Welcome back, ${name}! 💰 I'm Apollo, ready to help with label operations. Want to check on your artists, releases, or earnings?`,
      ];
      greeting = labelAdminGreetings[Math.floor(Math.random() * labelAdminGreetings.length)];
    } else {
      // Artist greetings - context-aware based on recent page visits
      let contextGreeting = null;
      
      // Check recent page visit for context
      if (recentPage) {
        if (recentPage.includes('touring') || recentPage.includes('tour')) {
          contextGreeting = `Hey ${name}! 🎸 I see you've been working on touring. I can help you create tours, manage dates, optimize routes, track flights, or handle any touring needs. What would you like to do?`;
        } else if (recentPage.includes('releases') || recentPage.includes('release')) {
          contextGreeting = `Hi ${name}! 🎵 I notice you've been working with releases. I can help you create new releases, check their performance, update details, or handle distribution. What do you need?`;
        } else if (recentPage.includes('analytics') || recentPage.includes('earnings')) {
          contextGreeting = `Hey ${name}! 📊 I see you've been checking analytics. I can help you analyze your music performance, compare platforms, track earnings, or dive deeper into your data. What would you like to explore?`;
        } else if (recentPage.includes('wallet') || recentPage.includes('billing')) {
          contextGreeting = `Hi ${name}! 💰 I notice you've been looking at payments. I can help you check your wallet balance, request payouts, review transactions, or handle billing questions. What do you need?`;
        } else if (recentPage.includes('crew') || recentPage.includes('guest')) {
          contextGreeting = `Hey ${name}! 👥 I see you've been managing crew or guest lists. I can help you organize your team, manage contacts, or handle touring personnel. What can I assist with?`;
        }
      }
      
      // If no context-specific greeting, check user data
      if (!contextGreeting) {
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
        
        const { data: tours } = await supabase
          .from('tours')
          .select('id')
          .eq('artist_id', userId)
          .limit(1);
        
        const hasReleases = releases && releases.length > 0;
        const hasEarnings = earnings && earnings.length > 0;
        const hasTours = tours && tours.length > 0;
        
        if (hasTours) {
          // User has tours - touring focused
          const touringGreetings = [
            `Hey ${name}! 🎸 I'm Apollo, your music intelligence assistant. I see you have tours set up. I can help you manage tours, optimize routes, track flights, handle crew, or anything touring-related. What would you like to do?`,
            `Hi ${name}! 🚌 I'm Apollo, here to help with your touring needs. Want to create a new tour, manage existing ones, optimize routes, or handle tour logistics?`,
            `Welcome back, ${name}! 🎵 I'm Apollo, ready to assist with your music career. I can help with tours, releases, analytics, earnings, or anything else. What's on your mind?`,
          ];
          contextGreeting = touringGreetings[Math.floor(Math.random() * touringGreetings.length)];
        } else if (hasReleases && hasEarnings) {
          const greetings = [
            `Hey ${name}! 👋 I'm Apollo, your music intelligence assistant. Ready to check on your releases and earnings?`,
            `Hi ${name}! 🎵 Great to see you! Want to see how your music is performing?`,
            `Welcome back, ${name}! I'm Apollo, here to help with releases, earnings, analytics, or anything else. What's on your mind?`,
            `Hey ${name}! 💰 Your music is out there making moves! How can I help you today?`,
          ];
          contextGreeting = greetings[Math.floor(Math.random() * greetings.length)];
        } else if (hasReleases) {
          contextGreeting = `Hey ${name}! 👋 I'm Apollo, your music intelligence assistant. I see you have some releases. Want to check their performance or create something new?`;
        } else {
          const greetings = [
            `Hey ${name}! 👋 I'm Apollo, your music intelligence assistant. Ready to release your first track? I can guide you through the entire process!`,
            `Hi ${name}! 🎵 Welcome to MSC & Co! I'm Apollo, and I'm here to help you distribute your music. Want to get started with your first release?`,
            `Hey ${name}! Excited to have you here! I'm Apollo, your music assistant. I can help you release music, analyze earnings, and much more. What would you like to do?`,
          ];
          contextGreeting = greetings[Math.floor(Math.random() * greetings.length)];
        }
      }
      
      greeting = contextGreeting;
    }
    
    console.log('✅ Context-aware greeting generated successfully:', { role, isSuperAdmin, recentPage });
    
    return NextResponse.json({
      greeting,
      user_name: name,
      role,
    });
    
  } catch (error) {
    console.error('❌ Greeting generation error:', error);
    
    // Fallback greeting
    return NextResponse.json({
      greeting: "Hi! 👋 I'm Apollo, your music intelligence assistant. How can I help you today?",
    });
  }
}
