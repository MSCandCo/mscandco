import { createClient } from '@supabase/supabase-js';

// Service role client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    const partnerEmail = 'codegroup@mscandco.com';

    if (req.method === 'GET') {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', partnerEmail)
        .single();

      if (error && error.code !== 'PGRST116') {
        return res.status(500).json({ error: 'Failed to fetch profile' });
      }

      if (!profile) {
        return res.status(200).json({
          profile: {
            email: partnerEmail,
            firstName: '',
            lastName: '',
            companyName: '',
            businessType: 'distribution',
            phone: '',
            countryCode: '+44',
            country: '',
            website: '',
            bio: '',
            isCompanyNameSet: false,
            registrationDate: null
          }
        });
      }

      return res.status(200).json({
        profile: {
          id: profile.id,
          email: profile.email,
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          companyName: profile.company_name || profile.artist_name || '',
          businessType: profile.business_type || 'distribution',
          phone: profile.phone || '',
          countryCode: profile.country_code || '+44',
          country: profile.country || '',
          website: profile.website || '',
          bio: profile.bio || '',
          shortBio: profile.short_bio || '',
          isCompanyNameSet: !!(profile.company_name || profile.artist_name),
          registrationDate: profile.created_at,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at
        }
      });
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      const { data: result, error } = await supabase.rpc('update_user_profile', {
        p_email: partnerEmail,
        p_profile_data: req.body
      });

      if (error) {
        console.error('Error updating distribution partner profile:', error);
        return res.status(500).json({ error: 'Failed to update profile: ' + error.message });
      }

      return res.status(200).json(result);
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Distribution partner profile API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}