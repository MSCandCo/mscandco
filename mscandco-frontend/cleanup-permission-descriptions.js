const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function cleanupPermissionDescriptions() {
  console.log('🧹 Cleaning up permission descriptions...\n')

  // Get all permissions
  const { data: permissions, error: fetchError } = await supabase
    .from('permissions')
    .select('*')
    .order('name')

  if (fetchError) {
    console.error('❌ Error fetching permissions:', fetchError)
    return
  }

  console.log(`Found ${permissions.length} permissions\n`)

  let updateCount = 0
  const updates = []

  for (const perm of permissions) {
    let newDescription = perm.description
    let needsUpdate = false

    if (newDescription) {
      // Remove "permission" or "permissions" (case insensitive)
      const cleaned = newDescription
        .replace(/\bpermission\b/gi, '')
        .replace(/\bpermissions\b/gi, '')
        // Remove "master" if it's redundant
        .replace(/\bmaster\s+/gi, '')
        // Clean up extra spaces
        .replace(/\s{2,}/g, ' ')
        .trim()
        // Capitalize first letter if needed
        .replace(/^[a-z]/, (match) => match.toUpperCase())

      if (cleaned !== newDescription && cleaned.length > 0) {
        needsUpdate = true
        newDescription = cleaned
      }
    }

    if (needsUpdate) {
      updates.push({
        id: perm.id,
        name: perm.name,
        oldDescription: perm.description,
        newDescription: newDescription
      })
    }
  }

  console.log(`Found ${updates.length} permissions to update\n`)

  if (updates.length === 0) {
    console.log('✅ No updates needed - descriptions are already clean!')
    return
  }

  console.log('Preview of changes:\n')
  updates.slice(0, 10).forEach((update, index) => {
    console.log(`${index + 1}. ${update.name}`)
    console.log(`   OLD: "${update.oldDescription}"`)
    console.log(`   NEW: "${update.newDescription}"`)
    console.log()
  })

  if (updates.length > 10) {
    console.log(`... and ${updates.length - 10} more\n`)
  }

  // Apply updates
  console.log('Applying updates...\n')

  for (const update of updates) {
    const { error } = await supabase
      .from('permissions')
      .update({ description: update.newDescription })
      .eq('id', update.id)

    if (error) {
      console.error(`❌ Error updating ${update.name}:`, error)
    } else {
      updateCount++
      if (updateCount % 10 === 0) {
        console.log(`✓ Updated ${updateCount}/${updates.length}`)
      }
    }
  }

  console.log(`\n✅ Successfully updated ${updateCount} permission descriptions!`)

  // Show some examples of the cleaned descriptions
  console.log('\n📋 Sample cleaned descriptions:\n')

  const { data: updated, error: verifyError } = await supabase
    .from('permissions')
    .select('name, description')
    .in('id', updates.slice(0, 5).map(u => u.id))

  if (!verifyError && updated) {
    updated.forEach(perm => {
      console.log(`• ${perm.name}`)
      console.log(`  ${perm.description}`)
      console.log()
    })
  }
}

cleanupPermissionDescriptions()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
