import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'
import { requireAuth } from '@/lib/rbac/middleware'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // req.user and req.userRole are automatically attached by middleware
    const user = req.user;
    const userId = user.id;

    const { page = 1, limit = 10 } = req.query

    // Get user's transaction history from wallet_transactions table
    // Note: This table might not exist yet, so we'll handle the error gracefully
    const { data: transactions, error, count } = await supabase
      .from('wallet_transactions')
      .select('id, transaction_type, amount, description, processed, created_at, metadata, notes', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (error) {
      // If table doesn't exist, return empty array
      if (error.code === '42P01') { // relation does not exist
        return res.status(200).json({
          success: true,
          data: [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0,
            pages: 0
          }
        })
      }
      throw error
    }

    // Format transactions for frontend
    const formattedTransactions = (transactions || []).map(transaction => {
      const createdAt = new Date(transaction.created_at);
      
      // Format date as YYYY-MM-DD
      const dateOnly = createdAt.toISOString().split('T')[0];
      
      // Format time as HH:MM with timezone
      const timeOnly = createdAt.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });
      
      return {
        id: transaction.id,
        type: transaction.transaction_type,
        amount: transaction.amount,
        description: transaction.description || transaction.notes || 'Transaction',
        date: dateOnly,
        time: timeOnly,
        fullDate: transaction.created_at, // Keep original for sorting if needed
        status: transaction.processed ? 'completed' : 'pending',
        metadata: transaction.metadata
      };
    });

    res.status(200).json({
      success: true,
      data: formattedTransactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Transaction history error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    })
  }
}

export default requireAuth()(handler);