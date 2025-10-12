import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  // req.user and req.userRole are automatically attached by middleware
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { artistEmail, amount, currency = 'GBP', description, releaseTitle, period } = req.body;

    if (!artistEmail || !amount || !description) {
      return res.status(400).json({ 
        error: 'Missing required fields: artistEmail, amount, description' 
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    const reporterId = req.user.id;
    const reporterEmail = req.user.email?.toLowerCase() || '';

    const { data: artistUser, error: artistError } = await supabase
      .from('auth.users')
      .select('id, email')
      .eq('email', artistEmail.toLowerCase())
      .single();

    if (artistError || !artistUser) {
      return res.status(404).json({ 
        error: 'Artist not found. Please check the email address.' 
      });
    }

    const { data: revenueReport, error: reportError } = await supabase
      .from('revenue_reports')
      .insert({
        reporter_user_id: reporterId,
        reporter_email: reporterEmail,
        artist_user_id: artistUser.id,
        artist_email: artistEmail.toLowerCase(),
        amount: parseFloat(amount),
        currency,
        description,
        release_title: releaseTitle || null,
        reporting_period: period || null,
        status: 'pending_approval',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (reportError) {
      console.error('Error creating revenue report:', reportError);
      return res.status(500).json({ 
        error: 'Failed to create revenue report',
        details: reportError.message 
      });
    }

    console.log('Revenue report created:', {
      reportId: revenueReport.id,
      artistEmail,
      amount: `${currency} ${amount}`
    });

    res.json({
      success: true,
      message: 'Revenue report submitted successfully and is pending approval',
      report: {
        id: revenueReport.id,
        artistEmail,
        amount,
        currency,
        description,
        releaseTitle,
        status: 'pending_approval',
        createdAt: revenueReport.created_at
      }
    });

  } catch (error) {
    console.error('Revenue reporting failed:', error);
    res.status(500).json({ 
      error: 'Revenue reporting failed', 
      details: error.message 
    });
  }
}

export default requireAuth(handler)