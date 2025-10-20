# MessageAI MVP - Product Requirements Document

**Project Timeline:** 24 Hours for MVP  
**Hard Deadline:** Tuesday  
**Version:** 1.0  
**Last Updated:** October 20, 2025

---

## Executive Summary

MessageAI MVP is a production-quality messaging application focused on delivering reliable, real-time chat functionality across mobile platforms. The MVP phase prioritizes core messaging infrastructure—message delivery, persistence, and synchronization—before any AI features are added.

**Success Criteria:** A simple, reliable messaging app with solid message delivery is more valuable than a feature-rich app with flaky sync.

---

## User Stories

### Primary User: Mobile App User

**As a mobile app user, I want to:**

1. **Send and receive messages in real-time** so I can communicate instantly with others
   - Acceptance: Messages appear within 2 seconds for online recipients
   - Acceptance: UI updates optimistically before server confirmation

2. **Continue conversations after closing the app** so my chat history is preserved
   - Acceptance: All messages persist locally through app restarts
   - Acceptance: Chat history loads immediately on app open

3. **Know when my messages are delivered and read** so I understand message status
   - Acceptance: Clear visual indicators for: sending, sent, delivered, read
   - Acceptance: Read receipts update in real-time

4. **See when others are online** so I know if they're available
   - Acceptance: Online/offline status visible for each contact
   - Acceptance: Status updates within 5 seconds of state change

5. **Chat with multiple people simultaneously** so I can manage group conversations
   - Acceptance: Group chats support 3+ participants
   - Acceptance: Clear attribution showing who sent each message
   - Acceptance: All members see messages in real-time

6. **Send messages even when offline** so network issues don't block communication
   - Acceptance: Messages queue locally when offline
   - Acceptance: Queued messages auto-send when connection returns
   - Acceptance: No messages lost during connectivity issues

7. **Get notified of new messages** so I don't miss important conversations
   - Acceptance: Push notifications work when app is in foreground
   - Acceptance: Notifications show sender and preview

8. **Know when someone is typing** so conversations feel natural
   - Acceptance: "Typing..." indicator appears within 1 second
   - Acceptance: Indicator clears when typing stops

### Secondary User: System Administrator (for testing)

**As a tester, I want to:**

1. **Verify message delivery across devices** so I can confirm reliability
2. **Test offline scenarios** so I can ensure messages sync properly
3. **Simulate poor network conditions** so I can validate resilience
4. **Force-quit and reopen the app** so I can verify persistence

---

## MVP Core Features

### 1. User Authentication
- User registration with email/password or phone number
- User login/logout
- **Onboarding flow:**
  - Prompt for display name on signup
  - Prompt for profile picture on signup (upload or use default avatar)
  - Profile settings screen to update display name and profile picture
- Basic user profiles (display name, profile picture)
- Session management
- **Implementation:** Firebase Auth

### 2. One-on-One Chat
- Send text messages between two users
- Real-time message delivery (< 2 seconds latency)
- Message timestamps (relative and absolute)
- Message read receipts
- Typing indicators
- Optimistic UI updates
- Message delivery states: sending → sent → delivered → read

### 3. Message Persistence
- Local database storage for all messages
- Messages survive app restarts
- Chat history loads immediately on app open
- Offline message queue
- Automatic sync when connection restored

### 4. Group Chat
- Create group conversations (3+ participants)
- Group member list
- Message attribution (show who sent each message)
- Real-time delivery to all participants
- Delivery/read tracking per participant

### 5. Presence & Status
- Online/offline indicators
- Last seen timestamp
- Active status in conversation
- Typing indicators

### 6. Push Notifications
- Foreground notifications (minimum requirement)
- Show sender name and message preview
- Notification badges for unread count

### 7. Real-Time Sync
- WebSocket/real-time connection
- Automatic reconnection on network restore
- Message queue management
- Conflict resolution for offline edits

---

## Recommended Tech Stack

### Platform Choice: **React Native with Expo**

**Rationale:** Fastest path to MVP with cross-platform support

#### Frontend (Mobile)
- **React Native** with **Expo Router**
  - Rapid development cycle
  - Hot reload for faster iteration
  - Expo Go for instant testing
  - Cross-platform code sharing (can add iOS/Android later)
  
- **Expo SQLite** for local persistence
  - Built-in offline storage
  - SQL queries for complex data relationships
  - Good performance for message history

- **Expo Notifications** for push notifications
  - Unified API for iOS/Android
  - Easy setup for foreground notifications

