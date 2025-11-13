# 🤖 Acceber Intelligence - Setup Guide

## What is Acceber Intelligence?

Acceber is the world's first AI assistant for music distribution, built exclusively for MSC & Co. It allows artists and label admins to interact with the platform using natural language and voice commands.

---

## 🎯 Features

### Core Capabilities
- ✅ **Natural Language Interface** - Ask questions in plain English
- ✅ **Voice Input** - Speak your questions (hands-free)
- ✅ **Earnings Intelligence** - "Which platform pays me the most?"
- ✅ **Release Management** - Create releases conversationally
- ✅ **Analytics Insights** - Get performance data instantly
- ✅ **Wallet Management** - Check balance and request payouts
- ✅ **Release Timing** - AI-powered release date recommendations
- ✅ **Real-time Data** - All responses use live database data

### 8 AI Tools
1. **get_earnings_summary** - Analyze earnings by timeframe
2. **compare_platforms** - Compare streaming platform payouts
3. **get_releases** - View releases with filters
4. **get_wallet_balance** - Check available and pending balance
5. **get_analytics** - Performance metrics and statistics
6. **suggest_release_timing** - Optimal release date recommendations
7. **create_release_draft** - Start new releases
8. **request_payout** - Process payout requests

---

## 💰 Cost Breakdown

### Development (One-time)
- **MVP Development**: £6,000
- **Timeline**: 3 weeks
- **Status**: ✅ COMPLETE

### Monthly Operating Costs

#### MVP (Current Setup)
```
OpenAI GPT-4o-mini:    £0-50/month (free tier covers 100+ demos)
Web Speech API:        £0 (browser-based voice)
Total:                 £0-50/month
```

#### After Funding (Scale-Up)
```
At 1,000 users:
- OpenAI API:          £1,000-2,000
- Voice services:      £200-500
- Web search:          £100-200
Total:                 £1,300-2,700/month

At 10,000 users:
- OpenAI API:          £7,500-15,000
- Voice services:      £1,000-2,500
- Web search:          £500-1,000
Total:                 £9,000-18,500/month
```

### Revenue Model
```
Option 1: Premium Add-on
- Artist Pro + AI:     £24.99/month (+£5)
- Label Pro + AI:      £59.99/month (+£10)
- Profit Margin:       55-75%

Option 2: Standalone AI Tier
- Acceber Intelligence: £14.99/month
- Profit Margin:       60-85%
```

---

## 🚀 Quick Start

### 1. Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-...`)
5. **Important**: OpenAI gives you $5 free credit for testing!

### 2. Add to Environment Variables

Create or update `.env.local`:

```bash
# Required for Acceber
OPENAI_API_KEY=sk-your-actual-key-here

# Existing variables (keep these)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3013
```

### 3. Install Dependencies

```bash
cd mscandco-frontend
npm install openai
```

### 4. Start Development Server

```bash
npm run dev
```

### 5. Access Acceber

- **Landing Page**: http://localhost:3013/ai
- **Chat Interface**: http://localhost:3013/ai/chat
- **Toggle Button**: Click the purple ✨ Sparkles icon in the header

---

## 📖 How to Use

### For Investors/Demos

1. **Login** as any artist or label admin
2. Click the **purple Sparkles icon** (✨) in the header
3. **Try these questions**:
   - "Which platform pays me the most?"
   - "Show me my wallet balance"
   - "I want to release a song"
   - "When should I release my new single?"
   - "How are my releases performing?"

### Voice Input

1. Click the **microphone icon** 🎤
2. Allow microphone access (browser will prompt)
3. Speak your question clearly
4. The transcript will appear in the input box
5. Press Enter or click Send

### Example Conversations

#### Earnings Analysis
```
You: "Which platform pays me the most?"

Acceber: "Spotify is your top earner at £847 this month (62% of total),
         followed by Apple Music at £312 (23%). Your Spotify performance
         is really strong! 📈"
```

#### Release Strategy
```
You: "When should I release my new single?"

Acceber: "Based on gospel music trends, I recommend Friday, March 15th.
         Here's why: Friday releases perform 23% better, and this gives
         you 2 weeks for promotion. Sound good?"
```

#### Wallet Management
```
You: "Show me my balance"

Acceber: "You have £1,247.89 available to withdraw right now, plus
         £432.12 pending from recent streams. Want to request a payout? 💰"
```

---

## 🏗️ Technical Architecture

