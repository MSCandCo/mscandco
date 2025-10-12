import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export default async function handler(req, res) {
  try {
    // Verify auth
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
      // Get API key from database
      const { data, error } = await supabase
        .from('user_profiles')
        .select('api_key, api_key_last_used')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      let apiKey = data?.api_key;

      // Generate new API key if doesn't exist
      if (!apiKey) {
        apiKey = 'sk_' + crypto.randomBytes(32).toString('hex');

        await supabase
          .from('user_profiles')
          .update({ api_key: apiKey })
          .eq('id', user.id);
      }

      return res.status(200).json({
        success: true,
        data: {
          apiKey,
          usage: {
            requestsThisMonth: 0, // TODO: Implement API usage tracking
            rateLimit: 1000,
            quotaRemaining: 1000
          },
          webhookUrl: '' // TODO: Implement webhook configuration
        }
      });
    }

    if (req.method === 'POST') {
      const { action } = req.body;

      if (action === 'regenerate') {
        const newApiKey = 'sk_' + crypto.randomBytes(32).toString('hex');

        const { error } = await supabase
          .from('user_profiles')
          .update({ api_key: newApiKey })
          .eq('id', user.id);

        if (error) {
          throw error;
        }

        return res.status(200).json({
          success: true,
          data: { apiKey: newApiKey }
        });
      }

      return res.status(400).json({ success: false, error: 'Invalid action' });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in API key endpoint:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
