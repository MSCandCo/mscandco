// Get latest release for artist - PUBLIC ENDPOINT
// This endpoint is intentionally public for artist widgets/embeds
// Rate limited to prevent abuse
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Simple in-memory rate limiter (10 requests per minute per IP)
const rateLimitMap = new Map();
const RATE_LIMIT = 10; // requests
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(ip) || [];

  // Filter out requests outside the current window
  const recentRequests = userRequests.filter(time => now - time < RATE_WINDOW);

  if (recentRequests.length >= RATE_LIMIT) {
    return false; // Rate limit exceeded
  }

  // Add current request
  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);

  // Cleanup old entries periodically
  if (Math.random() < 0.01) { // 1% chance
    for (const [key, times] of rateLimitMap.entries()) {
      const validTimes = times.filter(time => now - time < RATE_WINDOW);
      if (validTimes.length === 0) {
        rateLimitMap.delete(key);
      } else {
        rateLimitMap.set(key, validTimes);
      }
    }
  }

  return true;
}

export default async function handler(req, res) {
  try {
    // SECURITY: Rate limiting (10 req/min per IP)
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0] ||
                     req.headers['x-real-ip'] ||
                     req.socket.remoteAddress ||
                     'unknown';

    if (!checkRateLimit(clientIp)) {
      console.warn('⚠️ Rate limit exceeded for IP:', clientIp);
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: 60
      });
    }

    const { artistId } = req.query;

    if (!artistId) {
      return res.status(400).json({ error: 'Artist ID required' });
    }

    if (req.method === 'GET') {
      console.log('📊 Fetching latest release for artist:', artistId, 'from IP:', clientIp);

      // SECURITY: Only select public fields to prevent data leakage
      const { data: release, error } = await supabase
        .from('releases')
        .select('id, title, artist, featuring, release_date, release_type, cover_image_url, audio_file_url, platforms')
        .eq('artist_id', artistId)
        .eq('is_live', true)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found is ok
        console.error('❌ Database error:', error);
        return res.status(500).json({ error: 'Database error', details: error.message });
      }

      console.log('📦 Latest release:', release ? `Found: ${release.title}` : 'Not found');

      return res.json({
        success: true,
        data: release || null
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Latest release API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
