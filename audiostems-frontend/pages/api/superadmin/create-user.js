import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    // Verify user is super admin
    const { data: roleData } = await supabase
      .from('user_role_assignments')
      .select('role_name')
      .eq('user_id', user.id)
      .single();

    if (!roleData || roleData.role_name !== 'super_admin') {
      return res.status(403).json({ error: 'Super admin access required' });
    }

    const {
      email,
      password,
      firstName,
      lastName,
      role,
      dateOfBirth,
      nationality,
      country,
      city,
      phone,
      artistName,
      companyName,
      bio
    } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ error: 'Email, password, first name, last name, and role are required' });
    }

    // Validate role
    const validRoles = ['artist', 'label_admin', 'distribution_partner', 'company_admin', 'super_admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    // Create user in Supabase Auth
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-verify email
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        role: role
      }
    });

    if (createError) {
      console.error('Error creating user:', createError);
      return res.status(400).json({ error: `Failed to create user: ${createError.message}` });
    }

    // Create user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: newUser.user.id,
        email: email,
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dateOfBirth || null,
        nationality: nationality || null,
        country: country || null,
        city: city || null,
        phone: phone || null,
        artist_name: artistName || null,
        company_name: companyName || null,
        bio: bio || null,
        profile_completed: true,
        is_basic_info_set: true,
        wallet_balance: role === 'artist' ? 1000.00 : 0.00, // Give artists starting balance
        wallet_enabled: true,
        negative_balance_allowed: role === 'artist',
        wallet_credit_limit: role === 'artist' ? 500.00 : 0.00,
        releases_count: 0,
        storage_used_mb: 0
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error creating profile:', profileError);
      // Clean up the user if profile creation failed
      await supabase.auth.admin.deleteUser(newUser.user.id);
      return res.status(500).json({ error: `Failed to create user profile: ${profileError.message}` });
    }

    // Assign role
    const { error: roleError } = await supabase
      .from('user_role_assignments')
      .insert({
        user_id: newUser.user.id,
        role_name: role
      });

    if (roleError) {
      console.error('Error assigning role:', roleError);
      // Clean up the user and profile if role assignment failed
      await supabase.from('user_profiles').delete().eq('id', newUser.user.id);
      await supabase.auth.admin.deleteUser(newUser.user.id);
      return res.status(500).json({ error: `Failed to assign role: ${roleError.message}` });
    }

    // Create default subscription for artists
    if (role === 'artist') {
      const { error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: newUser.user.id,
          user_email: email,
          plan: 'artist_starter',
          status: 'active',
          max_releases: 5,
          advanced_analytics: false,
          amount: 29.99,
          currency: 'GBP',
          billing_cycle: 'monthly',
          pay_from_wallet: false,
          auto_pay_enabled: true,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });

      if (subscriptionError) {
        console.error('Error creating subscription:', subscriptionError);
        // Don't fail the user creation, just log the error
      }
    }

    // Create default revenue split configuration
    const { error: splitError } = await supabase
      .from('user_revenue_splits')
      .insert({
        user_id: newUser.user.id,
        artist_percentage: 75.00,
        label_admin_percentage: 20.00,
        company_admin_percentage: 5.00,
        has_label_admin: role === 'artist',
        label_admin_user_id: role === 'artist' ? 
          (await supabase.from('auth.users').select('id').eq('email', 'labeladmin@mscandco.com').single()).data?.id : null
      });

    if (splitError) {
      console.error('Error creating revenue split:', splitError);
      // Don't fail the user creation, just log the error
    }

    return res.status(201).json({
      success: true,
      message: 'User created successfully and can log in immediately',
      user: {
        id: newUser.user.id,
        email: email,
        firstName: firstName,
        lastName: lastName,
        role: role,
        profile: profile,
        verified: true,
        canLoginImmediately: true
      }
    });

  } catch (error) {
    console.error('Error in create-user API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}