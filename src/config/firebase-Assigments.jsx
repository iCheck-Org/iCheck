import { initializeApp, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

let app;

// Check if the Firebase app has already been initialized
try {
  app = getApp();
} catch (e) {
  // Initialize Firebase if app doesn't exist
  const firebaseConfig = {
    apiKey: "AIzaSyAFJbHae-dlujyuiYyKpQa485FfYNw4hso",
    authDomain: "icheck-assigments.firebaseapp.com",
    projectId: "icheck-assigments",
    storageBucket: "icheck-assigments.appspot.com",
    messagingSenderId: "212271854385",
    appId: "1:212271854385:web:6d9aef03c61c9034e17610",
    measurementId: "G-Q4W4DSM8ML"
  };

  app = initializeApp(firebaseConfig);
}

// Initialize Firestore
export const db = getFirestore(app);
