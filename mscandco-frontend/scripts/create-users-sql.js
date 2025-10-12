/**
 * Create users directly via SQL by inserting into auth.users
 * This bypasses triggers and allows us to create users with specific roles
 *
 * Usage: node scripts/create-users-sql.js
 */

import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

// Initialize Supabase with service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const usersToCreate = [
  {
    email: 'requests@mscandco.com',
    first_name: 'Request',
    last_name: 'Manager',
    role: 'marketing_admin'
  },
  {
    email: 'analytics@mscandco.com',
    first_name: 'Analytics',
    last_name: 'Manager',
    role: 'financial_admin'
  }
];

async function createUsers() {
  console.log('🔧 Creating users via database...\n');

  for (const userData of usersToCreate) {
    try {
      console.log(`📧 Creating user: ${userData.email}`);

      const userId = randomUUID();
      const now = new Date().toISOString();

      // Insert into auth.users
      const { error: authError } = await supabase.rpc('exec_sql', {
        sql: `
          INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            aud,
            role,
            confirmation_token,
            recovery_token,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin
          ) VALUES (
            '${userId}',
            '00000000-0000-0000-0000-000000000000',
            '${userData.email}',
            '',
            '${now}',
            '${now}',
            '${now}',
            'authenticated',
            'authenticated',
            '',
            '',
            '{"provider":"email","providers":["email"]}',
            '{"first_name":"${userData.first_name}","last_name":"${userData.last_name}"}',
            false
          )
          ON CONFLICT (id) DO NOTHING;
        `
      });

      if (authError) {
        console.error(`❌ Error creating auth user:`, authError);
        continue;
      }

      console.log(`✅ Auth user created with ID: ${userId}`);

      // Insert into user_profiles
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role,
          created_at: now,
          updated_at: now,
          registration_date: now
        });

      if (profileError) {
        console.error(`❌ Error creating profile:`, profileError);
      } else {
        console.log(`✅ User profile created with role: ${userData.role}`);
      }

      console.log('');
    } catch (error) {
      console.error(`❌ Unexpected error for ${userData.email}:`, error.message);
    }
  }

  console.log('✅ Done!');
}

createUsers();
