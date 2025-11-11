import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Email transporter setup (use environment variables)
const getEmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      name,
      release_id,
      playlist_ids,
      email_subject,
      email_body,
      enable_auto_followup = true,
      followup_delay_days = 7,
      max_followups = 2,
      send_immediately = true,
    } = await request.json();

    if (!name || !release_id || !playlist_ids || playlist_ids.length === 0) {
      return NextResponse.json({
        error: 'name, release_id, and playlist_ids required',
      }, { status: 400 });
    }

    // Get release details
    const { data: release } = await supabase
      .from('releases')
      .select('*, artists(*)')
      .eq('id', release_id)
      .single();

    if (!release) {
      return NextResponse.json({ error: 'Release not found' }, { status: 404 });
    }

    // Create campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('playlist_pitch_campaigns')
      .insert({
        user_id: user.id,
        release_id,
        name,
        email_subject: email_subject || generateDefaultSubject(release),
        email_body: email_body || generateDefaultBody(release),
        enable_auto_followup,
        followup_delay_days,
        max_followups,
        status: 'active',
        total_playlists: playlist_ids.length,
      })
      .select()
      .single();

    if (campaignError) throw campaignError;

    // Create individual pitches for each playlist
    const pitches = [];
    const { data: playlists } = await supabase
      .from('playlists')
      .select('*')
      .in('id', playlist_ids);

    for (const playlist of playlists) {
      const { data: pitch } = await supabase
        .from('playlist_pitches')
        .insert({
          campaign_id: campaign.id,
          user_id: user.id,
          release_id,
          playlist_id: playlist.id,
          curator_email: playlist.curator_email,
          curator_name: playlist.curator_name,
          status: 'pending',
          personalized_message: personalizeMessage(
            email_body || generateDefaultBody(release),
            playlist,
            release
          ),
        })
        .select()
        .single();

      pitches.push(pitch);

      // Send email immediately if requested
      if (send_immediately && playlist.curator_email) {
        try {
          await sendPitchEmail(
            pitch,
            playlist,
            release,
            email_subject || generateDefaultSubject(release)
          );

          await supabase
            .from('playlist_pitches')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
            })
            .eq('id', pitch.id);

        } catch (emailError) {
          console.error(`Failed to send email to ${playlist.curator_email}:`, emailError);

          await supabase
            .from('playlist_pitches')
            .update({
              status: 'failed',
              error_message: emailError.message,
            })
            .eq('id', pitch.id);
        }
      }
    }

    // Update campaign stats
    const sentCount = pitches.filter(p => p.status === 'sent').length;
    await supabase
      .from('playlist_pitch_campaigns')
      .update({
        emails_sent: sentCount,
        last_activity: new Date().toISOString(),
      })
      .eq('id', campaign.id);

    return NextResponse.json({
      success: true,
      campaign: {
        ...campaign,
        emails_sent: sentCount,
      },
      pitches,
      summary: {
        total: pitches.length,
        sent: sentCount,
        failed: pitches.filter(p => p.status === 'failed').length,
        pending: pitches.filter(p => p.status === 'pending').length,
      },
    });

  } catch (error) {
    console.error('Campaign creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function sendPitchEmail(pitch, playlist, release, subject) {
  const transporter = getEmailTransporter();

  // Generate tracking pixel URL
  const trackingPixelUrl = `${process.env.NEXT_PUBLIC_URL}/api/features/playlists/track-open/${pitch.id}`;

  const htmlBody = `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Hi ${playlist.curator_name || 'there'},</h2>

        ${pitch.personalized_message.split('\n').map(p => `<p>${p}</p>`).join('')}

        <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3 style="margin-top: 0;">${release.title}</h3>
          <p><strong>Artist:</strong> ${release.artists?.name || release.artist_name}</p>
          <p><strong>Genre:</strong> ${release.genre}</p>
          <p><strong>Release Date:</strong> ${new Date(release.release_date).toLocaleDateString()}</p>

          ${release.cover_url ? `<img src="${release.cover_url}" alt="Album Cover" style="max-width: 200px; border-radius: 4px;" />` : ''}
        </div>

        <div style="margin: 30px 0;">
          <a href="${release.spotify_url}" style="display: inline-block; background: #1DB954; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-right: 10px;">
            Listen on Spotify
          </a>

          ${release.apple_music_url ? `
            <a href="${release.apple_music_url}" style="display: inline-block; background: #FA243C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              Listen on Apple Music
            </a>
          ` : ''}
        </div>

        <p>Thanks for considering this track for your playlist!</p>

        <p style="color: #666; font-size: 12px; margin-top: 40px;">
          To accept or decline: Reply to this email or visit your playlist dashboard.
        </p>

        <img src="${trackingPixelUrl}" width="1" height="1" style="display: none;" />
      </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"${release.artists?.name || 'Artist'} via MSC & Co" <${process.env.SMTP_USER}>`,
    to: playlist.curator_email,
    replyTo: release.artist_email || user.email,
    subject: subject,
    html: htmlBody,
  });

  // Log email send
  console.log(`Pitch email sent to ${playlist.curator_email} for playlist: ${playlist.name}`);
}

