import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/rbac/middleware';
import { hasPermission } from '@/lib/rbac/roles';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // Check read permission
      const canRead = await hasPermission(req.userRole, 'finance:split_configuration:read', req.user.id);
      if (!canRead) {
        return res.status(403).json({ error: 'Insufficient permissions to view split configuration' });
      }

      console.log('📊 Fetching split configuration...');

      // Get global configuration
      const { data: config, error: configError } = await supabase
        .from('revenue_split_config')
        .select('*')
        .eq('company_id', 'msc-co')
        .single();

      if (configError && configError.code !== 'PGRST116') {
        console.error('❌ Error fetching config:', configError);
        return res.status(500).json({ error: 'Failed to fetch configuration' });
      }

      // Get super label admin (labeladmin@mscandco.com)
      const { data: superLabel } = await supabase
        .from('user_profiles')
        .select('id, email, first_name, last_name, label_name, display_name')
        .eq('email', 'labeladmin@mscandco.com')
        .single();

      // Get all artists with custom splits from revenue_splits table
      const { data: artistSplits } = await supabase
        .from('revenue_splits')
        .select(`
          artist_id,
          artist_percentage,
          artist:artist_id (
            email,
            first_name,
            last_name,
            artist_name,
            display_name
          )
        `)
        .not('artist_id', 'is', null)
        .eq('is_active', true);

      // Get all label admins with custom splits
      const { data: labelSplits } = await supabase
        .from('revenue_splits')
        .select(`
          label_admin_id,
          label_percentage,
          label:label_admin_id (
            email,
            first_name,
            last_name,
            label_name,
            display_name
          )
        `)
        .not('label_admin_id', 'is', null)
        .eq('is_active', true);

      // Process artist overrides
      const artistOverrides = artistSplits?.map(split => {
        const name = split.artist?.artist_name ||
                     split.artist?.display_name ||
                     `${split.artist?.first_name || ''} ${split.artist?.last_name || ''}`.trim() ||
                     'Unknown Artist';

        return {
          id: split.artist_id,
          name,
          email: split.artist?.email || '',
          percentage: parseFloat(split.artist_percentage) || 80
        };
      }) || [];

      // Process label overrides
      const labelOverrides = labelSplits?.map(split => {
        const name = split.label?.label_name ||
                     split.label?.display_name ||
                     `${split.label?.first_name || ''} ${split.label?.last_name || ''}`.trim() ||
                     'Unknown Label';

        return {
          id: split.label_admin_id,
          name,
          email: split.label?.email || '',
          percentage: parseFloat(split.label_percentage) || 20
        };
      }) || [];

      const superLabelName = superLabel?.label_name ||
                             superLabel?.display_name ||
                             `${superLabel?.first_name || ''} ${superLabel?.last_name || ''}`.trim() ||
                             'MSC & Co';

      console.log('✅ Configuration loaded successfully');

      return res.status(200).json({
        success: true,
        company_id: config?.company_id || 'msc-co',
        company_percentage: parseFloat(config?.company_admin_percentage) || 20,
        artist_percentage: parseFloat(config?.artist_percentage) || 80,
        label_percentage: parseFloat(config?.label_admin_percentage) || 20,
        super_label_percentage: parseFloat(config?.label_admin_percentage) || 20,
        super_label_admin: {
          id: superLabel?.id,
          email: superLabel?.email || 'labeladmin@mscandco.com',
          name: superLabelName
        },
        artist_overrides: artistOverrides,
        label_overrides: labelOverrides,
        updated_at: config?.updated_at,
        updated_by: config?.updated_by_email
      });
    }

    if (req.method === 'PUT') {
      // Check update permission
      const canUpdate = await hasPermission(req.userRole, 'finance:split_configuration:update', req.user.id);
      if (!canUpdate) {
        return res.status(403).json({ error: 'Insufficient permissions to update split configuration' });
      }

      console.log('💾 Updating split configuration...');

      const {
        company_percentage,
        artist_percentage,
        label_percentage,
        super_label_percentage
      } = req.body;

      // Validate percentages
      if (artist_percentage + label_percentage !== 100) {
        return res.status(400).json({
          error: 'Artist and label percentages must total 100%'
        });
      }

      // Update global configuration
      const { error: updateError } = await supabase
        .from('revenue_split_config')
        .update({
          company_admin_percentage: company_percentage || super_label_percentage,
          artist_percentage: artist_percentage,
          label_admin_percentage: label_percentage,
          updated_by_user_id: req.user.id,
          updated_by_email: req.user.email,
          updated_at: new Date().toISOString()
        })
        .eq('company_id', 'msc-co');

      if (updateError) {
        console.error('❌ Error updating config:', updateError);
        return res.status(500).json({ error: 'Failed to update configuration' });
      }

      console.log('✅ Configuration updated successfully');

      return res.status(200).json({
        success: true,
        message: 'Configuration updated successfully'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('❌ Error in split configuration API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

// V2 Permission: Requires authentication - permission checks are done per-method inside handler
export default requireAuth(handler);
