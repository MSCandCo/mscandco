/**
 * Email Service for MSC & Co
 * Handles sending transactional emails using Supabase Auth email templates
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Initialize Supabase client with service role for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * Email Template Types
 */
export const EMAIL_TYPES = {
  REGISTRATION_CONFIRMATION: 'registration-confirmation',
  WELCOME: 'welcome',
  PASSWORD_RESET: 'password-reset',
  PASSWORD_CHANGED: 'password-changed',
  RELEASE_APPROVED: 'release-approved',
  PAYMENT_RECEIVED: 'payment-received',
  WITHDRAWAL_CONFIRMATION: 'withdrawal-confirmation',
  INVOICE: 'invoice',
  INACTIVE_ACCOUNT: 'inactive-account',
  SUSPICIOUS_LOGIN: 'suspicious-login',
}

/**
 * Load email template from file system
 * @param {string} templateName - Name of the template file (without .html extension)
 * @returns {string} HTML template content
 */
function loadEmailTemplate(templateName) {
  const templatePath = path.join(
    process.cwd(),
    'email-templates',
    `${templateName}.html`
  )
  return fs.readFileSync(templatePath, 'utf8')
}

/**
 * Replace template variables with actual data
 * @param {string} template - HTML template string
 * @param {object} data - Data object with key-value pairs
 * @returns {string} Processed HTML with replaced variables
 */
function replaceTemplateVariables(template, data) {
  let processed = template

  // Replace all {{ .VariableName }} patterns
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`\\{\\{\\s*\\.${key}\\s*\\}\\}`, 'g')
    processed = processed.replace(regex, data[key] || '')
  })

  return processed
}

/**
 * Send email via Supabase Edge Function
 * Uses the deployed send-email Edge Function
 * @param {string} emailType - Type of email to send
 * @param {string} to - Recipient email address
 * @param {object} data - Data object with template variables
 */
