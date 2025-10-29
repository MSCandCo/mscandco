// Email template loader and variable replacement for Supabase Edge Function

/**
 * Load email template from the templates directory
 * In Edge Functions, we need to bundle templates or fetch them from storage
 * For now, we'll load them from a URL or inline them
 */
export async function loadEmailTemplate(templateName: string): Promise<string> {
  try {
    // Load from Supabase Storage (best practice for static assets)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://fzqpoayhdisusgrotyfg.supabase.co'
    const storageUrl = `${supabaseUrl}/storage/v1/object/public/email-templates/email-templates/${templateName}.html`

    const response = await fetch(storageUrl)

    if (!response.ok) {
      throw new Error(`Failed to load template: ${templateName} (HTTP ${response.status})`)
    }

    return await response.text()
  } catch (error) {
    console.error(`Error loading template ${templateName}:`, error)
    throw new Error(`Template ${templateName} not found`)
  }
}

/**
 * Replace template variables with actual data
 * Replaces {{ .VariableName }} patterns with data values
 */
export function replaceTemplateVariables(
  template: string,
  data: Record<string, string>
): string {
  let processed = template

  // Get app URL from environment
  const appUrl = Deno.env.get('APP_URL') || 'http://localhost:3013'

  // Add default URLs if not provided
  const defaultData = {
    DashboardURL: `${appUrl}/dashboard`,
    LoginURL: `${appUrl}/login`,
    SecurityURL: `${appUrl}/artist/settings`,
    SecureAccountURL: `${appUrl}/artist/settings`,
    ChangePasswordURL: `${appUrl}/artist/settings`,
    ReleaseURL: `${appUrl}/artist/releases`,
    TransactionHistoryURL: `${appUrl}/artist/billing`,
    PaymentURL: `${appUrl}/artist/billing`,
    DownloadURL: '#',
    ...data
  }

  // Replace all {{ .VariableName }} patterns
  Object.keys(defaultData).forEach(key => {
    const regex = new RegExp(`\\{\\{\\s*\\.${key}\\s*\\}\\}`, 'g')
    processed = processed.replace(regex, defaultData[key] || '')
  })

  // Also handle lowercase versions for compatibility
  Object.keys(defaultData).forEach(key => {
    const lowerKey = key.charAt(0).toLowerCase() + key.slice(1)
    const regex = new RegExp(`\\{\\{\\s*\\.${lowerKey}\\s*\\}\\}`, 'g')
    processed = processed.replace(regex, defaultData[key] || '')
  })

  return processed
}

/**
 * Get default data for testing
 */
export function getDefaultTestData(emailType: string): Record<string, string> {
  const appUrl = Deno.env.get('APP_URL') || 'http://localhost:3013'

  const defaults: Record<string, Record<string, string>> = {
    'welcome': {
      UserName: 'John Doe',
      DashboardURL: `${appUrl}/dashboard`,
    },
    'password-changed': {
      ChangeDate: new Date().toLocaleDateString(),
      ChangeTime: new Date().toLocaleTimeString(),
      Location: 'San Francisco, CA, USA',
      SecurityURL: `${appUrl}/artist/settings`,
    },
    'release-approved': {
      ReleaseName: 'Summer Vibes',
      ArtistName: 'Test Artist',
      ReleaseDate: 'December 15, 2025',
      ReleaseType: 'Single',
      TrackCount: '1',
      UPC: '123456789012',
      ReleaseURL: `${appUrl}/artist/releases`,
    },
    'payment-received': {
      Amount: '$49.99',
      Currency: 'USD',
      TransactionID: 'TXN-2025-001234',
      PaymentDate: new Date().toLocaleDateString(),
      PaymentMethod: 'Credit Card',
      Description: 'Subscription Payment',
      DashboardURL: `${appUrl}/artist/billing`,
    },
    'withdrawal-confirmation': {
      Amount: '$1,234.56',
      Currency: 'USD',
      ReferenceNumber: 'WD-2025-001234',
      RequestDate: new Date().toLocaleDateString(),
      ProcessingDate: new Date().toLocaleDateString(),
      DestinationAccount: 'Bank Account ****1234',
      PaymentMethod: 'Bank Transfer',
      EstimatedArrival: '3-5 business days',
      ProcessingDays: '3-5 business days',
      TransactionHistoryURL: `${appUrl}/artist/billing`,
    },
    'invoice': {
      ClientName: 'John Doe',
      ClientEmail: 'test@example.com',
      ClientAddress: '123 Music St, Los Angeles, CA 90001',
      InvoiceNumber: 'INV-2025-001234',
      InvoiceDate: new Date().toLocaleDateString(),
      DueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      Status: 'Pending',
      ItemName: 'Distribution Service',
      ItemDescription: 'Monthly distribution subscription',
      Quantity: '1',
      Rate: '$49.99',
      ItemTotal: '$49.99',
      Subtotal: '$49.99',
      TaxRate: '10',
      Tax: '$5.00',
      Total: '$54.99',
      PaymentTerms: '30 days',
      PaymentURL: `${appUrl}/artist/billing`,
      DownloadURL: '#',
    },
    'inactive-account': {
      UserName: 'John Doe',
      LoginURL: `${appUrl}/login`,
    },
    'suspicious-login': {
      LoginDate: new Date().toLocaleDateString(),
      LoginTime: new Date().toLocaleTimeString(),
      Location: 'Tokyo, Japan',
      Device: 'Desktop',
      Browser: 'Chrome',
      IPAddress: '203.0.113.42',
      SecureAccountURL: `${appUrl}/artist/settings`,
      ChangePasswordURL: `${appUrl}/artist/settings`,
    },
  }

  return defaults[emailType] || {}
}
