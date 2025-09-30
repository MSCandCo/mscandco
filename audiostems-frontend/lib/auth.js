import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

export async function getUserFromRequest(req) {
  // Get auth token from request headers
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return { user: null, error: 'No auth token' };
  }
  
  try {
    // Use JWT decode pattern from working APIs
    const userInfo = jwt.decode(token);
    
    if (!userInfo || !userInfo.sub) {
      return { user: null, error: 'Invalid token' };
    }
    
    // Return user object with ID from token
    const user = {
      id: userInfo.sub,
      email: userInfo.email
    };
    
    return { user, error: null };
  } catch (error) {
    return { user: null, error: 'Token decode failed' };
  }
}
