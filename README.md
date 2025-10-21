# MessageAI MVP

A modern, feature-rich mobile messaging application built with React Native and Firebase, featuring real-time chat, offline support, group messaging, and media sharing.

## 🚀 Features

### Core Messaging
- **Real-time Chat**: Sub-2-second message delivery using Firebase Firestore
- **Optimistic UI**: Instant message feedback with local-first updates
- **Read Receipts**: Track message status (sending → sent → delivered → read)
- **Typing Indicators**: See when others are typing with auto-timeout
- **Group Chat**: Multi-user conversations with participant management
- **Image Sharing**: Send and receive images with full-screen preview

### Advanced Features
- **Offline Support**: Full offline functionality with automatic sync on reconnection
- **Message Queue**: Messages sent offline are queued and synced when back online
- **Presence System**: Real-time online/offline status tracking
- **Contact Management**: Add and search contacts
- **User Profiles**: View and edit display name, logout functionality
- **Date Separators**: WhatsApp-style date headers in chat

### UI/UX Polish
- **Loading States**: Spinners and feedback for all async operations
- **Empty States**: Helpful guidance when lists are empty
- **Error Handling**: User-friendly error messages with comprehensive logging
- **Date/Time Formatting**: Smart relative time and human-readable dates
- **Input Validation**: Email, password, and display name validation


## 🏗️ Architecture

### Tech Stack
- **Frontend**: React Native (Expo)
- **Backend**: Firebase (Firestore, Auth, Storage, FCM)
- **Local Storage**: SQLite (expo-sqlite v16)
- **State Management**: React Context + Custom Hooks
- **Testing**: Jest + React Native Testing Library
- **Navigation**: Expo Router (file-based routing)

### Key Design Patterns
- **Offline-First Architecture**: Local SQLite cache + background Firebase sync
- **Optimistic UI Updates**: Immediate feedback with rollback on failure
- **Custom Hooks**: Encapsulated business logic (useMessages, useContacts, etc.)
- **Real-time Subscriptions**: Firestore listeners with proper cleanup
- **Error Boundaries**: Centralized error handling and logging

### Project Structure
```
messageai/
├── app/                      # Expo Router screens
│   ├── (auth)/              # Login, signup, onboarding
│   ├── (tabs)/              # Main tabs (conversations, contacts, profile)
│   ├── chat/[id].jsx        # Individual chat screen
│   └── group/create.jsx     # Group creation
├── components/              # Reusable UI components
│   ├── chat/               # Message components
│   ├── contacts/           # Contact list items
│   ├── conversations/      # Conversation list items
│   └── ui/                 # Generic UI (Button, Input, etc.)
├── lib/                    # Business logic
│   ├── context/           # React Context providers
│   ├── database/          # SQLite operations
│   ├── firebase/          # Firebase integration
│   ├── hooks/             # Custom React hooks
│   ├── sync/              # Offline sync logic
│   ├── utils/             # Utilities (validation, formatting, etc.)
│   └── notifications/     # Push notifications (placeholder)
├── __tests__/             # Test files
│   ├── unit/             # Unit tests
│   └── integration/      # Integration tests
└── types/                # JSDoc type definitions
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator
- Firebase project

### 1. Clone Repository
```bash
git clone <repository-url>
cd messageAI/messageai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable the following services:
   - Authentication (Email/Password)
   - Firestore Database
   - Firebase Storage
   - Cloud Messaging (optional)

3. Create a web app in Firebase project settings
4. Copy Firebase configuration

5. Create `.env` file in `messageai/` directory:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