function generateDefaultSubject(release) {
  return `New Track Submission: ${release.title} by ${release.artists?.name || release.artist_name}`;
}

function generateDefaultBody(release) {
  return `I hope this email finds you well!

I wanted to reach out to share my latest release, "${release.title}". I think it would be a great fit for your playlist based on the genre and vibe of the tracks you currently feature.

${release.description || ''}

The track has been performing well with listeners, and I believe your audience would really enjoy it. I'd be honored if you'd consider adding it to your playlist.

I've included links below where you can listen. Would love to hear your thoughts!`;
}

function personalizeMessage(baseMessage, playlist, release) {
  // Replace variables in message
  let personalized = baseMessage;

  const variables = {
    '{curator_name}': playlist.curator_name || 'there',
    '{playlist_name}': playlist.name,
    '{track_title}': release.title,
    '{artist_name}': release.artists?.name || release.artist_name,
    '{genre}': release.genre,
    '{playlist_followers}': playlist.followers?.toLocaleString() || 'many',
  };

  Object.entries(variables).forEach(([key, value]) => {
    personalized = personalized.replace(new RegExp(key, 'g'), value);
  });

  return personalized;
}

// GET endpoint for campaigns
export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit')) || 20;

    let query = supabase
      .from('playlist_pitch_campaigns')
      .select('*, releases(title, cover_url, artists(name))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: campaigns, error } = await query;

    if (error) throw error;

    // Get pitch stats for each campaign
    const campaignsWithStats = await Promise.all(
      campaigns.map(async (campaign) => {
        const { data: pitches } = await supabase
          .from('playlist_pitches')
          .select('status, opened_at, replied_at')
          .eq('campaign_id', campaign.id);

        return {
          ...campaign,
          stats: {
            total: pitches?.length || 0,
            sent: pitches?.filter(p => p.status === 'sent').length || 0,
            opened: pitches?.filter(p => p.opened_at).length || 0,
            replied: pitches?.filter(p => p.replied_at).length || 0,
            accepted: pitches?.filter(p => p.status === 'accepted').length || 0,
            rejected: pitches?.filter(p => p.status === 'rejected').length || 0,
          },
        };
      })
    );

    return NextResponse.json({ campaigns: campaignsWithStats });

  } catch (error) {
    console.error('Get campaigns error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT endpoint to update campaign
export async function PUT(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { campaign_id, status } = await request.json();

    if (!campaign_id) {
      return NextResponse.json({ error: 'campaign_id required' }, { status: 400 });
    }

    const { data: campaign, error } = await supabase
      .from('playlist_pitch_campaigns')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', campaign_id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, campaign });

  } catch (error) {
    console.error('Update campaign error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
