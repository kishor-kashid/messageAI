# MessageAI MVP - Task List & PR Breakdown

**Project:** MessageAI MVP  
**Timeline:** 24 Hours  
**Repository Structure:** React Native (Expo) + Firebase  
**Language:** JavaScript (not TypeScript)

---

## Project File Structure

```
messageai-mvp/
├── app/                          # Expo Router app directory
│   ├── (auth)/                   # Auth-related screens
│   │   ├── login.jsx
│   │   ├── signup.jsx
│   │   └── onboarding.jsx
│   ├── (tabs)/                   # Main app tabs
│   │   ├── conversations.jsx    # Conversation list screen
│   │   ├── contacts.jsx         # Contact list screen
│   │   └── profile.jsx          # User profile screen
│   ├── chat/
│   │   └── [id].jsx             # Individual chat screen (dynamic route)
│   ├── group/
│   │   ├── create.jsx           # Create group screen
│   │   └── [id].jsx             # Group chat screen
│   ├── _layout.jsx              # Root layout
│   └── index.jsx                # Entry point
├── components/                   # Reusable components
│   ├── ui/                      # UI primitives
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Avatar.jsx
│   │   └── LoadingSpinner.jsx
│   ├── chat/                    # Chat-specific components
│   │   ├── MessageBubble.jsx
│   │   ├── MessageList.jsx
│   │   ├── MessageInput.jsx
│   │   ├── TypingIndicator.jsx
│   │   └── ImagePreview.jsx
│   ├── contacts/
│   │   ├── ContactListItem.jsx
│   │   └── AddContactModal.jsx
│   └── conversations/
│       ├── ConversationListItem.jsx
│       └── ConversationHeader.jsx
├── lib/                         # Core logic and utilities
│   ├── firebase/
│   │   ├── config.js           # Firebase initialization
│   │   ├── auth.js             # Auth functions
│   │   ├── firestore.js        # Firestore operations
│   │   ├── storage.js          # Storage operations
│   │   └── presence.js         # Presence/online status
│   ├── database/
│   │   ├── schema.js           # SQLite schema
│   │   ├── messages.js         # Local message operations
│   │   ├── conversations.js    # Local conversation operations
│   │   └── contacts.js         # Local contact operations
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useMessages.js
│   │   ├── useConversations.js
│   │   ├── useContacts.js
│   │   ├── usePresence.js
│   │   └── useImagePicker.js
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── ChatContext.jsx
│   ├── sync/                   # Sync logic
│   │   ├── messageSync.js      # Message synchronization
│   │   ├── offlineQueue.js     # Offline message queue
│   │   └── conflictResolution.js
│   └── utils/
│       ├── validation.js       # Input validation
│       ├── formatters.js       # Date/time formatting
│       └── constants.js        # App constants
├── assets/                      # Images, fonts, etc.
│   ├── images/
│   └── fonts/
├── types/                       # JSDoc type definitions (optional)
│   ├── models.js               # Data models (User, Message, etc.)
│   ├── navigation.js           # Navigation types
│   └── api.js                  # API response types
├── __tests__/                   # Test directory
│   ├── unit/                   # Unit tests
│   │   ├── auth.test.js
│   │   ├── validation.test.js
│   │   ├── formatters.test.js
│   │   ├── offlineQueue.test.js
│   │   └── messageSync.test.js
│   ├── integration/            # Integration tests
│   │   ├── database.test.js
│   │   ├── messaging.test.js
│   │   ├── contacts.test.js
│   │   └── presence.test.js
│   └── setup.js                # Test setup and mocks
├── app.json                     # Expo configuration
├── package.json
├── babel.config.js
├── jest.config.js              # Jest test configuration
├── firebase.config.js          # Firebase config (gitignored)
├── .env                        # Environment variables (gitignored)
├── .gitignore
└── README.md
```

---

## Testing Setup

### Test Framework: Jest + React Native Testing Library

**Install test dependencies:**
```bash
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
npm install --save-dev @react-native-async-storage/async-storage
```

**Test file locations:**
- **Unit tests:** `__tests__/unit/` - Test individual functions in isolation
- **Integration tests:** `__tests__/integration/` - Test multiple components/services working together
- **Test setup:** `__tests__/setup.js` - Mock Firebase, AsyncStorage, etc.

**Running tests:**
```bash
npm test                  # Run all tests
npm test -- --watch      # Run in watch mode
npm test auth.test.js    # Run specific test file
npm test -- --coverage   # Run with coverage report
```

---

## PR Breakdown & Task Checklist

### **PR #1: Project Setup & Firebase Configuration**
**Branch:** `feature/project-setup`  
**Goal:** Initialize Expo project, configure Firebase, set up basic folder structure

#### Tasks:
- [ ] **1.1: Initialize Expo Project**
  - Run `npx create-expo-app messageai-mvp --template blank`
  - Choose JavaScript template
  - **Files created:** `app.json`, `package.json`, `babel.config.js`, basic app structure

- [ ] **1.2: Install Dependencies**
  - Run: `npx expo install firebase expo-sqlite expo-image-picker expo-notifications`
  - Run: `npm install @react-navigation/native react-native-gifted-chat`
  - Run: `npm install --save-dev jest @testing-library/react-native @testing-library/jest-native`
  - **Files modified:** `package.json`

