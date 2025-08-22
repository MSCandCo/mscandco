import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return handleGetRevenueSplits(req, res);
  } else if (req.method === 'POST') {
    return handleSaveRevenueSplits(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Get current revenue split configuration
async function handleGetRevenueSplits(req, res) {
  try {
    // Get the user from the session
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Verify user is company admin or super admin
    const { data: roleData } = await supabase
      .from('user_role_assignments')
      .select('role_name')
      .eq('user_id', user.id)
      .single();

    if (!roleData || !['company_admin', 'super_admin'].includes(roleData.role_name)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get revenue split configuration
    const { data: config, error } = await supabase
      .from('revenue_split_config')
      .select('*')
      .eq('company_id', 'msc-co') // Default company
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching revenue splits:', error);
      return res.status(500).json({ error: 'Failed to fetch configuration' });
    }

    // Return default configuration if none exists
    if (!config) {
      return res.status(200).json({
        revenueSplit: {
          distributionPartnerPercentage: 15,
          companyAdminPercentage: 10,
          labelAdminPercentage: 25,
          artistPercentage: 75,
          distributionPartnerName: 'Code Group'
        },
        individualLabelAdminPercentages: {},
        individualArtistPercentages: {},
        lastUpdated: null,
        updatedBy: null
      });
    }

    return res.status(200).json({
      revenueSplit: {
        distributionPartnerPercentage: config.distribution_partner_percentage,
        companyAdminPercentage: config.company_admin_percentage,
        labelAdminPercentage: config.label_admin_percentage,
        artistPercentage: config.artist_percentage,
        distributionPartnerName: config.distribution_partner_name
      },
      individualLabelAdminPercentages: config.individual_label_admin_percentages || {},
      individualArtistPercentages: config.individual_artist_percentages || {},
      lastUpdated: config.updated_at,
      updatedBy: config.updated_by_email
    });

  } catch (error) {
    console.error('Error in revenue-splits GET:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Save revenue split configuration
async function handleSaveRevenueSplits(req, res) {
  try {
    // Get the user from the session
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Verify user is company admin or super admin
    const { data: roleData } = await supabase
      .from('user_role_assignments')
      .select('role_name')
      .eq('user_id', user.id)
      .single();

    if (!roleData || !['company_admin', 'super_admin'].includes(roleData.role_name)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { 
      revenueSplit, 
      individualLabelAdminPercentages, 
      individualArtistPercentages 
    } = req.body;

    // Validate percentages
    if (!revenueSplit || 
        typeof revenueSplit.distributionPartnerPercentage !== 'number' ||
        typeof revenueSplit.companyAdminPercentage !== 'number') {
      return res.status(400).json({ error: 'Invalid revenue split configuration' });
    }

    // Save or update configuration
    const { data, error } = await supabase
      .from('revenue_split_config')
      .upsert({
        company_id: 'msc-co',
        distribution_partner_percentage: revenueSplit.distributionPartnerPercentage,
        company_admin_percentage: revenueSplit.companyAdminPercentage,
        label_admin_percentage: revenueSplit.labelAdminPercentage,
        artist_percentage: revenueSplit.artistPercentage,
        distribution_partner_name: revenueSplit.distributionPartnerName,
        individual_label_admin_percentages: individualLabelAdminPercentages || {},
        individual_artist_percentages: individualArtistPercentages || {},
        updated_by_user_id: user.id,
        updated_by_email: user.email,
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error saving revenue splits:', error);
      return res.status(500).json({ error: 'Failed to save configuration' });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Revenue split configuration saved successfully',
      data: data[0]
    });

  } catch (error) {
    console.error('Error in revenue-splits POST:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
