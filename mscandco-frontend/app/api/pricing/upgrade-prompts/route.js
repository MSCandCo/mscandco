// Enterprise pattern: Dynamic imports to prevent build-time analysis

/**
 * Get Upgrade Prompts API
 * Returns upgrade prompts for the authenticated user
 */
export async function POST(request) {
  try {
    // Enterprise pattern: Dynamic imports prevent build-time analysis
    const { createClient } = await import('@/lib/supabase/server');
    const { checkUpgradePrompt } = await import('@/lib/middleware/tierEnforcement');
    
    const supabase = await createClient();
    const { userId } = await request.json();

    // Get current user
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check upgrade prompts
    const prompts = await checkUpgradePrompt(userId || authUser.id)

    return Response.json({
      success: true,
      prompts: prompts || [],
      count: prompts?.length || 0
    })
  } catch (error) {
    console.error('Upgrade prompts error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

