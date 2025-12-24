import { Inngest } from 'inngest'

/**
 * Inngest client for triggering background jobs
 */
export const inngest = new Inngest({
  id: 'mscandco-platform',
  name: 'MSC & Co Platform',
  eventKey: process.env.INNGEST_EVENT_KEY,
})

/**
 * Send event to Inngest
 * @param {string} name - Event name
 * @param {Object} data - Event data
 * @returns {Promise<void>}
 */
export async function sendEvent(name, data = {}) {
  try {
    await inngest.send({
      name,
      data: {
        ...data,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error(`❌ Failed to send Inngest event: ${name}`, error)
    throw error
  }
}

/**
 * Trigger AI processing job
 * @param {string} userId - User ID
 * @param {string} taskType - AI task type (e.g., 'analyze-lyrics', 'generate-artwork')
 * @param {Object} payload - Task payload
 */
export async function triggerAIJob(userId, taskType, payload) {
  await sendEvent('ai/process', {
    userId,
    taskType,
    payload,
  })
}

/**
 * Trigger email job
 * @param {string} userId - User ID
 * @param {string} emailType - Email type (e.g., 'welcome', 'invoice')
 * @param {Object} data - Email data
 */
export async function triggerEmailJob(userId, emailType, data) {
  await sendEvent('email/send', {
    userId,
    emailType,
    data,
  })
}

/**
 * Trigger analytics aggregation job
 * @param {string} userId - User ID
 * @param {string} period - Period (e.g., 'daily', 'weekly', 'monthly')
 */
export async function triggerAnalyticsJob(userId, period) {
  await sendEvent('analytics/aggregate', {
    userId,
    period,
  })
}

/**
 * Trigger release distribution job
 * @param {string} releaseId - Release ID
 * @param {Array<string>} platforms - Platforms to distribute to
 */
export async function triggerDistributionJob(releaseId, platforms) {
  await sendEvent('release/distribute', {
    releaseId,
    platforms,
  })
}

/**
 * Trigger payment processing job
 * @param {string} userId - User ID
 * @param {string} paymentId - Payment ID
 * @param {number} amount - Amount
 */
export async function triggerPaymentJob(userId, paymentId, amount) {
  await sendEvent('payment/process', {
    userId,
    paymentId,
    amount,
  })
}

/**
 * Trigger subscription renewal job
 * @param {string} userId - User ID
 * @param {string} subscriptionId - Subscription ID
 */
export async function triggerRenewalJob(userId, subscriptionId) {
  await sendEvent('subscription/renew', {
    userId,
    subscriptionId,
  })
}

export default inngest

