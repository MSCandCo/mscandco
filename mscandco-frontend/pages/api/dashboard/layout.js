/**
 * Dashboard Layout API
 * POST /api/dashboard/layout - Save user's custom layout
 * DELETE /api/dashboard/layout - Reset to role defaults
 */

import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  const { user } = req;

  if (req.method === 'POST') {
    return await saveLayout(req, res, user);
  } else if (req.method === 'DELETE') {
    return await resetLayout(req, res, user);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function saveLayout(req, res, user) {
  const { layout } = req.body;

  if (!layout || !Array.isArray(layout)) {
    return res.status(400).json({ error: 'Invalid layout data' });
  }

  try {
    // Delete existing user layout
    const { error: deleteError } = await supabase
      .from('user_dashboard_layouts')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) throw deleteError;

    // Insert new layout
    const layoutData = layout.map((item, index) => ({
      user_id: user.id,
      widget_id: item.widget_id || item.widget.id,
      grid_column_span: item.grid_column_span,
      grid_row: item.grid_row,
      display_order: index,
      is_visible: item.is_visible !== undefined ? item.is_visible : true
    }));

    const { error: insertError } = await supabase
      .from('user_dashboard_layouts')
      .insert(layoutData);

    if (insertError) throw insertError;

    return res.status(200).json({
      success: true,
      message: 'Layout saved successfully'
    });

  } catch (error) {
    console.error('Error saving dashboard layout:', error);
    return res.status(500).json({ error: 'Failed to save dashboard layout' });
  }
}

async function resetLayout(req, res, user) {
  try {
    // Delete all user's custom layout entries
    const { error } = await supabase
      .from('user_dashboard_layouts')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: 'Layout reset to defaults'
    });

  } catch (error) {
    console.error('Error resetting dashboard layout:', error);
    return res.status(500).json({ error: 'Failed to reset dashboard layout' });
  }
}

export default requireAuth(handler);