- [ ] **1.3: Configure Jest**
  - Create `jest.config.js`
  - Create `__tests__/setup.js` for test configuration
  - Add test scripts to `package.json`
  - **Files created:** `jest.config.js`, `__tests__/setup.js`
  - **Files modified:** `package.json`

- [ ] **1.4: Create Firebase Project**
  - Go to Firebase Console
  - Create new project: `messageai-mvp`
  - Register iOS and Android apps
  - Download config files
  - **Files created:** `GoogleService-Info.plist`, `google-services.json`

- [ ] **1.5: Configure Firebase in App**
  - Create `lib/firebase/config.js`
  - Add Firebase initialization code
  - Create `.env` file for API keys
  - Add `.env` to `.gitignore`
  - **Files created:** `lib/firebase/config.js`, `.env`
  - **Files modified:** `.gitignore`

- [ ] **1.6: Set Up Folder Structure**
  - Create all directories: `components/`, `lib/`, `types/`, `__tests__/`, etc.
  - Create placeholder files for each directory
  - **Files created:** All directories and placeholder files as per structure above

- [ ] **1.7: Create Type Definitions (JSDoc)**
  - Create `types/models.js` with JSDoc type definitions for User, Message, Conversation, Contact
  - Create `types/navigation.js` for navigation typing
  - **Files created:** `types/models.js`, `types/navigation.js`

- [ ] **1.8: Test Firebase Connection**
  - Create simple test function in `lib/firebase/config.js`
  - Verify Firestore connection
  - **Files modified:** `lib/firebase/config.js`

**Commit Message:** `feat: initialize project with Expo and Firebase configuration`

---

### **PR #2: Authentication System**
**Branch:** `feature/authentication`  
**Goal:** Implement user signup, login, and authentication flow

#### Tasks:
- [ ] **2.1: Create Auth Context**
  - Create `lib/context/AuthContext.jsx`
  - Implement AuthProvider with signup/login/logout
  - Add user state management
  - **Files created:** `lib/context/AuthContext.jsx`

- [ ] **2.2: Implement Firebase Auth Functions**
  - Create `lib/firebase/auth.js`
  - Add `signUpWithEmail()`, `signInWithEmail()`, `signOut()`, `getCurrentUser()`
  - **Files created:** `lib/firebase/auth.js`

- [ ] **2.3: Create Auth Hook**
  - Create `lib/hooks/useAuth.js`
  - Expose auth functions and state
  - **Files created:** `lib/hooks/useAuth.js`

- [ ] **2.4: Build Login Screen**
  - Create `app/(auth)/login.jsx`
  - Add email/password inputs
  - Add login button with loading state
  - Add navigation to signup
  - **Files created:** `app/(auth)/login.jsx`

- [ ] **2.5: Build Signup Screen**
  - Create `app/(auth)/signup.jsx`
  - Add email/password inputs with validation
  - Add signup button
  - Navigate to onboarding after signup
  - **Files created:** `app/(auth)/signup.jsx`

- [ ] **2.6: Build Onboarding Screen**
  - Create `app/(auth)/onboarding.jsx`
  - Add display name input
  - Add profile picture picker
  - Save to Firebase and navigate to main app
  - **Files created:** `app/(auth)/onboarding.jsx`

- [ ] **2.7: Create UI Components**
  - Create `components/ui/Button.jsx`
  - Create `components/ui/Input.jsx`
  - Create `components/ui/Avatar.jsx`
  - **Files created:** `components/ui/Button.jsx`, `components/ui/Input.jsx`, `components/ui/Avatar.jsx`

- [ ] **2.8: Implement Image Upload**
  - Create `lib/firebase/storage.js`
  - Add `uploadProfilePicture()` function
  - Create `lib/hooks/useImagePicker.js`
  - **Files created:** `lib/firebase/storage.js`, `lib/hooks/useImagePicker.js`

- [ ] **2.9: Create User Profile in Firestore**
  - Update `lib/firebase/firestore.js`
  - Add `createUserProfile()`, `updateUserProfile()` functions
  - **Files created:** `lib/firebase/firestore.js`

- [ ] **2.10: Set Up Navigation Guards**
  - Update `app/_layout.jsx`
  - Redirect based on auth state
  - **Files modified:** `app/_layout.jsx`

- [ ] **2.11: Write Unit Tests for Auth Functions**
  - Create `__tests__/unit/auth.test.js`
  - Test `signUpWithEmail()` with valid/invalid inputs
  - Test `signInWithEmail()` with correct/incorrect credentials
  - Test `signOut()` clears user state
  - Mock Firebase auth methods
  - **Files created:** `__tests__/unit/auth.test.js`
  - **Verification:** Run `npm test auth.test.js` - all tests should pass

- [ ] **2.12: Write Unit Tests for Validation**
  - Create `lib/utils/validation.js` (if not exists)
  - Create `__tests__/unit/validation.test.js`
  - Test email validation (valid/invalid formats)
  - Test password validation (length, complexity)
  - Test empty input validation
  - **Files created:** `lib/utils/validation.js`, `__tests__/unit/validation.test.js`
  - **Verification:** Run `npm test validation.test.js` - all tests should pass

**Commit Message:** `feat: implement authentication with signup, login, and onboarding + unit tests`

---

### **PR #3: Local Database & Persistence**
**Branch:** `feature/local-database`  
**Goal:** Set up SQLite for offline message storage

