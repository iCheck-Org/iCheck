
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {} from 'firebase/firestore'
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAFJbHae-dlujyuiYyKpQa485FfYNw4hso",
  authDomain: "icheck-assigments.firebaseapp.com",
  projectId: "icheck-assigments",
  storageBucket: "icheck-assigments.appspot.com",
  messagingSenderId: "212271854385",
  appId: "1:212271854385:web:6d9aef03c61c9034e17610",
  measurementId: "G-Q4W4DSM8ML"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getFirestore(app);