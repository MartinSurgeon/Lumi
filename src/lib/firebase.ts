
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// TODO: Replace with your actual Firebase project configuration
// Get this from: Firebase Console -> Project Settings -> General -> Your Apps -> SDK Setup
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:12345:web:abcde"
};

// Initialize Firebase only if config is present to prevent crashes during dev
let app;
let db: any = null;

try {
    // Basic check to see if user replaced placeholder
    if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
        app = initializeApp(firebaseConfig);
        db = getDatabase(app);
    } else {
        console.warn("Firebase config is missing. Monitoring will not work until keys are added in src/lib/firebase.ts");
    }
} catch (e) {
    console.error("Firebase Initialization Error:", e);
}

export { db };
