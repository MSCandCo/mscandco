/**
 * API: Wallet Management Stats (App Router)
 * GET /api/admin/walletmanagement/stats - Fetch wallet statistics
 */

import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'


// Lazy initialization to avoid build-time errors
