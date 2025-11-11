# Remaining API Routes - Complete Implementation Guide

## Status: 21 Routes Pending

All routes follow the same pattern as the implemented copyright/carbon routes.
Each route includes authentication, Supabase integration, and error handling.

---

## COPYRIGHT ROUTES (3 remaining)

### 1. POST /api/grant-features/copyright/clearance/route.js
```javascript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const {
    verification_id,
    release_id,
    original_work_title,
    original_artist,
    clearance_type,
    license_holder,
    license_contact_email,
    license_agreement_url,
    percentage_used,
    notes
  } = body;

  const { data, error } = await supabase
    .from('copyright_clearances')
    .insert([{
      user_id: user.id,
      verification_id,
      release_id,
      original_work_title,
      original_artist,
      clearance_type,
      license_holder,
      license_contact_email,
      license_agreement_url,
      percentage_used,
      notes,
      clearance_status: 'pending'
    }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    clearance: data,
    message: 'Clearance submitted successfully'
  });
}
```

### 2. PUT /api/grant-features/copyright/clearance/[id]/route.js
```javascript
export async function PUT(request, { params }) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { clearance_status, admin_notes } = body;

  const { data, error } = await supabase
    .from('copyright_clearances')
    .update({
      clearance_status,
      admin_notes,
      updated_at: new Date().toISOString()
    })
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, clearance: data });
}
```

### 3. GET /api/grant-features/copyright/knowledge/route.js
```javascript
export async function GET(request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);

  const query = searchParams.get('q');
  const limit = parseInt(searchParams.get('limit') || '20');

  let dbQuery = supabase
    .from('copyright_knowledge_base')
    .select('*')
    .limit(limit);

  if (query) {
    dbQuery = dbQuery.or(`work_title.ilike.%${query}%,work_artist.ilike.%${query}%`);
  }

  const { data, error } = await dbQuery;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, results: data, count: data.length });
}
```

---

## CARBON ROUTES (3 remaining)

### 4. POST /api/grant-features/carbon/offset/route.js
```javascript
export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const {
    carbon_tracking_id,
    offset_provider,
    offset_amount_kg,
    offset_cost_amount,
    offset_project_name,
    offset_project_type,
    offset_project_location
  } = body;

  const { data, error } = await supabase
    .from('carbon_offset_transactions')
    .insert([{
      user_id: user.id,
      carbon_tracking_id,
      offset_provider,
      offset_amount_kg,
      offset_cost_amount,
      offset_cost_currency: 'GBP',
      offset_project_name,
      offset_project_type,
      offset_project_location,
      transaction_status: 'completed',
      verification_standard: 'Gold Standard'
    }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Update carbon tracking record
  if (carbon_tracking_id) {
    await supabase
      .from('carbon_footprint_tracking')
      .update({
        offset_purchased_kg: supabase.rpc('increment', {
          column: 'offset_purchased_kg',
          value: offset_amount_kg
        })
      })
      .eq('id', carbon_tracking_id);
  }

  return NextResponse.json({
    success: true,
    transaction: data,
    message: 'Carbon offset purchased successfully'
  });
}
```

### 5. GET /api/grant-features/carbon/profile/route.js
```javascript
export async function GET(request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('sustainability_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, profile: data });
}
```

### 6. PUT /api/grant-features/carbon/profile/route.js
```javascript
export async function PUT(request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from('sustainability_profiles')
    .upsert({
      user_id: user.id,
      ...body,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, profile: data });
}
```

---

## ACCESSIBILITY ROUTES (4 routes)

### 7. POST /api/grant-features/accessibility/generate/route.js
```javascript
export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { release_id, content_types, languages } = body;

  // In production, integrate with OpenAI Whisper + GPT-4
  // For now, create placeholder records

  const contentRecords = [];
  for (const contentType of content_types) {
    for (const language of languages) {
      contentRecords.push({
        release_id,
        user_id: user.id,
        content_type: contentType,
        language_code: language,
        generation_method: 'ai_generated',
        text_content: `AI-generated ${contentType} in ${language}`,
        is_verified: false
      });
    }
  }

  const { data, error } = await supabase
    .from('accessibility_content')
    .insert(contentRecords)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    generated: data.length,
    content: data,
    message: `Generated ${data.length} accessibility items`
  });
}
```

### 8-10. Similar pattern for GET content, GET compliance, POST request

---

## OPEN DATA ROUTES (5 routes)

### 11. GET /api/grant-features/open-data/metrics/route.js
```javascript
export async function GET(request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);

  const category = searchParams.get('category');
  const limit = parseInt(searchParams.get('limit') || '50');

  let query = supabase
    .from('open_data_metrics')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (category) {
    query = query.eq('metric_category', category);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, metrics: data, count: data.length });
}
```

### 12-15. Similar GET patterns for datasets, API keys, usage stats, access requests

---

## SKILLS DEVELOPMENT ROUTES (8 routes)

### 16. GET /api/grant-features/skills/modules/route.js
```javascript
export async function GET(request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);

  const category = searchParams.get('category');
  const difficulty = searchParams.get('difficulty');

  let query = supabase
    .from('learning_modules')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (category) {
    query = query.eq('module_category', category);
  }

  if (difficulty) {
    query = query.eq('difficulty_level', difficulty);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, modules: data, count: data.length });
}
```

### 17. POST /api/grant-features/skills/enroll/route.js
```javascript
export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { module_id } = body;

  const { data, error } = await supabase
    .from('learning_enrollments')
    .insert([{
      user_id: user.id,
      module_id,
      enrollment_status: 'active',
      progress_percentage: 0
    }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    enrollment: data,
    message: 'Successfully enrolled in course'
  });
}
```

### 18-23. Similar patterns for progress, AI tutor, quizzes, certificates, profile

---

## IMPLEMENTATION PRIORITY

1. **HIGH PRIORITY** (Needed for demos):
   - Accessibility generate
   - Skills enroll
   - Open Data metrics

2. **MEDIUM PRIORITY** (Needed for full features):
   - Copyright clearance
   - Carbon offset purchase
   - Skills progress tracking

3. **LOW PRIORITY** (Nice to have):
   - API key management
   - Certificate generation
   - Dataset access requests

---

## TESTING COMMANDS

```bash
# Test each route after implementation
curl -X POST http://localhost:3013/api/grant-features/accessibility/generate \
  -H "Content-Type: application/json" \
  -d '{
    "release_id": "test-id",
    "content_types": ["audio_description"],
    "languages": ["en"]
  }'
```

---

## EXTERNAL API INTEGRATIONS NEEDED

1. **OpenAI** (Accessibility + Skills)
   - Whisper API for transcription
   - GPT-4 for content generation
   - Setup: Add `OPENAI_API_KEY` to `.env.local`

2. **Greenspark/Ecologi** (Carbon)
   - Carbon offset API
   - Setup: Add `GREENSPARK_API_KEY` to `.env.local`

3. **Google Cloud Translation** (Accessibility)
   - Multi-language support
   - Setup: Add `GOOGLE_TRANSLATE_API_KEY` to `.env.local`

---

## NEXT STEPS

1. Implement high-priority routes first
2. Test with real data
3. Add external API integrations
4. Deploy to staging
5. Complete E2E testing
