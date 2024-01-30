import { initializeApp, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

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
    appId: "1:212271854385:web:720a36ecc8f596fde17610",
    measurementId: "G-QWM46HW3PY"
  };

  app = initializeApp(firebaseConfig);
}

// Initialize Analytics
const analytics = getAnalytics(app);

// Initialize Authentication
export const auth = getAuth(app);
export const GoogleProvider = new GoogleAuthProvider();
