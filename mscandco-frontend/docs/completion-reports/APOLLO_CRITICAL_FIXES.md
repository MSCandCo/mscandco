# Apollo Critical Issues & Fixes Needed

## Issues Observed:

1. **Asking for same information multiple times** (postal code asked 6+ times)
2. **Not completing onboarding** when user says "I'm all good" / "I'm done"
3. **Conversation resets** - starts over from scratch randomly
4. **Wrong data extraction**:
   - Using "Gunja" instead of "London" (SE18 2AF = London)
   - Using "Pop" instead of "Hip-Hop"
   - Using wrong names
5. **Not understanding user intent**:
   - "let continue" should mean "continue onboarding"
   - "I'm all good" should mean "complete and close"
   - "no" when asked if they need anything should trigger completion
6. **Website fetching not working** - tool exists but not being used properly
7. **Bio writing using wrong data** - not reading conversation history

## Root Causes:

1. Conversation history not being preserved properly between messages
2. Data extraction logic not checking conversation history
3. No clear completion trigger logic
4. Apollo not marking onboarding as complete in database
5. System prompt too long/complex - GPT losing track

## Required Fixes:

### Fix 1: Simplify and strengthen system prompt
- Add MASSIVE emphasis on checking "WHAT WE STILL NEED" section
- Add explicit completion triggers
- Make rules MUCH more explicit

### Fix 2: Better data extraction
- Must check conversation history for all data
- Extract artist name, genre, location, website from ANY message
- Infer location from postal codes

### Fix 3: Completion logic
- When user says done ("I'm good", "that's it", "close", etc.) → COMPLETE
- When all fields filled → COMPLETE
- When bio written and nothing left → COMPLETE

### Fix 4: Stop repeating questions
- Before asking ANYTHING, check both profile AND conversation history
- Never ask for data that's already in the conversation

### Fix 5: Website fetching
- Actually use the fetch_website tool when user provides URL
- Pass website to search_artist_info tool

## Implementation Plan:

1. Rewrite system prompt with BRUTAL clarity
2. Add conversation history context window to ensure all data is visible
3. Fix data extraction to be more aggressive
4. Add explicit completion detection
5. Test thoroughly
