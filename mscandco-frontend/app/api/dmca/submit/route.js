import { NextResponse } from 'next/server'
import { withStrictRateLimit } from '@/lib/with-rate-limit'

/**

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

 * POST /api/dmca/submit
 * Submit a DMCA takedown notice or counter-notification
 *
 * Body:
 * {
 *   noticeType: 'takedown' | 'counter',
 *   name: string,
 *   email: string,
 *   address: string,
 *   phone: string (optional),
 *   copyrightedWorkDescription: string (takedown only),
 *   infringingContentUrl: string (takedown only),
 *   goodFaithStatement: string (takedown only),
 *   counterJustification: string (counter only),
 *   consentToJurisdiction: boolean (counter only),
 *   originalNoticeId: string (counter only, optional),
 *   signature: string
 * }
 */
export const POST = withStrictRateLimit(async (request) => {
  const supabase = await createClient()

  try {
    const body = await request.json()
    const {
      noticeType,
      name,
      email,
      address,
      phone,
      copyrightedWorkDescription,
      infringingContentUrl,
      goodFaithStatement,
      counterJustification,
      consentToJurisdiction,
      originalNoticeId,
      signature
    } = body

    // Validate required fields
    if (!noticeType || !name || !email || !address || !signature) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, address, signature' },
        { status: 400 }
      )
    }

    if (!['takedown', 'counter_notification'].includes(noticeType)) {
      return NextResponse.json(
        { error: 'Invalid notice type. Must be "takedown" or "counter_notification"' },
        { status: 400 }
      )
    }

    // Validate takedown-specific fields
    if (noticeType === 'takedown') {
      if (!copyrightedWorkDescription || !infringingContentUrl || !goodFaithStatement) {
        return NextResponse.json(
          { error: 'Missing required fields for takedown notice' },
          { status: 400 }
        )
      }
    }

    // Validate counter-notification specific fields
    if (noticeType === 'counter_notification') {
      if (!counterJustification || !consentToJurisdiction) {
        return NextResponse.json(
          { error: 'Missing required fields for counter-notification' },
          { status: 400 }
        )
      }
    }

    // Standard perjury statement
    const perjuryStatement = `I swear, under penalty of perjury, that the information in this notification is accurate and that I am the copyright owner, or am authorized to act on behalf of the owner, of an exclusive right that is allegedly infringed.`

    // Prepare notice data
    const noticeData = {
      notice_type: noticeType,
      complainant_name: name,
      complainant_email: email,
      complainant_address: address,
      complainant_phone: phone || null,
      perjury_statement: perjuryStatement,
      electronic_signature: signature,
      status: 'pending'
    }

    // Add takedown-specific fields
    if (noticeType === 'takedown') {
      noticeData.copyrighted_work_description = copyrightedWorkDescription
      noticeData.infringing_content_url = infringingContentUrl
      noticeData.good_faith_statement = goodFaithStatement

      // Try to parse content ID from URL if it's from our platform
      try {
        const url = new URL(infringingContentUrl)
        if (url.hostname.includes('mscandco.com')) {
          const pathParts = url.pathname.split('/')
          if (pathParts.includes('release') && pathParts.length > 2) {
            const releaseId = pathParts[pathParts.indexOf('release') + 1]

            // Check if release exists
            const { data: release } = await supabase
              .from('releases')
              .select('id, artist_id')
              .eq('id', releaseId)
              .single()

            if (release) {
              noticeData.infringing_content_id = release.id
              noticeData.content_type = 'release'
              noticeData.affected_user_id = release.artist_id
            }
          }
        }
      } catch (err) {
        // URL parsing failed or content not found - continue without content_id
        console.error('Failed to parse content URL:', err)
      }
    }

    // Add counter-notification specific fields
    if (noticeType === 'counter_notification') {
      noticeData.counter_justification = counterJustification
      noticeData.consent_to_jurisdiction = consentToJurisdiction

      if (originalNoticeId) {
        // Validate original notice exists
        const { data: originalNotice } = await supabase
          .from('dmca_notices')
          .select('id, affected_user_id, infringing_content_id, content_type')
          .eq('id', originalNoticeId)
          .single()

        if (originalNotice) {
          noticeData.original_notice_id = originalNoticeId
          noticeData.affected_user_id = originalNotice.affected_user_id
          noticeData.infringing_content_id = originalNotice.infringing_content_id
          noticeData.content_type = originalNotice.content_type
          noticeData.infringing_content_url = `Reference to original notice ${originalNoticeId}`
        }
      }
    }

    // Insert DMCA notice
    const { data: notice, error: insertError } = await supabase
      .from('dmca_notices')
      .insert(noticeData)
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting DMCA notice:', insertError)
      return NextResponse.json(
        { error: 'Failed to submit notice. Please try again.' },
        { status: 500 }
      )
    }

    // TODO: Send email notifications
    // - Notify admins of new DMCA notice
    // - If counter-notification, notify original complainant

    return NextResponse.json({
      success: true,
      message: 'Notice submitted successfully',
      data: {
        noticeId: notice.id,
        status: notice.status,
        created_at: notice.created_at
      }
    })

  } catch (err) {
    console.error('Error processing DMCA submission:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
