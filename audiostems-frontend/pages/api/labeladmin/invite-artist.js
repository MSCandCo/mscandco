// Label Admin Artist Invitation API
import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { firstName, lastName, message } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({ 
        error: 'First name and last name are required',
        type: 'validation_error'
      });
    }

    // Get the requesting label admin's info
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: requestingUser }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !requestingUser) {
      return res.status(401).json({ error: 'Invalid authorization token' });
    }

    // Use same role detection logic as other APIs
    const userEmail = requestingUser.email?.toLowerCase() || '';
    let userRole = requestingUser.user_metadata?.role || requestingUser.app_metadata?.role;
    
    // Email-based role detection for known users
    if (!userRole) {
      if (userEmail === 'labeladmin@mscandco.com') {
        userRole = 'label_admin';
      } else if (userEmail === 'companyadmin@mscandco.com') {
        userRole = 'company_admin';
      } else if (userEmail === 'superadmin@mscandco.com') {
        userRole = 'super_admin';
      } else {
        userRole = 'artist'; // default
      }
    }

    console.log('🔍 Role detection for invite-artist:', {
      userId: requestingUser.id,
      userEmail,
      detectedRole: userRole
    });

    if (userRole !== 'label_admin') {
      return res.status(403).json({ error: 'Only label admins can send artist invitations' });
    }

    // Get or create label admin profile
    let { data: labelProfile, error: labelError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', requestingUser.id)
      .single();

    if (labelError && labelError.code === 'PGRST116') {
      // Profile doesn't exist, create it
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          id: requestingUser.id,
          email: requestingUser.email,
          role: userRole,
          first_name: 'Label',
          last_name: 'Admin',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('Failed to create label admin profile:', createError);
        return res.status(500).json({ error: 'Failed to create profile' });
      }
      labelProfile = newProfile;
    } else if (labelError) {
      console.error('Profile lookup error:', labelError);
      return res.status(500).json({ error: 'Profile lookup failed' });
    }

    console.log('🎵 Label admin artist invitation request:', {
      labelAdmin: labelProfile.email,
      searchingFor: `${firstName} ${lastName}`
    });

    // Search for artist by first name, last name, or artist name
    const { data: artists, error: searchError } = await supabase
      .from('user_profiles')
      .select('*')
      .or(`and(first_name.eq.${firstName.trim()},last_name.eq.${lastName.trim()}),artist_name.eq.${firstName.trim() + ' ' + lastName.trim()}`)
      .eq('role', 'artist');

    if (searchError) {
      console.error('Database search error:', searchError);
      return res.status(500).json({ error: 'Database search failed' });
    }

    if (!artists || artists.length === 0) {
      console.log('❌ Artist not found:', `${firstName} ${lastName}`);
      return res.status(404).json({ 
        error: 'Artist not registered on platform',
        type: 'artist_not_found',
        searchedName: `${firstName} ${lastName}`
      });
    }

    if (artists.length > 1) {
      console.log('⚠️ Multiple artists found:', artists.length);
      return res.status(400).json({ 
        error: 'Multiple artists found with this name. Please contact support.',
        type: 'multiple_artists_found',
        count: artists.length
      });
    }

    const targetArtist = artists[0];
    console.log('✅ Found artist:', targetArtist.email);

    // Check if request already exists
    const { data: existingRequests, error: existingError } = await supabase
      .from('artist_requests')
      .select('*')
      .eq('from_label_id', requestingUser.id)
      .eq('to_artist_id', targetArtist.id)
      .eq('status', 'pending');

    if (existingError) {
      console.error('Error checking existing requests:', existingError);
      return res.status(500).json({ error: 'Failed to check existing requests' });
    }

    if (existingRequests && existingRequests.length > 0) {
      return res.status(409).json({ 
        error: 'You already have a pending request to this artist',
        type: 'duplicate_request'
      });
    }

    // Create the artist request
    const requestData = {
      from_label_id: requestingUser.id,
      to_artist_id: targetArtist.id,
      artist_first_name: targetArtist.first_name,
      artist_last_name: targetArtist.last_name,
      artist_email: targetArtist.email,
      label_admin_name: labelProfile.display_name || `${labelProfile.first_name} ${labelProfile.last_name}`,
      label_admin_email: labelProfile.email,
      message: message || `${labelProfile.first_name} ${labelProfile.last_name} would like to add you to their label.`,
      status: 'pending'
    };

    const { data: newRequest, error: insertError } = await supabase
      .from('artist_requests')
      .insert(requestData)
      .select()
      .single();

    if (insertError) {
      console.error('Error creating request:', insertError);
      return res.status(500).json({ error: 'Failed to create artist request' });
    }

    console.log('✅ Artist invitation sent successfully:', newRequest.id);

    return res.status(200).json({
      success: true,
      message: `Invitation sent to ${targetArtist.first_name} ${targetArtist.last_name}`,
      request: {
        id: newRequest.id,
        artistName: `${targetArtist.first_name} ${targetArtist.last_name}`,
        artistEmail: targetArtist.email,
        status: 'pending',
        createdAt: newRequest.created_at
      }
    });

  } catch (error) {
    console.error('Artist invitation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}