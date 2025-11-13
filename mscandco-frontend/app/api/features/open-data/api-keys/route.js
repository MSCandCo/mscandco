import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

function generateApiKey() {
  return `sb_publishable_${crypto.randomBytes(32).toString('hex')}`;
}

export async function POST(request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { key_name, tier, description } = body;

    // Validate required fields
    if (!key_name || !tier) {
      return NextResponse.json(
        { error: 'Key name and tier are required' },
        { status: 400 }
      );
    }

    // Validate tier
    if (!['free', 'research', 'commercial'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    // Check tier limits
    const { data: existingKeys } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', user.id)
      .eq('tier', tier)
      .eq('status', 'active');

    const tierLimits = { free: 1, research: 3, commercial: 5 };
    if (existingKeys && existingKeys.length >= tierLimits[tier]) {
      return NextResponse.json(
        { error: `Maximum ${tierLimits[tier]} ${tier} tier keys allowed` },
        { status: 400 }
      );
    }

    // Generate API key
    const apiKey = generateApiKey();

    // Insert API key
    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        user_id: user.id,
        key_name,
        api_key: apiKey,
        tier,
        description: description || null,
        status: 'active',
        rate_limit: tier === 'free' ? 10000 : tier === 'research' ? 100000 : 1000000,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating API key:', error);
      return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 });
    }

    return NextResponse.json({ success: true, api_key: data });
  } catch (error) {
    console.error('Error in API key creation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's API keys
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching API keys:', error);
      return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 });
    }

    // Mask API keys for security (show only last 8 characters)
    const maskedKeys = data.map((key) => ({
      ...key,
      api_key_masked: `••••••••${key.api_key.slice(-8)}`,
      api_key_full: key.api_key, // Include full key only in this response
    }));

    return NextResponse.json({ api_keys: maskedKeys });
  } catch (error) {
    console.error('Error in fetching API keys:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('id');

    if (!keyId) {
      return NextResponse.json({ error: 'API key ID is required' }, { status: 400 });
    }

    // Soft delete by updating status
    const { error } = await supabase
      .from('api_keys')
      .update({ status: 'revoked', revoked_at: new Date().toISOString() })
      .eq('id', keyId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error revoking API key:', error);
      return NextResponse.json({ error: 'Failed to revoke API key' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in revoking API key:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
