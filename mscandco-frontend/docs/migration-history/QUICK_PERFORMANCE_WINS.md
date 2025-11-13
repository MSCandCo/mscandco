# Quick Performance Wins - Reference Card 🚀

## ✅ What's Already Done (Today)

1. **React Query Caching** - API responses cached automatically
2. **Font Optimization** - No more flash of invisible text
3. **Image Optimization** - Modern formats (AVIF/WebP) enabled
4. **Bundle Optimization** - Large packages tree-shaken
5. **Compression** - Gzip enabled for all responses
6. **Bundle Analyzer** - Run with `ANALYZE=true npm run build`

**Expected Impact**: 2-3x faster load times 🎉

---

## 🎯 Do These Next (Highest ROI)

### 1. Replace `<img>` with Next.js `<Image>` (30 min)
```javascript
// ❌ SLOW
<img src="/logo.png" alt="Logo" />

// ✅ FAST (50-70% smaller files)
import Image from 'next/image'
<Image src="/logo.png" alt="Logo" width={200} height={50} />
```

### 2. Use React Query Instead of useEffect (15 min per component)
```javascript
// ❌ SLOW (No caching, re-fetches every render)
const [data, setData] = useState([])
useEffect(() => {
  fetch('/api/artists').then(r => r.json()).then(setData)
}, [])

// ✅ FAST (Cached, instant subsequent loads)
import { useQuery } from '@tanstack/react-query'
const { data } = useQuery({
  queryKey: ['artists'],
  queryFn: async () => {
    const res = await fetch('/api/artists')
    return res.json()
  },
})
```

### 3. Add Loading States (10 min per route)
```javascript
// app/artists/loading.js
export default function Loading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    </div>
  )
}
```

### 4. Lazy Load Heavy Components (20 min)
```javascript
// ❌ SLOW (Loads chart library for everyone)
import Chart from 'react-chartjs-2'

// ✅ FAST (Only loads when needed - 40% smaller bundle)
import dynamic from 'next/dynamic'
const Chart = dynamic(() => import('react-chartjs-2'), {
  loading: () => <div>Loading...</div>,
  ssr: false,
})
```

### 5. Optimize Supabase Queries (5 min per query)
```javascript
// ❌ SLOW (Fetches all columns)
supabase.from('artists').select('*')

// ✅ FAST (50-70% smaller payloads)
supabase
  .from('artists')
  .select('id, name, avatar_url')
  .limit(50)
```

---

## 🚀 Commands

```bash
# Run bundle analyzer
ANALYZE=true npm run build

# Test performance
lighthouse http://localhost:3013 --view

# Dev mode
npm run dev
```

---

## 🎯 Performance Targets

- **Lighthouse Score**: 85-95 (currently: run audit)
- **First Paint**: < 1.8s
- **Load Time**: < 2.5s
- **Time to Interactive**: < 3.8s

---

## 📚 Full Guide

See `PERFORMANCE_OPTIMIZATION_GUIDE.md` for detailed instructions and examples.

---

**Quick Start**: Do items 1-3 first for biggest impact! 💪
