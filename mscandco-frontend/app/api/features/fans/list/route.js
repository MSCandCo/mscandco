import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tier = searchParams.get('tier');
    const limit = parseInt(searchParams.get('limit')) || 100;

    let query = supabase
      .from('fan_profiles')
      .select('*')
      .eq('artist_id', user.id)
      .order('engagement_score', { ascending: false })
      .limit(limit);

    if (tier) {
      query = query.eq('tier', tier);
    }

    const { data: fans, error } = await query;

    if (error) throw error;

    // Get stats
    const { data: allFans } = await supabase
      .from('fan_profiles')
      .select('tier, engagement_score')
      .eq('artist_id', user.id);

    const stats = {
      total: allFans?.length || 0,
      casual: allFans?.filter(f => f.tier === 'casual').length || 0,
      regular: allFans?.filter(f => f.tier === 'regular').length || 0,
      superfan: allFans?.filter(f => f.tier === 'superfan').length || 0,
      vip: allFans?.filter(f => f.tier === 'vip').length || 0,
      avg_engagement: allFans?.length > 0
        ? (allFans.reduce((sum, f) => sum + (f.engagement_score || 0), 0) / allFans.length).toFixed(1)
        : 0,
    };

    return NextResponse.json({ fans, stats });

  } catch (error) {
    console.error('Get fans error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
