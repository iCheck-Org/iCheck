import ResponsiveDrawer from "../components/Drawer.jsx";
import TableTest from "../components/TableTest";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../config/fire-base.jsx";
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from "firebase/auth";


export default function StudentDashTest() {
  const navigate = useNavigate();
  const userAuth = auth.currentUser;
  const [firebaseUser,setFirebaseUser] = useState(null);

  useEffect(() => {
    // Redirect to login page if user is not authenticated, stay in after refresh the page
    const unsubscribe = onAuthStateChanged(auth, (user)=>{
      if(user){
        console.log("User is signed in 1");
        // navigate("/StudentDashTest");

        //get user doc
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
      {firebaseUser && (<>
      <ResponsiveDrawer firebaseUser={firebaseUser} />
      <TableTest firebaseUser={firebaseUser}/>
      </>)
      }
    </div>
  );
}