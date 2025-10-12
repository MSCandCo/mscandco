import { supabase } from '@/lib/supabase';

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