async function sendEmailViaSupabase(emailType, to, data) {
  try {
    const edgeFunctionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email`

    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailType,
        to,
        data,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to send email')
    }

    return { success: true, data: result }
  } catch (error) {
    console.error(`❌ Error sending email via Supabase:`, error)
    throw error
  }
}

/**
 * Send Registration Confirmation Email
 * NOTE: This is handled by Supabase Auth automatically
 * This function is here for reference/manual sending only
 */
export async function sendRegistrationConfirmationEmail(email, data) {
  // Supabase Auth handles this automatically
  // If you need to send manually, use Supabase Auth API
  return { success: true, note: 'Handled by Supabase Auth' }
}

/**
 * Send Welcome Email (after email verification)
 */
export async function sendWelcomeEmail(email, data) {
  return await sendEmailViaSupabase(EMAIL_TYPES.WELCOME, email, {
    UserName: data.userName || 'there',
    DashboardURL: data.dashboardUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  })
}

/**
 * Send Password Reset Email
 * NOTE: This is handled by Supabase Auth automatically
 * This function is here for reference/manual sending only
 */
export async function sendPasswordResetEmail(email, data) {
  // Supabase Auth handles this automatically
  return { success: true, note: 'Handled by Supabase Auth' }
}

/**
 * Send Password Changed Confirmation Email
 */
export async function sendPasswordChangedEmail(email, data) {
  return await sendEmailViaSupabase(EMAIL_TYPES.PASSWORD_CHANGED, email, {
    ChangeDate: data.changeDate || new Date().toLocaleDateString(),
    ChangeTime: data.changeTime || new Date().toLocaleTimeString(),
    Location: data.location || 'Unknown',
    SecurityURL: data.securityUrl || `${process.env.NEXT_PUBLIC_APP_URL}/artist/settings`,
  })
}

/**
 * Send Release Approved Email
 */
export async function sendReleaseApprovedEmail(email, data) {
  return await sendEmailViaSupabase(EMAIL_TYPES.RELEASE_APPROVED, email, {
    ReleaseName: data.releaseName,
    ArtistName: data.artistName,
    ReleaseDate: data.releaseDate,
    ReleaseType: data.releaseType || 'Single',
    TrackCount: data.trackCount || '1',
    UPC: data.upc || 'N/A',
    ReleaseURL: data.releaseUrl || `${process.env.NEXT_PUBLIC_APP_URL}/artist/releases`,
  })
}

/**
 * Send Payment Received Email
 */
export async function sendPaymentReceivedEmail(email, data) {
  return await sendEmailViaSupabase(EMAIL_TYPES.PAYMENT_RECEIVED, email, {
    Amount: data.amount,
    Currency: data.currency || 'USD',
    TransactionID: data.transactionId,
    PaymentDate: data.paymentDate || new Date().toLocaleDateString(),
    PaymentMethod: data.paymentMethod || 'Credit Card',
    Description: data.description || 'Payment',
    DashboardURL: data.dashboardUrl || `${process.env.NEXT_PUBLIC_APP_URL}/artist/billing`,
  })
}

/**
 * Send Withdrawal Confirmation Email
 */
export async function sendWithdrawalConfirmationEmail(email, data) {
  return await sendEmailViaSupabase(EMAIL_TYPES.WITHDRAWAL_CONFIRMATION, email, {
    Amount: data.amount,
    Currency: data.currency || 'USD',
    ReferenceNumber: data.referenceNumber,
    RequestDate: data.requestDate || new Date().toLocaleDateString(),
    ProcessingDate: data.processingDate || new Date().toLocaleDateString(),
    DestinationAccount: data.destinationAccount,
    PaymentMethod: data.paymentMethod || 'Bank Transfer',
    EstimatedArrival: data.estimatedArrival || '3-5 business days',
    ProcessingDays: data.processingDays || '3-5 business days',
    TransactionHistoryURL: data.transactionHistoryUrl || `${process.env.NEXT_PUBLIC_APP_URL}/artist/billing`,
  })
}

/**
 * Send Invoice Email
 */
export async function sendInvoiceEmail(email, data) {
  return await sendEmailViaSupabase(EMAIL_TYPES.INVOICE, email, {
    ClientName: data.clientName,
    ClientEmail: data.clientEmail || email,
    ClientAddress: data.clientAddress || 'N/A',
    InvoiceNumber: data.invoiceNumber,
    InvoiceDate: data.invoiceDate || new Date().toLocaleDateString(),
    DueDate: data.dueDate,
    Status: data.status || 'Pending',
    ItemName: data.itemName || 'Service',
    ItemDescription: data.itemDescription || '',
    Quantity: data.quantity || '1',
    Rate: data.rate,
    ItemTotal: data.itemTotal,
    Subtotal: data.subtotal,
    TaxRate: data.taxRate || '0',
    Tax: data.tax || '0.00',
    Total: data.total,
    PaymentTerms: data.paymentTerms || '30 days',
    PaymentURL: data.paymentUrl || `${process.env.NEXT_PUBLIC_APP_URL}/artist/billing`,
    DownloadURL: data.downloadUrl || '#',
  })
}

/**
 * Send Inactive Account Reminder Email (6 months)
 */
export async function sendInactiveAccountEmail(email, data) {
  return await sendEmailViaSupabase(EMAIL_TYPES.INACTIVE_ACCOUNT, email, {
    UserName: data.userName || 'there',
    LoginURL: data.loginUrl || `${process.env.NEXT_PUBLIC_APP_URL}/login`,
  })
}

/**
 * Send Suspicious Login Alert Email
 */
export async function sendSuspiciousLoginEmail(email, data) {
  return await sendEmailViaSupabase(EMAIL_TYPES.SUSPICIOUS_LOGIN, email, {
    LoginDate: data.loginDate || new Date().toLocaleDateString(),
    LoginTime: data.loginTime || new Date().toLocaleTimeString(),
    Location: data.location || 'Unknown',
    Device: data.device || 'Unknown Device',
    Browser: data.browser || 'Unknown Browser',
    IPAddress: data.ipAddress || 'Unknown',
    SecureAccountURL: data.secureAccountUrl || `${process.env.NEXT_PUBLIC_APP_URL}/artist/settings`,
    ChangePasswordURL: data.changePasswordUrl || `${process.env.NEXT_PUBLIC_APP_URL}/artist/settings`,
  })
}

/**
 * Helper: Get user email by ID
 */
export async function getUserEmail(userId) {
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .select('email')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data.email
}

/**
 * Helper: Track last login for inactive account detection
 */
export async function updateLastLogin(userId) {
  const { error } = await supabaseAdmin
    .from('user_profiles')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) {
    console.error('Error updating last login:', error)
  }
}

/**
 * Helper: Check for inactive accounts (cron job)
 */
export async function checkInactiveAccounts() {
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const { data: inactiveUsers, error } = await supabaseAdmin
    .from('user_profiles')
    .select('id, email, name, display_name')
    .lt('last_login_at', sixMonthsAgo.toISOString())
    .is('inactive_reminder_sent', false)

  if (error) {
    console.error('Error fetching inactive accounts:', error)
    return
  }

  // Send reminder emails
  for (const user of inactiveUsers) {
    await sendInactiveAccountEmail(user.email, {
      userName: user.display_name || user.name || 'there',
    })

    // Mark as sent
    await supabaseAdmin
      .from('user_profiles')
      .update({ inactive_reminder_sent: true })
      .eq('id', user.id)
  }

  return inactiveUsers.length
}
