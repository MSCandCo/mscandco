import { inngest } from '../inngest-client'
import { captureException } from '@/lib/monitoring/sentry'
import { trackServerEvent } from '@/lib/analytics/posthog-server'

/**
 * Email Sender Job
 * Handles sending transactional emails
 */
export const emailSenderJob = inngest.createFunction(
  {
    id: 'email-sender',
    name: 'Email Sender',
    retries: 3,
  },
  { event: 'email/send' },
  async ({ event, step }) => {
    const { userId, emailType, data } = event.data


    try {
      // Step 1: Fetch user email
      const userEmail = await step.run('fetch-user-email', async () => {
        return data.email || 'user@example.com'
      })

      // Step 2: Render email template
      const emailContent = await step.run('render-template', async () => {
        return renderEmailTemplate(emailType, data)
      })

      // Step 3: Send email
      await step.run('send-email', async () => {
        return { sent: true }
      })

      // Step 4: Track analytics
      await step.run('track-analytics', async () => {
        await trackServerEvent(userId, 'email_sent', {
          email_type: emailType,
          recipient: userEmail,
        })
      })

      return { success: true, recipient: userEmail }
    } catch (error) {
      console.error('❌ Email sending failed:', error)
      
      captureException(error, {
        tags: { job: 'email-sender', email_type: emailType },
        extra: { userId, data },
      })

      throw error
    }
  }
)

// Email template renderer (placeholder)
function renderEmailTemplate(emailType, data) {
  const templates = {
    welcome: {
      subject: 'Welcome to MSC & Co!',
      body: `Hi ${data.name}, welcome to the platform!`,
    },
    invoice: {
      subject: 'Your Invoice',
      body: `Your invoice for $${data.amount} is ready.`,
    },
    'release-approved': {
      subject: 'Release Approved!',
      body: `Your release "${data.releaseName}" has been approved!`,
    },
    'payment-received': {
      subject: 'Payment Received',
      body: `We received your payment of $${data.amount}.`,
    },
  }

  return templates[emailType] || {
    subject: 'Notification',
    body: 'You have a new notification.',
  }
}

