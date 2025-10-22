# System Patterns: MessageAI MVP

**Last Updated:** October 22, 2025 (Post-MVP Enhancements)

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

## Discovered Patterns (October 22, 2025)

### 13. WhatsApp-Style Read Receipts for Groups

**Problem:** Group chats need per-user read tracking, not binary read status  
**Solution:** Track which users have read each message in a `readBy` array

```javascript
// Message schema in Firestore
{
  id: 'msg123',
  conversationId: 'conv123',
  senderId: 'user1',
  content: 'Hello everyone!',
  readBy: ['user1', 'user2'], // Array of user IDs who have read
  status: 'delivered', // Set to 'read' only when ALL participants read
  timestamp: timestamp
}

// markMessagesAsRead for groups
async function markMessagesAsRead(conversationId, messageIds, userId, conversation) {
  if (conversation.type === 'group') {
    const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
    const messageSnap = await getDoc(messageRef);
    const messageData = messageSnap.data();
    const currentReadBy = messageData.readBy || [];
    
    if (!currentReadBy.includes(userId)) {
      const updatedReadBy = [...currentReadBy, userId];
      const participantsExceptSender = conversation.participantIds.filter(
        id => id !== messageData.senderId
      );
      const allRead = participantsExceptSender.every(id => updatedReadBy.includes(id));
      
      const updateData = {
        readBy: arrayUnion(userId), // Add user to readBy array
      };
      
      if (allRead) {
        updateData.status = 'read'; // Set to 'read' only when ALL read
        updateData.readAt = serverTimestamp();
      }
      
      await updateDoc(messageRef, updateData);
    }
  }
}
```

**Visual Indicators:**
- ✓ (single checkmark) - Sent
- ✓✓ (gray double checkmark) - Some participants read
- ✓✓ (blue double checkmark) - All participants read

**Why this works:**
- Scales to groups of any size
- Matches WhatsApp user expectations
- Provides detailed read receipts (long press → Message Info)
- `arrayUnion` prevents duplicate entries
- Status only changes when ALL non-sender participants read

### 14. On-Demand Presence Fetching Pattern

**Problem:** Continuous presence subscriptions for group members can cause excessive updates and incorrect status  
**Solution:** Fetch presence data only when the UI component needs it

```javascript
// BAD: Continuous subscription in parent component
useEffect(() => {
  const unsubscribe = listenToMultiplePresences(participantIds, (presenceMap) => {
    setPresenceData(presenceMap); // Fires on every presence change
  });
  return () => unsubscribe();
}, [participantIds]);

// GOOD: On-demand fetch in modal
useEffect(() => {
  if (!visible || participants.length === 0) return;
  
  async function fetchPresence() {
    const participantIds = participants.map(p => p.id);
    const presenceMap = await getMultiplePresences(participantIds); // One-time fetch
    
    const updatedParticipants = participants.map(participant => ({
      ...participant,
      isOnline: presenceMap[participant.id]?.isOnline || false,
      lastSeen: presenceMap[participant.id]?.lastSeen,
    }));
    
    setParticipantsWithPresence(updatedParticipants);
  }
  
  fetchPresence();
}, [visible, participants]); // Only fetch when modal opens
```

**Benefits:**
- Reduces unnecessary Firestore reads
- Shows accurate status at the moment user views it
- No continuous background updates for hidden UI
- Cleaner console logs (no excessive presence updates)
- Better performance

### 15. Scroll-to-Unread Pattern (WhatsApp-style)

**Problem:** Users should see unread messages first when opening a chat  
**Solution:** Track first unread message and scroll to it on mount