#### Tasks:
- [ ] **3.1: Define SQLite Schema**
  - Create `lib/database/schema.js`
  - Define messages, conversations, contacts tables
  - Add initialization function
  - **Files created:** `lib/database/schema.js`

- [ ] **3.2: Implement Message Database Operations**
  - Create `lib/database/messages.js`
  - Add CRUD functions: `saveMessage()`, `getMessages()`, `updateMessageStatus()`, `deleteMessage()`
  - **Files created:** `lib/database/messages.js`

- [ ] **3.3: Implement Conversation Database Operations**
  - Create `lib/database/conversations.js`
  - Add functions: `saveConversation()`, `getConversations()`, `updateLastMessage()`, `updateUnreadCount()`
  - **Files created:** `lib/database/conversations.js`

- [ ] **3.4: Implement Contact Database Operations**
  - Create `lib/database/contacts.js`
  - Add functions: `saveContact()`, `getContacts()`, `deleteContact()`
  - **Files created:** `lib/database/contacts.js`

- [ ] **3.5: Initialize Database on App Start**
  - Update `app/_layout.jsx`
  - Call database initialization
  - **Files modified:** `app/_layout.jsx`

- [ ] **3.6: Write Integration Tests for Database**
  - Create `__tests__/integration/database.test.js`
  - Test message CRUD operations (create, read, update, delete)
  - Test conversation operations (save, get, update last message)
  - Test contact operations (save, get, delete)
  - Test database persistence across operations
  - Mock SQLite with in-memory database
  - **Files created:** `__tests__/integration/database.test.js`
  - **Verification:** Run `npm test database.test.js` - all CRUD operations should work

**Commit Message:** `feat: implement SQLite local database for offline persistence + integration tests`

---

### **PR #4: Contact Management**
**Branch:** `feature/contacts`  
**Goal:** Build contact list and add contact functionality

#### Tasks:
- [ ] **4.1: Create Firestore Contact Functions**
  - Update `lib/firebase/firestore.js`
  - Add `addContact()`, `getContacts()`, `removeContact()`, `searchUserByEmail()`
  - **Files modified:** `lib/firebase/firestore.js`

- [ ] **4.2: Create Contact Hook**
  - Create `lib/hooks/useContacts.js`
  - Implement real-time contact listening
  - Sync with local database
  - **Files created:** `lib/hooks/useContacts.js`

- [ ] **4.3: Build Contact List Screen**
  - Create `app/(tabs)/contacts.jsx`
  - Display all contacts
  - Add "Add Contact" button
  - Add search functionality
  - **Files created:** `app/(tabs)/contacts.jsx`

- [ ] **4.4: Create Contact List Item Component**
  - Create `components/contacts/ContactListItem.jsx`
  - Show avatar, display name, email
  - Add tap handler to start conversation
  - **Files created:** `components/contacts/ContactListItem.jsx`

- [ ] **4.5: Build Add Contact Modal**
  - Create `components/contacts/AddContactModal.jsx`
  - Add email/phone input
  - Search user in Firestore
  - Add to contacts if found
  - **Files created:** `components/contacts/AddContactModal.jsx`

- [ ] **4.6: Implement Contact Search**
  - Update `lib/firebase/firestore.js`
  - Add email/phone search functionality
  - **Files modified:** `lib/firebase/firestore.js`

