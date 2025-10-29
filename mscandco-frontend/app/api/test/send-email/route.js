/**
 * Email Testing API Route
 * Use this to test all email templates
 *
 * Usage:
 * POST /api/test/send-email
 * Body: { "type": "welcome", "email": "test@example.com" }
 */

import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendReleaseApprovedEmail,
  sendPaymentReceivedEmail,
  sendWithdrawalConfirmationEmail,
  sendInvoiceEmail,
  sendInactiveAccountEmail,
  sendSuspiciousLoginEmail,
  sendRegistrationConfirmationEmail,
} from '@/lib/email/emailService'

export async function POST(request) {
  const { type, email } = await request.json()

  if (!email) {
    return Response.json(
      { error: 'Email is required' },
      { status: 400 }
    )
  }

  try {
    switch (type) {
      case 'registration-confirmation':
        await sendRegistrationConfirmationEmail(email, {
          ConfirmationURL: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm?token=test-token-123`,
        })
        break

      case 'welcome':
        await sendWelcomeEmail(email, {
          userName: 'John Doe',
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        })
        break

      case 'password-reset':
        await sendPasswordResetEmail(email, {
          resetUrl: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=test-reset-token`,
        })
        break

      case 'password-changed':
        await sendPasswordChangedEmail(email, {
          changeDate: new Date().toLocaleDateString(),
          changeTime: new Date().toLocaleTimeString(),
          location: 'San Francisco, CA, USA',
        })
        break

      case 'release-approved':
        await sendReleaseApprovedEmail(email, {
          releaseName: 'Summer Vibes',
          artistName: 'John Doe',
          releaseDate: 'December 15, 2025',
          releaseType: 'Single',
          trackCount: '1',
          upc: '123456789012',
        })
        break

      case 'payment-received':
        await sendPaymentReceivedEmail(email, {
          amount: '$49.99',
          currency: 'USD',
          transactionId: 'TXN-2025-001234',
          paymentDate: new Date().toLocaleDateString(),
          paymentMethod: 'Credit Card',
          description: 'Subscription Payment',
        })
        break

      case 'withdrawal-confirmation':
        await sendWithdrawalConfirmationEmail(email, {
          amount: '$1,234.56',
          currency: 'USD',
          referenceNumber: 'WD-2025-001234',
          requestDate: new Date().toLocaleDateString(),
          processingDate: new Date().toLocaleDateString(),
          destinationAccount: 'Bank Account ****1234',
          paymentMethod: 'Bank Transfer',
          estimatedArrival: '3-5 business days',
          processingDays: '3-5 business days',
        })
        break

      case 'invoice':
        await sendInvoiceEmail(email, {
          clientName: 'John Doe',
          clientEmail: email,
          clientAddress: '123 Music St, Los Angeles, CA 90001',
          invoiceNumber: 'INV-2025-001234',
          invoiceDate: new Date().toLocaleDateString(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          status: 'Pending',
          itemName: 'Distribution Service',
          itemDescription: 'Monthly distribution subscription',
          quantity: '1',
          rate: '$49.99',
          itemTotal: '$49.99',
          subtotal: '$49.99',
          taxRate: '10',
          tax: '$5.00',
          total: '$54.99',
          paymentTerms: '30 days',
        })
        break

      case 'inactive-account':
        await sendInactiveAccountEmail(email, {
          userName: 'John Doe',
        })
        break

      case 'suspicious-login':
        await sendSuspiciousLoginEmail(email, {
          loginDate: new Date().toLocaleDateString(),
          loginTime: new Date().toLocaleTimeString(),
          location: 'Tokyo, Japan',
          device: 'Desktop',
          browser: 'Chrome',
          ipAddress: '203.0.113.42',
        })
        break

      default:
        return Response.json(
          {
            error: 'Invalid email type',
            validTypes: [
              'registration-confirmation',
              'welcome',
              'password-reset',
              'password-changed',
              'release-approved',
              'payment-received',
              'withdrawal-confirmation',
              'invoice',
              'inactive-account',
              'suspicious-login',
            ],
          },
          { status: 400 }
        )
    }

    return Response.json({
      success: true,
      message: `${type} email sent to ${email}`,
    })
  } catch (error) {
    console.error('Error sending test email:', error)
    return Response.json(
      {
        error: 'Failed to send email',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

// GET endpoint to list available email types
export async function GET() {
  return Response.json({
    availableTypes: [
      {
        type: 'registration-confirmation',
        description: 'Email verification after signup',
      },
      {
        type: 'welcome',
        description: 'Welcome email after verification',
      },
      {
        type: 'password-reset',
        description: 'Password reset request',
      },
      {
        type: 'password-changed',
        description: 'Password successfully changed',
      },
      {
        type: 'release-approved',
        description: 'Release approval notification',
      },
      {
        type: 'payment-received',
        description: 'Payment confirmation',
      },
      {
        type: 'withdrawal-confirmation',
        description: 'Withdrawal/payout confirmation',
      },
      {
        type: 'invoice',
        description: 'Billing invoice',
      },
      {
        type: 'inactive-account',
        description: '6-month inactivity reminder',
      },
      {
        type: 'suspicious-login',
        description: 'New location/IP login alert',
      },
    ],
    usage: {
      method: 'POST',
      endpoint: '/api/test/send-email',
      body: {
        type: 'welcome',
        email: 'test@example.com',
      },
      example: 'curl -X POST http://localhost:3000/api/test/send-email -H "Content-Type: application/json" -d \'{"type": "welcome", "email": "test@example.com"}\'',
    },
  })
}
