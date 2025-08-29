// Admin API to reset user's Chartmetric linking ability
// Only Super Admin and Company Admin can reset user links

import jwt from 'jsonwebtoken';
import { resetUserChartmetricLink, getLinkedArtist } from '@/lib/chartmetric-storage';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify admin authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.decode(token);
    const adminUserId = decoded?.sub;
    const userRole = decoded?.user_metadata?.role;

    if (!adminUserId) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if user has admin permissions
    if (userRole !== 'super_admin' && userRole !== 'company_admin') {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Only Super Admin and Company Admin can reset Chartmetric links'
      });
    }

    const { userId: targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ error: 'Target user ID is required' });
    }

    console.log('🔧 Admin resetting Chartmetric link:', {
      adminUserId,
      adminRole: userRole,
      targetUserId
    });

    // Get existing link info for logging
    const existingLink = getLinkedArtist(targetUserId);
    
    // Reset the user's linking ability
    const resetResult = resetUserChartmetricLink(targetUserId, adminUserId);

    if (resetResult.success) {
      console.log('✅ Chartmetric link reset successfully:', {
        targetUserId,
        previousArtist: existingLink?.artistName || 'None',
        resetBy: adminUserId
      });

      return res.json({
        success: true,
        message: 'User Chartmetric linking reset successfully',
        previousArtist: existingLink?.artistName || null,
        resetBy: adminUserId,
        resetAt: new Date().toISOString()
      });
    } else {
      console.error('❌ Failed to reset Chartmetric link:', resetResult.error);
      return res.status(500).json({
        error: resetResult.error,
        message: 'Failed to reset user Chartmetric linking'
      });
    }

  } catch (error) {
    console.error('Admin reset Chartmetric link error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
}
