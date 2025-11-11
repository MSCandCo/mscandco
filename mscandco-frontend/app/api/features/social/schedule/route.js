import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      platforms, // ['instagram', 'twitter', 'tiktok']
      caption,
      media_urls = [],
      scheduled_time,
      post_immediately = false,
      release_id,
      hashtags = [],
    } = await request.json();

    if (!platforms || platforms.length === 0) {
      return NextResponse.json({ error: 'At least one platform required' }, { status: 400 });
    }

    if (!caption || caption.trim().length === 0) {
      return NextResponse.json({ error: 'Caption required' }, { status: 400 });
    }

    if (!post_immediately && !scheduled_time) {
      return NextResponse.json({
        error: 'Either post_immediately or scheduled_time required',
      }, { status: 400 });
    }

    // Create scheduled posts for each platform
    const posts = [];

    for (const platform of platforms) {
      const { data: post, error: postError } = await supabase
        .from('social_media_posts')
        .insert({
          user_id: user.id,
          platform,
          caption,
          media_urls,
          hashtags,
          release_id,
          scheduled_time: post_immediately ? new Date().toISOString() : scheduled_time,
          status: post_immediately ? 'publishing' : 'scheduled',
          post_type: determinePostType(caption, media_urls),
        })
        .select()
        .single();

      if (postError) {
        console.error(`Failed to create post for ${platform}:`, postError);
        continue;
      }

      posts.push(post);

      // If posting immediately, trigger the post
      if (post_immediately) {
        try {
          await publishToplatform(post, supabase);
        } catch (publishError) {
          console.error(`Failed to publish to ${platform}:`, publishError);

          await supabase
            .from('social_media_posts')
            .update({
              status: 'failed',
              error_message: publishError.message,
            })
            .eq('id', post.id);
        }
      }
    }

    return NextResponse.json({
      success: true,
      posts,
      summary: {
        total: posts.length,
        scheduled: posts.filter(p => p.status === 'scheduled').length,
        publishing: posts.filter(p => p.status === 'publishing').length,
        failed: posts.filter(p => p.status === 'failed').length,
      },
    });

  } catch (error) {
    console.error('Schedule post error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function publishToplatform(post, supabase) {
  // Get platform connection
  const { data: connection } = await supabase
    .from('social_media_connections')
    .select('*')
    .eq('user_id', post.user_id)
    .eq('platform', post.platform)
    .eq('status', 'active')
    .single();

  if (!connection) {
    throw new Error(`No active ${post.platform} connection found`);
  }

  // Check if token needs refresh
  if (connection.expires_at && new Date(connection.expires_at) < new Date()) {
    await refreshAccessToken(connection, supabase);
  }

  let platformPostId;
  let platformPostUrl;

  // Publish to platform
  switch (post.platform) {
    case 'instagram':
      ({ platformPostId, platformPostUrl } = await publishToInstagram(post, connection));
      break;
    case 'twitter':
      ({ platformPostId, platformPostUrl } = await publishToTwitter(post, connection));
      break;
    case 'tiktok':
      ({ platformPostId, platformPostUrl } = await publishToTikTok(post, connection));
      break;
    case 'facebook':
      ({ platformPostId, platformPostUrl } = await publishToFacebook(post, connection));
      break;
    case 'youtube':
      ({ platformPostId, platformPostUrl } = await publishToYouTube(post, connection));
      break;
    default:
      throw new Error(`Unsupported platform: ${post.platform}`);
  }

  // Update post with platform IDs
  await supabase
    .from('social_media_posts')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
      platform_post_id: platformPostId,
      platform_post_url: platformPostUrl,
    })
    .eq('id', post.id);

  return { platformPostId, platformPostUrl };
}

async function publishToInstagram(post, connection) {
  // Instagram uses Graph API
  const fullCaption = [post.caption, ...post.hashtags].join(' ');

  // Step 1: Create media container
  const containerParams = new URLSearchParams({
    access_token: connection.access_token,
    caption: fullCaption,
  });

  if (post.media_urls && post.media_urls.length > 0) {
    containerParams.append('image_url', post.media_urls[0]);
  }

  const containerResponse = await fetch(
    `https://graph.instagram.com/v18.0/${connection.platform_user_id}/media`,
    {
      method: 'POST',
      body: containerParams,
    }
  );

  const containerData = await containerResponse.json();

  if (!containerData.id) {
    throw new Error('Failed to create Instagram media container: ' + JSON.stringify(containerData));
  }

  // Step 2: Publish container
  const publishResponse = await fetch(
    `https://graph.instagram.com/v18.0/${connection.platform_user_id}/media_publish`,
    {
      method: 'POST',
      body: new URLSearchParams({
        access_token: connection.access_token,
        creation_id: containerData.id,
      }),
    }
  );

  const publishData = await publishResponse.json();

  if (!publishData.id) {
    throw new Error('Failed to publish Instagram post: ' + JSON.stringify(publishData));
  }

  return {
    platformPostId: publishData.id,
    platformPostUrl: `https://www.instagram.com/p/${publishData.id}/`,
  };
}