### File Structure
```
mscandco-frontend/
├── app/
│   ├── ai/
│   │   ├── page.js                 # Landing page
│   │   └── chat/
│   │       └── page.js             # Chat interface
│   └── api/
│       └── acceber/
│           ├── chat/route.js       # Main chat endpoint
│           └── greeting/route.js   # Personalized greeting
│
├── lib/
│   └── acceber/
│       ├── client.js               # OpenAI client config
│       ├── tools-mvp.js            # 8 tool definitions
│       ├── tool-executor.js        # Tool execution logic
│       └── prompts.js              # System prompts
│
└── components/
    └── header.js                   # Added AI toggle button
```

### How It Works

1. **User Input** → Chat interface or voice
2. **OpenAI GPT-4o-mini** → Understands intent
3. **Function Calling** → AI decides which tools to use
4. **Tool Execution** → Fetches real data from Supabase
5. **AI Response** → Natural language answer with insights

### AI Model: GPT-4o-mini

- **Cost**: $0.15 input / $0.60 output per million tokens
- **Speed**: ~2-3 seconds per response
- **Quality**: 90% as good as GPT-4 for most tasks
- **Why not Claude?**: 10x cheaper, faster, and good enough for MVP

---

## 🧪 Testing

### Test Scenarios

1. **Earnings Analysis**
   - "Which platform pays me the most?"
   - "Show my earnings for this month"
   - "Compare my earnings across platforms"

2. **Release Management**
   - "I want to release a song"
   - "Show me my releases"
   - "When should I release my new album?"

3. **Wallet Operations**
   - "What's my wallet balance?"
   - "Request a payout"
   - "How much can I withdraw?"

4. **Analytics**
   - "How are my releases performing?"
   - "Show me my analytics"
   - "What's my top track?"

5. **Voice Input**
   - Click microphone and speak any question
   - Test with background noise
   - Try different accents

### Expected Behavior

✅ **Good Responses**:
- Natural, conversational language
- Uses real data from database
- Provides specific numbers and insights
- Suggests next actions

❌ **Bad Responses**:
- Generic answers without data
- Made-up numbers
- Errors or "I don't know"

### Debugging

Check browser console for:
```
💬 Acceber chat request from user: [user_id]
🔧 Executing tool: [tool_name]
✅ Tool [tool_name] executed successfully
```

Check terminal for:
```
🤖 OpenAI response: { hasContent: true, hasToolCalls: true, toolCount: 1 }
✅ Final response generated with tool results
```

---

## 🎨 Customization

### Change AI Personality

Edit `lib/acceber/prompts.js`:

```javascript
export function getSystemPrompt(userContext) {
  return `You are Acceber Intelligence...
  
  // Modify tone here:
  - More formal: "I am pleased to assist you..."
  - More casual: "Hey! Let's check that out..."
  - More technical: "Analyzing data from earnings_log table..."
  `;
}
```

### Add New Tools

1. Define tool in `lib/acceber/tools-mvp.js`:
```javascript
{
  type: 'function',
  function: {
    name: 'your_new_tool',
    description: 'What it does',
    parameters: { /* ... */ }
  }
}
```

2. Implement in `lib/acceber/tool-executor.js`:
```javascript
case 'your_new_tool': {
  // Your logic here
  return { success: true, data: ... };
}
```

### Change AI Model

Edit `lib/acceber/client.js`:

```javascript
export const ACCEBER_CONFIG = {
  model: 'gpt-4o-mini',  // Change to 'gpt-4o' for better quality
  temperature: 0.7,       // 0 = deterministic, 1 = creative
  max_tokens: 1000,       // Max response length
};
```

---

## 🚀 Deployment

### Vercel Deployment

1. Add environment variable in Vercel dashboard:
   - Key: `OPENAI_API_KEY`
   - Value: `sk-your-actual-key`

2. Deploy:
```bash
vercel --prod
```

### Environment Variables Checklist

- ✅ `OPENAI_API_KEY` - Required for AI
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Database
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Database
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Database (admin)
- ✅ `NEXT_PUBLIC_SITE_URL` - Your domain

---

## 📊 Monitoring

### Track Usage

Monitor in OpenAI dashboard:
- https://platform.openai.com/usage

You'll see:
- Total API calls
- Token usage
- Cost per day
- Model breakdown

### Set Spending Limits

1. Go to https://platform.openai.com/account/billing/limits
2. Set monthly budget (e.g., £50 for testing)
3. Get email alerts at 75% and 100%

---

## 🎯 Investor Presentation Tips