```javascript
// Identify first unread message (ChatScreen)
const [firstUnreadMessageId, setFirstUnreadMessageId] = useState(null);

useEffect(() => {
  if (!messages || messages.length === 0 || !user) return;
  
  if (firstUnreadMessageId === null) { // Only set once on initial load
    const firstUnread = messages.find(
      msg => msg.senderId !== user.uid && msg.status !== 'read'
    );
    
    if (firstUnread) {
      setFirstUnreadMessageId(firstUnread.id);
    }
  }
}, [messages, user, firstUnreadMessageId]);

// Reset on conversation change
useEffect(() => {
  setFirstUnreadMessageId(null);
}, [conversationId]);

// Scroll to unread in MessageList
useEffect(() => {
  if (messages.length > 0 && flatListRef.current && !hasScrolledToUnread.current) {
    setTimeout(() => {
      if (firstUnreadMessageId) {
        const unreadIndex = messages.findIndex(m => m.id === firstUnreadMessageId);
        
        if (unreadIndex !== -1) {
          try {
            flatListRef.current.scrollToIndex({ 
              index: unreadIndex, 
              animated: false,
              viewPosition: 0.2 // Show unread message 20% from top
            });
          } catch (error) {
            // Fallback if scrollToIndex fails
            flatListRef.current.scrollToEnd({ animated: false });
          }
        }
      } else {
        // No unreads - scroll to bottom
        flatListRef.current.scrollToEnd({ animated: false });
      }
      
      hasScrolledToUnread.current = true;
    }, 500); // Delay to ensure layout complete
  }
}, [messages.length, firstUnreadMessageId]);

// Add onScrollToIndexFailed handler for retry
const handleScrollToIndexFailed = (info) => {
  setTimeout(() => {
    if (flatListRef.current && info.index < messages.length) {
      try {
        flatListRef.current.scrollToIndex({ 
          index: info.index, 
          animated: false,
          viewPosition: 0.2 
        });
      } catch (error) {
        flatListRef.current.scrollToEnd({ animated: false });
      }
    }
  }, 100);
};
```

**Visual Enhancement:**
```javascript
// Show "Unread messages" divider
{showUnreadDivider && (
  <View style={styles.unreadDivider}>
    <View style={styles.unreadDividerLine} />
    <Text style={styles.unreadDividerText}>Unread messages</Text>
    <View style={styles.unreadDividerLine} />
  </View>
)}
```

**Key Learnings:**
- `scrollToIndex` requires items to be laid out (use delay)
- `onScrollToIndexFailed` provides retry mechanism
- `viewPosition: 0.2` shows context above unread message
- Always have fallback to `scrollToEnd`
- Reset scroll flag when changing conversations

### 16. Optimistic Message Cleanup for Offline Sync

**Problem:** Optimistic messages can duplicate after offline sync  
**Solution:** Clean up queued optimistic messages that have been synced

```javascript
// In useMessages hook
const updateMessages = useCallback(async () => {
  const firestoreMessages = firestoreMessagesRef.current;
  const optimisticArray = Array.from(optimisticMessages.current.values());
  
  // Existing cleanup by content/senderId (for online sends)
  optimisticArray.forEach(optMsg => {
    const matchingFirestoreMsg = firestoreMessages.find(
      fm => fm.senderId === optMsg.senderId && 
            fm.content === optMsg.content && 
            Math.abs(fm.timestamp - optMsg.timestamp) < 5000
    );
    if (matchingFirestoreMsg) {
      optimisticMessages.current.delete(optMsg.id);
    }
  });
  
  // NEW: Clean up queued messages that have been synced
  const queuedOptimisticMessages = Array.from(optimisticMessages.current.values())
    .filter(msg => msg.status === 'queued' && msg.id.startsWith('temp-'));
  
  if (queuedOptimisticMessages.length > 0 && conversationId) {
    const localMessages = await getLocalMessages(conversationId);
    const localMessageIds = new Set(localMessages.map(m => m.id));
    
    queuedOptimisticMessages.forEach(queuedMsg => {
      if (!localMessageIds.has(queuedMsg.id)) {
        // Message no longer in local DB = successfully synced and removed
        optimisticMessages.current.delete(queuedMsg.id);
      }
    });
  }
  
  // Merge and sort messages
  const allMessages = [...firestoreMessages, ...Array.from(optimisticMessages.current.values())];
  const sortedMessages = allMessages.sort((a, b) => a.timestamp - b.timestamp);
  setMessages(sortedMessages);
}, [conversationId]);
```

**Why this works:**
- messageSync.js removes synced messages from local database
- Checking local DB tells us which messages have been synced
- Prevents orange "queued" messages from persisting after sync
- User sees seamless transition from queued → sent

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

This system patterns document reflects discovered patterns from actual implementation as of October 22, 2025 (Post-MVP Enhancements).  
**Status: 14/16 PRs Complete + Advanced Features - All Core Patterns Established**

