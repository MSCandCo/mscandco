import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

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
    const { data_type, format, date_range } = body;

    // Validate required fields
    if (!data_type || !format) {
      return NextResponse.json(
        { error: 'Data type and format are required' },
        { status: 400 }
      );
    }

    // Validate format
    if (!['csv', 'json', 'excel'].includes(format)) {
      return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
    }

    let data;
    let tableName;

    // Fetch data based on type
    switch (data_type) {
      case 'streams':
        tableName = 'streams';
        const { data: streams } = await supabase
          .from('streams')
          .select('*')
          .eq('user_id', user.id)
          .order('stream_date', { ascending: false });
        data = streams;
        break;

      case 'releases':
        tableName = 'releases';
        const { data: releases } = await supabase
          .from('releases')
          .select('*')
          .eq('user_id', user.id)
          .order('release_date', { ascending: false });
        data = releases;
        break;

      case 'analytics':
        tableName = 'analytics';
        const { data: analytics } = await supabase
          .from('artist_analytics')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });
        data = analytics;
        break;

      case 'royalties':
        tableName = 'royalties';
        const { data: royalties } = await supabase
          .from('royalty_earnings')
          .select('*')
          .eq('user_id', user.id)
          .order('period_start', { ascending: false });
        data = royalties;
        break;

      default:
        return NextResponse.json({ error: 'Invalid data type' }, { status: 400 });
    }

    // Log export for audit trail
    await supabase.from('data_exports').insert({
      user_id: user.id,
      data_type,
      format,
      record_count: data?.length || 0,
      exported_at: new Date().toISOString(),
    });

    // Format data based on requested format
    let exportData;
    let contentType;
    let filename;

    switch (format) {
      case 'json':
        exportData = JSON.stringify(data, null, 2);
        contentType = 'application/json';
        filename = `${data_type}_export_${Date.now()}.json`;
        break;

      case 'csv':
        // Convert to CSV
        if (data && data.length > 0) {
          const headers = Object.keys(data[0]).join(',');
          const rows = data.map((row) => Object.values(row).join(','));
          exportData = [headers, ...rows].join('\n');
        } else {
          exportData = '';
        }
        contentType = 'text/csv';
        filename = `${data_type}_export_${Date.now()}.csv`;
        break;

      case 'excel':
        // For Excel, return JSON and let client handle conversion
        // In production, use a library like xlsx to generate actual Excel files
        exportData = JSON.stringify(data, null, 2);
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        filename = `${data_type}_export_${Date.now()}.xlsx`;
        break;

      default:
        return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
    }

    // Return file download
    return new NextResponse(exportData, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error in data export:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
