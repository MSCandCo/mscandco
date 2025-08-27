import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    // Check if user is Super Admin or Company Admin
    const adminRole = user.user_metadata?.role
    if (!['super_admin', 'company_admin'].includes(adminRole)) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const { 
      targetUserId, 
      amount, 
      currency = 'GBP', 
      description, 
      type = 'admin_adjustment',
      operation = 'add', // 'add' or 'subtract'
      allowNegative = false,
      negativeLimit = null
    } = req.body

    // Validate input
    if (!targetUserId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid target user ID and positive amount are required' })
    }

    if (!['add', 'subtract'].includes(operation)) {
      return res.status(400).json({ error: 'Operation must be "add" or "subtract"' })
    }

    // Verify target user exists
    const { data: targetUser, error: targetUserError } = await supabase
      .from('user_profiles')
      .select('id, email, first_name, last_name, artist_name')
      .eq('id', targetUserId)
      .single()

    if (targetUserError || !targetUser) {
      return res.status(404).json({ error: 'Target user not found' })
    }

    // Start a transaction to update both wallet balance and create transaction record
    const { data: currentProfile } = await supabase
      .from('user_profiles')
      .select('wallet_balance, negative_balance_allowed, wallet_credit_limit')
      .eq('id', targetUserId)
      .single()

    const currentBalance = currentProfile?.wallet_balance || 0
    const adjustmentAmount = operation === 'add' ? parseFloat(amount) : -parseFloat(amount)
    const newBalance = currentBalance + adjustmentAmount

    // Check negative balance constraints
    if (newBalance < 0) {
      const currentNegativeAllowed = currentProfile?.negative_balance_allowed || false
      const currentCreditLimit = currentProfile?.wallet_credit_limit || 0
      
      if (!allowNegative && !currentNegativeAllowed) {
        return res.status(400).json({ 
          error: 'Operation would result in negative balance',
          details: `Current balance: ${currentBalance}, Attempted adjustment: ${adjustmentAmount}, Resulting balance: ${newBalance}`,
          suggestion: 'Enable negative balance allowance or reduce the amount'
        })
      }
      
      // Check credit limit if negative balance is allowed
      if ((allowNegative || currentNegativeAllowed) && negativeLimit !== null) {
        const creditLimit = parseFloat(negativeLimit)
        if (Math.abs(newBalance) > creditLimit) {
          return res.status(400).json({ 
            error: 'Operation would exceed negative balance limit',
            details: `Resulting balance: ${newBalance}, Credit limit: ${creditLimit}`,
            suggestion: 'Increase credit limit or reduce the amount'
          })
        }
      }
    }

    // Prepare update object
    const updateData = { 
      wallet_balance: newBalance,
      updated_at: new Date().toISOString()
    }

    // Update negative balance settings if provided
    if (allowNegative !== undefined) {
      updateData.negative_balance_allowed = allowNegative
    }
    if (negativeLimit !== null && negativeLimit !== undefined) {
      updateData.wallet_credit_limit = parseFloat(negativeLimit)
    }

    // Update user's wallet balance and settings
    const { error: balanceUpdateError } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', targetUserId)

    if (balanceUpdateError) {
      console.error('Error updating wallet balance:', balanceUpdateError)
      return res.status(500).json({ error: 'Failed to update wallet balance' })
    }

    // Create wallet transaction record using the correct schema
    const { data: transaction, error: transactionError } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: targetUserId,
        transaction_type: 'commission', // Use existing enum value
        amount: adjustmentAmount, // Use the signed amount (positive for add, negative for subtract)
        currency: currency,
        description: description || `Admin ${operation} by ${user.email}`,
        balance_before: currentBalance,
        balance_after: newBalance,
        source_type: 'admin',
        platform: 'admin_panel',
        processed: true,
        processed_at: new Date().toISOString(),
        processed_by_user_id: user.id,
        metadata: {
          admin_id: user.id,
          admin_email: user.email,
          admin_role: adminRole,
          target_user_email: targetUser.email,
          target_user_name: targetUser.artist_name || `${targetUser.first_name} ${targetUser.last_name}`.trim(),
          operation: operation,
          original_amount: parseFloat(amount),
          negative_balance_allowed: updateData.negative_balance_allowed,
          wallet_credit_limit: updateData.wallet_credit_limit
        },
        notes: `Admin wallet ${operation} operation`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (transactionError) {
      console.error('Error creating wallet transaction:', transactionError)
      // Try to rollback the balance update
      await supabase
        .from('user_profiles')
        .update({ wallet_balance: currentBalance })
        .eq('id', targetUserId)
      return res.status(500).json({ error: 'Failed to create wallet transaction' })
    }

    console.log(`💰 Admin ${user.email} ${operation}ed ${currency} ${amount} ${operation === 'add' ? 'to' : 'from'} ${targetUser.email} wallet`)

    res.status(200).json({
      success: true,
      message: `Wallet ${operation === 'add' ? 'topped up' : 'debited'} successfully`,
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        currency: transaction.currency,
        description: transaction.description,
        transaction_type: transaction.transaction_type,
        balance_before: transaction.balance_before,
        balance_after: transaction.balance_after,
        created_at: transaction.created_at
      },
      targetUser: {
        id: targetUser.id,
        email: targetUser.email,
        name: targetUser.artist_name || `${targetUser.first_name} ${targetUser.last_name}`.trim()
      },
      walletUpdate: {
        previousBalance: currentBalance,
        newBalance: newBalance,
        operation: operation,
        adjustmentAmount: adjustmentAmount,
        negativeBalanceAllowed: updateData.negative_balance_allowed,
        walletCreditLimit: updateData.wallet_credit_limit
      }
    })

  } catch (error) {
    console.error('Wallet top-up error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to process wallet top-up'
    })
  }
}
