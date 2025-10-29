// Supabase Edge Function for sending transactional emails
// This handles all non-auth emails (release-approved, payment-received, etc.)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { loadEmailTemplate, replaceTemplateVariables } from './templates.ts'

// Email type definitions
const EMAIL_TYPES = {
  WELCOME: 'welcome',
  PASSWORD_CHANGED: 'password-changed',
  RELEASE_APPROVED: 'release-approved',
  PAYMENT_RECEIVED: 'payment-received',
  WITHDRAWAL_CONFIRMATION: 'withdrawal-confirmation',
  INVOICE: 'invoice',
  INACTIVE_ACCOUNT: 'inactive-account',
  SUSPICIOUS_LOGIN: 'suspicious-login',
} as const

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  emailType: string
  to: string
  data: Record<string, string>
}

interface EmailResponse {
  success: boolean
  message?: string
  error?: string
}

/**
 * Send email via Resend API
 * Resend provides better deliverability, monitoring, and modern API
 */
async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'MSC & Co <noreply@mscandco.com>'

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured')
    }

    // Send email via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject: subject,
        html: html,
        headers: {
          'List-Unsubscribe': '<mailto:unsubscribe@mscandco.com>',
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Resend API error: ${errorData.message || response.statusText}`)
    }

    const data = await response.json()
    console.log('Email sent successfully via Resend:', data.id)

    return { success: true }
  } catch (error) {
    console.error('Error sending email via Resend:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get email subject based on type
 */
function getEmailSubject(emailType: string, data: Record<string, string>): string {
  switch (emailType) {
    case EMAIL_TYPES.WELCOME:
      return 'Welcome to MSC & Co!'
    case EMAIL_TYPES.PASSWORD_CHANGED:
      return 'Your Password Has Been Changed - MSC & Co'
    case EMAIL_TYPES.RELEASE_APPROVED:
      return `Release Approved: ${data.releaseName || 'Your Release'}`
    case EMAIL_TYPES.PAYMENT_RECEIVED:
      return 'Payment Received - MSC & Co'
    case EMAIL_TYPES.WITHDRAWAL_CONFIRMATION:
      return 'Withdrawal Confirmed - MSC & Co'
    case EMAIL_TYPES.INVOICE:
      return `Invoice ${data.invoiceNumber || ''} - MSC & Co`
    case EMAIL_TYPES.INACTIVE_ACCOUNT:
      return 'We Miss You at MSC & Co'
    case EMAIL_TYPES.SUSPICIOUS_LOGIN:
      return 'New Login Detected - MSC & Co Security Alert'
    default:
      return 'MSC & Co Notification'
  }
}

/**
 * Validate email request
 */
function validateRequest(req: EmailRequest): { valid: boolean; error?: string } {
  if (!req.emailType) {
    return { valid: false, error: 'emailType is required' }
  }

  if (!req.to) {
    return { valid: false, error: 'to (recipient email) is required' }
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(req.to)) {
    return { valid: false, error: 'Invalid email format' }
  }

  // Check if email type is supported
  const validTypes = Object.values(EMAIL_TYPES)
  if (!validTypes.includes(req.emailType as any)) {
    return {
      valid: false,
      error: `Invalid email type. Valid types: ${validTypes.join(', ')}`
    }
  }

  return { valid: true }
}

/**
 * Main handler function
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body
    const requestBody: EmailRequest = await req.json()

    // Validate request
    const validation = validateRequest(requestBody)
    if (!validation.valid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: validation.error
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const { emailType, to, data } = requestBody

    console.log(`Processing ${emailType} email to ${to}`)

    // Load email template
    const template = await loadEmailTemplate(emailType)

    // Replace variables in template
    const html = replaceTemplateVariables(template, data)

    // Get email subject
    const subject = getEmailSubject(emailType, data)

    // Send email
    const result = await sendEmail(to, subject, html)

    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: result.error || 'Failed to send email'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Success response
    return new Response(
      JSON.stringify({
        success: true,
        message: `${emailType} email sent to ${to}`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in send-email function:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
