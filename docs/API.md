# AudioStems API Documentation 🎵

## 📋 Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Strapi API](#strapi-api)
- [AI Services API](#ai-services-api)
- [Frontend API Routes](#frontend-api-routes)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Examples](#examples)

## 🌐 Overview

AudioStems provides a comprehensive API ecosystem with multiple services:

- **Strapi Backend** - Content management and core business logic
- **AI Services** - Music analysis and recommendations
- **Frontend API Routes** - Next.js API routes for client-side logic

### Base URLs

- **Development**: `http://localhost:1337`
- **Staging**: `https://api-staging.audiostems.com`
- **Production**: `https://api.audiostems.com`

## 🔐 Authentication

### JWT Authentication

```bash
# Login
POST /api/auth/local
{
  "identifier": "user@example.com",
  "password": "password123"
}

# Response
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "user@example.com",
    "email": "user@example.com",
    "role": {
      "id": 1,
      "name": "Authenticated",
      "description": "Default role given to authenticated user.",
      "type": "authenticated"
    }
  }
}
```

### API Token Authentication

```bash
# Include in headers
Authorization: Bearer YOUR_API_TOKEN
```

### OAuth2 (Google, GitHub)

```bash
# Google OAuth
GET /api/auth/google

# GitHub OAuth
GET /api/auth/github
```

## 🎵 Strapi API

### Content Types

#### Songs

```bash
# Get all songs
GET /api/songs?populate=*

# Get song by ID
GET /api/songs/1?populate=*

# Create song
POST /api/songs
{
  "data": {
    "title": "Amazing Song",
    "artist": "Great Artist",
    "genre": "Electronic",
    "bpm": 128,
    "key": "C",
    "duration": 180,
    "license": "commercial",
    "price": 29.99
  }
}

# Update song
PUT /api/songs/1
{
  "data": {
    "title": "Updated Song Title"
  }
}

# Delete song
DELETE /api/songs/1
```

#### Stems

```bash
# Get all stems
GET /api/stems?populate=*

# Get stem by ID
GET /api/stems/1?populate=*

# Create stem
POST /api/stems
{
  "data": {
    "title": "Drum Stem",
    "song": 1,
    "type": "drums",
    "file": "file_id",
    "waveform": "waveform_data"
  }
}
```

#### Artists

```bash
# Get all artists
GET /api/artists?populate=*

# Get artist by ID
GET /api/artists/1?populate=*

# Create artist
POST /api/artists
{
  "data": {
    "name": "Artist Name",
    "bio": "Artist biography",
    "avatar": "avatar_file_id"
  }
}
```

#### Users

```bash
# Get current user
GET /api/users/me

# Update user
PUT /api/users/me
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Music producer"
}

# Get user by ID (admin only)
GET /api/users/1
```

### Media Upload

```bash
# Upload file
POST /api/upload
Content-Type: multipart/form-data

# Response
{
  "id": 1,
  "name": "song.mp3",
  "alternativeText": null,
  "caption": null,
  "width": null,
  "height": null,
  "formats": {
    "thumbnail": {
      "name": "thumbnail_song.jpg",
      "hash": "thumbnail_song_123",
      "ext": ".jpg",
      "mime": "image/jpeg",
      "width": 245,
      "height": 138,
      "size": 8.43,
      "url": "/uploads/thumbnail_song_123.jpg"
    }
  },
  "hash": "song_123",
  "ext": ".mp3",
  "mime": "audio/mpeg",
  "size": 3.2,
  "url": "/uploads/song_123.mp3",
  "previewUrl": null,
  "provider": "local",
  "provider_metadata": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Search and Filtering

```bash
# Search songs
GET /api/songs?filters[title][$contains]=amazing

# Filter by genre
GET /api/songs?filters[genre][$eq]=Electronic

# Filter by BPM range
GET /api/songs?filters[bpm][$gte]=120&filters[bpm][$lte]=140

# Sort by price
GET /api/songs?sort=price:asc

# Pagination
GET /api/songs?pagination[page]=1&pagination[pageSize]=10

# Populate relations
GET /api/songs?populate[artist]=*&populate[stems]=*
```

## 🤖 AI Services API

### Base URL

- **Development**: `http://localhost:8000`
- **Production**: `https://ai.audiostems.com`

### Audio Analysis

```bash
# Analyze audio file
POST /api/analyze
{
  "file_id": "track_123",
  "audio_url": "https://example.com/audio.mp3",
  "analysis_type": "full"
}

# Response
{
  "file_id": "track_123",
  "analysis": {
    "genre": "Electronic",
    "mood": "Energetic",
    "bpm": 128,
    "key": "C",
    "energy": 0.85,
    "danceability": 0.72,
    "valence": 0.68,
    "acousticness": 0.12,
    "instrumentalness": 0.95,
    "loudness": -8.5,
    "tempo": 128.0,
    "duration": 180.5,
    "waveform": "base64_encoded_waveform_data",
    "spectrogram": "base64_encoded_spectrogram_data"
  },
  "confidence": 0.92,
  "processing_time": 2.3
}
```

### Music Recommendations

```bash
# Get recommendations
POST /api/recommendations
{
  "file_id": "track_123",
  "num_recommendations": 10,
  "filters": {
    "genre": "Electronic",
    "bpm_min": 120,
    "bpm_max": 140,
    "mood": "Energetic",
    "max_price": 50.0
  }
}

# Response
{
  "recommendations": [
    {
      "track_id": "track_456",
      "title": "Recommended Track",
      "artist": "Great Artist",
      "similarity_score": 0.89,
      "reason": "Similar BPM and genre",
      "price": 29.99
    }
  ],
  "total_recommendations": 10,
  "processing_time": 1.2
}
```

### Content Tagging

```bash
# Auto-tag content
POST /api/tag
{
  "file_id": "track_123",
  "audio_url": "https://example.com/audio.mp3",
  "tagging_type": "comprehensive"
}

# Response
{
  "file_id": "track_123",
  "tags": {
    "genres": ["Electronic", "House", "Progressive"],
    "moods": ["Energetic", "Uplifting", "Dance"],
    "instruments": ["Synthesizer", "Drum Machine", "Bass"],
    "tempo": ["Medium", "Fast"],
    "energy": ["High"],
    "use_cases": ["Commercial", "Background", "Dance"],
    "similar_artists": ["Daft Punk", "Calvin Harris", "David Guetta"]
  },
  "confidence": 0.94,
  "processing_time": 3.1
}
```

### Trending Analysis

```bash
# Get trending content
GET /api/trending?timeframe=week&limit=20

# Response
{
  "trending": [
    {
      "track_id": "track_789",
      "title": "Trending Track",
      "artist": "Popular Artist",
      "trend_score": 0.95,
      "trending_factors": ["viral_social", "high_engagement", "cross_platform"],
      "growth_rate": 0.23
    }
  ],
  "timeframe": "week",
  "total_trending": 20
}
```

## 🎨 Frontend API Routes

### Authentication Routes

```bash
# NextAuth.js configuration
GET /api/auth/[...nextauth]

# Custom auth endpoints
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/session
```

### Proxy Routes

```bash
# Proxy to backend API
GET /api/req/songs
POST /api/req/songs
PUT /api/req/songs/1
DELETE /api/req/songs/1

# Proxy to AI services
POST /api/req/analyze
POST /api/req/recommendations
```

### Custom Routes

```bash
# Health check
GET /api/health

# Search endpoint
GET /api/search?q=electronic&genre=house

# Analytics
GET /api/analytics/user-activity
POST /api/analytics/track-event

# Downloads
POST /api/downloads/track
GET /api/downloads/history

# Playlists
GET /api/playlists
POST /api/playlists
PUT /api/playlists/1
DELETE /api/playlists/1
```

## ⚠️ Error Handling

### Standard Error Format

```json
{
  "error": {
    "status": 400,
    "name": "BadRequestError",
    "message": "Invalid request parameters",
    "details": {
      "field": "title",
      "issue": "Title is required"
    }
  }
}
```

### Common Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

### Validation Errors

```json
{
  "error": {
    "status": 422,
    "name": "ValidationError",
    "message": "Validation failed",
    "details": [
      {
        "path": ["title"],
        "message": "Title is required"
      },
      {
        "path": ["price"],
        "message": "Price must be a positive number"
      }
    ]
  }
}
```

## 🚦 Rate Limiting

### Limits

- **Anonymous**: 100 requests/hour
- **Authenticated**: 1000 requests/hour
- **Premium**: 5000 requests/hour
- **Enterprise**: 10000 requests/hour

### Headers

```bash
# Rate limit headers
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

### Rate Limit Exceeded

```json
{
  "error": {
    "status": 429,
    "name": "TooManyRequestsError",
    "message": "Rate limit exceeded",
    "retryAfter": 3600
  }
}
```

## 📝 Examples

### Complete Song Upload Flow

```javascript
// 1. Upload audio file
const uploadResponse = await fetch('/api/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const { id: fileId } = await uploadResponse.json();

// 2. Analyze audio
const analysisResponse = await fetch('/api/req/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    file_id: fileId,
    audio_url: `/uploads/${fileId}.mp3`
  })
});