6. Set Firestore Security Rules (see [Security Rules](#security-rules) section)

### 4. Run the App

#### Option A: Using Simulators/Emulators
```bash
# Start Expo development server
npm start

# Or run on specific platform
npm run ios      # iOS Simulator (Mac only)
npm run android  # Android Emulator
npm run web      # Web browser
```

#### Option B: Using Physical Device with Expo Go

1. **Install Expo Go App**
   - iOS: Download from [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: Download from [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Start Development Server with Tunnel**
   ```bash
   # Use tunnel mode if device is on different network
   npx expo start --tunnel
   
   # Or use LAN mode if device is on same WiFi network
   npm start
   ```

3. **Connect Device to Development Server**
   - **iOS**: Open Camera app, scan QR code shown in terminal
   - **Android**: Open Expo Go app, tap "Scan QR Code", scan QR code
   
4. **Troubleshooting Connection Issues**
   - If QR code doesn't work, try tunnel mode: `npx expo start --tunnel`
   - Ensure your phone and computer are on the same WiFi network (LAN mode)
   - Check firewall settings aren't blocking connections

### 5. Create Test Accounts

1. Launch the app
2. Click "Create Account"
3. Enter email and password (minimum 6 characters)
4. Complete onboarding with display name
5. Repeat on second device/emulator to test messaging

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch

# Run specific test file
npm test -- validation.test.js
```

### Test Coverage
Current test coverage: **~50-55%**

| Category | Coverage | Files |
|----------|----------|-------|
| Unit Tests | ✅ 92 tests | auth, validation, formatters |
| Integration Tests | ⚠️ Removed | Database mocking issues |
| Manual Testing | ✅ Complete | All features tested on device |

**What's Tested:**
- ✅ Authentication functions (15 tests)
- ✅ Input validation (14 tests)
- ✅ Date/time formatters (63 tests)
- ⏳ Offline queue (TODO)
- ⏳ Message sync (TODO)

**What Requires Manual Testing:**
- Image upload/download
- Push notifications
- Two-device real-time sync
- Offline scenarios
- Group chat functionality

See detailed test documentation in [TESTING.md](./TESTING.md)

## 📚 Key Features Documentation

### Real-Time Messaging
Messages are delivered in under 2 seconds using Firestore real-time listeners. The app implements optimistic UI updates for instant feedback.

**Flow:**
1. User sends message → Displayed immediately (optimistic)
2. Message saved to local SQLite → Persisted offline
3. Message sent to Firestore → Synced to cloud
4. Real-time listener updates other devices → Live updates

### Offline Support
The app works fully offline with automatic sync on reconnection.

**Offline Flow:**
1. Network detected as offline
2. Messages queued in SQLite offline_queue table
3. UI shows "queued" status
4. On reconnection, queue automatically syncs
5. Messages sent to Firestore, queue cleared

### Image Messaging
Users can send images from camera or photo library.

**Image Flow:**
1. User selects image
2. Image uploaded to Firebase Storage
3. Download URL saved with message
4. Images display inline with tap-to-fullscreen

### Group Chat
Create group conversations with multiple participants.

**Group Features:**
- Add/remove participants
- Sender name display in group messages
- Group name and participant count
- All regular messaging features (typing, read receipts, etc.)

## 🔒 Security Rules

**Important:** Update Firestore Security Rules before production!

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Conversations
    match /conversations/{conversationId} {
      allow read: if request.auth != null && 
                     request.auth.uid in resource.data.participantIds;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
                       request.auth.uid in resource.data.participantIds;
      
      // Messages subcollection
      match /messages/{messageId} {
        allow read: if request.auth != null && 
                       request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participantIds;
        allow create: if request.auth != null && 
                         request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participantIds;
        allow update: if request.auth != null;
      }
    }
    
    // Presence
    match /presence/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Typing status
    match /typing/{conversationId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🐛 Known Issues & Limitations

### Current Limitations
1. **No Message Pagination**: Currently loads last 50 messages only
2. **No Profile Pictures**: Display name only, no image upload for profiles
3. **No Voice Messages**: Text and images only
4. **No Message Editing**: Messages cannot be edited after sending
5. **No Message Deletion**: No delete functionality
6. **Basic Search**: Contact search only, no message search


### Future Enhancements
- Message reactions (emoji)
- Voice messages
- Video calls
- Message forwarding
- Link previews
- Location sharing
- Stories/Status updates
- End-to-end encryption

## 📝 Development Notes

### Important Commands
```bash
npm start                  # Start dev server (LAN mode)
npx expo start --tunnel    # Start with tunnel (for different networks)
npx expo start -c          # Start with cleared cache
npm test                   # Run tests
npm test -- --coverage     # Run tests with coverage
npm run ios                # Run on iOS simulator
npm run android            # Run on Android emulator
```

### Debugging
- **React Native Debugger**: Press `Cmd+D` (iOS) or `Cmd+M` (Android)
- **Console Logs**: View in terminal or React Native Debugger
- **Firestore Data**: Check Firebase Console > Firestore Database
- **SQLite Data**: Use `expo-sqlite` debug tools

### Code Style
- Use functional components with hooks
- Follow JSDoc for function documentation
- Use descriptive variable names
- Keep components small and focused
- Separate business logic into custom hooks

## 🤝 Contributing

This is an MVP project. Future contributions welcome for:
- Bug fixes
- Feature enhancements
- Test coverage improvements
- Documentation updates

