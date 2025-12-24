import { Pool } from 'pg'

let pool = null

/**
 * Get a direct PostgreSQL connection pool
 * This bypasses Supabase JS client issues
 */
export function getPostgresPool() {
  if (pool) {
    return pool
  }

  // Supabase connection string format:
  // postgres://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const dbPassword = process.env.SUPABASE_DB_PASSWORD || process.env.DATABASE_PASSWORD

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  }

  // Extract project ref from URL (e.g., fzqpoayhdisusgrotyfg from https://fzqpoayhdisusgrotyfg.supabase.co)
  const projectRef = supabaseUrl.replace('https://', '').split('.')[0]

  // Build connection string
  const connectionString = process.env.DATABASE_URL ||
    `postgresql://postgres.${projectRef}:${dbPassword}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`

  pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  })

  return pool
}

/**
 * Execute a query directly on PostgreSQL
 */
export async function query(text, params) {
  const pool = getPostgresPool()
  return pool.query(text, params)
}

