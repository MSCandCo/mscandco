import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Get the user from the request headers
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'No authorization header' });
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      console.log('👤 Label Admin profile API (bypass auth) for', user.email);

      // Use service role to bypass RLS
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Profile fetch error:', error);
        return res.status(500).json({ error: 'Failed to fetch profile' });
      }

      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      console.log('✅ Label Admin profile loaded from database');
      return res.status(200).json(profile);

    } catch (error) {
      console.error('Label Admin profile API error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'PUT') {
    try {
      // Get the user from the request headers
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'No authorization header' });
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      console.log('💾 Updating Label Admin profile for:', user.email);

      const updates = req.body;
      
      // Only allow updating editable fields
      const allowedFields = ['label_name', 'company_name', 'phone', 'website', 'instagram', 'facebook', 'twitter', 'youtube', 'tiktok', 'bio', 'profile_picture_url'];
      const filteredUpdates = {};
      
      Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      });

      console.log('💾 Updating Label Admin profile directly:', filteredUpdates);

      // Use service role to bypass RLS
      const { data: updatedProfile, error } = await supabase
        .from('user_profiles')
        .update(filteredUpdates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', error);
        return res.status(500).json({ error: 'Failed to update profile' });
      }

      console.log('✅ Label Admin profile updated successfully');
      return res.status(200).json(updatedProfile);

    } catch (error) {
      console.error('Label Admin profile update API error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}