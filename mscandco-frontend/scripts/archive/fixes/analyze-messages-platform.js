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

async function analyzeMessagesAndPlatform() {
  console.log('🔍 Analyzing Messages, Platform, and Platform Messages permissions...\n')

  // Get all permissions related to messages and platform
  const { data: perms, error } = await supabase
    .from('permissions')
    .select('*')
    .or('resource.eq.messages,resource.eq.platform,resource.eq.platform_messages')
    .order('resource', { ascending: true })

  if (error) {
    console.error('Error:', error)
    return
  }

  const messagesPerms = perms.filter(p => p.resource === 'messages')
  const platformPerms = perms.filter(p => p.resource === 'platform')
  const platformMessagesPerms = perms.filter(p => p.resource === 'platform_messages')

  console.log('='.repeat(100))
  console.log(`MESSAGES PERMISSIONS (${messagesPerms.length}):\n`)
  console.log('='.repeat(100))

  messagesPerms.forEach(p => {
    console.log(`📧 ${p.name}`)
    console.log(`   ${p.description}`)
    console.log(`   ID: ${p.id}`)
    console.log()
  })

  console.log('='.repeat(100))
  console.log(`PLATFORM PERMISSIONS (${platformPerms.length}):\n`)
  console.log('='.repeat(100))

  platformPerms.forEach(p => {
    console.log(`🌐 ${p.name}`)
    console.log(`   ${p.description}`)
    console.log(`   ID: ${p.id}`)
    console.log()
  })

  console.log('='.repeat(100))
  console.log(`PLATFORM_MESSAGES PERMISSIONS (${platformMessagesPerms.length}):\n`)
  console.log('='.repeat(100))

  platformMessagesPerms.forEach(p => {
    console.log(`📢 ${p.name}`)
    console.log(`   ${p.description}`)
    console.log(`   ID: ${p.id}`)
    console.log()
  })

  // Check which roles use these permissions
  console.log('='.repeat(100))
  console.log('USAGE BY ROLES:\n')
  console.log('='.repeat(100))

  const { data: roles } = await supabase
    .from('roles')
    .select('id, name')

  for (const role of roles) {
    const { data: rolePerms } = await supabase
      .from('role_permissions')
      .select('permissions(name, resource)')
      .eq('role_id', role.id)
      .in('permission_id', perms.map(p => p.id))

    if (rolePerms && rolePerms.length > 0) {
      console.log(`\n${role.name.toUpperCase()}:`)

      // Group by resource
      const byResource = {}
      rolePerms.forEach(rp => {
        const resource = rp.permissions.resource
        if (!byResource[resource]) byResource[resource] = []
        byResource[resource].push(rp.permissions.name)
      })

      Object.keys(byResource).sort().forEach(resource => {
        console.log(`  ${resource}:`)
        byResource[resource].forEach(name => {
          console.log(`    - ${name}`)
        })
      })
    }
  }

  // Analysis and recommendations
  console.log('\n' + '='.repeat(100))
  console.log('📊 ANALYSIS & RECOMMENDATIONS:\n')
  console.log('='.repeat(100))

  console.log('\n1. MESSAGES vs PLATFORM_MESSAGES:')
  console.log('   - messages: User-to-user messages, notifications, invitations')
  console.log('   - platform_messages: Admin broadcast messages to all users')
  console.log('   ✅ These are DIFFERENT features - keep both\n')

  console.log('2. PLATFORM permission:')
  console.log('   - platform:access: Generic platform feature access')
  console.log('   - Only used by super_admin')
  console.log('   ⚠️  Consider if this is still needed\n')

  console.log('3. ARTIST-SPECIFIC PERMISSIONS:')
  console.log('   - artist:messages:access vs messages:access')
  console.log('   - artist:settings:access vs settings:access')
  console.log('   ✅ These provide role-specific access control - keep both\n')
}

analyzeMessagesAndPlatform()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