async function publishToTwitter(post, connection) {
  const fullText = [post.caption, ...post.hashtags].join(' ');

  const tweetData = {
    text: fullText.substring(0, 280), // Twitter limit
  };

  // Add media if present
  if (post.media_urls && post.media_urls.length > 0) {
    // First upload media
    const mediaIds = await uploadTwitterMedia(post.media_urls, connection.access_token);
    tweetData.media = { media_ids: mediaIds };
  }

  const response = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${connection.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tweetData),
  });

  const data = await response.json();

  if (!data.data?.id) {
    throw new Error('Failed to publish Twitter post: ' + JSON.stringify(data));
  }

  return {
    platformPostId: data.data.id,
    platformPostUrl: `https://twitter.com/${connection.platform_username}/status/${data.data.id}`,
  };
}

async function publishToTikTok(post, connection) {
  // TikTok requires video upload
  if (!post.media_urls || post.media_urls.length === 0) {
    throw new Error('TikTok posts require video content');
  }

  // This is simplified - actual TikTok API requires chunked video upload
  const response = await fetch('https://open-api.tiktok.com/share/video/upload/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${connection.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      video: {
        video_url: post.media_urls[0],
        caption: [post.caption, ...post.hashtags].join(' ').substring(0, 150),
      },
    }),
  });

  const data = await response.json();

  if (!data.data?.share_id) {
    throw new Error('Failed to publish TikTok post: ' + JSON.stringify(data));
  }

  return {
    platformPostId: data.data.share_id,
    platformPostUrl: `https://www.tiktok.com/@${connection.platform_username}/video/${data.data.share_id}`,
  };
}

async function publishToFacebook(post, connection) {
  const fullMessage = [post.caption, ...post.hashtags].join(' ');

  const params = new URLSearchParams({
    access_token: connection.access_token,
    message: fullMessage,
  });

  if (post.media_urls && post.media_urls.length > 0) {
    params.append('url', post.media_urls[0]);
  }

  const response = await fetch(
    `https://graph.facebook.com/v18.0/${connection.platform_user_id}/feed`,
    {
      method: 'POST',
      body: params,
    }
  );

  const data = await response.json();

  if (!data.id) {
    throw new Error('Failed to publish Facebook post: ' + JSON.stringify(data));
  }

  return {
    platformPostId: data.id,
    platformPostUrl: `https://www.facebook.com/${data.id}`,
  };
}

async function publishToYouTube(post, connection) {
  // YouTube community posts
  const response = await fetch(
    'https://www.googleapis.com/youtube/v3/communityPosts',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${connection.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        snippet: {
          text: [post.caption, ...post.hashtags].join(' '),
        },
      }),
    }
  );

  const data = await response.json();

  if (!data.id) {
    throw new Error('Failed to publish YouTube post: ' + JSON.stringify(data));
  }

  return {
    platformPostId: data.id,
    platformPostUrl: `https://www.youtube.com/post/${data.id}`,
  };
}

async function uploadTwitterMedia(mediaUrls, accessToken) {
  // Simplified - actual implementation would download and upload media
  // Returns mock media IDs for now
  return ['mock_media_id_1'];
}

async function refreshAccessToken(connection, supabase) {
  // Platform-specific token refresh logic
  // Would implement actual refresh for each platform
  console.log(`Refreshing token for ${connection.platform}`);
}

function determinePostType(caption, mediaUrls) {
  if (mediaUrls && mediaUrls.length > 0) {
    const ext = mediaUrls[0].split('.').pop().toLowerCase();
    if (['mp4', 'mov', 'avi'].includes(ext)) return 'video';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'image';
  }
  return 'text';
}

// GET endpoint for scheduled posts
export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const platform = searchParams.get('platform');
    const limit = parseInt(searchParams.get('limit')) || 50;

    let query = supabase
      .from('social_media_posts')
      .select('*')
      .eq('user_id', user.id)
      .order('scheduled_time', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    if (platform) {
      query = query.eq('platform', platform);
    }

    const { data: posts, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, posts });

  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE endpoint to cancel scheduled post
export async function DELETE(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { post_id } = await request.json();

    const { error } = await supabase
      .from('social_media_posts')
      .update({ status: 'cancelled' })
      .eq('id', post_id)
      .eq('user_id', user.id)
      .eq('status', 'scheduled');

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Cancel post error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
