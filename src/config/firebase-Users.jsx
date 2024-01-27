
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth , GoogleAuthProvider} from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyAFJbHae-dlujyuiYyKpQa485FfYNw4hso",
  authDomain: "icheck-assigments.firebaseapp.com",
  projectId: "icheck-assigments",
  storageBucket: "icheck-assigments.appspot.com",
  messagingSenderId: "212271854385",
  appId: "1:212271854385:web:720a36ecc8f596fde17610",
  measurementId: "G-QWM46HW3PY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const GoogleProvider = new GoogleAuthProvider();