### Demo Script (5 minutes)

1. **Introduction** (30 seconds)
   - "This is Acceber Intelligence, the first AI for music distribution"
   - Show landing page: http://localhost:3013/ai

2. **Voice Demo** (1 minute)
   - Click microphone
   - Say: "Which platform pays me the most?"
   - Show instant, data-driven response

3. **Conversational Workflow** (2 minutes)
   - Type: "I want to release a song"
   - Show step-by-step guidance
   - Ask: "When should I release it?"
   - Show AI recommendation with reasoning

4. **Financial Intelligence** (1 minute)
   - Ask: "Show my wallet balance"
   - Ask: "Request a payout"
   - Show instant action execution

5. **Competitive Advantage** (30 seconds)
   - "No competitor has this"
   - "First-to-market AI music platform"
   - "60-85% profit margin on AI tier"

### Key Talking Points

- ✅ **First-to-market** - No competitor has conversational AI
- ✅ **Real data** - Not fake demos, actual database integration
- ✅ **Voice-enabled** - Hands-free, accessible
- ✅ **Scalable** - Built on enterprise infrastructure
- ✅ **Profitable** - 60-85% margin on AI subscriptions
- ✅ **Proven tech** - OpenAI powers ChatGPT (200M users)

---

## 🆘 Troubleshooting

### "OpenAI API key not found"

**Solution**: Add `OPENAI_API_KEY` to `.env.local`

### "Voice input not working"

**Solutions**:
1. Use Chrome, Edge, or Safari (not Firefox)
2. Allow microphone permissions
3. Check browser console for errors

### "AI responses are generic"

**Solution**: Check that tools are executing:
- Look for `🔧 Executing tool:` in console
- Verify Supabase connection
- Check service role key is set

### "Slow responses"

**Normal**: 2-3 seconds for AI + tool execution
**If slower**:
- Check internet connection
- Verify OpenAI API status
- Consider upgrading to `gpt-4o` (faster)

### "High costs"

**Solutions**:
1. Set spending limits in OpenAI dashboard
2. Reduce `max_tokens` in config
3. Cache common responses
4. Implement rate limiting per user

---

## 📈 Future Enhancements

### Phase 2 (After Funding)

1. **Upgrade to Claude 3.5 Sonnet**
   - Better reasoning
   - More natural conversations
   - Cost: $3/$15 per million tokens

2. **Add Premium Voice**
   - OpenAI TTS for responses
   - ElevenLabs for ultra-realistic voice
   - Text-to-speech for AI answers

3. **Expand Tools (30+ total)**
   - Collaboration matching
   - Revenue forecasting (ML)
   - Artwork generation (DALL-E)
   - Lyrics analysis
   - Smart metadata generation

4. **Web Intelligence**
   - Real-time market trends
   - Competitor analysis
   - Release timing optimization

5. **Proactive Insights**
   - "Your earnings spiked 40% today!"
   - "Perfect time to release your next single"
   - "3 distributors haven't reported"

---

## 💡 Tips for Success

### For Demos
- ✅ Test with real user data (not empty accounts)
- ✅ Seed some earnings and releases first
- ✅ Practice voice input beforehand
- ✅ Have backup questions ready
- ✅ Show the "actions taken" badges

### For Production
- ✅ Set OpenAI spending limits
- ✅ Monitor usage daily
- ✅ Collect user feedback
- ✅ A/B test pricing
- ✅ Track conversion rates

### For Investors
- ✅ Emphasize first-to-market advantage
- ✅ Show real data integration
- ✅ Highlight profit margins
- ✅ Demonstrate scalability
- ✅ Present clear upgrade path

---

## 📞 Support

### Questions?

- **Technical Issues**: Check browser console + terminal logs
- **API Errors**: Verify OpenAI key and spending limits
- **Feature Requests**: Document for Phase 2
- **Cost Concerns**: Monitor OpenAI dashboard

### Resources

- OpenAI Docs: https://platform.openai.com/docs
- OpenAI Pricing: https://openai.com/pricing
- OpenAI Status: https://status.openai.com
- Web Speech API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API

---

## 🎉 Congratulations!

You now have a working AI assistant that:
- ✅ Understands natural language
- ✅ Executes actions on your platform
- ✅ Provides intelligent insights
- ✅ Works with voice input
- ✅ Uses real database data
- ✅ Costs almost nothing to run (MVP)

**This is revolutionary for music distribution!** 🚀

---

**Built with ❤️ for MSC & Co**

