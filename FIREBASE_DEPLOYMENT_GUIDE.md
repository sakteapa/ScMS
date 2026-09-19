# Firebase Hosting & Firestore Security Deployment Guide
## Mizoram School System (zoxs-sms)

This guide provides step-by-step instructions for deploying the **zoxs-sms** web dashboard and database security rules to Google Firebase.

---

### Prerequisites
1. **Node.js**: v18.0.0 or higher.
2. **Google Account**: Access to [Firebase Console](https://console.firebase.google.com).
3. **Firebase CLI**: Install globally via npm:
   ```bash
   npm install -g firebase-tools
   ```

---

### Step 1: Firebase Authentication & Project Setup
1. Log in to Firebase via terminal:
   ```bash
   firebase login
   ```
2. Link your existing Firebase project or initialize a new one:
   ```bash
   # List your available projects
   firebase projects:list

   # Set your active project ID
   firebase use <your-firebase-project-id>
   ```

---

### Step 2: Environment Variables (.env)
Create or verify your `.env` file in the project root with your credentials:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=zoxs-sms.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=zoxs-sms
VITE_FIREBASE_STORAGE_BUCKET=zoxs-sms.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
```

---

### Step 3: Build the Production Web App
Compile the optimized static bundle into the `dist/` folder:
```bash
npm run build
```
Verify that the `dist/` directory contains:
- `index.html`
- `assets/` (bundled JS & CSS)

---

### Step 4: Deploy to Firebase Hosting & Firestore
Deploy everything in one command or individually:

#### A. Full Deployment (Hosting + Firestore Rules + Indexes):
```bash
firebase deploy
```

#### B. Deploy Only Security Rules & Indexes:
```bash
firebase deploy --only firestore:rules,firestore:indexes
```

#### C. Deploy Only Web Dashboard (Hosting):
```bash
firebase deploy --only hosting
```

---

### Step 5: Test and Verify Security Rules
In Firebase Console > **Firestore Database** > **Rules**, verify that `firestore.rules` is active.
- **Principal Accounts**: Have full access across `users`, `classes`, `students`, `fees`, and `attendance`.
- **Teacher Accounts**: Can register students, record daily attendance, and scan QR codes.
- **Student Accounts**: Can view their own student records, attendance logs, and fee receipts.

---

### Step 6: Custom Domain Setup (Optional)
To connect your official school domain (e.g. `sms.mizoramschool.edu.in`):
1. Go to **Firebase Console** > **Hosting** > **Add Custom Domain**.
2. Enter your domain name and follow the DNS TXT/A record verification prompts.
3. Free SSL certificate is automatically provisioned by Google Firebase.
