import ResponsiveDrawer from "../components/NavigateBar/Drawer.jsx";
import TableStudent from "../components/TableStudent.jsx";
import TableChecker from "../components/TableChecker.jsx";
import TableLecturer from "../components/TableLecturer.jsx";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../config/fire-base.jsx";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import './styles.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [firebaseUser, setFirebaseUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const fetchData = async () => {
          try {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            const userRecord = userSnap.data();

            setFirebaseUser(userRecord);
          } catch (error) {
            console.error("Error fetching data from Firestore:", error);
          }
        };
        fetchData();
      } else {
        navigate("/");
      }
      return () => unsubscribe();
    });
  }, []);

  return (
    <div>
      {firebaseUser && (
        <>
          <ResponsiveDrawer firebaseUser={firebaseUser} />
          {firebaseUser.type === "student" && (
            <TableStudent firebaseUser={firebaseUser} />
          )}
          {firebaseUser.type === "checker" && (
            <TableChecker firebaseUser={firebaseUser} />
          )}
          {firebaseUser.type === "lecturer" && (
            <TableLecturer firebaseUser={firebaseUser} />
          )}
        </>
      )}
    </div>
  );
}
