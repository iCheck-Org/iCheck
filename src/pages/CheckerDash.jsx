import ResponsiveDrawer from "../components/Drawer.jsx";
import TableChecker from "../components/TableChecker.jsx";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../config/fire-base.jsx";
import { onAuthStateChanged } from "firebase/auth";


export default function ChckerDash() {
  const navigate = useNavigate();
  const user = auth.currentUser;


  useEffect(() => {
    // Redirect to login page if user is not authenticated, stay in after refresh the page
    const unsubscribe = onAuthStateChanged(auth, (user)=>{
      if(user){
        navigate("/CheckerDash");
      }else{
      }
      return ()=> unsubscribe();
    })
  }, []);


  return (
    <div>
      {<ResponsiveDrawer user={user} />}
      {<TableChecker user={user}/>}
    </div>
  );
}