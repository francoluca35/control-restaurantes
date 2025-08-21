import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
};

// Validate Firebase configuration
const validateFirebaseConfig = (config) => {
  const requiredFields = [
    "apiKey",
    "authDomain",
    "projectId",
    "storageBucket",
    "messagingSenderId",
    "appId",
  ];

  const missingFields = requiredFields.filter(
    (field) => !config[field] || config[field] === ""
  );

  if (missingFields.length > 0) {
    console.error("Missing Firebase configuration fields:", missingFields);
    // Don't throw error, just log it and return false
    return false;
  }

  return true;
};

// Initialize Firebase with error handling
let app, auth, db, realtime;

try {
  // Check if we have the required config (both browser and server)
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "" && firebaseConfig.apiKey !== "your_firebase_api_key_here") {
    const isValid = validateFirebaseConfig(firebaseConfig);
    if (isValid) {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
      realtime = getDatabase(app);
      console.log("✅ Firebase initialized successfully");
    } else {
      console.warn("Firebase configuration is invalid, using mock objects");
      auth = null;
      db = null;
      realtime = null;
    }
  } else {
    console.warn("Firebase configuration not available - Please create .env.local with Firebase credentials");
    // Create mock objects for server-side rendering
    auth = null;
    db = null;
    realtime = null;
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
  // In development, we might want to continue with mock data
  if (process.env.NODE_ENV === "development") {
    console.warn(
      "Firebase initialization failed, but continuing in development mode"
    );
  } else {
    // Don't throw error in production, just log it
    console.error("Firebase initialization failed in production:", error);
  }

  // Create mock objects
  auth = null;
  db = null;
  realtime = null;
}

export { auth, db, realtime };
