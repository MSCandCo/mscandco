/**
 * API: Notifications (App Router)
 * GET /api/notifications?type=... - Fetch notifications with optional type filter
 */

import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'


// Lazy initialization to avoid build-time errors
