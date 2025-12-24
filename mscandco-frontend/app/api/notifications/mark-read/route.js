/**
 * API: Mark Notification as Read (App Router)
 * POST /api/notifications/mark-read - Mark a notification as read
 */

import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'


// Lazy initialization to avoid build-time errors
