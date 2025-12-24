import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

import { createClient as createServerClient } from '@/lib/supabase/server'

// Lazy initialization to avoid build-time errors

