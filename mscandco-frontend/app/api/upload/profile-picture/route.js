import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

// Use service role for storage uploads

// Lazy initialization to avoid build-time errors
