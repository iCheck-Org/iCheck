import * as React from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/fire-base";
import logo from "../logo/icheck_logo_1.png";
import { Box } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { green, red } from "@mui/material/colors";
import Button from "@mui/material/Button";
import CheckIcon from "@mui/icons-material/Check"; // success icon
import ClearIcon from "@mui/icons-material/Clear"; // fail icon
import AwesomeButton from "react-awesome-button/src/components/AwesomeButton";
import styles from "react-awesome-button/src/styles/themes/theme-blue";
import { setCssEndEvent } from "@rcaferati/wac";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [notice, setNotice] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [showFailIcon, setShowFailIcon] = React.useState(false);
  const [backgroundColor, setBackgroundColor] = React.useState(null);

  const buttonSx = {
    ...(success && {
      bgcolor: green[500],
      "&:hover": {
        bgcolor: green[700],
      },
    }),
  };

  const handleLogin = async () => {
    setLoading(true);
    setSuccess(false);
    setShowFailIcon(false);
  
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      const userRecord = userSnap.data();
  
      if (!userRecord.empty) {
        setSuccess(true);
        navigate("/dashboard");
      }
    } catch (error) {
      setNotice("Invalid email or password.");
      setShowFailIcon(true);
      setBackgroundColor(red[400]);
      setTimeout(() => {
        setShowFailIcon(false);
        setBackgroundColor(null);
      }, 2000);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };
  

  const isFormValid = email.trim() !== "" && password.trim() !== "";

  return (
    <div className="container">
      <div className="row justify-content-center">
        <h2 className="text-3xl font-bold mb-2 signup-title text-center">
          iCheck.
        </h2>

        <div className="subtitle">Start your journey with us today.</div>

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
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <Box sx={{ m: 1, position: "relative" }}>
              <button
                type="button"
                className="inputButton"
                variant="contained"
                style={{ ...buttonSx, backgroundColor: backgroundColor }} // Change sx to style
                disabled={!isFormValid || loading}
                onClick={handleLogin}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: green[500] }} />
                ) : success ? (
                  <CheckIcon />
                ) : showFailIcon ? (
                  <ClearIcon />
                ) : (
                  "Login"
                )}
              </button>

                {notice && <div className="text-red-500 mb-2">{notice}</div>}
              </Box>
            </Box>
          </div>
          <br />
        </form>
      </div>
    </div>
  );
};

export default Login;
