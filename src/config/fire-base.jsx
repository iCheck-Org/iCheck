// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCYcIfMNbgYNd5hXT0_D0_2SA9ud_nZSgA",
  authDomain: "icheck-01.firebaseapp.com",
  projectId: "icheck-01",
  storageBucket: "icheck-01.appspot.com",
  messagingSenderId: "978913635046",
  appId: "1:978913635046:web:4cd44c00da4a040fdd6927",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
