# System Patterns: MessageAI MVP

**Last Updated:** October 21, 2025 (Evening Update)

---

## Architecture Overview

MessageAI follows a **mobile-first, offline-first architecture** with real-time synchronization.

```
┌─────────────────────────────────────────────────┐
│           React Native + Expo App               │
│                                                 │
│  ┌──────────────┐        ┌──────────────┐     │
│  │   UI Layer   │◄──────►│  Local Store │     │
│  │  (Screens,   │        │   (SQLite)   │     │
│  │  Components) │        │              │     │
│  └──────────────┘        └──────────────┘     │
│         ▲                        ▲             │
│         │                        │             │
│         ▼                        ▼             │
│  ┌──────────────┐        ┌──────────────┐     │
│  │   Hooks      │◄──────►│ Sync Engine  │     │
│  │  (useAuth,   │        │  (Offline    │     │
│  │  useMessages)│        │   Queue)     │     │
│  └──────────────┘        └──────────────┘     │
│         ▲                        ▲             │
│         └────────────┬───────────┘             │
│                      ▼                         │
│              ┌──────────────┐                  │
│              │   Firebase   │                  │
│              │   SDK Layer  │                  │
│              └──────────────┘                  │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │      Firebase Backend        │
        │  ┌────────┐  ┌────────┐     │
        │  │Firestore│  │  Auth  │     │
        │  └────────┘  └────────┘     │
        │  ┌────────┐  ┌────────┐     │
        │  │Storage │  │  FCM   │     │
        │  └────────┘  └────────┘     │
        └──────────────────────────────┘
```

---

## Key Technical Decisions

### 1. Offline-First Architecture

**Decision:** Store all messages locally in SQLite, sync with Firestore as secondary  
**Rationale:** Ensures instant app launch and message access, even without network  
**Implementation:**
- SQLite as source of truth for UI rendering
- Firebase Firestore for sync and real-time updates
- Sync engine reconciles local and remote state

### 2. Optimistic UI Updates

**Decision:** Update UI immediately before server confirmation  
**Rationale:** Provides instant feedback, feels more responsive  
**Implementation:**
- Add message to local state immediately
- Show "sending" status
- Update to "sent" when Firebase confirms
- Rollback or retry on failure

### 3. Real-Time Sync Strategy

**Decision:** Use Firestore real-time listeners + local caching  
**Rationale:** Firebase handles WebSocket complexity, provides offline support  
**Implementation:**
- Subscribe to Firestore collections with `.onSnapshot()`
- Update local SQLite when remote changes arrive
- Unsubscribe in cleanup functions to prevent memory leaks

### 4. Message Delivery States

**Decision:** Four-state model: sending → sent → delivered → read  
**Rationale:** Users need clear feedback on message status  
**Implementation:**
```javascript
status: 'sending' | 'sent' | 'delivered' | 'read'
```
- **sending:** Message in local queue, not yet confirmed by server
- **sent:** Server has received message
- **delivered:** Recipient's device has received message
- **read:** Recipient has opened chat and viewed message

---

## Design Patterns in Use

### 1. Context + Hooks Pattern

**Where:** Authentication, Chat state  
**Why:** Avoid prop drilling, centralized state management  
**Example:**
```javascript
// lib/context/AuthContext.jsx
<AuthProvider>
  // Provides user state, login, logout functions
</AuthProvider>

// Usage in components
const { user, login, logout } = useAuth();
```

**✅ Implementation Status:** Working perfectly in production
- AuthContext handles user state globally
- Persists across app restarts
- Auto-updates all components on auth state change

### 2. Custom Hooks for Data Fetching

**Where:** Messages, Conversations, Contacts, Presence  
**Why:** Encapsulates Firebase listeners, cleanup, local sync  
**Example:**
```javascript
// lib/hooks/useMessages.js
const { messages, sendMessage, loading } = useMessages(conversationId);
```

