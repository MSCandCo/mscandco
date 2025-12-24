/**
 * Notification utilities for MSC & Co
 * Handles creating and sending notifications to users
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Create a notification for a user
 * @param {string} userId - The user ID to send notification to
 * @param {string} type - Notification type (invitation, payment, release, etc)
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {object} metadata - Additional metadata
 * @returns {Promise<object>} - The created notification
 */
export async function createNotification(userId, type, title, message, metadata = {}) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        metadata,
        read: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createNotification:', error);
    return null;
  }
}

/**
 * Send an invitation notification
 * @param {string} userId - The user ID to send invitation to
 * @param {string} invitedBy - Name of person who sent the invitation
 * @param {string} organizationName - Name of the organization
 * @returns {Promise<object>}
 */
export async function sendInvitationNotification(userId, invitedBy, organizationName) {
  return createNotification(
    userId,
    'invitation',
    'New Invitation',
    `You have been invited to join ${organizationName} by ${invitedBy}`,
    { invitedBy, organizationName }
  );
}
