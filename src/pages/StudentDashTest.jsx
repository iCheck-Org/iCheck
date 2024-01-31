import ResponsiveDrawer from "../components/Drawer.jsx";
import TableTest from "../components/TableTest";
// import BackDropSample from '../components/BackDropSample.jsx';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../config/fire-base.jsx";
// import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
// import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
// import { signOut } from "firebase/auth";

export default function StudentDashTest() {
  const navigate = useNavigate();
  const user = auth.currentUser;

  //     const [file, setFile] = useState(null);
  //     const [userPDFs, setUserPDFs] = useState([]);

  useEffect(() => {
    // Redirect to login page if user is not authenticated
    if (!user) {
      navigate("/");
    } else {
      
    }
  }, [user, navigate]);

  //   const logoutUser = async (e) => {
  //     e.preventDefault();
  //     await signOut(auth);
  //     navigate("/");
  // }

  return (
    <div>
      <ResponsiveDrawer user={user} />
      {/* <BackDropSample/> */}
      <TableTest user={user}/>
    </div>
  );
}