const analysis = await analysisResponse.json();

// 3. Create song record
const songResponse = await fetch('/api/req/songs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    data: {
      title: 'My Amazing Song',
      artist: 'My Artist Name',
      genre: analysis.analysis.genre,
      bpm: analysis.analysis.bpm,
      key: analysis.analysis.key,
      duration: analysis.analysis.duration,
      file: fileId,
      waveform: analysis.analysis.waveform
    }
  })
});

const song = await songResponse.json();
```

### Search and Filter Example

```javascript
// Search with filters
const searchParams = new URLSearchParams({
  'filters[title][$contains]': 'electronic',
  'filters[genre][$eq]': 'House',
  'filters[bpm][$gte]': '120',
  'filters[bpm][$lte]': '140',
  'filters[price][$lte]': '50',
  'sort': 'createdAt:desc',
  'pagination[page]': '1',
  'pagination[pageSize]': '20',
  'populate[artist]': '*',
  'populate[stems]': '*'
});

const response = await fetch(`/api/req/songs?${searchParams}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { data: songs, meta } = await response.json();
```

### AI Recommendations Example

```javascript
// Get recommendations based on current track
const recommendationsResponse = await fetch('/api/req/recommendations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    file_id: currentTrackId,
    num_recommendations: 10,
    filters: {
      genre: currentTrack.genre,
      bpm_min: currentTrack.bpm - 10,
      bpm_max: currentTrack.bpm + 10,
      max_price: 50.0
    }
  })
});

const { recommendations } = await recommendationsResponse.json();
```

## 🔧 SDKs and Libraries

### JavaScript/TypeScript

```bash
npm install @audiostems/sdk
```

```javascript
import { AudioStemsAPI } from '@audiostems/sdk';

const api = new AudioStemsAPI({
  baseURL: 'https://api.audiostems.com',
  token: 'your-jwt-token'
});

// Search songs
const songs = await api.songs.search({
  query: 'electronic',
  genre: 'House',
  bpmRange: [120, 140]
});

// Get recommendations
const recommendations = await api.ai.getRecommendations({
  trackId: 'track_123',
  limit: 10
});
```

### Python

```bash
pip install audiostems-python
```

```python
from audiostems import AudioStemsAPI

api = AudioStemsAPI(
    base_url='https://api.audiostems.com',
    token='your-jwt-token'
)

# Search songs
songs = api.songs.search(
    query='electronic',
    genre='House',
    bpm_range=(120, 140)
)

# Analyze audio
analysis = api.ai.analyze_audio(
    file_id='track_123',
    audio_url='https://example.com/audio.mp3'
)
```

## 📚 Additional Resources

- [Strapi API Documentation](https://docs.strapi.io/dev-docs/api)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [OpenAPI Specification](https://swagger.io/specification/)

---

For support and questions, please contact us at api-support@audiostems.com 