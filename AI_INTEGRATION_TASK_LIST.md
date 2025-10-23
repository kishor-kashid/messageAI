# MessageAI - AI Integration Task List
## International Communicator Persona

**Timeline:** 3-4 days (Wednesday - Saturday)  
**Early Submission Target:** Friday evening  
**Final Submission:** Sunday 10:59 PM CT  
**Current Status:** MVP Complete ✅ → AI Features (4/6 PRs COMPLETE! ALL 5 REQUIRED FEATURES DONE! 🎉🎉)

---

## Project Status Summary

### ✅ Already Complete (MVP - 24 hours)
- [x] Real-time messaging infrastructure
- [x] User authentication & profiles
- [x] One-on-one chat
- [x] Group chat (3+ users)
- [x] Message persistence (SQLite + Firebase)
- [x] Offline message queue & sync
- [x] Read receipts & typing indicators
- [x] Online/offline presence
- [x] Image messaging
- [x] Push notifications (foreground)

### ✅ AI Features COMPLETED (October 23, 2025)
- ✅ **PR #17:** Firebase Cloud Functions Setup (8 functions deployed)
- ✅ **PR #18:** Language Detection & Real-time Translation + ENHANCED (inline translation + language preference)
- ✅ **PR #19:** Cultural Context & Idiom Explanations + TRANSLATION (universal context for any message)
- ✅ **PR #20:** Formality Adjustment (4 tone levels with beautiful UI)

### 🎯 AI Features IN PROGRESS
- [ ] **PR #21:** Smart Replies (Advanced Feature)
- [ ] **PR #22-23:** Additional features + polish

### 📊 Progress: 4/6 AI PRs Complete (67%)
- Backend Infrastructure: ✅ 100%
- Translation Features: ✅ 100% (with enhancements)
- Cultural Context: ✅ 100% (with translation)
- Formality Adjustment: ✅ 100% (COMPLETE!)
- Smart Replies: ⏳ Pending
- Polish & Demo: ⏳ Pending

---

## AI Feature Overview

### Required Features (All 5)
1. ✅ **Real-time Translation** - Translate messages to any language (COMPLETE + INLINE!)
2. ✅ **Language Detection** - Auto-detect message language (COMPLETE + PREFERENCE!)
3. ✅ **Cultural Context Hints** - Explain cultural references (COMPLETE + UNIVERSAL!)
4. ✅ **Formality Adjustment** - Rewrite messages in different tones (COMPLETE + 4 LEVELS!)
5. ✅ **Slang/Idiom Explanations** - Explain unclear phrases (MERGED with Cultural Context!)

### Advanced Feature (Choose 1)
**Selected:** ⏳ Context-Aware Smart Replies - Generate quick replies in detected language matching user's style (TODO)

### Bonus Enhancements Completed ⭐
- ✅ **Language Preference System** - Required language selection during onboarding + profile updates
- ✅ **Inline Auto-Translation** - "See translation" toggle for foreign messages (zero delay)
- ✅ **Cultural Context Translation** - Translate explanations to user's preferred language
- ✅ **3-Layer Translation System** - Inline + Modal + Cultural Context
- ✅ **Universal Cultural Context** - Works for ANY message, not just idioms

---

## PR #17: Firebase Cloud Functions Setup ⚡ ✅ COMPLETE

**Actual Time:** ~3 hours  
**Priority:** 🔥🔥🔥 CRITICAL - Must do first  
**Branch:** `feature/ai-cloud-functions-setup`  
**Status:** ✅ DEPLOYED & TESTED (October 23, 2025)

### Objectives ✅
- ✅ Set up Firebase Cloud Functions project
- ✅ Configure OpenAI API integration
- ✅ Create base infrastructure for AI calls
- ✅ Set up error handling and rate limiting
- ✅ **BONUS:** Implemented middleware pattern for code optimization

### Completed Tasks

#### 1. Initialize Cloud Functions ✅
- ✅ Initialized Firebase Functions in `backend/` directory
- ✅ Used JavaScript with ESLint
- ✅ Installed required packages: `openai`, `firebase-admin`, `firebase-functions`

#### 2. Create AI Client Utilities ✅
- ✅ Created `backend/src/utils/openai.js` with OpenAI wrapper
- ✅ Implemented `callOpenAI()` function with error handling
- ✅ Added temperature and token limit options
- ✅ Handles API errors gracefully with detailed logging

#### 3. Set up Environment Variables ✅
- ✅ Configured Firebase Functions with OpenAI API key
- ✅ Used `firebase functions:secrets:set OPENAI_API_KEY`
- ✅ Documented environment setup in `FIREBASE_FUNCTIONS_SETUP.md`

#### 4. Create Base Cloud Functions Structure ✅
- ✅ Created `backend/index.js` with 8 function exports
- ✅ Set up separate files for each AI function:
  - `backend/src/translate.js` - Translation
  - `backend/src/detect.js` - Language detection
  - `backend/src/culturalContext.js` - Cultural explanations
  - `backend/src/formality.js` - Formality adjustment
  - `backend/src/smartReplies.js` - Smart reply generation
