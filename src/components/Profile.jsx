import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../config/fire-base.jsx";
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from "firebase/auth";

export default function Profile() {
    const navigate = useNavigate();
  const user = auth.currentUser;
  const [firebaseUser,setFirebaseUser] = useState(null);

  useEffect(() => {
    // Redirect to login page if user is not authenticated, stay in after refresh the page
    const unsubscribe = onAuthStateChanged(auth, (user)=>{
      if(user){

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

    return(
        <div>
        {firebaseUser && (<>
        <ResponsiveDrawer firebaseUser={firebaseUser} />
        <div>
          <h2>User Details:</h2>
          <p>Name: {firebaseUser.name}</p>
          <p>Email: {firebaseUser.email}</p>
          <p>Address: {firebaseUser.address}</p>
          <p>Phone: {firebaseUser.phone}</p>
        </div>
        {/* <TableTest firebaseUser={firebaseUser}/> */}
        </>)
        }
      </div>
    )
}