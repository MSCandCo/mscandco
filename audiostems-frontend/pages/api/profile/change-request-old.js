// API endpoint for handling profile change requests
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const changeRequest = req.body;
    
    // TODO: Save to database - would normally use Supabase
    // For now, we'll simulate the API response
    
    const savedRequest = {
      id: `change_request_${Date.now()}`,
      userId: 'user_id_placeholder', // Would get from auth
      ...changeRequest,
      submittedAt: new Date().toISOString(),
      status: 'pending',
      reviewedBy: null,
      reviewedAt: null,
      adminNotes: ''
    };

    console.log('Change request submitted:', savedRequest);

    // TODO: Send notification to company admin/super admin
    // TODO: Save to profile_change_requests table in database
    
    res.status(201).json({ 
      success: true, 
      request: savedRequest,
      message: 'Change request submitted successfully. You will be notified when it is reviewed.' 
    });

  } catch (error) {
    console.error('Error handling change request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
