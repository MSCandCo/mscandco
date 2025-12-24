/**
 * API: List All Users (App Router)
 * GET /api/admin/users/list
 *
 * EXACT COPY from staging but using App Router session
 */

import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { cachedJsonResponse, CACHE_HEADERS } from '@/lib/apiCache'

// Lazy initialization to avoid build-time errors
