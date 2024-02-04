//import { useState } from 'react'
import "./App.css";

//import firebase from 'firebase/app';
// import StudentDash from "./pages/StudentDash.jsx";
import Login from "./pages/Login.jsx";
import { Routes, Route } from "react-router-dom";
import StudentDashTest from "./pages/StudentDashTest.jsx";
import Signup from './pages/Signup.jsx'
import PrivateRoute from "./components/PrivateRoute.jsx";
// import Layout from "./components/Layout.jsx";

function App() {
  return (
    <div>
      <Routes>
          <Route index element={<Login/>} />
          <Route path='/signup' element = {<Signup></Signup> }/>
          <Route path="/StudentDashTest" element={<PrivateRoute><StudentDashTest /></PrivateRoute>}/>
      </Routes>
    </div>
  );
}

export default App;