- ✅ Fixed Firebase Admin initialization (prevent duplicates)
- ✅ Fixed OpenAI import for CommonJS compatibility

#### 5. **BONUS: Middleware Pattern Implementation** ✅
- ✅ Created `backend/src/utils/functionWrapper.js` - Centralized middleware
- ✅ Automatic authentication for all functions
- ✅ Request validation with reusable validators
- ✅ Rate limiting: 100 AI calls/hour per user
- ✅ Usage logging to Firestore `ai_usage_log` collection
- ✅ 25% code reduction (107 lines eliminated)
- ✅ Zero ESLint errors

#### 6. Deploy and Test ✅
- ✅ Successfully deployed all 8 functions to Firebase (messageai-c7214)
- ✅ All functions deployed to us-central1 region
- ✅ Health check endpoint passing: HTTP 200 OK
- ✅ Environment variables loading correctly
- ✅ Error handling tested and working
- ✅ Rate limiting preventing abuse

### Deployed Functions (8 Total)
1. ✅ `translateMessage` - Real-time translation (GPT-4o-mini)
2. ✅ `detectLanguage` - Language detection (GPT-4o-mini)
3. ✅ `explainPhrase` - Cultural phrase explanations (GPT-4o-mini)
4. ✅ `detectCulturalReferences` - Find idioms/slang (GPT-4o-mini)
5. ✅ `getCulturalContext` - Universal cultural context (NEW!)
6. ✅ `adjustFormality` - Formality adjustment (GPT-4o-mini)
7. ✅ `generateSmartReplies` - Smart replies (GPT-4o-mini)
8. ✅ `healthCheck` - Service health verification

### Database Schema Updates
- ✅ `ai_usage_log` collection in Firestore for tracking API usage
- ✅ Translation cache handled in frontend (in-memory)

### Testing Checklist ✅
- ✅ All functions deploy successfully
- ✅ Environment variables load correctly
- ✅ OpenAI API calls work perfectly
- ✅ Error handling catches API failures
- ✅ Rate limiting prevents abuse (100 calls/hour)
- ✅ Usage logging to Firestore working
- ✅ Health check endpoint returning function list

### Files Created
- ✅ `backend/package.json` - Dependencies and scripts
- ✅ `backend/index.js` - Function exports
- ✅ `backend/src/utils/openai.js` - OpenAI client wrapper
- ✅ `backend/src/utils/functionWrapper.js` - Middleware pattern
- ✅ `backend/src/utils/validators.js` - Request validators
- ✅ `backend/src/translate.js` - Translation function
- ✅ `backend/src/detect.js` - Language detection function
- ✅ `backend/src/culturalContext.js` - Cultural context functions
- ✅ `backend/src/formality.js` - Formality adjustment function
- ✅ `backend/src/smartReplies.js` - Smart replies function
- ✅ `FIREBASE_FUNCTIONS_SETUP.md` - Complete deployment guide
- ✅ `backend/README.md` - Middleware pattern documentation
- ✅ `firebase.json` - Points to backend directory
- ✅ `.firebaserc` - Project configuration

---

## PR #18: Language Detection & Real-time Translation 🌍 ✅ COMPLETE + ENHANCED!

**Actual Time:** ~4 hours (including enhancements)  
**Priority:** 🔥🔥🔥 CORE FEATURE  
**Branch:** `feature/translation`  
**Depends on:** PR #17  
**Status:** ✅ COMPLETE WITH MAJOR ENHANCEMENTS (October 23, 2025)

### Objectives ✅
- ✅ Implement language detection on messages
- ✅ Build translation cloud function
- ✅ Add translation UI to message bubbles
- ✅ Cache translations to reduce costs
- ✅ **BONUS:** Language preference system (onboarding + profile)
- ✅ **BONUS:** Inline auto-translation with "See translation" toggle

### Completed Tasks

