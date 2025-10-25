import { serve } from 'inngest/next'
import { inngest } from '@/lib/jobs/inngest-client'

// Import all job functions
import { aiProcessingJob } from '@/lib/jobs/functions/ai-processing'
import { emailSenderJob } from '@/lib/jobs/functions/email-sender'
import { analyticsAggregatorJob } from '@/lib/jobs/functions/analytics-aggregator'
import { subscriptionRenewalJob } from '@/lib/jobs/functions/subscription-renewal'

/**
 * Inngest API endpoint
 * Handles all background job execution
 */
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    aiProcessingJob,
    emailSenderJob,
    analyticsAggregatorJob,
    subscriptionRenewalJob,
  ],
})

