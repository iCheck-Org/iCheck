
import "./App.css";
import Login from "./pages/Login.jsx";
import { Routes, Route, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import MessageBoard from "./pages/MessageBoard.jsx";
import Signup from "./pages/Signup.jsx";
import { RingLoader } from "react-spinners";
import { useState, useEffect } from "react";

function App() {
  // State to track the initial loading of the application
  const [isLoading, setIsLoading] = useState(true);

  // useEffect hook to simulate the initial loading and update the loading state
  useEffect(() => {
    // Simulate initial loading delay
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 700);

    // Clear the timeout on component unmount
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div>
      {/* Conditionally render the loading icon based on the loading state */}
      {isLoading && <RingLoader color="#36d7b7" />}
      {/* Render the routes only when not loading */}
      {!isLoading && (
        <Routes>
          <Route index element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/message-board"
            element={<MessageBoard isLoading={isLoading} />}
          />
        </Routes>
      )}
    </div>
  );
}

export default App;