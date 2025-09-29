// ARTIST AFFILIATION REQUESTS API
// Shows incoming requests from label admins
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return getAffiliationRequests(req, res);
  } else if (req.method === 'PUT') {
    return respondToRequest(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

// GET: Fetch affiliation requests for the artist
async function getAffiliationRequests(req, res) {
  try {
    const artistId = '0a060de5-1c94-4060-a1c2-860224fc348d'; // Henry's ID for now

    console.log('📬 Fetching affiliation requests for artist:', artistId);

    const { data: requests, error } = await supabase
      .from('affiliation_requests')
      .select(`
        id,
        label_admin_id,
        message,
        label_percentage,
        status,
        created_at,
        updated_at,
        response_message,
        responded_at,
        label_admin:user_profiles!affiliation_requests_label_admin_id_fkey (
          id,
          first_name,
          last_name,
          artist_name,
          email,
          company_name
        )
      `)
      .eq('artist_id', artistId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching requests:', error);
      return res.status(500).json({ error: 'Failed to fetch requests' });
    }

    console.log(`✅ Found ${requests.length} affiliation requests`);

    const formattedRequests = requests.map(request => ({
      id: request.id,
      labelAdminName: request.label_admin?.artist_name || 
                     `${request.label_admin?.first_name} ${request.label_admin?.last_name}` ||
                     'Unknown Label',
      labelAdminEmail: request.label_admin?.email,
      companyName: request.label_admin?.company_name || 'MSC & Co',
      message: request.message,
      labelPercentage: request.label_percentage,
      status: request.status,
      createdAt: request.created_at,
      respondedAt: request.responded_at,
      responseMessage: request.response_message
    }));

    return res.json({
      success: true,
      requests: formattedRequests
    });

  } catch (error) {
    console.error('❌ API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// PUT: Respond to affiliation request (approve/deny)
async function respondToRequest(req, res) {
  try {
    const { requestId, response, responseMessage } = req.body; // response: 'approved' or 'denied'
    const artistId = '0a060de5-1c94-4060-a1c2-860224fc348d'; // Henry's ID for now

    if (!requestId || !['approved', 'denied'].includes(response)) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    console.log('📝 Artist responding to affiliation request:', { requestId, response });

    // Update the request status
    const { data: updatedRequest, error: updateError } = await supabase
      .from('affiliation_requests')
      .update({
        status: response,
        response_message: responseMessage || null,
        responded_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .eq('artist_id', artistId) // Ensure artist can only respond to their own requests
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating request:', updateError);
      return res.status(500).json({ error: 'Failed to update request' });
    }

    // If approved, create the affiliation relationship
    if (response === 'approved') {
      const { data: affiliation, error: affiliationError } = await supabase
        .from('label_artist_affiliations')
        .insert({
          label_admin_id: updatedRequest.label_admin_id,
          artist_id: artistId,
          label_percentage: updatedRequest.label_percentage,
          request_id: requestId,
          status: 'active'
        })
        .select()
        .single();

      if (affiliationError) {
        console.error('❌ Error creating affiliation:', affiliationError);
        // Request was updated but affiliation creation failed
        return res.status(500).json({ error: 'Request approved but failed to create affiliation' });
      }

      console.log('✅ Affiliation created:', affiliation.id);
    }

    return res.json({
      success: true,
      message: response === 'approved' 
        ? 'Affiliation request approved! You are now partnered with this label.'
        : 'Affiliation request declined.',
      request: updatedRequest
    });

  } catch (error) {
    console.error('❌ API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
