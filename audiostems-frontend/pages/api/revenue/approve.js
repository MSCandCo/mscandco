import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { reportId, action, notes } = req.body;

    if (!reportId || !action) {
      return res.status(400).json({ 
        error: 'Missing required fields: reportId, action' 
      });
    }

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ 
        error: 'Action must be either "approve" or "reject"' 
      });
    }

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

    const approverId = userInfo?.sub;
    const approverEmail = userInfo?.email?.toLowerCase() || '';

    if (!approverId) {
      return res.status(401).json({ error: 'Invalid user token' });
    }

    const isCompanyAdmin = approverEmail.includes('@mscandco.com') || 
                          approverEmail === 'info@htay.co.uk' ||
                          userInfo?.user_metadata?.role === 'company_admin' ||
                          userInfo?.app_metadata?.role === 'company_admin' ||
                          userInfo?.user_metadata?.role === 'super_admin' ||
                          userInfo?.app_metadata?.role === 'super_admin';

    if (!isCompanyAdmin) {
      return res.status(403).json({ 
        error: 'Access denied. Only Company Admin or Super Admin can approve revenue reports.' 
      });
    }

    const { data: report, error: reportError } = await supabase
      .from('revenue_reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (reportError || !report) {
      return res.status(404).json({ error: 'Revenue report not found' });
    }

    if (report.status !== 'pending_approval') {
      return res.status(400).json({ 
        error: `Revenue report is already ${report.status}` 
      });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const { error: updateError } = await supabase
      .from('revenue_reports')
      .update({
        status: newStatus,
        approver_user_id: approverId,
        approver_email: approverEmail,
        approval_notes: notes || null,
        approved_at: new Date().toISOString()
      })
      .eq('id', reportId);

    if (updateError) {
      console.error('Error updating revenue report:', updateError);
      return res.status(500).json({ 
        error: 'Failed to update revenue report',
        details: updateError.message 
      });
    }

    let walletResult = null;

    if (action === 'approve') {
      try {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('wallet_balance')
          .eq('user_id', report.artist_user_id)
          .single();

        const currentBalance = profile?.wallet_balance || 0;
        const newBalance = currentBalance + parseFloat(report.amount);

        const { error: walletError } = await supabase
          .from('user_profiles')
          .upsert({
            user_id: report.artist_user_id,
            wallet_balance: newBalance,
            updated_at: new Date().toISOString()
          });

        if (walletError) {
          throw walletError;
        }

        const { error: transactionError } = await supabase
          .from('wallet_transactions')
          .insert({
            user_id: report.artist_user_id,
            type: 'credit',
            amount: parseFloat(report.amount),
            description: `Revenue payment: ${report.description}`,
            order_reference: `revenue-${report.id}`,
            created_at: new Date().toISOString()
          });

        walletResult = {
          previousBalance: currentBalance,
          newBalance: newBalance,
          creditAmount: parseFloat(report.amount)
        };

        console.log('Artist wallet credited:', {
          artistEmail: report.artist_email,
          amount: `${report.currency} ${report.amount}`,
          newBalance: newBalance
        });

      } catch (walletError) {
        console.error('Wallet credit failed:', walletError);
        await supabase
          .from('revenue_reports')
          .update({
            status: 'approved_wallet_failed',
            approval_notes: `${notes || ''}\n\nWallet credit failed: ${walletError.message}`
          })
          .eq('id', reportId);

        return res.status(500).json({
          error: 'Report approved but wallet credit failed',
          details: walletError.message
        });
      }
    }

    console.log(`Revenue report ${action}:`, {
      reportId,
      artistEmail: report.artist_email,
      amount: `${report.currency} ${report.amount}`,
      approverEmail
    });

    res.json({
      success: true,
      message: `Revenue report ${action} successfully`,
      report: {
        id: report.id,
        artistEmail: report.artist_email,
        amount: report.amount,
        currency: report.currency,
        description: report.description,
        status: newStatus,
        approverEmail,
        approvedAt: new Date().toISOString(),
        notes
      },
      wallet: walletResult
    });

  } catch (error) {
    console.error('Revenue approval failed:', error);
    res.status(500).json({ 
      error: 'Revenue approval failed', 
      details: error.message 
    });
  }
}
