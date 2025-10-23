# MessageAI Cloud Functions

AI-powered features for the International Communicator persona.

## Setup

### 1. Install Dependencies

```bash
cd functions
npm install
```

### 2. Configure Environment Variables

Set your OpenAI API key in Firebase Functions config:

```bash
# Using Firebase CLI
firebase functions:config:set openai.key="sk-your-api-key-here"

# View current config
firebase functions:config:get
```

For local development, create a `.env` file:

```bash
# functions/.env
OPENAI_API_KEY=sk-your-api-key-here
```

### 3. Deploy Functions

```bash
# Deploy all functions
npm run deploy

# Or from project root
firebase deploy --only functions
```

### 4. Test Locally

```bash
# Start Firebase emulators
npm run serve

# Or
firebase emulators:start --only functions
```

## Available Functions

### 1. `translateMessage`
Translates text to target language using GPT-4o-mini.

**Input:**
```json
{
  "text": "Hello, how are you?",
  "targetLanguage": "es",
  "sourceLanguage": "en"
}
```

**Output:**
```json
{
  "originalText": "Hello, how are you?",
  "translatedText": "Hola, ¿cómo estás?",
  "sourceLanguage": "en",
  "targetLanguage": "es"
}
```

### 2. `detectLanguage`
Detects the language of a message.

**Input:**
```json
{
  "text": "Bonjour, comment allez-vous?"
}
```

**Output:**
```json
{
  "languageCode": "fr",
  "originalText": "Bonjour, comment allez-vous?"
}
```

### 3. `explainPhrase`
Explains cultural phrases and idioms.

**Input:**
```json
{
  "phrase": "break the ice",
  "fullMessage": "Let's break the ice with the new client",
  "language": "en"
}
```

**Output:**
```json
{
  "phrase": "break the ice",
  "explanation": "This idiom means to start a conversation..."
}
```

### 4. `detectCulturalReferences`
Identifies idioms and cultural references in text.

**Input:**
```json
{
  "text": "It's raining cats and dogs here!",
  "language": "en"
}
```

**Output:**
```json
{
  "references": [
    {
      "phrase": "raining cats and dogs",
      "startIndex": 5,
      "endIndex": 27
    }
  ]
}
```

### 5. `adjustFormality`
Rewrites text with different formality levels.

**Input:**
```json
{
  "text": "hey wassup! wanna grab lunch?",
  "targetFormality": "professional",
  "language": "en"
}
```

**Output:**
```json
{
  "originalText": "hey wassup! wanna grab lunch?",
  "rewrittenText": "Good morning! Would you like to have lunch?",
  "formality": "professional"
}
```

### 6. `generateSmartReplies`
Generates context-aware reply suggestions.

**Input:**
```json
{
  "lastMessage": "Thanks for the presentation!",
  "targetLanguage": "en",
  "replyStyle": "friendly"
}
```

**Output:**
```json
{
  "replies": [
    "Thanks! 👍",
    "Glad you liked it!",
    "Thank you! Let me know if you have any questions."
  ],
  "context": {
    "language": "en",
    "style": "friendly"
  }
}
```

### 7. `healthCheck`
Simple health check endpoint.

**Access via HTTP:**
```
GET https://us-central1-YOUR-PROJECT.cloudfunctions.net/healthCheck
```

## Rate Limiting

- **Limit:** 100 AI calls per user per hour
- **Response:** `resource-exhausted` error when limit exceeded
- **Reset:** Rolling 1-hour window

## Cost Optimization

### Translation Caching
Translations are cached to reduce API costs:
- Same text + target language = instant cached result
- Cache stored in Firestore (TODO: implement in PR #18)

### Token Estimation
All functions log token usage for cost tracking:
- Approximate: 1 token ≈ 4 characters
- GPT-4o-mini: $0.15 per 1M input tokens, $0.60 per 1M output tokens

### Estimated Costs
Per 1000 messages:
- Translation: ~$0.20
- Language detection: ~$0.10
- Cultural hints: ~$0.05
- Formality adjustment: ~$0.10
- Smart replies: ~$0.05

**Total: ~$0.50 per 1000 AI operations**

## Development

### Linting
```bash
npm run lint
```

### Function Logs
```bash
npm run logs

# Or specific function
firebase functions:log --only translateMessage
```

### Testing
```bash
# Unit tests (TODO: add tests in PR #22)
npm test
```

## Troubleshooting

### "OpenAI API key not configured"
Set the API key using:
```bash
firebase functions:config:set openai.key="sk-..."
```

### "Rate limit exceeded"
User has made 100+ calls in the past hour. Wait or contact support.

### "AI service temporarily unavailable"
OpenAI API is down or rate limited. Retry in a few moments.

## Architecture

```
backend/
├── src/
│   ├── utils/
│   │   ├── functionWrapper.js # ⭐ Middleware for all functions
│   │   ├── aiClient.js        # OpenAI API wrapper
│   │   └── rateLimit.js       # Rate limiting & usage logging
│   ├── translate.js            # Translation function
│   ├── detect.js               # Language detection
│   ├── culturalContext.js      # Idiom explanations
│   ├── formality.js            # Formality adjustment
│   └── smartReplies.js         # Smart reply generation
├── index.js                    # Function exports
├── package.json
└── .eslintrc.js
```

### Middleware Pattern

All functions use `withAIMiddleware()` which automatically handles:
- ✅ **Authentication** - Verifies `context.auth`
- ✅ **Input Validation** - Reusable validators
- ✅ **Rate Limiting** - Enforces 100 calls/hour/user
- ✅ **Usage Logging** - Auto-tracks tokens and costs
- ✅ **Error Handling** - Consistent error responses
- ✅ **Performance Tracking** - Logs request duration

**Example function structure:**
```javascript
const {withAIMiddleware, validators} = require("./utils/functionWrapper");

exports.myFunction = withAIMiddleware(
  async (data, userId) => {
    // Pure business logic here
    const result = await callOpenAI(...);
    return {
      result,
      _aiMetadata: {prompt, response}, // Auto-logged
    };
  },
  {
    functionName: "my_function",
    validate: validators.requireString("input"),
  }
);
```

**Benefits:**
- 📉 25% less code per function
- 🎯 Functions focus on business logic only
- 🔧 Change middleware once → affects all functions
- ✅ Consistent behavior across all endpoints

See `BACKEND_MIDDLEWARE_REFACTOR.md` for details.

## Security

- All functions require authentication (`context.auth`)
- Rate limiting prevents abuse
- API keys stored securely in Firebase config
- No sensitive data logged


