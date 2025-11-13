# Integrating Grant Features into MCP Server

## Quick Integration Steps

### 1. Import the Grant Features Tools

Add this import at the top of `src/index.ts` (around line 56):

```typescript
import { GRANT_FEATURES_TOOLS } from "./grant-features-tools.js";
```

### 2. Add to Tools List

Find the `server.setRequestHandler(ListToolsRequestSchema` section (search for "ListToolsRequestSchema").

Add the grant features tools to the tools array:

```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    // ... existing tools ...

    // Add this at the end:
    ...GRANT_FEATURES_TOOLS
  ],
}));
```

### 3. Add Tool Handlers

Find the `server.setRequestHandler(CallToolRequestSchema` section.

Add these handlers in the switch statement:

```typescript
// Grant Features - Copyright Verification
case "verify_copyright": {
  const { release_id, audio_file_url, lyrics_text, composition_data } = args;
  const result = await makeAPIRequest("POST", "/api/grant-features/copyright/verify", {
    release_id,
    audio_file_url,
    lyrics_text,
    composition_data
  });
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
}

case "get_copyright_status": {
  const { release_id } = args;
  const result = await makeAPIRequest("GET", `/api/grant-features/copyright/verify?release_id=${release_id}`);
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
}

case "submit_copyright_clearance": {
  const result = await makeAPIRequest("POST", "/api/grant-features/copyright/clearance", args);
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
}

// Grant Features - Carbon Tracking
case "calculate_carbon_footprint": {
  const { release_id, period_start, period_end } = args;
  const result = await makeAPIRequest("POST", "/api/grant-features/carbon/calculate", {
    release_id,
    period_start,
    period_end
  });
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
}

case "get_carbon_data": {
  const { release_id } = args;
  const result = await makeAPIRequest("GET", `/api/grant-features/carbon/calculate?release_id=${release_id}`);
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
}

case "get_sustainability_profile": {
  const { user_id } = args;
  const url = user_id
    ? `/api/grant-features/carbon/profile?user_id=${user_id}`
    : "/api/grant-features/carbon/profile";
  const result = await makeAPIRequest("GET", url);
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
}

case "update_sustainability_settings": {
  const result = await makeAPIRequest("PUT", "/api/grant-features/carbon/profile", args);
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
}

case "purchase_carbon_offset": {
  const result = await makeAPIRequest("POST", "/api/grant-features/carbon/offset", args);
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
}

// Grant Features - Accessibility
case "generate_accessibility_content": {
  const result = await makeAPIRequest("POST", "/api/grant-features/accessibility/generate", args);
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
}

case "get_accessibility_content": {
  const { release_id, content_type, language_code } = args;
  let url = `/api/grant-features/accessibility/content?release_id=${release_id}`;
  if (content_type) url += `&content_type=${content_type}`;
  if (language_code) url += `&language_code=${language_code}`;
  const result = await makeAPIRequest("GET", url);
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
}

case "get_accessibility_compliance": {
  const { release_id } = args;
  const result = await makeAPIRequest("GET", `/api/grant-features/accessibility/compliance?release_id=${release_id}`);
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
}

case "request_accessibility_service": {
  const result = await makeAPIRequest("POST", "/api/grant-features/accessibility/request", args);
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
}

// Grant Features - Open Data
case "query_open_data_metrics": {
  const { period_type, period_start, period_end, region, genre } = args;
  let url = `/api/grant-features/open-data/metrics?period_type=${period_type}&period_start=${period_start}&period_end=${period_end}`;
  if (region) url += `&region=${region}`;
  if (genre) url += `&genre=${genre}`;
  const result = await makeAPIRequest("GET", url);
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
}

case "list_research_datasets": {
  const { access_level, dataset_type } = args;
  let url = "/api/grant-features/open-data/datasets";
  const params = [];
  if (access_level) params.push(`access_level=${access_level}`);
  if (dataset_type) params.push(`dataset_type=${dataset_type}`);
  if (params.length > 0) url += `?${params.join('&')}`;
  const result = await makeAPIRequest("GET", url);
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
}

case "request_dataset_access": {
  const result = await makeAPIRequest("POST", "/api/grant-features/open-data/dataset-access", args);
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
}

case "create_open_data_api_key": {
  const result = await makeAPIRequest("POST", "/api/grant-features/open-data/api-keys", args);
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
}

case "get_open_data_api_usage": {
  const { api_key_id } = args;
  const url = api_key_id
    ? `/api/grant-features/open-data/api-keys/${api_key_id}/usage`
    : "/api/grant-features/open-data/api-keys/usage";
  const result = await makeAPIRequest("GET", url);
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
}

// Grant Features - Skills Development
case "list_learning_modules": {
  const { category, difficulty_level, has_certificate } = args;
  let url = "/api/grant-features/skills/modules";
  const params = [];
  if (category) params.push(`category=${category}`);
  if (difficulty_level) params.push(`difficulty_level=${difficulty_level}`);
  if (has_certificate !== undefined) params.push(`has_certificate=${has_certificate}`);
  if (params.length > 0) url += `?${params.join('&')}`;
  const result = await makeAPIRequest("GET", url);
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
}

case "enroll_in_learning_module": {
  const result = await makeAPIRequest("POST", "/api/grant-features/skills/enroll", args);
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
}

case "get_learning_progress": {
  const { module_id } = args;
  const url = module_id
    ? `/api/grant-features/skills/progress?module_id=${module_id}`
    : "/api/grant-features/skills/progress";
  const result = await makeAPIRequest("GET", url);
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
}

case "update_lesson_completion": {
  const result = await makeAPIRequest("POST", "/api/grant-features/skills/progress", args);
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
}

case "chat_with_ai_tutor": {
  const result = await makeAPIRequest("POST", "/api/grant-features/skills/ai-tutor", args);
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
}

case "take_quiz": {
  const { quiz_id, answers } = args;
  if (answers) {
    // Submit quiz
    const result = await makeAPIRequest("POST", `/api/grant-features/skills/quiz/${quiz_id}/submit`, { answers });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  } else {
    // Get quiz
    const result = await makeAPIRequest("GET", `/api/grant-features/skills/quiz/${quiz_id}`);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
}

case "get_certificates": {
  const { user_id, is_public } = args;
  let url = "/api/grant-features/skills/certificates";
  const params = [];
  if (user_id) params.push(`user_id=${user_id}`);
  if (is_public !== undefined) params.push(`is_public=${is_public}`);
  if (params.length > 0) url += `?${params.join('&')}`;
  const result = await makeAPIRequest("GET", url);
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
}

case "generate_certificate_pdf": {
  const { certificate_id } = args;
  const result = await makeAPIRequest("POST", `/api/grant-features/skills/certificates/${certificate_id}/pdf`);
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
}

case "get_skill_profile": {
  const { user_id } = args;
  const url = user_id
    ? `/api/grant-features/skills/profile?user_id=${user_id}`
    : "/api/grant-features/skills/profile";
  const result = await makeAPIRequest("GET", url);
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
}

case "get_grant_features_stats": {
  const { feature_name } = args;
  const url = feature_name
    ? `/api/grant-features/stats?feature=${encodeURIComponent(feature_name)}`
    : "/api/grant-features/stats";
  const result = await makeAPIRequest("GET", url);
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
}
```

### 4. Build and Test

```bash
cd /Users/htay/Documents/MSC\ \&\ Co/msc-co-mcp-server
npm run build
```

### 5. Update Version

Update `package.json`:
```json
{
  "version": "2.5.0",
  "description": "MSC & Co Official Music Distribution MCP - Now with 5 grant-focused features: AI Copyright Verification, Carbon Tracking, Accessibility, Open Data, Skills Development. 159+ tools total."
}
```

### 6. Test in Claude Desktop

Restart Claude Desktop and test a grant feature:
```
"Can you check the copyright status for my release?"
"Calculate the carbon footprint for my latest track"
"Generate accessibility content for my new album"
```

---

## Publishing Updated MCP Server

Once tested locally:

```bash
# Publish to npm
npm version 2.5.0
npm publish

# Users update with:
npm install -g @mscandco/mcp-server@latest
```

---

## Quick Reference: Tool Categories

**25 New Grant Feature Tools Added**:
- 3 Copyright tools
- 5 Sustainability tools
- 4 Accessibility tools
- 5 Open Data tools
- 8 Skills Development tools

**Total MSC & Co MCP Tools**: 159+ (134 original + 25 grant features)

---

**Need help with integration?** Let me know and I can make the edits directly!
