import { useState } from "react";
import {  collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../config/fire-base";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";


const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [notice, setNotice] = useState("");
    const [userType,setUserType] = useState("");

    const loginWithUsernameAndPassword = async (e) => {
        e.preventDefault();
    
        try {
            await signInWithEmailAndPassword(auth, email, password);
            try {
                const users_collection_Ref = collection(db, "users");
                const q = query(users_collection_Ref, where("id", "==", auth.currentUser.uid));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const userData = querySnapshot.docs[0].data();
                    setUserType(userData.type);
                    
                    switch (userData.type) {
                        case "student":
                            navigate("/StudentDashTest");
                            break;
                        case "lecturer":
                            navigate("/LecturerDash");
                            break;
                        case "checker":
                            navigate("/CheckerDash");
                            break;
                        default:
                            navigate("/");
                            break;
                    }
                } else {
                    console.log("No matching document found.");
                }
            } catch {
                setNotice("something went wrong in db");
            }
        } catch {
            setNotice("You entered a wrong username or password.");
        }
    }
    

    

    return(
       
        <div className = "container">
            <div className = "row justify-content-center">
                <form className = "col-md-4 mt-3 pt-3 pb-3">
                    { "" !== notice &&
                        <div className = "alert alert-warning" role = "alert">
                            { notice }    
                        </div>
                    }     

                    <div className = "form-floating mb-3">

                        <input type = "email" className = "form-control" id = "exampleInputEmail1" 
                            aria-describedby = "emailHelp" placeholder = "name@example.com" value = { email }
                            onChange = { (e) => setEmail(e.target.value) }>
                        </input>

                        <label htmlFor = "exampleInputEmail1" className = "form-label">Email address</label>
                    </div>

                    <div className = "form-floating mb-3">

                        <input type = "password" className = "form-control" id = "exampleInputPassword1"
                        placeholder = "Password" value = { password } 
                        onChange = { (e) => setPassword(e.target.value) }>
                        </input>

                        <label htmlFor = "exampleInputPassword1" className = "form-label">Password</label>
                    </div>

                    <div className = "d-grid">
                        <button type = "submit" className = "btn btn-primary pt-3 pb-3" 
                        onClick = {(e) => loginWithUsernameAndPassword(e)}>Submit
                        </button>
                    </div>

                    <div className = "mt-3 text-center">
                        <span>Need to sign up for an account? <Link to = "./signup">Click here.</Link></span>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Login
