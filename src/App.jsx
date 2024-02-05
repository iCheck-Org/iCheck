import "./App.css";

import Login from "./pages/Login.jsx";
import { Routes, Route } from "react-router-dom";
import StudentDashTest from "./pages/StudentDashTest.jsx";
import LecturerDash from "./pages/LecturerDash.jsx";
import Signup from './pages/Signup.jsx'
import PrivateRoute from "./components/PrivateRoute.jsx";

function App() {
  return (
    <div>
      <Routes>
          <Route index element={<Login/>} />
          <Route path='/signup' element={<Signup/>}/>
          <Route path="/StudentDashTest" element={<PrivateRoute allowedTypes={['student']}><StudentDashTest /></PrivateRoute>}/>
          <Route path="/LecturerDash" element={<PrivateRoute allowedTypes={['lecturer']}><LecturerDash /></PrivateRoute>}/>

      </Routes>
    </div>
  );
}

export default App;
