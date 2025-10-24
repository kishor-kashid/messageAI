graph TB
    subgraph "Client Layer - React Native (Expo)"
        subgraph "App Screens"
            AUTH[Auth Screens<br/>login.jsx<br/>signup.jsx<br/>onboarding.jsx]
            CONV[Conversations Screen<br/>conversations.jsx]
            CONTACTS[Contacts Screen<br/>contacts.jsx]
            CHAT[Chat Screen<br/>chat id.jsx]
            GROUP[Group Chat Screen<br/>group id.jsx]
            PROFILE[Profile Screen<br/>profile.jsx]
        end
        
        subgraph "UI Components"
            MSGBUBBLE[Message Bubble]
            MSGINPUT[Message Input]
            TYPING[Typing Indicator]
            CONTACTITEM[Contact List Item]
            CONVITEM[Conversation Item]
            AVATAR[Avatar]
            BUTTON[Button]
            INPUT[Input]
        end
        
        subgraph "Context & State"
            AUTHCTX[Auth Context<br/>AuthContext.jsx]
            CHATCTX[Chat Context<br/>ChatContext.jsx]
        end
        
        subgraph "Custom Hooks"
            USEAUTH[useAuth.js]
            USEMSGS[useMessages.js]
            USECONV[useConversations.js]
            USECONTACTS[useContacts.js]
            USEPRESENCE[usePresence.js]
            USENETWORK[useNetworkStatus.js]
        end
        
        subgraph "Business Logic"
            VALIDATION[Validation Utils<br/>validation.js]
            FORMATTERS[Date Formatters<br/>formatters.js]
            ERRORHANDLER[Error Handler<br/>errorHandler.js]
        end
        
        subgraph "Sync Layer"
            OFFLINEQUEUE[Offline Queue<br/>offlineQueue.js]
            MSGSYNC[Message Sync<br/>messageSync.js]
        end
        
        subgraph "Local Database (SQLite)"
            DBSCHEMA[Database Schema<br/>schema.js]
            DBMSGS[Message Operations<br/>messages.js]
            DBCONV[Conversation Operations<br/>conversations.js]
            DBCONTACTS[Contact Operations<br/>contacts.js]
        end
        
        subgraph "Firebase SDK Wrapper"
            FBAUTH[Firebase Auth<br/>auth.js]
            FBSTORE[Firestore Operations<br/>firestore.js]
            FBSTORAGE[Storage Operations<br/>storage.js]
            FBPRESENCE[Presence System<br/>presence.js]
            FBCONFIG[Firebase Config<br/>config.js]
        end
        
        subgraph "Notifications"
            NOTIFSETUP[Notification Setup<br/>setup.js]
            NOTIFHANDLER[Notification Handler<br/>handler.js]
        end
    end
    
    subgraph "Firebase Backend (Google Cloud)"
        subgraph "Firebase Services"
            FIREAUTH[Firebase Authentication]
            FIRESTORE[Cloud Firestore<br/>Real-time Database]
            FIRESTORAGE[Firebase Storage<br/>Images & Media]
            FCM[Firebase Cloud Messaging<br/>Push Notifications]
        end
        
        subgraph "Firestore Collections"
            USERS[users collection]
            CONTACTSCOLL[contacts collection]
            CONVERSATIONS[conversations collection]
            MESSAGES[messages collection]
            PRESENCE[presence collection]
        end
        
        subgraph "Storage Buckets"
            PROFILEPICS[Profile Pictures<br/>/profile_pictures]
            CHATIMAGES[Chat Images<br/>/chat_images]
        end
    end
    
    subgraph "External Services"
        EXPOGO[Expo Go<br/>Development App]
        EXPONOTIF[Expo Push Service<br/>Notification Delivery]
        NETINFO[@react-native-community/netinfo<br/>Network Status]
    end
    
    subgraph "Testing Infrastructure"
        subgraph "Unit Tests"
            AUTHTEST[auth.test.js]
            VALIDTEST[validation.test.js]
            FORMATTEST[formatters.test.js]
            QUEUETEST[offlineQueue.test.js]
            SYNCTEST[messageSync.test.js]
        end
        
        subgraph "Integration Tests"
            DBTEST[database.test.js]
            CONTACTTEST[contacts.test.js]
            MSGTEST[messaging.test.js]
            PRESENCETEST[presence.test.js]
        end
        
        JEST[Jest Test Runner]
        RTL[React Native Testing Library]
    end
    
    %% Screen to Hook connections
    AUTH --> USEAUTH
    CONV --> USECONV
    CONTACTS --> USECONTACTS
    CHAT --> USEMSGS
    CHAT --> USEPRESENCE
    GROUP --> USEMSGS
    PROFILE --> USEAUTH
    
    %% Hook to Context connections
    USEAUTH --> AUTHCTX
    USEMSGS --> CHATCTX
    
    %% Hook to Firebase connections
    USEAUTH --> FBAUTH
    USEMSGS --> FBSTORE
    USECONV --> FBSTORE
    USECONTACTS --> FBSTORE
    USEPRESENCE --> FBPRESENCE
    
    %% Hook to Local DB connections
    USEMSGS --> DBMSGS
    USECONV --> DBCONV
    USECONTACTS --> DBCONTACTS
    
    %% Sync layer connections
    USEMSGS --> OFFLINEQUEUE
    OFFLINEQUEUE --> MSGSYNC
    MSGSYNC --> FBSTORE
    MSGSYNC --> DBMSGS
    USENETWORK --> MSGSYNC
    
    %% Component to Hook connections
    MSGBUBBLE -.-> USEMSGS
    MSGINPUT -.-> USEMSGS
    TYPING -.-> USEPRESENCE
    CONTACTITEM -.-> USECONTACTS
    CONVITEM -.-> USECONV
    
    %% Firebase SDK to Firebase Services
    FBAUTH --> FIREAUTH
    FBSTORE --> FIRESTORE
    FBSTORAGE --> FIRESTORAGE
    FBPRESENCE --> FIRESTORE
    FBCONFIG --> FIREAUTH
    FBCONFIG --> FIRESTORE
    FBCONFIG --> FIRESTORAGE
    
    %% Firestore to Collections
    FIRESTORE --> USERS
    FIRESTORE --> CONTACTSCOLL
    FIRESTORE --> CONVERSATIONS
    FIRESTORE --> MESSAGES
    FIRESTORE --> PRESENCE
    
    %% Storage connections
    FBSTORAGE --> PROFILEPICS
    FBSTORAGE --> CHATIMAGES
    
    %% Notification connections
    NOTIFSETUP --> FCM
    NOTIFHANDLER --> FCM
    FCM --> EXPONOTIF
    EXPONOTIF -.Push.-> CHAT
    
    %% Local DB connections
    DBSCHEMA --> DBMSGS
    DBSCHEMA --> DBCONV
    DBSCHEMA --> DBCONTACTS
    
    %% Utils connections
    AUTH -.validates.-> VALIDATION
    CONTACTS -.validates.-> VALIDATION
    MSGBUBBLE -.formats.-> FORMATTERS
    CONVITEM -.formats.-> FORMATTERS
    USEMSGS -.handles errors.-> ERRORHANDLER
    
    %% Network monitoring
    NETINFO --> USENETWORK
    USENETWORK -.online/offline.-> OFFLINEQUEUE
    
    %% Testing connections
    AUTHTEST -.tests.-> FBAUTH
    VALIDTEST -.tests.-> VALIDATION
    FORMATTEST -.tests.-> FORMATTERS
    QUEUETEST -.tests.-> OFFLINEQUEUE
    SYNCTEST -.tests.-> MSGSYNC
    DBTEST -.tests.-> DBMSGS
    DBTEST -.tests.-> DBCONV
    DBTEST -.tests.-> DBCONTACTS
    CONTACTTEST -.tests.-> USECONTACTS
    MSGTEST -.tests.-> USEMSGS
    PRESENCETEST -.tests.-> USEPRESENCE
    
    JEST --> AUTHTEST
    JEST --> VALIDTEST
    JEST --> FORMATTEST
    JEST --> QUEUETEST
    JEST --> SYNCTEST
    JEST --> DBTEST
    JEST --> CONTACTTEST
    JEST --> MSGTEST
    JEST --> PRESENCETEST
    
    RTL --> MSGTEST
    RTL --> CONTACTTEST
    RTL --> PRESENCETEST
    
    %% Development flow
    EXPOGO -.dev mode.-> AUTH
    EXPOGO -.dev mode.-> CONV
    
    %% Real-time data flow
    FIRESTORE ==Real-time Listener==> USEMSGS
    FIRESTORE ==Real-time Listener==> USECONV
    FIRESTORE ==Real-time Listener==> USEPRESENCE
    
    %% Styling
    classDef screen fill:#e1f5ff,stroke:#01579b,stroke-width:2px
    classDef component fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef hook fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef firebase fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    classDef database fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px
    classDef sync fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    classDef test fill:#e0f2f1,stroke:#004d40,stroke-width:2px
    
    class AUTH,CONV,CONTACTS,CHAT,GROUP,PROFILE screen
    class MSGBUBBLE,MSGINPUT,TYPING,CONTACTITEM,CONVITEM,AVATAR,BUTTON,INPUT component
    class USEAUTH,USEMSGS,USECONV,USECONTACTS,USEPRESENCE,USENETWORK hook
    class FBAUTH,FBSTORE,FBSTORAGE,FBPRESENCE,FBCONFIG,FIREAUTH,FIRESTORE,FIRESTORAGE,FCM firebase
    class DBSCHEMA,DBMSGS,DBCONV,DBCONTACTS database
    class OFFLINEQUEUE,MSGSYNC sync
    class AUTHTEST,VALIDTEST,FORMATTEST,QUEUETEST,SYNCTEST,DBTEST,CONTACTTEST,MSGTEST,PRESENCETEST,JEST,RTL test