#### 1. Language Detection Cloud Function ✅
- ✅ Created `backend/src/detect.js` (deployed in PR #17)
- ✅ Implemented `detectLanguage` HTTPS callable function
- ✅ Uses OpenAI GPT-4o-mini for detection
- ✅ Returns ISO 639-1 language codes (en, es, fr, etc.)
- ✅ Authentication check via middleware

#### 2. Translation Cloud Function ✅
- ✅ Created `backend/src/translate.js` (deployed in PR #17)
- ✅ Implemented `translateMessage` HTTPS callable function
- ✅ Translation caching handled in frontend
- ✅ Uses OpenAI for translation with context preservation
- ✅ Usage logging to Firestore via middleware

#### 3. Frontend: Language Badge Component ✅
- ✅ Created `messageai/components/chat/LanguageBadge.jsx`
- ✅ Displays country flag emoji for detected language
- ✅ Shows language code (EN, ES, FR, etc.)
- ✅ Styled as small badge on message bubble
- ✅ Different positioning for own/other messages

#### 4. Frontend: Translation Modal ✅
- ✅ Created `messageai/components/chat/TranslationModal.jsx`
- ✅ Shows original text with language badge
- ✅ Language selector with 16 supported languages
- ✅ Flag emoji + language name display
- ✅ Loading state during translation with spinner
- ✅ Displays translated text with formatting
- ✅ Error handling with retry button
- ✅ Beautiful, modern UI design

#### 5. Integrate into MessageBubble ✅
- ✅ Added long-press handler to MessageBubble
- ✅ Action sheet with "Translate" option
- ✅ Opens TranslationModal on selection
- ✅ Language badge displayed on all messages
- ✅ Passes all necessary props (text, language, etc.)

#### 6. Auto-detect Language on Send ✅
- ✅ Modified `messageai/lib/hooks/useMessages.js`
- ✅ Calls detectLanguage API before sending message
- ✅ Stores detected language in message object
- ✅ Handles detection failures gracefully (defaults to 'en')
- ✅ Non-blocking detection (message sends immediately)

#### 7. **MAJOR ENHANCEMENT: Language Preference System** ✅
- ✅ Created language selector in `messageai/app/(auth)/onboarding.jsx`
  - Required field during user signup
  - Modal picker with all 16 supported languages
  - Flag emoji + language name display
  - Stored in user profile as `preferredLanguage`
  - Defaults to English if not set
- ✅ Added language selector to `messageai/app/(tabs)/profile.jsx`
  - View current preferred language with flag
  - Tap to open modal picker
  - Update language anytime
  - Changes reflected immediately
- ✅ Modified `messageai/lib/hooks/useAuth.js`
  - Updated `completeProfile` to accept `preferredLanguage`
  - Passes to `createUserProfile` in Firestore
- ✅ Modified `messageai/lib/firebase/firestore.js`
  - Updated `createUserProfile` to store `preferredLanguage`

#### 8. **MAJOR ENHANCEMENT: Inline Auto-Translation** ✅
- ✅ Modified `messageai/components/chat/MessageBubble.jsx`
  - **Zero delay**: Messages display immediately in original language
  - **Smart detection**: Compares message language vs. user's preferred language
  - **Auto-toggle**: Shows "See translation" link ONLY for foreign messages
  - **Inline display**: Tap to translate message inline (no modal needed)
  - **Instant toggle**: "See original" to switch back
  - **Translation caching**: No redundant API calls on toggle
  - **Loading states**: "Translating..." with spinner
  - **Error handling**: "Translation failed. Tap to retry"
  - Beautiful styling consistent with app theme
- ✅ Perfect UX: No blocking, instant display, on-demand translation

#### 9. AI Service Client ✅
- ✅ Created `messageai/lib/api/aiService.js`
  - Firebase Cloud Functions wrapper
  - Automatic error handling and caching
  - Support for 16 languages with flag emojis
  - Translation cache (Map-based, 100-entry limit)
  - Exported functions: `translateMessage`, `detectLanguage`, `getCachedTranslation`, `clearTranslationCache`
  - `SUPPORTED_LANGUAGES` array with codes, names, flags
  - `getLanguageInfo` utility function

### Database Schema Updates ✅
- ✅ Added `detected_language` column to messages table (SQLite)
- ✅ Migration script for existing databases
- ✅ Stores ISO 639-1 language codes
- ✅ Included in Firestore message documents

### Testing Checklist ✅
- ✅ Language detection works for 16 languages
- ✅ Translation preserves emojis and tone
- ✅ Translation modal UI is smooth and beautiful
- ✅ Long-press menu works on all messages
- ✅ Cache prevents duplicate API calls
- ✅ Language badge displays correctly
- ✅ Inline translation shows only for foreign messages
- ✅ "See translation" toggle works perfectly
- ✅ Language preference saves and persists
- ✅ Profile language selector works
- ✅ Zero linter errors

### Files Created
- ✅ `messageai/components/chat/LanguageBadge.jsx` - Language badge component
- ✅ `messageai/components/chat/TranslationModal.jsx` - Translation modal UI
- ✅ `messageai/lib/api/aiService.js` - AI Service client with caching
- ✅ Modified: `messageai/components/chat/MessageBubble.jsx` - Inline translation + long-press menu
- ✅ Modified: `messageai/lib/hooks/useMessages.js` - Auto language detection
- ✅ Modified: `messageai/lib/database/schema.js` - Added detected_language column
- ✅ Modified: `messageai/lib/database/messages.js` - Include detected_language
- ✅ Modified: `messageai/lib/firebase/firestore.js` - Store preferredLanguage
- ✅ Modified: `messageai/app/(auth)/onboarding.jsx` - Language preference picker
- ✅ Modified: `messageai/app/(tabs)/profile.jsx` - Language selector
- ✅ Modified: `messageai/lib/hooks/useAuth.js` - Handle preferredLanguage
- ✅ Modified: `messageai/app/chat/[id].jsx` - Wired up translation modal

### Supported Languages (16)
1. English (en) 🇬🇧
2. Spanish (es) 🇪🇸
3. French (fr) 🇫🇷
4. German (de) 🇩🇪
5. Italian (it) 🇮🇹
6. Portuguese (pt) 🇵🇹
7. Russian (ru) 🇷🇺
8. Japanese (ja) 🇯🇵
9. Korean (ko) 🇰🇷
10. Chinese (zh) 🇨🇳
11. Arabic (ar) 🇸🇦
12. Hindi (hi) 🇮🇳
13. Turkish (tr) 🇹🇷
14. Dutch (nl) 🇳🇱
15. Polish (pl) 🇵🇱
16. Swedish (sv) 🇸🇪

### User Experience Flow
1. User signs up → Selects preferred language (required)
2. User sends message → Language auto-detected
3. User receives foreign message → Displays immediately (zero delay)
4. "See translation" link appears below foreign message
5. User taps → Message translates inline
6. User taps "See original" → Returns to original text
7. User can also long-press → "Translate" → Opens modal with language picker

---

## PR #19: Cultural Context & Idiom Explanations 🎭 ✅ COMPLETE + TRANSLATION!

**Actual Time:** ~3 hours (including refactor and enhancements)  
**Priority:** 🔥🔥 HIGH  
**Branch:** `feature/cultural-context`  
**Depends on:** PR #18  
**Status:** ✅ COMPLETE WITH UNIVERSAL CONTEXT + TRANSLATION (October 23, 2025)

### Objectives ✅
- ✅ Detect cultural references and idioms in messages
- ✅ Provide context explanations
- ✅ Add UI for cultural context access
- ✅ **REFACTORED:** Universal cultural context for ANY message
- ✅ **BONUS:** Inline translation for cultural explanations

### Completed Tasks

#### 1. Cultural Context Cloud Functions ✅
- ✅ Created `backend/src/culturalContext.js` (deployed in PR #17)
- ✅ Implemented `explainPhrase` function (legacy)
  - Takes phrase, full message, and language
  - Returns 2-3 sentence explanation
  - Explains literal meaning, cultural context, and usage
- ✅ Implemented `detectCulturalReferences` function (legacy)
  - Analyzes message for idioms/slang/cultural references
  - Returns JSON array with phrase and position
  - Handles multiple references per message
- ✅ **NEW: Implemented `getCulturalContext` function**
  - Universal cultural context for ANY message
  - Single comprehensive explanation from LLM
  - Explains cultural meaning, idioms, slang, or general usage
  - Works for greetings, casual phrases, formal messages, idioms, slang
  - 3-5 sentence friendly explanations
  - Supersedes separate detection functions

#### 2. Frontend: Cultural Context Modal ✅
- ✅ Created `messageai/components/chat/CulturalContextModal.jsx`
- ✅ **REFACTORED to Universal Context approach**
  - Removed inline "?" tooltips (per user feedback - too cluttered)
  - Clean modal interface with comprehensive explanation
  - Shows message preview
  - Displays loading state with spinner
  - Shows single unified cultural context explanation
  - Error handling with retry button
  - Beautiful styling consistent with app theme
- ✅ **MAJOR ENHANCEMENT: Inline Translation for Context** ⭐
  - Cultural context displayed in English by default
  - If user's preferred language ≠ English: "See translation" link appears
  - Tap to translate explanation to user's preferred language
  - Tap "See original (English)" to switch back
  - Translation cached in modal state (no repeated API calls)
  - Loading state: "Translating..." with spinner
  - Error handling: "Translation failed. Tap to retry"
  - Seamless toggle between English and user's language

#### 3. Integrate into MessageBubble ✅
- ✅ Modified `messageai/components/chat/MessageBubble.jsx`
- ✅ Added "Cultural Context" option to long-press menu
- ✅ **Always available** for ALL text messages (no pre-detection)
- ✅ On-demand detection only (when modal opens)
- ✅ Removed inline tooltips (cleaner UI)
- ✅ No pre-detection required (better performance)
- ✅ No caching complexity (simpler architecture)

#### 4. Wire Up in Chat Screen ✅
- ✅ Modified `messageai/app/chat/[id].jsx`
- ✅ Added state for cultural context modal
- ✅ Passed `onShowCulturalContext` callback to MessageList
- ✅ Integrated CulturalContextModal component
- ✅ Passes message object to modal

#### 5. AI Service Client Updates ✅
- ✅ Modified `messageai/lib/api/aiService.js`
- ✅ Added `getCulturalContext` function
- ✅ Added `getCachedCulturalContext` function
- ✅ Cultural context cache (Map-based, 50-entry limit)
- ✅ Clear cache function: `clearCulturalContextCache`

### Testing Checklist ✅
- ✅ Works for ANY message (not just idioms)
- ✅ Detects common idioms ("break the ice", "piece of cake", etc.)
- ✅ Explains greetings ("how are you?", "what's up?", etc.)
- ✅ Explains casual phrases and slang
- ✅ Provides cultural context for formal messages
- ✅ Modal UI is clean and beautiful
- ✅ Explanations are clear and concise (3-5 sentences)
- ✅ Works for multiple languages
- ✅ "Cultural Context" option always available
- ✅ Translation to user's preferred language works
- ✅ Toggle between English and user's language works
- ✅ Zero linter errors

### Files Created
- ✅ `messageai/components/chat/CulturalContextModal.jsx` - Cultural context modal with translation
- ✅ Modified: `messageai/components/chat/MessageBubble.jsx` - Added long-press option
- ✅ Modified: `messageai/components/chat/MessageList.jsx` - Passed callbacks
- ✅ Modified: `messageai/app/chat/[id].jsx` - Wired up modal
- ✅ Modified: `messageai/lib/api/aiService.js` - Added getCulturalContext + caching
- ✅ Deleted: `messageai/components/chat/CulturalTooltip.jsx` - Removed inline tooltips

### Universal Context Examples
1. **"How are you?"**
   - Explains: Common greeting, cultural usage, appropriate responses
2. **"Break the ice"**
   - Explains: Idiom meaning, when to use, cultural context
3. **"What's up?"**
   - Explains: Informal greeting, casual contexts, cultural nuances
4. **"Let's grab coffee"**
   - Explains: Social invitation norms, cultural expectations
5. **Any message**
   - Provides: Relevant cultural/linguistic context

### Complete Translation System (3 Layers)
1. ✅ **Message Translation (Inline)**: "See translation" in chat bubbles
2. ✅ **Message Translation (Modal)**: Long-press → "Translate" → Language picker modal
3. ✅ **Cultural Context Translation**: Explanations translate to user's preferred language

### User Experience Flow
1. User long-presses any text message
2. Action sheet appears with "Cultural Context" option (always available)
3. User taps → CulturalContextModal opens
4. Modal shows message preview + cultural explanation (in English)
5. If user's language ≠ English: "See translation" link appears
6. User taps → Explanation translates to their preferred language
7. User taps "See original (English)" → Switches back to English
8. User taps "Done" → Modal closes

---

## PR #20: Formality Adjustment 👔 ✅ COMPLETE

**Actual Time:** ~1.5 hours  
**Priority:** 🔥🔥 HIGH  
**Branch:** `feature/formality-adjustment`  
**Depends on:** PR #18  
**Status:** ✅ COMPLETE (October 23, 2025)

### Objectives ✅
- ✅ Rewrite messages in different formality levels
- ✅ Add UI in message composer to adjust tone
- ✅ Support casual, neutral, formal, and professional tones

### Completed Tasks

#### 1. Formality Adjustment Cloud Function ✅
- ✅ Created `backend/src/formality.js` (deployed in PR #17)
- ✅ Implemented `adjustFormality` HTTPS callable function
- ✅ Defined formality levels:
  - Casual (😊): friendly, contractions, emojis
  - Neutral (💬): balanced and polite
  - Formal (🎩): professional, no slang
  - Professional (💼): business formal
- ✅ Uses OpenAI GPT-4o-mini to rewrite text
- ✅ Preserves meaning and important details
- ✅ Usage logging via middleware

#### 2. Frontend: Formality Adjuster UI ✅
- ✅ Created `messageai/components/chat/FormalityAdjuster.jsx`
- ✅ Beautiful modal interface with "✨ Adjust Tone" header
- ✅ Display 4 formality level options with emojis
- ✅ Each level shows:
  - Emoji icon (😊💬🎩💼)
  - Level name (Casual/Neutral/Formal/Professional)
  - Brief description
  - Color-coded design
- ✅ Loading state during adjustment with spinner
- ✅ Active selection state (blue border + background)
- ✅ Error handling with retry button
- ✅ Preview original message
- ✅ Display adjusted text in highlighted box
- ✅ "Apply" and "Cancel" buttons

#### 3. Integrate into MessageInput ✅
- ✅ Added FormalityAdjuster import and state to MessageInput
- ✅ "✨ Adjust Tone" button appears when text length > 5 characters
- ✅ Button hidden during loading states
- ✅ Updates text in input when formality adjusted
- ✅ User can edit rewritten text before sending
- ✅ Passes detected language for context
- ✅ Beautiful styling consistent with app theme
- ✅ Button styled with blue border and light blue background

#### 4. AI Service Integration ✅
- ✅ `adjustFormality` function already in `messageai/lib/api/aiService.js`
- ✅ Validates formality level parameter
- ✅ Supports optional language parameter
- ✅ Proper error handling

### Testing Checklist ✅
- ✅ Casual tone converts formal to casual correctly
- ✅ Professional tone converts casual to formal
- ✅ Neutral balances between extremes
- ✅ Formal provides professional tone
- ✅ Preserves meaning across rewrites
- ✅ Works with different languages (via language parameter)
- ✅ UI is intuitive and fast
- ✅ Button only shows when text > 5 characters
- ✅ User can edit adjusted text before sending
- ✅ Zero linter errors

### Files Created/Modified
- ✅ `backend/src/formality.js` - Created in PR #17 (already deployed)
- ✅ `messageai/components/chat/FormalityAdjuster.jsx` - NEW
  - Modal interface with 4 formality levels
  - Loading, error, and success states
  - Beautiful UI matching app theme
- ✅ `messageai/components/chat/MessageInput.jsx` - MODIFIED
  - Added FormalityAdjuster integration
  - "✨ Adjust Tone" button (shows when text > 5 chars)
  - State management for modal
  - Handlers for applying adjusted text
- ✅ `messageai/lib/api/aiService.js` - Already has `adjustFormality` function

### Formality Levels Explained
1. **Casual (😊)**: Friendly and relaxed
   - Uses contractions, casual language
   - May include emojis
   - Example: "Hey! Can't wait to chat! 😊"

2. **Neutral (💬)**: Balanced and polite
   - Balanced tone, neither too casual nor too formal
   - Polite and clear
   - Example: "Hello, looking forward to our conversation."

3. **Formal (🎩)**: Professional tone
   - No slang or casual language
   - Professional and respectful
   - Example: "Good morning, I am eager to discuss this matter."

4. **Professional (💼)**: Business formal
   - Highest formality level
   - Business-appropriate language
   - Example: "Dear colleague, I would appreciate the opportunity to engage in discourse regarding this subject."

### User Experience Flow
1. User types a message (e.g., "hey can u help me with this?")
2. When text length > 5 characters, "✨ Adjust Tone" button appears
3. User taps the button → FormalityAdjuster modal opens
4. Modal shows original message preview
5. User sees 4 formality level options with emojis
6. User taps a formality level (e.g., "Professional")
7. Loading indicator appears: "Adjusting tone..."
8. Adjusted text appears: "Good morning, could you please assist me with this matter?"
9. User taps "Apply" → Text updates in input field
10. User can edit further or send message

---

## PR #21: Context-Aware Smart Replies 💬

**Estimated Time:** 4-6 hours  
**Priority:** 🔥🔥 HIGH (Advanced Feature)  
**Branch:** `feature/smart-replies`  
**Depends on:** PR #18, PR #20

### Objectives
- Generate 3 contextual quick reply suggestions
- Match user's typical communication style
- Work in detected language automatically
- Use RAG to access conversation history

### Tasks

#### 1. Smart Replies Cloud Function with RAG (2 hours)
- Create `functions/src/smartReplies.js`
- Implement `generateSmartReplies` HTTPS callable function
- Fetch recent conversation history (RAG - last 5 messages)
- Analyze user's communication style from past messages
- Generate 3 reply options with varying lengths:
  - Short & friendly (5-10 words)
  - Medium & thoughtful (10-20 words)
  - Detailed & engaged (20-40 words)
- Match user's tone, emoji usage, and style
- Work in detected language automatically
- Implement `fetchConversationContext` helper
  - Query Firestore for recent messages
  - Include sender names for context
  - Return chronologically ordered
- Implement `analyzeUserStyle` helper
  - Fetch user's recent sent messages (50+)
  - Use LLM to analyze tone, emoji usage, length
  - Cache analysis for 7 days
  - Return default style for new users

#### 2. Frontend: Smart Reply Chips (2 hours)
- Create `components/chat/SmartReplyChips.jsx`
- Fetch smart replies when receiving new message
- Display 3 reply options as horizontal chips
- Show loading state while generating
- Handle tap to fill/send message
- Auto-refresh on new messages
- Hide when user starts typing
- Style as pill-shaped buttons

#### 3. Integrate into Chat Screen (60 min)
- Add SmartReplyChips above MessageInput
- Pass last received message as prop
- Pass conversation ID for context
- Pass detected language
- Handle reply selection (fill input or send immediately)
- Only show for received messages (not own messages)

#### 4. Add User Style Caching (30 min)
- Create Firestore collection `user_styles`
- Store analyzed style with timestamp
- Cache for 7 days before re-analyzing
- Update cache as more messages sent
- Handle new users with no message history

### Testing Checklist
- [ ] Smart replies appear after receiving message
- [ ] Replies match conversation context
- [ ] Replies match user's communication style
- [ ] Works in detected language
- [ ] Tapping reply fills/sends message
- [ ] Loading state shows while generating
- [ ] Falls back gracefully on errors
- [ ] New users get generic friendly replies

### Files to Create/Modify
- `functions/src/smartReplies.js` - NEW
- `messageai/components/chat/SmartReplyChips.jsx` - NEW
- `messageai/app/chat/[id].jsx` - MODIFY
- `messageai/lib/api/ai.js` - MODIFY

---

## PR #22: AI Feature Polish & Error Handling 🎨

**Estimated Time:** 3-4 hours  
**Priority:** 🔥 MEDIUM  
**Branch:** `feature/ai-polish`  
**Depends on:** All previous AI PRs

### Objectives
- Add loading states for all AI features
- Implement error handling and retries
- Add rate limiting to prevent abuse
- Optimize caching to reduce costs
- Add user preferences for AI features

### Tasks

#### 1. Loading States & Error UI (90 min)
- Create `components/ai/AILoadingState.jsx`
  - Generic loading component for all AI features
  - Show feature-specific messages
  - Animated spinner
- Create `components/ai/AIErrorState.jsx`
  - User-friendly error messages
  - Retry button functionality
  - Handle different error types
- Apply to all AI features (translation, formality, etc.)

#### 2. Rate Limiting (60 min)
- Create `functions/src/utils/rateLimit.js`
- Implement rate limit checking (100 calls/hour per user)
- Query recent AI usage from logs
- Throw error when limit exceeded
- Return remaining calls and reset time
- Add rate limit check to all cloud functions
- Display rate limit info to user

#### 3. AI Preferences Screen (90 min)
- Create `app/(tabs)/ai-settings.jsx`
- Add settings for:
  - Auto-detect language (toggle)
  - Show cultural hints (toggle)
  - Enable smart replies (toggle)
  - Preferred translation language (picker)
  - Default formality level (picker)
- Display usage statistics:
  - Translations this month
  - Smart replies used
  - Cultural hints viewed
- Save preferences to Firestore
- Apply preferences throughout app

#### 4. Cost Tracking Dashboard (60 min)
- Create `functions/src/utils/costTracking.js`
- Implement token estimation
- Calculate costs per model (GPT-4o-mini)
- Log all AI usage with cost estimates
- Create monthly usage summary function
- Display cost breakdown by feature
- Show total estimated monthly cost

### Testing Checklist
- [ ] Loading states appear for all AI features
- [ ] Error messages are user-friendly
- [ ] Retry buttons work correctly
- [ ] Rate limiting prevents abuse (test with 100+ calls)
- [ ] User preferences save and apply
- [ ] Cost tracking accurately estimates usage
- [ ] Cache reduces duplicate AI calls

### Files to Create/Modify
- `messageai/components/ai/AILoadingState.jsx` - NEW
- `messageai/components/ai/AIErrorState.jsx` - NEW
- `messageai/app/(tabs)/ai-settings.jsx` - NEW
- `functions/src/utils/rateLimit.js` - NEW
- `functions/src/utils/costTracking.js` - NEW
- All cloud functions - MODIFY (add rate limiting)

---

## PR #23: Demo Preparation & Documentation 📹

**Estimated Time:** 4-6 hours  
**Priority:** 🔥🔥 CRITICAL  
**Branch:** `feature/demo-docs`  
**Depends on:** All previous PRs

### Objectives
- Create comprehensive demo video (5-7 minutes)
- Write persona brainlift document
- Update README with AI features
- Prepare test scenarios
- Polish UI for recording

### Tasks

#### 1. Demo Script & Test Scenarios (90 min)
- Write detailed demo script (7 minutes)
- Part 1: Real-Time Messaging Infrastructure (2 min)
  - Show login, real-time delivery
  - Demonstrate offline sync
  - Show group chat
  - Demonstrate read receipts and typing
- Part 2: Language Detection & Translation (2 min)
  - Show auto-detection with language badge
  - Demonstrate translation to multiple languages
  - Show translation caching
- Part 3: Cultural Context & Idiom Explanations (1.5 min)
  - Show idiom detection with ? icon
  - Demonstrate explanation modal
  - Test with multiple idioms
- Part 4: Formality Adjustment (1.5 min)
  - Show tone adjustment UI
  - Demonstrate 4 formality levels
  - Show meaning preservation
- Part 5: Smart Replies (1 min)
  - Show contextual reply generation
  - Demonstrate 3 reply options
  - Show one-tap send
- Prepare backup scenarios
- Create shot list for recording

#### 2. Record Demo Video (2-3 hours)
- Set up two devices (or simulator + physical)
- Use screen recording software (OBS/QuickTime)
- Record in 1080p or higher
- Add voiceover explaining features
- Record multiple takes if needed
- Edit for smooth flow and timing
- Add intro/outro slides with project info
- Add subtitles/captions for accessibility
- Export in high quality
- Upload to YouTube/Vimeo

#### 3. Persona Brainlift Document (60 min)
- Create `PERSONA_BRAINLIFT.md`
- Section: Who They Are
  - Define International Communicator persona
  - List demographics and use cases
- Section: Their Pain Points
  - Language barriers
  - Translation friction
  - Cultural misunderstandings
  - Formality confusion
  - Response time slowness
- Section: How Each Feature Solves Real Problems
  - Map each of 5 features to specific pain points
  - Explain impact and value
- Section: Key Technical Decisions
  - Why OpenAI GPT-4o-mini
  - Why RAG for smart replies
  - Why translation caching
  - Why rate limiting
- Section: Success Metrics
  - Define measurable outcomes
  - Set targets for adoption
- Section: What Makes This Unique
  - Compare to alternatives
  - Highlight differentiators
- Section: Future Enhancements
  - List post-MVP features

#### 4. Update README (90 min)
- Update project overview with AI features
- Add comprehensive feature list
- Document all 5 AI features with descriptions
- Add technical architecture section
- Update setup instructions for Cloud Functions
- Document OpenAI API key configuration
- Add cost analysis section
- Include persona description
- Add link to demo video
- Update testing section
- Add deployment instructions
- Include screenshots/GIFs

#### 5. Create Social Post (15 min)
- Write 2-3 sentence description
- Highlight key features and persona
- Include demo video link or screenshots
- Tag @GauntletAI
- Post to X/Twitter or LinkedIn

### Testing Checklist
- [ ] Demo video recorded and edited
- [ ] All 5 AI features demonstrated clearly
- [ ] Video is 5-7 minutes long
- [ ] Persona brainlift document complete
- [ ] README updated with AI features
- [ ] GitHub repository cleaned up
- [ ] All files committed and pushed
- [ ] Social post published

### Files to Create/Modify
- `README.md` - MAJOR UPDATE
- `PERSONA_BRAINLIFT.md` - NEW
- `DEMO_SCRIPT.md` - NEW
- Demo video file - NEW
- Screenshots for README - NEW

---

## Timeline & Dependencies

### Day 1 (Wednesday) - Foundation
- **Morning:** PR #17 (Cloud Functions Setup) - 2-3 hours
- **Afternoon:** PR #18 (Translation & Detection) - 3-4 hours
- **Evening:** PR #19 (Cultural Context) - 2-3 hours
- **Total:** 7-10 hours

### Day 2 (Thursday) - Core AI Features
- **Morning:** PR #20 (Formality Adjustment) - 2 hours
- **Afternoon/Evening:** PR #21 (Smart Replies) - 4-6 hours
- **Total:** 6-8 hours

### Day 3 (Friday) - Polish & Early Submission
- **Morning:** PR #22 (Polish & Error Handling) - 3-4 hours
- **Afternoon:** PR #23 Start (Demo prep) - 2 hours
- **Evening:** Record demo video - 2-3 hours
- **Submit early version Friday evening** ✅
- **Total:** 7-9 hours

### Day 4 (Saturday) - Optional Polish
- Final bug fixes
- Improve demo video
- Add any nice-to-have features

### Day 5 (Sunday) - Final Submission
- Final testing
- Complete all documentation
- **Submit by 10:59 PM CT** ✅

---

## Success Criteria

### MVP (Already Complete ✅)
- [x] Real-time messaging
- [x] Offline sync
- [x] Group chat
- [x] Read receipts
- [x] Push notifications

### AI Features (To Complete)
- [ ] All 5 required features working
- [ ] 1 advanced feature (Smart Replies) working
- [ ] Demo video (5-7 minutes)
- [ ] Persona brainlift document
- [ ] Updated README
- [ ] Deployed and testable

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| OpenAI API costs too high | Use GPT-4o-mini, implement aggressive caching, rate limiting |
| Translation quality poor | Add user feedback, cache good translations, iterate prompts |
| Smart replies sound robotic | Use RAG to learn user style, provide 3 options to choose from |
| Demo recording fails | Practice script multiple times, have backup scenarios |
| Time runs out | Focus on PRs #17-21 first (core features), skip PR #22 if needed |

---

## Estimated Total Time

| Phase | Hours |
|-------|-------|
| PR #17: Cloud Functions | 2-3 |
| PR #18: Translation | 3-4 |
| PR #19: Cultural Context | 2-3 |
| PR #20: Formality | 2 |
| PR #21: Smart Replies | 4-6 |
| PR #22: Polish | 3-4 |
| PR #23: Demo & Docs | 4-6 |
| **Total** | **20-28 hours** |

**Timeline:** 3-4 days (Wednesday → Saturday/Sunday)

---

## Quick Reference

### All PRs at a Glance
1. **PR #17** - Cloud Functions Setup (2-3h) - FOUNDATION
2. **PR #18** - Translation & Language Detection (3-4h) - CORE
3. **PR #19** - Cultural Context & Idioms (2-3h) - CORE
4. **PR #20** - Formality Adjustment (2h) - CORE
5. **PR #21** - Smart Replies (4-6h) - ADVANCED FEATURE
6. **PR #22** - Polish & Error Handling (3-4h) - POLISH
7. **PR #23** - Demo & Documentation (4-6h) - DELIVERY

### Priority Order
1. PR #17 (Must do first - foundation)
2. PR #18 (Core feature #1 & #2)
3. PR #19 (Core feature #3 & #5)
4. PR #20 (Core feature #4)
5. PR #21 (Advanced feature)
6. PR #23 (Demo - critical for submission)
7. PR #22 (Nice to have - can skip if time-constrained)

