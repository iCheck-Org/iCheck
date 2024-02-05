import ResponsiveDrawer from "../components/Drawer.jsx";
import TableTest from "../components/TableTest";
// import BackDropSample from '../components/BackDropSample.jsx';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../config/fire-base.jsx";
// import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
// import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";


export default function StudentDashTest() {
  const navigate = useNavigate();
  const user = auth.currentUser;

  //     const [file, setFile] = useState(null);
  //     const [userPDFs, setUserPDFs] = useState([]);

  useEffect(() => {
    // Redirect to login page if user is not authenticated, stay in after refresh the page
    const unsubscribe = onAuthStateChanged(auth, (user)=>{
      if(user){
        console.log("User is signed in 1");
        navigate("/StudentDashTest");
      }else{
      }
      return ()=> unsubscribe();
    })
  }, []);


  return (
    <div>
      <ResponsiveDrawer user={user} />
      <TableTest user={user}/>
    </div>
  );
}