import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  // req.user and req.userRole are automatically attached by middleware
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { status, limit = 50 } = req.query;

    const userId = req.user.id;
    const userEmail = req.user.email?.toLowerCase() || '';
    const userRole = req.userRole;

    const isCompanyAdmin = ['company_admin', 'super_admin'].includes(userRole);
    const isDistributionPartner = userRole === 'distribution_partner';

    let query = supabase
      .from('revenue_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (isCompanyAdmin) {
      if (status) {
        query = query.eq('status', status);
      }
    } else if (isDistributionPartner) {
      query = query.eq('reporter_user_id', userId);
      if (status) {
        query = query.eq('status', status);
      }
    } else {
      query = query.eq('artist_user_id', userId);
      if (status) {
        query = query.eq('status', status);
      }
    }

    const { data: reports, error: reportsError } = await query;

    if (reportsError) {
      console.error('Error fetching revenue reports:', reportsError);
      return res.status(500).json({ 
        error: 'Failed to fetch revenue reports',
        details: reportsError.message 
      });
    }

    const summary = {
      total: reports.length,
      pending: reports.filter(r => r.status === 'pending_approval').length,
      approved: reports.filter(r => r.status === 'approved').length,
      rejected: reports.filter(r => r.status === 'rejected').length,
      totalAmount: reports
        .filter(r => r.status === 'approved')
        .reduce((sum, r) => sum + parseFloat(r.amount), 0)
    };

    res.json({
      success: true,
      reports: reports.map(report => ({
        id: report.id,
        reporterEmail: report.reporter_email,
        artistEmail: report.artist_email,
        amount: report.amount,
        currency: report.currency,
        description: report.description,
        releaseTitle: report.release_title,
        reportingPeriod: report.reporting_period,
        status: report.status,
        approverEmail: report.approver_email,
        approvalNotes: report.approval_notes,
        createdAt: report.created_at,
        approvedAt: report.approved_at
      })),
      summary,
      userRole: isCompanyAdmin ? 'admin' : isDistributionPartner ? 'distribution_partner' : 'artist'
    });

  } catch (error) {
    console.error('Revenue reports list failed:', error);
    res.status(500).json({ 
      error: 'Failed to fetch revenue reports', 
      details: error.message 
    });
  }
}

export default requireAuth(handler)