- **React Native component libraries:**
  - React Navigation for routing
  - React Native Gifted Chat (optional UI accelerator)
  - Native Base or React Native Paper for UI components

#### Backend
- **Firebase**
  - **Firestore:** Real-time database with automatic sync
  - **Firebase Auth:** Drop-in authentication
  - **Cloud Functions:** Serverless backend for any custom logic
  - **Firebase Cloud Messaging (FCM):** Push notifications
  - **Firebase Storage:** Image uploads

**Why Firebase:**
- Real-time sync built-in (WebSocket abstraction)
- Offline support out of the box
- Free tier sufficient for MVP
- Handles scaling automatically
- Minimal backend code needed

#### AI Integration (Post-MVP)
- **Anthropic Claude API** or **OpenAI GPT-4**
- Called from Firebase Cloud Functions (keeps API keys secure)
- **Vercel AI SDK** or **LangChain** for agent orchestration

---

## Tech Stack Analysis: Pros, Cons & Pitfalls

### React Native + Expo

**Pros:**
- Fastest time to MVP (24 hours is aggressive)
- Write once, test on iOS and Android simultaneously
- Expo Go allows instant testing without builds
- Large ecosystem and community support
- Hot reload speeds up development significantly
- Easy deployment (Expo Go link for MVP)

**Cons:**
- Some performance overhead vs. native
- Limited access to certain native APIs (though Expo covers most needs)
- Bundle size larger than native apps
- May need to eject from Expo for advanced features later

**Potential Pitfalls:**
- Over-reliance on third-party packages (stick to well-maintained ones)
- Expo SDK version compatibility issues (use stable release)
- Push notification setup can be tricky (prioritize foreground for MVP)
- Real-time performance may need optimization for 20+ rapid messages

**Mitigation:**
- Start with Expo managed workflow, only eject if absolutely necessary
- Test on real devices early (not just simulators)
- Use React.memo and useMemo to prevent unnecessary re-renders
- Implement pagination for message lists (load 50 at a time)

### Firebase

**Pros:**
- Zero infrastructure setup
- Real-time updates handled automatically
- Offline persistence built-in
- Authentication in minutes
- Generous free tier
- Automatic scaling

**Cons:**
- Vendor lock-in (harder to migrate later)
- Cost can scale unexpectedly with reads/writes
- NoSQL data model requires different thinking
- Complex queries can be challenging
- Limited to Firebase's rules engine for security

**Potential Pitfalls:**
- **Firestore read/write costs:** Every real-time listener counts as a read
  - **Mitigation:** Use `.limit()` queries, implement pagination, cache aggressively
- **Security rules:** Easy to misconfigure and expose data
  - **Mitigation:** Start restrictive, test rules thoroughly before deployment
- **Cold start latency** on Cloud Functions (first request after idle)
  - **Mitigation:** Use scheduled functions to keep warm, or accept 2-3s delay
- **Real-time listener management:** Memory leaks if not unsubscribed properly
  - **Mitigation:** Always unsubscribe in cleanup functions (useEffect return)

### Alternative Consideration: Supabase

**If you want to avoid Firebase lock-in:**
- PostgreSQL instead of Firestore (more flexible queries)
- Built-in real-time subscriptions
- Self-hostable
- Slightly more complex setup

**Trade-off:** More manual configuration, slower initial setup (may not fit 24hr timeline)

---

## Out of Scope for MVP

The following features are **NOT** required for MVP and should be deferred:

### Authentication & Security
- ❌ End-to-end encryption (Signal Protocol)
- ❌ Two-factor authentication
- ❌ OAuth social login (Google, Apple)
- ❌ Password reset flow (can use Firebase default)

### Messaging Features
- ❌ Voice messages
- ❌ Video messages
- ❌ File attachments (PDFs, documents)
- ❌ Message editing
- ❌ Message deletion
- ❌ Message forwarding
- ❌ Message reactions (emoji)
- ❌ Pinned messages
- ❌ Message search (beyond basic filtering)

### Group Chat Advanced
- ❌ Group admins/permissions
- ❌ Remove participants
- ❌ Group settings/customization
- ❌ Group profile pictures

### Notifications
- ❌ Background push notifications (nice to have, but not required)
- ❌ Notification settings/preferences
- ❌ Custom notification sounds
- ❌ Notification grouping

