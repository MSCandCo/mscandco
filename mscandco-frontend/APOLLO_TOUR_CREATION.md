# 🎫 Apollo AI Tour Creation from Ticket Links

## Overview

Apollo AI can now create tours conversationally by parsing ticket links from Eventbrite, Ticketmaster, Bandsintown, Songkick, and other platforms. Users simply provide a ticket URL, and Apollo handles everything through natural conversation.

---

## 🚀 How It Works

### User Experience

**User:** "Create a tour from this Eventbrite link: https://www.eventbrite.com/e/my-show-123456789"

**Apollo's Process:**
1. **Preview** - Fetches event information from the ticket URL
2. **Analyze** - Identifies what information is available and what's missing
3. **Ask Questions** - If data is missing, asks clarifying questions:
   - "What is the name of this event?"
   - "What is the date and time?"
   - "What city is this event in?"
   - "What is the venue name?"
4. **Create Tour** - Once all info is gathered, creates:
   - Complete tour with name, dates, description
   - Tour date with venue, city, country
   - Eventbrite sync (if applicable)
   - All metadata preserved

---

## 🛠️ Technical Implementation

### Apollo Tools

**1. `preview_ticket_event`**
- Fetches event information from ticket URL
- Returns available data and missing fields
- Helps Apollo understand what questions to ask

**2. `create_tour_from_ticket`**
- Creates complete tour from ticket link
- Handles missing data gracefully
- Syncs with Eventbrite if applicable

### Ticket Parser

Supports multiple platforms:
- ✅ **Eventbrite** - Full API integration
- ✅ **Ticketmaster** - URL parsing (API ready)
- ✅ **Bandsintown** - URL parsing
- ✅ **Songkick** - URL parsing
- ✅ **Generic URLs** - HTML scraping fallback

### API Routes

**`/api/touring/apollo/create-from-ticket`**
- `GET` - Preview event info
- `POST` - Create tour from ticket link

---

## 💬 Example Conversation

```
User: "Hey Apollo, I have an Eventbrite event. Can you create a tour from this link: 
       https://www.eventbrite.com/e/my-summer-tour-london-123456789"

Apollo: "I'll fetch the event information for you..."

[Apollo calls preview_ticket_event]

Apollo: "I found your event! Here's what I found:
         - Event: My Summer Tour - London
         - Date: July 15, 2024
         - Venue: The O2 Arena
         - City: London
         - Country: UK
         
         I have all the information I need. Would you like me to create the tour now?"

User: "Yes, please create it"

[Apollo calls create_tour_from_ticket]

Apollo: "✅ Successfully created tour 'My Summer Tour - London 2024'!
         - Tour created with 1 date
         - Venue: The O2 Arena, London, UK
         - Date: July 15, 2024
         - Eventbrite event synced
         
         Your tour is ready! You can view it at /touring/tours/[tourId]"
```

---

## 🎯 Features

### ✅ Automatic Data Extraction
- Event name
- Date and time
- Venue information
- City and country
- Capacity
- Ticket classes (Eventbrite)
- Event description

### ✅ Intelligent Question Asking
- Only asks for missing information
- Context-aware questions
- Natural conversation flow

### ✅ Complete Tour Creation
- Tour with proper naming
- Tour date with all details
- Venue information
- Eventbrite sync (if applicable)
- Metadata preservation

### ✅ Error Handling
- Graceful fallbacks
- Clear error messages
- Helpful suggestions

---

## 📝 Usage Examples

### Simple (Complete Data)
```
User: "Create a tour from https://www.eventbrite.com/e/complete-event-123"
Apollo: [Fetches all data, creates tour immediately]
```

### With Questions (Missing Data)
```
User: "Create a tour from https://generic-ticket-site.com/event/123"
Apollo: "I found some information, but I need:
         - What is the event name?
         - What is the date?
         - What city is it in?"
User: "It's called 'Summer Fest', July 20th, in Manchester"
Apollo: [Creates tour with provided info]
```

### Custom Tour Name
```
User: "Create a tour from [url], call it 'My 2024 World Tour'"
Apollo: [Creates tour with custom name]
```

---

## 🔧 Integration Points

### Apollo Brain
- Tools added to `APOLLO_TOOLS` array
- Integrated into `executeToolCall` function
- Fallback to `tools.js` for additional tools

### Ticket Parser
- Platform-specific parsers
- Eventbrite API integration
- Generic URL fallback

### Tour Creation API
- Handles missing data
- Creates tour and tour date
- Syncs with Eventbrite
- Returns complete tour info

---

## 🎨 User Experience

**Natural Language:**
- "Create a tour from this link..."
- "Make a tour from Eventbrite..."
- "I have a ticket link, can you set up a tour?"

**Conversational:**
- Apollo asks questions naturally
- Provides feedback on what it found
- Confirms before creating
- Explains what was created

**Error Handling:**
- Clear error messages
- Helpful suggestions
- Graceful degradation

---

## ✨ Benefits

1. **Speed** - Create tours in seconds, not minutes
2. **Accuracy** - Automatic data extraction reduces errors
3. **Conversational** - Natural language interaction
4. **Intelligent** - Apollo asks only what's needed
5. **Complete** - Creates full tour with all details
6. **Integrated** - Works with existing Eventbrite integration

---

## 🚀 Future Enhancements

- Multi-date tour creation from multiple links
- Automatic venue matching
- Smart tour naming suggestions
- Budget estimation from ticket prices
- Crew suggestions based on venue size
- Route optimization suggestions

---

## 📊 Status

✅ **Complete and Ready to Use**

- Ticket URL parsing
- Apollo AI integration
- Conversational flow
- Tour creation
- Eventbrite sync
- Error handling

**Users can now create tours conversationally with Apollo AI!** 🎉

