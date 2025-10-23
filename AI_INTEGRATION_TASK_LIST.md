# MessageAI - AI Integration Task List
## International Communicator Persona

**Timeline:** 3-4 days (Wednesday - Saturday)  
**Early Submission Target:** Friday evening  
**Final Submission:** Sunday 10:59 PM CT  
**Current Status:** MVP Complete ✅ → Now Adding AI Features

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

### 🎯 Now Building: AI Features (48-72 hours)
- International Communicator Persona
- 5 Required AI Features
- 1 Advanced AI Feature
- Demo video & documentation

---

## AI Feature Overview

### Required Features (All 5)
1. **Real-time Translation** - Translate messages to any language
2. **Language Detection** - Auto-detect message language
3. **Cultural Context Hints** - Explain cultural references
4. **Formality Adjustment** - Rewrite messages in different tones
5. **Slang/Idiom Explanations** - Explain unclear phrases

### Advanced Feature (Choose 1)
**Selected:** Context-Aware Smart Replies - Generate quick replies in detected language matching user's style

---

## PR #17: Firebase Cloud Functions Setup ⚡

**Estimated Time:** 2-3 hours  
**Priority:** 🔥🔥🔥 CRITICAL - Must do first  
**Branch:** `feature/ai-cloud-functions-setup`

### Objectives
- Set up Firebase Cloud Functions project
- Configure OpenAI/Anthropic API integration
- Create base infrastructure for AI calls
- Set up error handling and rate limiting

### Tasks

#### 1. Initialize Cloud Functions (30 min)
- Initialize Firebase Functions in project
- Select JavaScript and ESLint
- Install required packages: `openai`, `anthropic`, `firebase-admin`

#### 2. Create AI Client Utilities (45 min)
- Create `functions/src/utils/aiClient.js` with OpenAI wrapper
- Implement `callOpenAI()` function with error handling
- Add temperature and token limit options
- Handle API errors gracefully

#### 3. Set up Environment Variables (15 min)
- Configure Firebase Functions with OpenAI API key
- Configure Firebase Functions with Anthropic API key (optional)
- Document environment setup in README

#### 4. Create Base Cloud Functions Structure (30 min)
- Create `functions/index.js` with function exports
- Set up separate files for each AI function
- Initialize Firebase Admin
- Create basic function templates

#### 5. Deploy and Test (30 min)
- Deploy functions to Firebase
- Test with curl/Postman
- Verify environment variables load correctly
- Test error handling

### Database Schema Updates
- Create `ai_usage_log` table for tracking API usage
- Create `translation_cache` table for caching translations

### Testing Checklist
- [ ] Functions deploy successfully
- [ ] Environment variables load correctly
- [ ] OpenAI API calls work
- [ ] Error handling catches API failures
- [ ] Rate limiting prevents abuse