### UI/UX Polish
- ❌ Themes (dark mode)
- ❌ Custom chat backgrounds
- ❌ Message animations
- ❌ Stickers/GIFs
- ❌ Chat organization/folders

### Performance Optimizations
- ❌ Message pagination (load all messages for MVP)
- ❌ Image compression
- ❌ Lazy loading of images
- ❌ Caching strategies beyond default

### All AI Features
- ❌ Thread summarization
- ❌ Translation
- ❌ Smart replies
- ❌ Any LLM integration

**Focus:** Core messaging infrastructure must be rock solid before adding any AI features.

---

## Technical Architecture

### Data Models

#### User
```javascript
{
  id: string,
  email: string,
  displayName: string,
  profilePicture: string (URL),
  isOnline: boolean,
  lastSeen: timestamp,
  createdAt: timestamp
}
```

#### Message
```javascript
{
  id: string,
  conversationId: string,
  senderId: string,
  text: string,
  imageUrl?: string,
  timestamp: timestamp,
  status: 'sending' | 'sent' | 'delivered' | 'read',
  readBy: [userId, ...] // for group chats
}
```

#### Conversation
```javascript
{
  id: string,
  type: 'direct' | 'group',
  participants: [userId, ...],
  lastMessage: message snippet,
  lastMessageTime: timestamp,
  createdAt: timestamp
}
```

### Firebase Structure

```
/users/{userId}
/conversations/{conversationId}
/messages/{conversationId}/messages/{messageId}
/presence/{userId}
```

### Local Storage (SQLite)

```sql
-- Messages table for offline persistence
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT,
  sender_id TEXT,
  text TEXT,
  timestamp INTEGER,
  status TEXT,
  synced INTEGER DEFAULT 0
);

-- Conversations table
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  type TEXT,
  last_message TEXT,
  last_message_time INTEGER
);
```

---

## Testing Checklist

### Critical Path Tests

- [ ] Send message from User A → appears on User B in < 2s
- [ ] Messages persist after force-quit and reopen
- [ ] Optimistic UI shows message instantly before send confirmation
- [ ] Offline: Send messages → go online → messages deliver
- [ ] Group chat: 3 users see all messages in real-time
- [ ] Read receipts update when message is viewed
- [ ] Typing indicators appear and clear properly
- [ ] 20+ rapid messages: all deliver in order
- [ ] Poor network: Messages queue and retry
- [ ] Background app: Return to see new messages

---

## Deployment for MVP

**Minimum requirement:** Running on local emulator/simulator with deployed backend

**Ideal (but optional):**
- Expo Go link for instant mobile testing
- TestFlight (iOS) / Internal Testing (Android) if time permits

**Note:** Full app store deployment is NOT required for MVP checkpoint

---

## Success Metrics

**MVP passes if:**
1. ✅ Two devices can chat in real-time
2. ✅ Messages persist through app restart
3. ✅ Offline messages sync when reconnected
4. ✅ Group chat works with 3+ users
5. ✅ Read receipts and online status functional
6. ✅ Optimistic UI updates work
7. ✅ Push notifications work in foreground
8. ✅ App handles poor network gracefully
9. ✅ No critical bugs that break core flows
10. ✅ Backend deployed and accessible

**MVP fails if:**
- Messages fail to deliver reliably
- Messages lost during network issues
- App crashes frequently
- Real-time sync doesn't work
- Persistence doesn't survive restart

---

## Success Metrics

**MVP passes if:**
1. ✅ Two devices can chat in real-time
2. ✅ Messages persist through app restart
3. ✅ Offline messages sync when reconnected
4. ✅ Group chat works with 3+ users
5. ✅ Read receipts and online status functional
6. ✅ Optimistic UI updates work
7. ✅ Push notifications work in foreground
8. ✅ App handles poor network gracefully
9. ✅ No critical bugs that break core flows
10. ✅ Backend deployed and accessible

**MVP fails if:**
- Messages fail to deliver reliably
- Messages lost during network issues
- App crashes frequently
- Real-time sync doesn't work
- Persistence doesn't survive restart

---

## Next Steps

1. **Review this PRD** and provide feedback
2. **Set up development environment**
3. **Begin development sprint**

---

## Notes & Decisions Log

*This section will be updated as key technical decisions are made during development*

- **Date:** 2025-10-20  
  **Decision:** Chose React Native + Expo for fastest MVP path  
  **Rationale:** Cross-platform, hot reload, Expo Go instant testing

---

**Document Status:** Ready for Review  
**Next Review Date:** After initial development sprint

