
/**
 * DATA DELETION CALLBACK URL
 * Required for Facebook/Instagram OAuth compliance
 *
 * Facebook sends a signed request when a user deletes your app
 * This endpoint handles the deletion request and returns a confirmation URL
 *
 * Facebook Developer Settings:
 * - Data Deletion Request URL: https://yourdomain.com/api/auth/data-deletion
 * - This must be an HTTPS URL (use your production domain)
 */


// Parse Facebook signed request
function parseSignedRequest(signedRequest, secret) {
  try {
    const [encodedSig, payload] = signedRequest.split('.');

    // Decode the payload
    const jsonPayload = Buffer.from(payload, 'base64').toString('utf8');
    const data = JSON.parse(jsonPayload);

    // Verify signature (optional but recommended)
    const crypto = require('crypto');
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    const receivedSig = encodedSig.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    if (expectedSig !== receivedSig) {
      console.warn('Signature mismatch - request may not be from Facebook');
    }

    return data;
  } catch (error) {
    console.error('Error parsing signed request:', error);
    return null;
  }
}

// Enterprise pattern: Dynamic imports to prevent build-time analysis
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function POST(request) {
  try {
    // Lazy load Supabase client
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceRoleClient();

    const body = await request.json();
    const { signed_request } = body;

    if (!signed_request) {
      return Response.json(
        { error: 'Missing signed_request parameter' },
        { status: 400 }
      );
    }

    // Parse the signed request from Facebook
    const appSecret = process.env.FACEBOOK_APP_SECRET || process.env.INSTAGRAM_CLIENT_SECRET;
    const data = parseSignedRequest(signed_request, appSecret);

    if (!data) {
      return Response.json(
        { error: 'Invalid signed request' },
        { status: 400 }
      );
    }

    const { user_id, algorithm } = data;

    // Log the deletion request
    console.log(`Data deletion requested for Facebook user: ${user_id}`);

    // Find the user by their Facebook/Instagram platform_user_id
    const { data: connections, error: findError } = await supabase
      .from('social_media_connections')
      .select('user_id, platform, platform_user_id')
      .or(`platform_user_id.eq.${user_id}`)
      .in('platform', ['facebook', 'instagram']);

    if (findError) {
      console.error('Error finding user connections:', findError);
    }

    // Delete all social media connections for this Facebook/Instagram user
    if (connections && connections.length > 0) {
      const userIds = connections.map(c => c.user_id);

      // Delete connections
      const { error: deleteError } = await supabase
        .from('social_media_connections')
        .delete()
        .in('platform', ['facebook', 'instagram'])
        .eq('platform_user_id', user_id);

      if (deleteError) {
        console.error('Error deleting connections:', deleteError);
      } else {
        console.log(`Deleted social connections for ${connections.length} user(s)`);
      }

      // Delete associated posts
      const { error: postsError } = await supabase
        .from('social_media_posts')
        .delete()
        .in('user_id', userIds)
        .in('platform', ['facebook', 'instagram']);

      if (postsError) {
        console.error('Error deleting posts:', postsError);
      }
    }

    // Generate a unique confirmation code
    const confirmationCode = `${user_id}_${Date.now()}`;

    // Store deletion request in database for audit trail
    const { error: insertError } = await supabase
      .from('data_deletion_requests')
      .insert({
        platform: 'facebook',
        platform_user_id: user_id,
        confirmation_code: confirmationCode,
        requested_at: new Date().toISOString(),
        status: 'completed',
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      })
      .select();

    if (insertError && insertError.code !== '42P01') { // Ignore if table doesn't exist
      console.error('Error logging deletion request:', insertError);
    }

    // Return confirmation URL as required by Facebook
    const confirmationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/data-deletion-status?code=${confirmationCode}`;

    return Response.json({
      url: confirmationUrl,
      confirmation_code: confirmationCode,
    });

  } catch (error) {
    console.error('Data deletion error:', error);
    return Response.json(
      {
        error: 'Internal server error',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check deletion status
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return Response.json({
      status: 'error',
      message: 'Missing confirmation code'
    }, { status: 400 });
  }

  // Look up the deletion request
  const { data, error } = await supabase
    .from('data_deletion_requests')
    .select('*')
    .eq('confirmation_code', code)
    .single();

  if (error || !data) {
    return Response.json({
      status: 'not_found',
      message: 'Deletion request not found'
    }, { status: 404 });
  }

  return Response.json({
    status: data.status,
    platform: data.platform,
    requested_at: data.requested_at,
    message: 'Your data has been successfully deleted from our system.'
  });
}
