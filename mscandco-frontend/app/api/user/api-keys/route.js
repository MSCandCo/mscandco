import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createHash, randomBytes } from 'crypto';

// GET - List all API keys for the authenticated user
export async function GET(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch user's API keys (without the actual key)
    const { data: apiKeys, error } = await supabase
      .from('api_keys')
      .select('id, name, key_prefix, scopes, rate_limit_per_hour, is_active, last_used_at, total_requests, created_at, expires_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      api_keys: apiKeys || [],
    });
  } catch (error) {
    console.error('API keys fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

// POST - Create a new API key
export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, scopes, rate_limit_per_hour, expires_in_days } = body;

    // Validate input
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'API key name is required' },
        { status: 400 }
      );
    }

    // Generate a secure random API key
    const apiKey = `msc_live_${randomBytes(32).toString('hex')}`;
    const keyHash = createHash('sha256').update(apiKey).digest('hex');
    const keyPrefix = apiKey.substring(0, 16); // "msc_live_XXXXXX"

    // Calculate expiration date if provided
    let expiresAt = null;
    if (expires_in_days && expires_in_days > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expires_in_days);
    }

    // Get user's IP address
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Insert API key into database
    const { data: newKey, error } = await supabase
      .from('api_keys')
      .insert({
        user_id: user.id,
        name: name.trim(),
        key_hash: keyHash,
        key_prefix: keyPrefix,
        scopes: scopes || ['read'],
        rate_limit_per_hour: rate_limit_per_hour || 1000,
        expires_at: expiresAt,
        created_ip: ip,
        is_active: true,
      })
      .select('id, name, key_prefix, scopes, rate_limit_per_hour, created_at, expires_at')
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'API key created successfully',
      api_key: apiKey, // ⚠️ THIS IS THE ONLY TIME THE FULL KEY IS SHOWN!
      key_info: {
        ...newKey,
        warning: 'Store this key securely. You will not be able to see it again!',
      },
    });
  } catch (error) {
    console.error('API key creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}

// PATCH - Update an API key (rename, activate/deactivate)
export async function PATCH(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { key_id, name, is_active } = body;

    if (!key_id) {
      return NextResponse.json(
        { error: 'key_id is required' },
        { status: 400 }
      );
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (is_active !== undefined) updates.is_active = is_active;

    // Update the API key (RLS ensures user owns it)
    const { data, error } = await supabase
      .from('api_keys')
      .update(updates)
      .eq('id', key_id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'API key updated successfully',
      api_key: data,
    });
  } catch (error) {
    console.error('API key update error:', error);
    return NextResponse.json(
      { error: 'Failed to update API key' },
      { status: 500 }
    );
  }
}

// DELETE - Delete (revoke) an API key
export async function DELETE(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const key_id = searchParams.get('key_id');

    if (!key_id) {
      return NextResponse.json(
        { error: 'key_id is required' },
        { status: 400 }
      );
    }

    // Delete the API key (RLS ensures user owns it)
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', key_id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'API key revoked successfully',
    });
  } catch (error) {
    console.error('API key deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to revoke API key' },
      { status: 500 }
    );
  }
}

