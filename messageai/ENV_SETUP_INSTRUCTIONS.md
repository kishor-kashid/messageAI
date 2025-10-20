# Environment Setup Instructions

## Creating Your .env File

The `.env` file contains your Firebase configuration and is **not tracked by git** for security reasons.

### Steps:

1. **Create Firebase Project** (Task 1.4 - Manual step)
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Click "Add project" or select existing project
   - Follow the setup wizard
   - Give your project a name (e.g., "messageai-mvp")

2. **Register Your App**
   - In Project Overview, click the web icon (</>) to register a web app
   - Give it a name (e.g., "MessageAI Mobile")
   - Check "Also set up Firebase Hosting" (optional)
   - Click "Register app"

3. **Get Configuration Values**
   - After registering, you'll see your Firebase SDK configuration
   - Copy the firebaseConfig object values

4. **Enable Firebase Services**
   - **Firestore Database:**
     - Go to Build → Firestore Database
     - Click "Create database"
     - Start in **test mode** for MVP (we'll add security rules later)
     - Choose a location close to your users
   
   - **Authentication:**
     - Go to Build → Authentication
     - Click "Get started"
     - Enable "Email/Password" sign-in method
   
   - **Storage:**
     - Go to Build → Storage
     - Click "Get started"
     - Start in **test mode** for MVP
   
   - **Cloud Messaging** (for notifications):
     - Go to Build → Cloud Messaging
     - Note down your Server Key (optional for MVP)

5. **Create .env File**
   - Copy the `.env.example` file to `.env`
   - **OR** create a new file named `.env` in the project root:

```bash
# In messageai/ directory
cp .env.example .env
```

6. **Fill in Your Values**

Open `.env` and replace the placeholder values with your actual Firebase configuration:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyAbc123...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=messageai-mvp.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=messageai-mvp
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=messageai-mvp.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123def456
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABC123DEF4
```

7. **Verify Setup**

Run the Firebase connection test:

```bash
# You'll implement this later
npm run test-firebase
```

---

## Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env` file to git
- Never share your API keys publicly
- The `.env` file is already in `.gitignore`
- For production, use environment variables or secure secret management

---

## Troubleshooting

### "Firebase not defined" error
- Make sure `.env` file exists in the messageai/ directory
- Check that all environment variables are correctly named
- Restart the development server after creating .env

### "Permission denied" errors
- Check that you enabled Firestore, Auth, and Storage in Firebase Console
- Verify you're using test mode rules (for MVP)
- Check your Firebase project quota isn't exceeded

### Connection test fails
- Verify internet connection
- Check Firebase Console for service outages
- Ensure Firebase project is active and not suspended

---

**Next Task:** After setting up .env, run the Firebase connection test (Task 1.8)