**✅ Implementation Status:** Fully implemented and working
- `useMessages` - Real-time message sync with optimistic updates
- `useConversations` - Conversation list with unread counts
- `useContacts` - Contact management with search
- `useAuth` - Authentication state management

**Key Pattern Discovered:**
```javascript
// Optimistic updates with deduplication
const optimisticMessages = useRef(new Map());

// Add optimistic message immediately
optimisticMessages.current.set(tempId, message);
updateUI();

// Remove when Firestore confirms (matched by content + timestamp)
// This prevents duplicate messages in the UI
```

### 3. Offline Queue Pattern

**Where:** Message sending, sync engine  
**Why:** Ensures no message loss during network issues  
**Implementation:**
```javascript
// When offline
1. Check network status with @react-native-community/netinfo
2. Save message to SQLite offline_queue table
3. Add to in-memory queue with retry tracking
4. Display in UI with "queued" status

// When online
1. Detect network restoration via useNetworkStatus hook
2. Send all queued messages to Firebase with syncQueuedMessages()
3. Update SQLite: delete from queue, save with Firestore ID
4. Update UI status to "sent"
5. Retry failed messages with exponential backoff
```

**✅ Implementation Status:** COMPLETE (PR #11)
- ✅ Messages save to SQLite first (always works)
- ✅ Optimistic UI shows messages immediately
- ✅ Network monitoring with @react-native-community/netinfo
- ✅ Automatic retry on reconnection
- ✅ SQLite offline_queue table for persistent storage
- ✅ Sync engine in messageSync.js with error handling
- ✅ Network status hook for real-time monitoring
- **Result:** Zero message loss during offline periods

### 4. Repository Pattern (Light)

**Where:** `lib/firebase/` and `lib/database/` directories  
**Why:** Separates data access logic from UI  
**Structure:**
- `lib/firebase/firestore.js` - All Firestore operations
- `lib/database/messages.js` - All local message operations
- Hooks compose these repositories

**✅ Implementation Status:** Working well
- Clean separation between Firebase and SQLite layers
- Hooks act as orchestrators between data sources
- Easy to mock for testing
- No direct Firebase/SQLite calls in components

**Pattern Example:**
```javascript
// Component never touches Firebase or SQLite directly
function ChatScreen() {
  const { messages, sendMessage } = useMessages(conversationId);
  // Hook handles both Firebase and SQLite internally
}
```

---

## Component Relationships

### Screen Hierarchy
```
App Root (_layout.jsx)
├── Auth Screens (if not logged in)
│   ├── Login
│   ├── Signup
│   └── Onboarding
│
└── Main App (if logged in)
    ├── Tabs
    │   ├── Conversations List
    │   ├── Contacts List
    │   └── Profile
    │
    ├── Chat Screen (dynamic route)
    └── Group Screen (dynamic route)
```

### Data Flow: Sending a Message
```
1. User types in MessageInput component
2. User taps send button
3. MessageInput calls sendMessage() from useMessages hook
4. useMessages:
   a. Adds message to local state (optimistic update)
   b. Saves to SQLite with synced: false
   c. Checks network status
   d. If online: sends to Firestore
   e. If offline: adds to queue
5. Firebase confirms receipt
6. Update local SQLite synced: true
7. Update message status in UI
```

### Data Flow: Receiving a Message
```
1. Firestore real-time listener fires (from useMessages)
2. New message data arrives
3. Save to local SQLite
4. Update local state
5. UI re-renders with new message
6. Mark message as delivered
7. If chat is open, mark as read
```

---

## Security Patterns

### Firebase Security Rules (to be implemented)
```javascript
// Users can only read/write their own user document
/users/{userId} → allow read, write: if request.auth.uid == userId

// Users can only read conversations they're part of
/conversations/{convId} → allow read: if request.auth.uid in resource.data.participants

// Users can only send messages to conversations they're in
/messages/{convId}/messages → allow write: if userIsParticipant()
```

### Local Data Security
- SQLite data stored in app sandbox (OS-level protection)
- No sensitive data stored unencrypted
- Future: Consider SQLite encryption for production

---

## Performance Patterns

### 1. Pagination (Future Enhancement)
- Load 50 messages at a time
- Infinite scroll for older messages
- Not required for MVP

### 2. Memoization
- Use `React.memo` for message bubbles (prevent re-renders)
- Use `useMemo` for expensive computations
- Use `useCallback` for function props

### 3. FlatList Optimization
- Use `keyExtractor` properly
- Implement `getItemLayout` for fixed-height items
- Use `windowSize` to limit rendered items

---

## Error Handling Patterns

### Network Errors
- Catch all Firebase operations
- Queue messages if network unavailable
- Show user-friendly error messages
- Auto-retry on reconnection

### Validation Errors
- Validate input client-side before sending
- Display inline error messages
- Prevent empty message sends

### Sync Conflicts (Rare)
- Server timestamp wins
- Update local database to match server
- Log conflicts for debugging

---

## Testing Patterns

### Unit Tests
- Test pure functions in isolation
- Mock Firebase SDK
- Test utility functions (validation, formatters)
- Test business logic (offline queue, sync)

### Integration Tests
- Test multiple components working together
- Mock SQLite with in-memory database
- Test critical flows (send message → save → sync)

### Manual Testing
- Use two simulators/devices
- Test offline scenarios (airplane mode)
- Test rapid message sending (20+ messages)
- Test app lifecycle (force quit, reopen)

---

## Discovered Patterns (October 21, 2025)

### 5. Optimistic Message Deduplication

**Problem:** Optimistic messages and Firestore messages can create duplicates  
**Solution:** Match by content + timestamp, not just ID

```javascript
// In useMessages hook
const matchingFirestoreMsg = firestoreMessages.find(
  fm => fm.senderId === optMsg.senderId && 
        fm.content === optMsg.content && 
        Math.abs(fm.timestamp - optMsg.timestamp) < 5000 // Within 5 seconds
);
if (matchingFirestoreMsg) {
  optimisticMessages.current.delete(optMsg.id);
}
```

**Why this works:**
- Temporary IDs are different from Firestore IDs
- Matching by content ensures we find the right message
- Timestamp proximity handles clock skew

### 6. expo-sqlite v16 Sync API Pattern

**Migration:** Old callback-based API → New synchronous API

```javascript
// OLD (expo-sqlite v13)
db.transaction(tx => {
  tx.executeSql('SELECT * FROM users', [], 
    (_, { rows }) => { /* success */ },
    (_, error) => { /* error */ }
  );
});

// NEW (expo-sqlite v16)
const rows = db.getAllSync('SELECT * FROM users');
```

**Benefits:**
- Cleaner code (no nested callbacks)
- Better error handling (try-catch)
- More performant (less overhead)
- Easier to test

**See:** DATABASE_FIX_SUMMARY.md for complete migration details

### 7. Message Status State Machine

**States:** sending → sent → delivered → read

```javascript
// Automatic status progression
1. User sends message → status: 'sending'
2. Firebase confirms → status: 'sent'
3. Recipient's device receives → status: 'delivered'
4. Recipient opens chat → status: 'read'
```

**Implementation:**
- Status tracked in both SQLite and Firestore
- Visual indicators in MessageBubble component
- Automatic updates via Firestore listeners
- Read receipts triggered by chat visibility

### 8. Firebase Listener Cleanup Pattern

**Critical for memory management**

```javascript
// ALWAYS use this pattern
useEffect(() => {
  const unsubscribe = subscribeToMessages(conversationId, (messages) => {
    setMessages(messages);
  });
  
  return () => {
    unsubscribe(); // CRITICAL - prevents memory leaks
  };
}, [conversationId]);
```

**Why this matters:**
- Without cleanup, listeners accumulate on every re-render
- Memory leaks lead to app crashes
- Multiple listeners fire duplicate updates
- All hooks in this app follow this pattern correctly ✅

### 9. Presence System Pattern

**Where:** User online/offline status tracking  
**Why:** Users need to know if recipients are available

**Implementation:**
```javascript
// In app/_layout.jsx - App lifecycle tracking
useEffect(() => {
  const subscription = AppState.addEventListener('change', (nextAppState) => {
    if (nextAppState === 'active') {
      setOnline(user.uid); // Firestore update
    } else if (nextAppState.match(/inactive|background/)) {
      setOffline(user.uid); // Firestore update
    }
  });
  return () => subscription.remove();
}, [user]);

// In chat screen - Real-time presence monitoring
useEffect(() => {
  const unsubscribe = listenToPresence(otherUserId, (presenceData) => {
    setOtherParticipant(prev => ({
      ...prev,
      isOnline: presenceData.isOnline,
      lastSeen: presenceData.lastSeen
    }));
  });
  return () => unsubscribe();
}, [otherUserId]);
```

**Benefits:**
- Automatic online/offline based on app state
- Real-time presence updates via Firestore listeners
- Graceful handling of app crashes (lastSeen timestamp)
- No manual presence management required

**✅ Implementation Status:** Complete (PR #8)

### 10. Group Chat Pattern

**Where:** Multi-user conversations  
**Why:** Support conversations with 3+ participants

**Architecture:**
```javascript
// Conversation document
{
  id: 'conv123',
  type: 'group',
  groupName: 'Team Chat',
  groupPhoto: 'url',
  participantIds: ['user1', 'user2', 'user3'],
  admins: ['user1'],
  createdAt: timestamp,
  lastMessage: 'Hello everyone',
  lastMessageTimestamp: timestamp
}

// Messages include senderId for attribution
{
  id: 'msg123',
  conversationId: 'conv123',
  senderId: 'user2',
  content: 'Hello!',
  timestamp: timestamp
}
```

**UI Patterns:**
- MessageBubble shows sender name for group messages
- ConversationHeader displays group name and participant count
- ConversationListItem shows group badge (👥)
- Create group screen with multi-select contact picker

**✅ Implementation Status:** Complete (PR #9)

### 11. Network Status Monitoring Pattern

**Where:** Offline sync, message sending  
**Why:** Detect online/offline state for intelligent queueing

**Implementation:**
```javascript
// lib/hooks/useNetworkStatus.js
import NetInfo from '@react-native-community/netinfo';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [networkType, setNetworkType] = useState(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected && state.isInternetReachable);
      setNetworkType(state.type);
    });
    return () => unsubscribe();
  }, []);

  return { isOnline, networkType };
}
```

**Usage:**
- Check before Firebase operations
- Queue messages when offline
- Trigger sync when connection restored
- Show offline indicator in UI

**✅ Implementation Status:** Complete (PR #11)

### 12. Keyboard Handling Pattern (Platform-Specific)

**Where:** Chat screen, message input  
**Why:** Prevent keyboard from covering input field

**iOS Approach:**
```javascript
<KeyboardAvoidingView 
  behavior="padding" 
  keyboardVerticalOffset={90}
>
  <MessageList />
  <MessageInput />
</KeyboardAvoidingView>
```

**Android Approach:**
```javascript
// app.json
{
  "android": {
    // Use default "adjustResize" (don't specify softwareKeyboardLayoutMode)
  }
}

// Component
<SafeAreaView>
  <View style={{flex: 1}}>
    <MessageList />
  </View>
  <MessageInput />
</SafeAreaView>
```

**Key Learnings:**
- Android works best with default `adjustResize`
- iOS needs `KeyboardAvoidingView` with `padding` behavior
- Only one `KeyboardAvoidingView` per screen (avoid nesting)
- `SafeAreaView` helps with notch/status bar spacing
- Took multiple iterations to get right!

**✅ Implementation Status:** Complete (after multiple bug fixes)

---

This system patterns document reflects discovered patterns from actual implementation as of October 21, 2025 (Evening Update).  
**Status: 11/16 PRs Complete - Most Core Patterns Established**

