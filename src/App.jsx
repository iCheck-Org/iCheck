//import { useState } from 'react'
import './App.css'

//import firebase from 'firebase/app';
import StudentDash from './pages/StudentDash.jsx';
import Login from './pages/Login.jsx';
import {Routes , Route} from 'react-router-dom';

function App() {
  return (
      <div>
        <Routes>
          <Route path="/" element={<StudentDash />} />
          <Route path="/Login" element={<Login />} />
        </Routes>
      </div>
  )
}

export default App
