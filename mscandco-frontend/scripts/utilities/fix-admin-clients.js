const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all files with the pattern
const files = execSync('grep -r "const supabaseAdmin = createClient(" app/api/ --include="*.js" -l', { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(Boolean);

console.log(`Found ${files.length} files to fix`);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace the import and const declaration
  const oldPattern = /import { createClient } from '@supabase\/supabase-js'\nimport { NextResponse } from 'next\/server'\nimport { createClient as createServerClient } from '@\/lib\/supabase\/server'\n\nconst supabaseAdmin = createClient\(\n  process\.env\.NEXT_PUBLIC_SUPABASE_URL,\n  process\.env\.SUPABASE_SERVICE_ROLE_KEY\n\)/g;
  
  const newCode = `import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

// Lazy initialization to avoid build-time errors
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase configuration is missing')
  }
  
  const { createClient } = require('@supabase/supabase-js')
  return createClient(supabaseUrl, serviceRoleKey)
}`;
  
  if (content.includes('const supabaseAdmin = createClient(')) {
    // Simple replacement
    content = content.replace(
      /import { createClient } from '@supabase\/supabase-js'\n/g,
      ''
    );
    content = content.replace(
      /const supabaseAdmin = createClient\(\n  process\.env\.NEXT_PUBLIC_SUPABASE_URL,\n  process\.env\.SUPABASE_SERVICE_ROLE_KEY\n\)\n/g,
      newCode
    );
    
    // Add getSupabaseAdmin() calls before first usage
    if (content.includes('supabaseAdmin.') && !content.includes('getSupabaseAdmin()')) {
      // Find first usage and add initialization
      content = content.replace(
        /(    const \{ data.*\} = await )supabaseAdmin\./,
        '$1(getSupabaseAdmin()).'
      );
    }
    
    fs.writeFileSync(file, content);
    console.log(`Fixed: ${file}`);
  }
});

console.log('Done!');
