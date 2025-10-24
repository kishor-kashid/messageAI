# MessageAI - AI Integration Task List
## International Communicator Persona

**Timeline:** 3-4 days (Wednesday - Saturday)  
**Early Submission Target:** Friday evening  
**Final Submission:** Sunday 10:59 PM CT  
**Current Status:** MVP Complete ✅ → AI Features (5/7 PRs COMPLETE! ALL 5 REQUIRED FEATURES + BONUS TTS DONE! 🎉🎉)

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
- ✅ **PR #22:** Pronunciation Guide with TTS (mode-aware pronunciation for original and translated text)

### 🎯 AI Features IN PROGRESS
- [ ] **PR #21:** Smart Replies (Advanced Feature)
- [ ] **PR #23:** AI Feature Polish & Error Handling

### 📊 Progress: 5/7 AI PRs Complete (71%)
- Backend Infrastructure: ✅ 100%
- Translation Features: ✅ 100% (with enhancements)
- Cultural Context: ✅ 100% (with translation)
- Formality Adjustment: ✅ 100% (COMPLETE!)
- Pronunciation Guide: ✅ 100% (COMPLETE!)
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

## PR #22: Pronunciation Guide with Text-to-Speech 🔊 ✅ COMPLETE

**Estimated Time:** 1-2 hours  
**Actual Time:** 1.5 hours  
**Priority:** 🔥🔥 HIGH  
**Branch:** `feature/pronunciation-guide`  
**Depends on:** PR #18, PR #19  
**Status:** ✅ **COMPLETED** (October 24, 2025)

### Objectives
- Add text-to-speech pronunciation for messages
- Support both original and translated language pronunciation
- Single speaker icon that adapts based on view mode
- Use device TTS (expo-speech) for offline capability

### Tasks

#### 1. Add Speaker Icon to MessageBubble (30 min)
- Add speaker icon (🔊) next to language badge in MessageBubble
- Only show for text messages with detected language
- Position next to country flag emoji
- Small, unobtrusive design
- Tap to play pronunciation

#### 2. Implement TTS Logic (45 min)
- Use `expo-speech` for on-device text-to-speech
- **Default mode (original text):**
  - Speaker plays text in original/detected language
  - Example: Spanish message → plays in Spanish
- **Translation view mode:**
  - When user taps "See translation", speaker icon updates
  - Speaker plays translated text in user's preferred language
  - Example: Spanish → English translation → plays in English
- Stop any playing audio when switching modes
- Handle language code mapping (ISO 639-1)

#### 3. Add Speaker Icon to TranslationModal (30 min)
- Add speaker icons in translation modal
- One icon for original text (top section)
- One icon for translated text (bottom section)
- Both independently playable
- Show playing state (animated speaker icon)

#### 4. Playback Controls & States (15 min)
- Show playing indicator (animated speaker icon or text)
- Stop button when audio is playing
- Handle errors gracefully (language not supported)
- Add haptic feedback on tap (iOS/Android)
- Prevent multiple simultaneous playbacks


**State Management:**
- Track which message is currently playing
- Track view mode (original vs translation)
- Update speaker icon behavior based on mode

### User Experience Flow

**Scenario 1: Original Message**
```
1. User receives Spanish message: "Hola, ¿cómo estás?"
2. Message shows: "Hola, ¿cómo estás?" 🇪🇸 🔊
3. User taps 🔊 → Plays in Spanish
```

**Scenario 2: Translated View**
```
1. User sees Spanish message: "Hola, ¿cómo estás?" 🇪🇸 🔊
2. User taps "See translation"
3. Message shows: "Hello, how are you?" 🇺🇸 🔊
4. User taps 🔊 → Plays in English
```

**Scenario 3: Translation Modal**
```
1. User opens translation modal
2. Top section: "Hola, ¿cómo estás?" 🇪🇸 🔊
3. Bottom section: "Hello, how are you?" 🇺🇸 🔊
4. User can play either independently
```

### Testing Checklist
- [x] Speaker icon appears next to language badge
- [x] Default mode plays original language
- [x] Translation mode plays translated language
- [x] Only one audio plays at a time
- [x] Playing state shows visual feedback
- [x] Works for 16 supported languages
- [x] Graceful fallback for unsupported languages
- [x] No crashes on rapid tapping
- [x] Audio stops when switching views
- [x] Translation modal has both speakers

### Files to Create/Modify
- `messageai/components/chat/MessageBubble.jsx` - MODIFY
  - Add speaker icon next to language badge
  - Implement TTS logic with mode awareness
  - Handle play/stop states
- `messageai/components/chat/TranslationModal.jsx` - MODIFY
  - Add speaker icons for both languages
  - Implement independent playback
- `messageai/lib/utils/tts.js` - NEW
  - Helper functions for TTS
  - Language code validation
  - Error handling

### Language Support
Uses device's installed TTS voices for:
- English (en), Spanish (es), French (fr), German (de)
- Italian (it), Portuguese (pt), Russian (ru), Japanese (ja)
- Korean (ko), Chinese (zh), Arabic (ar), Hindi (hi)
- Turkish (tr), Dutch (nl), Polish (pl), Swedish (sv)

Fallback: If language not available, show toast message

---

## PR #23: AI Feature Polish & Error Handling 🎨

**Estimated Time:** 3-4 hours  
**Priority:** 🔥 MEDIUM  
**Branch:** `feature/ai-polish`  
**Depends on:** All previous AI PRs

### Objectives
- Add loading states for all AI features
- Implement error handling and retries
- Add rate limiting to prevent abuse
- Optimize caching to reduce costs

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


### Testing Checklist
- [ ] Loading states appear for all AI features
- [ ] Error messages are user-friendly
- [ ] Retry buttons work correctly
- [ ] Rate limiting prevents abuse (test with 100+ calls)
- [ ] Cache reduces duplicate AI calls

### Files to Create/Modify
- `messageai/components/ai/AILoadingState.jsx` - NEW
- `messageai/components/ai/AIErrorState.jsx` - NEW
- `messageai/app/(tabs)/ai-settings.jsx` - NEW
- `functions/src/utils/rateLimit.js` - NEW
- All cloud functions - MODIFY (add rate limiting)

---
