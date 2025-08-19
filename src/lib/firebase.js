import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
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

  const missingFields = requiredFields.filter((field) => !config[field]);

  if (missingFields.length > 0) {
    console.error("Missing Firebase configuration fields:", missingFields);
    throw new Error(
      `Firebase configuration is incomplete. Missing: ${missingFields.join(
        ", "
      )}`
    );
  }
};

// Initialize Firebase with error handling
let app, auth, db, realtime;

try {
  validateFirebaseConfig(firebaseConfig);
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  realtime = getDatabase(app);
} catch (error) {
  console.error("Firebase initialization error:", error);
  // In development, we might want to continue with mock data
  if (process.env.NODE_ENV === "development") {
    console.warn(
      "Firebase initialization failed, but continuing in development mode"
    );
  } else {
    throw error;
  }
}

export { auth, db, realtime };
