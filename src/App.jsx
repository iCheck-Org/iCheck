//import { useState } from 'react'
import "./App.css";

//import firebase from 'firebase/app';
// import StudentDash from "./pages/StudentDash.jsx";
import Login from "./pages/Login.jsx";
import { Routes, Route } from "react-router-dom";
import StudentDashTest from "./pages/StudentDashTest.jsx";
import Signup from './pages/Signup.jsx'
// import Layout from "./components/Layout.jsx";

function App() {
  return (
    <div>
      <Routes>
        {/* <Route path="/" element={<Layout></Layout>}> */}
          <Route index element={<Login></Login>}></Route>
          <Route path='/signup' element = {<Signup></Signup>}></Route>
          {/* <Route path="/" element={<StudentDash />} /> */}
          <Route path="/StudentDashTest" element={<StudentDashTest />} />
        {/* </Route> */}
      </Routes>
    </div>
  );
}

export default App;
