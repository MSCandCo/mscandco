import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Universal OAuth callback handler for all platforms
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const platform = searchParams.get('platform') || 'unknown';
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_URL}/artist/social-media?error=${encodeURIComponent(error)}`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_URL}/artist/social-media?error=missing_params`
      );
    }

    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_URL}/login?redirect=/artist/social-media`
      );
    }

    // Exchange code for access token based on platform
    let tokenData;

    switch (platform) {
      case 'instagram':
        tokenData = await exchangeInstagramCode(code);
        break;
      case 'tiktok':
        tokenData = await exchangeTikTokCode(code);
        break;
      case 'twitter':
        tokenData = await exchangeTwitterCode(code, state);
        break;
      case 'facebook':
        tokenData = await exchangeFacebookCode(code);
        break;
      case 'youtube':
        tokenData = await exchangeYouTubeCode(code);
        break;
      default:
        throw new Error('Unknown platform');
    }

    // Save connection to database
    await supabase.from('social_media_connections').upsert({
      user_id: user.id,
      platform,
      platform_user_id: tokenData.user_id,
      platform_username: tokenData.username,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: tokenData.expires_at,
      scope: tokenData.scope,
      status: 'active',
    });

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_URL}/artist/social-media?connected=${platform}`
    );

  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_URL}/artist/social-media?error=${encodeURIComponent(error.message)}`
    );
  }
}

async function exchangeInstagramCode(code) {
  // Exchange code for access token
  const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.INSTAGRAM_CLIENT_ID,
      client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: `${process.env.NEXT_PUBLIC_URL}/api/features/social/oauth/callback?platform=instagram`,
      code,
    }),
  });

  const data = await tokenResponse.json();

  if (!data.access_token) {
    throw new Error('Failed to get Instagram access token');
  }

  // Get long-lived token
  const longLivedResponse = await fetch(
    `https://graph.instagram.com/access_token?` +
    `grant_type=ig_exchange_token&` +
    `client_secret=${process.env.INSTAGRAM_CLIENT_SECRET}&` +
    `access_token=${data.access_token}`
  );

  const longLivedData = await longLivedResponse.json();

  return {
    access_token: longLivedData.access_token,
    refresh_token: null,
    expires_at: new Date(Date.now() + longLivedData.expires_in * 1000).toISOString(),
    user_id: data.user_id,
    username: data.username || 'Instagram User',
    scope: 'instagram_basic,instagram_content_publish',
  };
}

async function exchangeTikTokCode(code) {
  const tokenResponse = await fetch('https://open-api.tiktok.com/oauth/access_token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY,
      client_secret: process.env.TIKTOK_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${process.env.NEXT_PUBLIC_URL}/api/features/social/oauth/callback?platform=tiktok`,
    }),
  });

  const data = await tokenResponse.json();

  if (!data.data?.access_token) {
    throw new Error('Failed to get TikTok access token');
  }

  // Get user info
  const userResponse = await fetch('https://open-api.tiktok.com/user/info/', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${data.data.access_token}`,
    },
  });

  const userData = await userResponse.json();

  return {
    access_token: data.data.access_token,
    refresh_token: data.data.refresh_token,
    expires_at: new Date(Date.now() + data.data.expires_in * 1000).toISOString(),
    user_id: userData.data?.user?.open_id || 'unknown',
    username: userData.data?.user?.display_name || 'TikTok User',
    scope: data.data.scope,
  };
}

async function exchangeTwitterCode(code, codeVerifier) {
  const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(
        `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
      ).toString('base64')}`,
    },
    body: new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${process.env.NEXT_PUBLIC_URL}/api/features/social/oauth/callback?platform=twitter`,
      code_verifier: codeVerifier,
    }),
  });

  const data = await tokenResponse.json();

  if (!data.access_token) {
    throw new Error('Failed to get Twitter access token');
  }

  // Get user info
  const userResponse = await fetch('https://api.twitter.com/2/users/me', {
    headers: {
      'Authorization': `Bearer ${data.access_token}`,
    },
  });

  const userData = await userResponse.json();

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
    user_id: userData.data?.id || 'unknown',
    username: userData.data?.username || 'Twitter User',
    scope: data.scope,
  };
}

async function exchangeFacebookCode(code) {
  const tokenResponse = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?` +
    `client_id=${process.env.FACEBOOK_CLIENT_ID}&` +
    `client_secret=${process.env.FACEBOOK_CLIENT_SECRET}&` +
    `redirect_uri=${encodeURIComponent(`${process.env.NEXT_PUBLIC_URL}/api/features/social/oauth/callback?platform=facebook`)}&` +
    `code=${code}`
  );

  const data = await tokenResponse.json();

  if (!data.access_token) {
    throw new Error('Failed to get Facebook access token');
  }

  // Get user info
  const userResponse = await fetch(
    `https://graph.facebook.com/me?fields=id,name&access_token=${data.access_token}`
  );

  const userData = await userResponse.json();

  return {
    access_token: data.access_token,
    refresh_token: null,
    expires_at: data.expires_in
      ? new Date(Date.now() + data.expires_in * 1000).toISOString()
      : null,
    user_id: userData.id || 'unknown',
    username: userData.name || 'Facebook User',
    scope: 'pages_manage_posts,pages_read_engagement',
  };
}

async function exchangeYouTubeCode(code) {
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.YOUTUBE_CLIENT_ID,
      client_secret: process.env.YOUTUBE_CLIENT_SECRET,
      redirect_uri: `${process.env.NEXT_PUBLIC_URL}/api/features/social/oauth/callback?platform=youtube`,
      grant_type: 'authorization_code',
    }),
  });

  const data = await tokenResponse.json();

  if (!data.access_token) {
    throw new Error('Failed to get YouTube access token');
  }

  // Get user info
  const userResponse = await fetch(
    'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
    {
      headers: {
        'Authorization': `Bearer ${data.access_token}`,
      },
    }
  );

  const userData = await userResponse.json();
  const channel = userData.items?.[0];

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
    user_id: channel?.id || 'unknown',
    username: channel?.snippet?.title || 'YouTube User',
    scope: data.scope,
  };
}
