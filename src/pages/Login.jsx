import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from "../config/fire-base";
import logo from '../logo/icheck_logo_1.png';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [notice, setNotice] = useState("");

    const loginWithUsernameAndPassword = async (e) => {
        e.preventDefault();
    
        try {
            await signInWithEmailAndPassword(auth, email, password);
            const userRef = doc(db,"users",auth.currentUser.uid);
            const userSnap = await getDoc(userRef);
            const userRecord = userSnap.data();
            
            if (!userRecord.empty) {
                navigate("/dashboard");
            } else {
                setNotice("No matching document found.");
            }
        } catch {
            setNotice("Invalid email or password.");
        }
    }

    return (
        <div className="container">
            <div className="row justify-content-center">
                <img src={logo} alt="Logo" className="logo" />
                <h2 className="text-3xl font-bold mb-2 signup-title text-center">iCheck</h2>
                {notice && <div className="text-red-500 mb-2">{notice}</div>}
                <div className="subtitle">
                    Start your journey with us today.
                </div>
                <br />

                <form className="col-md-4 mt-3 pt-3 pb-3">
                    <div className="inputContainer">
                        <input
                            type="email"
                            className="inputBox"
                            id="exampleInputEmail1"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <label htmlFor="exampleInputEmail1" className="form-label">
                            Email address
                        </label>
                    </div>

                    <div className="inputContainer">
                        <input
                            type="password"
                            className="inputBox"
                            id="exampleInputPassword1"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <label htmlFor="exampleInputPassword1" className="form-label">
                            Password
                        </label>
                    </div>

                    <div className="d-grid">
                        <button
                            type="submit"
                            className="inputButton"
                            onClick={(e) => loginWithUsernameAndPassword(e)}
                        >
                            Submit
                        </button>
                    </div>
                    <br />

                    {/* <div className="centered-text">
                        <span>
                            Need to sign up for an account? <Link to="./signup">Click here.</Link>
                        </span>
                    </div> */}
                </form>
            </div>
        </div>
    );
};

export default Login;
