// Firebase Configuration
// 1. Go to https://console.firebase.google.com/
// 2. Create new project
// 3. Enable Authentication (Google sign-in, GitHub OAuth)
// 4. Enable Firestore Database (test mode ok for start)
// 5. Copy config from Project Settings > General > Your apps (web app)
// 6. Paste below, replacing placeholders

const firebaseConfig = {
  // PASTE YOUR CONFIG HERE EXACTLY
  apiKey: "your_real_api_key_here",
  apiKey: "AIzaXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// Firestore chat collection
const chatCollection = db.collection('chats');
