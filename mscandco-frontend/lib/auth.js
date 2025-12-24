import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function getUserFromRequest(req) {
  // Get auth token from request headers
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return { user: null, error: 'No auth token' };
  }
  
  try {
    // Use Supabase's built-in user verification
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('Auth error:', error);
      return { user: null, error: error?.message || 'Invalid token' };
    }
    
    return { user, error: null };
  } catch (error) {
    console.error('Auth exception:', error);
    return { user: null, error: 'Authentication failed' };
  }
}
