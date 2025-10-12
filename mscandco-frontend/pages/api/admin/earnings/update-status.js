// Update earnings entry status API
import { createClient } from '@supabase/supabase-js';
import { requirePermission } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// req.user and req.userRole are automatically attached by middleware
async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      entry_id,
      status,
      payment_date,
      notes
    } = req.body;

    // Validation
    if (!entry_id || !status) {
      return res.status(400).json({ 
        error: 'Missing required fields: entry_id, status' 
      });
    }

    const validStatuses = ['pending', 'processing', 'paid', 'held', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status. Valid statuses: ${validStatuses.join(', ')}` 
      });
    }

    console.log(`💰 Updating earnings entry ${entry_id} to status: ${status}`);

    // Prepare update data
    const updateData = {
      status
    };

    // Add payment_date if status is 'paid' and date provided
    if (status === 'paid' && payment_date) {
      updateData.payment_date = payment_date;
    }

    // Add notes if provided
    if (notes) {
      updateData.notes = notes;
    }

    // Update earnings entry in earnings_log table
    const { data: updatedEntry, error: updateError } = await supabase
      .from('earnings_log')
      .update(updateData)
      .eq('id', entry_id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating earnings entry:', updateError);
      return res.status(500).json({ 
        error: 'Failed to update earnings entry', 
        details: updateError.message 
      });
    }

    console.log('✅ Earnings entry updated successfully:', updatedEntry.id);
    
    return res.json({
      success: true,
      message: 'Earnings entry status updated successfully',
      entry: updatedEntry
    });

  } catch (error) {
    console.error('❌ API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

// V2 Permission: Requires create permission for earnings management
export default requirePermission('finance:earnings_management:create')(handler);