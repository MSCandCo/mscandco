import { createClient } from '@supabase/supabase-js';
import { requirePermission } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      console.log('➕ Creating split override...');

      const { user_id, percentage, type } = req.body;

      if (!user_id || percentage === undefined || !type) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (percentage < 0 || percentage > 100) {
        return res.status(400).json({ error: 'Percentage must be between 0 and 100' });
      }

      // Check if override already exists
      let query = supabase
        .from('revenue_splits')
        .select('id');

      if (type === 'artist') {
        query = query.eq('artist_id', user_id);
      } else if (type === 'label_admin') {
        query = query.eq('label_admin_id', user_id);
      } else {
        return res.status(400).json({ error: 'Invalid type. Must be artist or label_admin' });
      }

      const { data: existing } = await query.single();

      if (existing) {
        // Update existing override
        const updateData = {
          is_active: true,
          created_by: req.user.id,
          updated_at: new Date().toISOString()
        };

        if (type === 'artist') {
          updateData.artist_percentage = percentage;
          // Calculate complementary label percentage
          updateData.label_percentage = 100 - percentage;
        } else {
          updateData.label_percentage = percentage;
          // Calculate complementary artist percentage
          updateData.artist_percentage = 100 - percentage;
        }

        const { error: updateError } = await supabase
          .from('revenue_splits')
          .update(updateData)
          .eq('id', existing.id);

        if (updateError) {
          console.error('❌ Error updating override:', updateError);
          return res.status(500).json({ error: 'Failed to update override' });
        }
      } else {
        // Create new override
        const insertData = {
          is_active: true,
          created_by: req.user.id,
          effective_from: new Date().toISOString()
        };

        if (type === 'artist') {
          insertData.artist_id = user_id;
          insertData.artist_percentage = percentage;
          insertData.label_percentage = 100 - percentage;
        } else {
          insertData.label_admin_id = user_id;
          insertData.label_percentage = percentage;
          insertData.artist_percentage = 100 - percentage;
        }

        const { error: insertError } = await supabase
          .from('revenue_splits')
          .insert(insertData);

        if (insertError) {
          console.error('❌ Error creating override:', insertError);
          return res.status(500).json({ error: 'Failed to create override' });
        }
      }

      console.log('✅ Override saved successfully');

      return res.status(200).json({
        success: true,
        message: 'Override saved successfully'
      });
    }

    if (req.method === 'DELETE') {
      console.log('🗑️ Removing split override...');

      const { user_id, type } = req.body;

      if (!user_id || !type) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Deactivate the override instead of deleting
      let query = supabase
        .from('revenue_splits')
        .update({
          is_active: false,
          effective_until: new Date().toISOString()
        });

      if (type === 'artist') {
        query = query.eq('artist_id', user_id);
      } else if (type === 'label_admin') {
        query = query.eq('label_admin_id', user_id);
      } else {
        return res.status(400).json({ error: 'Invalid type' });
      }

      const { error } = await query;

      if (error) {
        console.error('❌ Error removing override:', error);
        return res.status(500).json({ error: 'Failed to remove override' });
      }

      console.log('✅ Override removed successfully');

      return res.status(200).json({
        success: true,
        message: 'Override removed successfully'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('❌ Error in override API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

export default requirePermission('*:*:*')(handler);
