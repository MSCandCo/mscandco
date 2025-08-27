import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { status, limit = 50 } = req.query;

    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    let userInfo;
    try {
      userInfo = jwt.decode(token);
    } catch (jwtError) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const userId = userInfo?.sub;
    const userEmail = userInfo?.email?.toLowerCase() || '';

    if (!userId) {
      return res.status(401).json({ error: 'Invalid user token' });
    }

    const isCompanyAdmin = userEmail.includes('@mscandco.com') || 
                          userEmail === 'info@htay.co.uk' ||
                          userInfo?.user_metadata?.role === 'company_admin' ||
                          userInfo?.app_metadata?.role === 'company_admin' ||
                          userInfo?.user_metadata?.role === 'super_admin' ||
                          userInfo?.app_metadata?.role === 'super_admin';

    const isDistributionPartner = userEmail.includes('@codegroup.') || 
                                  userEmail.includes('@distributionpartner.') ||
                                  userInfo?.user_metadata?.role === 'distribution_partner' ||
                                  userInfo?.app_metadata?.role === 'distribution_partner';

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
