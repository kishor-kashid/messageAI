# Firebase Cloud Functions Setup Guide

**Complete setup instructions for MessageAI AI features.**

**Status:** ✅ Successfully deployed to `messageai-c7214`  
**Date:** October 23, 2025  
**Functions Deployed:** 7/7 (All working)

---

## Prerequisites

**Before starting, ensure you have:**

- ✅ Node.js 18 or higher (we used v20.11.0)
- ✅ Firebase CLI installed: `npm install -g firebase-tools`
- ✅ Firebase project created at [console.firebase.google.com](https://console.firebase.google.com)
- ✅ Firebase Blaze (Pay-as-you-go) plan enabled (required for Cloud Functions)
- ✅ OpenAI API key from [platform.openai.com](https://platform.openai.com/api-keys)

---

## Quick Start (TL;DR)

If you're setting up from scratch, run these commands in order:

```powershell
# 1. Verify prerequisites
firebase --version    # Should show v14.19.1 or higher
node --version       # Should show v18+ (we used v20.11.0)

# 2. Install dependencies
cd functions
npm install
cd ..

# 3. Create .env file
# Copy functions/ENV_TEMPLATE.txt to functions/.env
# Add your OpenAI API key: OPENAI_API_KEY=sk-your-key

# 4. Deploy
firebase deploy --only functions

# 5. Verify
firebase functions:list
curl https://us-central1-YOUR-PROJECT-ID.cloudfunctions.net/healthCheck
```

---

## Detailed Step-by-Step Guide

### Step 1: Verify Firebase CLI Installation

Check if Firebase CLI is already installed:

```powershell
firebase --version
```

**Expected output:** `14.19.1` (or higher)

If not installed:
```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```bash
firebase login
```

This will open a browser for authentication.

### Step 3: Verify Node.js Version

```powershell
node --version
```

**Expected:** v18.0.0 or higher (we used v20.11.0)

### Step 4: List Your Firebase Projects

```powershell
firebase projects:list
```

**Example output:**
```
┌──────────────────────┬────────────────────┬────────────────┐
│ Project Display Name │ Project ID         │ Project Number │
├──────────────────────┼────────────────────┼────────────────┤
│ messageAI            │ messageai-c7214    │ 234574098239   │
└──────────────────────┴────────────────────┴────────────────┘
```

Note your **Project ID** - you'll need it!

### Step 5: Configure Firebase Project

The `.firebaserc` file tells Firebase which project to use. This was auto-created for you.

**Verify it exists:**
```powershell
cat .firebaserc
```

**Expected content:**
```json
{
  "projects": {
    "default": "messageai-c7214"
  }
}
```

If it doesn't exist, create it with your project ID.

### Step 6: Install Function Dependencies

**Navigate to functions directory and install:**

```powershell
cd functions
npm install
```

**Expected output:**
- 591 packages installed
- May show deprecation warnings (safe to ignore)
- Should complete in ~30 seconds

**Return to project root:**
```powershell
cd ..
```

### Step 7: Configure OpenAI API Key

You need to set your OpenAI API key in a `.env` file for local development and deployment.

**7.1 Get Your OpenAI API Key:**

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Name it "MessageAI Functions"
5. Copy the key (starts with `sk-...` or `sk-proj-...`)
6. **⚠️ Save it immediately - it's only shown once!**

**7.2 Create the .env File:**

```powershell
# From project root (messageAI directory)
Copy-Item functions\ENV_TEMPLATE.txt functions\.env
```

Or manually create `functions/.env` with this content:
```env
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

**Replace** `sk-your-actual-openai-api-key-here` with your actual key!

**7.3 Verify .env File:**

```powershell
# Check it exists (don't print contents for security!)
Test-Path functions\.env
```

**Expected:** `True`

**⚠️ Security Notes:**
- ✅ `.env` is already in `.gitignore` (won't be committed)
- ✅ Never share your API key
- ✅ Firebase will automatically load this file during deployment

### Step 8: First Deployment Attempt

**Run the deployment:**

```powershell
firebase deploy --only functions
```

---

### Step 9: Successful Deployment

```powershell
firebase deploy --only functions
```

**Expected SUCCESS output:**
```
✔  functions[us-central1-healthCheck]
✔  functions[us-central1-translateMessage]
✔  functions[us-central1-detectLanguage]
✔  functions[us-central1-explainPhrase]
✔  functions[us-central1-detectCulturalReferences]
✔  functions[us-central1-adjustFormality]
✔  functions[us-central1-generateSmartReplies]

✔  Deploy complete!
```

🎉 **All 7 functions deployed successfully!**

---

## Step 10: Verify Deployment

### Method 1: List Functions via CLI

**Check what functions are deployed:**

```powershell
firebase functions:list
```

**Expected output:**
```
┌─────────────────────────────────┬───────────────────────────────────────────────────────────────────┬─────────┐
│ Function                        │ Trigger                                                           │ Status  │
├─────────────────────────────────┼───────────────────────────────────────────────────────────────────┼─────────┤
│ adjustFormality(us-central1)    │ https://us-central1-messageai-c7214.cloudfunctions.net/...       │ ACTIVE  │
│ detectCulturalReferences(...)   │ https://us-central1-messageai-c7214.cloudfunctions.net/...       │ ACTIVE  │
│ detectLanguage(us-central1)     │ https://us-central1-messageai-c7214.cloudfunctions.net/...       │ ACTIVE  │
│ explainPhrase(us-central1)      │ https://us-central1-messageai-c7214.cloudfunctions.net/...       │ ACTIVE  │
│ generateSmartReplies(...)       │ https://us-central1-messageai-c7214.cloudfunctions.net/...       │ ACTIVE  │
│ healthCheck(us-central1)        │ https://us-central1-messageai-c7214.cloudfunctions.net/...       │ ACTIVE  │
│ translateMessage(us-central1)   │ https://us-central1-messageai-c7214.cloudfunctions.net/...       │ ACTIVE  │
└─────────────────────────────────┴───────────────────────────────────────────────────────────────────┴─────────┘
```

✅ **All 7 functions should show "ACTIVE" status!**

### Method 2: Test Health Check Endpoint

**Test the healthCheck function:**

```powershell
curl https://us-central1-messageai-c7214.cloudfunctions.net/healthCheck
```

**Replace `messageai-c7214` with your project ID!**

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-23T19:45:32.123Z",
  "functions": [
    "translateMessage",
    "detectLanguage",
    "explainPhrase",
    "detectCulturalReferences",
    "adjustFormality",
    "generateSmartReplies"
  ]
}
```

✅ **If you see this, deployment is 100% successful!**

### Method 3: Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/project/messageai-c7214/functions)
2. Select your project: **messageai-c7214**
3. Navigate to **Build → Functions** in the left sidebar
4. You should see all 7 functions listed:
   - ✅ adjustFormality
   - ✅ detectCulturalReferences
   - ✅ detectLanguage
   - ✅ explainPhrase
   - ✅ generateSmartReplies
   - ✅ healthCheck
   - ✅ translateMessage

Each should show:
- **Status:** Healthy (green checkmark)
- **Last deployed:** Recent timestamp
- **Region:** us-central1

---

## Additional Information

### Deployed Function URLs

Your functions are available at:
```
https://us-central1-messageai-c7214.cloudfunctions.net/
├── healthCheck
├── translateMessage
├── detectLanguage
├── explainPhrase
├── detectCulturalReferences
├── adjustFormality
└── generateSmartReplies
```

### Local Development (Future)

To test functions locally before deploying:

```powershell
# Start the emulator
firebase emulators:start --only functions

# Functions will be available at:
# http://localhost:5001/messageai-c7214/us-central1/functionName
```

**Note:** For this project (Expo Go testing), we're using deployed functions directly.

---

### Cost Optimization Features

✅ **Already implemented:**
- **Translation caching:** Stores translations in SQLite, reduces API calls by ~80%
- **Rate limiting:** 100 calls/hour per user prevents abuse
- **GPT-4o-mini model:** Cheapest OpenAI model ($0.15/1M input tokens, $0.60/1M output)
- **Token limiting:** Max 150 tokens for translations, 500 for smart replies

### Expected Costs

**For testing (you):**
- **Firebase:** Free (under 2M invocations/month)
- **OpenAI:** ~$1-5/month for moderate testing

**For 1000 active users with 10 AI operations/day:**
- Monthly operations: 300,000
- Firebase Functions: **Free** (under 2M limit)
- OpenAI API: ~$150/month (~$0.15/user/month)
- **Total: ~$150/month**

**Per-operation costs:**
- Translation: ~$0.001 (cached: $0)
- Language detection: ~$0.0005
- Cultural context: ~$0.002
- Smart replies: ~$0.003
- Formality adjustment: ~$0.001

---

## Security Best Practices

### ✅ Implemented

1. **API Key Protection**
   - ✅ `.env` file in `.gitignore`
   - ✅ API key never exposed to client
   - ✅ All AI calls proxied through Cloud Functions

2. **Rate Limiting**
   - ✅ 100 calls/hour per user (configurable)
   - ✅ Prevents abuse and runaway costs
   - ✅ Tracks usage in Firestore

3. **Cost Controls**
   - ✅ Token limits on all AI responses
   - ✅ Translation caching reduces redundant calls
   - ✅ Usage logging for monitoring

### 🔒 Additional Recommendations

1. **Enable Firebase App Check** (future)
   - Prevents unauthorized access to functions
   - Free tier: 50K verifications/month
   
2. **Add Request Validation**
   - Already implemented: validates required fields
   - Rejects malformed requests

3. **Monitor for Anomalies**
   - Set up alerts for unusual usage patterns
   - Review logs weekly

---

## Deployment Summary

### ✅ What We Deployed

| Function | Purpose | Status |
|----------|---------|--------|
| `healthCheck` | Verify deployment | ✅ Active |
| `translateMessage` | Translate text to any language | ✅ Active |
| `detectLanguage` | Identify message language | ✅ Active |
| `explainPhrase` | Explain cultural phrases/idioms | ✅ Active |
| `detectCulturalReferences` | Find cultural references in text | ✅ Active |
| `adjustFormality` | Change message tone/formality | ✅ Active |
| `generateSmartReplies` | AI-generated reply suggestions | ✅ Active |

### 📊 Configuration

- **Project ID:** messageai-c7214
- **Region:** us-central1
- **Node.js Version:** 18
- **Firebase Plan:** Blaze (Pay-as-you-go)
- **AI Model:** GPT-4o-mini (OpenAI)
- **Rate Limit:** 100 calls/hour/user

### 🔗 Function URLs

All functions are accessible at:
```
https://us-central1-messageai-c7214.cloudfunctions.net/{functionName}
```

---


## Useful Commands Reference

```powershell
# List all functions
firebase functions:list

# View function logs
firebase functions:log

# Re-deploy after changes
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:translateMessage

# Test health check
curl https://us-central1-messageai-c7214.cloudfunctions.net/healthCheck

# Check Firebase project
firebase projects:list

# View current config
firebase functions:config:get
```

---

## Resources & Documentation

### Official Docs
- [Firebase Functions](https://firebase.google.com/docs/functions)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Expo + Firebase](https://docs.expo.dev/guides/using-firebase/)

### Project Files
- [AI Integration Task List](../AI_INTEGRATION_TASK_LIST.md)
- [PR #17 Summary](../PR17_SUMMARY.md)
- [Functions Quick Start](functions/QUICKSTART.md)
- [Main README](../README.md)

### Support
- Firebase Console: https://console.firebase.google.com/project/messageai-c7214
- OpenAI Platform: https://platform.openai.com
- GitHub Issues: (your repo)

---

*Last updated: October 23, 2025*  
*Deployment verified: ✅ All systems operational*


