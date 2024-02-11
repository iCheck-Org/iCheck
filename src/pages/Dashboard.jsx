import ResponsiveDrawer from "../components/Drawer.jsx";
import TableTest from "../components/TableTest.jsx";
import TableChecker from "../components/TableChecker.jsx";
import TableLecturer from "../components/TableLecturer.jsx";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../config/fire-base.jsx";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

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
        console.log("unsubscibed User");
      }
      return () => unsubscribe();
    });
  }, []);

  return (
    <div>
      {firebaseUser && (
        <>
          <ResponsiveDrawer firebaseUser={firebaseUser} />
          {firebaseUser.type === "student" && <TableTest firebaseUser={firebaseUser} />}
          {firebaseUser.type === "checker" && <TableChecker firebaseUser={firebaseUser} />}
          {firebaseUser.type === "lecturer" && <TableLecturer firebaseUser={firebaseUser} />}
        </>
      )}
    </div>
  );
}