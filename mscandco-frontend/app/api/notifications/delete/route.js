/**
 * API: Delete Notification (App Router)
 * DELETE /api/notifications/delete - Delete a notification
 */

import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'


// Lazy initialization to avoid build-time errors
