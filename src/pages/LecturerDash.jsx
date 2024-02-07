import ResponsiveDrawer from "../components/Drawer.jsx";
import TableLecturer from "../components/TableLecturer.jsx";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../config/fire-base.jsx";
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from "firebase/auth";


export default function LecturerDash() {
  const user = auth.currentUser;
  const [firebaseUser,setFirebaseUser] = useState(null);

  useEffect(() => {
    // Redirect to login page if user is not authenticated, stay in after refresh the page
    const unsubscribe = onAuthStateChanged(auth, (user)=>{
      if(user){
        const fetchData = async () => {
        try {
          const userRef = doc(db,"users",user.uid);
          const userSnap = await getDoc(userRef);
          const userRecord = userSnap.data();
  
          setFirebaseUser(userRecord);
        } catch (error) {
          console.error("Error fetching data from Firestore:", error);
        }
      };
      fetchData();
      }else{
        console.log("unsubscibed User");
      }
      return ()=> unsubscribe();
    })
  }, []);


  return (
    <div>
      {<ResponsiveDrawer firebaseUser={firebaseUser} />}
      {<TableLecturer firebaseUser={firebaseUser}/>}
    </div>
  );
}