import "./App.css";

import Login from "./pages/Login.jsx";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx"; // Modified to use Dashboard instead of individual dashboards
import Signup from './pages/Signup.jsx'
import PrivateRoute from "./components/PrivateRoute.jsx";

function App() {
  return (
    <div>
      <Routes>
          <Route index element={<Login/>} />
          <Route path='/signup' element={<Signup/>}/>
          <Route path="/dashboard" element={<PrivateRoute allowedTypes={['student', 'lecturer', 'checker']}><Dashboard/></PrivateRoute>}/>
      </Routes>
    </div>
  );
}

export default App;
