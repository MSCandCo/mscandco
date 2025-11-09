import { createClient } from '@/lib/supabase/server'

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { userId, annualEarnings, totalStreams, totalReleases, totalCommissions } = await request.json()

    // Get current user
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId || authUser.id)
      .single()

    if (userError || !user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Parse inputs
    const earnings = parseFloat(annualEarnings) || 0
    const streams = parseInt(totalStreams) || 0
    const releases = parseInt(totalReleases) || 0
    const commissions = parseFloat(totalCommissions) || 0

    // Check if already qualified
    if (['mpp_paid', 'mpp_earned', 'mpp_invited', 'investment'].includes(user.tier)) {
      return Response.json({
        qualified: true,
        alreadyMember: true,
        message: 'You are already an MSC Partner!',
        currentTier: user.tier
      })
    }

    // Check qualification criteria (need ANY ONE)
    const qualificationReasons = []
    let qualified = false

    if (earnings >= 10000) {
      qualified = true
      qualificationReasons.push(`£${earnings.toLocaleString('en-GB')} in annual earnings`)
    }

    if (streams >= 100000) {
      qualified = true
      qualificationReasons.push(`${streams.toLocaleString('en-GB')} total streams`)
    }

    if (releases >= 50) {
      qualified = true
      qualificationReasons.push(`${releases} total releases`)
    }

    if (commissions >= 5000) {
      qualified = true
      qualificationReasons.push(`£${commissions.toLocaleString('en-GB')} in commissions paid`)
    }

    // Calculate next milestone if not qualified
    let nextMilestone = null
    if (!qualified) {
      const gaps = []

      if (earnings < 10000) {
        gaps.push({
          gap: 10000 - earnings,
          text: `£${(10000 - earnings).toLocaleString('en-GB')} more in annual earnings`
        })
      }

      if (streams < 100000) {
        gaps.push({
          gap: 100000 - streams,
          text: `${(100000 - streams).toLocaleString('en-GB')} more streams`
        })
      }

      if (releases < 50) {
        gaps.push({
          gap: 50 - releases,
          text: `${50 - releases} more releases`
        })
      }

      if (commissions < 5000) {
        gaps.push({
          gap: 5000 - commissions,
          text: `£${(5000 - commissions).toLocaleString('en-GB')} more in commissions`
        })
      }

      // Find closest milestone
      if (gaps.length > 0) {
        const closest = gaps.reduce((min, current) => current.gap < min.gap ? current : min)
        nextMilestone = closest.text
      }
    }

    return Response.json({
      qualified,
      message: qualified
        ? '🎉 Congratulations! You qualify for FREE MSC Partners Program!'
        : 'You don\'t qualify yet, but you\'re making great progress!',
      qualificationReasons: qualified ? qualificationReasons : null,
      nextMilestone,
      criteria: {
        earnings: { value: earnings, required: 10000, met: earnings >= 10000 },
        streams: { value: streams, required: 100000, met: streams >= 100000 },
        releases: { value: releases, required: 50, met: releases >= 50 },
        commissions: { value: commissions, required: 5000, met: commissions >= 5000 }
      }
    })
  } catch (error) {
    console.error('Qualification check error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
