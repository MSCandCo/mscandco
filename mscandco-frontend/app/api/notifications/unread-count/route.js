/**
 * API: Unread Notification Count (App Router)
 * GET /api/notifications/unread-count - Get count of unread notifications for authenticated user
 */

import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'


// Lazy initialization to avoid build-time errors

