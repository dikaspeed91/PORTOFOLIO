// Firebase Configuration
// 1. Go to https://console.firebase.google.com/
// 2. Create new project
// 3. Enable Authentication (Google sign-in, GitHub OAuth)
// 4. Enable Firestore Database (test mode ok for start)
// 5. Copy config from Project Settings > General > Your apps (web app)
// 6. Paste below, replacing placeholders

const firebaseConfig = {
  // TODO: REPLACE THESE WITH YOUR REAL FIREBASE CONFIG
  // Get from Firebase Console > Project Settings > Your apps > Web app
  apiKey: "AIzaXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // your real apiKey
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Validate config before init
if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes('AIza') || firebaseConfig.projectId === 'your-project-id') {
  console.warn('[Firebase] ⚠️  Placeholder config detected!');
  console.warn('📋 Go to https://console.firebase.google.com/');
  console.warn('1. Create/select project');
  console.warn('2. Enable Auth (Google/GitHub) + Firestore');
  console.warn('3. Project Settings > Your apps > Web app > Copy config');
  console.warn('4. Replace firebaseConfig object above');
  console.info('🚀 Chat will work in read-only mode until configured');
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

console.log('[Firebase] 🔥 Initialized successfully');
if (firebaseConfig.projectId !== 'your-project-id') {
  console.log(`✅ Connected to project: ${firebaseConfig.projectId}`);
}

const auth = firebase.auth();
const db = firebase.firestore();

// Firestore chat collection
const chatCollection = db.collection('chats');