- [ ] **4.7: Write Integration Tests for Contacts**
  - Create `__tests__/integration/contacts.test.js`
  - Test adding contact by email (user exists)
  - Test adding contact by email (user doesn't exist - should fail gracefully)
  - Test getting contacts list
  - Test removing contact
  - Mock Firestore operations
  - **Files created:** `__tests__/integration/contacts.test.js`
  - **Verification:** Run `npm test contacts.test.js` - all contact operations should work

- [ ] **4.8: Test Contact Flow on Simulator**
  - Add contact by email
  - Verify appears in contact list
  - Test search functionality
  - **No new files**

**Commit Message:** `feat: implement contact management with add and list functionality + integration tests`

---

### **PR #5: Conversation List & Navigation**
**Branch:** `feature/conversations`  
**Goal:** Build conversation list screen with navigation to chats

#### Tasks:
- [ ] **5.1: Create Conversation Firestore Functions**
  - Update `lib/firebase/firestore.js`
  - Add `getConversations()`, `createConversation()`, `updateConversation()`
  - **Files modified:** `lib/firebase/firestore.js`

- [ ] **5.2: Create Conversation Hook**
  - Create `lib/hooks/useConversations.js`
  - Real-time listener for conversations
  - Sync with local database
  - **Files created:** `lib/hooks/useConversations.js`

- [ ] **5.3: Build Conversation List Screen**
  - Create `app/(tabs)/conversations.jsx`
  - Display all conversations (individual + group)
  - Show last message preview, timestamp, unread count
  - Add navigation to chat on tap
  - **Files created:** `app/(tabs)/conversations.jsx`

- [ ] **5.4: Create Conversation List Item Component**
  - Create `components/conversations/ConversationListItem.jsx`
  - Show avatar, name, last message, time, unread badge
  - Handle online/offline status for direct chats
  - **Files created:** `components/conversations/ConversationListItem.jsx`

- [ ] **5.5: Create Conversation Header Component**
  - Create `components/conversations/ConversationHeader.jsx`
  - Show participant info, online status
  - **Files created:** `components/conversations/ConversationHeader.jsx`

- [ ] **5.6: Implement Create Conversation Logic**
  - Update `lib/firebase/firestore.js`
  - Add logic to check if conversation exists before creating new one
  - **Files modified:** `lib/firebase/firestore.js`

- [ ] **5.7: Add Empty State**
  - Update `app/(tabs)/conversations.jsx`
  - Show prompt to add contacts when no conversations exist
  - **Files modified:** `app/(tabs)/conversations.jsx`

**Commit Message:** `feat: implement conversation list with navigation and real-time updates`

---

### **PR #6: One-on-One Chat & Real-Time Messaging**
**Branch:** `feature/chat-messaging`  
**Goal:** Build chat screen with real-time message delivery

#### Tasks:
- [ ] **6.1: Create Message Firestore Functions**
  - Update `lib/firebase/firestore.js`
  - Add `sendMessage()`, `getMessages()`, `updateMessageStatus()`
  - **Files modified:** `lib/firebase/firestore.js`

- [ ] **6.2: Create Messages Hook**
  - Create `lib/hooks/useMessages.js`
  - Real-time listener for messages in conversation
  - Handle optimistic updates
  - Sync with local database
  - **Files created:** `lib/hooks/useMessages.js`

- [ ] **6.3: Build Chat Screen**
  - Create `app/chat/[id].jsx`
  - Use dynamic route for conversation ID
  - Display messages in reverse chronological order
  - Add message input at bottom
  - **Files created:** `app/chat/[id].jsx`

- [ ] **6.4: Create Message Bubble Component**
  - Create `components/chat/MessageBubble.jsx`
  - Different styles for sent vs received
  - Show timestamp, delivery status (sending/sent/delivered/read)
  - **Files created:** `components/chat/MessageBubble.jsx`

- [ ] **6.5: Create Message List Component**
  - Create `components/chat/MessageList.jsx`
  - Render FlatList of messages
  - Auto-scroll to bottom on new message
  - **Files created:** `components/chat/MessageList.jsx`

- [ ] **6.6: Create Message Input Component**
  - Create `components/chat/MessageInput.jsx`
  - Text input with send button
  - Handle empty messages
  - Show loading state while sending
  - **Files created:** `components/chat/MessageInput.jsx`

- [ ] **6.7: Implement Optimistic UI Updates**
  - Update `lib/hooks/useMessages.js`
  - Add message to local state immediately
  - Update with server response
  - **Files modified:** `lib/hooks/useMessages.js`

- [ ] **6.8: Implement Message Status Tracking**
  - Update `lib/firebase/firestore.js`
  - Track sending → sent → delivered → read
  - Update UI accordingly
  - **Files modified:** `lib/firebase/firestore.js`, `components/chat/MessageBubble.jsx`

- [ ] **6.9: Write Integration Tests for Messaging**
  - Create `__tests__/integration/messaging.test.js`
  - Test sending message (optimistic update)
  - Test receiving message (real-time listener)
  - Test message status updates (sending → sent → delivered → read)
  - Test message ordering (chronological)
  - Test error handling (failed send)
  - Mock Firestore and SQLite
  - **Files created:** `__tests__/integration/messaging.test.js`
  - **Verification:** Run `npm test messaging.test.js` - all messaging flows should work

- [ ] **6.10: Test Real-Time Messaging on Simulators**
  - Open two simulators
  - Send messages back and forth
  - Verify < 2 second delivery
  - **No new files**

**Commit Message:** `feat: implement one-on-one chat with real-time messaging and optimistic UI + integration tests`

---

### **PR #7: Typing Indicators & Read Receipts**
**Branch:** `feature/chat-indicators`  
**Goal:** Add typing indicators and read receipts

#### Tasks:
- [ ] **7.1: Create Typing Indicator Functions**
  - Update `lib/firebase/firestore.js`
  - Add `setTyping()`, `listenToTyping()` functions using Firestore
  - **Files modified:** `lib/firebase/firestore.js`

- [ ] **7.2: Build Typing Indicator Component**
  - Create `components/chat/TypingIndicator.jsx`
  - Show "User is typing..." with animated dots
  - **Files created:** `components/chat/TypingIndicator.jsx`

- [ ] **7.3: Integrate Typing in Chat Screen**
  - Update `app/chat/[id].jsx`
  - Trigger typing indicator on text input change
  - Clear on send or after 3 seconds
  - Display other user's typing state
  - **Files modified:** `app/chat/[id].jsx`

- [ ] **7.4: Implement Read Receipts**
  - Update `lib/firebase/firestore.js`
  - Add `markMessageAsRead()` function
  - Update message status when viewed
  - **Files modified:** `lib/firebase/firestore.js`

- [ ] **7.5: Update Message Bubble for Read Receipts**
  - Update `components/chat/MessageBubble.jsx`
  - Show checkmarks: single (sent), double (delivered), double blue (read)
  - **Files modified:** `components/chat/MessageBubble.jsx`

- [ ] **7.6: Trigger Read Receipts on View**
  - Update `app/chat/[id].jsx`
  - Mark messages as read when chat is opened
  - Use `useEffect` to track visibility
  - **Files modified:** `app/chat/[id].jsx`

**Commit Message:** `feat: add typing indicators and read receipts to chat`

---

### **PR #8: Presence & Online Status**
**Branch:** `feature/presence`  
**Goal:** Show online/offline status and last seen

#### Tasks:
- [ ] **8.1: Create Presence System**
  - Create `lib/firebase/presence.js`
  - Add `setOnline()`, `setOffline()`, `listenToPresence()` functions
  - Use Firestore real-time updates
  - **Files created:** `lib/firebase/presence.js`

- [ ] **8.2: Create Presence Hook**
  - Create `lib/hooks/usePresence.js`
  - Track current user's online status
  - Listen to other users' presence
  - **Files created:** `lib/hooks/usePresence.js`

- [ ] **8.3: Integrate Presence on App Lifecycle**
  - Update `app/_layout.jsx`
  - Set online on app foreground
  - Set offline on app background
  - Use `AppState` listener
  - **Files modified:** `app/_layout.jsx`

- [ ] **8.4: Show Online Status in Conversation List**
  - Update `components/conversations/ConversationListItem.jsx`
  - Display green dot for online users
  - Show "last seen" for offline users
  - **Files modified:** `components/conversations/ConversationListItem.jsx`

- [ ] **8.5: Show Online Status in Chat Header**
  - Update `app/chat/[id].jsx`
  - Display online/offline in chat header
  - **Files modified:** `app/chat/[id].jsx`

- [ ] **8.6: Write Integration Tests for Presence**
  - Create `__tests__/integration/presence.test.js`
  - Test setting user online
  - Test setting user offline
  - Test listening to presence updates
  - Test last seen timestamp updates
  - Mock Firestore presence collection
  - **Files created:** `__tests__/integration/presence.test.js`
  - **Verification:** Run `npm test presence.test.js` - presence updates should work

- [ ] **8.7: Test Presence Updates on Simulators**
  - Open two simulators
  - Background one app, verify offline status shows
  - Foreground app, verify online status shows
  - **No new files**

**Commit Message:** `feat: implement online/offline presence and last seen tracking + integration tests`

---

### **PR #9: Group Chat Functionality**
**Branch:** `feature/group-chat`  
**Goal:** Create and manage group conversations

#### Tasks:
- [ ] **9.1: Create Group Chat Firestore Functions**
  - Update `lib/firebase/firestore.js`
  - Add `createGroupChat()`, `addParticipant()`, `getGroupParticipants()`
  - **Files modified:** `lib/firebase/firestore.js`

- [ ] **9.2: Build Create Group Screen**
  - Create `app/group/create.jsx`
  - Select multiple contacts
  - Add group name input
  - Create group button
  - **Files created:** `app/group/create.jsx`

- [ ] **9.3: Build Group Chat Screen**
  - Create `app/group/[id].jsx`
  - Similar to one-on-one chat but with multiple participants
  - Show sender name on each message
  - **Files created:** `app/group/[id].jsx`

- [ ] **9.4: Update Message Bubble for Groups**
  - Update `components/chat/MessageBubble.jsx`
  - Show sender name for group messages
  - Different styling for own messages
  - **Files modified:** `components/chat/MessageBubble.jsx`

- [ ] **9.5: Handle Group Message Delivery**
  - Update `lib/firebase/firestore.js`
  - Track delivery/read status per participant
  - **Files modified:** `lib/firebase/firestore.js`

- [ ] **9.6: Update Conversation List for Groups**
  - Update `components/conversations/ConversationListItem.jsx`
  - Show group icon instead of avatar
  - Display group name
  - **Files modified:** `components/conversations/ConversationListItem.jsx`

- [ ] **9.7: Test Group Chat**
  - Create group with 3+ users
  - Send messages from different users
  - Verify all receive messages in real-time
  - **No new files**

**Commit Message:** `feat: implement group chat with multi-user support`

---

### **PR #10: Media Support (Images)**
**Branch:** `feature/media-images`  
**Goal:** Send and receive images in chat

#### Tasks:
- [ ] **10.1: Implement Image Upload to Storage**
  - Update `lib/firebase/storage.js`
  - Add `uploadChatImage()` function
  - Return download URL
  - **Files modified:** `lib/firebase/storage.js`

- [ ] **10.2: Add Image Picker to Message Input**
  - Update `components/chat/MessageInput.jsx`
  - Add image picker button
  - Handle image selection
  - Show loading state during upload
  - **Files modified:** `components/chat/MessageInput.jsx`

- [ ] **10.3: Update Message Model for Images**
  - Update `types/models.js`
  - Add `imageUrl` field to Message type (JSDoc)
  - **Files modified:** `types/models.js`

- [ ] **10.4: Display Image in Message Bubble**
  - Update `components/chat/MessageBubble.jsx`
  - Render image if `imageUrl` exists
  - Show thumbnail with tap to expand
  - **Files modified:** `components/chat/MessageBubble.jsx`

- [ ] **10.5: Create Image Preview Component**
  - Create `components/chat/ImagePreview.jsx`
  - Full-screen modal for viewing images
  - Pinch to zoom functionality
  - **Files created:** `components/chat/ImagePreview.jsx`

- [ ] **10.6: Handle Image Messages in Database**
  - Update `lib/database/messages.js`
  - Store image URL in local database
  - **Files modified:** `lib/database/messages.js`

- [ ] **10.7: Test Image Sending**
  - Select image from gallery
  - Send in chat
  - Verify recipient receives image
  - Test tap to expand
  - **No new files**

**Commit Message:** `feat: add image upload and display in chat messages`

---

### **PR #11: Offline Message Queue & Sync**
**Branch:** `feature/offline-sync`  
**Goal:** Handle offline messaging and synchronization

#### Tasks:
- [ ] **11.1: Create Offline Queue System**
  - Create `lib/sync/offlineQueue.js`
  - Queue messages when offline
  - Store in local database with `synced: false` flag
  - **Files created:** `lib/sync/offlineQueue.js`

- [ ] **11.2: Implement Message Sync Logic**
  - Create `lib/sync/messageSync.js`
  - Detect when online
  - Send queued messages to Firestore
  - Update local database on success
  - **Files created:** `lib/sync/messageSync.js`

- [ ] **11.3: Create Network Status Hook**
  - Create `lib/hooks/useNetworkStatus.js`
  - Monitor online/offline state
  - Use NetInfo library
  - **Files created:** `lib/hooks/useNetworkStatus.js`

- [ ] **11.4: Integrate Offline Queue in Message Sending**
  - Update `lib/hooks/useMessages.js`
  - Check network status before sending
  - Add to queue if offline
  - **Files modified:** `lib/hooks/useMessages.js`

- [ ] **11.5: Trigger Sync on Reconnection**
  - Update `app/_layout.jsx`
  - Listen to network status changes
  - Trigger sync when going online
  - **Files modified:** `app/_layout.jsx`

- [ ] **11.6: Show Offline Indicator in UI**
  - Update `components/chat/MessageBubble.jsx`
  - Show "Waiting to send..." for queued messages
  - **Files modified:** `components/chat/MessageBubble.jsx`

- [ ] **11.7: Write Unit Tests for Offline Queue**
  - Create `__tests__/unit/offlineQueue.test.js`
  - Test adding message to queue when offline
  - Test queue retrieval
  - Test removing message from queue after sync
  - Test queue persistence
  - **Files created:** `__tests__/unit/offlineQueue.test.js`
  - **Verification:** Run `npm test offlineQueue.test.js` - queue operations should work

- [ ] **11.8: Write Unit Tests for Message Sync**
  - Create `__tests__/unit/messageSync.test.js`
  - Test syncing queued messages when online
  - Test handling sync failures (retry logic)
  - Test marking messages as synced
  - Mock network status and Firestore
  - **Files created:** `__tests__/unit/messageSync.test.js`
  - **Verification:** Run `npm test messageSync.test.js` - sync logic should work correctly

- [ ] **11.9: Test Offline Scenario on Simulators**
  - Enable airplane mode
  - Send 5 messages
  - Disable airplane mode
  - Verify all messages send automatically
  - **No new files** Show "Waiting to send..." for queued messages
  - **Files modified:** `components/chat/MessageBubble.tsx`

- [ ] **11.7: Test Offline Scenario**
  - Enable airplane mode
  - Send 5 messages
  - Disable airplane mode
  - Verify all messages send automatically
  - **No new files**

**Commit Message:** `feat: implement offline message queue and automatic sync + unit tests`

---

### **PR #12: Push Notifications**
**Branch:** `feature/push-notifications`  
**Goal:** Implement foreground push notifications

#### Tasks:
- [ ] **12.1: Set Up Expo Notifications**
  - Create `lib/notifications/setup.js`
  - Request notification permissions
  - Get push token
  - **Files created:** `lib/notifications/setup.js`

- [ ] **12.2: Store Push Tokens in Firestore**
  - Update `lib/firebase/firestore.js`
  - Add `savePushToken()` function
  - Save token to user document
  - **Files modified:** `lib/firebase/firestore.js`

- [ ] **12.3: Configure FCM in Firebase**
  - Enable Cloud Messaging in Firebase Console
  - Add server key to `.env`
  - **Files modified:** `.env`

- [ ] **12.4: Create Notification Handler**
  - Create `lib/notifications/handler.js`
  - Handle foreground notifications
  - Show in-app notification banner
  - **Files created:** `lib/notifications/handler.js`

- [ ] **12.5: Send Notification on New Message**
  - Create Firebase Cloud Function (optional for MVP)
  - Or implement client-side notification trigger
  - Send notification to recipient when message sent
  - **Files created:** `functions/sendNotification.js` (if using Cloud Functions)

- [ ] **12.6: Integrate Notifications in App**
  - Update `app/_layout.jsx`
  - Initialize notifications on app start
  - Register listeners
  - **Files modified:** `app/_layout.jsx`

- [ ] **12.7: Test Foreground Notifications**
  - Send message from User A
  - Verify User B sees notification (app in foreground)
  - **No new files**

**Commit Message:** `feat: implement foreground push notifications`

---

### **PR #13: User Profile Management**
**Branch:** `feature/profile-management`  
**Goal:** Allow users to update profile info

#### Tasks:
- [ ] **13.1: Build Profile Screen**
  - Create `app/(tabs)/profile.jsx`
  - Show current display name and profile picture
  - Add edit buttons
  - Add logout button
  - **Files created:** `app/(tabs)/profile.jsx`

- [ ] **13.2: Create Profile Edit Modal**
  - Update `app/(tabs)/profile.jsx`
  - Allow editing display name
  - Allow changing profile picture
  - Save changes to Firestore and Storage
  - **Files modified:** `app/(tabs)/profile.jsx`

- [ ] **13.3: Update Profile Functions**
  - Update `lib/firebase/firestore.js`
  - Add `updateDisplayName()`, `updateProfilePicture()` functions
  - **Files modified:** `lib/firebase/firestore.js`

- [ ] **13.4: Test Profile Update**
  - Change display name
  - Verify updates in conversations and messages
  - Change profile picture
  - Verify updates across app
  - **No new files**

**Commit Message:** `feat: add user profile management with edit functionality`

---

### **PR #14: UI Polish & Loading States**
**Branch:** `feature/ui-polish`  
**Goal:** Add loading spinners, error handling, empty states

#### Tasks:
- [ ] **14.1: Create Loading Spinner Component**
  - Create `components/ui/LoadingSpinner.jsx`
  - Reusable spinner component
  - **Files created:** `components/ui/LoadingSpinner.jsx`

- [ ] **14.2: Add Loading States to Screens**
  - Update `app/(tabs)/conversations.jsx`
  - Update `app/(tabs)/contacts.jsx`
  - Update `app/chat/[id].jsx`
  - Show spinner while data loads
  - **Files modified:** Multiple screen files

- [ ] **14.3: Add Error Handling**
  - Create `lib/utils/errorHandler.js`
  - Add try-catch blocks to all async operations
  - Show user-friendly error messages
  - **Files created:** `lib/utils/errorHandler.js`
  - **Files modified:** All files with async operations

- [ ] **14.4: Create Empty State Components**
  - Update screens with empty states
  - No conversations: "Start chatting by adding contacts"
  - No contacts: "Add your first contact"
  - No messages: "Send your first message"
  - **Files modified:** Screen files

- [ ] **14.5: Add Input Validation**
  - Update `lib/utils/validation.js`
  - Validate email format
  - Validate password strength
  - Validate empty inputs
  - **Files modified:** `lib/utils/validation.js`
  - **Files modified:** Auth screens

- [ ] **14.6: Improve Date/Time Formatting**
  - Create `lib/utils/formatters.js`
  - Format timestamps (Today, Yesterday, date)
  - Format relative time (2 mins ago, 1 hour ago)
  - **Files created:** `lib/utils/formatters.js`
  - **Files modified:** Message and conversation components

- [ ] **14.7: Write Unit Tests for Formatters**
  - Create `__tests__/unit/formatters.test.js`
  - Test timestamp formatting (today, yesterday, older dates)
  - Test relative time formatting (seconds, minutes, hours, days ago)
  - Test edge cases (null, undefined, invalid dates)
  - **Files created:** `__tests__/unit/formatters.test.js`
  - **Verification:** Run `npm test formatters.test.js` - all formatting should work correctly

**Commit Message:** `feat: add UI polish with loading states and error handling + unit tests`

---

### **PR #15: Testing & Bug Fixes**
**Branch:** `feature/testing-fixes`  
**Goal:** Run through testing checklist and fix bugs

#### Tasks:
- [ ] **15.1: Run All Unit Tests**
  - Execute `npm test`
  - Verify all unit tests pass
  - Check test coverage with `npm test -- --coverage`
  - **Verification:** All tests should pass with >70% coverage

- [ ] **15.2: Run All Integration Tests**
  - Execute integration tests specifically
  - Verify database, messaging, contacts, presence tests pass
  - **Verification:** All integration tests should pass

- [ ] **15.3: Run Testing Checklist**
  - Go through all items in testing checklist from PRD
  - Document any bugs found
  - **No new files**

- [ ] **15.4: Fix Critical Bugs**
  - Fix any message delivery issues
  - Fix persistence problems
  - Fix real-time sync issues
  - **Files modified:** Various (depends on bugs found)

- [ ] **15.5: Test Poor Network Conditions**
  - Enable Network Link Conditioner
  - Test on 3G, EDGE
  - Verify messages queue properly
  - **No new files**

- [ ] **15.6: Test Rapid Message Sending**
  - Send 20+ messages quickly
  - Verify all deliver in order
  - Check for race conditions
  - **No new files**

- [ ] **15.7: Test App Lifecycle**
  - Background app during message send
  - Force quit and reopen
  - Verify messages persist
  - **No new files**

- [ ] **15.8: Memory Leak Check**
  - Use React DevTools Profiler
  - Check for unsubscribed listeners
  - Fix any memory leaks
  - **Files modified:** Hook files (cleanup functions)

- [ ] **15.9: Performance Optimization**
  - Add React.memo where needed
  - Optimize FlatList rendering
  - Reduce unnecessary re-renders
  - **Files modified:** Component files

**Commit Message:** `fix: resolve bugs and optimize performance`

---

### **PR #16: Final Polish & Documentation**
**Branch:** `feature/final-polish`  
**Goal:** Prepare for demo and submission

#### Tasks:
- [ ] **16.1: Write Comprehensive README**
  - Update `README.md`
  - Add project description
  - Add setup instructions
  - Add architecture overview
  - Add screenshots
  - Add testing instructions
  - **Files modified:** `README.md`

- [ ] **16.2: Add Code Comments**
  - Comment complex logic
  - Add JSDoc comments to functions
  - **Files modified:** All logic files

- [ ] **16.3: Clean Up Console Logs**
  - Remove debug console.logs
  - Keep only important logs
  - **Files modified:** All files

- [ ] **16.4: Document Test Coverage**
  - Generate coverage report
  - Add coverage badge to README
  - Document what's tested and what's not
  - **Files modified:** `README.md`

- [ ] **16.5: Create Test Summary Document**
  - Document all unit tests and what they verify
  - Document all integration tests and what they verify
  - Add to README or separate TESTING.md
  - **Files created:** `TESTING.md` (optional)

- [ ] **16.6: Test on Physical Device**
  - Deploy to physical phone if available
  - Test all features
  - Record demo video
  - **No new files**

- [ ] **16.7: Create Demo Video**
  - Record 5-7 minute demo
  - Show all MVP features
  - Show testing scenarios (offline, group chat, etc.)
  - **No new files**

- [ ] **16.8: Update Firestore Security Rules**
  - Switch from test mode to production rules
  - Test rules with Firebase emulator
  - **No new files** (Firebase Console)

- [ ] **16.9: Final Code Review**
  - Review all code for quality
  - Check for TODO comments
  - Ensure consistent code style
  - **Files modified:** Various (cleanup)

- [ ] **16.10: Run Final Test Suite**
  - Execute all unit and integration tests
  - Verify 100% pass rate
  - Generate final coverage report
  - **Verification:** All tests pass, coverage documented

**Commit Message:** `docs: add comprehensive documentation and final polish`

---

## Quick Reference: File → Feature Mapping

| Feature | Primary Files |
|---------|--------------|
| Authentication | `lib/firebase/auth.js`, `lib/context/AuthContext.jsx`, `app/(auth)/*` |
| Contacts | `lib/firebase/firestore.js`, `app/(tabs)/contacts.jsx`, `components/contacts/*` |
| Conversations | `app/(tabs)/conversations.jsx`, `components/conversations/*` |
| Chat/Messaging | `app/chat/[id].jsx`, `components/chat/*`, `lib/hooks/useMessages.js` |
| Group Chat | `app/group/*`, same chat components |
| Presence | `lib/firebase/presence.js`, `lib/hooks/usePresence.js` |
| Media | `lib/firebase/storage.js`, `components/chat/ImagePreview.jsx` |
| Offline Sync | `lib/sync/*`, `lib/database/*` |
| Notifications | `lib/notifications/*` |
| Profile | `app/(tabs)/profile.jsx` |
| **Tests** | `__tests__/unit/*`, `__tests__/integration/*` |

---

## Test Coverage Summary

### Unit Tests (6 test files)
| Test File | What It Verifies | Files Tested |
|-----------|------------------|--------------|
| `auth.test.js` | Auth functions work correctly | `lib/firebase/auth.js` |
| `validation.test.js` | Input validation logic | `lib/utils/validation.js` |
| `formatters.test.js` | Date/time formatting | `lib/utils/formatters.js` |
| `offlineQueue.test.js` | Message queuing when offline | `lib/sync/offlineQueue.js` |
| `messageSync.test.js` | Sync logic when reconnecting | `lib/sync/messageSync.js` |

**Total Unit Tests:** ~50-60 individual test cases

### Integration Tests (4 test files)
| Test File | What It Verifies | Components Tested |
|-----------|------------------|-------------------|
| `database.test.js` | Local database CRUD operations | All `lib/database/*` files |
| `contacts.test.js` | Contact management flow | `lib/firebase/firestore.js`, `lib/hooks/useContacts.js` |
| `messaging.test.js` | End-to-end messaging flow | `lib/firebase/firestore.js`, `lib/hooks/useMessages.js`, database |
| `presence.test.js` | Online/offline status updates | `lib/firebase/presence.js`, `lib/hooks/usePresence.js` |

**Total Integration Tests:** ~30-40 individual test cases

---

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npm test auth.test.js
npm test messaging.test.js
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Generate Coverage Report
```bash
npm test -- --coverage
```

### Run Only Unit Tests
```bash
npm test __tests__/unit
```

### Run Only Integration Tests
```bash
npm test __tests__/integration
```

---

## Test Verification Checklist

Use this checklist to verify tests are working correctly:

- [ ] **PR #2:** `npm test auth.test.js` - All auth tests pass
- [ ] **PR #2:** `npm test validation.test.js` - All validation tests pass
- [ ] **PR #3:** `npm test database.test.js` - All database tests pass
- [ ] **PR #4:** `npm test contacts.test.js` - All contact tests pass
- [ ] **PR #6:** `npm test messaging.test.js` - All messaging tests pass
- [ ] **PR #8:** `npm test presence.test.js` - All presence tests pass
- [ ] **PR #11:** `npm test offlineQueue.test.js` - All queue tests pass
- [ ] **PR #11:** `npm test messageSync.test.js` - All sync tests pass
- [ ] **PR #14:** `npm test formatters.test.js` - All formatter tests pass
- [ ] **PR #15:** `npm test` - All tests pass with >70% coverage

---


**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### PR Process
1. Create feature branch from `main`
2. Complete all tasks in PR checklist
3. **Write and run tests** (if applicable)
4. Test thoroughly on simulator
5. Commit with descriptive message
6. Push branch to GitHub
7. Create Pull Request
8. Review code (self-review for MVP)
9. **Verify all tests pass** before merging
10. Merge to `main`
11. Delete feature branch
12. Pull latest `main` before starting next PR

---