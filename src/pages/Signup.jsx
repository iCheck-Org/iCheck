import React, { useState } from "react";
import { auth, db } from "../config/Fire-base";
import { collection, doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import './styles.css'

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        type: "",
        name: ""
    });
    const [notice, setNotice] = useState("");

    const signupWithUsernameAndPassword = async (e) => {
        e.preventDefault();

        const { email, password, confirmPassword, name, type } = formData;

        // Basic form validation
        if (!email || !password || !confirmPassword || !name || !type) {
            setNotice("Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            setNotice("Passwords don't match. Please try again.");
            return;
        }

        // Firebase password validation
        if (password.length < 6) {
            setNotice("Password must be at least 6 characters long.");
            return;
        }

        
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const usersCollectionRef = collection(db, "users");
            const userRef = doc(usersCollectionRef, user.uid);

            // Combine asynchronous operations into a single Promise.all call
            await Promise.all([
                setDoc(userRef, {
                    id: user.uid,
                    email: email,
                    name: name,
                    type: type
                }),
                updateProfile(auth.currentUser, {
                    displayName: name
                })
            ]);

            navigate("/"); // Navigate to login page after successful signup
        } catch (error) {
            console.error("Error creating user:", error.message);
            setNotice("Sorry, something went wrong. Please try again.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <div className="max-w-md w-full bg-white p-8 rounded shadow-lg">
                <h2 className="text-3xl font-bold mb-4 signup-title text-center">Sign up</h2>
                {notice && <div className="text-red-500 mb-4">{notice}</div>}
                <form onSubmit={signupWithUsernameAndPassword}>
                    <div className="inputContainer">
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="inputBox"
                            placeholder="Email address"
                            required
                        />
                    </div>
                    <div className="inputContainer">
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="inputBox"
                            placeholder="Your Name"
                            required
                        />
                    </div>
                    <div className="inputContainer">
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="inputBox"
                            placeholder="Password"
                            required
                        />
                    </div>
                    <div className="inputContainer">
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className="inputBox"
                            placeholder="Confirm Password"
                            required
                        />
                    </div>
                    <div className="inputContainer">
                        <select
                            name="type"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="inputBox"
                            required
                        >
                            <option value="">Select User Type</option>
                            <option value="student">Student</option>
                            <option value="lecturer">Lecturer</option>
                            <option value="checker">Checker</option>
                        </select>
                    </div>
                    <br />
                    <div className="d-grid">
                        <input
                            type="submit"
                            value="Sign up"
                            className="inputButton"
                        />
                    </div>
                    <br />

                </form>
                <div className="mt-18 text-center">
                    <span className="centered-text">Go back to login? <Link to="/">Click here.</Link></span>
                </div>
            </div>
        </div>
    );
};

export default Signup;
