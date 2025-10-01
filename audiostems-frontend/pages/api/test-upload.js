// Simple test endpoint to debug upload issues
import { getUserFromRequest } from '@/lib/auth';

export default async function handler(req, res) {
  console.log('🧪 Test upload endpoint called');
  console.log('Method:', req.method);
  console.log('Headers:', req.headers);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔐 Testing authentication...');
    const { user, error: authError } = await getUserFromRequest(req);
    
    if (authError || !user) {
      console.error('❌ Auth failed:', authError);
      return res.status(401).json({ 
        error: 'Authentication failed', 
        details: authError,
        hasAuthHeader: !!req.headers.authorization,
        authHeaderStart: req.headers.authorization?.substring(0, 20) + '...'
      });
    }
    
    console.log('✅ Auth successful for user:', user.id);
    
    return res.json({ 
      success: true, 
      message: 'Test endpoint working',
      userId: user.id,
      userEmail: user.email
    });
    
  } catch (error) {
    console.error('❌ Unexpected error in test endpoint:', error);
    return res.status(500).json({ 
      error: 'Server error', 
      details: error.message,
      stack: error.stack
    });
  }
}


