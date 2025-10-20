# Project Brief: MessageAI MVP

**Project Name:** MessageAI MVP  
**Timeline:** 24 Hours  
**Hard Deadline:** Tuesday, October 22, 2025  
**Version:** 1.0  
**Created:** October 20, 2025

---

## Vision

Build a production-quality, real-time messaging application with rock-solid messaging infrastructure. AI features will be added post-MVP.

## Core Philosophy

> "A simple, reliable messaging app with solid message delivery is more valuable than a feature-rich app with flaky sync."

---

## Success Criteria

**MVP passes if:**
1. Two devices can chat in real-time
2. Messages persist through app restart
3. Offline messages sync when reconnected
4. Group chat works with 3+ users
5. Read receipts and online status functional
6. Optimistic UI updates work
7. Push notifications work in foreground
8. App handles poor network gracefully
9. No critical bugs that break core flows
10. Backend deployed and accessible

**MVP fails if:**
- Messages fail to deliver reliably
- Messages lost during network issues
- App crashes frequently
- Real-time sync doesn't work
- Persistence doesn't survive restart

---

## Scope Boundaries

### In Scope (MVP)
- User authentication (email/phone)
- One-on-one chat with real-time delivery (<2s latency)
- Group chat (3+ participants)
- Message persistence (SQLite + Firebase)
- Offline message queue with auto-sync
- Read receipts (sending → sent → delivered → read)
- Typing indicators
- Online/offline presence
- Image sharing
- Foreground push notifications

### Explicitly Out of Scope
- **All AI features** (summarization, translation, smart replies)
- End-to-end encryption
- Voice/video messages
- Message editing/deletion/reactions
- Background push notifications
- Dark mode
- OAuth social login

---

## Key Constraints

- **Time:** 24 hours total development time
- **Platform:** React Native + Expo (JavaScript, not TypeScript)
- **Backend:** Firebase (Firestore, Auth, Storage, FCM)
- **Testing:** >70% test coverage required

---

## Primary User Stories

1. **As a user**, I want to send and receive messages in real-time so I can communicate instantly
2. **As a user**, I want my messages to persist after closing the app so my chat history is preserved
3. **As a user**, I want to send messages while offline so network issues don't block communication
4. **As a user**, I want to chat with multiple people simultaneously in group conversations
5. **As a user**, I want to know when my messages are delivered and read
6. **As a user**, I want to see when others are online and typing

---

## Technical Foundation

**Frontend:** React Native + Expo  
**Backend:** Firebase (Firestore, Auth, Storage, Cloud Messaging)  
**Local Storage:** Expo SQLite  
**Testing:** Jest + React Native Testing Library  

---

## Development Approach

- **16 Pull Requests** structured in logical feature increments
- **Test-driven** where applicable (unit + integration tests)
- **Critical path first:** Auth → Database → Messaging → Offline Sync
- **Progressive enhancement:** Core features → Polish → Optimization

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Firestore read/write costs | Use `.limit()`, implement pagination, cache aggressively |
| Real-time listener memory leaks | Always unsubscribe in cleanup functions |
| 24-hour timeline | Prioritize critical path (PRs #1-6, #11) |
| Push notification complexity | Focus on foreground only for MVP |

---

This project brief serves as the foundation for all other Memory Bank documents and guides all technical decisions.

