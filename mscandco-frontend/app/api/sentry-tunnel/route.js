/**
 * Sentry Tunnel API Route
 * Proxies Sentry events through our server for GDPR compliance and EU data residency
 */
export async function POST(request) {
  try {
    const envelope = await request.text()
    const pieces = envelope.split('\n')
    const header = JSON.parse(pieces[0])

    // Extract DSN from project path
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
    if (!dsn) {
      return new Response('Sentry DSN not configured', { status: 500 })
    }

    // Parse the DSN to get the project and host
    const dsnUrl = new URL(dsn)
    const projectId = dsnUrl.pathname.substring(1)
    
    // Extract organization ID from the DSN hostname
    // DSN format: https://key@org-id.ingest.us.sentry.io/project-id
    const hostname = dsnUrl.hostname
    const orgId = hostname.match(/(\d+)\.ingest/)?.[1]
    
    // Determine Sentry host based on region (EU or US)
    const isEu = process.env.SENTRY_REGION === 'eu'
    const region = isEu ? 'eu' : 'us'
    const sentryHost = `https://${orgId}.ingest.${region}.sentry.io`

    const upstream = `${sentryHost}/api/${projectId}/envelope/`

    const response = await fetch(upstream, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-sentry-envelope',
        'User-Agent': 'Sentry Tunnel / 1.0',
      },
      body: envelope,
    })

    if (!response.ok) {
      console.error('❌ Sentry tunnel error:', response.status, await response.text())
      return new Response('Sentry tunnel failed', { status: response.status })
    }

    return new Response(null, {
      status: response.status,
      statusText: response.statusText,
    })
  } catch (error) {
    console.error('❌ Sentry tunnel error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
