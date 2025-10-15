import { createClient } from '@supabase/supabase-js';
import { requirePermission } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  try {
    const user = req.user;

    if (req.method === 'GET') {
      // Get preferences from database
      const { data, error } = await supabase
        .from('user_profiles')
        .select('theme_preference, language_preference, default_currency, timezone, date_format, email_signature, company_visibility')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return res.status(200).json({
        success: true,
        data: {
          theme: data?.theme_preference || 'light',
          language: data?.language_preference || 'en',
          currency: data?.default_currency || 'GBP',
          timezone: data?.timezone || 'Europe/London',
          dateFormat: data?.date_format || 'DD/MM/YYYY',
          emailSignature: data?.email_signature || '',
          companyVisibility: data?.company_visibility || 'public'
        }
      });
    }

    if (req.method === 'POST') {
      const { theme, language, currency, timezone, dateFormat, emailSignature, companyVisibility } = req.body;

      // Update preferences in database
      const { error } = await supabase
        .from('user_profiles')
        .update({
          theme_preference: theme,
          language_preference: language,
          default_currency: currency,
          timezone: timezone,
          date_format: dateFormat,
          email_signature: emailSignature,
          company_visibility: companyVisibility
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in preferences API:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export default requirePermission(['distribution:settings:access'])(handler);
