# 🚀 Quick Reference - Enterprise Stack

## 📝 **Common Use Cases**

### **1. Track an Error**
```javascript
import { captureException } from '@/lib/monitoring/sentry'

try {
  await riskyOperation()
} catch (error) {
  captureException(error, {
    tags: { operation: 'riskyOperation' },
    extra: { userId: '123' }
  })
  throw error
}
```

### **2. Cache a Database Query**
```javascript
import { cacheQuery } from '@/lib/cache/redis'

const releases = await cacheQuery('releases', { userId }, async () => {
  return await query('SELECT * FROM releases WHERE user_id = $1', [userId])
}, 600) // 10 minutes
```

### **3. Track an Event**
```javascript
import { trackEvent } from '@/lib/analytics/posthog-client'

trackEvent('release_created', {
  release_id: '123',
  title: 'My Song',
  genre: 'Pop'
})
```

### **4. Trigger a Background Job**
```javascript
import { triggerAIJob } from '@/lib/jobs/inngest-client'

await triggerAIJob(userId, 'analyze-lyrics', {
  lyrics: 'Song lyrics here...',
  language: 'en'
})
```

### **5. Subscribe to Real-time Updates**
```javascript
import { subscribeToNotifications } from '@/lib/realtime/supabase-realtime'

const unsubscribe = subscribeToNotifications(userId, (notification) => {
  console.log('New notification:', notification)
  // Update UI
})

// Cleanup
return () => unsubscribe()
```

### **6. Rate Limit an API**
```javascript
import { rateLimit } from '@/lib/cache/redis'

const { allowed, remaining } = await rateLimit(userId, 100, 60)
if (!allowed) {
  return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
}
```

---

## 🔗 **Service Dashboards**

| Service | Dashboard URL |
|---------|---------------|
| Sentry | https://sentry.io/organizations/[your-org]/projects/[your-project]/ |
| Upstash | https://console.upstash.com |
| PostHog | https://app.posthog.com/project/[your-project] |
| Inngest | https://app.inngest.com |
| Vercel | https://vercel.com/[your-project] |
| Systems | http://localhost:3013/admin/systems |

---

## 🛠️ **Useful Commands**

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Generate random secret (for CRON_SECRET)
openssl rand -base64 32

# Check environment variables
cat .env.local

# View logs (Vercel)
vercel logs

# Trigger cron job manually (local)
curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/daily-analytics
```

---

## 📦 **Package Versions**

```json
{
  "@sentry/nextjs": "latest",
  "@upstash/redis": "latest",
  "posthog-js": "latest",
  "posthog-node": "latest",
  "inngest": "latest"
}
```

---

## 🔐 **Environment Variables (Checklist)**

```bash
# Supabase
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ SUPABASE_SERVICE_ROLE_KEY
✅ SUPABASE_DB_PASSWORD

# Sentry
✅ NEXT_PUBLIC_SENTRY_DSN
✅ SENTRY_ORG
✅ SENTRY_PROJECT
✅ SENTRY_AUTH_TOKEN

# Upstash Redis
✅ UPSTASH_REDIS_REST_URL
✅ UPSTASH_REDIS_REST_TOKEN

# PostHog
✅ NEXT_PUBLIC_POSTHOG_KEY
✅ NEXT_PUBLIC_POSTHOG_HOST

# Inngest
✅ INNGEST_EVENT_KEY
✅ INNGEST_SIGNING_KEY

# Vercel Cron
✅ CRON_SECRET
```

---

## 🐛 **Troubleshooting**

### **Sentry not capturing errors**
1. Check `NEXT_PUBLIC_SENTRY_DSN` is set
2. Verify auth token has `project:write` permission
3. Check browser console for Sentry initialization message
4. Test with: `throw new Error('Test error')`

### **Redis not caching**
1. Check `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
2. Verify Upstash dashboard shows database is active
3. Check console for "✅ Upstash Redis client initialized"
4. Test with: `await redis.ping()`

### **PostHog not tracking**
1. Check `NEXT_PUBLIC_POSTHOG_KEY` is set
2. Verify browser console shows "✅ PostHog initialized"
3. Check PostHog dashboard for events
4. Test with: `trackEvent('test_event', {})`

### **Inngest jobs not running**
1. Check `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY`
2. Verify `/api/inngest` endpoint is accessible
3. Check Inngest dashboard for job execution logs
4. Test with: `await triggerEmailJob(userId, 'test', {})`

### **Real-time not working**
1. Check Supabase Realtime is enabled in dashboard
2. Verify RLS policies allow subscriptions
3. Check browser console for "🔌 Subscribing to..."
4. Test with: `subscribeToNotifications(userId, console.log)`

---

## 📊 **Performance Monitoring**

### **Key Metrics to Watch**

| Metric | Target | Alert If |
|--------|--------|----------|
| Error Rate | < 0.1% | > 1% |
| Cache Hit Rate | > 80% | < 60% |
| API Response Time | < 200ms | > 1s |
| Job Success Rate | > 99% | < 95% |
| WebSocket Latency | < 100ms | > 500ms |

### **Where to Check**
- **Errors**: Sentry Dashboard
- **Cache**: Upstash Dashboard
- **API Performance**: Sentry Performance
- **Jobs**: Inngest Dashboard
- **Real-time**: Supabase Dashboard

---

## 🚨 **Emergency Procedures**

### **High Error Rate**
1. Check Sentry dashboard for error details
2. Identify affected users/features
3. Roll back deployment if needed
4. Fix issue and redeploy

### **Cache Failure**
1. Check Upstash dashboard for status
2. Verify environment variables
3. System will fallback to direct database queries
4. No immediate action needed (graceful degradation)

### **Job Queue Backlog**
1. Check Inngest dashboard for failed jobs
2. Identify failing job type
3. Fix underlying issue
4. Retry failed jobs from dashboard

### **Real-time Connection Issues**
1. Check Supabase status page
2. Verify RLS policies
3. System will auto-reconnect
4. Users can manually refresh

---

## 📞 **Support Resources**

- **Sentry Docs**: https://docs.sentry.io
- **Upstash Docs**: https://docs.upstash.com
- **PostHog Docs**: https://posthog.com/docs
- **Inngest Docs**: https://www.inngest.com/docs
- **Supabase Docs**: https://supabase.com/docs

---

**Keep this handy for quick reference! 📌**