### Files to Create/Modify
- `functions/package.json` - NEW
- `functions/index.js` - NEW
- `functions/src/utils/aiClient.js` - NEW
- `functions/src/utils/rateLimit.js` - NEW
- `functions/.env` - NEW (don't commit!)
- `messageai/lib/database/schema.js` - MODIFY (add tables)

---

## PR #18: Language Detection & Real-time Translation 🌍

**Estimated Time:** 3-4 hours  
**Priority:** 🔥🔥🔥 CORE FEATURE  
**Branch:** `feature/translation`  
**Depends on:** PR #17

### Objectives
- Implement language detection on messages
- Build translation cloud function
- Add translation UI to message bubbles
- Cache translations to reduce costs

### Tasks

#### 1. Language Detection Cloud Function (45 min)
- Create `functions/src/detect.js`
- Implement `detectLanguage` HTTPS callable function
- Use OpenAI with prompt for language detection
- Return ISO 639-1 language codes (en, es, fr, etc.)
- Add authentication check

#### 2. Translation Cloud Function (60 min)
- Create `functions/src/translate.js`
- Implement `translateMessage` HTTPS callable function
- Check translation cache before calling API
- Call OpenAI for translation with context preservation
- Cache successful translations
- Log usage for cost tracking

#### 3. Frontend: Language Badge Component (30 min)
- Create `components/chat/LanguageBadge.jsx`
- Display country flag emoji for detected language
- Show language code (EN, ES, FR, etc.)
- Style as small badge overlay on message bubble

#### 4. Frontend: Translation Modal (60 min)
- Create `components/chat/TranslationModal.jsx`
- Show original text
- Display language selector grid (8-15 languages)
- Show loading state during translation
- Display translated text with formatting
- Handle errors gracefully

#### 5. Integrate into MessageBubble (45 min)
- Add long-press handler to MessageBubble
- Show action sheet with "Translate" option
- Open TranslationModal on selection
- Display language badge if language detected
- Pass necessary props (text, language, etc.)

#### 6. Auto-detect Language on Send (30 min)
- Modify `useMessages.js` hook
- Call detectLanguage API before sending message
- Store detected language in message object
- Handle detection failures gracefully (default to 'en')

### Database Schema Updates
- Add `detected_language` column to messages table (default 'en')

### Testing Checklist
- [ ] Language detection works for 10+ languages
- [ ] Translation preserves emojis and tone
- [ ] Translation modal UI is smooth
- [ ] Long-press menu works on messages
- [ ] Cache prevents duplicate API calls
- [ ] Works offline (shows cached translations)
- [ ] Language badge displays correctly

### Files to Create/Modify
- `functions/src/detect.js` - NEW
- `functions/src/translate.js` - NEW
- `messageai/components/chat/LanguageBadge.jsx` - NEW
- `messageai/components/chat/TranslationModal.jsx` - NEW
- `messageai/components/chat/MessageBubble.jsx` - MODIFY
- `messageai/lib/api/ai.js` - NEW (API wrapper)
- `messageai/lib/hooks/useMessages.js` - MODIFY
- `messageai/lib/database/schema.js` - MODIFY

---

## PR #19: Cultural Context & Idiom Explanations 🎭

**Estimated Time:** 2-3 hours  
**Priority:** 🔥🔥 HIGH  
**Branch:** `feature/cultural-context`  
**Depends on:** PR #18

### Objectives
- Detect cultural references and idioms in messages
- Provide context explanations
- Add "?" tooltip UI for unclear phrases

### Tasks

#### 1. Cultural Context Cloud Function (60 min)
- Create `functions/src/culturalContext.js`
- Implement `explainPhrase` function
  - Takes phrase, full message, and language
  - Returns 2-3 sentence explanation
  - Explains literal meaning, cultural context, and usage
- Implement `detectCulturalReferences` function
  - Analyzes message for idioms/slang/cultural references
  - Returns JSON array with phrase and position
  - Handles multiple references per message

#### 2. Frontend: Cultural Context Tooltip (45 min)
- Create `components/chat/CulturalTooltip.jsx`
- Show "?" icon button next to phrases
- Open modal with explanation on tap
- Display loading state while fetching
- Show phrase and detailed explanation
- Handle errors with retry option

#### 3. Integrate into MessageBubble (60 min)
- Detect cultural references when message loads
- Call `detectCulturalReferences` API
- Parse message text and insert tooltips
- Render text with inline tooltip buttons
- Handle multiple references in one message
- Cache detections to avoid redundant API calls

### Testing Checklist
- [ ] Detects common idioms ("break the ice", "piece of cake", etc.)
- [ ] Detects cultural references (holidays, traditions, etc.)
- [ ] Tooltip appears on tap
- [ ] Explanations are clear and concise
- [ ] Works for multiple languages
- [ ] Doesn't break on messages without idioms

### Files to Create/Modify
- `functions/src/culturalContext.js` - NEW
- `messageai/components/chat/CulturalTooltip.jsx` - NEW
- `messageai/components/chat/MessageBubble.jsx` - MODIFY
- `messageai/lib/api/ai.js` - MODIFY

---

## PR #20: Formality Adjustment 👔

**Estimated Time:** 2 hours  
**Priority:** 🔥🔥 HIGH  
**Branch:** `feature/formality-adjustment`  
**Depends on:** PR #18

### Objectives
- Rewrite messages in different formality levels
- Add UI in message composer to adjust tone
- Support casual, neutral, formal, and professional tones

### Tasks

#### 1. Formality Adjustment Cloud Function (45 min)
- Create `functions/src/formality.js`
- Implement `adjustFormality` HTTPS callable function
- Define formality levels:
  - Casual: friendly, contractions, emojis
  - Neutral: balanced and polite
  - Formal: professional, no slang
  - Professional: business formal
- Use OpenAI to rewrite text
- Preserve meaning and important details
- Log usage for cost tracking

#### 2. Frontend: Formality Adjuster UI (75 min)
- Create `components/chat/FormalityAdjuster.jsx`
- Show "✨ Adjust Tone" button
- Display 4 formality level options with emojis
- Show level descriptions
- Display loading state during adjustment
- Show active selection state
- Handle errors with user-friendly messages

#### 3. Integrate into MessageInput (30 min)
- Add FormalityAdjuster to MessageInput component
- Only show when text length > 5 characters
- Update text in input when formality adjusted
- Allow user to edit rewritten text before sending
- Pass detected language for context

### Testing Checklist
- [ ] Casual tone converts formal to casual correctly
- [ ] Professional tone converts casual to formal
- [ ] Neutral balances between extremes
- [ ] Preserves meaning across rewrites
- [ ] Works with different languages
- [ ] UI is intuitive and fast

### Files to Create/Modify
- `functions/src/formality.js` - NEW
- `messageai/components/chat/FormalityAdjuster.jsx` - NEW
- `messageai/components/chat/MessageInput.jsx` - MODIFY
- `messageai/lib/api/ai.js` - MODIFY

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

